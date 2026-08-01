/** Shared prop preset for SpecularButton, so every primary CTA sitewide
 * gets the same tuned shine (not a copy-pasted prop block at each call site).
 *
 * tint is the exact #F189BA light pink requested for CTA fills (matches
 * --color-pink-cta in global.css - kept as a literal hex here since this
 * preset feeds a WebGL shader uniform, not a Tailwind class, so it can't
 * reference the CSS custom property directly). */
export const specularPink = {
  radius: 999,
  tint: '#f189ba',
  tintOpacity: 1,
  textColor: '#004056',
  lineColor: '#ee1e87',
  baseColor: '#ffbfe1',
  shineSize: 20,
  shineFade: 50,
  intensity: 0.85,
  speed: 0.25,
  autoAnimate: true,
  proximity: 280
} as const;
