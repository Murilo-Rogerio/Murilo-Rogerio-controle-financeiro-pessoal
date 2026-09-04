import type { Metadata } from 'next'
import { Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { MonthPicker } from '@/components/ui/month-picker'
import { StatCard } from '@/components/ui/stat-card'
import { CategoryManager } from '@/components/categories/category-manager'
import { ExpenseFormCard } from '@/components/expenses/expense-form-card'
import { ExpenseList } from '@/components/expenses/expense-list'
import { getMonthlyOverview } from '@/lib/data'
import { currentMonthKey, isValidMonthKey, monthTitle } from '@/lib/date'
import { formatBRL } from '@/lib/format'

export const metadata: Metadata = { title: 'Gastos' }

type PageProps = { searchParams: Promise<{ mes?: string }> }

export default async function ExpensesPage({ searchParams }: PageProps) {
  const { mes } = await searchParams
  const monthKey = isValidMonthKey(mes) ? mes : currentMonthKey()
  const overview = await getMonthlyOverview(monthKey)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-100">Gastos</h1>
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Total de gastos" value={formatBRL(overview.totalExpense)} numeric={overview.totalExpense}
          sub={overview.totalExpenseProjected > 0
            ? `${formatBRL(overview.totalExpenseProjected)} ainda previsto no mês`
            : `${overview.expenseItems.length} lançamento(s)`}
          icon="expense" tone="bg-rose-500/10 text-rose-400" delay={0} />
        <StatCard label="Saldo livre do mês" value={formatBRL(overview.balance)} numeric={overview.balance}
          sub="Entradas − gastos"
          icon="wallet"
          tone={overview.balance >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}
          delay={0.05} />
      </div>

      <ExpenseFormCard customCategories={overview.customCategories} />

      <Card>
        <h2 className="px-5 pt-5 text-sm font-semibold text-slate-200">Gastos do mês</h2>
        <div className="mt-3">
          <ExpenseList items={overview.expenseItems} customCategories={overview.customCategories} />
        </div>
      </Card>
    </div>
  )
}
