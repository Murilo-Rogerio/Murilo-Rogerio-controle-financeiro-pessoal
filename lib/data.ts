import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { lastMonthKeys, monthRange, monthShort } from '@/lib/date'
import { toNumber } from '@/lib/format'
import { computeCdi } from '@/lib/finance'
import type { Expense, FlowRow, Income, Savings } from '@/lib/types'

/** Garante usuário autenticado (segunda camada, além do middleware). */
export async function requireUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return { supabase, user }
}

// ── Normalizadores (numeric → number) ────────────────────────────────
const asIncome = (row: any): Income => ({ ...row, amount: toNumber(row.amount) })
const asExpense = (row: any): Expense => ({ ...row, amount: toNumber(row.amount) })
const asSavings = (row: any): Savings => ({
  ...row,
  amount: toNumber(row.amount),
  cdi_annual_rate: toNumber(row.cdi_annual_rate),
  cdi_percent: toNumber(row.cdi_percent),
})

export async function getSavings(): Promise<Savings | null> {
  const { supabase } = await requireUser()
  const { data } = await supabase.from('savings').select('*').maybeSingle()
  return data ? asSavings(data) : null
}

export interface MonthlyOverview {
  monthKey: string
  incomes: Income[]
  expenses: Expense[]
  savings: Savings | null
  totalIncome: number
  totalFixed: number
  totalVariable: number
  totalExpense: number
  balance: number
}

/** Tudo o que as páginas precisam sobre um mês específico. */
export async function getMonthlyOverview(monthKey: string): Promise<MonthlyOverview> {
  const { supabase } = await requireUser()
  const { start, end } = monthRange(monthKey)

  const [incomesRes, expensesRes, savingsRes] = await Promise.all([
    supabase.from('incomes').select('*')
      .gte('received_at', start).lt('received_at', end)
      .order('received_at', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase.from('expenses').select('*')
      .gte('spent_at', start).lt('spent_at', end)
      .order('spent_at', { ascending: false })
      .order('created_at', { ascending: false }),
    // O RLS filtra por user_id automaticamente — nenhum dado alheio é retornado.
    supabase.from('savings').select('*').maybeSingle(),
  ])

  const incomes = (incomesRes.data ?? []).map(asIncome)
  const expenses = (expensesRes.data ?? []).map(asExpense)

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0)
  const totalFixed = incomes.filter(i => i.source_type === 'fixo').reduce((s, i) => s + i.amount, 0)
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0)

  return {
    monthKey,
    incomes,
    expenses,
    savings: savingsRes.data ? asSavings(savingsRes.data) : null,
    totalIncome,
    totalFixed,
    totalVariable: totalIncome - totalFixed,
    totalExpense,
    balance: totalIncome - totalExpense,
  }
}

/**
 * Entradas x Saídas dos últimos 6 meses + rendimento CDI estimado
 * (constante, calculado com a taxa e o patrimônio registrados hoje).
 */
export async function getFlowHistory(monthKey: string, months = 6): Promise<FlowRow[]> {
  const { supabase } = await requireUser()
  const keys = lastMonthKeys(months, monthKey)
  const { start } = monthRange(keys[0])

  const [incomesRes, expensesRes, savingsRes] = await Promise.all([
    supabase.from('incomes').select('received_at, amount').gte('received_at', start),
    supabase.from('expenses').select('spent_at, amount').gte('spent_at', start),
    supabase.from('savings').select('amount, cdi_annual_rate, cdi_percent').maybeSingle(),
  ])

  const sumBy = (rows: any[] | null, dateField: string) => {
    const map = new Map<string, number>()
    for (const row of rows ?? []) {
      const key = String(row[dateField]).slice(0, 7) // 'YYYY-MM'
      map.set(key, (map.get(key) ?? 0) + toNumber(row.amount))
    }
    return map
  }
  const incomeMap = sumBy(incomesRes.data, 'received_at')
  const expenseMap = sumBy(expensesRes.data, 'spent_at')

  const savings = savingsRes.data
  const monthlyCdiIncome = savings
    ? computeCdi({
        amount: toNumber(savings.amount),
        annualRate: toNumber(savings.cdi_annual_rate),
        cdiPercent: toNumber(savings.cdi_percent),
      }).monthlyGross
    : 0

  return keys.map(key => ({
    key,
    label: monthShort(key),
    entradas: Math.round((incomeMap.get(key) ?? 0) * 100) / 100,
    saidas: Math.round((expenseMap.get(key) ?? 0) * 100) / 100,
    rendimento: Math.round(monthlyCdiIncome * 100) / 100,
  }))
}