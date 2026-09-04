import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: { default: 'Cofre · Finanças pessoais', template: '%s · Cofre' },
  description:
    'Controle de entradas, gastos, patrimônio e simulação de CDI — construído com Next.js e Supabase.',
}

export const viewport: Viewport = { themeColor: '#0B0F17' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-dvh bg-base font-sans text-slate-100 antialiased">
        {children}
      </body>
    </html>
  )
}