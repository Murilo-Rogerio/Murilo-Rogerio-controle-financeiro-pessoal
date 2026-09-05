'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Coins } from 'lucide-react'

/** Offsets/delays fixos — evita mismatch de hidratação no SSR. */
const COINS = [
  { x: -96, delay: 0, dur: 1.05 },
  { x: -64, delay: 0.06, dur: 1.2 },
  { x: -32, delay: 0.02, dur: 1.1 },
  { x: 0, delay: 0, dur: 1.35 },
  { x: 32, delay: 0.08, dur: 1.15 },
  { x: 64, delay: 0.03, dur: 1.25 },
  { x: 96, delay: 0.1, dur: 1.05 },
]

/**
 * Feedback visual de transação: moedas subindo (verde, entradas)
 * ou descendo (vermelho, gastos) a partir do centro da tela.
 */
export function MoneyFeedback({ show, direction }: { show: boolean; direction: 'up' | 'down' }) {
  return (
    <AnimatePresence>
      {show && (
        <div className="pointer-events-none fixed inset-0 z-[70]">
          {COINS.map((coin, i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2"
              style={{ marginLeft: coin.x }}
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: direction === 'up' ? -190 - i * 14 : 190 + i * 14,
                scale: 1,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: coin.dur, delay: coin.delay, ease: 'easeOut' }}
            >
              <span
                className={
                  direction === 'up'
                    ? 'flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 shadow-lg shadow-emerald-500/20'
                    : 'flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/15 text-rose-400 shadow-lg shadow-rose-500/20'
                }
              >
                <Coins className="h-5 w-5" />
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}
