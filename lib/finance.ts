/**
 * Motor de cálculo do CDI — isomórfico (roda no server e no client).
 * Fórmulas:
 *  - Taxa anual efetiva = CDI anual × (% do CDI aplicada)
 *  - Taxa mensal        = (1 + taxa anual)^(1/12) − 1  (capitalização composta)
 *  - Líquido            = bruto × (1 − IR simulado de 22,5%, faixa até 180 dias)
 */
export const IR_RATE = 0.225

export interface CdiInput {
  amount: number      // quantia guardada (R$)
  annualRate: number  // taxa CDI anual em % (ex.: 10.5)
  cdiPercent: number  // % do CDI aplicada (ex.: 100)
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

export function computeCdi({ amount, annualRate, cdiPercent }: CdiInput): CdiResult {
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
  const projection = Array.from({ length: 12 }, (_, i) => {
    const t = i + 1
    return {
      month: t,
      label: `M${t}`,
      bruto: safeAmount * Math.pow(1 + monthlyRate, t),
      liquido: safeAmount * Math.pow(1 + monthlyNetRate, t),
    }
  })

  return { effectiveAnnualRate, monthlyRate, monthlyGross, monthlyNet, yearlyGross, yearlyNet, projection }
}