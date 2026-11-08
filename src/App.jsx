import { Component, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import wedding from './config/wedding'
import { detectCapabilities } from './lib/device'
import { createMusic } from './lib/audio'
import { appState } from './lib/appState'
import { coupleNames } from './lib/format'
import { initScrollTimeline, FINALE_AT } from './scroll/timeline'
import Overlay from './ui/Overlay'
import OverlayPlates from './ui/OverlayPlates'
import PlateStage from './ui/PlateStage'
import Particles from './ui/Particles'
import Loader from './ui/Loader'
import MusicToggle from './ui/MusicToggle'
import FallbackInvitation from './ui/FallbackInvitation'

// Three.js + R3F are split into their own chunk and only fetched when 3D is used.
/** Catches any 3D crash so the page never goes blank; reports it and falls back to the photo film. */
class Boundary extends Component {
  state = { err: null }
  static getDerivedStateFromError(err) { return { err } }
  componentDidCatch(err) { console.error('3D scene crashed:', err); this.props.onCrash?.(err) }
  render() { return this.state.err ? null : this.props.children }
}
const CinematicCanvas = lazy(() => import('./scene/CinematicCanvas'))

/** Dev tool: open the site with ?export and press the button to download the whole venue as wedding-venue.glb. */
function ExportGLB() {
  const [busy, setBusy] = useState(false)
  const run = async () => {
    const scene = window.__weddingScene
    if (!scene) return
    setBusy(true)
    try {
      const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js')
      const hidden = []
      scene.traverse((o) => {
        const bad = o.isLine2 || o.isLineSegments2 || (o.material && o.material.isShaderMaterial)
        if (bad && o.visible) {
          o.visible = false
          hidden.push(o)
        }
      })
      const buf = await new GLTFExporter().parseAsync(scene, { binary: true, onlyVisible: true, maxTextureSize: 2048 })
      hidden.forEach((o) => (o.visible = true))
      const a = document.createElement('a')
      a.href = URL.createObjectURL(new Blob([buf], { type: 'model/gltf-binary' }))
      a.download = 'wedding-venue.glb'
      a.click()
    } catch (e) {
      console.error(e)
      alert('Export failed: ' + e.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <button type="button" onClick={run} className="btn-gold fixed bottom-4 left-4 z-50" style={{ padding: '0.6rem 1.1rem', fontSize: '0.62rem' }}>
      {busy ? 'Exporting…' : 'Export GLB'}
    </button>
  )
}

export default function App() {
  const caps = useMemo(detectCapabilities, [])
  const use3D = (caps.webgl || wedding.experience !== '3d') && !caps.reducedMotion

  useEffect(() => {
    document.title = `${coupleNames(wedding)} · ${wedding.occasion?.pageTitle || 'Wedding Invitation'}`
  }, [])

  if (!use3D) {
    const reason = !caps.webgl
      ? 'Your device cannot display the 3D experience, so here is the simple version of our invitation.'
      : ''
    return <FallbackInvitation wedding={wedding} reason={reason} />
  }
  return <Cinematic caps={caps} />
}

function Cinematic({ caps }) {
  const photo = wedding.experience !== '3d'
  const stageRef = useRef(null)
  const timeline = useRef(null)
  const music = useRef(null)
  const [canvasReady, setCanvasReady] = useState(photo)
  const [imgsLoaded, setImgsLoaded] = useState(0)
  const [fontsReady, setFontsReady] = useState(false)
  const [pct, setPct] = useState(4)
  const [entered, setEntered] = useState(false)
  const [muted, setMuted] = useState(false)
  const [crashed, setCrashed] = useState(null)

  // Initialize the music controller and restore session mute state.
  useEffect(() => {
    music.current = createMusic(wedding.music)
    setMuted(music.current.muted)
    return () => {
      music.current?.dispose()
    }
  }, [])

  // Fonts used by the overlays – never block longer than 4s.
  useEffect(() => {
    let done = false
    const finish = () => !done && ((done = true), setFontsReady(true))
    const t = setTimeout(finish, 4000)
    Promise.all([
      document.fonts?.load('110px "Pinyon Script"'),
      document.fonts?.load('500 22px Cinzel'),
      document.fonts?.load('italic 30px "Cormorant Garamond"'),
    ])
      .then(finish)
      .catch(finish)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!photo) return
    let n = 0
    wedding.scenes.forEach((src) => {
      const im = new Image()
      const done = () => {
        n += 1
        setImgsLoaded(n)
        if (n === wedding.scenes.length) setCanvasReady(true)
      }
      im.onload = done
      im.onerror = done
      im.src = src
    })
  }, [photo])

  const ready = canvasReady && fontsReady

  // Progress bar: eases toward 92% while loading, jumps to 100% when ready.
  useEffect(() => {
    if (ready) return setPct(100)
    if (photo) return setPct(Math.min(96, 8 + (imgsLoaded / wedding.scenes.length) * 88))
    const id = setInterval(() => setPct((p) => Math.min(92, p + (92 - p) * 0.07 + 0.4)), 120)
    return () => clearInterval(id)
  }, [ready, photo, imgsLoaded])

  // Keep the page in place until the guest enters, then refresh its pin.
  useEffect(() => {
    document.documentElement.style.overflow = entered ? '' : 'hidden'
    document.body.style.overflow = entered ? '' : 'hidden'
    if (entered && ready) requestAnimationFrame(() => timeline.current?.st.refresh())
  }, [entered, ready])

  useEffect(() => {
    timeline.current = initScrollTimeline(stageRef.current, {
      pinScreens: caps.mobile ? 12 : 10,
      initialProgress: photo ? 0 : 0.112,
    })
    return () => {
      timeline.current?.destroy()
    }
  }, [caps.mobile, photo])

  const toggleMute = useCallback(() => {
    if (!music.current) return
    const next = !music.current.muted
    music.current.setMuted(next)
    setMuted(next)
  }, [])

  const onEnter = useCallback(() => {
    appState.enteredAt = performance.now()
    music.current?.start()
    setEntered(true)
  }, [])

  const skip = useCallback(() => timeline.current?.scrollToProgress(photo ? FINALE_AT - 0.1 : FINALE_AT), [photo])

  return (
    <>
      {crashed && (
        <div style={{ position: 'fixed', left: 8, bottom: 8, zIndex: 999, maxWidth: 420, padding: '6px 10px', background: 'rgba(0,0,0,.75)', color: '#ffb4b4', font: '12px monospace' }}>
          3D scene failed: {crashed}
        </div>
      )}
      <Loader wedding={wedding} progress={pct} ready={ready} entered={entered} onEnter={onEnter} />
      {entered && <MusicToggle muted={muted} onToggle={toggleMute} />}
      {!photo && typeof location !== 'undefined' && location.search.includes('export') && <ExportGLB />}

      <main>
        <div ref={stageRef} className="relative w-full overflow-hidden bg-[#050102]" style={{ height: '100vh' }}>
          {photo || crashed ? (
            <>
              <PlateStage images={wedding.scenes} />
              <Particles low={caps.quality.tier === 'low'} />
              <OverlayPlates wedding={wedding} onSkip={skip} hintVisible={entered} />
            </>
          ) : (
            <>
              <Boundary onCrash={(e) => { setCrashed(String(e?.message || e)); setCanvasReady(true) }}>
                <Suspense fallback={null}>
                  <CinematicCanvas wedding={wedding} quality={caps.quality} mobile={caps.mobile} onReady={() => setCanvasReady(true)} />
                </Suspense>
              </Boundary>
              <Overlay wedding={wedding} onSkip={skip} hintVisible={entered} />
            </>
          )}
        </div>

        {/* Normal scrolling resumes after the film */}
        <footer className="relative z-10 px-6 py-16 text-center" style={{ background: '#050102' }}>
          <p className="gold-text font-script text-5xl">{coupleNames(wedding)}</p>
          {wedding.hashtag && <p className="mt-2 font-display text-lg italic text-ivory-dim">{wedding.hashtag}</p>}
          <button
            type="button"
            className="btn-ghost mt-8"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Watch again
          </button>
        </footer>
      </main>
    </>
  )
}
