'use client'

import { useActionState, useTransition } from 'react'
import { AlertCircle, CheckCircle2, Landmark, RefreshCw, ShoppingBag, Smartphone } from 'lucide-react'
import { connectBank, disconnectBank, syncBank } from '@/lib/actions/integrations'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatDateBR } from '@/lib/format'
import { cn } from '@/lib/cn'

interface ConnectionRow {
  id: string
  provider: string
  mode: 'demo' | 'pluggy'
  status: 'active' | 'error' | 'disconnected'
  last_synced_at: string | null
}

const BANKS = [
  { provider: 'nubank', label: 'Nubank', icon: Smartphone, hint: 'Cartão e conta' },
  { provider: 'mercadopago', label: 'Mercado Pago', icon: ShoppingBag, hint: 'Conta e vendas' },
  { provider: 'inter', label: 'Banco Inter', icon: Landmark, hint: 'Conta e cartão' },
]

export function BankConnections({ connections }: { connections: ConnectionRow[] }) {
  const [connectState, doConnect, connectPending] = useActionState(connectBank, {})
  const [syncState, doSync, syncPending] = useActionState(syncBank, {})
  const [isDisconnecting, startDisconnect] = useTransition()

  return (
    <div className="space-y-4">
      {(connectState.error || syncState.error) && (
        <p className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {connectState.error || syncState.error}
        </p>
      )}
      {(connectState.success || syncState.success) && (
        <p className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {connectState.success || syncState.success}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {BANKS.map(bank => {
          const conn = connections.find(c => c.provider === bank.provider && c.status !== 'disconnected')
          const Icon = bank.icon
          return (
            <Card key={bank.provider} className="p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800/60 text-slate-300">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-100">{bank.label}</p>
                  <p className="text-[11px] text-slate-500">{bank.hint}</p>
                </div>
              </div>

              {conn ? (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                      Conectado · {conn.mode === 'demo' ? 'demo' : 'agregador'}
                    </span>
                  </div>
                  {conn.last_synced_at && (
                    <p className="text-[11px] text-slate-600">
                      Última sync: {formatDateBR(conn.last_synced_at.slice(0, 10))}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <form action={doSync} className="flex-1">
                      <input type="hidden" name="id" value={conn.id} />
                      <Button type="submit" variant="secondary" size="sm" className="w-full gap-2" disabled={syncPending}>
                        <RefreshCw className={cn('h-3.5 w-3.5', syncPending && 'animate-spin')} />
                        Sincronizar
                      </Button>
                    </form>
                    <Button variant="danger" size="sm" disabled={isDisconnecting}
                      onClick={() => startDisconnect(() => disconnectBank(conn.id))}>
                      Desconectar
                    </Button>
                  </div>
                </div>
              ) : (
                <form action={doConnect} className="mt-4">
                  <input type="hidden" name="provider" value={bank.provider} />
                  <Button type="submit" size="sm" className="w-full" disabled={connectPending}>
                    {connectPending ? 'Conectando…' : 'Conectar conta'}
                  </Button>
                </form>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
