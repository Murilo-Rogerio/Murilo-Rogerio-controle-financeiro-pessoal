'use client'

import { useActionState, useTransition } from 'react'
import { motion } from 'framer-motion'
import {
  CartesianGrid, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis,
} from 'recharts'
import { LineChart, Plus, Trash2 } from 'lucide-react'
import { addToWatchlist, removeFromWatchlist } from '@/lib/actions/watchlist'
import { SUGGESTIONS, type MarketQuote } from '@/lib/api/markets'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FormError } from '@/components/ui/form-error'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { formatBRL } from '@/lib/format'
import { cn } from '@/lib/cn'

interface WatchlistRow { id: string; ticker: string; type: 'fii' | 'acao' }

interface MarketDashboardProps {
  quotes: MarketQuote[]
  watchlist: WatchlistRow[]
  source: 'api' | 'mock'
}

export function MarketDashboard({ quotes, watchlist, source }: MarketDashboardProps) {
  const [addState, formAction, pending] = useActionState(addToWatchlist, {})
  const [isRemoving, startRemove] = useTransition()

  const rowIdByTicker = new Map(watchlist.map(row => [row.ticker, row.id]))

  const scatterData = quotes.map(q => ({
    x: q.riskScore, y: q.returnScore, ticker: q.ticker, name: q.name, price: q.price, type: q.type,
  }))
  const fiiData = scatterData.filter(d => d.type === 'fii')
  const acaoData = scatterData.filter(d => d.type === 'acao')

  return (
    <div className="space-y-6">
      {/* Badge de origem dos dados */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">Monitoramento em tempo real · cache de 5 min</p>
        <span className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium',
          source === 'api'
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
            : 'border-amber-500/30 bg-amber-500/10 text-amber-300',
        )}>
          <span className={cn('h-1.5 w-1.5 rounded-full', source === 'api' ? 'bg-emerald-400' : 'bg-amber-400')} />
          {source === 'api' ? 'Cotações ao vivo · brapi.dev' : 'Dados de demonstração (API offline ou sem token)'}
        </span>
      </div>

      {/* Risco x Retorno */}
      {quotes.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-200">Risco x Retorno</h2>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-emerald-500" />FIIs</span>
                <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-indigo-500" />Ações</span>
              </div>
            </div>
            <div className="mt-4 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                  <CartesianGrid vertical={false} stroke="#1E293B" strokeDasharray="4 4" />
                  <XAxis type="number" dataKey="x" name="Risco" axisLine={false} tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 11 }} unit="%"
                    label={{ value: 'Risco (amplitude 52 sem.)', position: 'insideBottom', offset: -4, fill: '#475569', fontSize: 10 }} />
                  <YAxis type="number" dataKey="y" name="Retorno" axisLine={false} tickLine={false} width={40}
                    tick={{ fill: '#64748B', fontSize: 11 }} unit="%"
                    label={{ value: 'Retorno estimado', angle: -90, position: 'insideLeft', fill: '#475569', fontSize: 10 }} />
                  <Tooltip content={<ScatterTooltip />} cursor={{ stroke: '#334155' }} />
                  <ReferenceLine y={0} stroke="#334155" />
                  <Scatter data={fiiData} fill="#10B981" />
                  <Scatter data={acaoData} fill="#6366F1" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-200">Como ler o gráfico</h2>
            <ul className="mt-3 space-y-3 text-xs leading-relaxed text-slate-500">
              <li><span className="font-medium text-slate-300">Eixo X — Risco:</span> amplitude da faixa de preço das últimas 52 semanas. Quanto maior, mais volátil o ativo tende a ser.</li>
              <li><span className="font-medium text-slate-300">Eixo Y — Retorno:</span> FIIs usam o dividend yield anual; ações usam o potencial de valorização desde a mínima de 52 semanas.</li>
              <li><span className="font-medium text-slate-300">Quadrante ideal:</span> canto superior esquerdo — maior retorno estimado com menor risco.</li>
            </ul>
          </Card>
        </div>
      )}

      {/* Cards dos ativos */}
      {quotes.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {quotes.map((quote, i) => {
            const rowId = rowIdByTicker.get(quote.ticker)
            return (
              <motion.div key={quote.ticker}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}>
                <Card className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold tracking-tight text-slate-100">{quote.ticker}</p>
                      <p className="text-xs text-slate-500">{quote.name}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium',
                        quote.type === 'fii' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-indigo-500/10 text-indigo-300')}>
                        {quote.type === 'fii' ? 'FII' : 'Ação'}
                      </span>
                      {rowId && (
                        <Button variant="ghost" size="icon" aria-label="Remover da lista"
                          disabled={isRemoving} onClick={() => startRemove(() => removeFromWatchlist(rowId))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <p className="mt-3 text-2xl font-semibold tabular-nums text-slate-100">
                    {formatBRL(quote.price)}
                    <span className={cn('ml-2 align-middle text-xs font-medium',
                      quote.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                      {quote.changePercent >= 0 ? '▲' : '▼'} {Math.abs(quote.changePercent).toFixed(2)}%
                    </span>
                  </p>

                  <div className="mt-4 space-y-2 text-xs">
                    {quote.dividendYield != null && (
                      <Row label="Dividend yield (a.a.)" value={`${quote.dividendYield.toFixed(1)}%`} />
                    )}
                    {quote.pvp != null && (
                      <Row label="P/VP" value={quote.pvp.toFixed(2)} />
                    )}
                    <Row label="Risco (amplitude 52s)" value={`${quote.riskScore.toFixed(0)}%`} />
                    <Row label="Retorno estimado" value={`${quote.returnScore.toFixed(1)}%`} />
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <LineChart className="mx-auto h-8 w-8 text-slate-600" />
          <p className="mt-3 text-sm font-medium text-slate-300">Sua lista de monitoramento está vazia</p>
          <p className="mt-1 text-xs text-slate-500">Adicione ativos abaixo (ou use as sugestões) para acompanhar cotações e métricas.</p>
        </Card>
      )}

      {/* Adicionar ativo */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-slate-200">Adicionar ativo</h2>
        <form action={formAction} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <Label htmlFor="ticker">Ticker</Label>
            <Input id="ticker" name="ticker" placeholder="Ex.: HGLG11, PETR4"
              maxLength={7} className="uppercase" required />
          </div>
          <div>
            <Label htmlFor="asset-type">Tipo</Label>
            <Select id="asset-type" name="asset_type" defaultValue="fii" required>
              <option value="fii">Fundo imobiliário (FII)</option>
              <option value="acao">Ação</option>
            </Select>
          </div>
          <Button type="submit" disabled={pending} className="w-full sm:w-auto">
            {pending ? 'Adicionando…' : <><Plus className="h-4 w-4" />Monitorar</>}
          </Button>
          <div className="sm:col-span-3">
            <FormError message={addState.error} />
          </div>
        </form>

        {/* Sugestões */}
        <div className="mt-4 border-t border-white/5 pt-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-600">Sugestões</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => {
              const inList = rowIdByTicker.has(s.ticker)
              return inList ? (
                <span key={s.ticker}
                  className="rounded-full border border-white/5 bg-slate-800/40 px-3 py-1.5 text-[11px] text-slate-500">
                  {s.ticker} · na lista
                </span>
              ) : (
                <form key={s.ticker} action={formAction}>
                  <input type="hidden" name="ticker" value={s.ticker} />
                  <input type="hidden" name="asset_type" value={s.type} />
                  <button type="submit" disabled={pending}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-medium text-slate-300 transition-colors hover:border-emerald-500/40 hover:text-emerald-300">
                    + {s.ticker}
                  </button>
                </form>
              )
            })}
          </div>
        </div>
      </Card>

      <p className="text-[11px] leading-relaxed text-slate-600">
        * Métricas de referência calculadas a partir de dados públicos (brapi.dev). Conteúdo informativo —
        não constitui recomendação de investimento.
      </p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium tabular-nums text-slate-300">{value}</span>
    </div>
  )
}

function ScatterTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/95 px-3 py-2 shadow-xl">
      <p className="text-xs font-semibold text-slate-100">{d.ticker}</p>
      <p className="text-[11px] text-slate-500">{d.name}</p>
      <p className="mt-1.5 text-[11px] text-slate-300">Preço: {formatBRL(d.price)}</p>
      <p className="text-[11px] text-slate-300">Risco: {d.x}% · Retorno: {d.y}%</p>
    </div>
  )
}
