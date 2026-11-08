import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { progress, sseg } from '../scroll/timeline'
import { Instanced } from './Instanced'
import { mats } from './materials'
import FlowerUrn from './FlowerUrn'
import { GATE_Z, DOOR_W, DOOR_H, foldedPlane } from './world'

const FRONT = GATE_Z + 0.6
const BASE = new THREE.Color('#ffd9a0')

/** Outline lights, red tie-back drapes and rose urns that dress the palace gate. */
export default function PalaceExtras() {
  const bulbMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#000', toneMapped: false }), [])
  const geo = useMemo(() => ({ bulb: new THREE.SphereGeometry(0.075, 6, 5), drape: foldedPlane(2.4, 6.6, 5, 0.16, 40) }), [])

  const bulbs = useMemo(() => {
    const out = []
    const z = FRONT + 0.42
    // arch outline
    const R = DOOR_W / 2 + 0.72
    for (let i = 0; i <= 40; i++) {
      const a = Math.PI - (i / 40) * Math.PI
      out.push({ position: [Math.cos(a) * R, DOOR_H + Math.sin(a) * R, z] })
    }
    // roof line + facade edges
    for (let x = -11.4; x <= 11.4; x += 0.7) out.push({ position: [x, 13.9, z - 0.1] })
    ;[-11.6, 11.6].forEach((x) => { for (let y = 0.4; y < 13.6; y += 0.7) out.push({ position: [x, y, z - 0.1] }) })
    // tower rings
    ;[-12.4, 12.4].forEach((tx) =>
      [3, 7, 11].forEach((y) => {
        for (let i = 0; i < 18; i++) {
          const a = (i / 18) * Math.PI * 2
          out.push({ position: [tx + Math.cos(a) * 1.7, y, GATE_Z + 0.2 + Math.sin(a) * 1.7] })
        }
      }),
    )
    // dome rims
    ;[[0, 1.7], [-6.5, 1.15], [6.5, 1.15]].forEach(([cx, r]) => {
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2
        out.push({ position: [cx + Math.cos(a) * (r + 0.25), 14.18, GATE_Z + Math.sin(a) * (r + 0.25)] })
      }
    })
    return out
  }, [])

  useFrame(() => {
    const on = sseg(progress.value, 0.085, 0.15)
    bulbMat.color.copy(BASE).multiplyScalar(2.6 * on)
  })

  return (
    <group>
      <Instanced geometry={geo.bulb} material={bulbMat} items={bulbs} />
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={geo.drape} material={mats.burgundy} position={[s * (DOOR_W / 2 + 1.55), 3.5, FRONT + 0.38]} />
      ))}
      <FlowerUrn position={[-7.4, 0, FRONT + 1.6]} scale={2.1} seed={3} />
      <FlowerUrn position={[7.4, 0, FRONT + 1.6]} scale={2.1} seed={9} />
    </group>
  )
}
