import { currentMonthKey, monthShort, shiftMonth } from './date'

/**
 * Motor de cálculo do CDI — isomórfico (server e client).
 *  - Taxa anual efetiva = CDI anual × (% do CDI aplicada)
 *  - Taxa mensal        = (1 + taxa anual)^(1/12) − 1
 *  - Líquido            = bruto × (1 − IR 22,5%, faixa até 180 dias)
 */
export const IR_RATE = 0.225

export interface CdiInput {
  amount: number
  annualRate: number
  cdiPercent: number
}

export interface CdiProjectionPoint {
  month: number
  label: string
  bruto: number
  liquido: number
}

export interface CdiResult {
  effectiveAnnualRate: number
  monthlyRate: number
  monthlyGross: number
  monthlyNet: number
  yearlyGross: number
  yearlyNet: number
  projection: CdiProjectionPoint[]
}

export function computeCdi({ amount, annualRate, cdiPercent }: CdiInput, startMonthKey?: string): CdiResult {
  const safeAmount = Math.max(0, amount)
  const safeAnnual = Math.max(0, annualRate)
  const safePercent = Math.max(0, cdiPercent)

  const effectiveAnnualRate = (safeAnnual / 100) * (safePercent / 100)
  const monthlyRate = Math.pow(1 + effectiveAnnualRate, 1 / 12) - 1

  const monthlyGross = safeAmount * monthlyRate
  const monthlyNet = monthlyGross * (1 - IR_RATE)
  const yearlyGross = safeAmount * effectiveAnnualRate
  const yearlyNet = yearlyGross * (1 - IR_RATE)

  const monthlyNetRate = monthlyRate * (1 - IR_RATE)

  // Projeção: ponto inicial = valor REAL guardado (mês atual),
  // depois 12 meses com rótulos de calendário reais (set, out, nov…).
  const start = startMonthKey ?? currentMonthKey()
  const projection: CdiProjectionPoint[] = [
    { month: 0, label: monthShort(start), bruto: safeAmount, liquido: safeAmount },
  ]
  for (let t = 1; t <= 12; t++) {
    projection.push({
      month: t,
      label: monthShort(shiftMonth(start, t)),
      bruto: safeAmount * Math.pow(1 + monthlyRate, t),
      liquido: safeAmount * Math.pow(1 + monthlyNetRate, t),
    })
  }

  return { effectiveAnnualRate, monthlyRate, monthlyGross, monthlyNet, yearlyGross, yearlyNet, projection }
}
