import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshReflectorMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { progress, sseg } from '../scroll/timeline'
import { Instanced } from './Instanced'
import { mats } from './materials'
import { Atrium, ChairInstances, makeT } from './RealModels'
import { urnGeometry, roseGeometry, breathGeometry } from './FlowerUrn'
import { makeCarpetTexture } from './textures'
import { marbleSet, weaveSet } from './pbr'
import Chandelier from './Chandelier'
import { rng, roseCluster, STAGE_Z } from './world'

const SCALE = 1.45
const CZ = -60
const NEAR = CZ + 15.37 * SCALE - 0.0 // 'start' of the atrium (toward the gate), world z (negative)
const START = -37.7
const END = -80.9
const BASE_BULB = new THREE.Color('#ffd9a0')
const BASE_GLASS = new THREE.Color('#ff9a36')

/** Scene 3 with a real stone atrium: decorated carpet, guest chairs, lanterns, rose urns, string-light canopy. */
export default function HallReal({ wedding, quality }) {
  const high = quality.tier === 'high'
  const bulbMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#000', toneMapped: false }), [])
  const glassMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#000', toneMapped: false }), [])
  const floorRef = useRef()
  const crystalMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#000', toneMapped: false }), [])

  const g = useMemo(() => {
    const len = START - END
    const carpet = makeCarpetTexture()
    carpet.wrapS = carpet.wrapT = THREE.RepeatWrapping
    carpet.repeat.set(1, 68 / 3.6)
    return {
      floorA: marbleSet({ size: 512, repeat: [18, 9], tiles: 2, seed: 5 }),
      weave: weaveSet({ repeat: [3, (3 * 68) / 3.6] }),
      carpet,
      bulb: new THREE.SphereGeometry(0.06, 6, 5),
      lanternBody: new THREE.BoxGeometry(0.32, 0.55, 0.32),
      lanternBase: new THREE.BoxGeometry(0.42, 0.08, 0.42),
      lanternCap: new THREE.ConeGeometry(0.3, 0.22, 4),
      lanternRing: new THREE.TorusGeometry(0.09, 0.015, 6, 12),
      petal: new THREE.CircleGeometry(0.075, 6),
      len,
    }
  }, [])

  const data = useMemo(() => {
    const r = rng(17)
    const urns = [], roses = [], breath = [], petals = [], bulbs = []
    const lb = [], lbase = [], lcap = [], lring = []
    const chairs = []

    for (let z = -44; z > STAGE_Z + 4; z -= 4) {
      ;[-1, 1].forEach((side) => {
        const ux = side * 2.75
        urns.push({ position: [ux, 0, z], scale: 1.35 })
        const c = roseCluster(r, ux, 0.8 * 1.35, z, 1.35, high ? 70 : 40)
        roses.push(...c.roses)
        breath.push(...c.breath)
      })
    }
    for (let z = -33; z > STAGE_Z + 1.5; z -= 2.5) {
      ;[-1, 1].forEach((side) => {
        const x = side * 2.25
        lbase.push({ position: [x, 0.04, z] })
        lb.push({ position: [x, 0.36, z] })
        lcap.push({ position: [x, 0.74, z], rotation: [0, Math.PI / 4, 0] })
        lring.push({ position: [x, 0.9, z] })
      })
    }
    for (let i = 0; i < (high ? 420 : 160); i++) {
      petals.push({
        position: [(r() * 2 - 1) * 3.4, 0.02, -26 + (STAGE_Z + 3 + 26) * r()],
        rotation: [-Math.PI / 2, 0, r() * 6.28],
        scale: [0.8 + r() * 0.7, 0.5 + r() * 0.4, 1],
        color: ['#b3122f', '#c8102e', '#fff1e2', '#a30f28'][Math.floor(r() * 4)],
      })
    }
    // strings of lights criss-crossing the open nave (anchored on the gallery edges)
    for (let z = -41; z > STAGE_Z + 3; z -= 2.4) {
      const n = high ? 46 : 26
      const yH = 9.4 + (Math.floor(-z / 2.4) % 2) * 0.5
      for (let i = 0; i <= n; i++) {
        const t = i / n
        bulbs.push({ position: [-7.4 + 14.8 * t, yH - 1.5 * 4 * t * (1 - t), z], scale: 0.9 + r() * 0.3 })
      }
    }
    // guest chairs facing the stage
    for (let z = -46; z > STAGE_Z + 5; z -= 1.7) {
      ;[-1, 1].forEach((side) => {
        for (let k = 0; k < 3; k++) {
          const x = side * (3.5 + k * 1.1) + (r() - 0.5) * 0.06
          chairs.push(makeT(x, 0, z + (r() - 0.5) * 0.06, Math.PI + (r() - 0.5) * 0.08, 1))
        }
      })
    }
    return { urns, roses, breath, petals, bulbs, lb, lbase, lcap, lring, chairs }
  }, [high])

  useFrame(() => {
    const p = progress.value
    const on = sseg(p, 0.12, 0.3)
    bulbMat.color.copy(BASE_BULB).multiplyScalar(2.0 * on)
    glassMat.color.copy(BASE_GLASS).multiplyScalar(1.9 * on)
    crystalMat.color.setRGB(1.5 * on, 1.35 * on, 1.05 * on)
    if (floorRef.current) floorRef.current.visible = p > 0.07
  })

  const floorMat = (
    <MeshReflectorMaterial
      map={g.floorA.map} roughnessMap={g.floorA.roughnessMap} normalMap={g.floorA.normalMap} normalScale={[0.35, 0.35]}
      blur={[280, 90]} resolution={512} mixBlur={1} mixStrength={1.4} mirror={0.55} roughness={0.85}
      depthScale={0.5} minDepthThreshold={0.5} maxDepthThreshold={1.5} color="#f4e6cc" metalness={0.25}
    />
  )

  return (
    <group>
      <Atrium url={wedding.models.venue} quality={quality} scale={SCALE} position={[0.5, 0, CZ]} />

      {/* forecourt floors either side of the atrium */}
      <group ref={floorRef} visible={false}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, (-2 - 43.4) / 2]} receiveShadow>
          <planeGeometry args={[68, 41.4]} />
          {high ? floorMat : <meshStandardMaterial map={g.floorA.map} roughnessMap={g.floorA.roughnessMap} normalMap={g.floorA.normalMap} roughness={1} metalness={0.15} color="#f4e6cc" />}
        </mesh>
      </group>

      {/* carpet runner from the gate to the stage */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, -36]} receiveShadow>
        <planeGeometry args={[3.2, 68]} />
        <meshStandardMaterial map={g.carpet} normalMap={g.weave.normalMap} roughnessMap={g.weave.roughnessMap} roughness={1} />
      </mesh>
      <Instanced geometry={g.petal} material={new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.6, side: THREE.DoubleSide })} items={data.petals} />

      {/* real velvet chairs */}
      <ChairInstances url={wedding.models.chair} transforms={data.chairs} height={0.95} tint="#d83a52" />

      {/* rose urns, lanterns */}
      <Instanced geometry={urnGeometry} material={mats.gold} castShadow={quality.shadows} items={data.urns} />
      <Instanced geometry={roseGeometry} material={mats.rose} items={data.roses} />
      <Instanced geometry={breathGeometry} material={mats.beads} items={data.breath} />
      <Instanced geometry={g.lanternBase} material={mats.gold} items={data.lbase} />
      <Instanced geometry={g.lanternBody} material={glassMat} items={data.lb} />
      <Instanced geometry={g.lanternCap} material={mats.gold} items={data.lcap} />
      <Instanced geometry={g.lanternRing} material={mats.gold} items={data.lring} />

      {/* string lights over the nave */}
      <Instanced geometry={g.bulb} material={bulbMat} items={data.bulbs} />
      {[-47, -56].map((z) => (
        <Chandelier key={z} position={[0, 8.6, z]} scale={1.25} glow={crystalMat} chain={2.2} />
      ))}
    </group>
  )
}
