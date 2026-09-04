import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

/** Superfície padrão: #151C2C com borda sutil e cantos rounded-xl. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-xl border border-slate-800/60 bg-card', className)} {...props} />
  )
}