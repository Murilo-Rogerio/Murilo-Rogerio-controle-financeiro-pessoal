'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { deleteExpense, updateExpense } from '@/lib/actions/expenses'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { FormError } from '@/components/ui/form-error'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { CATEGORY_META, EXPENSE_CATEGORY_VALUES } from '@/lib/categories'
import { formatBRL, formatDateBR, toEditableNumber } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { Expense } from '@/lib/types'

export function ExpenseList({ expenses }: { expenses: Expense[] }) {
  const [editing, setEditing] = useState<Expense | null>(null)
  const [isDeleting, startDeleteTransition] = useTransition()

  if (expenses.length === 0) {
    return (
      <div className="px-5 pb-5 pt-3">
        <EmptyState icon={Plus} title="Nenhum gasto registrado"
          description="Adicione seu primeiro gasto no formulário acima para acompanhá-lo aqui." />
      </div>
    )
  }

  return (
    <>
      <ul className="divide-y divide-slate-800/60">
        {expenses.map(expense => {
          const meta = CATEGORY_META[expense.category]
          const Icon = meta.icon
          return (
            <li key={expense.id} className="flex items-center gap-3 px-5 py-3.5">
              <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', meta.badge)}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-100">{expense.name}</p>
                <p className="text-xs text-slate-500">{meta.label} · {formatDateBR(expense.spent_at)}</p>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-300">
                −{formatBRL(expense.amount)}
              </span>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon" aria-label="Editar gasto" onClick={() => setEditing(expense)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="danger" size="icon" aria-label="Excluir gasto" disabled={isDeleting}
                  onClick={() => startDeleteTransition(() => deleteExpense(expense.id))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          )
        })}
      </ul>

      {/* key remonta o diálogo por lançamento → estado limpo a cada edição */}
      {editing && <ExpenseEditDialog key={editing.id} expense={editing} onClose={() => setEditing(null)} />}
    </>
  )
}

function ExpenseEditDialog({ expense, onClose }: { expense: Expense; onClose: () => void }) {
  const [state, formAction, pending] = useActionState(updateExpense, {})

  // Fecha o diálogo automaticamente quando a atualização é concluída.
  useEffect(() => {
    if (state.success) onClose()
  }, [state, onClose])

  return (
    <Dialog title="Editar gasto" onClose={onClose}>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="id" value={expense.id} />

        <div>
          <Label htmlFor="edit-expense-name">Nome</Label>
          <Input id="edit-expense-name" name="name" defaultValue={expense.name} maxLength={120} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="edit-expense-amount">Valor (R$)</Label>
            <Input id="edit-expense-amount" name="amount" inputMode="decimal"
              defaultValue={toEditableNumber(expense.amount)} required />
          </div>
          <div>
            <Label htmlFor="edit-expense-date">Data</Label>
            <Input id="edit-expense-date" name="spent_at" type="date"
              defaultValue={expense.spent_at} required />
          </div>
        </div>

        <div>
          <Label htmlFor="edit-expense-category">Categoria</Label>
          <Select id="edit-expense-category" name="category" defaultValue={expense.category} required>
            {EXPENSE_CATEGORY_VALUES.map(category => (
              <option key={category} value={category}>{CATEGORY_META[category].label}</option>
            ))}
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
