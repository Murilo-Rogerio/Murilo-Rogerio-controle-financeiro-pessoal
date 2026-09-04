import { MONTH_SHORT } from './date'

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/** Normaliza numeric do Postgres (que às vezes chega como string). */
export function toNumber(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

export function formatBRL(value: number | string): string {
  return brl.format(toNumber(value))
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

export function formatPct(value: number): string {
  return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`
}

/**
 * Aceita '1500', '1500.50', '1500,50' e '1.500,50'.
 * Retorna null quando o valor não puder ser interpretado.
 */
export function parseMoney(raw: string | null | undefined): number | null {
  if (!raw) return null
  let value = raw.trim().replace(/[R$\s]/gi, '')
  if (!value) return null
  if (value.includes(',')) {
    value = value.replace(/\./g, '').replace(',', '.')
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

/** Número pronto para editar em input (vírgula decimal, vazio quando 0). */
export function toEditableNumber(value: number): string {
  return value === 0 ? '' : String(value).replace('.', ',')
}

export function formatDateBR(iso: string): string {
  const [year, month, day] = iso.split('-')
  return day ? `${day}/${month}/${year}` : iso
}

export function formatDayMonth(iso: string): string {
  const [, month, day] = iso.split('-')
  return day ? `${day} ${MONTH_SHORT[Number(month) - 1]}` : iso
}