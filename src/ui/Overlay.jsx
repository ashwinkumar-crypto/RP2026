import { useRef } from 'react'
import { Reveal, useProgressTick } from './Reveal'
import { InvitationPanel, WhenWhere, Schedule, FinalPanel, Ornament } from './sections'
import { dateParts } from '../lib/format'
import { clamp01, sseg, FINALE_AT } from '../scroll/timeline'

const Caption = ({ children }) => (
  <p className="text-glow text-center font-display text-[1.55rem] italic leading-snug text-ivory sm:text-[2.3rem] md:text-5xl">
    {children}
  </p>
)

/** All text that sits on top of the 3D film – every element is driven by the scroll playhead. */
export default function Overlay({ wedding, onSkip, hintVisible }) {
  const scrim = useRef(null)
  const shade = useRef(null)
  const bar = useRef(null)
  const hint = useRef(null)
  const skip = useRef(null)
  const d = dateParts(wedding.date)

  useProgressTick((p) => {
    // Dark scrim behind text-heavy scenes so type is always legible.
    const detailsIn = sseg(p, 0.8, 0.84)
    if (scrim.current) scrim.current.style.opacity = (0.92 * detailsIn).toFixed(3)
    // soft top/bottom shade so the names and date stay legible over the bright stage
    if (shade.current) shade.current.style.opacity = (sseg(p, 0.64, 0.72) * (1 - detailsIn)).toFixed(3)

    if (bar.current) bar.current.style.transform = `scaleX(${clamp01(p).toFixed(4)})`
    if (hint.current) hint.current.style.opacity = (1 - clamp01((p - 0.112) / 0.035)).toFixed(3)
    if (skip.current) {
      const v = clamp01((p - 0.02) / 0.03) * (1 - clamp01((p - (FINALE_AT - 0.04)) / 0.03))
      skip.current.style.opacity = v.toFixed(3)
      skip.current.style.pointerEvents = v > 0.5 ? 'auto' : 'none'
    }
  })

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      <div ref={shade} className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,2,6,0.82) 0%, rgba(10,2,6,0.5) 30%, rgba(10,2,6,0) 50%, rgba(10,2,6,0) 62%, rgba(10,2,6,0.7) 100%)', opacity: 0 }} />
      <div ref={scrim} className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(10,2,6,0.95), rgba(10,2,6,0.82))', opacity: 0 }} />
      <div className="grain" />

      {/* Entrance hint */}
      <div ref={hint} className="absolute inset-x-0 bottom-[9vh] flex flex-col items-center gap-3 text-center" style={{ opacity: hintVisible ? 1 : 0 }}>
        <p className="label text-glow">Scroll to explore</p>
        <div className="relative h-9 w-[22px] rounded-full border border-gold/70">
          <span className="scroll-dot absolute left-1/2 top-2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-gold-light" />
        </div>
      </div>

      {/* Scene 2 – grand entrance */}
      <Reveal from={0.118} to={0.235} className="absolute inset-x-0 bottom-[11vh] px-6">
        <Caption>{wedding.captions.entrance}</Caption>
      </Reveal>

      {/* Scene 3 – pathway */}
      <Reveal from={0.285} to={0.43} className="absolute inset-x-0 bottom-[11vh] px-6">
        <Caption>{wedding.captions.pathway}</Caption>
      </Reveal>

      {/* Scene 4 – stage reveal */}
      <Reveal from={0.475} to={0.6} className="absolute inset-x-0 bottom-[11vh] px-6">
        <Caption>{wedding.captions.stage}</Caption>
      </Reveal>

      {/* Scene 5 – the couple */}
      <Reveal from={0.665} to={0.79} fade={0.02} rise={30} className="absolute inset-x-0 top-[5vh] px-6 text-center sm:top-[30vh] sm:px-[5vw]">
        <div className="flex flex-col items-center sm:flex-row sm:items-start sm:justify-between">
          <div className="sm:w-[38%] sm:text-left">
            <p className="label mb-1 text-glow">{wedding.occasion?.ofLine || 'The engagement of'}</p>
            <h1 className="gold-text font-script text-[2.8rem] leading-[1] sm:text-[4.2vw]" style={{ textShadow: 'none' }}>
              {wedding.groom.fullName || wedding.groom.firstName}
            </h1>
          </div>
          <p className="font-display text-2xl italic text-gold-light text-glow sm:mt-[2.8vw] sm:text-[2.4vw]">&amp;</p>
          <div className="sm:w-[38%] sm:text-right">
            <p className="label mb-1 text-glow opacity-0 sm:opacity-100">&nbsp;</p>
            <h1 className="gold-text font-script text-[2.8rem] leading-[1] sm:text-[4.2vw]">
              {wedding.bride.fullName || wedding.bride.firstName}
            </h1>
            {wedding.tagline && <p className="mt-2 font-display text-lg italic text-ivory text-glow sm:text-[1.3vw]">{wedding.tagline}</p>}
          </div>
        </div>
      </Reveal>
      <Reveal from={0.7} to={0.79} fade={0.02} rise={24} className="absolute inset-x-0 bottom-[7vh] px-6 text-center">
        <Ornament className="mx-auto mb-3" />
        <p className="font-cinzel text-[1.05rem] uppercase tracking-[0.26em] text-ivory text-glow sm:text-2xl">
          {d.day} {d.month} {d.year}
        </p>
        <p className="mt-1 font-display text-lg italic text-ivory-dim text-glow sm:text-xl">{wedding.day || d.weekday}</p>
      </Reveal>

      {/* Scene 6 – details (two beats) */}
      <Reveal from={0.815} to={0.875} fade={0.016} className="absolute inset-0 flex items-center justify-center px-6">
        <InvitationPanel wedding={wedding} />
      </Reveal>
      <Reveal from={0.875} to={0.935} fade={0.016} className="absolute inset-0 flex items-center justify-center overflow-y-auto px-6 py-16">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 text-glow sm:gap-10">
          <WhenWhere wedding={wedding} />
          <div>
            <p className="label mb-4 text-center sm:text-left">Ceremony schedule</p>
            <Schedule wedding={wedding} />
          </div>
        </div>
      </Reveal>

      {/* Scene 7 – final invitation */}
      <Reveal from={0.945} to={1} fade={0.02} interactive className="absolute inset-0 flex items-center justify-center px-6">
        <FinalPanel wedding={wedding} />
      </Reveal>

      {/* skip + progress */}
      <button
        ref={skip}
        type="button"
        onClick={onSkip}
        className="absolute right-4 top-16 rounded-full border border-gold/50 bg-black/30 px-4 py-2 font-cinzel text-[0.62rem] uppercase tracking-[0.22em] text-gold-light backdrop-blur-sm hover:bg-gold/20 sm:right-6 sm:top-[4.5rem]"
        style={{ opacity: 0, pointerEvents: 'none' }}
      >
        Skip to end
      </button>
      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/5">
        <div ref={bar} className="h-full origin-left bg-gradient-to-r from-gold-dark via-gold-light to-gold" style={{ transform: 'scaleX(0)' }} />
      </div>
    </div>
  )
}
