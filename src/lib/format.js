const parse = (iso) => new Date(`${iso}T00:00:00Z`)

export function longDate(iso) {
  return parse(iso).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function dateParts(iso) {
  const d = parse(iso)
  const opt = (o) => d.toLocaleDateString('en-GB', { ...o, timeZone: 'UTC' })
  return {
    weekday: opt({ weekday: 'long' }),
    day: d.getUTCDate(),
    month: opt({ month: 'long' }),
    year: d.getUTCFullYear(),
  }
}

export function formatTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  const ap = h >= 12 ? 'PM' : 'AM'
  const hh = ((h + 11) % 12) + 1
  return `${hh}:${String(m).padStart(2, '0')} ${ap}`
}

export function venueLine(venue) {
  return [venue.hall, venue.name, venue.city].filter(Boolean).join(', ')
}

export function mapsUrl(venue) {
  if (venue.mapsUrl) return venue.mapsUrl
  const q = [venue.hall, venue.name, venue.address, venue.city].filter(Boolean).join(', ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
}

export function daysUntil(iso) {
  const now = new Date()
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((parse(iso).getTime() - today) / 86400000)
}

export function coupleNames(w) {
  return `${w.groom.firstName} & ${w.bride.firstName}`
}

export function coupleFullNames(w) {
  return `${w.groom.fullName || w.groom.firstName} & ${w.bride.fullName || w.bride.firstName}`
}
