'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { createExpense } from '@/lib/actions/expenses'
import { categoryOptions } from '@/lib/categories'
import { todayISO } from '@/lib/date'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FormError } from '@/components/ui/form-error'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MoneyFeedback } from '@/components/ui/money-feedback'
import { Select } from '@/components/ui/select'
import type { Category, RecurrenceType } from '@/lib/types'

export function ExpenseFormCard({ customCategories }: { customCategories: Category[] }) {
  const [state, formAction, pending] = useActionState(createExpense, {})
  const [recurrence, setRecurrence] = useState<RecurrenceType>('unica')

  // Animação de moedas descendo (gasto) + reset do formulário após sucesso.
  const formRef = useRef<HTMLFormElement>(null)
  const [feedback, setFeedback] = useState(false)

  useEffect(() => {
    if (state.success) {
      setFeedback(true)
      formRef.current?.reset()
      setRecurrence('unica')
      const timer = setTimeout(() => setFeedback(false), 1400)
      return () => clearTimeout(timer)
    }
  }, [state])

  const options = categoryOptions(customCategories)
  const today = todayISO()

  return (
    <>
      <MoneyFeedback show={feedback} direction="down" />

      <Card className="p-5">
        <h2 className="text-sm font-semibold text-slate-200">Novo gasto</h2>
        <form ref={formRef} action={formAction}
          className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] lg:items-end">
          <div>
            <Label htmlFor="expense-name">Nome</Label>
            <Input id="expense-name" name="name" placeholder="Ex.: Mercado da esquina" maxLength={120} required />
          </div>
          <div>
            <Label htmlFor="expense-amount">Valor (R$)</Label>
            <Input id="expense-amount" name="amount" inputMode="decimal" placeholder="0,00" required />
          </div>
          <div>
            <Label htmlFor="expense-category">Categoria</Label>
            <Select id="expense-category" name="category" defaultValue="alimentacao" required>
              <optgroup label="Padrão">
                {options.slice(0, 5).map(option => (
                  <option key={option.slug} value={option.slug}>{option.label}</option>
                ))}
              </optgroup>
              {options.length > 5 && (
                <optgroup label="Minhas categorias">
                  {options.slice(5).map(option => (
                    <option key={option.slug} value={option.slug}>{option.label}</option>
                  ))}
                </optgroup>
              )}
            </Select>
          </div>
          <div>
            <Label htmlFor="expense-date">Data</Label>
            <Input id="expense-date" name="spent_at" type="date" defaultValue={today}
              required suppressHydrationWarning />
          </div>
          <div>
            <Label htmlFor="expense-recurrence">Tipo</Label>
            <Select id="expense-recurrence" name="recurrence" value={recurrence}
              onChange={e => setRecurrence(e.target.value as RecurrenceType)} required>
              <option value="unica">Única</option>
              <option value="mensal">Mensal (fixa)</option>
              <option value="parcelada">Parcelada</option>
            </Select>
          </div>
          <Button type="submit" disabled={pending} className="w-full lg:w-auto">
            {pending ? 'Adicionando…' : <><Plus className="h-4 w-4" />Adicionar</>}
          </Button>

          <AnimatePresence initial={false}>
            {recurrence === 'parcelada' && (
              <motion.div
                key="installments"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden sm:col-span-2 lg:col-span-6"
              >
                <div className="grid grid-cols-2 gap-4 pb-1">
                  <div>
                    <Label htmlFor="installments-total">Total de parcelas</Label>
                    <Input id="installments-total" name="installments_total" type="number" min={2} max={48}
                      defaultValue={10} required />
                  </div>
                  <div>
                    <Label htmlFor="installment-number">Parcela atual</Label>
                    <Input id="installment-number" name="installment_number" type="number" min={1} max={48}
                      defaultValue={1} required />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="sm:col-span-2 lg:col-span-6">
            <FormError message={state.error} />
          </div>
        </form>
      </Card>
    </>
  )
}
