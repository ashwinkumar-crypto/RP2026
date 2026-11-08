import { useEffect, useRef } from 'react'
import { progress, sseg } from '../scroll/timeline'

/** Golden bokeh dust + drifting rose petals, drawn on a 2D canvas over the film. */
export default function Particles({ low }) {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current
    const g = c.getContext('2d')
    let w = 0
    let h = 0
    let raf = 0
    const dpr = Math.min(window.devicePixelRatio || 1, low ? 1.25 : 1.75)
    const resize = () => {
      w = c.clientWidth
      h = c.clientHeight
      c.width = w * dpr
      c.height = h * dpr
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const rnd = (a, b) => a + Math.random() * (b - a)
    const dust = Array.from({ length: low ? 38 : 70 }, () => ({
      x: Math.random(), y: Math.random(), r: rnd(1, 4.5), v: rnd(0.008, 0.03), ph: rnd(0, 6.28), a: rnd(0.25, 0.85),
    }))
    const petals = Array.from({ length: low ? 16 : 34 }, () => ({
      x: Math.random(), y: Math.random(), s: rnd(6, 13), v: rnd(0.03, 0.08), ph: rnd(0, 6.28), rot: rnd(0, 6.28), rs: rnd(-1.5, 1.5),
      c: ['#b3122f', '#d12347', '#e63a6b', '#8f0f27'][Math.floor(Math.random() * 4)],
    }))

    let last = performance.now()
    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const p = progress.value
      g.clearRect(0, 0, w, h)
      g.globalCompositeOperation = 'lighter'
      dust.forEach((d) => {
        d.y -= d.v * dt * 4
        if (d.y < -0.05) d.y = 1.05
        const x = (d.x + Math.sin(now / 2600 + d.ph) * 0.012) * w
        const y = d.y * h
        const a = d.a * (0.6 + 0.4 * Math.sin(now / 900 + d.ph))
        const gr = g.createRadialGradient(x, y, 0, x, y, d.r * 3)
        gr.addColorStop(0, `rgba(255,222,150,${a})`)
        gr.addColorStop(1, 'rgba(255,190,90,0)')
        g.fillStyle = gr
        g.beginPath()
        g.arc(x, y, d.r * 3, 0, 6.283)
        g.fill()
      })
      g.globalCompositeOperation = 'source-over'
      // petals appear once the palace opens, thin out for the final text
      const amt = sseg(p, 0.08, 0.18) * (1 - sseg(p, 0.84, 0.9) * 0.7)
      const n = Math.floor(petals.length * amt)
      for (let i = 0; i < n; i++) {
        const q = petals[i]
        q.y += q.v * dt
        q.rot += q.rs * dt
        if (q.y > 1.05) q.y = -0.05
        const x = (q.x + Math.sin(now / 1800 + q.ph) * 0.05) * w
        const y = q.y * h
        g.save()
        g.translate(x, y)
        g.rotate(q.rot)
        g.scale(1, 0.6 + 0.4 * Math.abs(Math.sin(now / 700 + q.ph)))
        g.fillStyle = q.c
        g.globalAlpha = 0.82
        g.beginPath()
        g.ellipse(0, 0, q.s, q.s * 0.62, 0, 0, 6.283)
        g.fill()
        g.restore()
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [low])
  return <canvas ref={ref} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />
}
