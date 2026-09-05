import { ImageResponse } from 'next/og'

export const alt = 'Cofre — controle financeiro pessoal'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'flex-start', padding: 96,
          background: '#090D16', color: '#F1F5F9', fontFamily: 'sans-serif',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', right: -140, top: -140, width: 460, height: 460, borderRadius: '50%', background: 'rgba(99,102,241,0.22)' }} />
        <div style={{ position: 'absolute', left: -120, bottom: -160, width: 420, height: 420, borderRadius: '50%', background: 'rgba(16,185,129,0.16)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <div style={{ width: 96, height: 96, borderRadius: 26, background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, fontWeight: 700, color: '#090D16' }}>C</div>
          <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: -1 }}>Cofre</div>
        </div>

        <div style={{ fontSize: 32, color: '#94A3B8', marginTop: 28, maxWidth: 860 }}>
          Controle de entradas, gastos, patrimônio e investimentos
        </div>
        <div style={{ fontSize: 24, color: '#475569', marginTop: 14 }}>
          Parcelamentos · Categorias · CDI em tempo real · FIIs &amp; Ações
        </div>
      </div>
    ),
    size,
  )
}
