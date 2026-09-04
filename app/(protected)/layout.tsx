import { requireUser } from '@/lib/data'
import { AppShell } from '@/components/layout/app-shell'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  // Segunda camada de proteção: além do middleware, o layout valida a sessão.
  const { user } = await requireUser()
  return <AppShell email={user.email ?? ''}>{children}</AppShell>
}