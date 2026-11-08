import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { progress, clamp01, smooth } from '../scroll/timeline'

/**
 * A DOM element whose opacity / position is driven directly by the film's
 * playhead (no React re-renders). Visible between `from` and `to`; when `to`
 * is ≥ 1 it stays on screen until the very end of the film.
 */
export function Reveal({ from, to, fade = 0.014, rise = 28, interactive = false, className = '', style, children }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const stays = to >= 1
    const tick = () => {
      const p = progress.value
      const vIn = from <= 0 ? 1 : clamp01((p - from) / fade)
      const vOut = stays ? 1 : 1 - clamp01((p - (to - fade)) / fade)
      const v = smooth(Math.min(vIn, vOut))
      const dir = p < (from + to) / 2 ? 1 : -1
      el.style.opacity = v.toFixed(3)
      el.style.transform = `translate3d(0, ${((1 - v) * rise * dir).toFixed(1)}px, 0)`
      el.style.visibility = v < 0.01 ? 'hidden' : 'visible'
      el.style.pointerEvents = interactive && v > 0.55 ? 'auto' : 'none'
    }
    gsap.ticker.add(tick)
    tick()
    return () => gsap.ticker.remove(tick)
  }, [from, to, fade, rise, interactive])

  return (
    <div ref={ref} className={className} style={{ opacity: 0, visibility: 'hidden', willChange: 'opacity, transform', ...style }}>
      {children}
    </div>
  )
}

/** Runs `fn(progress)` every frame – used for scrims, flashes, progress bars. */
export function useProgressTick(fn, deps = []) {
  useEffect(() => {
    const tick = () => fn(progress.value)
    gsap.ticker.add(tick)
    tick()
    return () => gsap.ticker.remove(tick)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
