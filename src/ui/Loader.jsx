import { motion, AnimatePresence } from 'framer-motion'

/** Minimal loading indicator; the entrance scene appears as soon as it is ready. */
export default function Loader({ progress, ready }) {
  const pct = Math.round(progress)
  return (
    <AnimatePresence>
      {!ready && (
        <motion.div
          key="loader"
          className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center"
          style={{ background: 'radial-gradient(ellipse at 50% 40%, #2a0610 0%, #0b0205 70%)' }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          <div className="grain" />
          <div className="relative z-10 w-[min(78vw,320px)]">
            <p className="label mb-3 text-gold-light" role="status" aria-live="polite">
              Preparing the wedding hall · {pct}%
            </p>
            <div className="h-px w-full bg-gold/25">
              <div
                className="h-px bg-gradient-to-r from-gold-dark via-gold-light to-gold transition-[width] duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
