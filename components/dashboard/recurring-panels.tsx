'use client'

import { motion } from 'framer-motion'
import { CalendarClock, CalendarPlus, Repeat } from 'lucide-react'
import { resolveCategory } from '@/lib/categories'
import { formatBRL, formatDayMonth } from '@/lib/format'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/cn'
import type { Category } from '@/lib/types'

export interface BillItem {
  id: string
  name: string
  amount: number
  date: string
  installment: { current: number; total: number } | null
  isMonthly: boolean
  isProjected: boolean
  slug: string
}

export interface UpcomingIncomeItem {
  id: string
  name: string
  amount: number
  date: string
}

export interface InstallmentItem {
  id: string
  name: string
  amount: number
  current: number
  total: number
}

interface RecurringPanelsProps {
  bills: BillItem[]
  billsTotal: number
  monthLabel: string
  upcoming: UpcomingIncomeItem[]
  upcomingLabel: string
  installments: InstallmentItem[]
  installmentsRemaining: number
  customCategories: Category[]
}

/** Painéis: "Contas do mês / parcelamentos ativos" e "Próximas entradas previstas". */
export function RecurringPanels({
  bills, billsTotal, monthLabel, upcoming, upcomingLabel,
  installments, installmentsRemaining, customCategories,
}: RecurringPanelsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* ── Contas do mês + parcelamentos ativos ── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15, ease: 'easeOut' }} className="lg:col-span-2">
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Repeat className="h-4 w-4 text-indigo-400" />
              Contas do mês
            </h2>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-white/10 bg-slate-950/40 px-2.5 py-1 text-[11px] text-slate-400">
                {monthLabel}
              </span>
              <span className="text-sm font-semibold tabular-nums text-slate-200">{formatBRL(billsTotal)}</span>
            </div>
          </div>

          {bills.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {bills.map(bill => {
                const info = resolveCategory(bill.slug, customCategories)
                const Icon = info.icon
                return (
                  <li key={bill.id} className="flex items-center gap-3 rounded-lg border border-white/5 bg-slate-950/30 px-3 py-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${info.color}1A`, color: info.color }}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-100">{bill.name}</p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                        <span>{formatDayMonth(bill.date)}</span>
                        {bill.installment && (
                          <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-1.5 py-px text-[10px] font-medium text-indigo-300">
                            {bill.installment.current}/{bill.installment.total}
                          </span>
                        )}
                        {bill.isMonthly && <span className="text-slate-600">mensal</span>}
                        {bill.isProjected && (
                          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-px text-[10px] font-medium text-amber-300">
                            previsto
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={cn('shrink-0 text-sm font-semibold tabular-nums',
                      bill.isProjected ? 'text-slate-500' : 'text-slate-300')}>
                      {formatBRL(bill.amount)}
                    </span>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-slate-800 px-3 py-4 text-center text-xs text-slate-600">
              Nenhuma conta recorrente ou parcelada neste mês.
            </p>
          )}

          {/* ── Parcelamentos ativos (progresso) ── */}
          {installments.length > 0 && (
            <div className="mt-5 border-t border-white/5 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Parcelamentos ativos
                </h3>
                <span className="text-[11px] text-slate-500">
                  restam <span className="font-semibold text-indigo-300">{formatBRL(installmentsRemaining)}</span> no total
                </span>
              </div>
              <ul className="mt-3 space-y-3">
                {installments.map(series => (
                  <li key={series.id}>
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="truncate text-slate-300">{series.name}</span>
                      <span className="shrink-0 tabular-nums text-slate-500">
                        {formatBRL(series.amount)}/mês · {series.current}/{series.total}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-800/80">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (series.current / series.total) * 100)}%` }}
                        transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </motion.div>

      {/* ── Próximas entradas previstas ── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.25, ease: 'easeOut' }}>
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <CalendarPlus className="h-4 w-4 text-emerald-400" />
              Próximas entradas previstas
            </h2>
            <span className="rounded-full border border-white/10 bg-slate-950/40 px-2.5 py-1 text-[11px] text-slate-400">
              {upcomingLabel}
            </span>
          </div>

          {upcoming.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {upcoming.map(item => (
                <li key={item.id} className="flex items-center gap-3 rounded-lg border border-white/5 bg-slate-950/30 px-3 py-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                    <CalendarClock className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-100">{item.name}</p>
                    <p className="text-[11px] text-slate-500">{formatDayMonth(item.date)}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-emerald-300">
                    +{formatBRL(item.amount)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-slate-800 px-3 py-4 text-center text-xs text-slate-600">
              Nenhuma entrada fixa futura registrada.
            </p>
          )}
        </Card>
      </motion.div>
    </div>
  )
}