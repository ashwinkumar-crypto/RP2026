import React from 'react'

/**
 * Lord Ganesha sacred emblem – traditional South Indian style with gold accents.
 */
export function GaneshaEmblem({ size = 72, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Lord Ganesha Motif"
    >
      {/* Outer Halo */}
      <circle cx="50" cy="50" r="46" stroke="#d4a64a" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.85" />
      <circle cx="50" cy="50" r="42" stroke="#b8892f" strokeWidth="1" opacity="0.6" />

      {/* Halo ray accents */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
        <circle
          key={deg}
          cx={50 + 44 * Math.cos((deg * Math.PI) / 180)}
          cy={50 + 44 * Math.sin((deg * Math.PI) / 180)}
          r="1.2"
          fill="#d4a64a"
        />
      ))}

      {/* Crown (Kireetam) */}
      <path
        d="M38 32 L50 16 L62 32 L57 34 L50 28 L43 34 Z"
        fill="url(#goldGradGanesha)"
        stroke="#8a631c"
        strokeWidth="1"
      />
      <circle cx="50" cy="22" r="2" fill="#ffd77f" />
      <circle cx="50" cy="15" r="1.5" fill="#e63a6b" />

      {/* Head & Ears */}
      <path
        d="M36 34 C30 35 24 40 24 48 C24 55 30 58 35 56 C36 48 37 42 41 38 Z"
        fill="url(#goldGradGanesha)"
        stroke="#8a631c"
        strokeWidth="1"
      />
      <path
        d="M64 34 C70 35 76 40 76 48 C76 55 70 58 65 56 C64 48 63 42 59 38 Z"
        fill="url(#goldGradGanesha)"
        stroke="#8a631c"
        strokeWidth="1"
      />

      {/* Ear inner curves */}
      <path d="M28 44 C27 49 30 53 33 52" stroke="#7a1230" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M72 44 C73 49 70 53 67 52" stroke="#7a1230" strokeWidth="1.2" strokeLinecap="round" />

      {/* Forehead / Head dome */}
      <path
        d="M38 34 C38 34 50 32 62 34 C60 44 60 52 58 60 C55 72 45 74 42 70 C39 66 43 60 48 62 C51 63 52 66 50 67"
        fill="none"
        stroke="url(#goldGradGanesha)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Sacred Tilak / Namam on Forehead */}
      <path d="M50 29 V37" stroke="#b3122f" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M46 32 H54" stroke="#d4a64a" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="50" cy="39" r="1.6" fill="#b3122f" />

      {/* Right tusk (intact) & Left tusk (broken - auspicious) */}
      <path d="M44 54 L39 56" stroke="#fff8e7" strokeWidth="2" strokeLinecap="round" />
      <path d="M56 54 L60 55" stroke="#fff8e7" strokeWidth="2" strokeLinecap="round" />

      {/* Modak (sweet delicacy) on trunk */}
      <ellipse cx="40" cy="68" rx="3.5" ry="3" fill="#ffb627" stroke="#8a631c" strokeWidth="0.8" />
      <circle cx="40" cy="66.5" r="1" fill="#fff" opacity="0.6" />

      {/* Eyes */}
      <ellipse cx="43" cy="42" rx="1.5" ry="2.2" fill="#3a0916" />
      <ellipse cx="57" cy="42" rx="1.5" ry="2.2" fill="#3a0916" />

      {/* Gradients */}
      <defs>
        <linearGradient id="goldGradGanesha" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffd77f" />
          <stop offset="50%" stopColor="#d4a64a" />
          <stop offset="100%" stopColor="#9a6b18" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/**
 * Traditional South Indian Thookku Vilakku (Hanging Gold Lamp with Flame).
 */
export function HangingLamp({ height = 120, className = '' }) {
  return (
    <svg
      width={Math.round(height * 0.3)}
      height={height}
      viewBox="0 0 36 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Hanging Chain */}
      <line x1="18" y1="0" x2="18" y2="60" stroke="#d4a64a" strokeWidth="1.5" strokeDasharray="3 2" />

      {/* Chain link rings */}
      <circle cx="18" cy="15" r="2" stroke="#d4a64a" strokeWidth="1" />
      <circle cx="18" cy="35" r="2" stroke="#d4a64a" strokeWidth="1" />
      <circle cx="18" cy="55" r="2.5" stroke="#d4a64a" strokeWidth="1.2" />

      {/* Bell / Top Canopy */}
      <path d="M12 62 C12 59 24 59 24 62 L26 68 H10 Z" fill="#d4a64a" stroke="#8a631c" strokeWidth="0.8" />

      {/* Central Stem */}
      <rect x="16.5" y="68" width="3" height="12" fill="#ffd77f" stroke="#8a631c" strokeWidth="0.6" />

      {/* Lamp Oil Bowl (Thattu) */}
      <path
        d="M6 82 C6 80 30 80 30 82 L26 90 C24 93 12 93 10 90 Z"
        fill="#d4a64a"
        stroke="#8a631c"
        strokeWidth="1"
      />

      {/* Flame Bowl Spouts */}
      <circle cx="7" cy="82" r="1.5" fill="#ffb627" />
      <circle cx="18" cy="82" r="1.5" fill="#ffb627" />
      <circle cx="29" cy="82" r="1.5" fill="#ffb627" />

      {/* Central Diya Flame with Warm Glow */}
      <ellipse cx="18" cy="74" rx="3.5" ry="6" fill="#ff9900" opacity="0.9" />
      <ellipse cx="18" cy="74.5" rx="2" ry="4" fill="#ffea75" />
      <ellipse cx="18" cy="76" rx="1" ry="2" fill="#ffffff" />

      {/* Bottom Finial / Drop */}
      <path d="M16 90 L18 97 L20 90 Z" fill="#b8892f" />
      <circle cx="18" cy="98" r="1.5" fill="#ffd77f" />
    </svg>
  )
}

/**
 * Traditional Banana Leaf motif (Vazhai Ilai) representing abundance and auspicious beginnings.
 */
export function BananaLeaf({ width = 48, height = 90, flip = false, className = '' }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 48 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: flip ? 'scaleX(-1)' : 'none' }}
      className={className}
      aria-hidden="true"
    >
      {/* Banana leaf body */}
      <path
        d="M6 88 C4 65 8 40 22 18 C30 6 42 2 44 2 C44 14 42 35 34 54 C26 72 16 84 6 88 Z"
        fill="url(#leafGreenGrad)"
        stroke="#276749"
        strokeWidth="1"
      />
      {/* Central spine / vein */}
      <path d="M6 88 C16 70 26 48 44 2" stroke="#d4a64a" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
      {/* Side veins */}
      <path d="M12 75 C18 72 24 73 28 75" stroke="#9ae6b4" strokeWidth="0.8" opacity="0.7" />
      <path d="M16 62 C23 58 30 60 34 62" stroke="#9ae6b4" strokeWidth="0.8" opacity="0.7" />
      <path d="M22 47 C29 43 35 44 39 46" stroke="#9ae6b4" strokeWidth="0.8" opacity="0.7" />
      <path d="M28 32 C34 28 39 29 42 31" stroke="#9ae6b4" strokeWidth="0.8" opacity="0.7" />
      <defs>
        <linearGradient id="leafGreenGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1c4532" />
          <stop offset="40%" stopColor="#22543d" />
          <stop offset="80%" stopColor="#2f855a" />
          <stop offset="100%" stopColor="#48bb78" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/**
 * Traditional Mango Leaf & Marigold Thoranam (Festive Garland Border).
 */
export function FestiveThoranam({ className = '' }) {
  return (
    <svg
      viewBox="0 0 600 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full max-w-xl ${className}`}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      {/* Hanging rope line */}
      <line x1="0" y1="4" x2="600" y2="4" stroke="#d4a64a" strokeWidth="2" strokeDasharray="6 3" />

      {/* Mango leaves & marigold blossoms hanging along the rope */}
      {Array.from({ length: 11 }).map((_, i) => {
        const x = 30 + i * 54
        return (
          <g key={i}>
            {/* Mango leaf */}
            <path
              d={`M${x - 8} 4 C${x - 12} 16 ${x - 6} 28 ${x} 34 C${x + 6} 28 ${x + 12} 16 ${x + 8} 4 Z`}
              fill="#22543d"
              stroke="#d4a64a"
              strokeWidth="0.8"
            />
            {/* Center vein */}
            <line x1={x} y1="4" x2={x} y2="30" stroke="#ffd77f" strokeWidth="0.8" />
            {/* Orange/Yellow Marigold blossom */}
            <circle cx={x} cy="6" r="4.5" fill={i % 2 === 0 ? '#ff9900' : '#ffc107'} />
            <circle cx={x} cy="6" r="2.5" fill="#e65100" />
            <circle cx={x} cy="6" r="1.2" fill="#fff9c4" />
          </g>
        )
      })}
    </svg>
  )
}

/**
 * Traditional Indian Wedding Decorative Separator with Kalasam / Lotus Motif.
 */
export function TraditionalSeparator({ className = '' }) {
  return (
    <svg
      className={`w-full max-w-xs ${className}`}
      height="24"
      viewBox="0 0 240 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Left line */}
      <path d="M10 12 H95" stroke="#d4a64a" strokeWidth="1" opacity="0.8" />
      <circle cx="20" cy="12" r="1.5" fill="#d4a64a" />
      <path d="M85 8 L95 12 L85 16 Z" fill="#d4a64a" />

      {/* Center Lotus / Kalasam Motif */}
      <g transform="translate(120, 12)">
        {/* Diamond frame */}
        <polygon points="0,-9 9,0 0,9 -9,0" stroke="#d4a64a" strokeWidth="1" fill="#7a1230" />
        <circle cx="0" cy="0" r="3.2" fill="#ffb627" />
        <circle cx="0" cy="0" r="1.2" fill="#fff" />
        {/* Petals */}
        <path d="M0 -9 C-4 -14 4 -14 0 -9" fill="#d4a64a" />
        <path d="M-9 0 C-14 -4 -14 4 -9 0" fill="#d4a64a" />
        <path d="M9 0 C14 -4 14 4 9 0" fill="#d4a64a" />
        <path d="M0 9 C-4 14 4 14 0 9" fill="#d4a64a" />
      </g>

      {/* Right line */}
      <path d="M145 12 H230" stroke="#d4a64a" strokeWidth="1" opacity="0.8" />
      <path d="M155 8 L145 12 L155 16 Z" fill="#d4a64a" />
      <circle cx="220" cy="12" r="1.5" fill="#d4a64a" />
    </svg>
  )
}

