import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

const CANDIDATES_EDGE = [
  { slug: 'keiko-fujimori', full_name: 'Keiko Fujimori', party: 'Fuerza Popular', ideology: 'Derecha', polling_percentage: 18.5, color: '#1A56A0', issues: ['Seguridad ciudadana', 'Economía de mercado', 'Anti-corrupción'] },
  { slug: 'pedro-castillo', full_name: 'Pedro Castillo', party: 'Perú Libre', ideology: 'Izquierda', polling_percentage: 12.3, color: '#1A56A0', issues: ['Asamblea constituyente', 'Reforma agraria', 'Educación pública'] },
  { slug: 'rafael-lopez-aliaga', full_name: 'Rafael López Aliaga', party: 'Renovación Popular', ideology: 'Derecha radical', polling_percentage: 14.2, color: '#1A56A0', issues: ['Economía liberal', 'Seguridad', 'Valores tradicionales'] },
  { slug: 'veronika-mendoza', full_name: 'Verónika Mendoza', party: 'Juntos por el Perú', ideology: 'Izquierda', polling_percentage: 7.8, color: '#1A56A0', issues: ['Igualdad social', 'Medio ambiente', 'Pueblos indígenas'] },
  { slug: 'daniel-urresti', full_name: 'Daniel Urresti', party: 'Podemos Perú', ideology: 'Centro', polling_percentage: 9.1, color: '#1A56A0', issues: ['Seguridad ciudadana', 'Empleo', 'Infraestructura'] },
  { slug: 'julio-guzman', full_name: 'Julio Guzmán', party: 'Partido Morado', ideology: 'Centro progresista', polling_percentage: 5.4, color: '#1A56A0', issues: ['Modernización del Estado', 'Educación', 'Empleo formal'] },
  { slug: 'yonhy-lescano', full_name: 'Yonhy Lescano', party: 'Acción Popular', ideology: 'Centro', polling_percentage: 6.2, color: '#1A56A0', issues: ['Descentralización', 'Salud pública', 'Agricultura'] },
  { slug: 'hernando-de-soto', full_name: 'Hernando de Soto', party: 'Avancemos', ideology: 'Derecha liberal', polling_percentage: 4.8, color: '#1A56A0', issues: ['Formalización económica', 'Propiedad privada', 'Libre mercado'] },
  { slug: 'george-forsyth', full_name: 'George Forsyth', party: 'Victoria Nacional', ideology: 'Centro derecha', polling_percentage: 8.3, color: '#1A56A0', issues: ['Seguridad', 'Modernización', 'Juventud'] },
  { slug: 'ollanta-humala', full_name: 'Ollanta Humala', party: 'Partido Nacionalista Peruano', ideology: 'Izquierda moderada', polling_percentage: 3.9, color: '#1A56A0', issues: ['Soberanía nacional', 'Recursos naturales', 'Inclusión social'] },
]

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const candidate = CANDIDATES_EDGE.find((c) => c.slug === slug)

  if (!candidate) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ color: '#1A56A0', fontSize: '48px', fontWeight: 'bold' }}>
            VotoAbierto.pe
          </span>
        </div>
      ),
      { width: 1200, height: 630 }
    )
  }

  const initials = candidate.full_name
    .split(' ')
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#FFFFFF',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Peru red top border */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: '#D91023',
          }}
        />

        {/* Left panel */}
        <div
          style={{
            width: '300px',
            height: '630px',
            background: '#F7F6F3',
            borderRight: '1px solid #E5E3DE',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            paddingTop: '20px',
          }}
        >
          {/* Initials circle */}
          <div
            style={{
              width: '180px',
              height: '180px',
              borderRadius: '90px',
              background: candidate.color,
              border: '4px solid #E5E3DE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '64px',
              fontWeight: 'bold',
            }}
          >
            {initials}
          </div>

          {/* Polling badge */}
          <div
            style={{
              background: '#EEF4FF',
              border: '1px solid #1A56A0',
              borderRadius: '20px',
              padding: '8px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ color: '#1A56A0', fontSize: '22px', fontWeight: 'bold' }}>
              {candidate.polling_percentage}%
            </span>
            <span style={{ color: '#777777', fontSize: '14px' }}>en encuestas</span>
          </div>

          {/* Ideology badge */}
          <div
            style={{
              background: '#EEEDE9',
              border: '1px solid #CBCAC5',
              borderRadius: '12px',
              padding: '6px 16px',
              color: '#444444',
              fontSize: '15px',
            }}
          >
            {candidate.ideology}
          </div>
        </div>

        {/* Right panel */}
        <div
          style={{
            flex: 1,
            padding: '48px 60px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {/* Label */}
          <div
            style={{
              color: '#1A56A0',
              fontSize: '14px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            Candidato Presidencial 2026
          </div>

          {/* Full name */}
          <div
            style={{
              color: '#111111',
              fontSize: '52px',
              fontWeight: 'bold',
              lineHeight: 1.1,
              marginBottom: '12px',
            }}
          >
            {candidate.full_name}
          </div>

          {/* Party */}
          <div
            style={{
              color: '#777777',
              fontSize: '28px',
              marginBottom: '32px',
            }}
          >
            {candidate.party}
          </div>

          {/* Divider */}
          <div
            style={{
              height: '1px',
              background: '#E5E3DE',
              marginBottom: '28px',
            }}
          />

          {/* Issues label */}
          <div
            style={{
              color: '#777777',
              fontSize: '13px',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            Propuestas principales
          </div>

          {/* Issues list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {candidate.issues.slice(0, 3).map((issue: string, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: '#1A56A0',
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: '#444444', fontSize: '20px' }}>{issue}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: '28px',
              right: '60px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                background: '#1A56A0',
                borderRadius: '8px',
                padding: '6px 14px',
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              VotoAbierto.pe
            </div>
            <span style={{ color: '#777777', fontSize: '14px' }}>Elecciones Peru 2026</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
