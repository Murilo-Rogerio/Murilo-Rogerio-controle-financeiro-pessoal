'use client'

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatBRL, formatCompact } from '@/lib/format'
import type { CdiProjectionPoint } from '@/lib/finance'

/** Curvas de evolução do patrimônio em 12 meses: bruto x líquido (após IR). */
export function ProjectionChart({ data }: { data: CdiProjectionPoint[] }) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#1E293B" strokeDasharray="4 4" />
          <XAxis dataKey="label" axisLine={false} tickLine={false}
            tick={{ fill: '#64748B', fontSize: 12 }} dy={6} />
          <YAxis axisLine={false} tickLine={false} width={52}
            tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={formatCompact} />
          <Tooltip content={<ProjectionTooltip />} cursor={{ stroke: '#334155' }} />
          <Line dataKey="bruto" name="Bruto" stroke="#6366F1" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          <Line dataKey="liquido" name="Líquido (após IR)" stroke="#10B981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function ProjectionTooltip({ active, payload, label }: any) {
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