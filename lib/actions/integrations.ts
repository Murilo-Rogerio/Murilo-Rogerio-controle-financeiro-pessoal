'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/data'
import type { ActionState } from '@/lib/types'

const PROVIDERS: Record<string, string> = {
  nubank: 'Nubank',
  mercadopago: 'Mercado Pago',
  inter: 'Banco Inter',
}

function revalidateIntegrations() {
  revalidatePath('/integracoes')
  revalidatePath('/dashboard')
  revalidatePath('/gastos')
  revalidatePath('/entradas')
}

/* ── Lançamentos de demonstração (modo demo do "Open Finance") ─────────── */
const DEMO_TEMPLATES = [
  { table: 'expenses', name: 'Supermercado', base: 189.9, category: 'alimentacao' },
  { table: 'expenses', name: 'iFood', base: 42.5, category: 'alimentacao' },
  { table: 'expenses', name: 'Combustível', base: 128.0, category: 'transporte' },
  { table: 'expenses', name: 'Farmácia', base: 67.4, category: 'outros' },
  { table: 'expenses', name: 'Cinema', base: 48.0, category: 'lazer' },
  { table: 'incomes', name: 'Venda online', base: 231.5, source: 'variavel' },
  { table: 'incomes', name: 'Freela', base: 480.0, source: 'variavel' },
] as const

const DEMO_OFFSETS = [27, 24, 20, 16, 12, 9, 6, 3, 0]

async function importDemoTransactions(
  supabase: Awaited<ReturnType<typeof requireUser>>['supabase'],
  userId: string,
  provider: string,
): Promise<number> {
  const pad = (n: number) => String(n).padStart(2, '0')
  const today = new Date()
  const expenseRows: any[] = []
  const incomeRows: any[] = []

  DEMO_OFFSETS.forEach((offset, i) => {
    const template = DEMO_TEMPLATES[i % DEMO_TEMPLATES.length]
    const d = new Date(today)
    d.setDate(d.getDate() - offset)
    const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

    // external_id torna a sincronização idempotente (re-sincronizar não duplica)
    const common = {
      user_id: userId,
      name: template.name,
      amount: Math.round((template.base + ((i * 13) % 37)) * 100) / 100,
      external_id: `${provider}:demo:${date}`,
    }

    if (template.table === 'expenses') {
      expenseRows.push({ ...common, category: template.category, spent_at: date })
    } else {
      incomeRows.push({ ...common, source_type: template.source, received_at: date })
    }
  })

  let imported = 0
  if (expenseRows.length) {
    const { data } = await supabase
      .from('expenses')
      .upsert(expenseRows, { onConflict: 'user_id,external_id', ignoreDuplicates: true })
      .select('id')
    imported += data?.length ?? 0
  }
  if (incomeRows.length) {
    const { data } = await supabase
      .from('incomes')
      .upsert(incomeRows, { onConflict: 'user_id,external_id', ignoreDuplicates: true })
      .select('id')
    imported += data?.length ?? 0
  }
  return imported
}

export async function connectBank(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const provider = String(formData.get('provider') ?? '')
  if (!PROVIDERS[provider]) return { error: 'Instituição inválida.' }

  const { supabase, user } = await requireUser()

  // Sem credenciais do agregador → modo demo (dados simulados).
  // Com credenciais → registra a conexão para o fluxo real do Pluggy.
  const usePluggy = !!(process.env.PLUGGY_CLIENT_ID && process.env.PLUGGY_SECRET)

  const { error } = await supabase.from('bank_connections').upsert(
    {
      user_id: user.id,
      provider,
      mode: usePluggy ? 'pluggy' : 'demo',
      status: 'active',
      last_synced_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,provider' },
  )
  if (error) return { error: 'Não foi possível registrar a conexão.' }

  if (usePluggy) {
    /*
     * Fluxo real com o agregador Pluggy (Open Finance):
     * 1. POST https://api.pluggy.ai/auth  { clientId, secret }  →  apiKey
     * 2. Abrir o widget PluggyLink no front com a apiKey → retorna { itemId }
     * 3. Salvar itemId em bank_connections.external_item_id
     * 4. syncBank: GET /transactions?itemId={itemId} → mapear (ver syncBank)
     */
    return { success: 'Conexão criada. Conclua o vínculo real no widget do agregador.' }
  }

  const imported = await importDemoTransactions(supabase, user.id, provider)
  revalidateIntegrations()
  return { success: `Conta conectada em modo demonstração — ${imported} lançamentos importados.` }
}

export async function syncBank(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get('id') ?? '')
  const { supabase, user } = await requireUser()

  const { data: conn } = await supabase.from('bank_connections').select('*').eq('id', id).maybeSingle()
  if (!conn || conn.user_id !== user.id) return { error: 'Conexão não encontrada.' }

  if (conn.mode === 'pluggy') {
    // TODO (fluxo real): GET https://api.pluggy.ai/transactions?itemId={conn.external_item_id}
    // Mapear cada transação: value < 0 → expenses; value > 0 → incomes;
    // categoria via keyword-matching; external_id = transaction.id do agregador.
    return { error: 'Sincronização real pendente: configure as credenciais do agregador.' }
  }

  const imported = await importDemoTransactions(supabase, user.id, conn.provider)
  await supabase.from('bank_connections').update({ last_synced_at: new Date().toISOString() }).eq('id', id)
  revalidateIntegrations()
  return {
    success: imported > 0
      ? `${imported} novo(s) lançamento(s) importado(s).`
      : 'Nenhum lançamento novo desde a última sincronização.',
  }
}

export async function disconnectBank(id: string) {
  const { supabase } = await requireUser()
  await supabase.from('bank_connections').update({ status: 'disconnected' }).eq('id', id)
  revalidateIntegrations()
}
