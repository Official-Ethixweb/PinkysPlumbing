import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { services, type Service } from '../../data/services';
import { cityPages, type CityPage } from '../../data/cityPages';
import { coupons } from '../../data/coupons';
import { generalFaq } from '../../data/faq';
import { business, promise, serviceAreas, testimonials } from '../../data/business';

// Keyword-scored knowledge base built directly from the same content that
// drives the services/, service-area/, and FAQ sections, so chatbot answers
// can never drift out of sync with what the site actually says. No LLM: a
// small rule engine matches on weighted keyword overlap, see
// findBestMatch() below and getSmartReply() in engine.tsx.

export type ReplyContext = {
  /** True the first time this session a visitor lands on this entry's topic.
   * Used to show a smart follow-up question once instead of on every re-ask. */
  isFirstMention: boolean;
};

export type KnowledgeEntry = {
  id: string;
  /** Used for conversation-context tracking, e.g. "service:drain-cleaning" */
  topic: string;
  keywords: string[];
  weight?: number;
  /** Marks a broad catchall entry (services-overview, areas-overview) whose
   * keywords are common single words ("service", "area") likely to also
   * appear in a more specific entry's match. On a tied score, a catchall
   * entry loses to a non-catchall one instead of winning by array order, see
   * findBestMatch(). Doesn't affect the entry's own raw score/threshold. */
  isCatchall?: boolean;
  reply: (ctx: ReplyContext) => ReactNode;
  /** Short plain-text summary of this answer, used in the lead email transcript (bot replies are rich JSX, not plain strings). */
  logLabel: string;
};

const STOPWORDS = new Set([
  'the',
  'a',
  'an',
  'is',
  'are',
  'do',
  'does',
  'did',
  'you',
  'your',
  'yours',
  'i',
  'im',
  'my',
  'me',
  'to',
  'for',
  'of',
  'in',
  'on',
  'at',
  'and',
  'or',
  'what',
  'whats',
  'how',
  'can',
  'could',
  'will',
  'would',
  'it',
  'its',
  'that',
  'this',
  'with',
  'about',
  'if',
  'have',
  'has',
  'had',
  'be',
  'been',
  'was',
  'were',
  'there',
  'here',
  'please'
]);

export function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s'-]/g, ' ');
}

export function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

// Levenshtein edit distance, used only for short single-word typo tolerance
// ("watre" -> "water", "drin" -> "drain"). Deliberately not used for phrase
// matching or long words, both accuracy risks and unnecessary cost, see
// fuzzyKeywordHit() below for where the length/distance caps are enforced.
function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = new Array(n + 1);
  let curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/** How many typo'd characters we'll forgive for a single-word keyword, scaled
 * to word length so short words ("gas", "hot") aren't fuzzy-matched into
 * false positives while longer ones ("plumbing", "installation") tolerate a
 * couple of slipped keys. */
function maxEditDistanceFor(wordLength: number): number {
  if (wordLength <= 4) return 0;
  if (wordLength <= 7) return 1;
  return 2;
}

/** True if any token in the visitor's message is a near-miss (typo) of the
 * given single-word keyword. Only called after an exact-match pass finds
 * nothing for that keyword, see findBestMatch(). */
function fuzzyKeywordHit(keyword: string, tokens: string[]): boolean {
  const maxDist = maxEditDistanceFor(keyword.length);
  if (maxDist === 0) return false;
  for (const token of tokens) {
    if (Math.abs(token.length - keyword.length) > maxDist) continue;
    if (editDistance(token, keyword) <= maxDist) return true;
  }
  return false;
}

// Handles cases where the site copy uses a different word than a visitor
// would ("hydro jetting" vs. "jet", "no hot water" vs. "water heater"). Keyed
// by service slug so it stays attached to the right entry as content changes.
const SERVICE_SYNONYMS: Record<string, string[]> = {
  'emergency-plumbing': [
    'emergency',
    'emergancy',
    'emergancy plumber',
    'urgent',
    'urgant',
    'burst pipe',
    'burst pipes',
    'busted pipe',
    'broken pipe',
    'pipe burst',
    'pipe broke',
    'burst',
    'bursted',
    'flood',
    'flooding',
    'flooded',
    'water everywhere',
    'water all over',
    'overflowing',
    'overflow',
    'right now',
    'right away',
    'asap',
    'no water',
    'water is gushing',
    'gushing',
    'spraying water',
    'basement flooding',
    'ceiling leak',
    'ceiling is leaking',
    'sos',
    'help fast',
    'need someone now',
    '911'
  ],
  'water-heaters': [
    'water heater',
    'water heaters',
    'water heather',
    'waterheater',
    'hot water heater',
    'hot water tank',
    'hot water',
    'no hot water',
    'cold water only',
    'tankless',
    'tankless heater',
    'tank water heater',
    'pilot light',
    'pilot light out',
    'water not heating',
    'lukewarm water',
    'rusty water',
    'water heater leaking',
    'water heater making noise',
    'water heater tripping',
    'reset button water heater',
    'gas water heater',
    'electric water heater',
    'heater install',
    'new water heater',
    'replace water heater',
    'watre heater',
    'wter heater'
  ],
  'drain-cleaning': [
    'drain',
    'drains',
    'draine',
    'clog',
    'clogg',
    'clogged',
    'cloged',
    'clogged drain',
    'clogged sink',
    'kitchen sink clogged',
    'bathroom sink clogged',
    'shower drain clogged',
    'tub not draining',
    'sink not draining',
    'wont drain',
    "won't drain",
    'not draining',
    'draining slow',
    'slow drain',
    'slow to drain',
    'backup',
    'backed up',
    'sink backed up',
    'gurgling drain',
    'gurgling',
    'bad smell from drain',
    'smelly drain',
    'standing water',
    'water pooling',
    'rooter',
    'rooter service',
    'hydro jet',
    'hydro-jetting',
    'hydrojetting',
    'jetting',
    'snake',
    'snake the drain',
    'auger',
    'roots',
    'root intrusion',
    'tree roots in pipe',
    'main line clog',
    'drain clog',
    'drin clog'
  ],
  'faucet-fixture': [
    'faucet',
    'facet',
    'facuet',
    'faucett',
    'fixture',
    'fixtures',
    'valve',
    'shutoff valve',
    'shut off valve',
    'leaky faucet',
    'faucet leaking',
    'faucet is leaking',
    'faucet dripping',
    'drip',
    'dripping',
    'drippy faucet',
    'shower valve',
    'shower handle',
    'low water pressure',
    'water pressure low',
    'no pressure',
    'sink handle broken',
    'sink handle loose',
    'new faucet',
    'install a faucet',
    'kitchen faucet',
    'bathroom faucet',
    'outdoor spigot',
    'hose bib'
  ],
  'toilet-repair': [
    'toilet',
    'toilett',
    'toliet',
    'running toilet',
    'toilet running',
    'toilet keeps running',
    'toilet wont stop running',
    'flush',
    'flushing',
    "won't flush",
    'wont flush',
    'weak flush',
    'clogged toilet',
    'toilet clogged',
    'toilet overflowing',
    'toilet is overflowing',
    'toilet backed up',
    'toilet leaking at base',
    'wax ring',
    'toilet rocking',
    'toilet wobbles',
    'toilet handle broken',
    'toilet tank',
    'new toilet',
    'install a toilet',
    'replace toilet',
    'low flow toilet'
  ],
  'sewer-service': [
    'sewer',
    'sewer line',
    'sewer lines',
    'sewer backup',
    'sewer backed up',
    'sewage backup',
    'sewage smell',
    'raw sewage',
    'main line',
    'main sewer line',
    'trenchless',
    'trenchless repair',
    'camera inspection',
    'video inspection',
    'sewer camera',
    'septic',
    'septic tank',
    'septic system',
    'septic pump',
    'septic backup',
    'yard flooding',
    'sewage in yard',
    'multiple drains backed up',
    'whole house backup'
  ],
  'gas-line-install': [
    'gas line',
    'gas lines',
    'gas pipe',
    'gas',
    'propane',
    'natural gas',
    'gas smell',
    'smell gas',
    'i smell gas',
    'gas leak',
    'range hookup',
    'stove hookup',
    'dryer hookup',
    'fireplace hookup',
    'gas conversion',
    'convert to gas',
    'gas line for grill',
    'bbq gas line',
    'install gas line'
  ],
  'heating-systems': [
    'furnace',
    'furnice',
    'furnace not working',
    'furnace wont turn on',
    'no heat',
    'heat not working',
    'heater not working',
    'heating',
    'heat pump',
    'boiler',
    'thermostat',
    'thermostat not working',
    'cold house',
    'house is cold',
    'winter',
    'furnace tune up',
    'furnace maintenance',
    'furnace making noise',
    'heat pump not working'
  ]
};

// Words that recur across several service slugs are too generic to act as a
// real single-token signal on their own ("service" alone shouldn't out-vote
// a specific synonym like "roots" on a tied score). Full multi-word matches
// (the service title, phrase synonyms) are unaffected.
const GENERIC_DOMAIN_WORDS = new Set([
  'plumbing',
  'plumber',
  'repair',
  'install',
  'installation',
  'service',
  'services',
  'system',
  'systems',
  'line',
  'lines'
]);

function serviceKeywords(service: Service): string[] {
  return [
    service.title.toLowerCase(),
    ...service.slug.split('-').filter((w) => !GENERIC_DOMAIN_WORDS.has(w)),
    ...(SERVICE_SYNONYMS[service.slug] ?? [])
  ];
}

// Shown once per session, the first time a visitor asks about that service,
// so the bot feels like it's actually listening instead of reciting the same
// blurb ("Instead of ending conversations, ask intelligent follow-up
// questions" from the spec). Kept short and answerable in a couple words.
const SERVICE_FOLLOWUPS: Record<string, string> = {
  'emergency-plumbing': 'Is water actively leaking or flooding right now?',
  'water-heaters': 'Is it a total loss of hot water, or just not as hot as it should be?',
  'drain-cleaning': 'Is this in the kitchen, a bathroom, or the main line outside?',
  'faucet-fixture': 'Is it a steady drip, or is water actually spraying/running?',
  'toilet-repair': 'Is it running constantly, clogged, or leaking at the base?',
  'sewer-service': 'Is it a single drain backing up, or the whole house?',
  'gas-line-install': 'Is this a new installation, or a repair on an existing line?',
  'heating-systems': 'Is the system not turning on at all, or running but not heating?'
};

function buildServiceEntries(): KnowledgeEntry[] {
  return services.map((service) => ({
    id: `service:${service.slug}`,
    topic: `service:${service.slug}`,
    keywords: serviceKeywords(service),
    weight: 2,
    logLabel: `Explained ${service.title}`,
    reply: ({ isFirstMention }) => (
      <>
        <p>{service.short}</p>
        {service.bullets[0] && (
          <p className="mt-2">
            <strong>{service.bullets[0]}</strong>
          </p>
        )}
        <a
          href={`/services/${service.slug}/`}
          className="mt-2 inline-flex items-center gap-1 font-semibold text-pink-600 hover:text-pink-700"
        >
          More on {service.title} <ArrowUpRight className="h-3 w-3" />
        </a>
        {isFirstMention && SERVICE_FOLLOWUPS[service.slug] && <p className="mt-2">{SERVICE_FOLLOWUPS[service.slug]}</p>}
      </>
    )
  }));
}

function buildFaqEntries(): KnowledgeEntry[] {
  return generalFaq.map((faq, index) => ({
    id: `faq:${index}`,
    topic: 'general-faq',
    keywords: tokenize(faq.question),
    weight: 1,
    logLabel: `Answered: "${faq.question}"`,
    reply: () => <p>{faq.answer}</p>
  }));
}

function buildCouponEntries(): KnowledgeEntry[] {
  return coupons.map((coupon) => ({
    id: `coupon:${coupon.code}`,
    topic: 'coupons',
    keywords: [...tokenize(coupon.title), ...tokenize(coupon.offer), coupon.relatedService ?? ''].filter(Boolean),
    weight: 1,
    logLabel: `Mentioned coupon ${coupon.code}`,
    reply: () => (
      <>
        <p>{coupon.offer}</p>
        <p className="mt-1.5 text-xs">
          Mention code <strong>{coupon.code}</strong> when you schedule.
        </p>
      </>
    )
  }));
}

function buildLocationEntries(): KnowledgeEntry[] {
  return cityPages.map((city: CityPage) => ({
    id: `location:${city.slug}`,
    topic: `location:${city.slug}`,
    keywords: [city.name.toLowerCase()],
    weight: 3,
    logLabel: `Confirmed service area: ${city.name}`,
    reply: () => (
      <>
        <p>
          Yes, we serve {city.name}. {city.blurb}
        </p>
        <a
          href={`/service-area/${city.slug}/`}
          className="mt-2 inline-flex items-center gap-1 font-semibold text-pink-600 hover:text-pink-700"
        >
          {city.name} service details <ArrowUpRight className="h-3 w-3" />
        </a>
      </>
    )
  }));
}

// Cities in the broader 48-city coverage list that don't have their own
// landing page yet, matched loosely so "do you serve Burien" still gets a
// confident yes even without a dedicated page/link to send them to.
function buildBroadServiceAreaEntries(): KnowledgeEntry[] {
  const pagedNames = new Set(cityPages.map((c) => c.name.toLowerCase()));
  return serviceAreas
    .filter((city) => !pagedNames.has(city.toLowerCase()))
    .map((city) => ({
      id: `area:${city.toLowerCase().replace(/\s+/g, '-')}`,
      topic: 'areas-overview',
      keywords: [city.toLowerCase()],
      weight: 3,
      logLabel: `Confirmed service area: ${city}`,
      reply: () => (
        <>
          Yes, {city} is inside our service area.{' '}
          <a href="/service-area/" className="font-semibold text-pink-600 hover:text-pink-700">
            See full coverage
          </a>
        </>
      )
    }));
}

function joinWithAnd(items: string[]): string {
  if (items.length <= 1) return items.join('');
  if (items.length === 2) return items.join(' and ');
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

const STATIC_ENTRIES: KnowledgeEntry[] = [
  {
    id: 'services-overview',
    topic: 'services-overview',
    keywords: [
      'service',
      'services',
      'offer',
      'offerings',
      'provide',
      'help with',
      'do you do',
      'what do you do',
      'what do you fix',
      'what can you fix',
      'types of plumbing',
      'kinds of service',
      'list of services',
      'everything you do',
      'full list'
    ],
    weight: 2,
    isCatchall: true,
    logLabel: 'Listed all services',
    reply: () => (
      <>
        We handle {joinWithAnd(services.map((s) => s.title))}.{' '}
        <a href="/services/" className="font-semibold text-pink-600 hover:text-pink-700">
          See all services
        </a>
      </>
    )
  },
  {
    id: 'areas-overview',
    topic: 'areas-overview',
    keywords: [
      'area',
      'areas',
      'location',
      'locations',
      'city',
      'cities',
      'region',
      'where',
      'serve',
      'coverage',
      'service area',
      'do you come to',
      'do you come out',
      'do you travel',
      'travel to',
      'zip code',
      'county',
      'counties',
      'where are you located',
      'where are you based',
      'what cities',
      'near me'
    ],
    weight: 2,
    isCatchall: true,
    logLabel: 'Listed service area coverage',
    reply: () => (
      <>
        We&rsquo;re based in Seattle and serve {business.counties.length} counties:{' '}
        {joinWithAnd(business.counties.map((c) => c.name))}, covering {serviceAreas.length}+ cities across the greater
        Puget Sound region.{' '}
        <a href="/service-area/" className="font-semibold text-pink-600 hover:text-pink-700">
          Check your city
        </a>
      </>
    )
  },
  {
    id: 'hours',
    topic: 'hours',
    keywords: [
      'hour',
      'hours',
      'open',
      'open now',
      'are you open',
      '24',
      '247',
      '24 7',
      '24/7',
      'time',
      'what time',
      'weekend',
      'weekends',
      'saturday',
      'sunday',
      'holiday',
      'holidays',
      'christmas',
      'thanksgiving',
      'closed',
      'late night',
      'middle of the night',
      'early morning',
      'overnight'
    ],
    weight: 2,
    logLabel: 'Answered a question about hours',
    reply: () => <>{business.hours}, including nights, weekends, and holidays, with no overtime upcharge.</>
  },
  {
    id: 'promise',
    topic: 'promise',
    keywords: [
      'warrant',
      'warranty',
      'warrenty',
      'guarantee',
      'guaranteed',
      'promise',
      'trust',
      'reliable',
      'stand behind your work',
      'what if it breaks again',
      'redo the job',
      'satisfaction guarantee',
      'happy with the work'
    ],
    weight: 2,
    logLabel: 'Shared our promise to customers',
    reply: () => (
      <>
        <p>Here&rsquo;s what we promise every customer:</p>
        <ul className="mt-1.5 list-disc space-y-0.5 pl-4">
          {promise.slice(0, 3).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </>
    )
  },
  {
    id: 'pricing-philosophy',
    topic: 'pricing',
    keywords: [
      'price',
      'prices',
      'pricing',
      'pricing info',
      'cost',
      'costs',
      'costly',
      'expensive',
      'cheap',
      'cheapest',
      'affordable',
      'afford',
      'budget',
      'estimate',
      'estamate',
      'quote',
      'ballpark',
      'how much is it',
      'how much would it be',
      'what will it cost',
      'flat rate',
      'hourly rate',
      'upfront pricing',
      'hidden fees',
      'trip fee',
      'service call fee',
      'diagnostic fee'
    ],
    weight: 2,
    logLabel: 'Explained pricing philosophy',
    reply: () => (
      <>
        Every job gets an upfront, honest quote before any work begins, no overtime charges for nights, weekends, or
        emergencies. The number we quote is the number you pay.{' '}
        <a href="/contact-us/" className="font-semibold text-pink-600 hover:text-pink-700">
          Get a free estimate
        </a>
      </>
    )
  },
  {
    id: 'insurance-licensing',
    topic: 'permits',
    keywords: [
      'permit',
      'permits',
      'licensed',
      'licence',
      'license',
      'licensing',
      'insured',
      'insurance',
      'bonded',
      'bonded and insured',
      'background',
      'background check',
      'certified',
      'accredited',
      'qualifications',
      'credentials',
      'drug tested',
      'drug test',
      'are your plumbers licensed',
      'license number'
    ],
    weight: 2,
    logLabel: 'Answered a question about licensing/insurance',
    reply: () => (
      <>
        We&rsquo;re fully licensed and insured (WA license {business.license.wa}, TX {business.license.tx}). Every
        technician is background-checked and drug-tested before they&rsquo;re ever sent to a job site.
      </>
    )
  },
  {
    id: 'reviews-testimonials',
    topic: 'reviews',
    keywords: [
      'review',
      'reviews',
      'testimonial',
      'testimonials',
      'rating',
      'ratings',
      'rated',
      'star',
      'stars',
      '5 star',
      'five star',
      'feedback',
      'reputation',
      'good company',
      'trustworthy',
      'google reviews',
      'yelp',
      'what do people say',
      'happy customers',
      'customer satisfaction',
      'social proof'
    ],
    weight: 2,
    logLabel: 'Shared customer reviews',
    reply: () => {
      const t = testimonials[0];
      return (
        <>
          <p>We&rsquo;re proud of our 5-star reputation. Here&rsquo;s one from {t.name}:</p>
          <p className="mt-2 italic">&ldquo;{t.quote}&rdquo;</p>
          <a
            href="/contact-us/#reviews"
            className="mt-2 inline-flex items-center gap-1 font-semibold text-pink-600 hover:text-pink-700"
          >
            Read more reviews <ArrowUpRight className="h-3 w-3" />
          </a>
        </>
      );
    }
  },
  {
    id: 'why-choose-us',
    topic: 'why-choose-us',
    keywords: [
      'why choose',
      'why pinky',
      'why should i',
      'why you',
      'different',
      'stand out',
      'better than',
      'best plumber',
      'best plumbing company',
      'top rated',
      'trust you',
      'experience',
      'experienced',
      'how long have you',
      'how long in business',
      'years in business',
      'established',
      'family owned',
      'locally owned',
      'reputable'
    ],
    weight: 2,
    logLabel: 'Explained why customers choose Pinky’s',
    reply: () => (
      <>
        Families and business owners across the Seattle area choose us because we&rsquo;re licensed, background-checked,
        and available 24/7 with no overtime upcharge, every job gets an honest, upfront quote first.{' '}
        <a href="/about-us/" className="font-semibold text-pink-600 hover:text-pink-700">
          More about us
        </a>
      </>
    )
  },
  {
    id: 'commercial-residential',
    topic: 'commercial-residential',
    keywords: [
      'commercial',
      'residential',
      'business plumbing',
      'office building',
      'office',
      'restaurant plumbing',
      'restaurant',
      'apartment',
      'property manager',
      'landlord',
      'tenant',
      'home or business',
      'my house',
      'my home'
    ],
    weight: 3,
    logLabel: 'Confirmed residential and commercial service',
    reply: () => (
      <>
        We handle both. Whether it&rsquo;s a home repair or a commercial property, restaurant, office, or rental, our
        licensed technicians are equipped for it.{' '}
        <a href="/contact-us/" className="font-semibold text-pink-600 hover:text-pink-700">
          Get a free estimate
        </a>
      </>
    )
  },
  {
    id: 'financing',
    topic: 'financing',
    keywords: [
      'financing',
      'finance',
      'finanacing',
      'payment plan',
      'payment plans',
      'payment',
      'payments',
      'loan',
      'loans',
      'pay over time',
      'pay monthly',
      'monthly payments',
      'credit',
      'zero interest',
      'no interest',
      "can't afford it all at once",
      'installments'
    ],
    weight: 3,
    logLabel: 'Answered a question about financing',
    reply: () => (
      <>
        Yes, financing is available for larger repairs and installations. Ask your technician or a dispatcher to walk
        you through options.
      </>
    )
  },
  {
    id: 'coupons-overview',
    topic: 'coupons',
    keywords: [
      'coupon',
      'coupons',
      'coopon',
      'discount',
      'discounts',
      'deal',
      'deals',
      'offer',
      'offers',
      'savings',
      'save money',
      'promo',
      'promo code',
      'promotion',
      'promotions',
      'special',
      'specials',
      'sale',
      'any deals',
      'money off'
    ],
    weight: 2,
    logLabel: 'Pointed to current coupons',
    reply: () => (
      <>
        We&rsquo;ve got {coupons.length} current offers, from furnace tune-ups to sewer cleaning discounts. Open the
        coupons tab on the left edge of the screen, or mention a code when you call to schedule.
      </>
    )
  }
];

let cachedKnowledgeBase: KnowledgeEntry[] | null = null;

export function getKnowledgeBase(): KnowledgeEntry[] {
  if (!cachedKnowledgeBase) {
    cachedKnowledgeBase = [
      ...STATIC_ENTRIES,
      ...buildServiceEntries(),
      ...buildFaqEntries(),
      ...buildCouponEntries(),
      ...buildLocationEntries(),
      ...buildBroadServiceAreaEntries()
    ];
  }
  return cachedKnowledgeBase;
}

/** Turns a "service:drain-cleaning" / "location:seattle" topic id back into a human label for the lead email transcript. */
export function topicLabel(topic: string): string {
  if (topic.startsWith('service:')) {
    const slug = topic.slice('service:'.length);
    return services.find((s) => s.slug === slug)?.title ?? slug;
  }
  if (topic.startsWith('location:')) {
    const slug = topic.slice('location:'.length);
    return cityPages.find((c) => c.slug === slug)?.name ?? slug;
  }
  return topic.replace(/-/g, ' ');
}

/** Maps the current page path (e.g. "/services/water-heaters/") to a
 * knowledge-base topic id, so a visitor chatting from that page gets a small
 * relevance boost toward what they're already looking at ("context-aware
 * responses" from the spec's bonus features). Returns null on pages with no
 * obvious single topic (home, contact, etc). */
export function getPageContextTopic(pathname: string): string | null {
  const serviceMatch = pathname.match(/^\/services\/([^/]+)\/?$/);
  if (serviceMatch && services.some((s) => s.slug === serviceMatch[1])) {
    return `service:${serviceMatch[1]}`;
  }
  const cityMatch = pathname.match(/^\/service-area\/([^/]+)\/?$/);
  if (cityMatch && cityPages.some((c) => c.slug === cityMatch[1])) {
    return `location:${cityMatch[1]}`;
  }
  return null;
}

export function findBestMatch(
  input: string,
  entries: KnowledgeEntry[] = getKnowledgeBase(),
  contextTopic: string | null = null
): KnowledgeEntry | null {
  const normalizedInput = normalizeText(input);
  const tokens = new Set(tokenize(input));
  if (tokens.size === 0) return null;

  let best: { entry: KnowledgeEntry; score: number } | null = null;
  for (const entry of entries) {
    let score = 0;
    // Tokens that already scored an exact hit on *some* keyword in this
    // entry are excluded from that same entry's fuzzy pass, so e.g. the
    // token "service" can't score both an exact hit on keyword "service"
    // and a second, fuzzy hit on the near-duplicate keyword "services" in
    // the same entry, inflating one entry's total past a genuinely
    // different topic that matched a single, real keyword.
    const exactlyMatchedTokens = new Set(entry.keywords.filter((k) => !k.includes(' ') && tokens.has(k)));
    const fuzzyCandidateTokens = Array.from(tokens).filter((t) => !exactlyMatchedTokens.has(t));
    for (const keyword of entry.keywords) {
      if (keyword.includes(' ')) {
        if (normalizedInput.includes(keyword)) score += 3 * (entry.weight ?? 1);
      } else if (tokens.has(keyword)) {
        score += entry.weight ?? 1;
      } else if (fuzzyKeywordHit(keyword, fuzzyCandidateTokens)) {
        // Typo tolerance ("watre heater", "drin clog"): counts for less than
        // an exact hit so a real match elsewhere always outranks a guess.
        score += Math.max(1, (entry.weight ?? 1) - 1);
      }
    }
    // Small nudge (not a hard override) so a genuinely ambiguous question
    // ("how much does it cost") leans toward the service/city the visitor
    // is already reading about, without letting page context beat a clear,
    // differently-scored match.
    if (score > 0 && contextTopic && entry.topic === contextTopic) {
      score += 1;
    }
    if (score > 0 && best) {
      // On a tied score, a broad catchall entry loses to a specific one
      // (see isCatchall doc comment) instead of silently winning just for
      // appearing earlier in the array.
      const winsOnTie = score === best.score && best.entry.isCatchall && !entry.isCatchall;
      if (score > best.score || winsOnTie) best = { entry, score };
    } else if (score > 0) {
      best = { entry, score };
    }
  }

  return best && best.score >= 2 ? best.entry : null;
}
