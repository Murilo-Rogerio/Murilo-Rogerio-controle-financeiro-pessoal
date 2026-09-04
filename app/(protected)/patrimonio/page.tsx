import type { Metadata } from 'next'
import { CdiCalculator } from '@/components/savings/cdi-calculator'
import { getSavings } from '@/lib/data'

export const metadata: Metadata = { title: 'Patrimônio' }

export default async function PatrimonyPage() {
  const savings = await getSavings()

  // Defaults amigáveis caso ainda não exista registro.
  const initial = {
    amount: savings?.amount ?? 0,
    cdi_annual_rate: savings?.cdi_annual_rate ?? 10.5,
    cdi_percent: savings?.cdi_percent ?? 100,
    updated_at: savings?.updated_at ?? null,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-100">Patrimônio & CDI</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Quantia guardada, taxa atual e rendimento estimado em tempo real.
        </p>
      </div>
      <CdiCalculator initial={initial} />
    </div>
  )
}