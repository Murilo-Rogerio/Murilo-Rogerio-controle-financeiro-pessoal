'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ActionState } from '@/lib/types'

/**
 * Tradução detalhada dos erros do Supabase — o fix do "tente novamente"
 * intermitente: quase sempre era rate limit ou redirect URL não autorizado,
 * e o usuário só via a mensagem genérica.
 */
function translateAuthError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return 'E-mail ou senha incorretos.'
  if (m.includes('user already registered')) return 'Já existe uma conta com este e-mail.'
  if (m.includes('at least 6 characters')) return 'A senha precisa ter no mínimo 6 caracteres.'
  if (m.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.'
  if (m.includes('rate limit') || m.includes('over_email_send_limit') || m.includes('too many') || m.includes('over 50'))
    return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.'
  if (m.includes('redirect'))
    return 'URL de redirecionamento não autorizada. Adicione-a em Supabase → Authentication → URL Configuration.'
  if (m.includes('signups not allowed'))
    return 'Cadastros desabilitados no servidor. Ative em Supabase → Authentication → Providers.'
  if (m.includes('network') || m.includes('fetch failed'))
    return 'Falha de conexão. Verifique sua internet e tente novamente.'
  if (m.includes('password should be'))
    return 'A senha não atende aos requisitos mínimos de segurança.'
  return 'Não foi possível concluir agora. Tente novamente em instantes.'
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

  // Redireciona o clique no e-mail de confirmação para o nosso callback.
  // A URL precisa estar na allowlist do Supabase (seção 2).
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const options = siteUrl ? { emailRedirectTo: `${siteUrl}/auth/callback` } : undefined

  const { data, error } = await supabase.auth.signUp({ email, password, options })
  if (error) return { error: translateAuthError(error.message) }

  if (!data.session) {
    return { success: 'Conta criada! Acesse seu e-mail (inclusive spam) e clique no link de confirmação.' }
  }

  redirect('/dashboard')
}

/**
 * "Esqueci minha senha": envia o e-mail de redefinição.
 * Mensagem genérica por segurança (não revela se o e-mail existe).
 */
export async function requestPasswordReset(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  if (!email) return { error: 'Informe seu e-mail cadastrado.' }

  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const options = siteUrl ? { redirectTo: `${siteUrl}/redefinir-senha` } : undefined

  const { error } = await supabase.auth.resetPasswordForEmail(email, options)

  if (error && /rate|limit/i.test(error.message)) {
    return { error: 'Muitas solicitações. Aguarde alguns minutos antes de tentar novamente.' }
  }

  return { success: 'Se existir uma conta com este e-mail, você receberá o link de redefinição em instantes.' }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
