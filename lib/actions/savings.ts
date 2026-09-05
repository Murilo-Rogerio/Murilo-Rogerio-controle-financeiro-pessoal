'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/data'
import { formatBRL, parseMoney, toNumber } from '@/lib/format'
import type { ActionState } from '@/lib/types'

/** Persiste quantia guardada + % do CDI (taxa anual = fallback offline). */
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

/** "Retirar dinheiro": resgata do cofrinho e registra o movimento. */
export async function withdrawSavings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser()

  const amount = parseMoney(String(formData.get('amount') ?? ''))
  if (amount === null || amount <= 0) return { error: 'Informe o valor do resgate.' }

  const { data: savings } = await supabase
    .from('savings')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  const current = savings ? toNumber(savings.amount) : 0
  if (current <= 0) return { error: 'Você não tem saldo guardado para resgatar.' }
  if (amount > current) {
    return { error: `Valor acima do saldo disponível (${formatBRL(current)}).` }
  }

  const { error: movementError } = await supabase.from('savings_movements').insert({
    user_id: user.id,
    type: 'resgate',
    amount,
  })
  if (movementError) return { error: 'Não foi possível registrar o resgate.' }

  const { error: updateError } = await supabase
    .from('savings')
    .upsert(
      {
        id: savings?.id,
        user_id: user.id,
        amount: Math.round((current - amount) * 100) / 100,
        cdi_percent: savings ? toNumber(savings.cdi_percent) : 100,
        cdi_annual_rate: savings ? toNumber(savings.cdi_annual_rate) : 10.5,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
  if (updateError) return { error: 'Resgate registrado, mas o saldo não foi atualizado. Contate o suporte.' }

  revalidatePath('/patrimonio')
  revalidatePath('/dashboard')
  return { success: `Resgate de ${formatBRL(amount)} realizado. Novo saldo: ${formatBRL(current - amount)}.` }
}
