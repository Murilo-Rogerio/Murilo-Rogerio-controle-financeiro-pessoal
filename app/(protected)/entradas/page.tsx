import type { Metadata } from 'next'
import { ArrowDownLeft, Briefcase, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { MonthPicker } from '@/components/ui/month-picker'
import { StatCard } from '@/components/ui/stat-card'
import { IncomeFormCard } from '@/components/incomes/income-form-card'
import { IncomeList } from '@/components/incomes/income-list'
import { getMonthlyOverview } from '@/lib/data'
import { currentMonthKey, isValidMonthKey, monthTitle } from '@/lib/date'
import { formatBRL } from '@/lib/format'

export const metadata: Metadata = { title: 'Entradas' }

type PageProps = { searchParams: Promise<{ mes?: string }> }

export default async function IncomesPage({ searchParams }: PageProps) {
  const { mes } = await searchParams
  const monthKey = isValidMonthKey(mes) ? mes : currentMonthKey()
  const overview = await getMonthlyOverview(monthKey)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-100">Entradas</h1>
          <p className="mt-0.5 text-sm text-slate-500">{monthTitle(monthKey)}</p>
        </div>
        <MonthPicker monthKey={monthKey} />
      </div>

      {/* Total bruto mensal + divisão fixo/variável */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total bruto do mês" value={formatBRL(overview.totalIncome)}
          sub={`${overview.incomes.length} lançamento(s)`} icon={ArrowDownLeft}
          tone="bg-emerald-500/10 text-emerald-400" />
        <StatCard label="Renda fixa" value={formatBRL(overview.totalFixed)}
          sub="Salário e valores recorrentes" icon={Briefcase}
          tone="bg-indigo-500/10 text-indigo-400" />
        <StatCard label="Renda variável" value={formatBRL(overview.totalVariable)}
          sub="Freelas e extras" icon={Sparkles}
          tone="bg-amber-500/10 text-amber-400" />
      </div>

      <IncomeFormCard />

      <Card>
        <h2 className="px-5 pt-5 text-sm font-semibold text-slate-200">Lançamentos do mês</h2>
        <div className="mt-3">
          <IncomeList incomes={overview.incomes} />
        </div>
      </Card>
    </div>
  )
}