import { MapPin, Phone } from 'lucide-react';
import CardSwap, { Card } from './CardSwap';

export type CountyTone = 'pink' | 'teal' | 'gold';

export interface CountyCard {
  name: string;
  phoneDisplay: string;
  phoneTel: string;
  blurb: string;
  tone: CountyTone;
}

const TONE_STYLES: Record<CountyTone, { icon: string; badge: string; wash: string }> = {
  pink: { icon: 'text-pink-400', badge: 'bg-pink-500/15 ring-pink-500/25', wash: 'from-pink-500/10' },
  teal: { icon: 'text-teal-400', badge: 'bg-teal-500/15 ring-teal-500/25', wash: 'from-teal-500/10' },
  gold: { icon: 'text-gold-400', badge: 'bg-gold-500/15 ring-gold-500/25', wash: 'from-gold-500/10' }
};

interface CountyCardStackProps {
  counties: CountyCard[];
}

/**
 * County coverage, presented as a swapping 3D card stack (React Bits'
 * CardSwap). Built as a self-contained island — rather than accepting the
 * <Card> children from the .astro page — because CardSwap clones each
 * child to attach its own ref for GSAP; children passed across the
 * Astro-to-React boundary without their own client directive are flattened
 * to static HTML and would arrive as one opaque blob instead of three
 * distinct elements.
 */
export default function CountyCardStack({ counties }: CountyCardStackProps) {
  return (
    <CardSwap
      width="100%"
      height="100%"
      cardDistance={44}
      verticalDistance={48}
      delay={4200}
      pauseOnHover
      skewAmount={5}
      easing="elastic"
      dropDistance={190}
    >
      {counties.map((county) => {
        const tone = TONE_STYLES[county.tone];
        return (
          <Card
            key={county.name}
            className={`border-ink-100 flex flex-col justify-between overflow-hidden rounded-3xl border bg-white bg-gradient-to-br ${tone.wash} shadow-card-hover to-transparent p-7`}
          >
            <div>
              <span
                className={`inline-flex size-12 items-center justify-center rounded-2xl ring-1 ring-inset ${tone.badge}`}
              >
                <MapPin className={`size-5 ${tone.icon}`} aria-hidden="true" strokeWidth={2} />
              </span>
              <h3 className="font-display text-ink-900 mt-5 text-xl font-bold">{county.name}</h3>
              <p className="text-ink-500 mt-2 text-sm leading-relaxed">{county.blurb}</p>
            </div>
            <a
              href={`tel:${county.phoneTel}`}
              className="font-display text-ink-800 mt-6 inline-flex items-center gap-2 text-base font-semibold transition-colors hover:text-pink-600"
            >
              <Phone className={`size-4 ${tone.icon}`} aria-hidden="true" />
              {county.phoneDisplay}
            </a>
          </Card>
        );
      })}
    </CardSwap>
  );
}
