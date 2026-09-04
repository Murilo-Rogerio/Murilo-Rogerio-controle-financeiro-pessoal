import { AlertCircle } from 'lucide-react'

/** Mensagem de erro padronizada para validações de Server Actions. */
export function FormError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  )
}