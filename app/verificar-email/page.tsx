import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, MailWarning, PiggyBank } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Confirmar e-mail' }

type PageProps = { searchParams: Promise<{ status?: string }> }

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const { status } = await searchParams
  const ok = status === 'ok'

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-12">
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
            <p className="text-xs text-slate-500">finanças pessoais</p>
          </div>
        </div>

        <Card className="mt-6 p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full">
            {ok ? (
              <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/10" />
                <CheckCircle2 className="h-7 w-7" />
              </span>
            ) : (
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
                <MailWarning className="h-7 w-7" />
              </span>
            )}
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-100">
            {ok ? 'E-mail confirmado!' : 'Link inválido ou expirado'}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            {ok
              ? 'Sua conta está ativa e a sessão já foi iniciada. Bem-vindo ao seu cofre.'
              : 'O link de confirmação já foi usado ou expirou. Tente entrar normalmente — ou solicite um novo e-mail pelo login.'}
          </p>

          <Link href={ok ? '/dashboard' : '/login'} className="mt-5 block">
            <Button className="w-full">
              {ok ? 'Ir para o dashboard' : 'Voltar para o login'}
            </Button>
          </Link>
        </Card>
      </div>
    </main>
  )
}
