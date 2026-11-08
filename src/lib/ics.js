const esc = (s) => String(s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n')

/** Downloads an .ics calendar file for the engagement (floating local time). */
export function downloadICS(w) {
  const d = w.date.replace(/-/g, '')
  const t = (hhmm) => hhmm.replace(':', '') + '00'
  const loc = [w.venue.hall, w.venue.name, w.venue.address, w.venue.city].filter(Boolean).join(', ')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Engagement Journey//EN',
    'BEGIN:VEVENT',
    `UID:${d}-rahul-gandhi-padmasri@wedding-journey`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${d}T${t(w.time)}`,
    `DTEND:${d}T${t(w.endTime || '12:00')}`,
    `SUMMARY:${esc(`${w.occasion?.calendarTitle || 'Engagement Celebration of'} ${w.groom.fullName || w.groom.firstName} & ${w.bride.fullName || w.bride.firstName}`)}`,
    `LOCATION:${esc(loc)}`,
    `DESCRIPTION:${esc(`${w.invitationMessage}\n\n${w.closingMessage || ''}\n\nVenue: ${loc}`)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'engagement-invitation.ics'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
