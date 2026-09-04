import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchCdiRate } from '@/lib/api/rates'
import { currentMonthKey, lastMonthKeys, monthRange, monthShort, todayISO } from '@/lib/date'
import { toNumber } from '@/lib/format'
import { computeCdi } from '@/lib/finance'
import { monthsBetween, projectExpense, projectIncome } from '@/lib/recurrence'
import type {
  ActiveInstallment, Category, Expense, FlowRow, Income,
  ProjectedExpense, ProjectedIncome, Savings,
} from '@/lib/types'

/** Garante usuário autenticado (segunda camada, além do middleware). */
export async function requireUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return { supabase, user }
}

/* ── Normalizadores (numeric → number) ───────────────────────────────── */
const asExpense = (row: any): Expense => ({
  ...row,
  amount: toNumber(row.amount),
  recurrence: row.recurrence ?? 'unica',
  installments_total: row.installments_total ?? null,
  installment_number: row.installment_number ?? null,
})
const asIncome = (row: any): Income => ({
  ...row,
  amount: toNumber(row.amount),
  is_fixed_monthly: row.is_fixed_monthly ?? false,
  day_of_month: row.day_of_month ?? null,
})
const asSavings = (row: any): Savings => ({
  ...row,
  amount: toNumber(row.amount),
  cdi_annual_rate: toNumber(row.cdi_annual_rate),
  cdi_percent: toNumber(row.cdi_percent),
})
const asCategory = (row: any): Category => ({ ...row })

export async function getSavings(): Promise<Savings | null> {
  const { supabase } = await requireUser()
  const { data } = await supabase.from('savings').select('*').maybeSingle()
  return data ? asSavings(data) : null
}

export async function getCustomCategories(): Promise<Category[]> {
  const { supabase } = await requireUser()
  const { data } = await supabase.from('categories').select('*').order('name')
  return (data ?? []).map(asCategory)
}

export interface MonthlyOverview {
  monthKey: string
  isFuture: boolean
  expenseItems: ProjectedExpense[]
  incomeItems: ProjectedIncome[]
  activeInstallments: ActiveInstallment[]
  savings: Savings | null
  customCategories: Category[]
  totalIncome: number
  totalIncomeProjected: number
  totalFixedMonthly: number
  totalExpense: number
  totalExpenseProjected: number
  balance: number
}

/**
 * Panorama do mês consultado (real OU projetado):
 * lançamentos únicos + séries recorrentes/parceladas materializadas.
 */
export async function getMonthlyOverview(monthKey: string): Promise<MonthlyOverview> {
  const { supabase } = await requireUser()
  const { start, end } = monthRange(monthKey)
  const today = todayISO()
  const nowKey = currentMonthKey()

  // Séries recorrentes: busca até o fim do mês consultado OU até hoje (o maior).
  const recurringCutoff = [end, today].sort()[1]

  const [monthExpenses, recurringExpenses, monthIncomes, fixedIncomes, categoriesRes, savingsRes] =
    await Promise.all([
      supabase.from('expenses').select('*').gte('spent_at', start).lt('spent_at', end),
      supabase.from('expenses').select('*').neq('recurrence', 'unica').lte('spent_at', recurringCutoff),
      supabase.from('incomes').select('*').gte('received_at', start).lt('received_at', end),
      supabase.from('incomes').select('*').eq('is_fixed_monthly', true).lte('received_at', recurringCutoff),
      supabase.from('categories').select('*').order('name'),
      supabase.from('savings').select('*').maybeSingle(),
    ])

  // Dedupe por id (série que começou no próprio mês vem nas duas queries).
  const expenseMap = new Map<string, Expense>()
  for (const row of [...(monthExpenses.data ?? []), ...(recurringExpenses.data ?? [])]) {
    expenseMap.set(row.id, asExpense(row))
  }
  const incomeMap = new Map<string, Income>()
  for (const row of [...(monthIncomes.data ?? []), ...(fixedIncomes.data ?? [])]) {
    incomeMap.set(row.id, asIncome(row))
  }

  const expenseItems = [...expenseMap.values()]
    .map(expense => projectExpense(expense, monthKey, today))
    .filter((x): x is ProjectedExpense => x !== null)
    .sort((a, b) => b.date.localeCompare(a.date))

  const incomeItems = [...incomeMap.values()]
    .map(income => projectIncome(income, monthKey, today))
    .filter((x): x is ProjectedIncome => x !== null)
    .sort((a, b) => b.date.localeCompare(a.date))

  const totalIncome = incomeItems.reduce((s, i) => s + i.income.amount, 0)
  const totalIncomeProjected = incomeItems.filter(i => i.isProjected).reduce((s, i) => s + i.income.amount, 0)
  const totalFixedMonthly = incomeItems.filter(i => i.income.is_fixed_monthly).reduce((s, i) => s + i.income.amount, 0)
  const totalExpense = expenseItems.reduce((s, i) => s + i.expense.amount, 0)
  const totalExpenseProjected = expenseItems.filter(i => i.isProjected).reduce((s, i) => s + i.expense.amount, 0)

  const activeInstallments: ActiveInstallment[] = [...expenseMap.values()]
    .filter(e => e.recurrence === 'parcelada')
    .map(e => {
      const total = e.installments_total ?? 1
      const current = (e.installment_number ?? 1)
        + Math.max(0, monthsBetween(e.spent_at.slice(0, 7), nowKey))
      return { expense: e, current, total, remaining: Math.max(0, total - current) }
    })
    .filter(series => series.remaining > 0)
    .sort((a, b) => b.remaining - a.remaining)

  return {
    monthKey,
    isFuture: monthKey > nowKey,
    expenseItems,
    incomeItems,
    activeInstallments,
    savings: savingsRes.data ? asSavings(savingsRes.data) : null,
    customCategories: (categoriesRes.data ?? []).map(asCategory),
    totalIncome, totalIncomeProjected, totalFixedMonthly,
    totalExpense, totalExpenseProjected,
    balance: totalIncome - totalExpense,
  }
}

/** Entradas x Saídas x CDI dos últimos N meses (com projeções). */
export async function getFlowHistory(monthKey: string, months = 6): Promise<FlowRow[]> {
  const { supabase } = await requireUser()
  const keys = lastMonthKeys(months, monthKey)
  const { end } = monthRange(monthKey)
  const today = todayISO()

  const [expensesRes, incomesRes, savingsRes, rate] = await Promise.all([
    supabase.from('expenses').select('*').lt('spent_at', end).order('spent_at').limit(5000),
    supabase.from('incomes').select('*').lt('received_at', end).order('received_at').limit(5000),
    supabase.from('savings').select('*').maybeSingle(),
    fetchCdiRate(),
  ])

  const expenses = (expensesRes.data ?? []).map(asExpense)
  const incomes = (incomesRes.data ?? []).map(asIncome)
  const savings = savingsRes.data ? asSavings(savingsRes.data) : null

  // CDI: taxa da API em tempo real → taxa salva (fallback) → default.
  const annualRate = rate.source === 'api' ? rate.value : (savings?.cdi_annual_rate ?? rate.value)
  const cdiMonthly = savings
    ? computeCdi({ amount: savings.amount, annualRate, cdiPercent: savings.cdi_percent }).monthlyGross
    : 0

  return keys.map(key => {
    const entradas = incomes.reduce((s, i) => (projectIncome(i, key, today) ? s + i.amount : s), 0)
    const saidas = expenses.reduce((s, e) => (projectExpense(e, key, today) ? s + e.amount : s), 0)
    return {
      key,
      label: monthShort(key),
      entradas: Math.round(entradas * 100) / 100,
      saidas: Math.round(saidas * 100) / 100,
      rendimento: Math.round(cdiMonthly * 100) / 100,
    }
  })
}
