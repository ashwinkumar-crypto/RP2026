import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshReflectorMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { progress, sseg } from '../scroll/timeline'
import { Instanced } from './Instanced'
import { mats } from './materials'
import Chandelier from './Chandelier'
import { urnGeometry, roseGeometry, roseLowGeometry, breathGeometry } from './FlowerUrn'
import { marbleSet, weaveSet } from './pbr'
import { makeCarpetTexture, makeArchGlowTexture } from './textures'
import {
  STATIONS, PILLAR_X, HALL_HALF, HALL_H, HALL_START, STAGE_Z,
  MARIGOLD_MIX, ROSE_MIX, rng, pick, swag, strand, roseCluster,
} from './world'

const BASE_BULB = new THREE.Color('#ffd9a0')
const BASE_GLASS = new THREE.Color('#ff9a36')

function archShape(w, h) {
  const s = new THREE.Shape()
  s.moveTo(-w / 2, 0)
  s.lineTo(-w / 2, h - w / 2)
  s.absarc(0, h - w / 2, w / 2, Math.PI, 0, true)
  s.lineTo(w / 2, 0)
  s.closePath()
  const g = new THREE.ShapeGeometry(s, 24)
  const pos = g.attributes.position
  const uv = g.attributes.uv
  for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + w / 2) / w, pos.getY(i) / h)
  return g
}

/** Scene 3 – the decorated wedding hall and pathway (z −31 → −86). */
export default function Hall({ quality }) {
  const hallLen = HALL_START - STAGE_Z // 55
  const midZ = (HALL_START + STAGE_Z) / 2
  const high = quality.tier === 'high'

  const bulbMat = useMemo(() => new THREE.MeshBasicMaterial({ color: BASE_BULB.clone().multiplyScalar(0), toneMapped: false }), [])
  const glassMat = useMemo(() => new THREE.MeshBasicMaterial({ color: BASE_GLASS.clone().multiplyScalar(0), toneMapped: false }), [])
  const crystalMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#000000', toneMapped: false }), [])
  const archMat = useMemo(() => new THREE.MeshBasicMaterial({ map: makeArchGlowTexture(), toneMapped: false, color: '#000000' }), [])

  const g = useMemo(() => {
    const carpetTex = makeCarpetTexture()
    carpetTex.wrapS = carpetTex.wrapT = THREE.RepeatWrapping
    carpetTex.repeat.set(1, hallLen / 3.6)
    const carpetTex2 = makeCarpetTexture()
    carpetTex2.wrapS = carpetTex2.wrapT = THREE.RepeatWrapping
    carpetTex2.repeat.set(1, 17 / 3.6)
    return {
      shaft: new THREE.CylinderGeometry(0.32, 0.37, 6.2, 18),
      base: new THREE.BoxGeometry(1.0, 0.5, 1.0),
      capital: new THREE.CylinderGeometry(0.62, 0.34, 0.55, 18),
      bracket: new THREE.BoxGeometry(1.25, 0.3, 1.25),
      band: new THREE.TorusGeometry(0.38, 0.05, 8, 20),
      bead: new THREE.SphereGeometry(0.12, 7, 5),
      bulb: new THREE.SphereGeometry(0.055, 5, 4),
      arch: archShape(3.7, 6.0),
      archFrame: archShape(4.15, 6.45),
      lanternBody: new THREE.BoxGeometry(0.32, 0.55, 0.32),
      lanternBase: new THREE.BoxGeometry(0.42, 0.08, 0.42),
      lanternCap: new THREE.ConeGeometry(0.3, 0.22, 4),
      lanternRing: new THREE.TorusGeometry(0.09, 0.015, 6, 12),
      petal: new THREE.CircleGeometry(0.075, 6),
      floorSet: marbleSet({ size: 512, repeat: [17, 22], tiles: 2, seed: 5 }),
      weave: weaveSet({ repeat: [3, (3 * hallLen) / 3.6] }),
      weave2: weaveSet({ repeat: [3, (3 * 17) / 3.6] }),
      carpetTex,
      carpetTex2,
    }
  }, [hallLen])

  const data = useMemo(() => {
    const r = rng(7)
    const pillars = [], bands = [], beads = [], urns = [], roses = [], breath = []
    const lanternsBody = [], lanternsBase = [], lanternsCap = [], lanternsRing = []
    const arches = [], frames = [], petals = [], fairy = []

    STATIONS.forEach((z, si) => {
      ;[-1, 1].forEach((side) => {
        const x = side * PILLAR_X
        pillars.push({ position: [x, 0, z] })
        ;[1.1, 3.6, 6.0].forEach((y) => bands.push({ position: [x, y, z], rotation: [Math.PI / 2, 0, 0] }))

        // large gold urn heaped with red roses + baby's breath
        const ux = side * (PILLAR_X - 1.0)
        urns.push({ position: [ux, 0, z], scale: 1.55 })
        const c = roseCluster(r, ux, 0.72 * 1.55, z, 1.55, high ? 80 : 46)
        roses.push(...c.roses)
        breath.push(...c.breath)

        const next = STATIONS[si + 1]
        if (next !== undefined) {
          beads.push(...swag([x, 6.5, z], [x, 6.5, next], 0.95, 16, MARIGOLD_MIX, r))
          for (let k = 1; k <= 3; k++) {
            const t = k / 4
            const sy = 6.5 - 0.95 * 4 * t * (1 - t)
            beads.push(...strand([x, sy - 0.05, z + (next - z) * t], 1.2 + r() * 1.1, 6, MARIGOLD_MIX, r, 0.9))
          }
          // lit arched bay on the wall between two pillars
          const mz = (z + next) / 2
          arches.push({ position: [side * (HALL_HALF - 0.04), 0.3, mz], rotation: [0, -side * Math.PI / 2, 0] })
          frames.push({ position: [side * (HALL_HALF - 0.06), 0.2, mz], rotation: [0, -side * Math.PI / 2, 0] })
        }
      })
      beads.push(...swag([-PILLAR_X, 6.6, z], [PILLAR_X, 6.6, z], 1.1, 30, MARIGOLD_MIX, r, 0.9))
    })

    // lantern rows flanking the carpet
    for (let z = -33; z > STAGE_Z + 1.5; z -= 2.5) {
      ;[-1, 1].forEach((side) => {
        const x = side * 2.35
        lanternsBase.push({ position: [x, 0.04, z] })
        lanternsBody.push({ position: [x, 0.36, z] })
        lanternsCap.push({ position: [x, 0.74, z], rotation: [0, Math.PI / 4, 0] })
        lanternsRing.push({ position: [x, 0.9, z] })
      })
    }

    // rose petals scattered on the floor
    for (let i = 0; i < (high ? 420 : 160); i++) {
      petals.push({
        position: [(r() * 2 - 1) * 3.4, 0.02, -26 - r() * 62],
        rotation: [-Math.PI / 2, 0, r() * 6.28],
        scale: [0.8 + r() * 0.7, 0.5 + r() * 0.4, 1],
        color: pick(r, ROSE_MIX),
      })
    }

    // dense hanging fairy-light strands over the whole hall
    const sx = high ? 0.95 : 1.7
    const sz = high ? 1.15 : 2.2
    for (let x = -(HALL_HALF - 0.9); x <= HALL_HALF - 0.9; x += sx) {
      for (let z = HALL_START - 1; z > STAGE_Z + 1; z -= sz) {
        const len = 1.0 + r() * 3.4
        const n = Math.floor(len / 0.42)
        const px = x + (r() - 0.5) * 0.5
        const pz = z + (r() - 0.5) * 0.6
        for (let k = 0; k < n; k++) fairy.push({ position: [px, HALL_H - 0.3 - k * 0.42, pz], scale: 0.8 + r() * 0.5 })
      }
    }
    return { pillars, bands, beads, urns, roses, breath, lanternsBody, lanternsBase, lanternsCap, lanternsRing, arches, frames, petals, fairy }
  }, [high])

  useFrame(() => {
    const p = progress.value
    if (floorRef.current) floorRef.current.visible = p > 0.07
    const on = sseg(p, 0.12, 0.3)
    bulbMat.color.copy(BASE_BULB).multiplyScalar(2.0 * on)
    glassMat.color.copy(BASE_GLASS).multiplyScalar(1.9 * on)
    crystalMat.color.setRGB(2.2 * on, 2.0 * on, 1.6 * on)
    archMat.color.setScalar(1.15 * on)
  })

  const floorRef = useRef()
  const floorProps = { rotation: [-Math.PI / 2, 0, 0], position: [0, 0, -46] }

  return (
    <group>
      <group ref={floorRef} visible={false}>
      {/* polished marble floor with live reflections */}
      {high ? (
        <mesh {...floorProps} receiveShadow>
          <planeGeometry args={[68, 88]} />
          <MeshReflectorMaterial
            map={g.floorSet.map}
            roughnessMap={g.floorSet.roughnessMap}
            normalMap={g.floorSet.normalMap}
            normalScale={[0.35, 0.35]}
            blur={[280, 90]}
            resolution={512}
            mixBlur={1}
            mixStrength={1.5}
            mirror={0.6}
            roughness={0.85}
            depthScale={0.5}
            minDepthThreshold={0.5}
            maxDepthThreshold={1.5}
            color="#f4e6cc"
            metalness={0.25}
          />
        </mesh>
      ) : (
        <mesh {...floorProps} receiveShadow>
          <planeGeometry args={[68, 88]} />
          <meshStandardMaterial map={g.floorSet.map} roughnessMap={g.floorSet.roughnessMap} normalMap={g.floorSet.normalMap} normalScale={[0.35, 0.35]} roughness={1} metalness={0.15} color="#f4e6cc" />
        </mesh>
      )}

      </group>

      {/* carpet runner */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, (HALL_START + STAGE_Z) / 2]}>
        <planeGeometry args={[3.6, hallLen]} />
        <meshStandardMaterial map={g.carpetTex} normalMap={g.weave.normalMap} roughnessMap={g.weave.roughnessMap} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, -22.5]}>
        <planeGeometry args={[3.6, 17]} />
        <meshStandardMaterial map={g.carpetTex2} normalMap={g.weave2.normalMap} roughnessMap={g.weave2.roughnessMap} roughness={1} />
      </mesh>
      <Instanced geometry={g.petal} material={new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.6, side: THREE.DoubleSide })} items={data.petals} />

      {/* cream-gold walls with back-lit arched bays */}
      {[-1, 1].map((s) => (
        <mesh key={s} material={mats.wallCream} position={[s * HALL_HALF, HALL_H / 2, midZ]} rotation={[0, -s * Math.PI / 2, 0]}>
          <planeGeometry args={[hallLen, HALL_H]} />
        </mesh>
      ))}
      <Instanced geometry={g.archFrame} material={mats.gold} items={data.frames} />
      <Instanced geometry={g.arch} material={archMat} items={data.arches} />
      {[-1, 1].map((s) => (
        <mesh key={'c' + s} material={mats.gold} position={[s * (HALL_HALF - 0.05), HALL_H - 0.3, midZ]}>
          <boxGeometry args={[0.12, 0.4, hallLen]} />
        </mesh>
      ))}

      {/* ceiling */}
      <mesh position={[0, HALL_H, midZ]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[HALL_HALF * 2, hallLen]} />
        <meshStandardMaterial color="#2a0d0a" roughness={0.9} emissive="#3a1208" emissiveIntensity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* pillars */}
      <Instanced geometry={g.shaft} material={mats.marble} castShadow={quality.shadows} items={data.pillars.map((p) => ({ position: [p.position[0], 3.6, p.position[2]] }))} />
      <Instanced geometry={g.base} material={mats.gold} items={data.pillars.map((p) => ({ position: [p.position[0], 0.25, p.position[2]] }))} />
      <Instanced geometry={g.capital} material={mats.gold} items={data.pillars.map((p) => ({ position: [p.position[0], 6.9, p.position[2]] }))} />
      <Instanced geometry={g.bracket} material={mats.gold} items={data.pillars.map((p) => ({ position: [p.position[0], 7.3, p.position[2]] }))} />
      <Instanced geometry={g.band} material={mats.gold} items={data.bands} />

      {/* garlands, urns, roses */}
      <Instanced geometry={roseLowGeometry} material={mats.rose} items={data.beads} />
      <Instanced geometry={urnGeometry} material={mats.gold} castShadow={quality.shadows} items={data.urns} />
      <Instanced geometry={roseGeometry} material={mats.rose} items={data.roses} castShadow={quality.shadows} />
      <Instanced geometry={breathGeometry} material={mats.beads} items={data.breath} />

      {/* lantern rows */}
      <Instanced geometry={g.lanternBase} material={mats.gold} items={data.lanternsBase} />
      <Instanced geometry={g.lanternBody} material={glassMat} items={data.lanternsBody} />
      <Instanced geometry={g.lanternCap} material={mats.gold} items={data.lanternsCap} />
      <Instanced geometry={g.lanternRing} material={mats.gold} items={data.lanternsRing} />

      {/* fairy-light canopy */}
      <Instanced geometry={g.bulb} material={bulbMat} items={data.fairy} />

      {/* chandeliers */}
      {[-42, -56, -70].map((z) => (
        <Chandelier key={z} position={[0, 6.6, z]} scale={1.5} glow={crystalMat} chain={1.6} />
      ))}
    </group>
  )
}
