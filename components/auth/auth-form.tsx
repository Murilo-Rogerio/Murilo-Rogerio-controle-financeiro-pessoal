'use client'

import { useActionState, useState } from 'react'
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react'
import { requestPasswordReset, signIn, signUp } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { cn } from '@/lib/cn'
import type { ActionState } from '@/lib/types'

type Mode = 'signin' | 'signup' | 'reset'

export function AuthForm() {
  const [mode, setMode] = useState<Mode>('signin')

  // Cada modo mantém seu próprio estado de action.
  const [signInState, doSignIn, pendingSignIn] = useActionState(signIn, {})
  const [signUpState, doSignUp, pendingSignUp] = useActionState(signUp, {})
  const [resetState, doReset, pendingReset] = useActionState(requestPasswordReset, {})

  const state: ActionState =
    mode === 'signin' ? signInState : mode === 'signup' ? signUpState : resetState
  const pending =
    mode === 'signin' ? pendingSignIn : mode === 'signup' ? pendingSignUp : pendingReset

  return (
    <div>
      {/* Alternância Entrar / Criar conta (modo "reset" é acessado por link) */}
      {mode !== 'reset' && (
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-900/60 p-1">
          {(['signin', 'signup'] as Mode[]).map(m => (
            <button key={m} type="button" onClick={() => setMode(m)}
              className={cn('rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                mode === m ? 'bg-card text-slate-100 shadow' : 'text-slate-500 hover:text-slate-300')}>
              {m === 'signin' ? 'Entrar' : 'Criar conta'}
            </button>
          ))}
        </div>
      )}

      {mode === 'reset' && (
        <button type="button" onClick={() => setMode('signin')}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-slate-200">
          <ArrowLeft className="h-3.5 w-3.5" />Voltar para o login
        </button>
      )}

      <form
        action={mode === 'signin' ? doSignIn : mode === 'signup' ? doSignUp : doReset}
        key={mode}
        className="mt-6 space-y-4"
      >
        <div>
          <Label htmlFor="email">E-mail</Label>
          <div className="relative">
            <Input id="email" name="email" type="email" autoComplete="email"
              placeholder="voce@email.com" required className={mode === 'reset' ? 'pl-9' : ''} />
            {mode === 'reset' && (
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            )}
          </div>
        </div>

        {mode !== 'reset' && (
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              {mode === 'signin' && (
                <button type="button" onClick={() => setMode('reset')}
                  className="mb-1.5 text-[11px] font-medium text-indigo-300 transition-colors hover:text-indigo-200">
                  Esqueci minha senha
                </button>
              )}
            </div>
            <PasswordInput id="password" name="password" minLength={6}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              placeholder="••••••••" required />
          </div>
        )}

        {mode === 'signup' && (
          <div>
            <Label htmlFor="confirm_password">Confirmar senha</Label>
            <PasswordInput id="confirm_password" name="confirm_password" type="password" minLength={6}
              autoComplete="new-password" placeholder="••••••••" required />
          </div>
        )}

        {state.error && (
          <p className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{state.error}
          </p>
        )}
        {state.success && (
          <p className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs leading-relaxed text-emerald-300">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />{state.success}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === 'signin' ? 'Entrar' : mode === 'signup' ? 'Criar conta' : 'Enviar link de redefinição'}
        </Button>
      </form>
    </div>
  )
}
