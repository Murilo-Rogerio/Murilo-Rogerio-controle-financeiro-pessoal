'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Pencil, Plus, Repeat, Trash2 } from 'lucide-react'
import { deleteExpense, updateExpense } from '@/lib/actions/expenses'
import { categoryOptions, resolveCategory } from '@/lib/categories'
import { todayISO } from '@/lib/date'
import { formatBRL, formatDateBR, toEditableNumber } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { FormError } from '@/components/ui/form-error'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/cn'
import type { Category, Expense, ProjectedExpense, RecurrenceType } from '@/lib/types'

interface ExpenseListProps {
  items: ProjectedExpense[]
  customCategories: Category[]
}

export function ExpenseList({ items, customCategories }: ExpenseListProps) {
  const [editing, setEditing] = useState<Expense | null>(null)
  const [isDeleting, startDeleteTransition] = useTransition()

  if (items.length === 0) {
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
        <AnimatePresence initial={false}>
          {items.map(({ expense, date, isProjected, installment }) => {
            const info = resolveCategory(expense.category, customCategories)
            const Icon = info.icon
            return (
              <motion.li key={expense.id}
                layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-3 px-5 py-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${info.color}1A`, color: info.color }}>
                  <Icon className="h-4 w-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-100">{expense.name}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                    <span>{info.label} · {formatDateBR(date)}</span>
                    {installment && (
                      <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-1.5 py-px text-[10px] font-medium text-indigo-300">
                        {installment.current}/{installment.total}
                      </span>
                    )}
                    {expense.recurrence === 'mensal' && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800/60 px-1.5 py-px text-[10px] font-medium text-slate-400">
                        <Repeat className="h-2.5 w-2.5" />mensal
                      </span>
                    )}
                    {isProjected && (
                      <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-px text-[10px] font-medium text-amber-300">
                        previsto
                      </span>
                    )}
                  </div>
                </div>

                <span className={cn('shrink-0 text-sm font-semibold tabular-nums',
                  isProjected ? 'text-slate-500' : 'text-slate-300')}>
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
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>

      {editing && (
        <ExpenseEditDialog key={editing.id} expense={editing}
          customCategories={customCategories} onClose={() => setEditing(null)} />
      )}
    </>
  )
}

function ExpenseEditDialog({ expense, customCategories, onClose }: {
  expense: Expense
  customCategories: Category[]
  onClose: () => void
}) {
  const [state, formAction, pending] = useActionState(updateExpense, {})
  const [recurrence, setRecurrence] = useState<RecurrenceType>(expense.recurrence)
  const options = categoryOptions(customCategories)
  const today = todayISO()

  useEffect(() => {
    if (state.success) onClose()
  }, [state, onClose])

  return (
    <Dialog open title="Editar gasto" onClose={onClose}>
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
              defaultValue={expense.spent_at > today ? today : expense.spent_at} required />
          </div>
        </div>

        <div>
          <Label htmlFor="edit-expense-category">Categoria</Label>
          <Select id="edit-expense-category" name="category" defaultValue={expense.category} required>
            {options.map(option => (
              <option key={option.slug} value={option.slug}>{option.label}</option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="edit-expense-recurrence">Tipo</Label>
          <Select id="edit-expense-recurrence" name="recurrence" value={recurrence}
            onChange={e => setRecurrence(e.target.value as RecurrenceType)} required>
            <option value="unica">Única</option>
            <option value="mensal">Mensal (fixa)</option>
            <option value="parcelada">Parcelada</option>
          </Select>
        </div>

        <AnimatePresence initial={false}>
          {recurrence === 'parcelada' && (
            <motion.div
              key="installments"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-4 pb-1">
                <div>
                  <Label htmlFor="edit-installments-total">Total de parcelas</Label>
                  <Input id="edit-installments-total" name="installments_total" type="number" min={2} max={48}
                    defaultValue={expense.installments_total ?? 10} required />
                </div>
                <div>
                  <Label htmlFor="edit-installment-number">Parcela atual</Label>
                  <Input id="edit-installment-number" name="installment_number" type="number" min={1} max={48}
                    defaultValue={expense.installment_number ?? 1} required />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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