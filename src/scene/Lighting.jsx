import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { progress, sseg, lerp } from '../scroll/timeline'
import { introFactor } from '../lib/appState'
import { MANDAP_Z, STAGE_Z, REAL_VENUE, BANQUET } from './world'

/** A soft, shadow-casting key light that rides ahead of the camera: pillars and urns cast real shadows on the marble. */
function ShadowKey() {
  const ref = useRef()
  useFrame(({ camera }) => {
    const l = ref.current
    if (!l) return
    const p = progress.value
    l.position.set(0, 8.4, camera.position.z - 3)
    l.target.position.set(0, 0, camera.position.z - 24)
    l.target.updateMatrixWorld()
    l.intensity = 340 * sseg(p, 0.14, 0.28) * (1 - sseg(p, 0.6, 0.7))
  })
  return (
    <spotLight ref={ref} color="#ffd6a0" angle={0.75} penumbra={1} distance={56} decay={1.5} castShadow
      shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-normalBias={0.03} shadow-camera-near={2} shadow-camera-far={56} />
  )
}

/**
 * Every light is driven by the timeline so the mood changes with the scroll:
 * the entrance lights rising → a golden hall →
 * a spotlight on the couple.
 */
const K = BANQUET ? 0.6 : 1 // the banquet hall brings its own bright interior
export default function Lighting({ quality }) {
  const amb = useRef()
  const env = useRef()
  const gate = useRef()
  const inner = useRef()
  const pathLights = [useRef(), useRef(), useRef(), useRef()]
  const stageL = useRef()
  const spot = useRef()
  const rim = useRef()
  const fill = useRef()

  useEffect(() => {
    if (!spot.current) return
    spot.current.target.position.set(0, 1.6, MANDAP_Z + 1.5)
    spot.current.target.updateMatrixWorld()
  }, [])

  useFrame(() => {
    const p = progress.value
    const intro = introFactor()
    amb.current.intensity = (BANQUET ? 0.6 : 1) * (0.3 + intro * 0.15 + 0.65 * sseg(p, 0.1, 0.5) + 0.1 * sseg(p, 0.6, 0.9))
    env.current.intensity = 70 * intro * (1 - sseg(p, 0.088, 0.108))
    gate.current.intensity = K * 300 * sseg(p, 0.09, 0.14) * (1 - sseg(p, 0.26, 0.3))
    inner.current.intensity = K * 220 * sseg(p, 0.13, 0.23)
    pathLights.forEach((r, i) => {
      r.current.intensity = K * 170 * sseg(p, 0.17 + i * 0.01, 0.3)
    })
    stageL.current.intensity = K * 200 * sseg(p, 0.38, 0.58)
    spot.current.intensity = K * lerp(60, 150, sseg(p, 0.6, 0.74)) * sseg(p, 0.3, 0.55)
    rim.current.intensity = K * 150 * sseg(p, 0.6, 0.76)
    fill.current.intensity = K * 70 * sseg(p, 0.55, 0.72)
  })

  return (
    <>
      {quality.shadows && <ShadowKey />}
      <ambientLight ref={amb} color="#ffd2a1" intensity={0.6} />
      <pointLight ref={env} position={[0.8, 2.4, 3.8]} color="#ffdcaa" distance={18} decay={2} />
      <pointLight ref={gate} position={[0, BANQUET ? 6 : 5, BANQUET ? -24 : -22]} color="#ffc27a" distance={34} decay={2} />
      <pointLight ref={inner} position={[0, 5.5, BANQUET ? -38 : -36]} color="#ffcf8a" distance={42} decay={2} />
      {(BANQUET ? [-52, -64, -76, -88] : REAL_VENUE ? [-44, -50, -56, -62] : [-46, -58, -70, -80]).map((z, i) => (
        <pointLight key={z} ref={pathLights[i]} position={[0, BANQUET ? 9 : 6.2, z]} color="#ffc47c" distance={28} decay={2} />
      ))}
      <pointLight ref={stageL} position={[0, 6.5, STAGE_Z - 2]} color="#ffd9a8" distance={30} decay={2} />
      <spotLight
        ref={spot}
        position={[0, 9, MANDAP_Z + 8.5]}
        angle={0.55}
        penumbra={0.9}
        distance={32}
        decay={1.8}
        color="#fff0d2"
        castShadow={quality.shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0006}
      />
      <pointLight ref={rim} position={[0, 3.5, MANDAP_Z - (BANQUET ? 1.2 : 5.5)]} color="#ff9a55" distance={16} decay={2} />
      <pointLight ref={fill} position={[0, 3.2, MANDAP_Z + 9]} color="#ffd9aa" distance={22} decay={2} />
    </>
  )
}
