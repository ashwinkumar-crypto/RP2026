import { useRef } from 'react'
import { Reveal, useProgressTick } from './Reveal'
import { InvitationPanel, WhenWhere, Schedule, FinalPanel } from './sections'
import { clamp01, sseg, FINALE_AT } from '../scroll/timeline'

const Caption = ({ children }) => (
  <p className="text-glow text-center font-display text-[1.5rem] italic leading-snug text-ivory sm:text-[2.2rem] md:text-5xl">
    {children}
  </p>
)

/** Gold-arched dark panel, echoing the details frame of the reference. */
const Panel = ({ children }) => (
  <div
    className="relative mx-auto w-full max-w-4xl px-6 py-9 sm:px-12 sm:py-12"
    style={{
      background: 'linear-gradient(180deg, rgba(26,8,6,0.82), rgba(14,3,4,0.86))',
      border: '1px solid rgba(212,166,74,0.55)',
      borderRadius: '28px 28px 14px 14px',
      boxShadow: '0 0 0 4px rgba(212,166,74,0.08), 0 30px 80px rgba(0,0,0,0.6), inset 0 0 60px rgba(212,166,74,0.05)',
      backdropFilter: 'blur(3px)',
    }}
  >
    {children}
  </div>
)

export default function OverlayPlates({ wedding, onSkip, hintVisible }) {
  const hint = useRef(null)
  const bar = useRef(null)
  const skip = useRef(null)
  const dim = useRef(null)
  const finaleAt = FINALE_AT - 0.1

  useProgressTick((p) => {
    if (bar.current) bar.current.style.transform = `scaleX(${clamp01(p).toFixed(4)})`
    if (hint.current) hint.current.style.opacity = (1 - clamp01((p - 0.112) / 0.035)).toFixed(3)
    if (dim.current) dim.current.style.opacity = (0.35 * sseg(p, 0.74, 0.78)).toFixed(3)
    if (skip.current) {
      const v = clamp01((p - 0.02) / 0.03) * (1 - clamp01((p - (finaleAt - 0.05)) / 0.03))
      skip.current.style.opacity = v.toFixed(3)
      skip.current.style.pointerEvents = v > 0.5 ? 'auto' : 'none'
    }
  })

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      <div ref={dim} className="absolute inset-0 bg-black" style={{ opacity: 0 }} />
      <div className="grain" />
      <div className="absolute inset-x-0 bottom-0 h-[34vh]" style={{ background: 'linear-gradient(to top, rgba(8,1,3,0.7), rgba(8,1,3,0))' }} />

      <div ref={hint} className="absolute inset-x-0 bottom-[8vh] flex flex-col items-center gap-3 text-center" style={{ opacity: hintVisible ? 1 : 0 }}>
        <p className="label text-glow">Scroll to explore</p>
        <div className="relative h-9 w-[22px] rounded-full border border-gold/70">
          <span className="scroll-dot absolute left-1/2 top-2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-gold-light" />
        </div>
      </div>

      <Reveal from={0.09} to={0.185} className="absolute inset-x-0 bottom-[9vh] px-6">
        <Caption>{wedding.captions.entrance}</Caption>
      </Reveal>
      <Reveal from={0.255} to={0.35} className="absolute inset-x-0 bottom-[9vh] px-6">
        <Caption>{wedding.captions.pathway}</Caption>
      </Reveal>
      <Reveal from={0.435} to={0.53} className="absolute inset-x-0 bottom-[9vh] px-6">
        <Caption>{wedding.captions.stage}</Caption>
      </Reveal>

      {/* details – two beats on the dark panel */}
      <Reveal from={0.77} to={0.82} fade={0.016} className="absolute inset-0 flex items-center justify-center px-4 sm:px-8">
        <Panel>
          <InvitationPanel wedding={wedding} />
        </Panel>
      </Reveal>
      <Reveal from={0.82} to={0.855} fade={0.016} className="absolute inset-0 flex items-center justify-center overflow-y-auto px-4 py-12 sm:px-8">
        <Panel>
          <div className="flex flex-col gap-8">
            <WhenWhere wedding={wedding} />
            <div>
              <p className="label mb-4 text-center sm:text-left">Ceremony schedule</p>
              <Schedule wedding={wedding} />
            </div>
          </div>
        </Panel>
      </Reveal>

      <Reveal from={0.865} to={1} fade={0.02} interactive className="absolute inset-0 flex items-center justify-center px-6">
        <FinalPanel wedding={wedding} />
      </Reveal>

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
