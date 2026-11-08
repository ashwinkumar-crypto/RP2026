import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { progress, sseg } from '../scroll/timeline'
import { Instanced, GlowPoints } from './Instanced'
import { mats } from './materials'
import { makeRangoliTexture } from './textures'
import PalaceExtras from './PalaceExtras'
import { roseLowGeometry } from './FlowerUrn'
import { GATE_Z, DOOR_W, DOOR_H, MARIGOLD_MIX, rng, swag, strand } from './world'

const WALL_Z = GATE_Z
const FRONT = WALL_Z + 0.6 // front face of the wall

function archPath(w, h) {
  const p = new THREE.Path()
  const hw = w / 2
  p.moveTo(-hw, 0)
  p.lineTo(-hw, h)
  p.absarc(0, h, hw, Math.PI, 0, true)
  p.lineTo(hw, 0)
  p.lineTo(-hw, 0)
  return p
}

function leafShape(dir, w, h) {
  // hinge at local x = 0, leaf extends toward +x (dir = 1) or −x (dir = −1)
  const hw = (w / 2) * dir
  const s = new THREE.Shape()
  s.moveTo(0, 0)
  s.lineTo(hw, 0)
  s.lineTo(hw, h + w / 2)
  s.absarc(hw, h, w / 2, Math.PI / 2, dir === 1 ? Math.PI : 0, dir !== 1)
  s.lineTo(0, 0)
  return s
}

function archWindowGeo(w, h) {
  const s = new THREE.Shape()
  s.moveTo(-w / 2, 0)
  s.lineTo(-w / 2, h)
  s.absarc(0, h, w / 2, Math.PI, 0, true)
  s.lineTo(w / 2, 0)
  s.closePath()
  return new THREE.ShapeGeometry(s)
}

function Chhatri({ position, r = 1.2 }) {
  return (
    <group position={position}>
      <mesh material={mats.marble} position={[0, 0.08, 0]}>
        <cylinderGeometry args={[r + 0.2, r + 0.25, 0.16, 24]} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2
        return (
          <mesh key={i} material={mats.marble} position={[Math.cos(a) * r * 0.82, 0.8, Math.sin(a) * r * 0.82]}>
            <cylinderGeometry args={[0.09, 0.11, 1.4, 10]} />
          </mesh>
        )
      })}
      <mesh material={mats.marble} position={[0, 1.55, 0]} scale={[1, 0.55, 1]}>
        <sphereGeometry args={[r, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh material={mats.gold} position={[0, 1.55 + r * 0.55 + 0.12, 0]}>
        <coneGeometry args={[0.07, 0.5, 8]} />
      </mesh>
      <mesh material={mats.gold} position={[0, 1.55 + r * 0.55 - 0.02, 0]}>
        <sphereGeometry args={[0.12, 10, 8]} />
      </mesh>
    </group>
  )
}

function Tower({ x }) {
  return (
    <group position={[x, 0, WALL_Z + 0.2]}>
      <mesh material={mats.sandstone} position={[0, 7.5, 0]}>
        <cylinderGeometry args={[1.5, 1.7, 15, 24]} />
      </mesh>
      {[3, 7, 11].map((y) => (
        <mesh key={y} material={mats.gold} position={[0, y, 0]}>
          <torusGeometry args={[1.62, 0.07, 8, 28]} />
        </mesh>
      ))}
      {[3, 7, 11].map((y) => (
        <mesh key={'r' + y} material={mats.gold} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.62, 0.07, 8, 28]} />
        </mesh>
      ))}
      <Chhatri position={[0, 15, 0]} r={1.5} />
    </group>
  )
}

export default function Palace() {
  const doorL = useRef()
  const doorR = useRef()
  const lampPts = useRef()
  const winMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#150808', toneMapped: false }), [])

  const g = useMemo(() => {
    const wall = new THREE.Shape()
    wall.moveTo(-12, 0)
    wall.lineTo(12, 0)
    wall.lineTo(12, 14)
    wall.lineTo(-12, 14)
    wall.closePath()
    wall.holes.push(archPath(DOOR_W, DOOR_H))
    const wallGeo = new THREE.ExtrudeGeometry(wall, { depth: 1.2, bevelEnabled: false })
    wallGeo.translate(0, 0, -0.6)

    const ring = new THREE.Shape()
    const outer = archPath(DOOR_W + 1.8, DOOR_H)
    ring.setFromPoints(outer.getPoints(24))
    ring.holes.push(archPath(DOOR_W, DOOR_H))
    const ringGeo = new THREE.ExtrudeGeometry(ring, { depth: 0.3, bevelEnabled: false })
    ringGeo.translate(0, 0, -0.15)

    const leafL = new THREE.ExtrudeGeometry(leafShape(1, DOOR_W, DOOR_H), { depth: 0.22, bevelEnabled: false })
    leafL.translate(0, 0, -0.11)
    const leafR = new THREE.ExtrudeGeometry(leafShape(-1, DOOR_W, DOOR_H), { depth: 0.22, bevelEnabled: false })
    leafR.translate(0, 0, -0.11)

    return {
      wallGeo,
      ringGeo,
      leafL,
      leafR,
      win: archWindowGeo(0.9, 1.5),
      winBig: archWindowGeo(1.1, 1.9),
      bead: new THREE.SphereGeometry(0.13, 7, 5),
      stud: new THREE.SphereGeometry(0.075, 8, 6),
      merlon: new THREE.BoxGeometry(0.9, 1.0, 0.8),
      rangoli: makeRangoliTexture(),
    }
  }, [])

  const items = useMemo(() => {
    const r = rng(11)
    // studs on each door leaf (local coords, hinge at x=0)
    const studs = []
    for (let row = 0; row < 6; row++)
      for (let col = 0; col < 4; col++) studs.push({ position: [0.5 + col * 0.62, 0.7 + row * 0.8, 0.13] })

    const merlons = []
    for (let x = -10.8; x <= 10.8; x += 1.6) merlons.push({ position: [x, 14.5, WALL_Z] })

    // marigold garlands: arch + hanging strands + door-side drops
    const beads = []
    const cx = 0
    const cy = DOOR_H
    const R = DOOR_W / 2 + 1.15
    const n = 44
    const archPts = []
    for (let i = 0; i <= n; i++) {
      const a = Math.PI - (i / n) * Math.PI
      archPts.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R])
    }
    archPts.forEach(([x, y], i) => {
      beads.push({ position: [x, y, FRONT + 0.2], color: MARIGOLD_MIX[Math.floor(r() * MARIGOLD_MIX.length)], scale: 1.1 })
      if (i % 3 === 0 && y < cy + 2.2)
        beads.push(...strand([x, y - 0.1, FRONT + 0.2], 1.0 + r() * 1.3, 6, MARIGOLD_MIX, r, 0.95))
    })
    ;[-1, 1].forEach((s) => {
      beads.push(...strand([s * (DOOR_W / 2 + 1.35), DOOR_H, FRONT + 0.25], 4.6, 24, MARIGOLD_MIX, r, 1.05))
      beads.push(...strand([s * (DOOR_W / 2 + 1.7), DOOR_H - 0.3, FRONT + 0.25], 3.6, 18, MARIGOLD_MIX, r, 0.95))
    })
    // swag across the top of the facade
    beads.push(...swag([-9.5, 13.0, FRONT + 0.15], [-3.4, 13.0, FRONT + 0.15], 0.9, 20, MARIGOLD_MIX, r))
    beads.push(...swag([3.4, 13.0, FRONT + 0.15], [9.5, 13.0, FRONT + 0.15], 0.9, 20, MARIGOLD_MIX, r))

    const studsR = studs.map((s) => ({ position: [-s.position[0], s.position[1], s.position[2]] }))
    return { studs, studsR, merlons, beads }
  }, [])

  const lampPositions = useMemo(
    () => [
      -4.9, 3.4, FRONT + 0.6, 4.9, 3.4, FRONT + 0.6,
      -4.9, 2.2, FRONT + 0.6, 4.9, 2.2, FRONT + 0.6,
      -3, 12.3, FRONT + 0.4, 0, 12.8, FRONT + 0.4, 3, 12.3, FRONT + 0.4,
    ],
    [],
  )

  useFrame((state) => {
    const p = progress.value
    const open = sseg(p, 0.125, 0.235)
    const a = open * 1.8
    if (doorL.current) doorL.current.rotation.y = a
    if (doorR.current) doorR.current.rotation.y = -a

    // windows warm up as the palace is "lit" during the flash
    const lit = sseg(p, 0.09, 0.15)
    winMat.color.setRGB(0.08 + 1.0 * lit, 0.04 + 0.7 * lit, 0.02 + 0.32 * lit)
    if (lampPts.current) lampPts.current.material.opacity = 0.9 * lit * (0.88 + Math.sin(state.clock.elapsedTime * 7) * 0.08)
  })

  const winPositions = [
    [-6.2, 5.2], [-9.2, 5.2], [6.2, 5.2], [9.2, 5.2],
    [-6.2, 9.6], [-9.2, 9.6], [6.2, 9.6], [9.2, 9.6],
  ]

  return (
    <group>
      {/* facade */}
      <mesh geometry={g.wallGeo} material={mats.sandstone} position={[0, 0, WALL_Z]} castShadow={false} />
      <mesh geometry={g.ringGeo} material={mats.gold} position={[0, 0, FRONT + 0.1]} />

      {/* carved panel with three windows above the arch */}
      <mesh material={mats.sandstoneLight} position={[0, 10.9, FRONT + 0.15]}>
        <boxGeometry args={[7, 3.2, 0.3]} />
      </mesh>
      <mesh material={mats.gold} position={[0, 12.58, FRONT + 0.2]}>
        <boxGeometry args={[7.2, 0.14, 0.34]} />
      </mesh>
      <mesh material={mats.gold} position={[0, 9.3, FRONT + 0.2]}>
        <boxGeometry args={[7.2, 0.14, 0.34]} />
      </mesh>
      {[-2.1, 0, 2.1].map((x) => (
        <mesh key={x} geometry={g.winBig} position={[x, 9.6, FRONT + 0.32]}>
          <meshBasicMaterial color="#ffcf7a" toneMapped={false} />
        </mesh>
      ))}

      {/* glowing arch windows */}
      {winPositions.map(([x, y], i) => (
        <mesh key={i} geometry={g.win} material={winMat} position={[x, y, FRONT + 0.02]} />
      ))}
      {winPositions.map(([x, y], i) => (
        <mesh key={'f' + i} position={[x, y + 0.9, FRONT + 0.004]} material={mats.gold}>
          <boxGeometry args={[1.14, 2.0, 0.02]} />
        </mesh>
      ))}

      {/* parapet */}
      <Instanced geometry={g.merlon} material={mats.sandstone} items={items.merlons} />

      {/* domes & towers */}
      <Chhatri position={[0, 14, WALL_Z]} r={1.7} />
      <Chhatri position={[-6.5, 14, WALL_Z]} r={1.15} />
      <Chhatri position={[6.5, 14, WALL_Z]} r={1.15} />
      <Tower x={-12.4} />
      <Tower x={12.4} />

      {/* doors */}
      <group ref={doorL} position={[-DOOR_W / 2, 0, WALL_Z - 0.05]}>
        <mesh geometry={g.leafL} material={mats.wood} />
        <Instanced geometry={g.stud} material={mats.gold} items={items.studs} />
        <mesh material={mats.gold} position={[DOOR_W / 2 - 0.04, DOOR_H / 2, 0.14]}>
          <boxGeometry args={[0.08, DOOR_H, 0.05]} />
        </mesh>
        <mesh material={mats.gold} position={[DOOR_W / 2 - 0.45, 2.5, 0.16]}>
          <torusGeometry args={[0.24, 0.035, 10, 24]} />
        </mesh>
        <mesh material={mats.gold} position={[DOOR_W / 2 - 0.45, 2.74, 0.14]}>
          <sphereGeometry args={[0.1, 10, 8]} />
        </mesh>
      </group>
      <group ref={doorR} position={[DOOR_W / 2, 0, WALL_Z - 0.05]}>
        <mesh geometry={g.leafR} material={mats.wood} />
        <Instanced geometry={g.stud} material={mats.gold} items={items.studsR} />
        <mesh material={mats.gold} position={[-DOOR_W / 2 + 0.04, DOOR_H / 2, 0.14]}>
          <boxGeometry args={[0.08, DOOR_H, 0.05]} />
        </mesh>
        <mesh material={mats.gold} position={[-DOOR_W / 2 + 0.45, 2.5, 0.16]}>
          <torusGeometry args={[0.24, 0.035, 10, 24]} />
        </mesh>
        <mesh material={mats.gold} position={[-DOOR_W / 2 + 0.45, 2.74, 0.14]}>
          <sphereGeometry args={[0.1, 10, 8]} />
        </mesh>
      </group>

      {/* marigold garlands */}
      <Instanced geometry={roseLowGeometry} material={mats.rose} items={items.beads} />

      {/* lamps flanking the entrance */}
      {[-4.9, 4.9].map((x) => (
        <group key={x} position={[x, 0, FRONT + 0.6]}>
          <mesh material={mats.gold} position={[0, 1.6, 0]}>
            <cylinderGeometry args={[0.05, 0.08, 3.2, 10]} />
          </mesh>
          <mesh material={mats.gold} position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.3, 0.36, 0.2, 16]} />
          </mesh>
          <mesh material={mats.gold} position={[0, 3.25, 0]}>
            <cylinderGeometry args={[0.32, 0.12, 0.25, 16]} />
          </mesh>
        </group>
      ))}
      <GlowPoints pointsRef={lampPts} positions={lampPositions} size={1.6} />

      <PalaceExtras />

      {/* rangoli at the threshold */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, FRONT + 3.4]}>
        <planeGeometry args={[6.4, 6.4]} />
        <meshBasicMaterial map={g.rangoli} transparent depthWrite={false} toneMapped={false} opacity={0.95} />
      </mesh>
    </group>
  )
}
