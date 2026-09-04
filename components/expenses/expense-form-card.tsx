'use client'

import { useActionState } from 'react'
import { Plus } from 'lucide-react'
import { createExpense } from '@/lib/actions/expenses'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { FormError } from '@/components/ui/form-error'
import { CATEGORY_META, EXPENSE_CATEGORY_VALUES } from '@/lib/categories'
import { todayISO } from '@/lib/date'

export function ExpenseFormCard() {
  const [state, formAction, pending] = useActionState(createExpense, {})
  const today = todayISO()

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-slate-200">Novo gasto</h2>
      <form action={formAction}
        className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-end">
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
            {EXPENSE_CATEGORY_VALUES.map(category => (
              <option key={category} value={category}>{CATEGORY_META[category].label}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="expense-date">Data</Label>
          <Input id="expense-date" name="spent_at" type="date" defaultValue={today}
            required suppressHydrationWarning />
        </div>
        <Button type="submit" disabled={pending} className="w-full lg:w-auto">
          {pending ? 'Adicionando…' : <><Plus className="h-4 w-4" />Adicionar</>}
        </Button>
        <div className="sm:col-span-2 lg:col-span-5">
          <FormError message={state.error} />
        </div>
      </form>
    </Card>
  )
}