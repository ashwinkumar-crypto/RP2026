/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE WEDDING JOURNEY — central configuration
 *  Source of truth for the Engagement celebration of Rahul Gandhi A M & Padmasri S R.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const wedding = {
  // ── Occasion wording ───────────────────────────────────────────────────────
  occasion: {
    journeyTitle: 'The Engagement Journey',
    ofLine: 'The engagement celebration of',
    pageTitle: 'Rahul Gandhi & Padmasri · Engagement Invitation',
    calendarTitle: 'Engagement Celebration of',
  },

  // ── The couple ────────────────────────────────────────────────────────────
  bride: {
    firstName: 'Padmasri',
    initials: 'S R',
    fullName: 'Padmasri S R',
    parents: 'Daughter of Mr. Rangaiyan S & Mrs. Alamelu M',
  },
  groom: {
    firstName: 'Rahul Gandhi',
    initials: 'A M',
    fullName: 'Rahul Gandhi A M',
    parents: 'Son of Mr. Alagumoorthi G & Mrs. Kavitha A',
  },

  // ── Date & time ───────────────────────────────────────────────────────────
  date: '2026-12-13', // Sunday, 13 December 2026
  day: 'Sunday',
  time: '10:30', // 10:30 AM
  endTime: '12:00', // 12:00 PM
  timeDisplay: '10:30 AM to 12:00 PM',

  // ── Venue ─────────────────────────────────────────────────────────────────
  venue: {
    name: 'Hotel Ram International',
    hall: 'Ramya Hall',
    address: 'Ramya Hall, Hotel Ram International',
    city: 'Puducherry, India',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Hotel+Ram+International+Ramya+Hall',
  },

  // ── Words ─────────────────────────────────────────────────────────────────
  invocation: '॥ श्री गणेशाय नमः ॥',
  tamilInvocation: '॥ ஸ்ரீ கணேசாய நமஹ ॥',
  inviteLine: 'Together with our families',
  requestLine: 'we invite you to share in the joy of our engagement celebration',
  invitationMessage:
    'Together with our families, we invite you to share in the joy of our engagement celebration.',
  closingMessage:
    'Your presence will make our joy complete.',

  // Subtitles that appear during the journey (Scenes 2, 3 and 4)
  captions: {
    entrance: 'Step into a celebration of love',
    pathway: 'Walk the path of blessings',
    stage: 'Where two hearts exchange rings',
  },

  families: [
    {
      label: 'Family of the Groom',
      names: 'Mr. Alagumoorthi G & Mrs. Kavitha A',
      father: 'Mr. Alagumoorthi G',
      mother: 'Mrs. Kavitha A',
    },
    {
      label: 'Family of the Bride',
      names: 'Mr. Rangaiyan S & Mrs. Alamelu M',
      father: 'Mr. Rangaiyan S',
      mother: 'Mrs. Alamelu M',
    },
  ],

  schedule: [
    { time: '10:00', title: 'Auspicious Welcome', note: 'Nadaswaram & guest reception' },
    { time: '10:30', title: 'Muhurtham & Ring Ceremony', note: 'Traditional engagement rituals' },
    { time: '11:30', title: 'Blessings & Felicitations', note: 'Greetings from family and elders' },
    { time: '12:00', title: 'Grand Engagement Feast', note: 'Traditional feast at Ramya Hall' },
  ],

  thankYou: 'Your presence will make our joy complete.',
  hashtag: '#RahulAndPadmasri',
  tagline: 'Forever Starts Here',

  // ── Experience ────────────────────────────────────────────────────────────
  experience: '3d',
  scenes: [
    '/scenes/02-palace.jpg',
    '/scenes/03-pathway.jpg',
    '/scenes/04-stage.jpg',
    '/scenes/05-couple.jpg',
    '/scenes/06-details.jpg',
  ],

  // 3D models (BANQUET-HALL-V3)
  models: {
    venue: '/models/banquet_hall_v3.glb',
    chair: '/models/chair.glb',
    couple: '',
    coupleScale: 1,
  },

  photos: {
    couple: '',
  },

  music: {
    src: '/audio/background-music.mp3',
    fallbackSrc: '/audio/background-music.mp4',
    volume: 0.65,
  },
}

export default wedding
