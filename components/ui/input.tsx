import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref}
      className={cn(
        'h-10 w-full rounded-lg border border-slate-800 bg-slate-950/40 px-3 text-sm text-slate-100',
        'placeholder:text-slate-500 transition-colors outline-none',
        'focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/15',
        className,
      )}
      {...props} />
  ),
)
Input.displayName = 'Input'