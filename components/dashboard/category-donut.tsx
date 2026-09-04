'use client'

import { PieChart as PieChartIcon, Wallet } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { EmptyState } from '@/components/ui/empty-state'
import { formatBRL } from '@/lib/format'

export interface DonutDatum {
  name: string
  value: number
  color: string
}

/** Donut dos gastos por categoria + legenda com valores e percentuais. */
export function CategoryDonut({ data }: { data: DonutDatum[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (!data.length || total <= 0) {
    return (
      <EmptyState icon={PieChartIcon} title="Sem gastos neste mês"
        description="Os gastos aparecerão aqui, divididos por categoria, assim que você registrá-los." />
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="h-44 w-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name"
              innerRadius={54} outerRadius={80} paddingAngle={3} stroke="none"
              startAngle={90} endAngle={-270}>
              {data.map(d => <Cell key={d.name} fill={d.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="w-full space-y-2.5">
        {data.map(d => (
          <li key={d.name} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex items-center gap-2 text-slate-300">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
              {d.name}
            </span>
            <span className="tabular-nums text-slate-500">
              {formatBRL(d.value)} · {Math.round((d.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}