import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { progress, sseg, lerp } from '../scroll/timeline'
import { Instanced, GlowPoints } from './Instanced'
import { mats } from './materials'
import { makeBackdropTexture } from './textures'
import StageExtras from './StageExtras'
import { roseLowGeometry } from './FlowerUrn'
import { STAGE_Z, MANDAP_Z, MARIGOLD_MIX, BOUQUET_MIX, rng, pick, swag, strand, foldedPlane } from './world'

const STAGE_W = 15
const STAGE_D = 14.6
const STAGE_H = 0.9
const OPEN_W = 14
const OPEN_H = 8.4
const BACK_Z = STAGE_Z - STAGE_D // −100.6
const MZ = MANDAP_Z

function Curtain({ side, innerRef }) {
  const half = OPEN_W / 2 + 0.2 // 7.2
  const geo = useMemo(() => foldedPlane(half, OPEN_H, 7, 0.2, 90), [half])
  return (
    <group ref={innerRef} position={[side * (OPEN_W / 2 + 0.1), 0, STAGE_Z + 0.35]}>
      <mesh geometry={geo} material={mats.burgundy} position={[-side * (half / 2), OPEN_H / 2, 0]} />
      <mesh material={mats.gold} position={[-side * (half / 2), 0.1, 0.12]}>
        <boxGeometry args={[half, 0.2, 0.06]} />
      </mesh>
      <mesh material={mats.gold} position={[-side * (half / 2), 6.2, 0.2]}>
        <boxGeometry args={[half, 0.05, 0.04]} />
      </mesh>
    </group>
  )
}

function Pillar({ x, z, castShadow }) {
  return (
    <group position={[x, 1.1, z]}>
      <mesh material={mats.gold} position={[0, 0.2, 0]} castShadow={castShadow}>
        <boxGeometry args={[0.8, 0.4, 0.8]} />
      </mesh>
      <mesh material={mats.marble} position={[0, 2.35, 0]} castShadow={castShadow}>
        <cylinderGeometry args={[0.24, 0.3, 4.1, 16]} />
      </mesh>
      {[0.8, 1.6, 2.4, 3.2].map((y) => (
        <mesh key={y} material={mats.gold} position={[0, 0.4 + y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.28, 0.045, 8, 18]} />
        </mesh>
      ))}
      <mesh material={mats.gold} position={[0, 4.55, 0]} castShadow={castShadow}>
        <cylinderGeometry args={[0.5, 0.26, 0.5, 16]} />
      </mesh>
    </group>
  )
}

/** Scenes 4 & 5 – stage, curtains, mandap and backdrop. */
export default function Stage({ quality }) {
  const curtL = useRef()
  const curtR = useRef()
  const flameRef = useRef()
  const lightsRef = useRef()
  const shaftMat = useRef()
  const haloMat = useRef()

  const g = useMemo(() => {
    const frame = new THREE.Shape()
    frame.moveTo(-9.2, 0)
    frame.lineTo(9.2, 0)
    frame.lineTo(9.2, 9.2)
    frame.lineTo(-9.2, 9.2)
    frame.closePath()
    const hole = new THREE.Path()
    hole.moveTo(-OPEN_W / 2, 0)
    hole.lineTo(-OPEN_W / 2, OPEN_H)
    hole.lineTo(OPEN_W / 2, OPEN_H)
    hole.lineTo(OPEN_W / 2, 0)
    hole.closePath()
    frame.holes.push(hole)
    const frameGeo = new THREE.ExtrudeGeometry(frame, { depth: 0.8, bevelEnabled: false })
    frameGeo.translate(0, 0, -0.4)
    return {
      frameGeo,
      backdrop: makeBackdropTexture(),
      bead: new THREE.SphereGeometry(0.12, 7, 5),
      flower: new THREE.SphereGeometry(0.07, 8, 6),
      sideWall: foldedPlane(STAGE_D, 10, 8, 0.2, 60),
    }
  }, [])

  const data = useMemo(() => {
    const r = rng(23)
    const beads = []
    // swags along the top of the proscenium
    for (let i = 0; i < 7; i++) {
      const x0 = -OPEN_W / 2 + (i * OPEN_W) / 7
      const x1 = -OPEN_W / 2 + ((i + 1) * OPEN_W) / 7
      beads.push(...swag([x0, OPEN_H + 0.1, STAGE_Z + 0.5], [x1, OPEN_H + 0.1, STAGE_Z + 0.5], 0.7, 14, MARIGOLD_MIX, r))
      beads.push(...strand([(x0 + x1) / 2, OPEN_H - 0.5, STAGE_Z + 0.5], 1.0 + r() * 0.8, 6, MARIGOLD_MIX, r, 0.9))
    }
    // mandap roof garlands
    const R = 3.7
    const top = 5.62 + 1.1
    const corners = [
      [-R, MZ - R], [R, MZ - R], [R, MZ + R], [-R, MZ + R],
    ]
    for (let i = 0; i < 4; i++) {
      const a = corners[i]
      const b = corners[(i + 1) % 4]
      beads.push(...swag([a[0], top - 0.1, a[1]], [b[0], top - 0.1, b[1]], 0.35, 22, MARIGOLD_MIX, r, 1.1))
      for (let k = 1; k <= 7; k++) {
        const t = k / 8
        const px = lerp(a[0], b[0], t)
        const pz = lerp(a[1], b[1], t)
        const py = top - 0.1 - 0.35 * 4 * t * (1 - t)
        beads.push(...strand([px, py - 0.05, pz], 0.9 + r() * 1.2, 7, MARIGOLD_MIX, r, 1))
      }
    }
    // pillar garlands
    ;[-2.6, 2.6].forEach((x) =>
      [-2.6, 2.6].forEach((z) => {
        beads.push(...strand([x, 5.3, MZ + z], 3.9, 26, MARIGOLD_MIX, r, 1.0))
      }),
    )

    // floral bank along the stage front & around the mandap base
    const flowers = []
    for (let i = 0; i < 110; i++) {
      const x = (r() * 2 - 1) * (STAGE_W / 2 - 0.2)
      flowers.push({
        position: [x, STAGE_H + 0.08 + r() * 0.35, STAGE_Z - 0.35 - r() * 0.7],
        color: pick(r, BOUQUET_MIX),
        scale: 0.7 + r() * 0.6,
      })
    }
    for (let i = 0; i < 160; i++) {
      const side = i % 4
      const t = (r() * 2 - 1) * 3.6
      const o = 3.5 + r() * 0.5
      const [x, z] = side === 0 ? [t, MZ - o] : side === 1 ? [t, MZ + o] : side === 2 ? [-o, MZ + t] : [o, MZ + t]
      flowers.push({ position: [x, 1.2 + r() * 0.35, z], color: pick(r, BOUQUET_MIX), scale: 0.7 + r() * 0.6 })
    }

    // fairy-light curtain strands (positions for glow points)
    const fairy = []
    const strands = quality.tier === 'high' ? 26 : 16
    for (let i = 0; i < strands; i++) {
      const x = -7.4 + (i * 14.8) / (strands - 1)
      for (let k = 0; k < 18; k++) fairy.push(x + (r() - 0.5) * 0.08, 9.0 - k * 0.38 - (i % 2) * 0.18, BACK_Z + 1.2 + (i % 3) * 0.15)
    }
    return { beads, flowers, fairy }
  }, [quality.tier])

  useFrame((state) => {
    const p = progress.value
    const open = sseg(p, 0.465, 0.6)
    const sc = lerp(1, 0.13, open)
    if (curtL.current) curtL.current.scale.x = sc
    if (curtR.current) curtR.current.scale.x = sc

    const t = state.clock.elapsedTime
    if (flameRef.current) {
      flameRef.current.scale.set(1 + Math.sin(t * 11) * 0.08, 1 + Math.sin(t * 7.3) * 0.18, 1 + Math.sin(t * 9) * 0.08)
    }
    const reveal = sseg(p, 0.62, 0.74)
    if (shaftMat.current) shaftMat.current.opacity = 0.11 * reveal
    if (haloMat.current) haloMat.current.opacity = 0.32 * reveal
    if (lightsRef.current) lightsRef.current.material.opacity = 0.9 * sseg(p, 0.4, 0.6) * (0.88 + Math.sin(t * 1.4) * 0.08)
  })

  const castShadow = quality.shadows

  return (
    <group>
      {/* proscenium */}
      <mesh geometry={g.frameGeo} material={mats.burgundyDark} position={[0, 0, STAGE_Z]} />
      {/* gold trim around the opening */}
      <mesh material={mats.gold} position={[0, OPEN_H + 0.12, STAGE_Z + 0.45]}>
        <boxGeometry args={[OPEN_W + 0.8, 0.28, 0.12]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} material={mats.gold} position={[s * (OPEN_W / 2 + 0.1), OPEN_H / 2, STAGE_Z + 0.45]}>
          <boxGeometry args={[0.26, OPEN_H + 0.4, 0.12]} />
        </mesh>
      ))}
      {/* curtains */}
      <Curtain side={-1} innerRef={curtL} />
      <Curtain side={1} innerRef={curtR} />

      {/* stage platform & steps */}
      <mesh material={mats.marble} position={[0, STAGE_H / 2, STAGE_Z - STAGE_D / 2]} receiveShadow>
        <boxGeometry args={[STAGE_W, STAGE_H, STAGE_D]} />
      </mesh>
      <mesh material={mats.gold} position={[0, STAGE_H - 0.04, STAGE_Z - 0.1]}>
        <boxGeometry args={[STAGE_W + 0.1, 0.1, 0.2]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, STAGE_H + 0.006, MZ + 1.2]} receiveShadow>
        <planeGeometry args={[9.5, 12.5]} />
        <meshStandardMaterial color="#7a1230" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, STAGE_H + 0.01, MZ + 1.2]}>
        <ringGeometry args={[5.9, 6.1, 4, 1, Math.PI / 4, Math.PI * 2]} />
        <meshBasicMaterial color="#d4a64a" toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {/* backdrop & side walls */}
      <mesh position={[0, 5.2, BACK_Z + 0.05]}>
        <planeGeometry args={[STAGE_W + 1, 11]} />
        <meshStandardMaterial map={g.backdrop} emissiveMap={g.backdrop} emissive="#ffffff" emissiveIntensity={0.55} roughness={0.8} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={g.sideWall} material={mats.burgundyDark} position={[s * (STAGE_W / 2 + 0.2), 5, STAGE_Z - STAGE_D / 2]} rotation={[0, (-s * Math.PI) / 2, 0]} />
      ))}
      <mesh material={mats.burgundyDark} position={[0, 10.2, STAGE_Z - STAGE_D / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[STAGE_W + 1, STAGE_D]} />
      </mesh>

      {/* mandap */}
      <group>
        <mesh material={mats.gold} position={[0, STAGE_H + 0.1, MZ]} receiveShadow>
          <boxGeometry args={[7.3, 0.2, 7.3]} />
        </mesh>
        <mesh material={mats.marble} position={[0, STAGE_H + 0.3, MZ]} receiveShadow>
          <boxGeometry args={[6.9, 0.22, 6.9]} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, STAGE_H + 0.42, MZ]}>
          <planeGeometry args={[4.8, 5.6]} />
          <meshStandardMaterial color="#8b1535" roughness={0.9} emissive="#2a0410" emissiveIntensity={0.5} />
        </mesh>
        {[-2.6, 2.6].map((x) => [-2.6, 2.6].map((z) => <Pillar key={`${x}${z}`} x={x} z={MZ + z} castShadow={castShadow} />))}
        {/* beams */}
        {[
          [0, -2.6, 5.7, 0.28, 0.28],
          [0, 2.6, 5.7, 0.28, 0.28],
        ].map(([x, z], i) => (
          <mesh key={'bx' + i} material={mats.gold} position={[x, 5.78, MZ + z]}>
            <boxGeometry args={[5.9, 0.3, 0.3]} />
          </mesh>
        ))}
        {[-2.6, 2.6].map((x) => (
          <mesh key={'bz' + x} material={mats.gold} position={[x, 5.78, MZ]}>
            <boxGeometry args={[0.3, 0.3, 5.9]} />
          </mesh>
        ))}
        {/* tiered roof */}
        <mesh material={mats.burgundy} position={[0, 6.05, MZ]}>
          <boxGeometry args={[7.2, 0.3, 7.2]} />
        </mesh>
        <mesh material={mats.gold} position={[0, 6.24, MZ]}>
          <boxGeometry args={[7.4, 0.1, 7.4]} />
        </mesh>
        <mesh material={mats.burgundy} position={[0, 6.5, MZ]}>
          <boxGeometry args={[5.2, 0.4, 5.2]} />
        </mesh>
        <mesh material={mats.gold} position={[0, 6.74, MZ]}>
          <boxGeometry args={[5.4, 0.1, 5.4]} />
        </mesh>
        <mesh material={mats.burgundy} position={[0, 7.0, MZ]}>
          <boxGeometry args={[3.2, 0.4, 3.2]} />
        </mesh>
        <mesh material={mats.gold} position={[0, 7.8, MZ]} scale={[1, 0.8, 1]}>
          <sphereGeometry args={[1.35, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <mesh material={mats.gold} position={[0, 8.95, MZ]}>
          <coneGeometry args={[0.1, 0.8, 8]} />
        </mesh>
        {/* valance drapes between the pillars */}
        {[-1, 1].map((s) => (
          <mesh key={'vd' + s} position={[s * 2.6, 5.05, MZ]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[5.2, 1.1]} />
            <meshStandardMaterial color="#9c1d40" roughness={0.8} side={THREE.DoubleSide} transparent opacity={0.92} emissive="#3a0716" emissiveIntensity={0.5} />
          </mesh>
        ))}
        <mesh position={[0, 5.05, MZ - 2.6]}>
          <planeGeometry args={[5.2, 1.1]} />
          <meshStandardMaterial color="#9c1d40" roughness={0.8} side={THREE.DoubleSide} transparent opacity={0.92} emissive="#3a0716" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0, 5.05, MZ + 2.6]}>
          <planeGeometry args={[5.2, 1.1]} />
          <meshStandardMaterial color="#9c1d40" roughness={0.8} side={THREE.DoubleSide} transparent opacity={0.92} emissive="#3a0716" emissiveIntensity={0.5} />
        </mesh>

        {/* sacred fire */}
        <group position={[0, STAGE_H + 0.5, MZ - 1.6]}>
          <mesh material={mats.gold}>
            <boxGeometry args={[1.0, 0.26, 1.0]} />
          </mesh>
          <mesh ref={flameRef} position={[0, 0.34, 0]}>
            <coneGeometry args={[0.2, 0.62, 10]} />
            <meshBasicMaterial color="#ff9a2e" toneMapped={false} transparent opacity={0.92} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <coneGeometry args={[0.1, 0.4, 8]} />
            <meshBasicMaterial color="#ffe08a" toneMapped={false} />
          </mesh>
        </group>
      </group>

      <StageExtras quality={quality} />

      {/* flowers + garlands */}
      <Instanced geometry={roseLowGeometry} material={mats.rose} items={data.beads} />

      {/* fairy-light curtain */}
      <GlowPoints pointsRef={lightsRef} positions={data.fairy} size={0.26} opacity={0} color="#ffe0a0" />

      {/* reveal light: volumetric shaft + halo behind the couple */}
      <mesh position={[0, 5.2, MZ + 1.2]} renderOrder={5}>
        <coneGeometry args={[3.4, 9, 36, 1, true]} />
        <meshBasicMaterial ref={shaftMat} color="#ffe3a8" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <mesh position={[0, 3.2, MZ - 1.9]} renderOrder={4}>
        <circleGeometry args={[3.4, 48]} />
        <meshBasicMaterial ref={haloMat} color="#ffb85c" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
    </group>
  )
}
