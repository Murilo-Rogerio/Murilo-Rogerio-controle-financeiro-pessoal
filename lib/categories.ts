import type { LucideIcon } from 'lucide-react'
import {
  Banknote, Briefcase, Bus, Car, Cat, Clapperboard, Dumbbell, Gamepad2,
  Gift, GraduationCap, Heart, Home, Plane, ShoppingBag, Sparkles, Tag, Tags,
  UtensilsCrossed, Wifi,
} from 'lucide-react'
import type { Category, IncomeSource, ResolvedCategory } from './types'

/* ── Categorias built-in (sempre disponíveis) ─────────────────────────── */
const BUILTIN: ResolvedCategory[] = [
  { slug: 'moradia',     label: 'Moradia',     color: '#818CF8', icon: Home,           isCustom: false },
  { slug: 'alimentacao', label: 'Alimentação', color: '#FBBF24', icon: UtensilsCrossed, isCustom: false },
  { slug: 'lazer',       label: 'Lazer',       color: '#F472B6', icon: Gamepad2,       isCustom: false },
  { slug: 'transporte',  label: 'Transporte',  color: '#38BDF8', icon: Car,            isCustom: false },
  { slug: 'outros',      label: 'Outros',      color: '#94A3B8', icon: Tags,           isCustom: false },
]

/* ── Ícones disponíveis para categorias custom (whitelist) ────────────── */
export const ICON_CHOICES = [
  { value: 'ShoppingBag',   icon: ShoppingBag },
  { value: 'UtensilsCrossed', icon: UtensilsCrossed },
  { value: 'Car',           icon: Car },
  { value: 'Bus',           icon: Bus },
  { value: 'Home',          icon: Home },
  { value: 'Wifi',          icon: Wifi },
  { value: 'Gamepad2',      icon: Gamepad2 },
  { value: 'Clapperboard',  icon: Clapperboard },
  { value: 'Dumbbell',      icon: Dumbbell },
  { value: 'GraduationCap', icon: GraduationCap },
  { value: 'Plane',         icon: Plane },
  { value: 'Heart',         icon: Heart },
  { value: 'Gift',          icon: Gift },
  { value: 'Cat',           icon: Cat },
  { value: 'Banknote',      icon: Banknote },
  { value: 'Tag',           icon: Tag },
] as const

export const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  ICON_CHOICES.map(choice => [choice.value, choice.icon]),
)

export function iconFor(name: string): LucideIcon {
  return ICON_MAP[name] ?? Tag
}

export const COLOR_SWATCHES = [
  '#10B981', '#6366F1', '#818CF8', '#38BDF8', '#2DD4BF',
  '#FBBF24', '#F472B6', '#F43F5E', '#A78BFA', '#94A3B8',
]

/**
 * Resolve um slug de categoria → metadados visuais.
 * Aceita built-ins e customs ('c:<uuid>'). Fallback: "Outros".
 * Síncrono e isomórfico: funciona em Server e Client Components.
 */
export function resolveCategory(slug: string, custom: Category[]): ResolvedCategory {
  if (slug.startsWith('c:')) {
    const row = custom.find(cat => `c:${cat.id}` === slug)
    if (row) {
      return { slug, label: row.name, color: row.color, icon: iconFor(row.icon), isCustom: true }
    }
  }
  return BUILTIN.find(cat => cat.slug === slug) ?? BUILTIN[BUILTIN.length - 1]
}

/** Opções para <select> de categoria: built-ins + customs do usuário. */
export function categoryOptions(custom: Category[]): { slug: string; label: string }[] {
  return [
    ...BUILTIN.map(({ slug, label }) => ({ slug, label })),
    ...custom.map(cat => ({ slug: `c:${cat.id}`, label: cat.name })),
  ]
}

export const SOURCE_META: Record<IncomeSource, { label: string; badge: string; icon: LucideIcon }> = {
  fixo:     { label: 'Fixo',  badge: 'bg-emerald-500/10 text-emerald-300', icon: Briefcase },
  variavel: { label: 'Extra', badge: 'bg-amber-500/10 text-amber-300',      icon: Sparkles },
}
