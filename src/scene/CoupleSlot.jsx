import { Suspense } from 'react'
import { useGLTF } from '@react-three/drei'
import Couple from './Couple'
import { MANDAP_Z } from './world'

function CoupleModel({ url, scale = 1 }) {
  const { scene } = useGLTF(url)
  scene.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true
      o.receiveShadow = true
    }
  })
  return <primitive object={scene} position={[0, 1.31, MANDAP_Z + 1.55]} rotation={[0, Math.PI, 0]} scale={scale} />
}

/** Uses your own couple .glb (config: models.couple) if provided, otherwise the built-in figures. */
export default function CoupleSlot({ quality, modelUrl, modelScale }) {
  if (!modelUrl) return <Couple quality={quality} />
  return (
    <Suspense fallback={<Couple quality={quality} />}>
      <CoupleModel url={modelUrl} scale={modelScale || 1} />
    </Suspense>
  )
}
