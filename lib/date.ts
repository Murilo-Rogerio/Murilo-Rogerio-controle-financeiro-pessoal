export const MONTH_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'] as const
const MONTH_LONG = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho',
  'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'] as const

/** Chave do mês atual no formato 'YYYY-MM'. */
export function currentMonthKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function isValidMonthKey(key: string | null | undefined): key is string {
  return !!key && /^\d{4}-(0[1-9]|1[0-2])$/.test(key)
}

function parseMonth(key: string): { year: number; month: number } {
  const [year, month] = key.split('-').map(Number)
  return { year, month: month - 1 }
}

/** Intervalo [start, end) do mês — usado nas queries do Supabase. */
export function monthRange(key: string): { start: string; end: string } {
  const { year, month } = parseMonth(key)
  const start = new Date(Date.UTC(year, month, 1))
  const end = new Date(Date.UTC(year, month + 1, 1))
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) }
}

export function shiftMonth(key: string, delta: number): string {
  const { year, month } = parseMonth(key)
  const date = new Date(Date.UTC(year, month + delta, 1))
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

/** "Janeiro de 2025" (usado nos cabeçalhos das páginas). */
export function monthTitle(key: string): string {
  const { year, month } = parseMonth(key)
  const label = `${MONTH_LONG[month]} de ${year}`
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function monthShort(key: string): string {
  return MONTH_SHORT[parseMonth(key).month]
}

/** Últimos `count` meses terminando em `endKey` (inclusive). */
export function lastMonthKeys(count: number, endKey: string): string[] {
  return Array.from({ length: count }, (_, i) => shiftMonth(endKey, -(count - 1 - i)))
}

export function todayISO(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}