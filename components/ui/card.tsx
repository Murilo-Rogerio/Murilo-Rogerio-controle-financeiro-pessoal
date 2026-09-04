import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

/** Superfície glass: fundo translúcido + blur + borda fina que acende no hover. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-white/5 bg-card/60 backdrop-blur-md transition-all duration-300',
        'hover:border-white/20',
        className,
      )}
      {...props}
    />
  )
}