import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { BANQUET_DZ } from './world'

/**
 * The supplied banquet-hall package (v3): forecourt with lamp posts, portico, reception foyer, the main hall and the
 * engagement stage, all with real doorways. Its 26 built-in lights are dropped (far too many for real-time) and the
 * scroll-driven Lighting component takes over.
 */
export default function HallBanquet({ url, quality }) {
  const { scene } = useGLTF(url)
  const hall = useMemo(() => {
    const root = scene.clone(true)
    const lights = []
    root.traverse((o) => {
      if (o.isLight) lights.push(o)
      if (!o.isMesh) return
      o.castShadow = false
      o.receiveShadow = false
      ;(Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
        m.envMapIntensity = 0.55
        if (m.map) m.map.anisotropy = quality.tier === 'high' ? 8 : 4
      })
    })
    lights.forEach((l) => l.parent?.remove(l))
    return root
  }, [scene, quality.tier])
  return <primitive object={hall} position={[0, 0, BANQUET_DZ]} />
}
