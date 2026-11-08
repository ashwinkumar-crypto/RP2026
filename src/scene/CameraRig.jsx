import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { progress, sseg, lerp } from '../scroll/timeline'
import { sampleCamera } from '../scroll/cameraPath'
import { BANQUET } from '../scene/world'

/** Binds the camera's position, rotation and FOV to the scroll timeline. */
export default function CameraRig({ mobile }) {
  const { camera, size } = useThree()
  const pos = useRef(new THREE.Vector3())
  const look = useRef(new THREE.Vector3())
  const pointer = useRef({ x: 0, y: 0, sx: 0, sy: 0 })

  useEffect(() => {
    if (mobile) return
    const move = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [mobile])

  useFrame((state, delta) => {
    const p = progress.value
    const t = state.clock.elapsedTime
    const aspect = size.width / size.height
    const portrait = aspect < 1

    sampleCamera(p, pos.current, look.current)

    const k = 1 - Math.exp(-4 * delta)
    pointer.current.sx += (pointer.current.x - pointer.current.sx) * k
    pointer.current.sy += (pointer.current.y - pointer.current.sy) * k

    camera.position.copy(pos.current)
    // handheld breathing – barely perceptible, keeps the frame alive
    camera.position.x += Math.sin(t * 0.45) * 0.035 + pointer.current.sx * 0.18
    camera.position.y += Math.sin(t * 0.62) * 0.022 + pointer.current.sy * 0.08
    look.current.x += pointer.current.sx * 0.5
    look.current.y += pointer.current.sy * 0.22
    camera.lookAt(look.current)

    // slow "dolly-zoom" feel on the couple reveal; wider lens in portrait
    const baseFov = portrait ? 62 : BANQUET ? 50 : 45
    const fov = baseFov - (portrait ? 3 : 6) * sseg(p, 0.62, 0.8)
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }
  })

  return null
}
