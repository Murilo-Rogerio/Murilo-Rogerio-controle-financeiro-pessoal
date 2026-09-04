import type { LucideIcon } from 'lucide-react'
import {
  Briefcase, Car, Gamepad2, Home, Sparkles, Tags, UtensilsCrossed,
} from 'lucide-react'
import type { ExpenseCategory, IncomeSource } from './types'

export const EXPENSE_CATEGORY_VALUES: ExpenseCategory[] = [
  'moradia', 'alimentacao', 'lazer', 'transporte', 'outros',
]
export const INCOME_SOURCE_VALUES: IncomeSource[] = ['fixo', 'variavel']

interface CategoryMeta {
  label: string
  color: string   // hex — usado nos gráficos (recharts)
  badge: string   // classes Tailwind — usado em badges/círculos de ícone
  icon: LucideIcon
}

export const CATEGORY_META: Record<ExpenseCategory, CategoryMeta> = {
  moradia:     { label: 'Moradia',     color: '#818CF8', badge: 'bg-indigo-500/10 text-indigo-300', icon: Home },
  alimentacao: { label: 'Alimentação', color: '#FBBF24', badge: 'bg-amber-500/10 text-amber-300',   icon: UtensilsCrossed },
  lazer:       { label: 'Lazer',       color: '#F472B6', badge: 'bg-pink-500/10 text-pink-300',     icon: Gamepad2 },
  transporte:  { label: 'Transporte',  color: '#38BDF8', badge: 'bg-sky-500/10 text-sky-300',       icon: Car },
  outros:      { label: 'Outros',      color: '#94A3B8', badge: 'bg-slate-500/10 text-slate-300',   icon: Tags },
}

export const SOURCE_META: Record<IncomeSource, { label: string; badge: string; icon: LucideIcon }> = {
  fixo:     { label: 'Fixo',  badge: 'bg-emerald-500/10 text-emerald-300', icon: Briefcase },
  variavel: { label: 'Extra', badge: 'bg-amber-500/10 text-amber-300',      icon: Sparkles },
}