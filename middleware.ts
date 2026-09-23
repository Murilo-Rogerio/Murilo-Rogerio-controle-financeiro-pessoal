import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Rotas acessíveis SEM sessão.
 */
const PUBLIC_PATHS = ['/login', '/redefinir-senha', '/verificar-email', '/auth/callback']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  /**
   * ── FIX 504 (MIDDLEWARE_INVOCATION_TIMEOUT) ──
   * getSession() lê a sessão dos cookies SEM chamada de rede ao Supabase —
   * um Auth lento/indisponível não pode mais travar o middleware.
   * Segurança preservada: a validação real acontece em requireUser()
   * (Server Components) e no RLS do banco — o dado nunca sai sem token válido.
   */
  let authenticated = false
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const notExpired = session?.expires_at
      ? session.expires_at > Math.floor(Date.now() / 1000)
      : false
    authenticated = !!session && notExpired
  } catch {
    authenticated = false // degradação graciosa: nunca derruba a request
  }

  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(`${p}/`))

  if (!authenticated && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (authenticated && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
