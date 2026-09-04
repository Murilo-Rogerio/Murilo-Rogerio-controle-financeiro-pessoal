'use client'

import { useEffect, useState, useTransition } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { deleteIncome, updateIncome } from '@/lib/actions/incomes'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { FormError } from '@/components/ui/form-error'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { SOURCE_META } from '@/lib/categories'
import { formatBRL, formatDateBR, toEditableNumber } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { Income } from '@/lib/types'

export function IncomeList({ incomes }: { incomes: Income[] }) {
  const [editing, setEditing] = useState<Income | null>(null)
  const [isDeleting, startDeleteTransition] = useTransition()

  if (incomes.length === 0) {
    return (
      <div className="px-5 pb-5 pt-3">
        <EmptyState icon={Plus} title="Nenhuma entrada registrada"
          description="Adicione seu salário ou um extra no formulário acima para acompanhá-lo aqui." />
      </div>
    )
  }

  return (
    <>
      <ul className="divide-y divide-slate-800/60">
        {incomes.map(income => {
          const meta = SOURCE_META[income.source_type]
          const Icon = meta.icon
          return (
            <li key={income.id} className="flex items-center gap-3 px-5 py-3.5">
              <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', meta.badge)}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-100">{income.name}</p>
                <p className="text-xs text-slate-500">{meta.label} · {formatDateBR(income.received_at)}</p>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-emerald-300">
                +{formatBRL(income.amount)}
              </span>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon" aria-label="Editar entrada" onClick={() => setEditing(income)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="danger" size="icon" aria-label="Excluir entrada" disabled={isDeleting}
                  onClick={() => startDeleteTransition(() => deleteIncome(income.id))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          )
        })}
      </ul>

      {editing && <IncomeEditDialog key={editing.id} income={editing} onClose={() => setEditing(null)} />}
    </>
  )
}

function IncomeEditDialog({ income, onClose }: { income: Income; onClose: () => void }) {
  const [state, formAction, pending] = useActionState(updateIncome, {})

  useEffect(() => {
    if (state.success) onClose()
  }, [state, onClose])

  return (
    <Dialog title="Editar entrada" onClose={onClose}>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="id" value={income.id} />

        <div>
          <Label htmlFor="edit-income-name">Nome</Label>
          <Input id="edit-income-name" name="name" defaultValue={income.name} maxLength={120} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="edit-income-amount">Valor (R$)</Label>
            <Input id="edit-income-amount" name="amount" inputMode="decimal"
              defaultValue={toEditableNumber(income.amount)} required />
          </div>
          <div>
            <Label htmlFor="edit-income-date">Data</Label>
            <Input id="edit-income-date" name="received_at" type="date"
              defaultValue={income.received_at} required />
          </div>
        </div>

        <div>
          <Label htmlFor="edit-income-source">Tipo</Label>
          <Select id="edit-income-source" name="source_type" defaultValue={income.source_type} required>
            <option value="fixo">Salário / fixo</option>
            <option value="variavel">Freela / extra</option>
          </Select>
        </div>

        <FormError message={state.error} />

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>Cancelar</Button>
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? 'Salvando…' : 'Salvar alterações'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}