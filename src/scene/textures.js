import * as THREE from 'three'
import { longDate, mapsUrl } from '../lib/format'
import { drawQRCode } from '../lib/qrcode'

const canvasTex = (canvas, { repeat, srgb = true, aniso = 4 } = {}) => {
  const t = new THREE.CanvasTexture(canvas)
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = aniso
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(...repeat)
  }
  return t
}
const mk = (w, h) => {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')]
}

/** Soft radial glow sprite used for every light bulb / flame. */
export function makeGlowTexture() {
  const [c, g] = mk(128, 128)
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grd.addColorStop(0, 'rgba(255,244,214,1)')
  grd.addColorStop(0.18, 'rgba(255,214,140,0.85)')
  grd.addColorStop(0.5, 'rgba(255,168,70,0.22)')
  grd.addColorStop(1, 'rgba(255,140,40,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, 128, 128)
  return canvasTex(c, { aniso: 1 })
}

/** Radial mandala – used for the stage backdrop and the rangoli. */
export function drawMandala(g, size, palette, { bg = null, rings = 6 } = {}) {
  const cx = size / 2
  const cy = size / 2
  if (bg) {
    g.fillStyle = bg
    g.fillRect(0, 0, size, size)
  }
  g.save()
  g.translate(cx, cy)
  const R = size / 2 - 4
  for (let ring = 0; ring < rings; ring++) {
    const r = R * (1 - ring / (rings + 0.6))
    const petals = 8 + ring * 4
    g.fillStyle = palette[ring % palette.length]
    g.strokeStyle = palette[(ring + 2) % palette.length]
    g.lineWidth = Math.max(1, size / 340)
    for (let i = 0; i < petals; i++) {
      g.save()
      g.rotate((i / petals) * Math.PI * 2 + (ring % 2) * (Math.PI / petals))
      g.beginPath()
      g.moveTo(0, -r * 0.62)
      g.quadraticCurveTo(r * 0.2, -r * 0.82, 0, -r)
      g.quadraticCurveTo(-r * 0.2, -r * 0.82, 0, -r * 0.62)
      g.fill()
      g.stroke()
      g.restore()
    }
  }
  g.beginPath()
  g.arc(0, 0, R * 0.1, 0, Math.PI * 2)
  g.fillStyle = palette[0]
  g.fill()
  g.restore()
}

export function makeRangoliTexture() {
  const [c, g] = mk(512, 512)
  drawMandala(g, 512, ['#ffb627', '#e63a6b', '#fff3d1', '#ff7a00', '#7a1230', '#2f8f6b'], { rings: 7 })
  // soft circular mask
  g.globalCompositeOperation = 'destination-in'
  const m = g.createRadialGradient(256, 256, 200, 256, 256, 256)
  m.addColorStop(0, 'rgba(0,0,0,1)')
  m.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = m
  g.fillRect(0, 0, 512, 512)
  return canvasTex(c)
}

export function makeBackdropTexture() {
  const [c, g] = mk(1024, 1024)
  const grd = g.createLinearGradient(0, 0, 0, 1024)
  grd.addColorStop(0, '#4a0b1e')
  grd.addColorStop(0.5, '#6b1229')
  grd.addColorStop(1, '#3a0916')
  g.fillStyle = grd
  g.fillRect(0, 0, 1024, 1024)

  // lattice (jaali) of gold diamonds
  g.strokeStyle = 'rgba(214,166,74,0.28)'
  g.lineWidth = 2
  const step = 64
  for (let i = -16; i <= 32; i++) {
    g.beginPath()
    g.moveTo(i * step, 0)
    g.lineTo(i * step + 1024, 1024)
    g.stroke()
    g.beginPath()
    g.moveTo(i * step, 1024)
    g.lineTo(i * step + 1024, 0)
    g.stroke()
  }
  // big central mandala
  g.save()
  g.globalAlpha = 0.95
  g.translate(512, 470)
  const tmp = document.createElement('canvas')
  tmp.width = tmp.height = 900
  drawMandala(tmp.getContext('2d'), 900, ['#e2b457', '#a87a22', '#f3d58f', '#c98f2c', '#7a1230'], { rings: 8 })
  g.drawImage(tmp, -450, -450)
  g.restore()
  // glowing ring
  const halo = g.createRadialGradient(512, 470, 60, 512, 470, 470)
  halo.addColorStop(0, 'rgba(255,214,140,0.28)')
  halo.addColorStop(1, 'rgba(255,214,140,0)')
  g.fillStyle = halo
  g.fillRect(0, 0, 1024, 1024)
  return canvasTex(c)
}

export function makeCarpetTexture() {
  const [c, g] = mk(256, 256)
  g.fillStyle = '#6f0f2a'
  g.fillRect(0, 0, 256, 256)
  // subtle weave
  g.fillStyle = 'rgba(255,255,255,0.035)'
  for (let y = 0; y < 256; y += 4) g.fillRect(0, y, 256, 1)
  // central medallion repeated
  g.save()
  g.translate(128, 128)
  g.strokeStyle = '#d4a64a'
  g.lineWidth = 3
  g.fillStyle = 'rgba(212,166,74,0.18)'
  g.beginPath()
  g.moveTo(0, -84)
  g.quadraticCurveTo(40, -40, 84, 0)
  g.quadraticCurveTo(40, 40, 0, 84)
  g.quadraticCurveTo(-40, 40, -84, 0)
  g.quadraticCurveTo(-40, -40, 0, -84)
  g.fill()
  g.stroke()
  for (let i = 0; i < 8; i++) {
    g.rotate(Math.PI / 4)
    g.beginPath()
    g.ellipse(0, -34, 8, 16, 0, 0, Math.PI * 2)
    g.fillStyle = '#d4a64a'
    g.fill()
  }
  g.beginPath()
  g.arc(0, 0, 9, 0, Math.PI * 2)
  g.fillStyle = '#f0d48a'
  g.fill()
  g.restore()
  // border bars (left & right edges of the strip)
  g.fillStyle = '#d4a64a'
  g.fillRect(0, 0, 6, 256)
  g.fillRect(250, 0, 6, 256)
  g.fillStyle = '#3d0a19'
  g.fillRect(10, 0, 8, 256)
  g.fillRect(238, 0, 8, 256)
  return canvasTex(c)
}

export function makeFloorTexture() {
  const [c, g] = mk(256, 256)
  g.fillStyle = '#1d0c0d'
  g.fillRect(0, 0, 256, 256)
  const r = (n) => Math.random() * n
  for (let i = 0; i < 260; i++) {
    g.fillStyle = `rgba(255,${180 + r(40)},${120 + r(40)},${0.012 + r(0.02)})`
    g.fillRect(r(256), r(256), 1 + r(24), 1 + r(2))
  }
  g.strokeStyle = 'rgba(212,166,74,0.35)'
  g.lineWidth = 2
  g.strokeRect(1, 1, 254, 254)
  g.strokeStyle = 'rgba(212,166,74,0.14)'
  g.lineWidth = 1
  g.beginPath()
  g.moveTo(0, 0)
  g.lineTo(256, 256)
  g.moveTo(256, 0)
  g.lineTo(0, 256)
  g.stroke()
  return canvasTex(c, { repeat: [34, 44], aniso: 8 })
}

function drawCanvasGanesha(g, cx, cy, size = 46) {
  g.save()
  g.translate(cx, cy)
  const s = size / 50

  // Sacred Aureole (Prabhavali / Halo)
  g.beginPath()
  g.arc(0, 0, 24 * s, 0, Math.PI * 2)
  g.strokeStyle = '#d4a64a'
  g.lineWidth = 1.4 * s
  g.stroke()

  for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
    g.beginPath()
    g.arc(Math.cos(a) * 24 * s, Math.sin(a) * 24 * s, 1.2 * s, 0, Math.PI * 2)
    g.fillStyle = '#d4a64a'
    g.fill()
  }

  // Crown (Kireetam)
  g.beginPath()
  g.moveTo(-8 * s, -8 * s)
  g.lineTo(0, -22 * s)
  g.lineTo(8 * s, -8 * s)
  g.closePath()
  g.fillStyle = '#c99738'
  g.fill()
  g.strokeStyle = '#7a4d10'
  g.lineWidth = 1 * s
  g.stroke()

  // Ears
  g.beginPath()
  g.ellipse(-10 * s, -2 * s, 7 * s, 5 * s, -0.2, 0, Math.PI * 2)
  g.ellipse(10 * s, -2 * s, 7 * s, 5 * s, 0.2, 0, Math.PI * 2)
  g.fillStyle = '#dfab48'
  g.fill()

  // Head and trunk curve
  g.beginPath()
  g.arc(0, -2 * s, 8 * s, Math.PI, 0)
  g.bezierCurveTo(7 * s, 6 * s, 4 * s, 14 * s, -2 * s, 14 * s)
  g.bezierCurveTo(-5 * s, 14 * s, -4 * s, 10 * s, -1 * s, 10 * s)
  g.lineWidth = 3.2 * s
  g.strokeStyle = '#9c6f21'
  g.stroke()

  // Tilak (Kumkum & Chandan)
  g.beginPath()
  g.moveTo(0, -9 * s)
  g.lineTo(0, -3 * s)
  g.strokeStyle = '#b3122f'
  g.lineWidth = 2.2 * s
  g.stroke()
  g.beginPath()
  g.arc(0, -1 * s, 1.3 * s, 0, Math.PI * 2)
  g.fillStyle = '#b3122f'
  g.fill()

  // Modak sweet on trunk
  g.beginPath()
  g.arc(-4 * s, 11 * s, 2.8 * s, 0, Math.PI * 2)
  g.fillStyle = '#ffb627'
  g.fill()

  g.restore()
}

function drawCanvasHangingLamp(g, x, y, len = 130) {
  g.save()
  // Gold chain
  g.strokeStyle = '#d4a64a'
  g.lineWidth = 1.4
  g.setLineDash([4, 3])
  g.beginPath()
  g.moveTo(x, 0)
  g.lineTo(x, y)
  g.stroke()
  g.setLineDash([])

  // Rings on chain
  g.fillStyle = '#ffd77f'
  for (let cy = 20; cy < y; cy += 28) {
    g.beginPath()
    g.arc(x, cy, 2.2, 0, Math.PI * 2)
    g.fill()
  }

  // Canopy bell
  g.beginPath()
  g.moveTo(x - 9, y + 8)
  g.quadraticCurveTo(x, y - 2, x + 9, y + 8)
  g.closePath()
  g.fillStyle = '#b8892f'
  g.fill()

  // Oil bowl (diya)
  g.beginPath()
  g.ellipse(x, y + 24, 15, 6, 0, 0, Math.PI * 2)
  g.fillStyle = '#c99738'
  g.fill()
  g.strokeStyle = '#8a631c'
  g.lineWidth = 1
  g.stroke()

  // Flame glow
  const glow = g.createRadialGradient(x, y + 16, 1, x, y + 16, 16)
  glow.addColorStop(0, 'rgba(255, 230, 140, 0.95)')
  glow.addColorStop(0.4, 'rgba(255, 140, 30, 0.55)')
  glow.addColorStop(1, 'rgba(255, 80, 0, 0)')
  g.fillStyle = glow
  g.beginPath()
  g.arc(x, y + 16, 16, 0, Math.PI * 2)
  g.fill()

  // Diya flame
  g.beginPath()
  g.moveTo(x - 3.5, y + 23)
  g.quadraticCurveTo(x - 5, y + 16, x, y + 9)
  g.quadraticCurveTo(x + 5, y + 16, x + 3.5, y + 23)
  g.closePath()
  g.fillStyle = '#ff7a00'
  g.fill()

  g.beginPath()
  g.moveTo(x - 1.8, y + 22)
  g.quadraticCurveTo(x - 2.5, y + 17, x, y + 12)
  g.quadraticCurveTo(x + 2.5, y + 17, x + 1.8, y + 22)
  g.closePath()
  g.fillStyle = '#fff6b8'
  g.fill()

  // Bottom drop
  g.beginPath()
  g.moveTo(x, y + 30)
  g.lineTo(x - 3, y + 38)
  g.lineTo(x + 3, y + 38)
  g.closePath()
  g.fillStyle = '#b8892f'
  g.fill()
  g.beginPath()
  g.arc(x, y + 40, 2.2, 0, Math.PI * 2)
  g.fillStyle = '#ffd77f'
  g.fill()

  g.restore()
}

function drawCanvasBananaLeaf(g, x, y, scale = 1, flip = false) {
  g.save()
  g.translate(x, y)
  if (flip) g.scale(-scale, scale)
  else g.scale(scale, scale)

  g.beginPath()
  g.moveTo(0, 0)
  g.bezierCurveTo(18, -12, 42, -32, 38, -62)
  g.bezierCurveTo(28, -70, 14, -58, 4, -38)
  g.bezierCurveTo(-5, -24, -2, -10, 0, 0)
  g.fillStyle = '#1c4d33'
  g.fill()
  g.strokeStyle = '#d4a64a'
  g.lineWidth = 1
  g.stroke()

  // Spine
  g.beginPath()
  g.moveTo(0, 0)
  g.bezierCurveTo(14, -18, 24, -42, 38, -62)
  g.strokeStyle = '#ffd77f'
  g.lineWidth = 1.3
  g.stroke()

  g.restore()
}

function drawCanvasThoranam(g, w, y = 24) {
  g.save()
  g.strokeStyle = '#d4a64a'
  g.lineWidth = 1.8
  g.setLineDash([5, 3])
  g.beginPath()
  g.moveTo(35, y)
  g.lineTo(w - 35, y)
  g.stroke()
  g.setLineDash([])

  const count = 17
  const step = (w - 70) / count
  for (let i = 0; i <= count; i++) {
    const x = 35 + i * step
    // Mango leaf
    g.beginPath()
    g.moveTo(x, y)
    g.quadraticCurveTo(x - 6, y + 13, x, y + 24)
    g.quadraticCurveTo(x + 6, y + 13, x, y)
    g.fillStyle = '#1d5236'
    g.fill()
    g.strokeStyle = '#b8892f'
    g.lineWidth = 0.7
    g.stroke()

    // Marigold flower
    g.beginPath()
    g.arc(x, y + 2, 3.8, 0, Math.PI * 2)
    g.fillStyle = i % 2 === 0 ? '#ff9900' : '#ffc107'
    g.fill()
  }
  g.restore()
}

/** The invitation card face. Call again (same canvas) once web-fonts have loaded. */
export function drawInvitation(canvas, w) {
  const g = canvas.getContext('2d')
  const W = canvas.width
  const H = canvas.height

  // 1. Premium ivory/cream gradient background with silk warmth
  const grd = g.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, Math.max(W, H) * 0.75)
  grd.addColorStop(0, '#fffdf7')
  grd.addColorStop(0.5, '#fbf4e4')
  grd.addColorStop(1, '#f1e2c1')
  g.fillStyle = grd
  g.fillRect(0, 0, W, H)

  // 2. Multi-layered traditional gold ornamental borders
  g.strokeStyle = '#b8892f'
  g.lineWidth = 6
  g.strokeRect(22, 22, W - 44, H - 44)

  g.strokeStyle = 'rgba(212, 166, 74, 0.7)'
  g.lineWidth = 1.5
  g.strokeRect(32, 32, W - 64, H - 64)

  g.strokeStyle = '#b8892f'
  g.lineWidth = 2
  g.strokeRect(42, 42, W - 84, H - 84)

  // Corner flourishes (ornamental arches)
  ;[
    [42, 42, 1, 1],
    [W - 42, 42, -1, 1],
    [42, H - 42, 1, -1],
    [W - 42, H - 42, -1, -1],
  ].forEach(([x, y, sx, sy]) => {
    g.beginPath()
    g.arc(x + sx * 22, y + sy * 22, 22, 0, Math.PI * 2)
    g.strokeStyle = '#b8892f'
    g.lineWidth = 2
    g.stroke()

    g.beginPath()
    g.arc(x + sx * 22, y + sy * 22, 9, 0, Math.PI * 2)
    g.fillStyle = '#b8892f'
    g.fill()
  })

  // 3. Mango leaf & marigold thoranam across the top
  drawCanvasThoranam(g, W, 26)

  // 4. Traditional hanging lamps (Thookku Vilakku) on left & right
  drawCanvasHangingLamp(g, 72, 70, 95)
  drawCanvasHangingLamp(g, W - 72, 70, 95)

  // 5. Banana leaf corner accents
  drawCanvasBananaLeaf(g, 55, H - 55, 0.95, false)
  drawCanvasBananaLeaf(g, W - 55, H - 55, 0.95, true)

  // 6. Sacred Lord Ganesha motif
  drawCanvasGanesha(g, W / 2, 70, 48)

  // 7. Invocation
  g.textAlign = 'center'
  g.fillStyle = '#7a1230'
  g.font = '600 24px "Noto Serif Devanagari", "Cormorant Garamond", serif'
  g.fillText(w.invocation || '॥ श्री गणेशाय नमः ॥', W / 2, 116)

  // 8. Invitation message
  g.fillStyle = '#5c1024'
  g.font = 'italic 18px "Cormorant Garamond", serif'
  g.fillText(w.invitationMessage || 'Together with our families, we invite you to share in the joy of our engagement celebration.', W / 2, 144)

  // 9. Couple's names in calligraphy & deep maroon
  const groomName = w.groom.fullName || 'Rahul Gandhi A M'
  const brideName = w.bride.fullName || 'Padmasri S R'

  g.fillStyle = '#7a1230'
  g.font = '72px "Pinyon Script", "Cormorant Garamond", cursive'
  g.fillText(groomName, W / 2, 215)

  g.fillStyle = '#b8892f'
  g.font = 'italic 32px "Cormorant Garamond", serif'
  g.fillText('&', W / 2, 252)

  g.fillStyle = '#7a1230'
  g.font = '72px "Pinyon Script", "Cormorant Garamond", cursive'
  g.fillText(brideName, W / 2, 318)

  // 10. Parents details
  g.fillStyle = '#420b18'
  g.font = '500 17px "Cormorant Garamond", serif'
  g.fillText(w.groom.parents || 'Son of Mr. Alagumoorthi G & Mrs. Kavitha A', W / 2, 350)
  g.fillText(w.bride.parents || 'Daughter of Mr. Rangaiyan S & Mrs. Alamelu M', W / 2, 372)

  // 11. Traditional gold decorative separator
  g.strokeStyle = '#b8892f'
  g.lineWidth = 1.5
  g.beginPath()
  g.moveTo(W / 2 - 160, 394)
  g.lineTo(W / 2 - 18, 394)
  g.moveTo(W / 2 + 18, 394)
  g.lineTo(W / 2 + 160, 394)
  g.stroke()

  g.beginPath()
  g.arc(W / 2, 394, 6, 0, Math.PI * 2)
  g.fillStyle = '#b8892f'
  g.fill()
  g.beginPath()
  g.arc(W / 2, 394, 2.5, 0, Math.PI * 2)
  g.fillStyle = '#ffd77f'
  g.fill()

  // 12. Date, Time & Venue
  g.fillStyle = '#7a1230'
  g.font = '600 20px Cinzel, "Cormorant Garamond", serif'
  g.letterSpacing = '2px'
  g.fillText('SUNDAY, 13 DECEMBER 2026', W / 2, 422)

  g.fillStyle = '#8a631c'
  g.font = '500 17px Cinzel, "Cormorant Garamond", serif'
  g.letterSpacing = '1.5px'
  g.fillText('10:30 AM TO 12:00 PM', W / 2, 444)

  g.fillStyle = '#7a1230'
  g.font = '600 18px Cinzel, "Cormorant Garamond", serif'
  g.letterSpacing = '2px'
  g.fillText('RAMYA HALL · HOTEL RAM INTERNATIONAL', W / 2, 468)
  g.letterSpacing = '0px'

  // 13. Closing message
  g.fillStyle = '#420b18'
  g.font = 'italic 18px "Cormorant Garamond", serif'
  g.fillText(`"${w.closingMessage || 'Your presence will make our joy complete.'}"`, W / 2, 498)

  // 14. Location QR Code with caption
  const qrUrl = mapsUrl(w.venue)
  const qrSize = 88
  const qrX = W / 2 - qrSize / 2
  const qrY = 514

  // Draw crisp QR code onto canvas
  drawQRCode(g, qrUrl, qrX, qrY, qrSize, { fg: '#4a081a', bg: '#ffffff', margin: 2 })

  // QR Border
  g.strokeStyle = '#b8892f'
  g.lineWidth = 1
  g.strokeRect(qrX - 1, qrY - 1, qrSize + 2, qrSize + 2)

  g.fillStyle = '#8a631c'
  g.font = '600 11px Cinzel, serif'
  g.letterSpacing = '1.5px'
  g.fillText('SCAN FOR LOCATION', W / 2, 620)
  g.letterSpacing = '0px'

  g.fillStyle = '#5c1024'
  g.font = 'italic 12px "Cormorant Garamond", serif'
  g.fillText('Hotel Ram International', W / 2, 635)
}

export function makeInvitationTexture(w) {
  const [c] = mk(1024, 696)
  drawInvitation(c, w)
  const t = canvasTex(c, { aniso: 8 })
  t.userData.redraw = () => {
    drawInvitation(c, w)
    t.needsUpdate = true
  }
  return t
}

/** Warm back-lit lattice window used for the hall's arched bays. */
export function makeArchGlowTexture() {
  const [c, g] = mk(256, 512)
  const grd = g.createLinearGradient(0, 0, 0, 512)
  grd.addColorStop(0, '#ffe3a6')
  grd.addColorStop(0.45, '#ffb04e')
  grd.addColorStop(1, '#e0702a')
  g.fillStyle = grd
  g.fillRect(0, 0, 256, 512)
  g.strokeStyle = 'rgba(90,30,8,0.55)'
  g.lineWidth = 3
  for (let i = -8; i <= 16; i++) {
    g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32 + 512, 512); g.stroke()
    g.beginPath(); g.moveTo(i * 32, 512); g.lineTo(i * 32 + 512, 0); g.stroke()
  }
  return canvasTex(c, { aniso: 4 })
}
