import { useMemo } from 'react'
import * as THREE from 'three'
import { Instanced } from './Instanced'
import { mats } from './materials'

/** Crystal-and-gold chandelier. `glow` is a shared MeshBasicMaterial so the scene can fade it in. */
export default function Chandelier({ position, scale = 1, glow, chain = 3 }) {
  const g = useMemo(() => {
    const drops = []
    const tiers = [
      { r: 1.15, y: 0, n: 30, len: 0.55 },
      { r: 0.8, y: 0.55, n: 20, len: 0.5 },
      { r: 0.45, y: 1.05, n: 12, len: 0.42 },
    ]
    tiers.forEach((t) => {
      for (let i = 0; i < t.n; i++) {
        const a = (i / t.n) * Math.PI * 2
        drops.push({ position: [Math.cos(a) * t.r, -t.y - t.len * 0.5, Math.sin(a) * t.r], scale: [1, t.len / 0.1, 1] })
        drops.push({ position: [Math.cos(a) * t.r * 0.82, -t.y - 0.07, Math.sin(a) * t.r * 0.82], scale: 0.7 })
      }
    })
    const bulbs = []
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      bulbs.push({ position: [Math.cos(a) * 1.15, 0.18, Math.sin(a) * 1.15], scale: 1.4 })
    }
    return { drops, bulbs, drop: new THREE.SphereGeometry(0.05, 5, 4), bulb: new THREE.SphereGeometry(0.09, 7, 5) }
  }, [])

  return (
    <group position={position} scale={scale}>
      <mesh material={mats.gold} position={[0, chain / 2 + 0.7, 0]}>
        <cylinderGeometry args={[0.03, 0.03, chain, 6]} />
      </mesh>
      <mesh material={mats.gold} position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.12, 0.28, 1.3, 10]} />
      </mesh>
      {[1.15, 0.8, 0.45].map((r, i) => (
        <mesh key={r} material={mats.gold} position={[0, -[0, 0.55, 1.05][i], 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r, 0.035, 8, 40]} />
        </mesh>
      ))}
      <mesh material={mats.gold} position={[0, 0.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.15, 0.05, 8, 40]} />
      </mesh>
      <mesh material={mats.gold} position={[0, 0.85, 0]}>
        <sphereGeometry args={[0.22, 12, 10]} />
      </mesh>
      <Instanced geometry={g.drop} material={glow} items={g.drops} />
      <Instanced geometry={g.bulb} material={glow} items={g.bulbs} />
    </group>
  )
}
