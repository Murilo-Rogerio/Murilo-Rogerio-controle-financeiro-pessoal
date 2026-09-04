import type { Metadata } from 'next'
import { ArrowUpRight, Wallet } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { MonthPicker } from '@/components/ui/month-picker'
import { StatCard } from '@/components/ui/stat-card'
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
        <MonthPicker monthKey={monthKey} />
      </div>

      {/* Total de gastos + saldo livre do mês (entradas − gastos) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Total de gastos" value={formatBRL(overview.totalExpense)}
          sub={`${overview.expenses.length} lançamento(s)`} icon={ArrowUpRight}
          tone="bg-rose-500/10 text-rose-400" />
        <StatCard label="Saldo livre do mês" value={formatBRL(overview.balance)}
          sub="Entradas − gastos" icon={Wallet}
          tone={overview.balance >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'} />
      </div>

      <ExpenseFormCard />

      <Card>
        <h2 className="px-5 pt-5 text-sm font-semibold text-slate-200">Gastos do mês</h2>
        <div className="mt-3">
          <ExpenseList expenses={overview.expenses} />
        </div>
      </Card>
    </div>
  )
}