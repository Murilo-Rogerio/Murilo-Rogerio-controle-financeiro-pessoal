import type { Metadata } from 'next'
import { MarketDashboard } from '@/components/investments/market-dashboard'
import { requireUser } from '@/lib/data'
import { fetchMarketQuotes } from '@/lib/api/markets'

export const metadata: Metadata = { title: 'Investimentos' }

export default async function InvestmentsPage() {
  const { supabase } = await requireUser()
  const { data } = await supabase.from('watchlist').select('*').order('created_at')

  const rows = (data ?? []).map(row => ({
    id: row.id as string,
    ticker: (row.ticker as string).toUpperCase(),
    type: row.asset_type as 'fii' | 'acao',
  }))

  const { quotes, source } = rows.length
    ? await fetchMarketQuotes(rows)
    : { quotes: [], source: 'mock' as const }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-100">Investimentos</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Monitoramento de FIIs e ações com métricas de risco x retorno.
        </p>
      </div>
      <MarketDashboard quotes={quotes} watchlist={rows} source={source} />
    </div>
  )
}
