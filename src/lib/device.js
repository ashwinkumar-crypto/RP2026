/** Detects what this device can handle and picks a quality tier. */
export function detectCapabilities() {
  const mq = (q) => typeof window !== 'undefined' && window.matchMedia && window.matchMedia(q).matches

  const reducedMotion = mq('(prefers-reduced-motion: reduce)')
  const mobile = mq('(max-width: 820px)') || mq('(pointer: coarse)')

  let webgl = false
  try {
    const c = document.createElement('canvas')
    webgl = !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    webgl = false
  }

  const lowMem = typeof navigator !== 'undefined' && navigator.deviceMemory && navigator.deviceMemory <= 2
  const cores = (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 4
  const low = mobile || lowMem || cores <= 4

  const quality = low
    ? { tier: 'low', dpr: [1, mobile ? 1.5 : 1.75], antialias: !mobile, shadows: false, petals: 70, sparkles: 90, fairy: 260 }
    : { tier: 'high', dpr: [1, 2], antialias: true, shadows: true, petals: 170, sparkles: 220, fairy: 700 }

  return { reducedMotion, webgl, mobile, quality }
}
