/**
 * Integração com a BrasilAPI (gratuita, sem chave).
 * Endpoint: https://brasilapi.com.br/api/taxas/v1/CDI → { nome, valor }
 *
 * Cache: fetch nativo do Next com revalidate de 1h (Server Components).
 * Fallback: 10,5% a.a. caso a API esteja fora (nunca quebra a UI).
 */
const FALLBACK_RATE = 10.5

export interface CdiRate {
  value: number
  source: 'api' | 'fallback'
}

export async function fetchCdiRate(): Promise<CdiRate> {
  try {
    const res = await fetch('https://brasilapi.com.br/api/taxas/v1/CDI', {
      next: { revalidate: 3600 }, // cache de 1 hora no servidor
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data = (await res.json()) as { nome?: string; valor?: number }
    let value = Number(data.valor)
    if (!Number.isFinite(value) || value <= 0) throw new Error('valor inválido')

    // A API pode retornar fração (0.1042) ou percentual (10.42) — normaliza.
    if (value < 1) value *= 100

    return { value: Math.round(value * 100) / 100, source: 'api' }
  } catch {
    return { value: FALLBACK_RATE, source: 'fallback' }
  }
}
