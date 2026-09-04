import type { Metadata } from 'next'
import { PiggyBank } from 'lucide-react'
import { AuthForm } from '@/components/auth/auth-form'
import { Card } from '@/components/ui/card'

export const metadata: Metadata = { title: 'Entrar' }

export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-12">
      {/* Halos suaves de fundo — bem discretos */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500/[0.07] blur-[110px]" />
        <div className="absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-indigo-500/[0.07] blur-[110px]" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <PiggyBank className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-100">Cofre</h1>
            <p className="text-xs text-slate-500">finanças pessoais, sem complicação</p>
          </div>
        </div>

        <Card className="mt-6 p-6">
          <AuthForm />
        </Card>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-slate-600">
          Cada usuário acessa apenas os seus dados — isolamento garantido por Row Level Security.
        </p>
      </div>
    </main>
  )
}