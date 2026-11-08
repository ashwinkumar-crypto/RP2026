/**
 * Background music manager for the Engagement Experience.
 *
 * Requirements met:
 *  - Continuous background music looping throughout all sections.
 *  - Audio extracted from the supplied track (MP3 primary with MP4 fallback).
 *  - Smooth fade-in on start (1.6s) and smooth fade-out on stop/mute (0.8s).
 *  - Strict singleton: prevents duplicate audio instances across renders/sections.
 *  - Uninterrupted playback while scrolling between all invitation scenes.
 *  - Session persistence: remembers mute preference in sessionStorage.
 *  - Browser autoplay compatibility: attempts immediate playback, falls back to
 *    listening for first user interaction (pointerdown, touchstart, scroll, click).
 *  - Graceful fallback to procedural raga-style drone if media files are unavailable.
 */

const SESSION_KEY = 'wedding_music_muted'

function getSavedMuteState() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

function saveMuteState(muted) {
  try {
    sessionStorage.setItem(SESSION_KEY, muted ? '1' : '0')
  } catch {}
}

// Fallback procedural raga ambience
const BHUPALI = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0]
const PHRASES = [
  [0, 1, 2, 4, 2, 1, 0],
  [2, 3, 4, 5, 4, 3, 2],
  [4, 3, 2, 1, 2, 0],
  [0, 2, 3, 4, 5, 7, 5, 4],
  [5, 4, 3, 2, 3, 4, 2, 1, 0],
]

function makeImpulse(ctx, seconds, decay) {
  const len = Math.floor(ctx.sampleRate * seconds)
  const buf = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay)
  }
  return buf
}

class AudioController {
  constructor(options = {}) {
    this.primarySrc = options.src || '/audio/background-music.mp3'
    this.fallbackSrc = options.fallbackSrc || '/audio/background-music.mp4'
    this.targetVolume = options.volume ?? 0.65
    this.muted = getSavedMuteState()
    this.started = false
    this.audio = null
    this.ctx = null
    this.masterGain = null
    this.synthTimer = null
    this.fadeRaf = 0
    this.pendingGesture = false
    this.interactionListenersAttached = false

    this.onUserGesture = this.onUserGesture.bind(this)
    this.onVisibility = this.onVisibility.bind(this)
    document.addEventListener('visibilitychange', this.onVisibility)
  }

  initAudioElement() {
    if (this.audio) return this.audio

    const audio = new Audio()
    audio.preload = 'auto'
    audio.loop = true
    audio.volume = 0

    // Sources: primary mp3, then mp4
    const src1 = document.createElement('source')
    src1.src = this.primarySrc
    src1.type = 'audio/mpeg'
    audio.appendChild(src1)

    const src2 = document.createElement('source')
    src2.src = this.fallbackSrc
    src2.type = 'audio/mp4'
    audio.appendChild(src2)

    audio.addEventListener('error', (e) => {
      console.warn('Audio element error, falling back to procedural synthesizer:', e)
      this.startSynth()
    }, { once: true })

    this.audio = audio
    return audio
  }

  start() {
    if (this.started) return
    this.started = true

    if (this.muted) {
      // User preferred muted in this session; initialize ready but keep silent
      return
    }

    this.playWithAutoplayFallback()
  }

  playWithAutoplayFallback() {
    const el = this.initAudioElement()
    el.volume = 0

    const playPromise = el.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.removeGestureListeners()
          this.fadeTo(this.targetVolume, 1600)
        })
        .catch((err) => {
          // Autoplay policy prevented playback
          if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
            this.attachGestureListeners()
          } else {
            console.warn('Audio play failed, starting fallback synth:', err)
            this.startSynth()
          }
        })
    }
  }

  attachGestureListeners() {
    if (this.interactionListenersAttached) return
    this.interactionListenersAttached = true
    const events = ['pointerdown', 'touchstart', 'click', 'keydown', 'scroll', 'wheel']
    events.forEach((evt) => {
      window.addEventListener(evt, this.onUserGesture, { once: true, passive: true, capture: true })
    })
  }

  removeGestureListeners() {
    if (!this.interactionListenersAttached) return
    this.interactionListenersAttached = false
    const events = ['pointerdown', 'touchstart', 'click', 'keydown', 'scroll', 'wheel']
    events.forEach((evt) => {
      window.removeEventListener(evt, this.onUserGesture, { capture: true })
    })
  }

  onUserGesture() {
    this.removeGestureListeners()
    if (!this.muted && this.started) {
      if (this.audio) {
        this.audio.play()
          .then(() => this.fadeTo(this.targetVolume, 1600))
          .catch(() => this.startSynth())
      } else if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume()
      }
    }
  }

  fadeTo(dest, duration = 1000) {
    cancelAnimationFrame(this.fadeRaf)
    const el = this.audio
    if (!el) {
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime)
        this.masterGain.gain.setTargetAtTime(dest, this.ctx.currentTime, duration / 3000)
      }
      return
    }

    const startVol = el.volume
    const startTime = performance.now()
    const diff = dest - startVol

    if (Math.abs(diff) < 0.005) {
      el.volume = Math.max(0, Math.min(1, dest))
      if (dest === 0 && this.muted) el.pause()
      return
    }

    const step = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / duration)
      // Ease-out curve for natural volume adjustment
      const eased = 1 - Math.pow(1 - progress, 2)
      const current = startVol + diff * eased
      el.volume = Math.max(0, Math.min(1, current))

      if (progress < 1) {
        this.fadeRaf = requestAnimationFrame(step)
      } else {
        el.volume = Math.max(0, Math.min(1, dest))
        if (dest === 0 && this.muted) {
          el.pause()
        }
      }
    }

    this.fadeRaf = requestAnimationFrame(step)
  }

  setMuted(mute) {
    this.muted = !!mute
    saveMuteState(this.muted)

    if (this.muted) {
      this.fadeTo(0, 800)
    } else {
      if (!this.started) {
        this.start()
      } else {
        if (this.audio) {
          if (this.audio.paused) {
            this.audio.play()
              .then(() => this.fadeTo(this.targetVolume, 1200))
              .catch(() => this.attachGestureListeners())
          } else {
            this.fadeTo(this.targetVolume, 1200)
          }
        } else if (this.masterGain && this.ctx) {
          if (this.ctx.state === 'suspended') this.ctx.resume()
          this.masterGain.gain.setTargetAtTime(this.targetVolume, this.ctx.currentTime, 0.4)
        }
      }
    }
  }

  startSynth() {
    if (this.ctx) return
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    try {
      this.ctx = new AC()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = 0
      this.masterGain.connect(this.ctx.destination)

      const verb = this.ctx.createConvolver()
      verb.buffer = makeImpulse(this.ctx, 3.2, 2.4)
      const wet = this.ctx.createGain()
      wet.gain.value = 0.5
      verb.connect(wet)
      wet.connect(this.masterGain)

      const dry = this.ctx.createGain()
      dry.gain.value = 0.7
      dry.connect(this.masterGain)

      this.bus = this.ctx.createGain()
      this.bus.connect(dry)
      this.bus.connect(verb)

      // Drone notes
      ;[130.81, 196.0, 261.63].forEach((f, i) => {
        const o = this.ctx.createOscillator()
        o.type = i === 2 ? 'sine' : 'triangle'
        o.frequency.value = f
        const g = this.ctx.createGain()
        g.gain.value = 0.04
        o.connect(g)
        g.connect(this.bus)
        o.start()
      })

      const target = this.muted ? 0 : this.targetVolume
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 1.4)
    } catch (e) {
      console.warn('Synth creation error:', e)
    }
  }

  onVisibility() {
    if (document.hidden) {
      if (this.audio && !this.audio.paused) {
        this.audio.pause()
      }
      if (this.ctx && this.ctx.state === 'running') {
        this.ctx.suspend()
      }
    } else {
      if (this.started && !this.muted) {
        if (this.audio && this.audio.paused) {
          this.audio.play().catch(() => {})
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume()
        }
      }
    }
  }

  dispose() {
    this.removeGestureListeners()
    document.removeEventListener('visibilitychange', this.onVisibility)
    cancelAnimationFrame(this.fadeRaf)
    if (this.audio) {
      this.audio.pause()
      this.audio.src = ''
      this.audio = null
    }
    if (this.ctx) {
      this.ctx.close().catch(() => {})
      this.ctx = null
    }
    this.started = false
  }
}

let activeInstance = null

export function createMusic(config = {}) {
  if (!activeInstance) {
    activeInstance = new AudioController(config)
  }
  return activeInstance
}

export function getMusic() {
  return activeInstance
}
