import * as THREE from 'three'

/** World layout constants (camera travels toward −Z). */
export const GATE_Z = -30
export const HALL_START = -31
import wedding from '../config/wedding'
const venueUrl = wedding.models?.venue || ''
/** The supplied banquet hall (entrance wall at the palace gate, stage at the far end, its own sofa/stage/chairs). */
export const BANQUET = /banquet/i.test(venueUrl)
/** A real stone atrium (Sponza): the stage is then built inside it. */
export const REAL_VENUE = !!venueUrl && !BANQUET
/** The banquet model's own z axis is shifted so its forecourt sits in front of the entrance camera view. */
export const BANQUET_DZ = -74
export const STAGE_Z = BANQUET ? -96 : REAL_VENUE ? -66 : -86
export const MANDAP_Z = BANQUET ? -97.15 : REAL_VENUE ? -73 : -93
/** Floor height of the stage the couple stands on. */
export const STAGE_FLOOR_Y = BANQUET ? 0.8 : 1.31
export const PILLAR_X = 5.2
export const HALL_HALF = 9.2
export const HALL_H = 9.2
export const DOOR_W = 5.6
export const DOOR_H = 5.2
/** z positions of the pillar stations along the hall. */
export const STATIONS = Array.from({ length: 10 }, (_, i) => -36 - i * 5)

/** Deterministic random so the scene looks identical on every load. */
export function rng(seed = 1) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const FLOWER = {
  marigold: ['#ff9d1c', '#ffb627', '#ff7a00', '#ffc93c', '#ff8c1a'],
  rose: ['#e63a6b', '#ff6f91', '#c2185b', '#f0476f'],
  white: ['#fff7e0', '#f6efe0'],
  red: ['#b3122f', '#d12347'],
}
export const ROSE_MIX = ['#b3122f', '#c8102e', '#d1183a', '#a30f28', '#b3122f', '#c8102e', '#fff1e2', '#fff7ec', '#f2cfc8']
/** Garland palette: deep reds & ivory with a little marigold gold, like the reference. */
export const MARIGOLD_MIX = [...ROSE_MIX, ...ROSE_MIX, '#e8b04a', '#ffb627']
export const BOUQUET_MIX = ROSE_MIX

export const pick = (r, arr) => arr[Math.floor(r() * arr.length) % arr.length]

/** Beads along a sagging swag between two points. */
export function swag(a, b, sag, n, palette, r, size = 1) {
  const out = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    out.push({
      position: [
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t - sag * 4 * t * (1 - t),
        a[2] + (b[2] - a[2]) * t,
      ],
      color: pick(r, palette),
      scale: size * (0.85 + r() * 0.35),
    })
  }
  return out
}

/** A hanging strand of beads (phool ki jhalar). */
export function strand(origin, length, n, palette, r, size = 1) {
  const out = []
  for (let i = 0; i < n; i++) {
    out.push({
      position: [origin[0] + (r() - 0.5) * 0.03, origin[1] - (length * i) / Math.max(1, n - 1), origin[2] + (r() - 0.5) * 0.03],
      color: pick(r, palette),
      scale: size * (0.8 + r() * 0.35),
    })
  }
  return out
}

/** Plane with vertical folds (curtain / draped fabric). */
export function foldedPlane(w, h, folds, amp, wSeg = 80, hSeg = 1) {
  const g = new THREE.PlaneGeometry(w, h, wSeg, hSeg)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    pos.setZ(i, Math.sin(((x + w / 2) / w) * Math.PI * 2 * folds) * amp)
  }
  g.computeVertexNormals()
  return g
}

/** Rose + baby's-breath dome for an urn centred at (cx, cy, cz). Returns instanced items. */
export function roseCluster(r, cx, cy, cz, s = 1, count = 70) {
  const roses = []
  const breath = []
  for (let i = 0; i < count; i++) {
    const th = r() * Math.PI * 2
    const ph = Math.acos(0.15 + r() * 0.85)
    const rad = 0.5 * s
    roses.push({
      position: [cx + Math.sin(ph) * Math.cos(th) * rad, cy + Math.cos(ph) * 0.42 * s, cz + Math.sin(ph) * Math.sin(th) * rad],
      color: pick(r, ROSE_MIX),
      scale: (0.85 + r() * 0.6) * s,
    })
  }
  for (let i = 0; i < Math.floor(count * 0.55); i++) {
    const th = r() * Math.PI * 2
    const ph = Math.acos(0.05 + r() * 0.9)
    const rad = (0.58 + r() * 0.12) * s
    breath.push({
      position: [cx + Math.sin(ph) * Math.cos(th) * rad, cy + Math.cos(ph) * 0.5 * s, cz + Math.sin(ph) * Math.sin(th) * rad],
      color: '#fffaf0',
      scale: (0.5 + r() * 0.4) * s,
    })
  }
  return { roses, breath }
}
