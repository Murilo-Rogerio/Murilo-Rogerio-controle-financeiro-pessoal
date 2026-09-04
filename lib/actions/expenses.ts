'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/data'
import { parseMoney } from '@/lib/format'
import type { ActionState, RecurrenceType } from '@/lib/types'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const CATEGORY_SLUG = /^(c:[0-9a-f-]{36}|[a-z]{2,30})$/ // built-in ou 'c:<uuid>'
const RECURRENCE_VALUES: RecurrenceType[] = ['unica', 'mensal', 'parcelada']

type ValidatedExpense = {
  name: string
  amount: number
  category: string
  spentAt: string
  recurrence: RecurrenceType
  installmentsTotal: number | null
  installmentNumber: number | null
}

function validate(formData: FormData): ValidatedExpense | { error: string } {
  const name = String(formData.get('name') ?? '').trim()
  const amount = parseMoney(String(formData.get('amount') ?? ''))
  const category = String(formData.get('category') ?? '')
  const spentAt = String(formData.get('spent_at') ?? '')
  const recurrence = String(formData.get('recurrence') ?? 'unica') as RecurrenceType

  if (!name) return { error: 'Informe um nome para o gasto.' }
  if (name.length > 120) return { error: 'O nome deve ter no máximo 120 caracteres.' }
  if (amount === null || amount <= 0) return { error: 'Informe um valor maior que zero.' }
  if (!CATEGORY_SLUG.test(category)) return { error: 'Selecione uma categoria válida.' }
  if (!ISO_DATE.test(spentAt)) return { error: 'Informe uma data válida.' }
  if (!RECURRENCE_VALUES.includes(recurrence)) return { error: 'Tipo de recorrência inválido.' }

  let installmentsTotal: number | null = null
  let installmentNumber: number | null = null
  if (recurrence === 'parcelada') {
    installmentsTotal = Number(formData.get('installments_total'))
    installmentNumber = Number(formData.get('installment_number') ?? 1)
    if (!Number.isInteger(installmentsTotal) || installmentsTotal < 2 || installmentsTotal > 48) {
      return { error: 'O total de parcelas deve ser entre 2 e 48.' }
    }
    if (!Number.isInteger(installmentNumber) || installmentNumber < 1 || installmentNumber > installmentsTotal) {
      return { error: 'A parcela atual deve estar entre 1 e o total de parcelas.' }
    }
  }

  return { name, amount, category, spentAt, recurrence, installmentsTotal, installmentNumber }
}

function revalidateFinances() {
  revalidatePath('/dashboard')
  revalidatePath('/gastos')
}

export async function createExpense(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser()
  const values = validate(formData)
  if ('error' in values) return { error: values.error }

  const { error } = await supabase.from('expenses').insert({
    user_id: user.id,
    name: values.name,
    amount: values.amount,
    category: values.category,
    spent_at: values.spentAt,
    recurrence: values.recurrence,
    installments_total: values.installmentsTotal,
    installment_number: values.installmentNumber,
  })
  if (error) return { error: 'Não foi possível salvar o gasto. Tente novamente.' }

  revalidateFinances()
  return { success: 'ok' }
}

export async function updateExpense(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireUser()
  const id = String(formData.get('id') ?? '')
  if (!id) return { error: 'Lançamento não encontrado.' }

  const values = validate(formData)
  if ('error' in values) return { error: values.error }

  const { error } = await supabase.from('expenses')
    .update({
      name: values.name,
      amount: values.amount,
      category: values.category,
      spent_at: values.spentAt,
      recurrence: values.recurrence,
      installments_total: values.installmentsTotal,
      installment_number: values.installmentNumber,
    })
    .eq('id', id)
  if (error) return { error: 'Não foi possível atualizar o gasto.' }

  revalidateFinances()
  return { success: 'ok' }
}

export async function deleteExpense(id: string) {
  const { supabase } = await requireUser()
  await supabase.from('expenses').delete().eq('id', id)
  revalidateFinances()
}
