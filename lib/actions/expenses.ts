'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/data'
import { parseMoney } from '@/lib/format'
import { EXPENSE_CATEGORY_VALUES } from '@/lib/categories'
import type { ActionState, ExpenseCategory } from '@/lib/types'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

type ValidatedExpense = {
  name: string
  amount: number
  category: ExpenseCategory
  spentAt: string
}

function validate(formData: FormData): ValidatedExpense | { error: string } {
  const name = String(formData.get('name') ?? '').trim()
  const amount = parseMoney(String(formData.get('amount') ?? ''))
  const category = String(formData.get('category') ?? '') as ExpenseCategory
  const spentAt = String(formData.get('spent_at') ?? '')

  if (!name) return { error: 'Informe um nome para o gasto.' }
  if (name.length > 120) return { error: 'O nome deve ter no máximo 120 caracteres.' }
  if (amount === null || amount <= 0) return { error: 'Informe um valor maior que zero.' }
  if (!EXPENSE_CATEGORY_VALUES.includes(category)) return { error: 'Selecione uma categoria válida.' }
  if (!ISO_DATE.test(spentAt)) return { error: 'Informe uma data válida.' }
  return { name, amount, category, spentAt }
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
    })
    .eq('id', id) // o RLS garante que apenas a linha do próprio usuário é afetada
  if (error) return { error: 'Não foi possível atualizar o gasto.' }

  revalidateFinances()
  return { success: 'ok' }
}

export async function deleteExpense(id: string) {
  const { supabase } = await requireUser()
  await supabase.from('expenses').delete().eq('id', id)
  revalidateFinances()
}