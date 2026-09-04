import type { Metadata } from 'next'
import { CdiCalculator } from '@/components/savings/cdi-calculator'
import { getSavings } from '@/lib/data'
import { fetchCdiRate } from '@/lib/api/rates'

export const metadata: Metadata = { title: 'Patrimônio' }

export default async function PatrimonyPage() {
  const [savings, rate] = await Promise.all([getSavings(), fetchCdiRate()])

  // Taxa efetiva: API em tempo real; se offline, a última salva no Supabase.
  const apiRate = rate.source === 'api'
    ? rate
    : { value: savings?.cdi_annual_rate ?? rate.value, source: rate.source }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-100">Patrimônio & CDI</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Quantia guardada, taxa automática da BrasilAPI e rendimento estimado em tempo real.
        </p>
      </div>
      <CdiCalculator
        initial={{
          amount: savings?.amount ?? 0,
          cdi_percent: savings?.cdi_percent ?? 100,
          updated_at: savings?.updated_at ?? null,
        }}
        apiRate={apiRate}
      />
    </div>
  )
}
