/** Shared prop presets for SpecularButton, so every primary CTA sitewide
 * gets the same tuned shine (not a copy-pasted prop block at each call site). */
export const specularPink = {
  radius: 999,
  tint: '#d10e72',
  tintOpacity: 1,
  textColor: '#ffffff',
  lineColor: '#ffffff',
  baseColor: '#ac0a5c',
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
