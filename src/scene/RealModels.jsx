import { useLayoutEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

/** Build a transform matrix: position, yaw, uniform scale. */
export const makeT = (x, y, z, ry = 0, s = 1) =>
  new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0)), new THREE.Vector3(s, s, s))

/**
 * The real stone atrium (glTF). Its long axis (model X) is turned to run down −Z,
 * so the camera walks the nave from the gate toward the stage.
 */
export function Atrium({ url, quality, scale = 1.45, position = [0.5, 0, -60], clipZ = -43 }) {
  const { scene } = useGLTF(url)
  useMemo(() => {
    // keep only z <= clipZ: opens the gate-side end wall so the camera can walk in
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, -1), clipZ)
    scene.traverse((o) => {
      if (!o.isMesh) return
      o.castShadow = !!quality.shadows
      o.receiveShadow = true
      ;(Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
        m.envMapIntensity = 0.7
        m.clippingPlanes = [plane]
        m.clipShadows = true
        if (m.map) m.map.anisotropy = 8
      })
    })
  }, [scene, quality.shadows])
  return (
    <group position={position} rotation={[0, Math.PI / 2, 0]} scale={scale}>
      <primitive object={scene} />
    </group>
  )
}

function ChairPart({ part, transforms }) {
  const ref = useRef()
  useLayoutEffect(() => {
    const m = ref.current
    const t = new THREE.Matrix4()
    transforms.forEach((T, i) => {
      t.multiplyMatrices(T, part.matrix)
      m.setMatrixAt(i, t)
    })
    m.instanceMatrix.needsUpdate = true
  }, [part, transforms])
  return <instancedMesh ref={ref} args={[part.geometry, part.material, transforms.length]} castShadow receiveShadow frustumCulled={false} />
}

/**
 * Thousands of triangles of real velvet chair, drawn as a handful of instanced meshes.
 * The model is normalised to `height` metres, feet on y = 0, centred on x/z.
 */
export function ChairInstances({ url, transforms, height = 0.95, tint }) {
  const { scene } = useGLTF(url)
  const parts = useMemo(() => {
    scene.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const s = height / size.y
    const norm = new THREE.Matrix4()
      .makeScale(s, s, s)
      .multiply(new THREE.Matrix4().makeTranslation(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2))
    const out = []
    scene.traverse((o) => {
      if (!o.isMesh) return
      let mat = o.material
      if (tint && (mat.sheen > 0 || /velvet|fabric/i.test(mat.name || ''))) {
        mat = mat.clone()
        mat.color.set(tint)
      }
      out.push({ geometry: o.geometry, material: mat, matrix: new THREE.Matrix4().multiplyMatrices(norm, o.matrixWorld) })
    })
    return out
  }, [scene, height, tint])
  return parts.map((p, i) => <ChairPart key={i} part={p} transforms={transforms} />)
}
