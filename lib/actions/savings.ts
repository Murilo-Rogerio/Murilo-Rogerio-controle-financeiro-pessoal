'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/data'
import { parseMoney } from '@/lib/format'
import type { ActionState } from '@/lib/types'

/** Persiste a quantia guardada + parâmetros do CDI (1 linha por usuário). */
export async function saveSavings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser()

  const amount = parseMoney(String(formData.get('amount') ?? '')) ?? 0
  const cdiRate = parseMoney(String(formData.get('cdi_rate') ?? '')) ?? 0
  const cdiPercent = parseMoney(String(formData.get('cdi_percent') ?? '')) ?? 0

  if (amount < 0) return { error: 'Informe um valor válido para a quantia guardada.' }
  if (cdiRate < 0 || cdiRate > 50) return { error: 'A taxa CDI anual deve estar entre 0% e 50%.' }
  if (cdiPercent <= 0 || cdiPercent > 500) return { error: 'O percentual do CDI deve estar entre 1% e 500%.' }

  const { error } = await supabase.from('savings').upsert(
    {
      user_id: user.id,
      amount,
      cdi_annual_rate: cdiRate,
      cdi_percent: cdiPercent,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }, // resolve o conflito pela unicidade de user_id
  )
  if (error) return { error: 'Não foi possível salvar as configurações.' }

  revalidatePath('/patrimonio')
  revalidatePath('/dashboard')
  return { success: 'Configurações salvas com sucesso.' }
}