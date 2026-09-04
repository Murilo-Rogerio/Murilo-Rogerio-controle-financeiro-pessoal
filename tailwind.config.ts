import type { Config } from 'tailwindcss'

/**
 * Paleta do tema:
 * - base  #0B0F17  → fundo profundo (não preto puro)
 * - card  #151C2C  → superfícies, com bordas sutis slate-800/60
 * - Acentos: emerald (entradas) · indigo (investimentos/CDI) · rose (gastos)
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        base: '#0B0F17',
        card: '#151C2C',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config