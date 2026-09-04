'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CreditCard, LayoutDashboard, LogOut, PiggyBank, TrendingUp } from 'lucide-react'
import { signOut } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/entradas', label: 'Entradas', icon: TrendingUp },
  { href: '/gastos', label: 'Gastos', icon: CreditCard },
  { href: '/patrimonio', label: 'Patrimônio', icon: PiggyBank },
] as const

/**
 * Estrutura de navegação responsiva:
 * - Desktop: sidebar fixa à esquerda (com e-mail + botão Sair)
 * - Mobile: header fixo no topo + bottom navigation
 */
export function AppShell({ email, children }: { email: string; children: ReactNode }) {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <div className="min-h-dvh">
      {/* ── Sidebar (desktop) ── */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-800/60 bg-card/40 lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <PiggyBank className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold tracking-tight text-slate-100">Cofre</p>
            <p className="text-[11px] text-slate-500">finanças pessoais</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV.map(item => (
            <Link key={item.href} href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                isActive(item.href)
                  ? 'bg-slate-800/60 font-medium text-slate-100'
                  : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200',
              )}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-800/60 p-4">
          <p className="truncate text-xs text-slate-500" title={email}>{email}</p>
          <form action={signOut}>
            <Button variant="ghost" size="sm" className="mt-2 w-full justify-start gap-2">
              <LogOut className="h-4 w-4" /> Sair
            </Button>
          </form>
        </div>
      </aside>

      {/* ── Header (mobile) ── */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-800/60 bg-base/80 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <PiggyBank className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold tracking-tight text-slate-100">Cofre</p>
        </div>
        <form action={signOut}>
          <button type="submit" aria-label="Sair"
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-slate-100">
            <LogOut className="h-5 w-5" />
          </button>
        </form>
      </header>

      {/* ── Conteúdo ── */}
      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6 lg:pb-12 lg:pt-8">
          {children}
        </main>
      </div>

      {/* ── Bottom navigation (mobile) ── */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-slate-800/60 bg-card/90 backdrop-blur lg:hidden">
        {NAV.map(item => (
          <Link key={item.href} href={item.href}
            className={cn(
              'flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
              isActive(item.href) ? 'text-emerald-400' : 'text-slate-500',
            )}>
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}