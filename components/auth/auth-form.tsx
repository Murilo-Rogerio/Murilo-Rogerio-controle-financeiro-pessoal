'use client'

import { useActionState, useState } from 'react'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { signIn, signUp } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/cn'
import type { ActionState } from '@/lib/types'

type Mode = 'signin' | 'signup'

export function AuthForm() {
  const [mode, setMode] = useState<Mode>('signin')

  // Actions separadas por modo — cada formulário mantém seu próprio estado.
  const [signInState, doSignIn, pendingSignIn] = useActionState(signIn, {})
  const [signUpState, doSignUp, pendingSignUp] = useActionState(signUp, {})

  const state: ActionState = mode === 'signin' ? signInState : signUpState
  const pending = mode === 'signin' ? pendingSignIn : pendingSignUp

  return (
    <div>
      {/* Alternância Entrar / Criar conta */}
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-900/60 p-1">
        {(['signin', 'signup'] as Mode[]).map(m => (
          <button key={m} type="button" onClick={() => setMode(m)}
            className={cn('rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              mode === m ? 'bg-card text-slate-100 shadow' : 'text-slate-500 hover:text-slate-300')}>
            {m === 'signin' ? 'Entrar' : 'Criar conta'}
          </button>
        ))}
      </div>

      <form action={mode === 'signin' ? doSignIn : doSignUp} key={mode} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" autoComplete="email"
            placeholder="voce@email.com" required />
        </div>

        <div>
          <Label htmlFor="password">Senha</Label>
          <Input id="password" name="password" type="password" minLength={6}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            placeholder="••••••••" required />
        </div>

        {mode === 'signup' && (
          <div>
            <Label htmlFor="confirm_password">Confirmar senha</Label>
            <Input id="confirm_password" name="confirm_password" type="password" minLength={6}
              autoComplete="new-password" placeholder="••••••••" required />
          </div>
        )}

        {/* Validação visual de erro (server action) */}
        {state.error && (
          <p className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {state.error}
          </p>
        )}
        {state.success && (
          <p className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {state.success}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === 'signin' ? 'Entrar' : 'Criar conta'}
        </Button>
      </form>
    </div>
  )
}