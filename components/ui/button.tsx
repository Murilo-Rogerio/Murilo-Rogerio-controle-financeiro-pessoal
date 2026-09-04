import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'icon'

const variants: Record<Variant, string> = {
  primary: 'bg-emerald-500 font-semibold text-slate-950 hover:bg-emerald-400',
  secondary: 'border border-slate-800 bg-card text-slate-200 hover:border-slate-700 hover:text-white',
  ghost: 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100',
  danger: 'text-rose-400 hover:bg-rose-500/10 hover:text-rose-300',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  icon: 'h-9 w-9',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) => (
    <button ref={ref} type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg transition-colors outline-none',
        'focus-visible:ring-2 focus-visible:ring-emerald-500/40',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant], sizes[size], className,
      )}
      {...props} />
  ),
)
Button.displayName = 'Button'