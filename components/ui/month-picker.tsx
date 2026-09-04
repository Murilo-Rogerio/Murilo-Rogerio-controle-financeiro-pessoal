'use client'

import { usePathname, useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { currentMonthKey, monthTitle, shiftMonth } from '@/lib/date'

/** Navega entre meses via query param (?mes=YYYY-MM) — inclusive futuros (projeções). */
export function MonthPicker({ monthKey }: { monthKey: string }) {
  const router = useRouter()
  const pathname = usePathname()

  const go = (delta: number) => {
    router.push(`${pathname}?mes=${shiftMonth(monthKey, delta)}`)
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-white/5 bg-card/60 p-1 backdrop-blur-md">
      <button type="button" onClick={() => go(-1)} aria-label="Mês anterior"
        className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-slate-100">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="min-w-[118px] text-center text-sm font-medium text-slate-200">
        {monthTitle(monthKey)}
      </span>
      <button type="button" onClick={() => go(1)} aria-label="Próximo mês"
        className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-slate-100">
        <ChevronRight className="h-4 w-4" />
      </button>
      {monthKey !== currentMonthKey() && (
        <button type="button" onClick={() => router.push(pathname)}
          className="rounded-md px-2 py-1 text-[11px] font-medium text-indigo-300 transition-colors hover:bg-indigo-500/10">
          Hoje
        </button>
      )}
    </div>
  )
}