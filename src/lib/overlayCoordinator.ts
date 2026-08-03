export type OverlayId = 'coupon' | 'accessibility' | 'chat';

// Tracks which single "large panel" widget is currently open and closes
// whichever one was previously open the instant a different one opens, so
// two panels never overlap. Each widget still owns its own open/closed
// state (local useState for Coupon/Chat, the a11y module store for
// Accessibility) — this coordinator only holds a `close` callback per
// widget and calls the PREVIOUS widget's callback synchronously inside
// `registerOverlayOpen`, before the new widget's own open state is even
// committed. That ordering (call-the-other-widget's-closer directly,
// rather than having every widget subscribe to "who's active" and diff
// it against its own state in an effect) is deliberate: two effects
// racing to read/write the same shared value in the same commit is what
// caused a widget to close itself right after opening in an earlier
// version of this module — a plain callback registry has no such race
// because there's only ever one writer per widget's own close.

const closers = new Map<OverlayId, () => void>();
let activeOverlay: OverlayId | null = null;

/** Call once, unconditionally, from each widget's module scope or a
 * one-time effect: registers "how to close me" so other widgets can
 * evict this one. Does not itself open or close anything. */
export function setOverlayCloser(id: OverlayId, close: () => void) {
  closers.set(id, close);
}

/** Call when a widget's own panel opens. Closes whichever other widget
 * was previously the active one (if any), then records this widget as
 * active. Safe to call every render — it no-ops once this id is already
 * active. */
export function registerOverlayOpen(id: OverlayId) {
  if (activeOverlay === id) return;
  const previous = activeOverlay;
  activeOverlay = id;
  if (previous && previous !== id) closers.get(previous)?.();
}

/** Call when a widget's own panel closes (including when it was the one
 * just evicted above — closing itself again is a harmless no-op). */
export function registerOverlayClosed(id: OverlayId) {
  if (activeOverlay === id) activeOverlay = null;
}
