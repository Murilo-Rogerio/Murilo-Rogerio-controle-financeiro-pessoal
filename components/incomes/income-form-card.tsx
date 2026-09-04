'use client'

import { useActionState, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { createIncome } from '@/lib/actions/incomes'
import { todayISO } from '@/lib/date'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FormError } from '@/components/ui/form-error'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/cn'

export function IncomeFormCard() {
  const [state, formAction, pending] = useActionState(createIncome, {})
  const [isFixed, setIsFixed] = useState(false)
  const today = todayISO()
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

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

        {/* Entrada fixa mensal + dia do mês */}
        <div className="sm:col-span-2 lg:col-span-6">
          <label className="flex cursor-pointer items-center gap-2.5 select-none">
            <input type="checkbox" name="is_fixed_monthly" checked={isFixed}
              onChange={e => setIsFixed(e.target.checked)}
              className="h-4 w-4 rounded accent-emerald-500" />
            <span className={cn('text-xs font-medium transition-colors',
              isFixed ? 'text-emerald-300' : 'text-slate-400')}>
              Entrada fixa mensal (repete todo mês)
            </span>
          </label>
        </div>

        <AnimatePresence initial={false}>
          {isFixed && (
            <motion.div
              key="day"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden sm:col-span-2 lg:col-span-2"
            >
              <div className="pb-1">
                <Label htmlFor="income-day">Dia do mês em que entra</Label>
                <Select id="income-day" name="day_of_month" defaultValue={5} required>
                  {days.map(day => <option key={day} value={day}>Todo dia {String(day).padStart(2, '0')}</option>)}
                </Select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="sm:col-span-2 lg:col-span-6">
          <FormError message={state.error} />
        </div>
      </form>
    </Card>
  )
}