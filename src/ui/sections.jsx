import { dateParts, formatTime, longDate, mapsUrl, venueLine, daysUntil, coupleFullNames } from '../lib/format'
import { downloadICS } from '../lib/ics'
import { GaneshaEmblem, HangingLamp, FestiveThoranam, TraditionalSeparator, BananaLeaf } from './TraditionalMotifs'

export function Ornament({ className = '' }) {
  return <TraditionalSeparator className={className} />
}

/** Family invitation message + both families with traditional South Indian styling (Scene 6, part 1). */
export function InvitationPanel({ wedding }) {
  const photo = wedding.photos?.couple

  return (
    <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 text-center text-glow sm:px-6">
      {/* Decorative Hanging Lamps on Left & Right */}
      <div className="pointer-events-none absolute -left-2 top-0 hidden md:block lg:-left-12">
        <HangingLamp height={130} />
      </div>
      <div className="pointer-events-none absolute -right-2 top-0 hidden md:block lg:-right-12">
        <HangingLamp height={130} />
      </div>

      {/* Lord Ganesha Motif at top */}
      <GaneshaEmblem size={74} className="mb-2 drop-shadow-md" />

      {/* Sacred Invocation */}
      {wedding.invocation && (
        <p className="mb-1 font-display text-lg tracking-wider text-gold-light sm:text-xl">
          {wedding.invocation}
        </p>
      )}

      {/* Thoranam Garland Accent */}
      <FestiveThoranam className="my-2.5 opacity-90" />

      {/* Invitation Message */}
      <p className="label mb-2 text-gold-light tracking-[0.22em]">
        ENGAGEMENT CELEBRATION
      </p>
      <p className="max-w-2xl font-display text-[1.2rem] italic leading-snug text-ivory sm:text-[1.65rem] md:text-[1.85rem]">
        "{wedding.invitationMessage}"
      </p>

      {/* Couple Calligraphy Highlight */}
      <div className="my-4 flex flex-col items-center">
        <h2 className="gold-text font-script text-[2.8rem] leading-none sm:text-[4.2rem]">
          {wedding.groom.fullName || wedding.groom.firstName}
        </h2>
        <span className="font-display text-2xl italic text-gold-light sm:text-3xl">&amp;</span>
        <h2 className="gold-text font-script text-[2.8rem] leading-none sm:text-[4.2rem]">
          {wedding.bride.fullName || wedding.bride.firstName}
        </h2>
      </div>

      <TraditionalSeparator className="my-4" />

      {/* Family Details Grid */}
      <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-8">
        {wedding.families.map((f) => (
          <div
            key={f.label}
            className="rounded-2xl border border-gold/30 bg-black/30 p-4 backdrop-blur-sm transition-colors hover:border-gold/60"
          >
            <p className="label mb-1.5 text-gold-light" style={{ fontSize: '0.66rem', letterSpacing: '0.18em' }}>
              {f.label}
            </p>
            <p className="font-display text-lg text-ivory sm:text-xl">
              {f.names}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Date, time, and venue details (Scene 6, part 2). */
export function WhenWhere({ wedding, link = true }) {
  const d = dateParts(wedding.date)

  return (
    <div className="grid items-center gap-8 text-center sm:grid-cols-2 sm:gap-6 sm:text-left">
      {/* Date & Time Column */}
      <div className="rounded-2xl border border-gold/30 bg-black/30 p-5 backdrop-blur-sm sm:col-span-1">
        <p className="label mb-2 text-gold-light">Date &amp; Day</p>
        <p className="font-display text-[2.2rem] leading-none text-ivory sm:text-4xl">
          {d.day} <span className="gold-text">{d.month}</span>
        </p>
        <p className="mt-1 font-display text-lg text-ivory-dim sm:text-xl">
          {wedding.day || d.weekday}, {d.year}
        </p>
        <div className="mt-3 inline-block rounded-full border border-gold/40 bg-gold/10 px-3 py-1 font-cinzel text-xs tracking-[0.16em] text-gold-light">
          {wedding.timeDisplay || '10:30 AM TO 12:00 PM'}
        </div>
      </div>

      {/* Venue & Hall Column */}
      <div className="rounded-2xl border border-gold/30 bg-black/30 p-5 backdrop-blur-sm sm:col-span-1">
        <p className="label mb-2 text-gold-light">Venue &amp; Hall</p>
        <p className="font-display text-2xl font-semibold leading-tight text-ivory sm:text-3xl">
          {wedding.venue.name}
        </p>
        {wedding.venue.hall && (
          <p className="mt-1 font-cinzel text-sm tracking-wider text-gold-light">
            {wedding.venue.hall}
          </p>
        )}
        <p className="mt-1 font-display text-sm text-ivory-dim sm:text-base">
          {venueLine(wedding.venue)}
        </p>
        {link && (
          <a
            href={mapsUrl(wedding.venue)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block font-cinzel text-[0.72rem] uppercase tracking-[0.2em] text-gold-light underline decoration-gold/50 underline-offset-4 transition hover:text-gold"
          >
            Open in Google Maps ?
          </a>
        )}
      </div>
    </div>
  )
}

export function Schedule({ wedding }) {
  return (
    <ol className="mx-auto w-full max-w-lg">
      {wedding.schedule.map((s, i) => (
        <li key={i} className="relative flex gap-4 border-l border-gold/40 pb-4 pl-6 last:pb-0">
          <span className="absolute -left-[5px] top-[0.55rem] h-[10px] w-[10px] rotate-45 border border-gold-light bg-gold" aria-hidden="true" />
          <span className="w-[5.2rem] shrink-0 pt-[0.15rem] font-cinzel text-[0.75rem] font-medium tracking-[0.12em] text-gold-light">
            {formatTime(s.time)}
          </span>
          <span>
            <span className="block font-display text-lg font-medium leading-tight text-ivory sm:text-xl">{s.title}</span>
            {s.note && <span className="block font-display text-sm italic text-ivory-dim sm:text-base">{s.note}</span>}
          </span>
        </li>
      ))}
    </ol>
  )
}

export function ActionButtons({ wedding, className = '' }) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-3 ${className}`}>
      <a className="btn-gold" href={mapsUrl(wedding.venue)} target="_blank" rel="noopener noreferrer">
        Open in Google Maps
      </a>
      <button type="button" className="btn-ghost" onClick={() => downloadICS(wedding)}>
        Add to Calendar
      </button>
    </div>
  )
}

/** Closing message + Maps + calendar (Scene 7). */
export function FinalPanel({ wedding }) {
  const days = daysUntil(wedding.date)

  return (
    <div className="relative mx-auto flex max-w-2xl flex-col items-center px-4 text-center text-glow sm:px-6">
      {/* Decorative Hanging Lamps */}
      <div className="pointer-events-none absolute -left-4 top-4 hidden sm:block md:-left-12">
        <HangingLamp height={120} />
      </div>
      <div className="pointer-events-none absolute -right-4 top-4 hidden sm:block md:-right-12">
        <HangingLamp height={120} />
      </div>

      <p className="label mb-2 text-gold-light tracking-[0.24em]">WITH LOVE &amp; GRATITUDE</p>
      <h2 className="gold-text font-script text-[3.2rem] leading-[1.05] sm:text-[4.8rem]">
        Thank You
      </h2>
      <p className="mt-3 max-w-xl font-display text-[1.35rem] italic leading-snug text-ivory sm:text-[1.65rem]">
        "{wedding.closingMessage || wedding.thankYou}"
      </p>

      <TraditionalSeparator className="my-5" />

      <ActionButtons wedding={wedding} />

      <p className="mt-6 font-cinzel text-[0.72rem] uppercase tracking-[0.3em] text-ivory-dim">
        {days > 1
          ? `${days} days to go`
          : days === 1
          ? 'Tomorrow is the day'
          : days === 0
          ? 'Today is the celebration'
          : 'With love & gratitude'}
      </p>

      {wedding.hashtag && (
        <p className="mt-2 font-script text-3xl text-gold-light sm:text-4xl">
          {wedding.hashtag}
        </p>
      )}
    </div>
  )
}
