import { Siren, Flame, Droplets, Wrench, Toilet, Shovel, Fuel, ThermometerSun, type LucideIcon } from 'lucide-react';
import type { Service } from '../data/services';

/** Shared icon lookup for Service['icon'], reused wherever a service card
 * needs to resolve its icon name to a component (services listing, service
 * detail, homepage grid, contact form service picker). */
export const serviceIconMap: Record<Service['icon'], LucideIcon> = {
  Siren,
  Flame,
  Droplets,
  Wrench,
  Toilet,
  Shovel,
  Fuel,
  ThermometerSun
};
