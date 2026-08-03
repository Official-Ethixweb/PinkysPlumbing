/** Shared prop preset for SpecularButton, so every primary CTA sitewide
 * gets the same tuned shine (not a copy-pasted prop block at each call site).
 *
 * tint is brand Primary Pink #F37FB5 (matches --color-pink-cta in
 * global.css - kept as a literal hex here since this preset feeds a
 * WebGL shader uniform, not a Tailwind class, so it can't reference the
 * CSS custom property directly; if the token changes, change it here
 * too). textColor is brand Dark Teal #002834, NOT white and NOT
 * #004158: measured against this pink, white is 2.47:1 (fails AA) and
 * #004158 is 4.49:1 (misses 4.5 by a hair); #002834 is 6.29:1. */
export const specularPink = {
  radius: 999,
  tint: '#f37fb5',
  tintOpacity: 1,
  textColor: '#002834',
  lineColor: '#ee1e87',
  baseColor: '#ffbfe1',
  shineSize: 20,
  shineFade: 50,
  intensity: 0.85,
  speed: 0.25,
  autoAnimate: true,
  proximity: 280
} as const;
