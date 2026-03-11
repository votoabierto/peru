import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

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

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('')
}

function renderPanel(candidate: typeof CANDIDATES_EDGE[0]) {
  const initials = getInitials(candidate.full_name)
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '60px',
          background: '#1A56A0',
          border: '3px solid #E5E3DE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '48px',
          fontWeight: 'bold',
        }}
      >
        {initials}
      </div>
      <div style={{ color: '#111111', fontSize: '32px', fontWeight: 'bold', textAlign: 'center', lineHeight: 1.2 }}>
        {candidate.full_name}
      </div>
      <div style={{ color: '#777777', fontSize: '20px', textAlign: 'center' }}>
        {candidate.party}
      </div>
      <div
        style={{
          background: '#EEF4FF',
          border: '1px solid #1A56A0',
          borderRadius: '16px',
          padding: '6px 16px',
          color: '#1A56A0',
          fontSize: '18px',
          fontWeight: 'bold',
        }}
      >
        {candidate.abbreviation}
      </div>
    </div>
  )
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slugA = searchParams.get('a')
  const slugB = searchParams.get('b')

  const candidateA = slugA ? CANDIDATES_EDGE.find(c => c.slug === slugA) : null
  const candidateB = slugB ? CANDIDATES_EDGE.find(c => c.slug === slugB) : null

  if (!candidateA && !candidateB) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            background: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
          }}
        >
          <div style={{ color: '#1A56A0', fontSize: '48px', fontWeight: 'bold' }}>
            Comparar Candidatos
          </div>
          <div style={{ color: '#777777', fontSize: '24px' }}>
            VotoAbierto.pe — Elecciones Peru 2026
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    )
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Peru red top border */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#D91023' }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '32px' }}>
          <div style={{ color: '#1A56A0', fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Comparando Candidatos 2026
          </div>
        </div>

        {/* Panels */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          {candidateA ? renderPanel(candidateA) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CBCAC5', fontSize: '24px' }}>
              Selecciona candidato
            </div>
          )}

          {/* VS divider */}
          <div
            style={{
              width: '80px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <div style={{ width: '1px', height: '80px', background: '#E5E3DE' }} />
            <div
              style={{
                background: '#D91023',
                color: '#FFFFFF',
                width: '48px',
                height: '48px',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 'bold',
              }}
            >
              VS
            </div>
            <div style={{ width: '1px', height: '80px', background: '#E5E3DE' }} />
          </div>

          {candidateB ? renderPanel(candidateB) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CBCAC5', fontSize: '24px' }}>
              Selecciona candidato
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            paddingBottom: '24px',
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
    ),
    { width: 1200, height: 630 }
  )
}
