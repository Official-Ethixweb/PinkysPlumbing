import { useEffect, useState } from 'react';

/** Returns the current gap (px) between the layout viewport and the visual
 * viewport, i.e. roughly how much an on-screen keyboard is covering. Zero
 * when the API is unavailable (SSR-safe) or no keyboard is open. `100dvh`
 * alone doesn't reliably clear this on iOS Safari, which can resize the
 * visual viewport without shrinking the layout viewport the same way. */
export function useVisualViewportOffset(): number {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => setOffset(Math.max(0, window.innerHeight - vv.height));
    vv.addEventListener('resize', onResize);
    onResize();
    return () => vv.removeEventListener('resize', onResize);
  }, []);

  return offset;
}
