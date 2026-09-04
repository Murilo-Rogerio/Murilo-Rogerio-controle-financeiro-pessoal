'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ActionState } from '@/lib/types'

/** Traduz as mensagens do Supabase para mensagens amigáveis em PT-BR. */
function translateAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.'
  if (message.includes('User already registered')) return 'Já existe uma conta com este e-mail.'
  if (message.includes('at least 6 characters')) return 'A senha precisa ter no mínimo 6 caracteres.'
  if (message.includes('Email not confirmed')) return 'Confirme seu e-mail antes de entrar.'
  return 'Não foi possível concluir a operação. Tente novamente.'
}

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) return { error: 'Informe e-mail e senha.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: translateAuthError(error.message) }

  redirect('/dashboard')
}

export async function signUp(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirm_password') ?? '')

  if (!email || !password || !confirmPassword) return { error: 'Preencha todos os campos.' }
  if (password.length < 6) return { error: 'A senha precisa ter no mínimo 6 caracteres.' }
  if (password !== confirmPassword) return { error: 'As senhas não coincidem.' }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return { error: translateAuthError(error.message) }

  // Se "Confirmar e-mail" estiver ativo no Supabase, nenhuma sessão é criada aqui.
  if (!data.session) {
    return { success: 'Conta criada! Verifique seu e-mail para confirmar e entrar.' }
  }

  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}