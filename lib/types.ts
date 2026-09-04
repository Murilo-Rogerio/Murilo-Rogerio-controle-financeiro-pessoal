import type { LucideIcon } from 'lucide-react'

export type IncomeSource = 'fixo' | 'variavel'
export type RecurrenceType = 'unica' | 'mensal' | 'parcelada'

export interface Expense {
  id: string
  user_id: string
  name: string
  amount: number
  category: string // slug built-in ('moradia'...) ou 'c:<uuid>' (custom)
  spent_at: string
  created_at: string
  recurrence: RecurrenceType
  installments_total: number | null
  installment_number: number | null
}

export interface Income {
  id: string
  user_id: string
  name: string
  amount: number
  source_type: IncomeSource
  received_at: string
  created_at: string
  is_fixed_monthly: boolean
  day_of_month: number | null
}

export interface Savings {
  id: string
  user_id: string
  amount: number
  cdi_annual_rate: number // última taxa conhecida (fallback quando a API falha)
  cdi_percent: number
  updated_at: string
}

/** Linha da tabela categories (serializável — pode cruzar a fronteira server→client). */
export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  icon: string
  created_at: string
}

/** Categoria resolvida (com componente de ícone) — para render. */
export interface ResolvedCategory {
  slug: string
  label: string
  color: string
  icon: LucideIcon
  isCustom: boolean
}

/** Lançamento materializado num mês específico (real ou projetado). */
export interface ProjectedExpense {
  expense: Expense
  date: string
  isProjected: boolean // data no futuro → "previsto"
  installment: { current: number; total: number } | null
}

export interface ProjectedIncome {
  income: Income
  date: string
  isProjected: boolean
}

export interface ActiveInstallment {
  expense: Expense
  current: number
  total: number
  remaining: number
}

export type ActionState = { error?: string; success?: string }

export interface FlowRow {
  key: string
  label: string
  entradas: number
  saidas: number
  rendimento: number
}

export interface RecentItem {
  id: string
  type: 'income' | 'expense'
  name: string
  date: string
  amount: number
  categorySlug?: string
  source?: IncomeSource
  isFixedMonthly?: boolean
  installment?: { current: number; total: number } | null
  isProjected?: boolean
}
