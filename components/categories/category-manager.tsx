'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Loader2, Pencil, Plus, Tags, Trash2 } from 'lucide-react'
import { createCategory, deleteCategory, updateCategory } from '@/lib/actions/categories'
import { COLOR_SWATCHES, ICON_CHOICES, iconFor } from '@/lib/categories'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { FormError } from '@/components/ui/form-error'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/cn'
import type { Category } from '@/lib/types'

const DEFAULT_COLOR = '#6366F1'
const DEFAULT_ICON = 'Tag'

/** Modal de CRUD de categorias custom (nome + cor + ícone). */
export function CategoryManager({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => { setEditing(null); setOpen(true) }}>
        <Tags className="h-4 w-4" />Categorias
      </Button>

      <Dialog open={open} title="Minhas categorias" onClose={() => setOpen(false)} className="max-w-lg">
        <p className="text-xs leading-relaxed text-slate-500">
          Crie categorias personalizadas com cor e ícone próprios. Elas aparecem junto às categorias
          padrão nos formulários e nos gráficos.
        </p>

        {/* Lista das categorias custom */}
        <ul className="mt-4 max-h-56 space-y-1.5 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {categories.map(category => (
              <CategoryRow
                key={category.id}
                category={category}
                onEdit={() => setEditing(category)}
              />
            ))}
          </AnimatePresence>
          {categories.length === 0 && (
            <li className="rounded-lg border border-dashed border-slate-800 px-3 py-4 text-center text-xs text-slate-600">
              Nenhuma categoria personalizada ainda.
            </li>
          )}
        </ul>

        <div className="mt-4 border-t border-white/5 pt-4">
          {/* key remonta o formulário ao alternar entre "nova" e "editar" */}
          <CategoryForm key={editing?.id ?? 'new'} editing={editing} onDone={() => setEditing(null)} />
        </div>
      </Dialog>
    </>
  )
}

function CategoryRow({ category, onEdit }: { category: Category; onEdit: () => void }) {
  const [isDeleting, startDelete] = useTransition()
  const Icon = iconFor(category.icon)

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.18 }}
      className="flex items-center gap-3 rounded-lg border border-white/5 bg-slate-950/40 px-3 py-2"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: `${category.color}1A`, color: category.color }}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0 flex-1 truncate text-sm text-slate-200">{category.name}</span>
      <div className="flex shrink-0 gap-1">
        <Button variant="ghost" size="icon" aria-label="Editar categoria" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button variant="danger" size="icon" aria-label="Excluir categoria" disabled={isDeleting}
          onClick={() => startDelete(() => deleteCategory(category.id))}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.li>
  )
}

function CategoryForm({ editing, onDone }: { editing: Category | null; onDone: () => void }) {
  const [name, setName] = useState(editing?.name ?? '')
  const [color, setColor] = useState(editing?.color ?? DEFAULT_COLOR)
  const [icon, setIcon] = useState(editing?.icon ?? DEFAULT_ICON)
  const action = editing ? updateCategory : createCategory
  const [state, formAction, pending] = useActionState(action, {})

  // Sucesso → limpa o formulário (modo "nova") e volta o foco pro início.
  useEffect(() => {
    if (state.success) {
      onDone()
      setName('')
      setColor(DEFAULT_COLOR)
      setIcon(DEFAULT_ICON)
    }
  }, [state, onDone])

  return (
    <form action={formAction} className="space-y-4">
      {editing && <input type="hidden" name="id" value={editing.id} />}
      <input type="hidden" name="color" value={color} />
      <input type="hidden" name="icon" value={icon} />

      <div>
        <Label htmlFor="category-name">{editing ? 'Editar categoria' : 'Nova categoria'}</Label>
        <Input id="category-name" name="name" value={name} maxLength={40}
          onChange={e => setName(e.target.value)} placeholder="Ex.: Streaming, Pet, Academia" required />
      </div>

      {/* Seletor de cor */}
      <div>
        <Label>Cor</Label>
        <div className="flex flex-wrap gap-2">
          {COLOR_SWATCHES.map(swatch => (
            <button key={swatch} type="button" aria-label={`Cor ${swatch}`} onClick={() => setColor(swatch)}
              className={cn('h-7 w-7 rounded-full border-2 transition-transform hover:scale-110',
                color === swatch ? 'border-white/70' : 'border-transparent')}>
              <span className="block h-full w-full rounded-full" style={{ backgroundColor: swatch }} />
            </button>
          ))}
        </div>
      </div>

      {/* Seletor de ícone */}
      <div>
        <Label>Ícone</Label>
        <div className="grid grid-cols-8 gap-1.5">
          {ICON_CHOICES.map(choice => {
            const Icon = choice.icon
            return (
              <button key={choice.value} type="button" aria-label={choice.value} onClick={() => setIcon(choice.value)}
                className={cn('flex h-9 w-9 items-center justify-center rounded-lg border transition-colors',
                  icon === choice.value
                    ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300'
                    : 'border-white/5 text-slate-500 hover:border-white/20 hover:text-slate-300')}>
                <Icon className="h-4 w-4" />
              </button>
            )
          })}
        </div>
      </div>

      <FormError message={state.error} />

      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {editing ? 'Salvar alterações' : <><Plus className="h-4 w-4" />Criar categoria</>}
        </Button>
        {state.success && !editing && (
          <p className="flex items-center gap-1.5 text-xs text-emerald-400">
            <Check className="h-3.5 w-3.5" />Categoria criada.
          </p>
        )}
      </div>
    </form>
  )
}
