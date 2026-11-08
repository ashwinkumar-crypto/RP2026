/** Tiny mutable singleton shared between the DOM layer and the 3D layer. */
export const appState = {
  /** performance.now() when the opening scene is ready (0 until then). */
  enteredAt: 0,
}

/** 0 → 1 over `ms` milliseconds after the scene becomes ready. */
export function introFactor(ms = 2400) {
  if (!appState.enteredAt) return 0
  const t = Math.min(1, (performance.now() - appState.enteredAt) / ms)
  return t * t * (3 - 2 * t)
}
