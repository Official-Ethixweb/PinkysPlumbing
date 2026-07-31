/** Active coupons/offers, migrated and cleaned up from the legacy site's
 * coupon page. No expiration dates were ever published for these, so none
 * are fabricated here — call it out as "current offer" instead. */
export interface Coupon {
  code: string;
  title: string;
  offer: string;
  icon: 'Flame' | 'Droplets' | 'Shovel' | 'Wrench' | 'ThermometerSun' | 'Sparkles';
  relatedService?: string;
  terms: string;
}

export const coupons: Coupon[] = [
  {
    code: 'WS700',
    title: 'Furnace Tune-Up',
    offer: '$99 furnace service tune-up',
    icon: 'ThermometerSun',
    relatedService: 'heating-systems',
    terms: 'Must be mentioned when scheduling to redeem. Cannot be combined with other offers or discounts.'
  },
  {
    code: 'WS100',
    title: 'Water Heater Savings',
    offer: '$75 off any water heater repair or install',
    icon: 'Flame',
    relatedService: 'water-heaters',
    terms: 'Must be mentioned when scheduling to redeem. Cannot be combined with other offers or discounts.'
  },
  {
    code: 'WS101',
    title: 'Free Earthquake Straps',
    offer: 'Free earthquake straps with any water heater install',
    icon: 'Flame',
    relatedService: 'water-heaters',
    terms: 'Must be mentioned when scheduling to redeem. Cannot be combined with other offers or discounts.'
  },
  {
    code: 'WS50',
    title: 'Drain Cleaning Discount',
    offer: '$45 off your next drain cleaning',
    icon: 'Droplets',
    relatedService: 'drain-cleaning',
    terms: 'Must be mentioned when scheduling to redeem. Cannot be combined with other offers or discounts.'
  },
  {
    code: 'WS500',
    title: 'Sewer Cleaning Savings',
    offer: '$29 off sewer cleaning',
    icon: 'Shovel',
    relatedService: 'sewer-service',
    terms: 'Must be mentioned when scheduling to redeem. Cannot be combined with other offers or discounts.'
  },
  {
    code: 'WS51',
    title: 'Free Video Inspection',
    offer: 'Free video inspection with any sewer cleaning',
    icon: 'Shovel',
    relatedService: 'sewer-service',
    terms: 'Must be mentioned when scheduling to redeem. Cannot be combined with other offers or discounts.'
  },
  {
    code: 'WS602',
    title: 'New Pipe Savings',
    offer: '$200 off new pipe installation',
    icon: 'Wrench',
    relatedService: 'sewer-service',
    terms: 'Must be mentioned when scheduling to redeem. Cannot be combined with other offers or discounts.'
  },
  {
    code: 'WS200',
    title: 'Faucet Repair or Install',
    offer: '$51 off any faucet repair or install (most brands)',
    icon: 'Wrench',
    relatedService: 'faucet-fixture',
    terms: 'Must be mentioned when scheduling to redeem. Cannot be combined with other offers or discounts.'
  },
  {
    code: 'WS201',
    title: 'Free Supply Lines',
    offer: 'Free supply lines with any faucet install (most brands)',
    icon: 'Wrench',
    relatedService: 'faucet-fixture',
    terms: 'Must be mentioned when scheduling to redeem. Cannot be combined with other offers or discounts.'
  },
  {
    code: 'WS600',
    title: 'General Repair Savings',
    offer: '$39 off any plumbing repair',
    icon: 'Sparkles',
    terms: 'Must be mentioned when scheduling to redeem. Cannot be combined with other offers or discounts.'
  }
];
