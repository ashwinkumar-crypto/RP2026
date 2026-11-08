import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { progress, sseg, lerp } from '../scroll/timeline'
import { rng, FLOWER, BANQUET, REAL_VENUE, STAGE_Z } from './world'

const dummy = new THREE.Object3D()
const colA = new THREE.Color('#080a1c')
const colB = new THREE.Color('#1b0b0b')
const colC = new THREE.Color('#2a1008')
const tmpC = new THREE.Color()
const FOUNTAIN_COLORS = [
  [1.8, 1.26, 0.48],
  [1.55, 0.9, 0.28],
  [1.95, 1.58, 0.78],
]

/** Fog density / colour follow the story: dark & mysterious → warm golden haze. */
export function FogController() {
  useFrame(({ scene }) => {
    const p = progress.value
    const fog = scene.fog
    if (!fog) return
    const d1 = lerp(0.05, 0.02, sseg(p, 0.085, 0.115))
    fog.density = lerp(d1, 0.0105, sseg(p, 0.3, 0.62))
    tmpC.copy(colA).lerp(colB, sseg(p, 0.09, 0.2)).lerp(colC, sseg(p, 0.4, 0.7))
    fog.color.copy(tmpC)
    if (scene.background?.isColor) scene.background.copy(tmpC)
  })
  return null
}

/**
 * Falling rose & marigold petals. When `follow` is set the volume travels with the
 * camera so petals always drift around the viewer.
 */
export function Petals({ count, size, center, follow = false, intensity, speed = 0.35 }) {
  const mesh = useRef()
  const group = useRef()
  const [W, Hh, D] = size
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.12, 0.08, 3, 1)
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.pow(pos.getX(i) * 6, 2) * 0.012)
    g.computeVertexNormals()
    return g
  }, [])
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ffffff',
        roughness: 0.6,
        side: THREE.DoubleSide,
        emissive: '#2a0a08',
        emissiveIntensity: 0.3,
      }),
    [],
  )
  const seeds = useMemo(() => {
    const r = rng(count * 7 + 3)
    const colors = [...FLOWER.rose, ...FLOWER.marigold, '#fff3e0']
    return Array.from({ length: count }, () => ({
      x: (r() - 0.5) * W,
      y0: r() * Hh,
      z: (r() - 0.5) * D,
      v: 0.6 + r() * 0.9,
      ph: r() * Math.PI * 2,
      rs: 0.4 + r() * 1.4,
      color: colors[Math.floor(r() * colors.length)],
    }))
  }, [count, W, Hh, D])

  const coloured = useRef(false)

  useFrame((state) => {
    const m = mesh.current
    if (!m) return
    const p = progress.value
    const k = intensity(p)
    const n = Math.floor(count * k)
    m.count = n
    m.visible = n > 0
    if (n === 0) return
    if (!coloured.current) {
      const c = new THREE.Color()
      seeds.forEach((s, i) => m.setColorAt(i, c.set(s.color)))
      m.instanceColor.needsUpdate = true
      coloured.current = true
    }
    if (follow && group.current) group.current.position.z = Math.max(state.camera.position.z - 8, BANQUET ? -102 : -84) + center[2]
    const t = state.clock.elapsedTime * speed
    for (let i = 0; i < n; i++) {
      const s = seeds[i]
      const y = (((s.y0 - t * s.v) % Hh) + Hh) % Hh
      dummy.position.set(s.x + Math.sin(t * 2 + s.ph) * 0.55, y, s.z + Math.cos(t * 1.7 + s.ph) * 0.4)
      dummy.rotation.set(t * s.rs * 2 + s.ph, t * s.rs * 1.3, s.ph + Math.sin(t * 3 + s.ph))
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  })

  return (
    <group ref={group} position={[center[0], center[1], follow ? 0 : center[2]]}>
      <instancedMesh ref={mesh} args={[geo, mat, count]} frustumCulled={false} />
    </group>
  )
}

/** Paired cold-spark fountains line the existing route from the entrance to the stage. */
export function GoldenFountains({ quality }) {
  const sparks = useRef()
  const bases = useRef()
  const high = quality.tier === 'high'
  const perFountain = high ? 38 : 24
  const { emitters, particles } = useMemo(() => {
    const r = rng(731)
    const emitters = []
    const startZ = REAL_VENUE ? -28 : -27
    const endZ = STAGE_Z + 3
    const stations = []
    for (let z = startZ; z > endZ; z -= 5.2) stations.push(z)
    if (!stations.length || stations[stations.length - 1] - endZ > 2.6) stations.push(endZ)

    for (const z of stations) {
      for (const side of [-1, 1]) emitters.push({ x: side * 4.1, y: 0.08, z, side })
    }

    const particles = emitters.flatMap((emitter) =>
      Array.from({ length: perFountain }, () => ({
        ...emitter,
        phase: r(),
        life: 0.85 + r() * 0.9,
        rate: 0.8 + r() * 0.45,
        height: 1.7 + r() * 2.8,
        spread: 0.3 + r() * 0.9,
        radius: 0.035 + r() * 0.035,
        color: r(),
      })),
    )
    return { emitters, particles }
  }, [perFountain])

  const sparkGeometry = useMemo(() => new THREE.SphereGeometry(0.06, 6, 5), [])
  const sparkMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }),
    [],
  )
  const sparkColor = useMemo(() => new THREE.Color(), [])
  const baseGeometry = useMemo(() => new THREE.SphereGeometry(0.1, 8, 6), [])
  const baseMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#ffb52e', toneMapped: false }),
    [],
  )

  useEffect(() => {
    if (!bases.current) return
    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    emitters.forEach((emitter, i) => {
      position.set(emitter.x, emitter.y, emitter.z)
      matrix.compose(position, new THREE.Quaternion(), new THREE.Vector3(1, 0.65, 1))
      bases.current.setMatrixAt(i, matrix)
    })
    bases.current.count = emitters.length
    bases.current.instanceMatrix.needsUpdate = true
  }, [emitters])

  useFrame((state) => {
    const mesh = sparks.current
    if (!mesh) return
    const time = state.clock.elapsedTime

    if (!mesh.userData.colored) {
      particles.forEach((particle, i) => {
        const c = FOUNTAIN_COLORS[Math.floor(particle.color * FOUNTAIN_COLORS.length)]
        mesh.setColorAt(i, sparkColor.setRGB(...c))
      })
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
      mesh.userData.colored = true
    }

    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i]
      const age = (time * particle.rate + particle.phase * particle.life) % particle.life
      const t = age / particle.life
      const flicker = 0.25 + 0.75 * Math.sin(Math.PI * t)
      dummy.position.set(
        particle.x + particle.side * particle.spread * t + Math.sin(age * 13 + particle.phase * 6.28) * 0.06,
        particle.y + particle.height * 4 * t * (1 - t),
        particle.z + (t - 0.5) * 0.5 + Math.sin(age * 9 + particle.phase * 6.28) * 0.08,
      )
      dummy.rotation.set(age * 7, age * 5, particle.phase * 6.28)
      dummy.scale.setScalar((particle.radius * flicker) / 0.06)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      <instancedMesh ref={bases} args={[baseGeometry, baseMaterial, emitters.length]} frustumCulled={false} />
      <instancedMesh ref={sparks} args={[sparkGeometry, sparkMaterial, particles.length]} frustumCulled={false} />
    </>
  )
}

/** Gold dust drifting through the whole film. */
export function Dust({ quality }) {
  const n = quality.sparkles
  return (
    <>
      {/* through the hall */}
      <Sparkles count={n} scale={BANQUET ? [30, 12, 76] : [16, 8, 56]} position={BANQUET ? [0, 5, -66] : [0, 4, -58]} size={3} speed={0.3} opacity={0.8} color="#ffcf7a" noise={0.8} />
      {/* over the stage */}
      <Sparkles count={Math.round(n * 0.5)} scale={[12, 8, 14]} position={BANQUET ? [0, 4.5, -96] : [0, 4.5, -90]} size={3} speed={0.25} opacity={0.9} color="#ffe2a8" noise={0.5} />
    </>
  )
}
