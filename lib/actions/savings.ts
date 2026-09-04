'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/data'
import { parseMoney } from '@/lib/format'
import type { ActionState } from '@/lib/types'

/**
 * Persiste quantia guardada + % do CDI.
 * A taxa anual (cdi_annual_rate) é gravada apenas como fallback para quando
 * a BrasilAPI estiver indisponível — o cálculo prioritário usa a API.
 */
export async function saveSavings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser()

  const amount = parseMoney(String(formData.get('amount') ?? '')) ?? 0
  const cdiPercent = parseMoney(String(formData.get('cdi_percent') ?? '')) ?? 0
  const cdiRate = parseMoney(String(formData.get('cdi_rate') ?? '')) ?? 10.5

  if (amount < 0) return { error: 'Informe um valor válido para a quantia guardada.' }
  if (cdiPercent <= 0 || cdiPercent > 500) return { error: 'O percentual do CDI deve estar entre 1% e 500%.' }
  if (cdiRate < 0 || cdiRate > 50) return { error: 'Taxa CDI fora do intervalo esperado (0% a 50%).' }

  const { error } = await supabase.from('savings').upsert(
    {
      user_id: user.id,
      amount,
      cdi_percent: cdiPercent,
      cdi_annual_rate: cdiRate,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )
  if (error) return { error: 'Não foi possível salvar as configurações.' }

  revalidatePath('/patrimonio')
  revalidatePath('/dashboard')
  return { success: 'Configurações salvas com sucesso.' }
}
