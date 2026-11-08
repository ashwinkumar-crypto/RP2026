import { Suspense, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerformanceMonitor, Environment, Stars } from '@react-three/drei'
import Effects from './Effects'
import * as THREE from 'three'
import CameraRig from './CameraRig'
import Lighting from './Lighting'
import Palace from './Palace'
import Hall from './Hall'
import HallReal from './HallReal'
import HallBanquet from './HallBanquet'
import Stage from './Stage'
import CoupleSlot from './CoupleSlot'
import { FogController, GoldenFountains, Petals, Dust } from './Atmosphere'
import { progress, sseg } from '../scroll/timeline'
import { MANDAP_Z, BANQUET } from './world'
import { publicAsset } from '../lib/publicAsset'

/** Calls onReady after the first few frames so the loader knows shaders are warm. */
function ReadySignal({ onReady }) {
  const frames = useRef(0)
  useFrame(() => {
    frames.current++
    if (frames.current === 6) onReady?.()
  })
  return null
}

/** Makes the scene reachable for the GLB export button (?export in the URL). */
function ExposeScene() {
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)
  window.__weddingScene = scene
  window.__weddingCamera = camera
  return null
}

/** Scene 1 → 7 as one continuous world. UI lives elsewhere. */
export default function CinematicCanvas({ wedding, quality, mobile, onReady }) {
  const [dpr, setDpr] = useState(quality.dpr)

  return (
    <Canvas
      className="!absolute inset-0"
      dpr={dpr}
      shadows={quality.shadows ? 'soft' : false}
      gl={{ antialias: quality.antialias, powerPreference: 'high-performance', alpha: false, stencil: false }}
      camera={{ fov: 45, near: 0.1, far: 170, position: [0, 0.35, 6.8] }}
      onCreated={({ gl, scene }) => {
        gl.localClippingEnabled = true
        gl.toneMapping = THREE.NoToneMapping // tone-mapping is done in <Effects/>
        scene.background = new THREE.Color('#080a1c')
        scene.fog = new THREE.FogExp2('#080a1c', 0.05)
      }}
    >
      <PerformanceMonitor
        onDecline={() => setDpr([1, 1])}
        flipflops={3}
        onFallback={() => setDpr(1)}
      />
      <Suspense fallback={null}>
        <CameraRig mobile={mobile} />
        <FogController />
        <Lighting quality={quality} />

        {!BANQUET && <Palace />}
        {BANQUET ? (
          <HallBanquet url={wedding.models.venue} quality={quality} />
        ) : wedding.models?.venue ? (
          <HallReal wedding={wedding} quality={quality} />
        ) : (
          <Hall quality={quality} />
        )}
        {!BANQUET && <Stage quality={quality} />}
        <CoupleSlot quality={quality} modelUrl={wedding.models?.couple} modelScale={wedding.models?.coupleScale} />

        <Dust quality={quality} />
        <GoldenFountains quality={quality} />
        <Stars radius={140} depth={30} count={quality.tier === 'high' ? 1800 : 700} factor={4} fade speed={0.4} />
        <Environment files={publicAsset('/hdri/lobby.exr')} environmentIntensity={0.55} environmentRotation={[0, Math.PI, 0]} />
        <ExposeScene />
        {/* petals that travel with the camera through the hall */}
        <Petals
          count={quality.petals}
          size={[14, 8.5, 20]}
          center={[0, 0, 0]}
          follow
          intensity={(p) => sseg(p, 0.09, 0.12) * (1 - sseg(p, 0.8, 0.86))}
        />
        {/* petal shower over the couple */}
        <Petals
          count={Math.round(quality.petals * 0.8)}
          size={[10, 9.5, 12]}
          center={[0, 0.8, MANDAP_Z + 1]}
          speed={0.3}
          intensity={(p) => sseg(p, 0.63, 0.68) * (1 - sseg(p, 0.82, 0.88)) * 0.85}
        />
        <ReadySignal onReady={onReady} />
      </Suspense>
      <Effects quality={quality} />
    </Canvas>
  )
}
