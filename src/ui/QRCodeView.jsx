import { useMemo } from 'react'
import { generateQRMatrix, getQRCodeSVGPath } from '../lib/qrcode'
import { mapsUrl } from '../lib/format'

export default function QRCodeView({ venue, size = 130, className = '' }) {
  const url = mapsUrl(venue)
  const { path, size: totalSize } = useMemo(() => {
    try {
      const matrix = generateQRMatrix(url)
      return getQRCodeSVGPath(matrix, 2)
    } catch (e) {
      console.warn('QR code generation failed:', e)
      return { path: '', size: 41 }
    }
  }, [url])

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        title="Scan or tap to open location in Google Maps"
        className="group relative block rounded-xl border border-gold/60 bg-[#fffdfa] p-2.5 shadow-lg shadow-black/40 transition-all duration-300 hover:border-gold hover:shadow-gold/20"
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${totalSize} ${totalSize}`}
          className="block aspect-square"
          shapeRendering="crispEdges"
        >
          <rect width={totalSize} height={totalSize} fill="#fffdfa" />
          <path d={path} fill="#4a081a" />
        </svg>
        <div className="absolute inset-0 rounded-xl bg-gold/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      </a>
      <p className="mt-2 text-center font-cinzel text-[0.68rem] tracking-[0.2em] text-gold-light">
        SCAN FOR LOCATION
      </p>
      <p className="text-center font-display text-xs italic text-ivory-dim">
        (or tap to open Maps)
      </p>
    </div>
  )
}

