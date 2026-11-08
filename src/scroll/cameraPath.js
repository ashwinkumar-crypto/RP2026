import * as THREE from 'three'
import { REAL_VENUE, BANQUET } from '../scene/world'

/**
 * The director's shot list. Each key pins the camera position and the point it
 * looks at to a scroll progress (0 → 1). A centripetal Catmull-Rom spline is
 * run through the keys so the move is continuous with no sudden jumps.
 *
 *   World layout (the camera travels down −Z):
 *     z = −30   palace gate + doors
 *     z = −31…−86  decorated wedding hall / pathway
 *     z = −86   stage opening (curtains)
 *     z = −93   mandap + couple
 */
const KEYS_PROC = [
  // Leading spline anchors retained so the entrance camera move stays unchanged.
  { p: 0.0, pos: [0, 0.35, 6.8], look: [0, 0.1, 0] },
  { p: 0.045, pos: [0, 0.45, 5.6], look: [0, 0.25, 0] },
  { p: 0.078, pos: [0, 0.95, 4.2], look: [0, 0.95, 0] },
  { p: 0.095, pos: [0, 1.0, 1.9], look: [0, 1.0, -4] },
  // 10–25%  The grand entrance
  { p: 0.112, pos: [0, 2.3, -9], look: [0, 5.2, -30] },
  { p: 0.15, pos: [0, 2.0, -17], look: [0, 4.0, -30] },
  { p: 0.2, pos: [0, 1.8, -24], look: [0, 3.0, -34] },
  { p: 0.25, pos: [0, 1.7, -31.5], look: [0, 2.6, -46] },
  // 25–45%  The wedding pathway
  { p: 0.3, pos: [0, 1.65, -40], look: [0, 2.6, -56] },
  { p: 0.37, pos: [0, 1.6, -52], look: [0, 2.7, -68] },
  { p: 0.45, pos: [0, 1.65, -64], look: [0, 3.0, -84] },
  // 45–65%  Stage reveal – curtains open
  { p: 0.53, pos: [0, 1.85, -72], look: [0, 3.2, -90] },
  { p: 0.62, pos: [0, 2.1, -80], look: [0, 2.6, -92] },
  // 65–80%  Couple reveal – a slow, intimate push
  { p: 0.72, pos: [0.4, 2.1, -84.2], look: [0, 2.3, -93] },
  { p: 0.8, pos: [-0.3, 2.2, -85.2], look: [0, 2.4, -93] },
  // 80–100%  Details – the camera drifts up and back for the final composition
  { p: 0.9, pos: [0, 2.9, -82.5], look: [0, 2.8, -93] },
  { p: 1.0, pos: [0, 3.4, -77], look: [0, 3.1, -93] },
]
const KEYS_REAL = [
  { p: 0.0, pos: [0, 0.35, 6.8], look: [0, 0.1, 0] },
  { p: 0.045, pos: [0, 0.45, 5.6], look: [0, 0.25, 0] },
  { p: 0.078, pos: [0, 0.95, 4.2], look: [0, 0.95, 0] },
  { p: 0.095, pos: [0, 1.0, 1.9], look: [0, 1.0, -4] },
  { p: 0.112, pos: [0, 2.3, -9], look: [0, 5.2, -30] },
  { p: 0.15, pos: [0, 2.0, -17], look: [0, 4.0, -30] },
  { p: 0.2, pos: [0, 1.8, -24], look: [0, 3.0, -34] },
  { p: 0.25, pos: [0, 1.7, -31.5], look: [0, 2.4, -44] },
  { p: 0.3, pos: [0, 1.65, -38], look: [0, 2.6, -52] },
  { p: 0.37, pos: [0, 1.6, -43], look: [0, 2.8, -58] },
  { p: 0.45, pos: [0, 1.65, -48.5], look: [0, 3.0, -64] },
  { p: 0.53, pos: [0, 1.85, -52.5], look: [0, 3.2, -70] },
  { p: 0.62, pos: [0, 2.1, -57.5], look: [0, 2.6, -72] },
  { p: 0.72, pos: [0.4, 2.1, -62.2], look: [0, 2.3, -73] },
  { p: 0.8, pos: [-0.3, 2.2, -63.4], look: [0, 2.4, -73] },
  { p: 0.9, pos: [0, 2.9, -60.8], look: [0, 2.8, -73] },
  { p: 1.0, pos: [0, 3.4, -56], look: [0, 3.1, -73] },
]

/**
 * The banquet package's own walkthrough (camera/camera_path.json, model z + BANQUET_DZ) re-timed to the scroll:
 * forecourt → portico → foyer → hall → chandeliers → pillars → staircases → carpet → stage, then the couple.
 */
const KEYS_BANQUET = [
  { p: 0.0, pos: [0, 0.35, 6.8], look: [0, 0.1, 0] },
  { p: 0.045, pos: [0, 0.45, 5.6], look: [0, 0.25, 0] },
  { p: 0.078, pos: [0, 0.95, 4.2], look: [0, 0.95, 0] },
  { p: 0.1, pos: [0, 1.05, 4.5], look: [0, 3.6, -29] },
  { p: 0.16, pos: [0, 1.4, -8], look: [0, 3.8, -30] },
  { p: 0.215, pos: [0, 1.65, -20.5], look: [0, 2.6, -34] },
  { p: 0.25, pos: [0.1, 1.65, -27], look: [0, 3.0, -38] },
  { p: 0.285, pos: [0, 1.65, -33], look: [0, 3.4, -44] },
  { p: 0.315, pos: [-0.15, 1.65, -39], look: [0, 3.8, -48] },
  { p: 0.345, pos: [0, 1.65, -45], look: [0, 4.2, -62] },
  { p: 0.385, pos: [0, 1.65, -52], look: [0, 9.3, -76] },
  { p: 0.42, pos: [0.15, 1.65, -55], look: [-13, 6.5, -66] },
  { p: 0.45, pos: [-0.1, 1.65, -58], look: [-17, 3.2, -62] },
  { p: 0.48, pos: [-0.4, 1.65, -59.5], look: [-17, 5.8, -74] },
  { p: 0.51, pos: [0, 1.65, -60], look: [0, 3.5, -86] },
  { p: 0.53, pos: [0.4, 1.65, -62], look: [17, 3.4, -63] },
  { p: 0.555, pos: [0.2, 1.65, -65], look: [17, 5.8, -74] },
  { p: 0.58, pos: [0, 1.65, -70], look: [0, 3, -89] },
  { p: 0.62, pos: [0, 1.65, -79], look: [0, 2.6, -96] },
  { p: 0.68, pos: [0, 1.65, -85], look: [0, 2.2, -97.3] },
  { p: 0.74, pos: [0.3, 1.7, -88.5], look: [0, 2.0, -97.3] },
  { p: 0.8, pos: [-0.3, 1.85, -90.5], look: [0, 1.9, -97.2] },
  { p: 0.9, pos: [0, 2.3, -89], look: [0, 2.2, -97.2] },
  { p: 1.0, pos: [0, 2.9, -86], look: [0, 2.6, -97.2] },
]

const KEYS = BANQUET ? KEYS_BANQUET : REAL_VENUE ? KEYS_REAL : KEYS_PROC


const posCurve = new THREE.CatmullRomCurve3(
  KEYS.map((k) => new THREE.Vector3(...k.pos)),
  false,
  'centripetal',
)
const lookCurve = new THREE.CatmullRomCurve3(
  KEYS.map((k) => new THREE.Vector3(...k.look)),
  false,
  'centripetal',
)

export function sampleCamera(p, outPos, outLook) {
  const n = KEYS.length
  let i = 0
  while (i < n - 2 && p >= KEYS[i + 1].p) i++
  const a = KEYS[i]
  const b = KEYS[i + 1]
  const u = Math.min(1, Math.max(0, (p - a.p) / (b.p - a.p)))
  const t = Math.min(1, (i + u) / (n - 1))
  posCurve.getPoint(t, outPos)
  lookCurve.getPoint(t, outLook)
}
