import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Página de destino do link de confirmação de e-mail.
 * Troca o código (PKCE) por sessão e encaminha para a confirmação amigável.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}/verificar-email?status=ok`)
    }
  }

  return NextResponse.redirect(`${origin}/verificar-email?status=invalid`)
}
