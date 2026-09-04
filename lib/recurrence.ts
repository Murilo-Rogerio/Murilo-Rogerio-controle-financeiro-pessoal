import { shiftMonth } from './date'
import type { Expense, Income, ProjectedExpense, ProjectedIncome } from './types'

/**
 * Motor de recorrência: um lançamento "mestre" é materializado em qualquer mês
 * consultado, sem duplicar linhas no banco.
 */

function monthIndex(key: string): number {
  const [year, month] = key.split('-').map(Number)
  return year * 12 + (month - 1)
}

export function monthsBetween(from: string, to: string): number {
  return monthIndex(to) - monthIndex(from)
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Clamp do dia para o último dia válido do mês (ex.: 31 → 28 em fevereiro). */
function clampDate(year: number, month: number, day: number): string {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return `${year}-${pad(month)}-${pad(Math.min(day, lastDay))}`
}

export function projectExpense(
  expense: Expense, monthKey: string, today: string,
): ProjectedExpense | null {
  const startMonth = expense.spent_at.slice(0, 7)
  const diff = monthsBetween(startMonth, monthKey)
  if (diff < 0) return null // série ainda não havia começado

  const [year, month] = monthKey.split('-').map(Number)
  const day = Number(expense.spent_at.slice(8, 10))

  if (expense.recurrence === 'unica') {
    if (diff !== 0) return null
    return { expense, date: expense.spent_at, isProjected: expense.spent_at > today, installment: null }
  }

  if (expense.recurrence === 'mensal') {
    const date = clampDate(year, month, day)
    return { expense, date, isProjected: date > today, installment: null }
  }

  // parcelada
  const total = expense.installments_total ?? 1
  const current = (expense.installment_number ?? 1) + diff
  if (current < 1 || current > total) return null
  const date = clampDate(year, month, day)
  return { expense, date, isProjected: date > today, installment: { current, total } }
}

export function projectIncome(
  income: Income, monthKey: string, today: string,
): ProjectedIncome | null {
  const startMonth = income.received_at.slice(0, 7)
  const diff = monthsBetween(startMonth, monthKey)
  if (diff < 0) return null

  if (!income.is_fixed_monthly) {
    if (diff !== 0) return null
    return { income, date: income.received_at, isProjected: income.received_at > today }
  }

  const [year, month] = monthKey.split('-').map(Number)
  const day = income.day_of_month ?? Number(income.received_at.slice(8, 10))
  const date = clampDate(year, month, day)
  return { income, date, isProjected: date > today }
}

/**
 * Próximas entradas fixas previstas: do mês consultado (datas >= hoje);
 * se todas já caíram, projeta o mês seguinte.
 */
export function upcomingFixedIncomes(
  fixedRows: Income[], monthKey: string, today: string,
): { items: ProjectedIncome[]; monthKey: string } {
  const collect = (key: string, onlyFuture: boolean) =>
    fixedRows
      .map(income => projectIncome(income, key, today))
      .filter((x): x is ProjectedIncome => x !== null && (!onlyFuture || x.date >= today))
      .sort((a, b) => a.date.localeCompare(b.date))

  const current = collect(monthKey, true)
  if (current.length > 0) return { items: current, monthKey }

  const nextKey = shiftMonth(monthKey, 1)
  return { items: collect(nextKey, false), monthKey: nextKey }
}
