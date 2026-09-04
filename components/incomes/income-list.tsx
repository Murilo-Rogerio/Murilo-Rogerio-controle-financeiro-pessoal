'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Briefcase, CalendarClock, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react'
import { deleteIncome, updateIncome } from '@/lib/actions/incomes'
import { SOURCE_META } from '@/lib/categories'
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
import type { Income, ProjectedIncome } from '@/lib/types'

export function IncomeList({ items }: { items: ProjectedIncome[] }) {
  const [editing, setEditing] = useState<Income | null>(null)
  const [isDeleting, startDeleteTransition] = useTransition()

  if (items.length === 0) {
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
        <AnimatePresence initial={false}>
          {items.map(({ income, date, isProjected }) => {
            const meta = SOURCE_META[income.source_type]
            const Icon = meta.icon
            return (
              <motion.li key={income.id}
                layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-3 px-5 py-3.5">
                <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', meta.badge)}>
                  <Icon className="h-4 w-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-100">{income.name}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                    <span>{meta.label} · {formatDateBR(date)}</span>
                    {income.is_fixed_monthly && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-px text-[10px] font-medium text-emerald-300">
                        <CalendarClock className="h-2.5 w-2.5" />
                        fixa · dia {String(income.day_of_month ?? '??').padStart(2, '0')}
                      </span>
                    )}
                    {isProjected && (
                      <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-px text-[10px] font-medium text-amber-300">
                        prevista
                      </span>
                    )}
                  </div>
                </div>

                <span className={cn('shrink-0 text-sm font-semibold tabular-nums',
                  isProjected ? 'text-emerald-500/60' : 'text-emerald-300')}>
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
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>

      {editing && <IncomeEditDialog key={editing.id} income={editing} onClose={() => setEditing(null)} />}
    </>
  )
}

function IncomeEditDialog({ income, onClose }: { income: Income; onClose: () => void }) {
  const [state, formAction, pending] = useActionState(updateIncome, {})
  const [isFixed, setIsFixed] = useState(income.is_fixed_monthly)
  const today = todayISO()
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  useEffect(() => {
    if (state.success) onClose()
  }, [state, onClose])

  return (
    <Dialog open title="Editar entrada" onClose={onClose}>
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
              defaultValue={income.received_at > today ? today : income.received_at} required />
          </div>
        </div>

        <div>
          <Label htmlFor="edit-income-source">Tipo</Label>
          <Select id="edit-income-source" name="source_type" defaultValue={income.source_type} required>
            <option value="fixo">Salário / fixo</option>
            <option value="variavel">Freela / extra</option>
          </Select>
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 select-none">
          <input type="checkbox" name="is_fixed_monthly" checked={isFixed}
            onChange={e => setIsFixed(e.target.checked)}
            className="h-4 w-4 rounded accent-emerald-500" />
          <span className={cn('text-xs font-medium transition-colors',
            isFixed ? 'text-emerald-300' : 'text-slate-400')}>
            Entrada fixa mensal (repete todo mês)
          </span>
        </label>

        <AnimatePresence initial={false}>
          {isFixed && (
            <motion.div
              key="day"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="pb-1">
                <Label htmlFor="edit-income-day">Dia do mês em que entra</Label>
                <Select id="edit-income-day" name="day_of_month"
                  defaultValue={income.day_of_month ?? 5} required>
                  {days.map(day => <option key={day} value={day}>Todo dia {String(day).padStart(2, '0')}</option>)}
                </Select>
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