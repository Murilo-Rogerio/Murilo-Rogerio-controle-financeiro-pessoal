'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/data'
import { ICON_MAP } from '@/lib/categories'
import type { ActionState } from '@/lib/types'

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/

function revalidateCategories() {
  revalidatePath('/gastos')
  revalidatePath('/dashboard')
  revalidatePath('/entradas')
}

type ValidatedCategory = { name: string; color: string; icon: string }

function validate(formData: FormData): ValidatedCategory | { error: string } {
  const name = String(formData.get('name') ?? '').trim()
  const color = String(formData.get('color') ?? '')
  const icon = String(formData.get('icon') ?? '')

  if (name.length < 1 || name.length > 40) return { error: 'O nome deve ter entre 1 e 40 caracteres.' }
  if (!HEX_COLOR.test(color)) return { error: 'Selecione uma cor válida.' }
  if (!ICON_MAP[icon]) return { error: 'Selecione um ícone válido.' }

  return { name, color, icon }
}

export async function createCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser()
  const values = validate(formData)
  if ('error' in values) return { error: values.error }

  const { error } = await supabase.from('categories').insert({
    user_id: user.id,
    name: values.name,
    color: values.color,
    icon: values.icon,
  })
  if (error?.message.includes('duplicate key')) {
    return { error: 'Já existe uma categoria com esse nome.' }
  }
  if (error) return { error: 'Não foi possível criar a categoria.' }

  revalidateCategories()
  return { success: 'ok' }
}

export async function updateCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireUser()
  const id = String(formData.get('id') ?? '')
  if (!id) return { error: 'Categoria não encontrada.' }

  const values = validate(formData)
  if ('error' in values) return { error: values.error }

  const { error } = await supabase.from('categories')
    .update({ name: values.name, color: values.color, icon: values.icon })
    .eq('id', id)
  if (error?.message.includes('duplicate key')) {
    return { error: 'Já existe uma categoria com esse nome.' }
  }
  if (error) return { error: 'Não foi possível atualizar a categoria.' }

  revalidateCategories()
  return { success: 'ok' }
}

export async function deleteCategory(id: string) {
  const { supabase } = await requireUser()
  // Gastos antigos com essa categoria passam a resolver como "Outros".
  await supabase.from('categories').delete().eq('id', id)
  revalidateCategories()
}
