import { ArrowDownLeft, CalendarClock } from 'lucide-react'
import { resolveCategory } from '@/lib/categories'
import { formatBRL, formatDayMonth } from '@/lib/format'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/cn'
import type { Category, RecentItem } from '@/lib/types'

export function RecentList({ items, customCategories }: {
  items: RecentItem[]
  customCategories: Category[]
}) {
  if (items.length === 0) {
    return (
      <div className="px-5 pb-5 pt-3">
        <EmptyState icon={ArrowDownLeft} title="Nenhum movimento neste mês"
          description="Registre suas primeiras entradas e gastos para visualizar o histórico aqui." />
      </div>
    )
  }

  return (
    <ul className="mt-1 divide-y divide-slate-800/60">
      {items.map(item => {
        const info = item.type === 'expense' && item.categorySlug
          ? resolveCategory(item.categorySlug, customCategories)
          : null
        const Icon = info?.icon ?? ArrowDownLeft
        const color = info?.color ?? '#10B981'
        return (
          <li key={`${item.type}-${item.id}`} className="flex items-center gap-3.5 px-5 py-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${color}1A`, color }}>
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-100">{item.name}</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                <span>
                  {item.type === 'income'
                    ? (item.source === 'fixo' ? 'Entrada fixa' : 'Entrada extra')
                    : info?.label}
                  {' · '}
                  {formatDayMonth(item.date)}
                </span>
                {item.installment && (
                  <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-1.5 py-px text-[10px] font-medium text-indigo-300">
                    {item.installment.current}/{item.installment.total}
                  </span>
                )}
                {item.isFixedMonthly && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-px text-[10px] font-medium text-emerald-300">
                    <CalendarClock className="h-2.5 w-2.5" />fixa
                  </span>
                )}
                {item.isProjected && (
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-px text-[10px] font-medium text-amber-300">
                    previsto
                  </span>
                )}
              </div>
            </div>
            <span className={cn('shrink-0 text-sm font-semibold tabular-nums',
              item.isProjected
                ? 'text-slate-500'
                : item.type === 'income' ? 'text-emerald-300' : 'text-rose-300')}>
              {item.type === 'income' ? '+' : '−'}{formatBRL(item.amount)}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
