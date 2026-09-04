import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowDownLeft, ArrowUpRight, PiggyBank, Wallet } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { MonthPicker } from '@/components/ui/month-picker'
import { StatCard } from '@/components/ui/stat-card'
import { FlowChart } from '@/components/dashboard/flow-chart'
import { CategoryDonut } from '@/components/dashboard/category-donut'
import { RecentList } from '@/components/dashboard/recent-list'
import { getFlowHistory, getMonthlyOverview } from '@/lib/data'
import { CATEGORY_META } from '@/lib/categories'
import { currentMonthKey, isValidMonthKey, monthTitle } from '@/lib/date'
import { formatBRL } from '@/lib/format'
import { computeCdi } from '@/lib/finance'
import type { ExpenseCategory, RecentItem } from '@/lib/types'

export const metadata: Metadata = { title: 'Dashboard' }

type PageProps = { searchParams: Promise<{ mes?: string }> }

export default async function DashboardPage({ searchParams }: PageProps) {
  // Navegação por mês via query param (?mes=2025-01)
  const { mes } = await searchParams
  const monthKey = isValidMonthKey(mes) ? mes : currentMonthKey()

  const [overview, flow] = await Promise.all([
    getMonthlyOverview(monthKey),
    getFlowHistory(monthKey),
  ])

  // ── Gastos agregados por categoria (donut) ──
  const totalsByCategory = new Map<ExpenseCategory, number>()
  for (const expense of overview.expenses) {
    totalsByCategory.set(expense.category, (totalsByCategory.get(expense.category) ?? 0) + expense.amount)
  }
  const categoryData = [...totalsByCategory.entries()]
    .map(([category, value]) => ({
      name: CATEGORY_META[category].label,
      value: Math.round(value * 100) / 100,
      color: CATEGORY_META[category].color,
    }))
    .sort((a, b) => b.value - a.value)

  // ── Movimentos recentes (entradas + gastos, mais recentes primeiro) ──
  const recent: RecentItem[] = [
    ...overview.incomes.map(income => ({
      id: income.id, type: 'income' as const, name: income.name,
      date: income.received_at, amount: income.amount, source: income.source_type,
    })),
    ...overview.expenses.map(expense => ({
      id: expense.id, type: 'expense' as const, name: expense.name,
      date: expense.spent_at, amount: expense.amount, category: expense.category,
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8)

  const cdi = overview.savings
    ? computeCdi({
        amount: overview.savings.amount,
        annualRate: overview.savings.cdi_annual_rate,
        cdiPercent: overview.savings.cdi_percent,
      })
    : null

  return (
    <div className="space-y-6">
      {/* Cabeçalho + navegação por mês */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-100">Visão geral</h1>
          <p className="mt-0.5 text-sm text-slate-500">{monthTitle(monthKey)}</p>
        </div>
        <MonthPicker monthKey={monthKey} />
      </div>

      {/* Métricas-chave do mês */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total recebido" value={formatBRL(overview.totalIncome)}
          sub={`${overview.incomes.length} lançamento(s)`} icon={ArrowDownLeft}
          tone="bg-emerald-500/10 text-emerald-400" />
        <StatCard label="Total gasto" value={formatBRL(overview.totalExpense)}
          sub={`${overview.expenses.length} lançamento(s)`} icon={ArrowUpRight}
          tone="bg-rose-500/10 text-rose-400" />
        <StatCard label="Saldo restante" value={formatBRL(overview.balance)}
          sub={overview.balance >= 0 ? 'Sobra do mês' : 'Gastos acima das entradas'} icon={Wallet}
          tone={overview.balance >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'} />
        <StatCard label="Patrimônio guardado" value={formatBRL(overview.savings?.amount ?? 0)}
          sub={cdi ? `≈ ${formatBRL(cdi.monthlyGross)}/mês no CDI` : 'Sem simulação configurada'} icon={PiggyBank}
          tone="bg-indigo-500/10 text-indigo-400" />
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-200">Entradas x Saídas x Investimentos</h2>
            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-emerald-500" />Entradas</span>
              <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-rose-500" />Saídas</span>
              <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-indigo-500" />CDI</span>
            </div>
          </div>
          <div className="mt-4">
            <FlowChart data={flow} />
          </div>
          <p className="mt-2 text-[11px] text-slate-600">
            CDI: rendimento mensal estimado com a taxa e o patrimônio registrados em “Patrimônio”.
          </p>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-200">Gastos por categoria</h2>
          <div className="mt-4">
            <CategoryDonut data={categoryData} />
          </div>
        </Card>
      </div>

      {/* Movimentos recentes */}
      <Card className="p-0 pb-1">
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 className="text-sm font-semibold text-slate-200">Movimentos recentes</h2>
          <Link href="/gastos" className="text-xs font-medium text-emerald-400 hover:text-emerald-300">
            Ver gastos
          </Link>
        </div>
        <RecentList items={recent} />
      </Card>
    </div>
  )
}