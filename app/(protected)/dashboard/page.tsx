import type { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { MonthPicker } from '@/components/ui/month-picker'
import { StatCard } from '@/components/ui/stat-card'
import { FlowChart } from '@/components/dashboard/flow-chart'
import { CategoryDonut } from '@/components/dashboard/category-donut'
import { RecentList } from '@/components/dashboard/recent-list'
import { RecurringPanels } from '@/components/dashboard/recurring-panels'
import { CategoryManager } from '@/components/categories/category-manager'
import { getFlowHistory, getMonthlyOverview } from '@/lib/data'
import { resolveCategory } from '@/lib/categories'
import { upcomingFixedIncomes } from '@/lib/recurrence'
import { fetchCdiRate } from '@/lib/api/rates'
import { computeCdi } from '@/lib/finance'
import { currentMonthKey, isValidMonthKey, monthTitle, todayISO } from '@/lib/date'
import { formatBRL } from '@/lib/format'
import type { RecentItem } from '@/lib/types'

export const metadata: Metadata = { title: 'Dashboard' }

type PageProps = { searchParams: Promise<{ mes?: string }> }

export default async function DashboardPage({ searchParams }: PageProps) {
  const { mes } = await searchParams
  const monthKey = isValidMonthKey(mes) ? mes : currentMonthKey()
  const today = todayISO()

  const [overview, flow, rate] = await Promise.all([
    getMonthlyOverview(monthKey),
    getFlowHistory(monthKey),
    fetchCdiRate(),
  ])

  /* ── Donut: gastos por categoria (built-in + custom) ── */
  const totalsBySlug = new Map<string, number>()
  for (const item of overview.expenseItems) {
    totalsBySlug.set(item.expense.category, (totalsBySlug.get(item.expense.category) ?? 0) + item.expense.amount)
  }
  const donutData = [...totalsBySlug.entries()]
    .map(([slug, value]) => {
      const info = resolveCategory(slug, overview.customCategories)
      return { name: info.label, value: Math.round(value * 100) / 100, color: info.color }
    })
    .sort((a, b) => b.value - a.value)

  /* ── Movimentos recentes ── */
  const recent: RecentItem[] = [
    ...overview.incomeItems.map(({ income, date, isProjected }) => ({
      id: income.id, type: 'income' as const, name: income.name, date,
      amount: income.amount, source: income.source_type,
      isFixedMonthly: income.is_fixed_monthly, isProjected,
    })),
    ...overview.expenseItems.map(({ expense, date, isProjected, installment }) => ({
      id: expense.id, type: 'expense' as const, name: expense.name, date,
      amount: expense.amount, categorySlug: expense.category,
      installment, isProjected,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8)

  /* ── Painéis de recorrência ── */
  const bills = overview.expenseItems
    .filter(item => item.expense.recurrence !== 'unica')
    .map(({ expense, date, isProjected, installment }) => ({
      id: expense.id, name: expense.name, amount: expense.amount, date,
      installment, isMonthly: expense.recurrence === 'mensal',
      isProjected, slug: expense.category,
    }))
  const billsTotal = bills.reduce((sum, bill) => sum + bill.amount, 0)

  const fixedRows = overview.incomeItems.map(item => item.income).filter(income => income.is_fixed_monthly)
  const upcoming = upcomingFixedIncomes(fixedRows, monthKey, today)

  const installments = overview.activeInstallments.map(series => ({
    id: series.expense.id, name: series.expense.name,
    amount: series.expense.amount, current: series.current, total: series.total,
  }))
  const installmentsRemaining = overview.activeInstallments
    .reduce((sum, series) => sum + series.remaining * series.expense.amount, 0)

  /* ── CDI com taxa em tempo real ── */
  const annualRate = rate.source === 'api' ? rate.value : (overview.savings?.cdi_annual_rate ?? rate.value)
  const cdi = overview.savings
    ? computeCdi({ amount: overview.savings.amount, annualRate, cdiPercent: overview.savings.cdi_percent })
    : null

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-100">Visão geral</h1>
          <p className="mt-0.5 text-sm text-slate-500">{monthTitle(monthKey)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {overview.isFuture && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300">
              <Sparkles className="h-3 w-3" />Projeção
            </span>
          )}
          <CategoryManager categories={overview.customCategories} />
          <MonthPicker monthKey={monthKey} />
        </div>
      </div>

      {/* Métricas-chave */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total recebido" value={formatBRL(overview.totalIncome)} numeric={overview.totalIncome}
          sub={overview.totalIncomeProjected > 0
            ? `${formatBRL(overview.totalIncomeProjected)} previsto`
            : `${overview.incomeItems.length} lançamento(s)`}
          icon="income" tone="bg-emerald-500/10 text-emerald-400" delay={0} />
        <StatCard label="Total gasto" value={formatBRL(overview.totalExpense)} numeric={overview.totalExpense}
          sub={overview.totalExpenseProjected > 0
            ? `${formatBRL(overview.totalExpenseProjected)} previsto`
            : `${overview.expenseItems.length} lançamento(s)`}
          icon="expense" tone="bg-rose-500/10 text-rose-400" delay={0.05} />
        <StatCard label="Saldo restante" value={formatBRL(overview.balance)} numeric={overview.balance}
          sub={overview.balance >= 0 ? 'Sobra do mês' : 'Gastos acima das entradas'}
          icon="wallet"
          tone={overview.balance >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}
          delay={0.1} />
        <StatCard label="Patrimônio guardado" value={formatBRL(overview.savings?.amount ?? 0)}
          numeric={overview.savings?.amount ?? 0}
          sub={cdi ? `≈ ${formatBRL(cdi.monthlyGross)}/mês no CDI (${annualRate.toLocaleString('pt-BR')}% a.a.)` : 'Sem simulação configurada'}
          icon="savings" tone="bg-indigo-500/10 text-indigo-400" delay={0.15} />
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
            CDI: rendimento mensal estimado com a taxa atual da BrasilAPI e o patrimônio registrado.
          </p>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-200">Gastos por categoria</h2>
          <div className="mt-4">
            <CategoryDonut data={donutData} />
          </div>
        </Card>
      </div>

      {/* Contas do mês / parcelamentos / próximas entradas */}
      <RecurringPanels
        bills={bills}
        billsTotal={billsTotal}
        monthLabel={monthTitle(monthKey)}
        upcoming={upcoming.items.map(({ income, date }) => ({
          id: income.id, name: income.name, amount: income.amount, date,
        }))}
        upcomingLabel={monthTitle(upcoming.monthKey)}
        installments={installments}
        installmentsRemaining={installmentsRemaining}
        customCategories={overview.customCategories}
      />

      {/* Movimentos recentes */}
      <Card className="p-0 pb-1">
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 className="text-sm font-semibold text-slate-200">Movimentos recentes</h2>
          <Link href="/gastos" className="text-xs font-medium text-emerald-400 hover:text-emerald-300">
            Ver gastos
          </Link>
        </div>
        <RecentList items={recent} customCategories={overview.customCategories} />
      </Card>
    </div>
  )
}
