/** Featured local-SEO landing pages: a curated subset of the 48-city service
 * area (see business.serviceAreas for the full list) that gets its own
 * dedicated page. Kept to the highest-value metros per county rather than
 * all 48, to avoid the thin/near-duplicate-content pattern the legacy
 * per-city template carried. */
export interface CityPage {
  slug: string;
  name: string;
  county: 'King' | 'Snohomish' | 'Pierce';
  blurb: string;
}

export const cityPages: CityPage[] = [
  {
    slug: 'seattle',
    name: 'Seattle',
    county: 'King',
    blurb:
      "From Ballard to Capitol Hill, Pinky's is the 24-hour plumber Seattle homeowners and businesses call first, day or night."
  },
  {
    slug: 'bellevue',
    name: 'Bellevue',
    county: 'King',
    blurb:
      "Eastside homes and businesses get the same fast, background-checked crew Pinky's is known for across Bellevue."
  },
  {
    slug: 'renton',
    name: 'Renton',
    county: 'King',
    blurb:
      'Trucks stocked and dispatched throughout Renton for emergency repairs, drain cleaning, and water heater service.'
  },
  {
    slug: 'kent',
    name: 'Kent',
    county: 'King',
    blurb: "Kent homeowners rely on Pinky's for same-day repairs and honest, upfront pricing on every job."
  },
  {
    slug: 'redmond',
    name: 'Redmond',
    county: 'King',
    blurb: 'Licensed technicians on call across Redmond for everything from a leaky faucet to a full sewer repair.'
  },
  {
    slug: 'kirkland',
    name: 'Kirkland',
    county: 'King',
    blurb: "Fast response and clean, courteous service for Kirkland's homes and waterfront businesses alike."
  },
  {
    slug: 'everett',
    name: 'Everett',
    county: 'Snohomish',
    blurb:
      "Everett's 24-hour plumber for emergency shutoffs, water heaters, and drain cleaning, no overtime charges, ever."
  },
  {
    slug: 'lynnwood',
    name: 'Lynnwood',
    county: 'Snohomish',
    blurb:
      "Pinky's keeps Lynnwood's plumbing running with fast dispatch and the same crew you'll see visit after visit."
  },
  {
    slug: 'marysville',
    name: 'Marysville',
    county: 'Snohomish',
    blurb: "From routine maintenance to sewer emergencies, Marysville households count on Pinky's around the clock."
  },
  {
    slug: 'tacoma',
    name: 'Tacoma',
    county: 'Pierce',
    blurb: "South of the bridge, Tacoma gets the same licensed, 24/7 plumbing crew that's served Puget Sound for years."
  },
  {
    slug: 'puyallup',
    name: 'Puyallup',
    county: 'Pierce',
    blurb:
      'Puyallup homeowners get upfront pricing and fully stocked trucks ready for repair, service, or installation.'
  },
  {
    slug: 'lakewood',
    name: 'Lakewood',
    county: 'Pierce',
    blurb:
      "Pinky's dispatches throughout Lakewood for emergency plumbing, heating, and drain cleaning, any hour of the day."
  }
];

export function getCityBySlug(slug: string): CityPage | undefined {
  return cityPages.find((c) => c.slug === slug);
}
