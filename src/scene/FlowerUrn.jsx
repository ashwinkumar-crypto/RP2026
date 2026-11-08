import { useMemo } from 'react'
import * as THREE from 'three'
import { Instanced } from './Instanced'
import { mats } from './materials'
import { rng, roseCluster } from './world'
import { makeRose } from './pbr'

export const urnGeometry = new THREE.LatheGeometry(
  [[0.01, 0], [0.24, 0], [0.27, 0.035], [0.15, 0.09], [0.11, 0.19], [0.19, 0.3], [0.33, 0.44], [0.35, 0.54], [0.29, 0.65], [0.31, 0.72], [0.36, 0.78], [0.3, 0.8], [0.01, 0.78]].map(([x, y]) => new THREE.Vector2(x, y)),
  28,
)
export const roseGeometry = makeRose(1)
export const roseLowGeometry = makeRose(0).scale(0.55, 0.55, 0.55)
export const breathGeometry = new THREE.IcosahedronGeometry(0.045, 0)

/** A standalone gold urn overflowing with red roses (used at the palace gate). */
export default function FlowerUrn({ position, scale = 1, seed = 5 }) {
  const { roses, breath } = useMemo(() => roseCluster(rng(seed), 0, 0.8, 0, 1.0, 110), [seed])
  return (
    <group position={position} scale={scale}>
      <mesh geometry={urnGeometry} material={mats.gold} />
      <Instanced geometry={roseGeometry} material={mats.rose} items={roses} />
      <Instanced geometry={breathGeometry} material={mats.beads} items={breath} />
    </group>
  )
}
