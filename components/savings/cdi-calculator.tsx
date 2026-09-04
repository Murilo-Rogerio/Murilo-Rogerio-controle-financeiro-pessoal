'use client'

import { useActionState, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { saveSavings } from '@/lib/actions/savings'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormError } from '@/components/ui/form-error'
import { ProjectionChart } from '@/components/savings/projection-chart'
import { computeCdi } from '@/lib/finance'
import { formatBRL, formatDateBR, formatPct, parseMoney, toEditableNumber } from '@/lib/format'
import { cn } from '@/lib/cn'

interface CdiCalculatorProps {
  initial: {
    amount: number
    cdi_annual_rate: number
    cdi_percent: number
    updated_at: string | null
  }
}

const PERCENT_CHIPS = [90, 100, 110]

export function CdiCalculator({ initial }: CdiCalculatorProps) {
  // Estados como string → aceitam vírgula ou ponto decimal ao digitar.
  const [amountStr, setAmountStr] = useState(toEditableNumber(initial.amount))
  const [rateStr, setRateStr] = useState(toEditableNumber(initial.cdi_annual_rate))
  const [percentStr, setPercentStr] = useState(toEditableNumber(initial.cdi_percent))
  const [state, formAction, pending] = useActionState(saveSavings, {})

  // Cálculo em tempo real — não depende de "salvar" para visualizar.
  const amount = parseMoney(amountStr) ?? 0
  const annualRate = parseMoney(rateStr) ?? 0
  const cdiPercent = parseMoney(percentStr) ?? 0
  const result = computeCdi({ amount, annualRate, cdiPercent })

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-5">
        {/* ── Configuração ── */}
        <Card className="p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-200">Configuração</h2>
          <p className="mt-0.5 text-xs text-slate-500">O cálculo atualiza em tempo real enquanto você digita.</p>

          <form action={formAction} className="mt-5 space-y-4">
            <div>
              <Label htmlFor="savings-amount">Quantia guardada (R$)</Label>
              <Input id="savings-amount" name="amount" inputMode="decimal" placeholder="0,00"
                value={amountStr} onChange={e => setAmountStr(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="savings-rate">Taxa CDI anual (%)</Label>
                <Input id="savings-rate" name="cdi_rate" inputMode="decimal" placeholder="10,5"
                  value={rateStr} onChange={e => setRateStr(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="savings-percent">% do CDI aplicada</Label>
                <Input id="savings-percent" name="cdi_percent" inputMode="decimal" placeholder="100"
                  value={percentStr} onChange={e => setPercentStr(e.target.value)} />
              </div>
            </div>

            {/* Atalhos de % do CDI */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-slate-600">Atalhos:</span>
              {PERCENT_CHIPS.map(value => (
                <button key={value} type="button" onClick={() => setPercentStr(String(value))}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
                    percentStr === String(value)
                      ? 'border-indigo-500/60 bg-indigo-500/10 text-indigo-300'
                      : 'border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200',
                  )}>
                  {value}%
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={pending}>
                {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                Salvar no Supabase
              </Button>
              {state.success && (
                <p className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <Check className="h-3.5 w-3.5" /> {state.success}
                </p>
              )}
            </div>

            <FormError message={state.error} />

            {initial.updated_at && (
              <p className="text-[11px] text-slate-600">
                Última atualização: {formatDateBR(initial.updated_at.slice(0, 10))}
              </p>
            )}
          </form>
        </Card>

        {/* ── Resultado ── */}
        <Card className="p-5 lg:col-span-3">
          <h2 className="text-sm font-semibold text-slate-200">Rendimento estimado</h2>

          {amount > 0 ? (
            <>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-300">
                Seu patrimônio de <span className="font-semibold text-slate-100">{formatBRL(amount)}</span> rende
                aproximadamente <span className="font-semibold text-emerald-400">{formatBRL(result.monthlyGross)}</span>{' '}
                por mês no CDI atual{cdiPercent !== 100 && <> ({formatPct(cdiPercent)} do CDI)</>}.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Metric label="Bruto / mês" value={formatBRL(result.monthlyGross)} className="text-emerald-400" />
                <Metric label="Líquido / mês" value={formatBRL(result.monthlyNet)} className="text-indigo-300" />
                <Metric label="Bruto / ano" value={formatBRL(result.yearlyGross)} className="text-emerald-400" />
                <Metric label="Líquido / ano" value={formatBRL(result.yearlyNet)} className="text-indigo-300" />
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              Registre ao lado a quantia guardada para simular o rendimento no CDI.
            </p>
          )}

          <p className="mt-5 text-[11px] leading-relaxed text-slate-600">
            * Cálculo com capitalização composta mensal. O valor líquido desconta o IR simulado de 22,5%,
            faixa vigente para aplicações de até 180 dias (tabela regressiva do imposto de renda).
          </p>
        </Card>
      </div>

      {/* ── Projeção 12 meses ── */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-200">Projeção para 12 meses</h2>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-indigo-500" />Bruto</span>
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-emerald-500" />Líquido (após IR)</span>
          </div>
        </div>
        <div className="mt-4">
          <ProjectionChart data={result.projection} />
        </div>
      </Card>
    </div>
  )
}

function Metric({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="rounded-lg border border-slate-800/60 bg-slate-950/30 p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={cn('mt-1 text-sm font-semibold tabular-nums', className)}>{value}</p>
    </div>
  )
}