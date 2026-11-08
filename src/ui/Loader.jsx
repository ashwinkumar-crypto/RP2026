import { motion, AnimatePresence } from 'framer-motion'
import { coupleNames } from '../lib/format'
import { GaneshaEmblem } from './TraditionalMotifs'

/** Welcome screen remains until the guest enters the celebration. */
export default function Loader({ wedding, progress, ready, entered, onEnter }) {
  const pct = Math.round(progress)
  return (
    <AnimatePresence>
      {!entered && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center"
          style={{ background: 'radial-gradient(ellipse at 50% 40%, #2a0610 0%, #0b0205 70%)' }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          <div className="grain" />
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="relative z-10 flex flex-col items-center"
          >
            <GaneshaEmblem size={68} className="mb-3 drop-shadow-md" />
            {wedding.invocation && (
              <p className="mb-3 font-display text-base tracking-widest text-gold-light sm:text-lg">
                {wedding.invocation}
              </p>
            )}
            <p className="label mb-2 text-gold-light tracking-[0.24em]">
              {wedding.occasion?.journeyTitle || 'THE WEDDING JOURNEY'}
            </p>
            <h1 className="gold-text font-script text-[3.2rem] leading-[1.02] sm:text-[5.2rem]">
              {coupleNames(wedding)}
            </h1>
            <p className="mt-2 font-cinzel text-xs tracking-[0.22em] text-gold-light">
              {wedding.venue?.name}
            </p>

            <div className="mt-8 w-[min(78vw,320px)]">
              <div className="h-px w-full bg-gold/25">
                <div
                  className="h-px bg-gradient-to-r from-gold-dark via-gold-light to-gold transition-[width] duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-3 h-9">
                {ready ? (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    type="button"
                    className="btn-gold"
                    onClick={onEnter}
                  >
                    Enter Celebration
                  </motion.button>
                ) : (
                  <p className="label" style={{ fontSize: '0.62rem' }} aria-live="polite">
                    Preparing the celebration · {pct}%
                  </p>
                )}
              </div>
            </div>
            <p className="mt-10 max-w-xs font-display text-sm italic text-ivory-dim">
              Best with sound on. Background music starts on enter.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
