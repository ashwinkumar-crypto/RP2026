import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { progress, sseg } from '../scroll/timeline'
import { Instanced } from './Instanced'
import { mats } from './materials'
import Chandelier from './Chandelier'
import { roseGeometry, breathGeometry, urnGeometry } from './FlowerUrn'
import { STAGE_Z, MANDAP_Z, ROSE_MIX, rng, pick, roseCluster } from './world'
import wedding from '../config/wedding'
import { ChairInstances, makeT } from './RealModels'

const STAGE_H = 0.9
const MZ = MANDAP_Z

function Throne({ position, w = 1.5, rot = 0 }) {
  return (
    <group position={position} rotation={[0, rot, 0]}>
      <mesh material={mats.gold} position={[0, 0.3, 0]}><boxGeometry args={[w, 0.34, 0.9]} /></mesh>
      <mesh material={mats.burgundy} position={[0, 0.55, 0.02]}><boxGeometry args={[w - 0.16, 0.22, 0.78]} /></mesh>
      <mesh material={mats.gold} position={[0, 1.1, -0.4]}><boxGeometry args={[w, 1.0, 0.14]} /></mesh>
      <mesh material={mats.burgundy} position={[0, 1.1, -0.32]}><boxGeometry args={[w - 0.22, 0.8, 0.1]} /></mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} material={mats.gold} position={[s * (w / 2 - 0.06), 0.72, 0]}><boxGeometry args={[0.14, 0.42, 0.86]} /></mesh>
      ))}
    </group>
  )
}

/** Chandelier, thrones, steps, rose ring and urns that complete the wedding stage. */
export default function StageExtras({ quality }) {
  const glow = useMemo(() => new THREE.MeshBasicMaterial({ color: '#000', toneMapped: false }), [])
  const data = useMemo(() => {
    const r = rng(41)
    const ring = []
    for (let i = 0; i < (quality.tier === 'high' ? 150 : 80); i++) {
      const a = (i / 150) * Math.PI * 2 + r() * 0.1
      const rad = 3.85 + r() * 0.3
      ring.push({ position: [Math.cos(a) * rad, 6.25 + r() * 0.35, MZ + Math.sin(a) * rad], color: pick(r, ROSE_MIX), scale: 1.5 + r() * 0.8 })
    }
    const urns = []
    const roses = []
    const breath = []
    ;[[-6.2, STAGE_Z - 2.6], [6.2, STAGE_Z - 2.6], [-6.2, STAGE_Z - 6.5], [6.2, STAGE_Z - 6.5]].forEach(([x, z]) => {
      urns.push({ position: [x, STAGE_H, z], scale: 1.4 })
      const c = roseCluster(r, x, STAGE_H + 0.72 * 1.4, z, 1.4, 60)
      roses.push(...c.roses)
      breath.push(...c.breath)
    })
    return { ring, urns, roses, breath }
  }, [quality.tier])

  useFrame(() => {
    const on = sseg(progress.value, 0.4, 0.58)
    glow.color.setRGB(2.3 * on, 2.0 * on, 1.5 * on)
  })

  return (
    <group>
      {/* stage steps */}
      {[0, 1, 2].map((i) => {
        const top = STAGE_H - i * 0.28
        return (
          <mesh key={i} material={mats.marble} position={[0, top / 2, STAGE_Z + 0.5 + i * 0.9]}>
            <boxGeometry args={[6.4, top, 0.9]} />
          </mesh>
        )
      })}
      {/* mandap chandelier + thrones */}
      <Chandelier position={[0, 5.55, MZ]} scale={1.25} glow={glow} chain={0.4} />
      {wedding.models?.chair ? (
        <ChairInstances
          url={wedding.models.chair}
          height={1.45}
          tint="#d83a52"
          transforms={[makeT(-0.95, STAGE_H + 0.3, MZ - 2.6, 0, 1), makeT(0.95, STAGE_H + 0.3, MZ - 2.6, 0, 1)]}
        />
      ) : (
        <>
          <Throne position={[0, STAGE_H + 0.35, MZ - 2.75]} w={2.3} />
          <Throne position={[-2.45, STAGE_H + 0.35, MZ - 2.3]} w={1.25} rot={0.35} />
          <Throne position={[2.45, STAGE_H + 0.35, MZ - 2.3]} w={1.25} rot={-0.35} />
        </>
      )}

      {/* rose ring on the mandap roof + urns on the stage */}
      <Instanced geometry={roseGeometry} material={mats.rose} items={data.ring} />
      <Instanced geometry={urnGeometry} material={mats.gold} items={data.urns} />
      <Instanced geometry={roseGeometry} material={mats.rose} items={data.roses} />
      <Instanced geometry={breathGeometry} material={mats.beads} items={data.breath} />
    </group>
  )
}
