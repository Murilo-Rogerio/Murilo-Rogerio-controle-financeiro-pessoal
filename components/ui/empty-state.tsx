import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  children?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-800 px-6 py-10 text-center">
      {Icon && <Icon className="h-7 w-7 text-slate-600" />}
      <p className="text-sm font-medium text-slate-300">{title}</p>
      {description && <p className="max-w-xs text-xs leading-relaxed text-slate-500">{description}</p>}
      {children}
    </div>
  )
}