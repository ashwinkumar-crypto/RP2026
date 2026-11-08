import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { progress, sseg } from '../scroll/timeline'
import { mats } from './materials'
import { MANDAP_Z, STAGE_FLOOR_Y, BANQUET } from './world'

const lathe = (pts, seg = 24) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg)

const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.55, ...extra })

function useFigureAssets() {
  return useMemo(
    () => ({
      // groom
      sherwani: lathe([[0.001, 0.52], [0.25, 0.52], [0.24, 0.8], [0.19, 1.05], [0.205, 1.25], [0.17, 1.42], [0.07, 1.49], [0.001, 1.49]]),
      // bride
      skirt: lathe([[0.001, 0.02], [0.47, 0.02], [0.45, 0.2], [0.37, 0.55], [0.25, 0.85], [0.17, 1.0], [0.001, 1.0]], 32),
      blouse: lathe([[0.001, 1.0], [0.165, 1.0], [0.16, 1.15], [0.178, 1.3], [0.15, 1.4], [0.07, 1.45], [0.001, 1.45]]),
      capsuleArm: new THREE.CapsuleGeometry(0.048, 0.46, 4, 10),
      mats: {
        sherwani: std('#1c2748', { metalness: 0.2, roughness: 0.45, emissive: '#080c1c', emissiveIntensity: 0.3 }),
        churidar: std('#e6dcc4', { emissive: '#000000' }),
        stole: std('#c9a24a', { metalness: 0.4, roughness: 0.4, emissive: '#2a1c04', emissiveIntensity: 0.25 }),
        turban: std('#c01f40', { emissive: '#3a0716', emissiveIntensity: 0.4 }),
        lehenga: std('#c2576f', { emissive: '#2a0a12', emissiveIntensity: 0.25, metalness: 0.15, roughness: 0.5 }),
        blouse: std('#f0b8c0', { emissive: '#2a0a12', emissiveIntensity: 0.2 }),
        veil: new THREE.MeshStandardMaterial({
          color: '#f6dfe0',
          roughness: 0.5,
          transparent: true,
          opacity: 0.7,
          side: THREE.DoubleSide,
          emissive: '#3a2024',
          emissiveIntensity: 0.15,
        }),
        garlandA: std('#ff8f1f', { emissive: '#552200', emissiveIntensity: 0.6 }),
        garlandB: std('#e63a6b', { emissive: '#4a0a1e', emissiveIntensity: 0.6 }),
        jewel: new THREE.MeshBasicMaterial({ color: '#fff0b0', toneMapped: false }),
        shoe: std('#d9a93e', { metalness: 0.5 }),
      },
    }),
    [],
  )
}

/** Minimal face: eyes, brows, nose and mouth so the figures read as people, not mannequins. */
const eyeMat = new THREE.MeshStandardMaterial({ color: '#120a08', roughness: 0.3 })
const browMat = new THREE.MeshStandardMaterial({ color: '#1a0e0a', roughness: 0.8 })
const lipMat = new THREE.MeshStandardMaterial({ color: '#b8344c', roughness: 0.45 })
const lipMatM = new THREE.MeshStandardMaterial({ color: '#8a4a3a', roughness: 0.55 })
function Face({ y, z, skin, lips, stubble }) {
  return (
    <group position={[0, y, z]}>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh material={eyeMat} position={[s * 0.036, 0.012, 0.003]} scale={[1.2, 0.8, 0.6]}>
            <sphereGeometry args={[0.011, 8, 6]} />
          </mesh>
          <mesh material={browMat} position={[s * 0.036, 0.034, 0.002]} rotation={[0, 0, -s * 0.12]}>
            <boxGeometry args={[0.034, 0.006, 0.006]} />
          </mesh>
        </group>
      ))}
      <mesh material={skin} position={[0, -0.012, 0.01]} scale={[0.8, 1.2, 1]}>
        <sphereGeometry args={[0.014, 8, 6]} />
      </mesh>
      <mesh material={lips ? lipMat : lipMatM} position={[0, -0.047, 0.004]} scale={[1.6, 0.6, 0.7]}>
        <sphereGeometry args={[0.013, 8, 6]} />
      </mesh>
      {stubble && (
        <mesh material={browMat} position={[0, -0.066, -0.004]} scale={[1, 0.55, 0.9]}>
          <sphereGeometry args={[0.05, 12, 8, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5]} />
        </mesh>
      )}
    </group>
  )
}

function Groom({ castShadow, a }) {
  const m = a.mats
  return (
    <group>
      {[-0.085, 0.085].map((x) => (
        <group key={x}>
          <mesh material={m.shoe} position={[x, 0.03, 0.05]} castShadow={castShadow}>
            <boxGeometry args={[0.11, 0.06, 0.24]} />
          </mesh>
          <mesh material={m.churidar} position={[x, 0.31, 0]} castShadow={castShadow}>
            <cylinderGeometry args={[0.07, 0.055, 0.56, 10]} />
          </mesh>
        </group>
      ))}
      <mesh geometry={a.sherwani} material={m.sherwani} castShadow={castShadow} />
      {/* shoulder stole */}
      <mesh material={m.stole} position={[0, 1.15, 0.2]} rotation={[0, 0, 0.52]} castShadow={castShadow}>
        <boxGeometry args={[0.1, 0.78, 0.03]} />
      </mesh>
      {/* gold collar */}
      <mesh material={mats.gold} position={[0, 1.46, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.075, 0.022, 8, 18]} />
      </mesh>
      {/* arms */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh geometry={a.capsuleArm} material={m.sherwani} position={[s * 0.235, 1.12, 0.06]} rotation={[0.28, 0, s * 0.1]} castShadow={castShadow} />
          <mesh material={mats.skin} position={[s * 0.255, 0.84, 0.15]}>
            <sphereGeometry args={[0.052, 10, 8]} />
          </mesh>
        </group>
      ))}
      {/* head */}
      <mesh material={mats.skin} position={[0, 1.55, 0]}>
        <cylinderGeometry args={[0.045, 0.05, 0.12, 10]} />
      </mesh>
      <mesh material={mats.skin} position={[0, 1.64, 0.005]} castShadow={castShadow}>
        <sphereGeometry args={[0.1, 18, 14]} />
      </mesh>
      {/* styled hair */}
      <mesh material={mats.hair} position={[0, 1.69, -0.025]} scale={[1.02, 0.9, 1.08]} castShadow={castShadow}>
        <sphereGeometry args={[0.104, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
      </mesh>
      <Face y={1.64} z={0.094} skin={mats.skin} stubble />
      {/* gold buttons + pocket square */}
      {[0.98, 1.1, 1.22, 1.34].map((y) => (
        <mesh key={y} material={mats.gold} position={[0, y, 0.215 - (y - 0.98) * 0.03]}>
          <sphereGeometry args={[0.016, 8, 6]} />
        </mesh>
      ))}
      <mesh material={m.stole} position={[-0.11, 1.2, 0.17]} rotation={[0.2, 0, 0.5]}>
        <boxGeometry args={[0.05, 0.05, 0.015]} />
      </mesh>
    </group>
  )
}

function Bride({ castShadow, a }) {
  const m = a.mats
  return (
    <group>
      <mesh geometry={a.skirt} material={m.lehenga} castShadow={castShadow} />
      <mesh material={mats.gold} position={[0, 0.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.462, 0.028, 8, 36]} />
      </mesh>
      <mesh material={mats.gold} position={[0, 0.38, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.41, 0.014, 6, 36]} />
      </mesh>
      <mesh geometry={a.blouse} material={m.blouse} castShadow={castShadow} />
      <mesh material={mats.gold} position={[0, 1.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.172, 0.022, 8, 24]} />
      </mesh>
      {/* back veil / dupatta */}
      <mesh material={m.veil} position={[0, 0.98, -0.01]}>
        <cylinderGeometry args={[0.27, 0.4, 1.1, 28, 1, true, Math.PI * 0.42, Math.PI * 1.16]} />
      </mesh>
      {/* arms */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh geometry={a.capsuleArm} material={m.blouse} position={[s * 0.2, 1.1, 0.06]} rotation={[0.3, 0, s * 0.12]} castShadow={castShadow} />
          <mesh material={mats.skinBride} position={[s * 0.225, 0.83, 0.15]}>
            <sphereGeometry args={[0.048, 10, 8]} />
          </mesh>
          <mesh material={mats.gold} position={[s * 0.222, 0.87, 0.14]} rotation={[0.4, 0, s * 0.1]}>
            <torusGeometry args={[0.05, 0.012, 6, 14]} />
          </mesh>
        </group>
      ))}
      {/* necklace */}
      <mesh material={mats.gold} position={[0, 1.4, 0.025]} rotation={[Math.PI / 2 - 0.25, 0, 0]}>
        <torusGeometry args={[0.085, 0.012, 6, 20]} />
      </mesh>
      {/* head */}
      <mesh material={mats.skinBride} position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.04, 0.046, 0.12, 10]} />
      </mesh>
      <mesh material={mats.skinBride} position={[0, 1.58, 0.005]} castShadow={castShadow}>
        <sphereGeometry args={[0.094, 18, 14]} />
      </mesh>
      <mesh material={mats.hair} position={[0, 1.6, -0.035]} castShadow={castShadow}>
        <sphereGeometry args={[0.1, 16, 12]} />
      </mesh>
      {/* head veil */}
      <mesh material={m.veil} position={[0, 1.6, -0.015]} rotation={[-0.38, 0, 0]} scale={[1, 1.08, 1.08]}>
        <sphereGeometry args={[0.135, 22, 14, 0, Math.PI * 2, 0, Math.PI * 0.64]} />
      </mesh>
      <Face y={1.58} z={0.088} skin={mats.skinBride} lips />
      <mesh material={mats.gold} position={[0, 1.655, 0.092]}>
        <sphereGeometry args={[0.02, 8, 6]} />
      </mesh>
      <mesh material={new THREE.MeshBasicMaterial({ color: '#c01030' })} position={[0, 1.605, 0.094]}>
        <sphereGeometry args={[0.011, 8, 6]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} material={mats.gold} position={[s * 0.096, 1.54, 0.01]}>
          <sphereGeometry args={[0.016, 8, 6]} />
        </mesh>
      ))}
    </group>
  )
}

/** Scene 6 – the bride and groom, stylised figures standing on the mandap. */
export default function Couple({ quality }) {
  const root = useRef()
  const groom = useRef()
  const bride = useRef()
  const a = useFigureAssets()
  const castShadow = quality.shadows

  useFrame((state) => {
    const p = progress.value
    const t = state.clock.elapsedTime
    const reveal = sseg(p, 0.6, 0.72)
    root.current.visible = p > 0.4
    // gentle breathing & a slow lean toward each other as the reveal lands
    const lean = 0.1 + 0.07 * reveal
    if (groom.current) {
      groom.current.rotation.y = lean
      groom.current.scale.y = 1 + Math.sin(t * 1.6) * 0.004
      groom.current.position.y = Math.sin(t * 1.6) * 0.004
    }
    if (bride.current) {
      bride.current.rotation.y = -lean
      bride.current.scale.y = 1 + Math.sin(t * 1.6 + 0.8) * 0.004
    }
  })

  return (
    <group ref={root} position={[0, STAGE_FLOOR_Y, MANDAP_Z + 1.55]} scale={BANQUET ? 1.0 : 1.28}>
      <group ref={groom} position={[-0.58, 0, 0]}>
        <Groom castShadow={castShadow} a={a} />
      </group>
      <group ref={bride} position={[0.6, 0, 0]}>
        <Bride castShadow={castShadow} a={a} />
      </group>
      {/* the engagement rings, held between them */}
      <group position={[0, 0.98, 0.3]}>
        <mesh material={mats.gold} rotation={[Math.PI / 2 - 0.5, 0, 0]}>
          <torusGeometry args={[0.032, 0.008, 8, 18]} />
        </mesh>
        <mesh position={[0, 0.036, 0.016]}>
          <octahedronGeometry args={[0.015]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
        <pointLight color="#fff4d0" intensity={0.7} distance={1.6} decay={2} />
      </group>
    </group>
  )
}
