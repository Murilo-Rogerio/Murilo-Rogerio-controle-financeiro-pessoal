import type { Metadata } from 'next'
import { Info } from 'lucide-react'
import { BankConnections } from '@/components/integrations/bank-connections'
import { Card } from '@/components/ui/card'
import { requireUser } from '@/lib/data'

export const metadata: Metadata = { title: 'Integrações' }

export default async function IntegrationsPage() {
  const { supabase } = await requireUser()
  const { data } = await supabase.from('bank_connections').select('*').order('created_at')

  const connections = (data ?? []).map(row => ({
    id: row.id as string,
    provider: row.provider as string,
    mode: row.mode as 'demo' | 'pluggy',
    status: row.status as 'active' | 'error' | 'disconnected',
    last_synced_at: (row.last_synced_at as string) ?? null,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-100">Integrações bancárias</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Sincronize entradas e saídas automaticamente via Open Finance.
        </p>
      </div>

      <Card className="flex gap-3 border-indigo-500/20 bg-indigo-500/[0.04] p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-300" />
        <p className="text-xs leading-relaxed text-slate-400">
          <span className="font-medium text-slate-200">Como funciona o Open Finance aqui:</span> a integração
          direta com os bancos exige registro regulatório (apenas instituições participantes). Este app usa
          a arquitetura de <span className="text-indigo-300">agregadores</span> (Pluggy/Belvo) — sem credenciais
          configuradas, as contas operam em <span className="text-amber-300">modo demonstração</span> com
          lançamentos simulados e sincronização idempotente. Ao obter credenciais, o modo real ativa sem
          reescrita (o mapeamento está em <code className="rounded bg-slate-800/60 px-1">lib/actions/integrations.ts</code>).
        </p>
      </Card>

      <BankConnections connections={connections} />
    </div>
  )
}
