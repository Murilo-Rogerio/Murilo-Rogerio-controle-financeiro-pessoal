'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CreditCard, LayoutDashboard, LineChart, LogOut, PiggyBank, TrendingUp } from 'lucide-react'
import { signOut } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', short: 'Início', icon: LayoutDashboard },
  { href: '/entradas', label: 'Entradas', short: 'Entradas', icon: TrendingUp },
  { href: '/gastos', label: 'Gastos', short: 'Gastos', icon: CreditCard },
  { href: '/investimentos', label: 'Investimentos', short: 'Investir', icon: LineChart },
  { href: '/patrimonio', label: 'Patrimônio', short: 'Cofrinho', icon: PiggyBank },
] as const

/**
 * Layout do shell baseado em LARGURA + TIPO DE APONTADOR (ver globals.css):
 *  - desktop (≥1024px + mouse): sidebar fixa
 *  - celular (dedo, qualquer largura reportada): header + navbar inferior
 *    no fluxo (sticky), imune ao bug de restauração de aba do Chromium.
 */
export function AppShell({ email, children }: { email: string; children: ReactNode }) {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Halos sutis de fundo */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 h-80 w-80 rounded-full bg-emerald-500/[0.05] blur-[120px]" />
        <div className="absolute -bottom-24 right-[10%] h-96 w-96 rounded-full bg-indigo-500/[0.06] blur-[130px]" />
      </div>

      {/* ── Sidebar (desktop: largura + mouse) ── */}
      <aside className="desktop-only fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/5 bg-card/50 backdrop-blur-xl">
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

        <div className="border-t border-white/5 p-4">
          <p className="truncate text-xs text-slate-500" title={email}>{email}</p>
          <form action={signOut}>
            <Button variant="ghost" size="sm" className="mt-2 w-full justify-start gap-2">
              <LogOut className="h-4 w-4" /> Sair
            </Button>
          </form>
        </div>
      </aside>

      {/* ── Header (mobile: apontador = dedo) ── */}
      <header className="mobile-only sticky top-0 z-40 flex items-center justify-between border-b border-white/5 bg-base/80 px-4 py-3 backdrop-blur-xl">
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

      {/* ── Conteúdo (flex-1 ancora a navbar no rodapé em páginas curtas) ── */}
      <div className="app-content flex-1">
        <main className="app-main mx-auto w-full max-w-6xl px-4 pb-4 pt-6 sm:px-6">
          {children}
        </main>
      </div>

      {/* ── Navbar mobile: sticky NO FLUXO, sempre presente no celular ── */}
      <nav className="mobile-only sticky bottom-0 z-40 grid grid-cols-5 border-t border-white/5 bg-card pb-[env(safe-area-inset-bottom)]">
        {NAV.map(item => (
          <Link key={item.href} href={item.href}
            className={cn(
              'flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors',
              isActive(item.href) ? 'text-emerald-400' : 'text-slate-500',
            )}>
            <item.icon className="h-5 w-5" />
            {item.short}
          </Link>
        ))}
      </nav>
    </div>
  )
}
