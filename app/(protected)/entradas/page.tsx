import type { Metadata } from 'next'
import { Sparkles } from 'lucide-react'
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
        <div className="flex flex-wrap items-center gap-2">
          {overview.isFuture && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300">
              <Sparkles className="h-3 w-3" />Projeção
            </span>
          )}
          <MonthPicker monthKey={monthKey} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total bruto do mês" value={formatBRL(overview.totalIncome)} numeric={overview.totalIncome}
          sub={overview.totalIncomeProjected > 0
            ? `${formatBRL(overview.totalIncomeProjected)} previsto`
            : `${overview.incomeItems.length} lançamento(s)`}
          icon="income" tone="bg-emerald-500/10 text-emerald-400" delay={0} />
        <StatCard label="Entradas fixas mensais" value={formatBRL(overview.totalFixedMonthly)}
          numeric={overview.totalFixedMonthly} sub="Repetem todo mês"
          icon="briefcase" tone="bg-indigo-500/10 text-indigo-400" delay={0.05} />
        <StatCard label="Extras" value={formatBRL(overview.totalIncome - overview.totalFixedMonthly)}
          numeric={overview.totalIncome - overview.totalFixedMonthly} sub="Freelas e variáveis"
          icon="sparkles" tone="bg-amber-500/10 text-amber-400" delay={0.1} />
      </div>

      <IncomeFormCard />

      <Card>
        <h2 className="px-5 pt-5 text-sm font-semibold text-slate-200">Lançamentos do mês</h2>
        <div className="mt-3">
          <IncomeList items={overview.incomeItems} />
        </div>
      </Card>
    </div>
  )
}