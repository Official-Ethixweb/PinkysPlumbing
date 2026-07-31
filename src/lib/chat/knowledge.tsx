import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { services, type Service } from '../../data/services';
import { cityPages, type CityPage } from '../../data/cityPages';
import { coupons } from '../../data/coupons';
import { generalFaq } from '../../data/faq';
import { business, promise, serviceAreas } from '../../data/business';

// Keyword-scored knowledge base built directly from the same content that
// drives the services/, service-area/, and FAQ sections, so chatbot answers
// can never drift out of sync with what the site actually says. No LLM: a
// small rule engine matches on weighted keyword overlap, see
// findBestMatch() below and getSmartReply() in engine.tsx.

export type KnowledgeEntry = {
  id: string;
  /** Used for conversation-context tracking, e.g. "service:drain-cleaning" */
  topic: string;
  keywords: string[];
  weight?: number;
  reply: () => ReactNode;
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

// Handles cases where the site copy uses a different word than a visitor
// would ("hydro jetting" vs. "jet", "no hot water" vs. "water heater"). Keyed
// by service slug so it stays attached to the right entry as content changes.
const SERVICE_SYNONYMS: Record<string, string[]> = {
  'emergency-plumbing': [
    'emergency',
    'urgent',
    'burst pipe',
    'burst',
    'flood',
    'flooding',
    'flooded',
    'overflowing',
    'right now',
    'asap'
  ],
  'water-heaters': ['water heater', 'hot water', 'tankless', 'no hot water', 'pilot light'],
  'drain-cleaning': [
    'clog',
    'clogged',
    'backup',
    'backed up',
    'slow drain',
    'rooter',
    'hydro jet',
    'hydro-jetting',
    'jetting',
    'snake',
    'roots',
    'root intrusion'
  ],
  'faucet-fixture': ['faucet', 'fixture', 'valve', 'leaky faucet', 'drip', 'dripping', 'shower valve'],
  'toilet-repair': ['toilet', 'running toilet', 'flush', 'flushing', 'clogged toilet', 'wax ring'],
  'sewer-service': ['sewer', 'sewer line', 'sewer backup', 'trenchless', 'camera inspection', 'video inspection'],
  'gas-line-install': ['gas line', 'gas', 'propane', 'range hookup', 'dryer hookup', 'gas conversion'],
  'heating-systems': ['furnace', 'heating', 'heat pump', 'boiler', 'no heat', 'thermostat', 'winter']
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

function buildServiceEntries(): KnowledgeEntry[] {
  return services.map((service) => ({
    id: `service:${service.slug}`,
    topic: `service:${service.slug}`,
    keywords: serviceKeywords(service),
    weight: 2,
    logLabel: `Explained ${service.title}`,
    reply: () => (
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
    keywords: ['service', 'services', 'offer', 'offerings', 'provide', 'help with', 'do you do'],
    weight: 2,
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
    keywords: ['area', 'areas', 'location', 'locations', 'city', 'cities', 'region', 'where', 'serve', 'coverage'],
    weight: 2,
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
    keywords: ['hour', 'hours', 'open', '24', '247', 'time', 'weekend', 'sunday', 'holiday', 'closed'],
    weight: 2,
    logLabel: 'Answered a question about hours',
    reply: () => <>{business.hours}, including nights, weekends, and holidays, with no overtime upcharge.</>
  },
  {
    id: 'promise',
    topic: 'promise',
    keywords: ['warrant', 'warranty', 'guarantee', 'guaranteed', 'promise', 'trust', 'reliable'],
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
      'cost',
      'costs',
      'expensive',
      'cheap',
      'afford',
      'budget',
      'estimate',
      'quote'
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
    keywords: ['permit', 'permits', 'licensed', 'license', 'insured', 'insurance', 'bonded', 'background', 'certified'],
    weight: 2,
    logLabel: 'Answered a question about licensing/insurance',
    reply: () => (
      <>
        We&rsquo;re fully licensed and insured (WA license {business.license.wa}). Every technician is
        background-checked and drug-tested before they&rsquo;re ever sent to a job site.
      </>
    )
  },
  {
    id: 'financing',
    topic: 'financing',
    keywords: ['financ', 'financing', 'payment plan', 'payment', 'loan'],
    weight: 2,
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
      'discount',
      'discounts',
      'deal',
      'deals',
      'offer',
      'offers',
      'savings',
      'promo',
      'promo code'
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

export function findBestMatch(input: string, entries: KnowledgeEntry[] = getKnowledgeBase()): KnowledgeEntry | null {
  const normalizedInput = normalizeText(input);
  const tokens = new Set(tokenize(input));
  if (tokens.size === 0) return null;

  let best: { entry: KnowledgeEntry; score: number } | null = null;
  for (const entry of entries) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (keyword.includes(' ')) {
        if (normalizedInput.includes(keyword)) score += 3 * (entry.weight ?? 1);
      } else if (tokens.has(keyword)) {
        score += entry.weight ?? 1;
      }
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { entry, score };
    }
  }

  return best && best.score >= 2 ? best.entry : null;
}
