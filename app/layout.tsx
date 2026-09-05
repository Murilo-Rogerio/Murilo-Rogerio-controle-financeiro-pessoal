import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const description =
  'Controle financeiro pessoal: entradas, gastos, parcelamentos, patrimônio e investimentos — com CDI em tempo real e monitoramento de FIIs e ações.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Cofre · Finanças pessoais', template: '%s · Cofre' },
  description,
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    siteName: 'Cofre',
    title: 'Cofre · Finanças pessoais',
    description,
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Cofre — controle financeiro pessoal' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cofre · Finanças pessoais',
    description,
    images: ['/opengraph-image'],
  },
}

export const viewport: Viewport = { themeColor: '#090D16' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-dvh bg-base font-sans text-slate-100 antialiased">
        {children}
      </body>
    </html>
  )
}
