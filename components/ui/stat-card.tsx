import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/cn'

interface StatCardProps {
  label: string
  value: string
  sub?: string
  icon: LucideIcon
  /** Classes completas do "tom" do ícone, ex.: 'bg-emerald-500/10 text-emerald-400' */
  tone?: string
}

export function StatCard({ label, value, sub, icon: Icon, tone }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
        {Icon && (
          <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', tone)}>
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums text-slate-100">{value}</p>
      {sub && <p className="mt-1 truncate text-xs text-slate-500">{sub}</p>}
    </Card>
  )
}