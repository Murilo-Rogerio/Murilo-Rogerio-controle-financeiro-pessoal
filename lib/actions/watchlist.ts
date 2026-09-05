'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/data'
import type { ActionState } from '@/lib/types'

const TICKER_PATTERN = /^[A-Z0-9]{4,7}$/
const TYPES = ['fii', 'acao']

export async function addToWatchlist(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ticker = String(formData.get('ticker') ?? '').trim().toUpperCase()
  const assetType = String(formData.get('asset_type') ?? '')

  if (!TICKER_PATTERN.test(ticker)) {
    return { error: 'Ticker inválido. Use 4 a 7 letras/números (ex.: HGLG11, PETR4).' }
  }
  if (!TYPES.includes(assetType)) return { error: 'Selecione o tipo de ativo.' }

  const { supabase, user } = await requireUser()
  const { error } = await supabase.from('watchlist').insert({
    user_id: user.id,
    ticker,
    asset_type: assetType,
  })

  if (error?.message.includes('duplicate key') || error?.message.includes('unique')) {
    return { error: `${ticker} já está na sua lista.` }
  }
  if (error) return { error: 'Não foi possível adicionar o ativo.' }

  revalidatePath('/investimentos')
  return { success: 'ok' }
}

export async function removeFromWatchlist(id: string) {
  const { supabase } = await requireUser()
  await supabase.from('watchlist').delete().eq('id', id)
  revalidatePath('/investimentos')
}
