'use client'

import { useActionState, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Loader2, Zap } from 'lucide-react'
import { saveSavings } from '@/lib/actions/savings'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FormError } from '@/components/ui/form-error'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ProjectionChart } from '@/components/savings/projection-chart'
import { computeCdi } from '@/lib/finance'
import { formatBRL, formatDateBR, formatPct, parseMoney, toEditableNumber } from '@/lib/format'
import { cn } from '@/lib/cn'

interface CdiCalculatorProps {
  initial: {
    amount: number
    cdi_percent: number
    updated_at: string | null
  }
  apiRate: { value: number; source: 'api' | 'fallback' }
}

const PERCENT_CHIPS = [90, 100, 110]

export function CdiCalculator({ initial, apiRate }: CdiCalculatorProps) {
  // Estados em string → aceitam vírgula ou ponto ao digitar.
  const [amountStr, setAmountStr] = useState(toEditableNumber(initial.amount))
  const [percentStr, setPercentStr] = useState(toEditableNumber(initial.cdi_percent))
  const [state, formAction, pending] = useActionState(saveSavings, {})

  // A taxa anual vem da BrasilAPI (fallback offline = taxa salva).
  const annualRate = apiRate.value
  const amount = parseMoney(amountStr) ?? 0
  const cdiPercent = parseMoney(percentStr) ?? 0
  const result = computeCdi({ amount, annualRate, cdiPercent })

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-5">
        {/* ── Configuração ── */}
        <Card className="p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-200">Configuração</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            A taxa CDI é atualizada automaticamente; você ajusta apenas a quantia e o percentual.
          </p>

          <form action={formAction} className="mt-5 space-y-4">
            {/* Taxa vigente escondida — gravada como fallback offline */}
            <input type="hidden" name="cdi_rate" value={String(annualRate)} />

            <div>
              <Label htmlFor="savings-amount">Quantia guardada (R$)</Label>
              <Input id="savings-amount" name="amount" inputMode="decimal" placeholder="0,00"
                value={amountStr} onChange={e => setAmountStr(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="savings-percent">% do CDI aplicada</Label>
              <Input id="savings-percent" name="cdi_percent" inputMode="decimal" placeholder="100"
                value={percentStr} onChange={e => setPercentStr(e.target.value)} />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {PERCENT_CHIPS.map(value => (
                  <button key={value} type="button" onClick={() => setPercentStr(String(value))}
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
                      percentStr === String(value)
                        ? 'border-indigo-500/60 bg-indigo-500/10 text-indigo-300'
                        : 'border-white/10 text-slate-400 hover:border-white/25 hover:text-slate-200',
                    )}>
                    {value}%
                  </button>
                ))}
              </div>
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-200">Rendimento estimado</h2>

            {/* Indicador da taxa em tempo real */}
            <span className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium',
              apiRate.source === 'api'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-300',
            )}>
              {apiRate.source === 'api' ? (
                <>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  Taxa CDI atual: {formatPct(apiRate.value)} a.a. · via BrasilAPI
                </>
              ) : (
                <>
                  <Zap className="h-3 w-3" />
                  Offline — usando taxa salva ({formatPct(apiRate.value)} a.a.)
                </>
              )}
            </span>
          </div>

          {amount > 0 ? (
            <>
              <motion.p key={amountStr} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mt-4 max-w-lg text-sm leading-relaxed text-slate-300">
                Seu patrimônio de <span className="font-semibold text-slate-100">{formatBRL(amount)}</span> rende
                aproximadamente <span className="font-semibold text-emerald-400">{formatBRL(result.monthlyGross)}</span>{' '}
                por mês no CDI atual{cdiPercent !== 100 && <> ({formatPct(cdiPercent)} do CDI)</>}.
              </motion.p>

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
            * Taxa CDI consultada em tempo real na BrasilAPI (cache de 1h). Cálculo com capitalização
            composta mensal; o valor líquido desconta o IR simulado de 22,5% (faixa até 180 dias).
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
    <div className="rounded-lg border border-white/5 bg-slate-950/30 p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={cn('mt-1 text-sm font-semibold tabular-nums', className)}>{value}</p>
    </div>
  )
}