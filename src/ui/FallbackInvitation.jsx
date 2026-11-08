import { useEffect, useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { WhenWhere, Schedule, ActionButtons, Ornament } from './sections'
import { dateParts } from '../lib/format'
import { GaneshaEmblem, HangingLamp, FestiveThoranam, BananaLeaf } from './TraditionalMotifs'
import { createMusic } from '../lib/audio'
import MusicToggle from './MusicToggle'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-10% 0px' },
  transition: { duration: 0.8 },
}

/**
 * Traditional South Indian Engagement Invitation experience for 2D devices,
 * mobile fallback, or reduced motion.
 */
export default function FallbackInvitation({ wedding, reason }) {
  const d = dateParts(wedding.date)
  const musicRef = useRef(null)
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    musicRef.current = createMusic(wedding.music)
    musicRef.current.start()
    return () => musicRef.current?.dispose()
  }, [wedding.music])

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      musicRef.current?.setMuted(!prev)
      return !prev
    })
  }, [])

  return (
    <main
      className="relative min-h-screen overflow-x-hidden text-center"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, #4a0b1e 0%, #1a0409 55%, #0b0205 100%)',
      }}
    >
      <div className="grain" />
      <MusicToggle muted={muted} onToggle={toggleMute} />

      {/* Decorative Hanging Lamps on Left & Right */}
      <div className="pointer-events-none fixed left-4 top-4 z-20 hidden md:block lg:left-8">
        <HangingLamp height={150} />
      </div>
      <div className="pointer-events-none fixed right-16 top-4 z-20 hidden md:block lg:right-20">
        <HangingLamp height={150} />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-20">
        <GaneshaEmblem size={84} className="mb-4 drop-shadow-lg" />
        {wedding.invocation && (
          <p className="mb-3 font-display text-xl tracking-wider text-gold-light sm:text-2xl">
            {wedding.invocation}
          </p>
        )}
        <FestiveThoranam className="my-3 opacity-90" />
        <p className="label mb-2 text-gold-light tracking-[0.24em]">
          {wedding.occasion?.ofLine || 'THE ENGAGEMENT CELEBRATION OF'}
        </p>

        {/* Groom & Bride in calligraphy */}
        <h1 className="gold-text font-script text-[3.4rem] leading-[1] sm:text-[5.5rem]">
          {wedding.groom.fullName || wedding.groom.firstName}
        </h1>
        <p className="font-display text-2xl italic text-gold-light sm:text-3xl">&amp;</p>
        <h1 className="gold-text font-script text-[3.4rem] leading-[1] sm:text-[5.5rem]">
          {wedding.bride.fullName || wedding.bride.firstName}
        </h1>

        <Ornament className="my-6" />

        <p className="font-cinzel text-xl uppercase tracking-[0.26em] text-ivory sm:text-2xl">
          {d.day} {d.month} {d.year}
        </p>
        <p className="mt-1 font-display text-lg italic text-gold-light sm:text-xl">
          {wedding.day || d.weekday} · {wedding.timeDisplay || '10:30 AM to 12:00 PM'}
        </p>

        {reason && (
          <p className="mt-8 max-w-sm font-display text-xs italic text-ivory-dim">
            {reason}
          </p>
        )}
      </section>

      {/* Invitation Message & Families */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-16">
        <motion.div {...fadeUp} className="rounded-3xl border border-gold/40 bg-black/40 p-6 backdrop-blur-md sm:p-10">
          <p className="label mb-4 text-gold-light tracking-[0.2em]">WITH JOY &amp; BLESSINGS</p>
          <p className="font-display text-2xl italic leading-snug text-ivory sm:text-3xl">
            "{wedding.invitationMessage}"
          </p>
          <Ornament className="my-6" />
          <div className="grid gap-6 sm:grid-cols-2">
            {wedding.families.map((f) => (
              <div key={f.label} className="rounded-xl border border-gold/30 bg-black/30 p-4">
                <p className="label mb-1.5 text-gold-light" style={{ fontSize: '0.66rem', letterSpacing: '0.18em' }}>
                  {f.label}
                </p>
                <p className="font-display text-xl text-ivory">{f.names}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* When, Where & Location QR */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 py-16">
        <motion.div {...fadeUp}>
          <WhenWhere wedding={wedding} />
        </motion.div>
      </section>

      {/* Ceremony Schedule */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-16">
        <motion.div {...fadeUp} className="rounded-3xl border border-gold/30 bg-black/30 p-6 backdrop-blur-md sm:p-10">
          <p className="label mb-6 text-gold-light tracking-[0.24em]">CEREMONY SCHEDULE</p>
          <Schedule wedding={wedding} />
        </motion.div>
      </section>

      {/* Closing Message */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-28 pt-12">
        <motion.div {...fadeUp}>
          <p className="label mb-3 text-gold-light tracking-[0.24em]">OUR FOREVER BEGINS</p>
          <h2 className="gold-text font-script text-6xl">Thank You</h2>
          <p className="mx-auto mt-4 max-w-lg font-display text-2xl italic leading-relaxed text-ivory">
            "{wedding.closingMessage || wedding.thankYou}"
          </p>
          <ActionButtons wedding={wedding} className="mt-8" />
          {wedding.hashtag && (
            <p className="mt-8 font-script text-4xl text-gold-light">{wedding.hashtag}</p>
          )}
        </motion.div>
      </section>
    </main>
  )
}
