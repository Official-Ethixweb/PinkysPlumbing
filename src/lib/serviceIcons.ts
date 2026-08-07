import type { ImageMetadata } from 'astro';
import type { Service } from '../data/services';

import emergencyPlumbing from '../assets/icons/services/emergency-plumbing.svg';
import emergencyPlumbingHover from '../assets/icons/services/emergency-plumbing-hover.svg';
import waterHeaters from '../assets/icons/services/water-heaters.svg';
import waterHeatersHover from '../assets/icons/services/water-heaters-hover.svg';
import drainCleaning from '../assets/icons/services/drain-cleaning.svg';
import drainCleaningHover from '../assets/icons/services/drain-cleaning-hover.svg';
import faucetFixture from '../assets/icons/services/faucet-fixture.svg';
import faucetFixtureHover from '../assets/icons/services/faucet-fixture-hover.svg';
import toiletRepair from '../assets/icons/services/toilet-repair.svg';
import toiletRepairHover from '../assets/icons/services/toilet-repair-hover.svg';
import sewerService from '../assets/icons/services/sewer-service.svg';
import sewerServiceHover from '../assets/icons/services/sewer-service-hover.svg';
import gasLineInstall from '../assets/icons/services/gas-line-install.svg';
import gasLineInstallHover from '../assets/icons/services/gas-line-install-hover.svg';
import heatingSystems from '../assets/icons/services/heating-systems.svg';
import heatingSystemsHover from '../assets/icons/services/heating-systems-hover.svg';

export interface ServiceIconPair {
  default: ImageMetadata;
  hover: ImageMetadata;
}

/** Shared icon lookup for Service['icon'], reused wherever a service card
 * needs to resolve its icon name to its default/hover artwork pair
 * (services listing, service detail, homepage grid, contact form service
 * picker). Each pair is the same mark baked twice - pink-forward at rest,
 * teal-forward on hover - not one recolored via currentColor, because the
 * source art swaps which SHAPES are pink vs teal rather than just
 * changing a single fill. */
export const serviceIconMap: Record<Service['icon'], ServiceIconPair> = {
  Siren: { default: emergencyPlumbing, hover: emergencyPlumbingHover },
  Flame: { default: waterHeaters, hover: waterHeatersHover },
  Droplets: { default: drainCleaning, hover: drainCleaningHover },
  Wrench: { default: faucetFixture, hover: faucetFixtureHover },
  Toilet: { default: toiletRepair, hover: toiletRepairHover },
  Shovel: { default: sewerService, hover: sewerServiceHover },
  Fuel: { default: gasLineInstall, hover: gasLineInstallHover },
  ThermometerSun: { default: heatingSystems, hover: heatingSystemsHover }
};
