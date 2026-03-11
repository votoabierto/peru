import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

// Edge-compatible candidate data — mirrors lib/seed-data.ts
// Cannot import directly because seed-data may use Node.js APIs
const CANDIDATES_EDGE: { slug: string; full_name: string; party: string; abbreviation: string }[] = [
  { slug: 'keiko-fujimori', full_name: 'Keiko Fujimori', party: 'Fuerza Popular', abbreviation: 'FP' },
  { slug: 'cesar-acuna', full_name: 'César Acuña', party: 'Alianza para el Progreso', abbreviation: 'APP' },
  { slug: 'jorge-nieto-montesinos', full_name: 'Jorge Nieto Montesinos', party: 'Partido del Buen Gobierno', abbreviation: 'PBG' },
  { slug: 'rosario-del-pilar-fernandez', full_name: 'Rosario del Pilar Fernández', party: 'Un Camino Diferente', abbreviation: 'UCD' },
  { slug: 'herbert-caller', full_name: 'Herbert Caller', party: 'Partido Patriótico del Perú', abbreviation: 'PPP' },
  { slug: 'alfonso-lopez-chau', full_name: 'Alfonso López-Chau', party: 'Ahora Nación', abbreviation: 'AN' },
  { slug: 'jose-luna-galvez', full_name: 'José Luna Gálvez', party: 'Podemos Perú', abbreviation: 'PP' },
  { slug: 'roberto-sanchez', full_name: 'Roberto Sánchez', party: 'Juntos por el Perú', abbreviation: 'JP' },
  { slug: 'carlos-jaico', full_name: 'Carlos Jaico', party: 'Perú Moderno', abbreviation: 'PM' },
  { slug: 'fernando-olivera', full_name: 'Fernando Olivera', party: 'Partido Frente de la Esperanza 2021', abbreviation: 'FE' },
  { slug: 'charlie-carrasco', full_name: 'Charlie Carrasco', party: 'Partido Demócrata Unido Perú', abbreviation: 'PDUP' },
  { slug: 'marisol-perez-tello', full_name: 'Marisol Pérez Tello', party: 'Primero la Gente', abbreviation: 'PLG' },
  { slug: 'paul-jaimes', full_name: 'Paul Jaimes', party: 'Progresemos', abbreviation: 'PROG' },
  { slug: 'mesias-guevara', full_name: 'Mesías Guevara', party: 'Partido Morado', abbreviation: 'MORA' },
  { slug: 'alvaro-paz-de-la-barra', full_name: 'Álvaro Paz de la Barra', party: 'Fe en el Perú', abbreviation: 'FEP' },
  { slug: 'george-forsyth', full_name: 'George Forsyth', party: 'Partido Democrático Somos Perú', abbreviation: 'SP' },
  { slug: 'carlos-alvarez', full_name: 'Carlos Álvarez', party: 'País Para Todos', abbreviation: 'PPT' },
  { slug: 'francisco-diez-canseco', full_name: 'Francisco Diez-Canseco', party: 'Perú Acción', abbreviation: 'PA' },
  { slug: 'wolfgang-grozo', full_name: 'Wolfgang Grozo', party: 'Integridad Democrática', abbreviation: 'ID' },
  { slug: 'ricardo-belmont', full_name: 'Ricardo Belmont', party: 'Partido Cívico Obras', abbreviation: 'PCO' },
  { slug: 'napoleon-becerra', full_name: 'Napoleón Becerra', party: 'Partido de los Trabajadores y Emprendedores PTE-Perú', abbreviation: 'PTE' },
  { slug: 'ronald-atencio', full_name: 'Ronald Atencio', party: 'Alianza Electoral Venceremos', abbreviation: 'AEV' },
  { slug: 'yonhy-lescano', full_name: 'Yonhy Lescano', party: 'Partido Político Cooperación Popular', abbreviation: 'CP' },
  { slug: 'mario-vizcarra', full_name: 'Mario Vizcarra', party: 'Partido Político Perú Primero', abbreviation: 'PPR' },
  { slug: 'joaquin-masse-fernandez', full_name: 'Joaquín Massé Fernández', party: 'Partido Democrático Federal', abbreviation: 'PDF' },
  { slug: 'enrique-valderrama', full_name: 'Enrique Valderrama', party: 'Partido Aprista Peruano', abbreviation: 'PAP' },
  { slug: 'alex-gonzales-castillo', full_name: 'Alex Gonzales Castillo', party: 'Partido Demócrata Verde', abbreviation: 'PDV' },
  { slug: 'roberto-chiabra', full_name: 'Roberto Chiabra', party: 'Unidad Nacional', abbreviation: 'UN' },
  { slug: 'rafael-belaunde', full_name: 'Rafael Belaunde', party: 'Libertad Popular', abbreviation: 'LP' },
  { slug: 'carlos-espa', full_name: 'Carlos Espá', party: 'Partido SíCreo', abbreviation: 'SC' },
  { slug: 'antonio-ortiz-villano', full_name: 'Antonio Ortiz Villano', party: 'Salvemos al Perú', abbreviation: 'SAP' },
  { slug: 'fiorella-molinelli', full_name: 'Fiorella Molinelli', party: 'Fuerza y Libertad', abbreviation: 'FYL' },
  { slug: 'vladimir-cerron', full_name: 'Vladimir Cerrón', party: 'Partido Político Nacional Perú Libre', abbreviation: 'PL' },
  { slug: 'walter-chirinos', full_name: 'Walter Chirinos', party: 'Partido Político PRIN', abbreviation: 'PRIN' },
  { slug: 'rafael-lopez-aliaga', full_name: 'Rafael López Aliaga', party: 'Renovación Popular', abbreviation: 'RP' },
  { slug: 'jose-williams-zapata', full_name: 'José Williams Zapata', party: 'Avanza País', abbreviation: 'AVP' },
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
              background: '#1A56A0',
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

          {/* Party abbreviation badge */}
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
              {candidate.abbreviation}
            </span>
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

          {/* Description */}
          <div
            style={{
              color: '#444444',
              fontSize: '20px',
              lineHeight: 1.5,
            }}
          >
            Conoce las propuestas, trayectoria y verificaciones de este candidato.
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
