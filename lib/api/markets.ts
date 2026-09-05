import { toNumber } from '@/lib/format'

/**
 * Cotações de FIIs e ações via brapi.dev (gratuita; token opcional amplia o
 * limite diário). Cache de 5 minutos no servidor — apropriado para cotações.
 * Sem token/indisponível → dados de demonstração (a UI indica a origem).
 */
export type AssetType = 'fii' | 'acao'

export interface MarketQuote {
  ticker: string
  name: string
  type: AssetType
  price: number
  changePercent: number
  dividendYield: number | null
  pvp: number | null
  /** Proxy de risco: amplitude da faixa de 52 semanas (%) */
  riskScore: number
  /** Proxy de retorno: DY anual (FIIs) ou upside desde a mínima de 52 semanas (ações, %) */
  returnScore: number
  source: 'api' | 'mock'
}

export const SUGGESTIONS: { ticker: string; name: string; type: AssetType }[] = [
  { ticker: 'HGLG11', name: 'CSHG Logística', type: 'fii' },
  { ticker: 'MXRF11', name: 'Maxi Renda', type: 'fii' },
  { ticker: 'XPLG11', name: 'XP Logística', type: 'fii' },
  { ticker: 'ITUB4', name: 'Itaú Unibanco', type: 'acao' },
  { ticker: 'PETR4', name: 'Petrobras', type: 'acao' },
  { ticker: 'VALE3', name: 'Vale', type: 'acao' },
  { ticker: 'BBAS3', name: 'Banco do Brasil', type: 'acao' },
]

/** Dados de demonstração (fallback offline/sem token). */
const MOCK: Record<string, { name: string; type: AssetType; price: number; low: number; high: number; dy: number | null; pvp: number | null; change: number }> = {
  HGLG11: { name: 'CSHG Logística', type: 'fii', price: 158.4, low: 145.1, high: 162.9, dy: 8.6, pvp: 1.06, change: 0.4 },
  MXRF11: { name: 'Maxi Renda', type: 'fii', price: 10.18, low: 9.8, high: 10.85, dy: 12.9, pvp: 1.03, change: -0.2 },
  XPLG11: { name: 'XP Logística', type: 'fii', price: 97.5, low: 88.2, high: 103.4, dy: 8.9, pvp: 0.98, change: 0.8 },
  BRCR11: { name: 'BC Fund', type: 'fii', price: 68.9, low: 62.0, high: 74.5, dy: 9.8, pvp: 0.92, change: -0.5 },
  ITUB4: { name: 'Itaú Unibanco', type: 'acao', price: 33.42, low: 28.1, high: 39.7, dy: 6.4, pvp: null, change: 1.1 },
  PETR4: { name: 'Petrobras', type: 'acao', price: 38.9, low: 34.2, high: 42.6, dy: 12.1, pvp: null, change: -0.7 },
  VALE3: { name: 'Vale', type: 'acao', price: 61.2, low: 55.9, high: 71.3, dy: 8.1, pvp: null, change: 0.3 },
  BBAS3: { name: 'Banco do Brasil', type: 'acao', price: 27.3, low: 24.9, high: 32.1, dy: 8.9, pvp: null, change: 0.6 },
}

function buildQuote(
  ticker: string, type: AssetType, name: string | undefined,
  price: number, change: number, low: number, high: number,
  dy: number | null, pvp: number | null, source: 'api' | 'mock',
): MarketQuote {
  const safePrice = price > 0 ? price : 0
  const low52 = low > 0 ? Math.min(low, safePrice || low) : safePrice
  const high52 = high > 0 ? Math.max(high, safePrice) : safePrice

  const riskScore = safePrice > 0 && high52 > low52
    ? Math.min(200, Math.round(((high52 - low52) / safePrice) * 1000) / 10)
    : 0

  const returnScore = type === 'fii'
    ? Math.round((dy ?? 0) * 10) / 10
    : low52 > 0
      ? Math.round(((safePrice / low52) - 1) * 1000) / 10
      : Math.round(change * 10) / 10

  return {
    ticker, type, name: name ?? ticker,
    price: safePrice,
    changePercent: Math.round(change * 100) / 100,
    dividendYield: dy, pvp,
    riskScore, returnScore, source,
  }
}

export async function fetchMarketQuotes(
  assets: { ticker: string; type: AssetType }[],
): Promise<{ quotes: MarketQuote[]; source: 'api' | 'mock' }> {
  if (assets.length === 0) return { quotes: [], source: 'mock' }

  try {
    const token = process.env.BRAPI_TOKEN
    const tickers = assets.map(a => a.ticker.toUpperCase()).join(',')
    const url = `https://brapi.dev/api/quote/${tickers}?fundamental=true${token ? `&token=${token}` : ''}`

    const res = await fetch(url, { next: { revalidate: 300 } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data = (await res.json()) as { results?: any[] }
    const typeByTicker = new Map(assets.map(a => [a.ticker.toUpperCase(), a.type]))

    const quotes = (data.results ?? [])
      .map((r: any) => {
        const ticker = String(r.symbol ?? '').toUpperCase()
        const type = typeByTicker.get(ticker)
        if (!type) return null

        const dyRaw = r.dividend_yield ?? r.dividendYield ?? r.fundamentals?.dividend_yield
        const pvpRaw = r.p_vp ?? r.pvp ?? r.fundamentals?.p_vp
        const dy = dyRaw != null ? toNumber(dyRaw) : null
        const pvp = pvpRaw != null ? toNumber(pvpRaw) : null

        return buildQuote(
          ticker, type, r.name ?? r.shortName,
          toNumber(r.regularMarketPrice), toNumber(r.regularMarketChangePercent),
          toNumber(r.fiftyTwoWeekLow), toNumber(r.fiftyTwoWeekHigh),
          dy, pvp, 'api',
        )
      })
      .filter((q: MarketQuote | null): q is MarketQuote => q !== null)

    if (quotes.length === 0) throw new Error('sem resultados')

    return { quotes, source: 'api' }
  } catch {
    // Fallback: dados de demonstração (mesmas métricas, origem sinalizada na UI)
    const quotes = assets
      .map(a => {
        const mock = MOCK[a.ticker.toUpperCase()]
        if (!mock) return null
        return buildQuote(a.ticker, mock.type, mock.name, mock.price, mock.change, mock.low, mock.high, mock.dy, mock.pvp, 'mock')
      })
      .filter((q): q is MarketQuote => q !== null)
    return { quotes, source: 'mock' }
  }
}
