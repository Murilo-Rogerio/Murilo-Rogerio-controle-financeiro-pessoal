import type { SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

/** Select nativo estilizado, com chevron customizado. */
export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          'h-10 w-full appearance-none rounded-lg border border-slate-800 bg-slate-950/40 px-3 pr-9',
          'text-sm text-slate-100 transition-colors outline-none',
          'focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/15',
          '[&>option]:bg-slate-900',
          className,
        )}
        {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
    </div>
  )
}