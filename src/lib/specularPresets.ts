/** Shared prop presets for SpecularButton, so every primary CTA sitewide
 * gets the same tuned shine (not a copy-pasted prop block at each call site).
 *
 * tint is the exact #F189BA light pink requested for CTA fills (matches
 * --color-pink-cta in global.css - kept as a literal hex here since this
 * preset feeds a WebGL shader uniform, not a Tailwind class, so it can't
 * reference the CSS custom property directly). Because the fill is now
 * light, textColor is teal-900 rather than white for contrast - same
 * structure specularWhite already used for its light (white) surface. */
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

/** For a primary CTA sitting on an already-pink surface (e.g. the footer's
 * closing CTA band) — inverted to a white surface with a pink shine. */
export const specularWhite = {
  radius: 999,
  tint: '#ffffff',
  tintOpacity: 1,
  textColor: '#ac0a5c',
  lineColor: '#ee1e87',
  baseColor: '#ffbfe1',
  shineSize: 20,
  shineFade: 50,
  intensity: 0.8,
  speed: 0.25,
  autoAnimate: true,
  proximity: 280
} as const;
