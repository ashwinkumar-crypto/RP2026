import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

/**
 * The single source of truth for the film.
 *  - `target` is the raw scroll position (0 → 1) reported by GSAP ScrollTrigger.
 *  - `value`  is the smoothed playhead that the camera, lights, objects and the
 *             DOM overlay all read. Because both directions use the same
 *             damping function, scrolling up reverses the film exactly.
 */
export const progress = { target: 0, value: 0 }

export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)
export const smooth = (t) => t * t * (3 - 2 * t)
export const lerp = (a, b, t) => a + (b - a) * t
/** Linear 0→1 progress of `p` between a and b. */
export const seg = (p, a, b) => clamp01((p - a) / (b - a))
/** Eased 0→1 progress of `p` between a and b. */
export const sseg = (p, a, b) => smooth(seg(p, a, b))

/** The journey scene ranges (fractions of the pinned scroll). */
export const SCENES = {
  entrance: [0.1, 0.25],
  pathway: [0.25, 0.45],
  stage: [0.45, 0.65],
  couple: [0.65, 0.8],
  details: [0.8, 1.0],
}

/** Where the final scene starts – used by the "Skip to end" shortcut. */
export const FINALE_AT = 0.955

export function initScrollTimeline(stageEl, { pinScreens = 10, initialProgress = 0 } = {}) {
  progress.target = initialProgress
  progress.value = initialProgress

  const st = ScrollTrigger.create({
    trigger: stageEl,
    start: 'top top',
    end: () => `+=${Math.round(window.innerHeight * pinScreens * (1 - initialProgress))}`,
    pin: true,
    pinSpacing: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      progress.target = initialProgress + self.progress * (1 - initialProgress)
    },
    onRefresh: (self) => {
      progress.target = initialProgress + self.progress * (1 - initialProgress)
      progress.value = progress.target
    },
  })

  // Damped follow – frame-rate independent.
  const tick = (_time, deltaMs) => {
    const dt = Math.min(deltaMs, 100) / 1000
    const diff = progress.target - progress.value
    if (Math.abs(diff) < 0.00002) {
      progress.value = progress.target
      return
    }
    progress.value += diff * (1 - Math.exp(-5 * dt))
  }
  gsap.ticker.add(tick)

  return {
    st,
    scrollToProgress(p, smoothly = true) {
      const localProgress = (clamp01(p) - initialProgress) / (1 - initialProgress)
      const y = st.start + (st.end - st.start) * clamp01(localProgress)
      window.scrollTo({ top: y, behavior: smoothly ? 'smooth' : 'auto' })
    },
    destroy() {
      gsap.ticker.remove(tick)
      st.kill()
    },
  }
}
