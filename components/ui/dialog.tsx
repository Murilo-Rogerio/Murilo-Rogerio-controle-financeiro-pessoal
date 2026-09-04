'use client'

import { useEffect, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

interface DialogProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  className?: string
}

/** Modal animado (fade + scale spring). Fecha com ESC, backdrop ou botão X. */
export function Dialog({ open, title, onClose, children, className }: DialogProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true">
          <motion.div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.18 }}
            className={cn(
              'relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl border border-white/10 bg-card p-5 shadow-2xl shadow-black/50 backdrop-blur-xl',
              className,
            )}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
              <button type="button" onClick={onClose} aria-label="Fechar"
                className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-200">
                <X className="h-4 w-4" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}