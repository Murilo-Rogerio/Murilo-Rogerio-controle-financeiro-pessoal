'use client'

import { motion } from 'framer-motion'

/**
 * template.tsx remonta a cada navegação dentro do grupo (protected),
 * gerando a transição de entrada suave entre páginas.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  )
}
