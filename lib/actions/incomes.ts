'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/data'
import { parseMoney } from '@/lib/format'
import { INCOME_SOURCE_VALUES } from '@/lib/categories'
import type { ActionState, IncomeSource } from '@/lib/types'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

type ValidatedIncome = {
  name: string
  amount: number
  sourceType: IncomeSource
  receivedAt: string
  isFixedMonthly: boolean
  dayOfMonth: number | null
}

function validate(formData: FormData): ValidatedIncome | { error: string } {
  const name = String(formData.get('name') ?? '').trim()
  const amount = parseMoney(String(formData.get('amount') ?? ''))
  const sourceType = String(formData.get('source_type') ?? '') as IncomeSource
  const receivedAt = String(formData.get('received_at') ?? '')
  const isFixedMonthly = formData.get('is_fixed_monthly') === 'on'
  const dayRaw = formData.get('day_of_month')
  const dayOfMonth = dayRaw === null || dayRaw === '' ? null : Number(dayRaw)

  if (!name) return { error: 'Informe um nome para a entrada.' }
  if (name.length > 120) return { error: 'O nome deve ter no máximo 120 caracteres.' }
  if (amount === null || amount <= 0) return { error: 'Informe um valor maior que zero.' }
  if (!INCOME_SOURCE_VALUES.includes(sourceType)) return { error: 'Selecione um tipo de entrada válido.' }
  if (!ISO_DATE.test(receivedAt)) return { error: 'Informe uma data válida.' }
  if (isFixedMonthly && (dayOfMonth === null || !Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31)) {
    return { error: 'Para entrada fixa mensal, informe o dia do mês (1 a 31).' }
  }

  return { name, amount, sourceType, receivedAt, isFixedMonthly, dayOfMonth }
}

function revalidateFinances() {
  revalidatePath('/dashboard')
  revalidatePath('/entradas')
  revalidatePath('/gastos')
}

export async function createIncome(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser()
  const values = validate(formData)
  if ('error' in values) return { error: values.error }

  const { error } = await supabase.from('incomes').insert({
    user_id: user.id,
    name: values.name,
    amount: values.amount,
    source_type: values.sourceType,
    received_at: values.receivedAt,
    is_fixed_monthly: values.isFixedMonthly,
    day_of_month: values.dayOfMonth,
  })
  if (error) return { error: 'Não foi possível salvar a entrada. Tente novamente.' }

  revalidateFinances()
  return { success: 'ok' }
}

export async function updateIncome(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireUser()
  const id = String(formData.get('id') ?? '')
  if (!id) return { error: 'Lançamento não encontrado.' }

  const values = validate(formData)
  if ('error' in values) return { error: values.error }

  const { error } = await supabase.from('incomes')
    .update({
      name: values.name,
      amount: values.amount,
      source_type: values.sourceType,
      received_at: values.receivedAt,
      is_fixed_monthly: values.isFixedMonthly,
      day_of_month: values.dayOfMonth,
    })
    .eq('id', id)
  if (error) return { error: 'Não foi possível atualizar a entrada.' }

  revalidateFinances()
  return { success: 'ok' }
}

export async function deleteIncome(id: string) {
  const { supabase } = await requireUser()
  await supabase.from('incomes').delete().eq('id', id)
  revalidateFinances()
}