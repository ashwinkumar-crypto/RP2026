import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { progress, clamp01, smooth, lerp } from '../scroll/timeline'

/**
 * The cinematic film built from photoreal scene frames.
 * Each frame is "flown into" (scale + drift) while the next one rushes up out of
 * the distance and crossfades in – so scrolling feels like a continuous camera
 * move through the wedding journey. Everything is a pure function of the playhead,
 * so scrolling up plays it in reverse.
 *
 * [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd, scaleFrom, scaleTo, origin, driftX]
 */
const SHOTS = [
  [0, 0, 0.17, 0.24, 0.8, 1.95, '50% 56%', 0],
  [0.17, 0.24, 0.35, 0.42, 0.78, 1.7, '50% 55%', 0],
  [0.35, 0.42, 0.53, 0.59, 0.82, 1.5, '50% 64%', 0],
  [0.53, 0.59, 0.68, 0.74, 0.94, 1.14, '50% 62%', 0],
  [0.68, 0.75, 1.01, 1.02, 1.1, 1.22, '50% 50%', 0],
]

export default function PlateStage({ images }) {
  const layers = useRef([])

  useEffect(() => {
    const tick = () => {
      const p = progress.value
      SHOTS.forEach(([ia, ib, oa, ob, s0, s1, origin, dx], i) => {
        const el = layers.current[i]
        if (!el) return
        const vIn = ib <= ia ? 1 : smooth(clamp01((p - ia) / (ib - ia)))
        const vOut = 1 - smooth(clamp01((p - oa) / (ob - oa)))
        const o = Math.min(vIn, vOut)
        const k = clamp01((p - ia) / (ob - ia))
        // ease-in-out on the dolly so every move starts and ends softly
        const sc = lerp(s0, s1, k * k * (3 - 2 * k) * 0.35 + k * 0.65)
        el.style.opacity = o.toFixed(3)
        el.style.visibility = o < 0.003 ? 'hidden' : 'visible'
        el.style.transformOrigin = origin
        el.style.transform = `translate3d(${(dx * k * 100).toFixed(2)}%,0,0) scale(${sc.toFixed(4)})`
      })
    }
    gsap.ticker.add(tick)
    tick()
    return () => gsap.ticker.remove(tick)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0a0204]">
      {images.map((src, i) => (
        <div
          key={src}
          ref={(el) => (layers.current[i] = el)}
          className="plate absolute inset-0"
          style={{ opacity: i === 0 ? 1 : 0, willChange: 'transform, opacity' }}
        >
          {/* blurred copy fills the cinema-scope letterbox */}
          <img src={src} alt="" aria-hidden="true" className="plate-fill" draggable="false" />
          {i === images.length - 1 ? null :           <img src={src} alt="" className={i === 3 ? 'plate-img contain' : 'plate-img'} draggable="false" />}
        </div>
      ))}
      <Vignette />
    </div>
  )
}

function Vignette() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(8,1,3,0.55) 100%)' }}
    />
  )
}
