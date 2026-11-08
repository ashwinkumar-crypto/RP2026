import * as THREE from 'three'

/* ── periodic value-noise so generated textures tile without seams ───────── */
function hash(x, y, s) {
  let h = (x * 374761393 + y * 668265263 + s * 1442695041) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295
}
function vnoise(x, y, s, P) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const m = (n) => ((n % P) + P) % P
  const a = hash(m(xi), m(yi), s)
  const b = hash(m(xi + 1), m(yi), s)
  const c = hash(m(xi), m(yi + 1), s)
  const d = hash(m(xi + 1), m(yi + 1), s)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}
function fbm(x, y, oct, seed, P) {
  let a = 0
  let amp = 0.5
  let f = 1
  let per = P
  for (let i = 0; i < oct; i++) {
    a += amp * vnoise(x * f, y * f, seed + i, per)
    f *= 2
    per *= 2
    amp *= 0.5
  }
  return a
}
const sstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
const hex = (h) => [(h >> 16) & 255, (h >> 8) & 255, h & 255]
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]

function toTexture(data, size, srgb, repeat) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
  const img = g.createImageData(size, size)
  img.data.set(data)
  g.putImageData(img, 0, 0)
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  if (repeat) t.repeat.set(...repeat)
  t.anisotropy = 8
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** Height field (0..1 Float32) → tangent-space normal map data. */
function heightToNormal(h, size, strength) {
  const out = new Uint8ClampedArray(size * size * 4)
  const at = (x, y) => h[((y + size) % size) * size + ((x + size) % size)]
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength
      const l = Math.hypot(dx, dy, 1)
      const i = (y * size + x) * 4
      out[i] = (-dx / l * 0.5 + 0.5) * 255
      out[i + 1] = (dy / l * 0.5 + 0.5) * 255
      out[i + 2] = (1 / l * 0.5 + 0.5) * 255
      out[i + 3] = 255
    }
  }
  return out
}

function build(size, repeat, pixel, normalStrength) {
  const col = new Uint8ClampedArray(size * size * 4)
  const rough = new Uint8ClampedArray(size * size * 4)
  const height = new Float32Array(size * size)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const r = pixel(x / size, y / size)
      const i = (y * size + x) * 4
      col[i] = r.c[0]; col[i + 1] = r.c[1]; col[i + 2] = r.c[2]; col[i + 3] = 255
      rough[i] = 255; rough[i + 1] = Math.min(255, Math.max(0, r.rough * 255)); rough[i + 2] = 0; rough[i + 3] = 255
      height[y * size + x] = r.h
    }
  }
  return {
    map: toTexture(col, size, true, repeat),
    roughnessMap: toTexture(rough, size, false, repeat),
    normalMap: toTexture(heightToNormal(height, size, normalStrength), size, false, repeat),
  }
}

const cache = {}

/** Polished cream marble with grey-gold veins. `tiles` > 1 adds grout lines and per-tile variation. */
export function marbleSet({ size = 512, repeat = [1, 1], tiles = 1, seed = 3 } = {}) {
  const key = `marble${size}${repeat}${tiles}${seed}`
  if (cache[key]) return cache[key]
  const base = hex(0xf0e4cc)
  const warm = hex(0xe2cfa6)
  const vein = hex(0x9a7d52)
  const grout = hex(0x6a5230)
  cache[key] = build(
    size,
    repeat,
    (u, v) => {
      let tu = u
      let tv = v
      let g = 0
      if (tiles > 1) {
        const fu = (u * tiles) % 1
        const fv = (v * tiles) % 1
        const id = Math.floor(u * tiles) * 7 + Math.floor(v * tiles) * 13
        tu = (fu + (id % 5) * 0.37) % 1
        tv = (fv + (id % 3) * 0.21) % 1
        const e = Math.min(fu, 1 - fu, fv, 1 - fv)
        g = 1 - sstep(0.004, 0.011, e)
      }
      const n = fbm(tu * 4, tv * 4, 5, seed, 4)
      const w = fbm(tu * 8 + 11, tv * 8, 4, seed + 9, 8)
      const s = Math.abs(Math.sin((tu * 3 + tv * 1.7 + n * 3.4) * Math.PI))
      const v1 = Math.pow(1 - s, 14)
      const s2 = Math.abs(Math.sin((tu * 7 - tv * 4 + w * 2.6) * Math.PI))
      const v2 = Math.pow(1 - s2, 22) * 0.55
      const vv = Math.min(1, v1 * 0.85 + v2)
      let c = mix(base, warm, sstep(0.3, 0.75, n))
      c = mix(c, vein, vv * 0.65)
      c = mix(c, grout, g)
      return { c, rough: 0.16 + vv * 0.28 + n * 0.12 + g * 0.5, h: n * 0.35 - vv * 0.18 - g * 0.6 }
    },
    1.6,
  )
  return cache[key]
}

/** Warm hand-plastered wall. */
export function plasterSet({ size = 512, repeat = [6, 2] } = {}) {
  const key = `plaster${size}${repeat}`
  if (cache[key]) return cache[key]
  const a = hex(0xc9a06a)
  const b = hex(0xb78a55)
  cache[key] = build(
    size,
    repeat,
    (u, v) => {
      const n = fbm(u * 6, v * 6, 6, 21, 6)
      const f = fbm(u * 64, v * 64, 2, 5, 64)
      return { c: mix(a, b, n), rough: 0.78 + f * 0.2, h: n * 0.6 + f * 0.4 }
    },
    2.4,
  )
  return cache[key]
}

/** Woven wool carpet: only the fine normal + roughness (colour comes from the pattern texture). */
export function weaveSet({ size = 256, repeat = [1, 1] } = {}) {
  const key = `weave${size}${repeat}`
  if (cache[key]) return cache[key]
  const set = build(
    size,
    repeat,
    (u, v) => {
      const wx = Math.sin(u * Math.PI * 2 * 48) * 0.5 + 0.5
      const wy = Math.sin(v * Math.PI * 2 * 48) * 0.5 + 0.5
      const n = fbm(u * 24, v * 24, 3, 7, 24)
      return { c: [255, 255, 255], rough: 0.88 + n * 0.1, h: wx * wy * 0.7 + n * 0.3 }
    },
    2.2,
  )
  cache[key] = { roughnessMap: set.roughnessMap, normalMap: set.normalMap }
  return cache[key]
}

/** Realistic rose: overlapping petals that wrap around the heart in layers and flare at the lip. */
export function makeRose(detail = 1) {
  // t0 = initial lean from vertical, curl = how much the petal bends over its length (negative = inward, cupping)
  const layers = detail > 0
    ? [
        { n: 3, r: 0.012, len: 0.14, t0: 0.15, curl: -0.9, shade: 0.45 },
        { n: 4, r: 0.026, len: 0.17, t0: 0.2, curl: -0.7, shade: 0.58 },
        { n: 5, r: 0.042, len: 0.2, t0: 0.3, curl: -0.4, shade: 0.72 },
        { n: 6, r: 0.058, len: 0.22, t0: 0.2, curl: -0.5, shade: 0.86 },
        { n: 7, r: 0.074, len: 0.22, t0: 0.3, curl: -0.4, shade: 1.0 },
      ]
    : [
        { n: 3, r: 0.02, len: 0.16, t0: 0.15, curl: -0.8, shade: 0.6 },
        { n: 5, r: 0.06, len: 0.22, t0: 0.25, curl: -0.35, shade: 1.0 },
      ]
  const seg = 3
  const across = detail > 0 ? 3 : 2
  const positions = []
  const colors = []
  const index = []
  let base = 0
  layers.forEach((L, li) => {
    for (let i = 0; i < L.n; i++) {
      const ang = (i / L.n) * Math.PI * 2 + li * 0.9
      const arc = ((Math.PI * 2) / L.n) * 1.25 // overlap neighbours
      const line = [{ out: L.r, y: li * 0.006 }]
      for (let iy = 1; iy <= seg; iy++) {
        const u = iy / seg
        const th = L.t0 + L.curl * u
        const ds = L.len / seg
        const pv = line[iy - 1]
        line.push({ out: pv.out + Math.sin(th) * ds, y: pv.y + Math.cos(th) * ds })
      }
      for (let iy = 0; iy <= seg; iy++) {
        const u = iy / seg
        const c = line[iy]
        const envelope = 0.55 + 0.45 * Math.sin(Math.PI * Math.min(1, u * 0.85 + 0.15))
        for (let ix = 0; ix <= across; ix++) {
          const v = ix / across - 0.5
          const phi = ang + v * arc * envelope
          const out = c.out + Math.pow(Math.abs(v) * 2, 2) * 0.012 * u // edges roll outward
          positions.push(Math.cos(phi) * out, c.y + (1 - envelope) * 0.02, Math.sin(phi) * out)
          const d = L.shade * (0.58 + 0.42 * u)
          colors.push(d, d, d)
        }
      }
      const row = across + 1
      for (let iy = 0; iy < seg; iy++) {
        for (let ix = 0; ix < across; ix++) {
          const a0 = base + iy * row + ix
          const b0 = a0 + 1
          const c0 = a0 + row
          const d0 = c0 + 1
          index.push(a0, c0, b0, b0, c0, d0)
        }
      }
      base += (seg + 1) * (across + 1)
    }
  })
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  g.setIndex(index)
  g.computeVertexNormals()
  g.translate(0, -0.05, 0)
  g.scale(0.75, 0.75, 0.75)
  return g
}
