import { ArrowDownLeft } from 'lucide-react'
import { CATEGORY_META } from '@/lib/categories'
import { formatBRL, formatDayMonth } from '@/lib/format'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/cn'
import type { RecentItem } from '@/lib/types'

export function RecentList({ items }: { items: RecentItem[] }) {
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
        const meta = item.type === 'expense' && item.category ? CATEGORY_META[item.category] : null
        const Icon = meta?.icon ?? ArrowDownLeft
        return (
          <li key={`${item.type}-${item.id}`} className="flex items-center gap-3.5 px-5 py-3.5">
            <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
              item.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : meta?.badge)}>
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-100">{item.name}</p>
              <p className="text-xs text-slate-500">
                {item.type === 'income'
                  ? (item.source === 'fixo' ? 'Entrada fixa' : 'Entrada extra')
                  : meta?.label}
                {' · '}
                {formatDayMonth(item.date)}
              </p>
            </div>
            <span className={cn('shrink-0 text-sm font-semibold tabular-nums',
              item.type === 'income' ? 'text-emerald-300' : 'text-rose-300')}>
              {item.type === 'income' ? '+' : '−'}{formatBRL(item.amount)}
            </span>
          </li>
        )
      })}
    </ul>
  )
}