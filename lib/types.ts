export type IncomeSource = 'fixo' | 'variavel'
export type ExpenseCategory = 'moradia' | 'alimentacao' | 'lazer' | 'transporte' | 'outros'

export interface Income {
  id: string
  user_id: string
  name: string
  amount: number
  source_type: IncomeSource
  received_at: string // 'YYYY-MM-DD'
  created_at: string
}

export interface Expense {
  id: string
  user_id: string
  name: string
  amount: number
  category: ExpenseCategory
  spent_at: string // 'YYYY-MM-DD'
  created_at: string
}

export interface Savings {
  id: string
  user_id: string
  amount: number
  cdi_annual_rate: number // ex.: 10.5 → 10,5% a.a.
  cdi_percent: number     // ex.: 100 → 100% do CDI
  updated_at: string
}

/** Estado padronizado de retorno das Server Actions. */
export type ActionState = { error?: string; success?: string }

/** Linha do gráfico Entradas x Saídas x CDI. */
export interface FlowRow {
  key: string
  label: string
  entradas: number
  saidas: number
  rendimento: number
}

/** Item unificado da lista de movimentos recentes. */
export interface RecentItem {
  id: string
  type: 'income' | 'expense'
  name: string
  date: string
  amount: number
  category?: ExpenseCategory
  source?: IncomeSource
}