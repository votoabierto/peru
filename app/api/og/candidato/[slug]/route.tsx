import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'
import candidatesJson from '@/data/candidates.json'

export const runtime = 'edge'

type CandidateData = {
  slug: string
  full_name: string
  party_name: string
  party_abbreviation: string
  planGobiernoEjes?: { eje: string; descripcion: string }[]
}

const candidates = candidatesJson as CandidateData[]

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^#{1,3}\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const candidate = candidates.find((c) => c.slug === slug)

  if (!candidate) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '1200px',
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
      { width: 1200, height: 1200 }
    )
  }

  const initials = candidate.full_name
    .split(' ')
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')

  const topEjes = (candidate.planGobiernoEjes ?? []).slice(0, 3)

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '1200px',
          background: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            height: '20px',
            background: '#1A56A0',
            width: '100%',
          }}
        />

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '60px 80px 0 80px',
          }}
        >
          {/* Initials circle */}
          <div
            style={{
              width: '200px',
              height: '200px',
              borderRadius: '100px',
              background: '#1A56A0',
              border: '4px solid #E5E3DE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '72px',
              fontWeight: 'bold',
              fontFamily: 'monospace',
            }}
          >
            {initials}
          </div>

          {/* Name */}
          <div
            style={{
              color: '#111111',
              fontSize: '48px',
              fontWeight: 'bold',
              lineHeight: 1.2,
              marginTop: '32px',
              textAlign: 'center',
            }}
          >
            {candidate.full_name}
          </div>

          {/* Party */}
          <div
            style={{
              color: '#777777',
              fontSize: '28px',
              marginTop: '12px',
              textAlign: 'center',
            }}
          >
            {candidate.party_name}
          </div>

          {/* Divider */}
          <div
            style={{
              height: '2px',
              background: '#E5E3DE',
              width: '100%',
              marginTop: '40px',
              marginBottom: '40px',
            }}
          />

          {/* Top 3 proposals from plan ejes */}
          {topEjes.length > 0 && (
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              {topEjes.map((eje, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '18px',
                      background: '#1A56A0',
                      color: 'white',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span
                      style={{
                        color: '#111111',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        marginBottom: '4px',
                      }}
                    >
                      {eje.eje}
                    </span>
                    <span
                      style={{
                        color: '#444444',
                        fontSize: '20px',
                        lineHeight: 1.4,
                      }}
                    >
                      {stripMarkdown(eje.descripcion).slice(0, 120)}
                      {eje.descripcion.length > 120 ? '...' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px 80px',
            background: '#F7F6F3',
            borderTop: '1px solid #E5E3DE',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                background: '#1A56A0',
                borderRadius: '8px',
                padding: '8px 16px',
                color: '#FFFFFF',
                fontSize: '20px',
                fontWeight: 'bold',
              }}
            >
              VotoAbierto.pe
            </div>
            <span style={{ color: '#777777', fontSize: '18px' }}>
              Elecciones Peru 2026
            </span>
          </div>
          <span style={{ color: '#999999', fontSize: '16px' }}>
            Datos: JNE | Fuente oficial
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 1200 }
  )
}
