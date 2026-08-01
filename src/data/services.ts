import emergencyImg from '../assets/images/service-emergency-plumbing.webp';
import waterHeaterImg from '../assets/images/service-water-heaters.webp';
import drainImg from '../assets/images/service-drain-cleaning.webp';
import faucetImg from '../assets/images/service-faucet-fixture.webp';
import toiletImg from '../assets/images/service-toilet-repair.webp';
import sewerImg from '../assets/images/service-sewer.webp';
import gasLineImg from '../assets/images/service-gas-line.webp';
import heatingImg from '../assets/images/service-heating-systems.webp';
import type { ImageMetadata } from 'astro';

export interface Service {
  slug: string;
  title: string;
  icon: 'Siren' | 'Flame' | 'Droplets' | 'Wrench' | 'Toilet' | 'Shovel' | 'Fuel' | 'ThermometerSun';
  eyebrow: string;
  short: string;
  description: string;
  bullets: string[];
  image: ImageMetadata;
}

export const services: Service[] = [
  {
    slug: 'emergency-plumbing',
    title: 'Emergency Plumbing',
    icon: 'Siren',
    eyebrow: 'Broken, clogged or overflowing?',
    short: '24/7 emergency dispatch for leaks, floods, and burst pipes.',
    description:
      "A busted pipe or overflowing toilet doesn't wait for business hours, and neither do we. Our on-call technicians are dispatched around the clock across King, Snohomish, and Pierce County to shut off the damage fast and fix it right.",
    bullets: ['Live dispatch 24/7/365', 'No overtime upcharge', 'Arrives fully stocked to fix on the first visit'],
    image: emergencyImg
  },
  {
    slug: 'water-heaters',
    title: 'Water Heaters',
    icon: 'Flame',
    eyebrow: 'Repair, service, or install',
    short: 'Gas and electric water heater repair, replacement, and tune-ups.',
    description:
      "No hot water is never convenient. We diagnose and repair every major water heater brand, and if it's time to replace, we'll help you pick the right size, tank or tankless, for your household.",
    bullets: ['Same-day repair availability', 'Tank & tankless installs', 'Upfront, flat-rate pricing'],
    image: waterHeaterImg
  },
  {
    slug: 'drain-cleaning',
    title: 'Drain Cleaning',
    icon: 'Droplets',
    eyebrow: 'Clogged drain? Rooter service',
    short: 'Fast, thorough clearing for stubborn clogs, big and small.',
    description:
      "Slow or backed-up drains are usually a symptom, not the problem. We clear the clog and check for the buildup, grease, or root intrusion that caused it, so it doesn't come right back.",
    bullets: ['Camera inspection available', 'Hydro-jetting for tough clogs', 'Kitchen, bath & main line service'],
    image: drainImg
  },
  {
    slug: 'faucet-fixture',
    title: 'Faucet & Fixture',
    icon: 'Wrench',
    eyebrow: 'Seattle faucet plumbing',
    short: 'Leaky faucet, valve, and fixture repair or replacement.',
    description:
      'A leaky faucet can waste up to 100 gallons a week. We repair or replace faucets, valves, and fixtures throughout your home so you stop losing water, and money, to a slow drip.',
    bullets: ['All major fixture brands', 'Shower & tub valve repair', 'Free fixture upgrade quotes'],
    image: faucetImg
  },
  {
    slug: 'toilet-repair',
    title: 'Toilet Repair',
    icon: 'Toilet',
    eyebrow: 'Repair, service, and install',
    short: 'Running, clogged, or leaking toilets fixed for good.',
    description:
      'A toilet problem is rarely just an inconvenience: it can mean real water damage. We handle running toilets, weak flushes, base leaks, and full replacements with the same-day care they need.',
    bullets: ['Same-day service', 'Water-efficient toilet upgrades', 'Wax ring & base leak repair'],
    image: toiletImg
  },
  {
    slug: 'sewer-service',
    title: 'Sewer Service',
    icon: 'Shovel',
    eyebrow: 'Sewer repair & install',
    short: 'Sewer line cleaning, repair, trenchless replacement, and septic tank service.',
    description:
      "Sewer lines can be blocked or damaged by root intrusion, age, or shifting soil. Our crews are trained in cleaning, repair, and replacement, with camera diagnostics so you know exactly what's happening underground. We also service septic tanks for homes outside the municipal sewer system.",
    bullets: [
      'Video camera diagnostics',
      'Trenchless repair options',
      'Root intrusion clearing',
      'Septic tank service'
    ],
    image: sewerImg
  },
  {
    slug: 'gas-line-install',
    title: 'Gas Line Install',
    icon: 'Fuel',
    eyebrow: 'Repair, service, and install',
    short: 'Licensed gas line installation, repair, and conversions.',
    description:
      'Switching to gas can lower your utility bills, but it has to be done right. Our licensed technicians install, repair, and inspect gas lines for ranges, dryers, fireplaces, and whole-home conversions.',
    bullets: ['Licensed gas line technicians', 'Range, dryer & fireplace hookups', 'Full safety inspection included'],
    image: gasLineImg
  },
  {
    slug: 'heating-systems',
    title: 'Heating Systems',
    icon: 'ThermometerSun',
    eyebrow: 'Furnace, boiler & heat pump service',
    short: 'Furnace and heating system repair for Seattle winters.',
    description:
      'When your heat goes out, comfort goes with it. We service and repair residential heating systems so your home stays warm through everything a Pacific Northwest winter throws at it.',
    bullets: ['Furnace repair & tune-ups', 'Thermostat upgrades', 'Priority winter scheduling'],
    image: heatingImg
  }
];
