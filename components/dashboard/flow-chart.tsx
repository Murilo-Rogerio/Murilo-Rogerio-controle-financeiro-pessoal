'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatBRL, formatCompact } from '@/lib/format'
import type { FlowRow } from '@/lib/types'

/** Barras mensais: Entradas (verde) · Saídas (rosa) · CDI estimado (indigo). */
export function FlowChart({ data }: { data: FlowRow[] }) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barGap={4}>
          <CartesianGrid vertical={false} stroke="#1E293B" strokeDasharray="4 4" />
          <XAxis dataKey="label" axisLine={false} tickLine={false}
            tick={{ fill: '#64748B', fontSize: 12 }} dy={6} />
          <YAxis axisLine={false} tickLine={false} width={44}
            tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={formatCompact} />
          <Tooltip content={<FlowTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.06)' }} />
          <Bar dataKey="entradas" name="Entradas" fill="#10B981" radius={[5, 5, 0, 0]} maxBarSize={26} />
          <Bar dataKey="saidas" name="Saídas" fill="#F43F5E" radius={[5, 5, 0, 0]} maxBarSize={26} />
          <Bar dataKey="rendimento" name="CDI (estimado)" fill="#6366F1" radius={[5, 5, 0, 0]} maxBarSize={26} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function FlowTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/95 px-3 py-2 shadow-xl">
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} className="flex items-center gap-2 py-0.5 text-xs text-slate-300">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.name}:
          <span className="font-medium tabular-nums text-slate-100">{formatBRL(entry.value)}</span>
        </p>
      ))}
    </div>
  )
}