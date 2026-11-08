import { useLayoutEffect, useRef, useMemo } from 'react'
import * as THREE from 'three'
import { makeGlowTexture } from './textures'

const dummy = new THREE.Object3D()
const tmp = new THREE.Color()

/**
 * Thin wrapper around InstancedMesh. `items` is an array of
 * { position, rotation, scale, color } – one draw call for the whole set.
 */
export function Instanced({ geometry, material, items, castShadow = false, receiveShadow = false }) {
  const ref = useRef()
  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    items.forEach((it, i) => {
      dummy.position.set(...(it.position || [0, 0, 0]))
      dummy.rotation.set(...(it.rotation || [0, 0, 0]))
      const s = it.scale ?? 1
      Array.isArray(s) ? dummy.scale.set(...s) : dummy.scale.setScalar(s)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      if (it.color !== undefined) {
        tmp.set(it.color)
        mesh.setColorAt(i, tmp)
      }
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [items])

  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, Math.max(1, items.length)]}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      frustumCulled={false}
    />
  )
}

let glowTex
const getGlow = () => (glowTex ||= makeGlowTexture())

/**
 * Additive glow sprites for lamps, flames and fairy-lights. Cheap: one draw call.
 * `positions` is a flat array [x,y,z,x,y,z…].
 */
export function GlowPoints({ positions, size = 0.5, color = '#ffd28a', opacity = 0.9, pointsRef }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
    return g
  }, [positions])
  const map = getGlow()
  return (
    <points ref={pointsRef} geometry={geo} frustumCulled={false}>
      <pointsMaterial
        map={map}
        size={size}
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
        toneMapped={false}
      />
    </points>
  )
}
