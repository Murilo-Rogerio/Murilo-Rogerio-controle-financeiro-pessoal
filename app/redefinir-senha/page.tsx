'use client'

import { Suspense, useEffect, useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle, CheckCircle2, Loader2, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'

function ResetPasswordInner() {
  const router = useRouter()
  const params = useSearchParams()
  const code = params.get('code')

  const [phase, setPhase] = useState<'loading' | 'invalid' | 'ready' | 'saving'>('loading')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  // Troca o código do e-mail de recuperação por uma sessão temporária.
  useEffect(() => {
    if (!code) {
      setPhase('invalid')
      return
    }
    createClient()
      .auth.exchangeCodeForSession(code)
      .then(({ error }) => setPhase(error ? 'invalid' : 'ready'))
  }, [code])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (password.length < 6) return setError('A senha precisa ter no mínimo 6 caracteres.')
    if (password !== confirm) return setError('As senhas não coincidem.')

    setPhase('saving')
    const { error } = await createClient().auth.updateUser({ password })
    if (error) {
      setError('Não foi possível redefinir a senha. Tente solicitar um novo link.')
      setPhase('ready')
      return
    }

    setDone(true)
    setTimeout(() => router.replace('/dashboard'), 1200)
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
              <Lock className="h-5 w-5" />
            </span>
            <h1 className="text-lg font-semibold text-slate-100">Redefinir senha</h1>
          </div>

          {phase === 'loading' && (
            <p className="mt-6 flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />Validando link de recuperação…
            </p>
          )}

          {phase === 'invalid' && (
            <p className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-300">
              Link inválido ou expirado. Solicite um novo em “Esqueci minha senha” na tela de login.
            </p>
          )}

          {done && (
            <p className="mt-6 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />Senha redefinida! Redirecionando…
            </p>
          )}

          {(phase === 'ready' || phase === 'saving') && !done && (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="new-password">Nova senha</Label>
                <PasswordInput id="new-password" value={password} minLength={6}
                  autoComplete="new-password" placeholder="••••••••" required
                  onChange={e => setPassword(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="confirm-new-password">Confirmar nova senha</Label>
                <PasswordInput id="confirm-new-password" value={confirm} minLength={6}
                  autoComplete="new-password" placeholder="••••••••" required
                  onChange={e => setConfirm(e.target.value)} />
              </div>

              {error && (
                <p className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={phase === 'saving'}>
                {phase === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
                Salvar nova senha
              </Button>
            </form>
          )}
        </Card>
      </div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
        </div>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  )
}
