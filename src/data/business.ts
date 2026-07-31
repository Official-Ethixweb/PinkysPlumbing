/** Single source of truth for business facts, reused across metadata,
 * schema.org JSON-LD, the navbar, and the footer so numbers/hours never drift. */
export const business = {
  name: "Pinky's Plumbing",
  legalName: "Pinky's Plumbing LLC",
  tagline: 'When Your Plumbing (and Things) Get Stinky',
  shortPromise: "One call does it all: Seattle's 24-hour plumber.",
  url: 'https://www.pinkysplumbing.com',
  hotline: { display: '855-4-PINKYS', tel: '+18554746597' },
  dispatch: { display: '(206) 707-1497', tel: '+12067071497' },
  // NOTE: email is not shown anywhere in the source screenshots (only an
  // icon glyph, no visible handle). Placeholder, confirm before launch.
  email: 'service@pinkysplumbing.com',
  priceRange: '$$',
  license: {
    wa: 'PINKYPL905LS',
    tx: 'MP#44935'
  },
  social: {
    facebook: 'https://www.facebook.com/pinkysplumbing/',
    twitter: 'https://twitter.com/getpinkys',
    youtube: 'https://www.youtube.com/user/pinkysplumbing'
  },
  counties: [
    { name: 'King County', phoneDisplay: '206-316-8876', phoneTel: '+12063168876' },
    { name: 'Snohomish County', phoneDisplay: '425-949-4539', phoneTel: '+14259494539' },
    { name: 'Pierce County', phoneDisplay: '253-466-4042', phoneTel: '+12534664042' }
  ],
  hours: 'Open 24 hours a day, 7 days a week',
  streetAddress: '15250 32nd Ave S #68133',
  addressRegion: 'WA',
  addressLocality: 'Seattle',
  postalCode: '98168',
  geo: { latitude: 47.6062, longitude: -122.3321 }
} as const;

export const promise = [
  "You'll receive an honest value for your money",
  'To be available 24 hours a day, 7 days a week',
  'Our technicians are licensed and experienced',
  'To handle small jobs as seriously as large ones',
  'To respect your home as if it were our own',
  'To always make your satisfaction our #1 goal'
] as const;

export const serviceAreas: string[] = [
  'Algona',
  'Auburn',
  'Ballard',
  'Bellevue',
  'Black Diamond',
  'Bonney Lake',
  'Bothell',
  'Brier',
  'Buckley',
  'Burien',
  'Capitol Hill',
  'Clyde Hill',
  'Edgewood',
  'Edmonds',
  'Enumclaw',
  'Everett',
  'Fife',
  'Fircrest',
  'Issaquah',
  'Kenmore',
  'Kent',
  'Kirkland',
  'Lakewood',
  'Lynnwood',
  'Maple Valley',
  'Marysville',
  'Medina',
  'Mercer Island',
  'Mill Creek',
  'Mukilteo',
  'Newcastle',
  'Normandy Park',
  'Orting',
  'Pacific',
  'Puyallup',
  'Queen Anne',
  'Redmond',
  'Renton',
  'Sammamish',
  'Seatac',
  'Seattle',
  'Shoreline',
  'Snohomish',
  'Snoqualmie',
  'Tacoma',
  'Tukwila',
  'University Place',
  'Federal Way'
];

export const testimonials = [
  {
    name: 'Brandon F.',
    rating: 5,
    quote:
      "Great organization, very professional guys who came over. Other companies were scheduling a week out, but Pinky's coordinator scheduled me for the afternoon on the same day! The techs demonstrated incredible workmanship clearing my clog. I'm glad I didn't try to do it myself."
  },
  {
    name: 'G.C.',
    rating: 5,
    quote:
      "I called multiple plumbing companies for a simple toilet leak and valve change, and all of them except Pinky's had a 3-5 week wait. Pinky's came out the next business day, did a great job, and were fast and helpful the whole way through."
  },
  {
    name: 'Michelle D.',
    rating: 5,
    quote:
      'We scheduled on Tuesday and they came out Wednesday. Matt and Dalton arrived on time, were very respectful of our home and the fact that I work from home. I was impressed with how thorough they were and how well they cleaned up after. We would definitely use them again.'
  }
] as const;
