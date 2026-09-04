'use client'

import { useActionState } from 'react'
import { Plus } from 'lucide-react'
import { createIncome } from '@/lib/actions/incomes'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { FormError } from '@/components/ui/form-error'
import { todayISO } from '@/lib/date'

export function IncomeFormCard() {
  const [state, formAction, pending] = useActionState(createIncome, {})
  const today = todayISO()

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-slate-200">Nova entrada</h2>
      <form action={formAction}
        className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-end">
        <div>
          <Label htmlFor="income-name">Nome</Label>
          <Input id="income-name" name="name" placeholder="Ex.: Salário" maxLength={120} required />
        </div>
        <div>
          <Label htmlFor="income-amount">Valor (R$)</Label>
          <Input id="income-amount" name="amount" inputMode="decimal" placeholder="0,00" required />
        </div>
        <div>
          <Label htmlFor="income-source">Tipo</Label>
          <Select id="income-source" name="source_type" defaultValue="fixo" required>
            <option value="fixo">Salário / fixo</option>
            <option value="variavel">Freela / extra</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="income-date">Data</Label>
          <Input id="income-date" name="received_at" type="date" defaultValue={today}
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