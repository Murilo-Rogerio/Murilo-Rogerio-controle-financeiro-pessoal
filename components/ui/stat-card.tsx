'use client'

import { useEffect, useRef, useState } from 'react'
import { animate, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowDownLeft, ArrowUpRight, Briefcase, PiggyBank, Sparkles, TrendingUp, Wallet,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatBRL } from '@/lib/format'
import { cn } from '@/lib/cn'

/* Mapa local de ícones (string → componente): mantém as props serializáveis
   entre Server e Client Components. */
const ICONS = {
  income: ArrowDownLeft,
  expense: ArrowUpRight,
  wallet: Wallet,
  savings: PiggyBank,
  briefcase: Briefcase,
  sparkles: Sparkles,
  trending: TrendingUp,
} as const

export type StatIcon = keyof typeof ICONS

interface StatCardProps {
  label: string
  value: string        // fallback textual (quando não há numeric)
  numeric?: number     // dispara o contador animado
  sub?: string
  icon: StatIcon
  tone?: string
  delay?: number       // stagger de entrada
}

/** Contador animado — anima de/para o valor anterior (sem "flash" no SSR). */
function Ticker({ value }: { value: number }) {
  const prefersNoMotion = useReducedMotion()
  const [display, setDisplay] = useState(value)
  const prevRef = useRef(value)

  useEffect(() => {
    if (prefersNoMotion) {
      setDisplay(value)
      prevRef.current = value
      return
    }
    const controls = animate(prevRef.current, value, {
      duration: 0.7,
      ease: 'easeOut',
      onUpdate: v => setDisplay(v),
    })
    prevRef.current = value
    return () => controls.stop()
  }, [value, prefersNoMotion])

  return <span className="tabular-nums">{formatBRL(display)}</span>
}

export function StatCard({ label, value, numeric, sub, icon, tone, delay = 0 }: StatCardProps) {
  const Icon = ICONS[icon]
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
    >
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
          <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', tone)}>
            <Icon className="h-4 w-4" />
          </span>
        </div>
        <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-100">
          {typeof numeric === 'number' ? <Ticker value={numeric} /> : value}
        </p>
        {sub && <p className="mt-1 truncate text-xs text-slate-500">{sub}</p>}
      </Card>
    </motion.div>
  )
}
