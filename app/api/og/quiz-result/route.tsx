import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'
import candidatePositionsData from '@/data/candidate-positions.json'

export const runtime = 'edge'

type CandidatePosition = {
  candidate_id: string
  candidate_name: string
  party: string
  party_abbreviation: string
  positions: Record<string, { score: number | null; label: string; verified: boolean }>
}

const candidatePositions = candidatePositionsData as CandidatePosition[]

function decodeResults(encoded: string): { answers: Record<string, number>; weights: Record<string, number> } | null {
  try {
    const padded = encoded.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice(0, (4 - (encoded.length % 4)) % 4)
    const json = atob(padded)
    const parsed = JSON.parse(json)
    if (parsed.a && typeof parsed.a === 'object') {
      return { answers: parsed.a, weights: parsed.w ?? {} }
    }
    return null
  } catch {
    return null
  }
}

function calculateMatch(
  userAnswers: Record<string, number>,
  weights: Record<string, number>,
  positions: Record<string, { score: number | null }>,
): number | null {
  const sharedIssues = Object.keys(userAnswers).filter((k) => {
    const p = positions[k]
    return p && p.score !== null
  })
  if (sharedIssues.length < 3) return null

  let weightedDiff = 0
  let totalWeight = 0
  for (const issue of sharedIssues) {
    const w = weights[issue] ?? 1
    const diff = Math.abs(userAnswers[issue] - positions[issue].score!)
    weightedDiff += diff * w
    totalWeight += w * 4
  }
  return Math.round((1 - weightedDiff / totalWeight) * 100)
}

function scoreToAxis(score: number): number {
  return (score - 3) / 2
}

function computeAxis(keys: string[], answers: Record<string, number>): number {
  const scores = keys.map((k) => answers[k]).filter((s) => s != null)
  if (scores.length === 0) return 0
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  return scoreToAxis(avg)
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const encoded = searchParams.get('r')

  if (!encoded) {
    return new ImageResponse(
      (
        <div style={{ width: '1200px', height: '630px', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <span style={{ color: '#1A56A0', fontSize: '48px', fontWeight: 'bold' }}>Quiz Electoral</span>
          <span style={{ color: '#777777', fontSize: '24px', marginTop: '16px' }}>VotoAbierto.pe</span>
        </div>
      ),
      { width: 1200, height: 630 }
    )
  }

  const decoded = decodeResults(encoded)
  if (!decoded) {
    return new ImageResponse(
      (
        <div style={{ width: '1200px', height: '630px', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#1A56A0', fontSize: '48px', fontWeight: 'bold' }}>VotoAbierto.pe</span>
        </div>
      ),
      { width: 1200, height: 630 }
    )
  }

  const { answers, weights } = decoded

  // Find top match
  const results = candidatePositions
    .map((cp) => ({
      name: cp.candidate_name,
      party: cp.party,
      partyAbbr: cp.party_abbreviation,
      matchPct: calculateMatch(answers, weights, cp.positions),
    }))
    .filter((r) => r.matchPct !== null)
    .sort((a, b) => (b.matchPct ?? 0) - (a.matchPct ?? 0))

  const top = results[0]

  // User compass position
  const userX = computeAxis(['economia', 'recursos_naturales', 'politica_social'], answers)
  const userY = computeAxis(['constitucion', 'reforma_judicial', 'seguridad'], answers)

  // Compass candidates (simplified)
  const compassDots = candidatePositions
    .filter((cp) => {
      const count = Object.values(cp.positions).filter((p) => p.score !== null).length
      return count >= 6
    })
    .map((cp) => {
      const econ = ['economia', 'recursos_naturales', 'politica_social']
        .map((k) => cp.positions[k]?.score)
        .filter((s): s is number => s != null)
      const social = ['constitucion', 'reforma_judicial', 'seguridad']
        .map((k) => cp.positions[k]?.score)
        .filter((s): s is number => s != null)
      const x = econ.length > 0 ? scoreToAxis(econ.reduce((a, b) => a + b, 0) / econ.length) : 0
      const y = social.length > 0 ? scoreToAxis(social.reduce((a, b) => a + b, 0) / social.length) : 0
      return { abbr: cp.party_abbreviation, x, y }
    })

  const compassSize = 280
  const compassX = 820
  const compassY = 160

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
        {/* Top bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: '#1A56A0' }} />

        {/* Left half — result */}
        <div
          style={{
            width: '680px',
            height: '630px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '60px 60px 60px 80px',
          }}
        >
          <div style={{ color: '#1A56A0', fontSize: '16px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '24px' }}>
            Quiz Electoral VotoAbierto
          </div>

          {top ? (
            <>
              <div style={{ color: '#444444', fontSize: '28px', marginBottom: '8px' }}>
                Tengo {top.matchPct}% de afinidad con
              </div>
              <div style={{ color: '#111111', fontSize: '52px', fontWeight: 'bold', lineHeight: 1.15, marginBottom: '12px' }}>
                {top.name}
              </div>
              <div style={{ color: '#777777', fontSize: '24px', marginBottom: '32px' }}>
                {top.party}
              </div>
            </>
          ) : (
            <div style={{ color: '#444444', fontSize: '28px' }}>
              Hice el quiz electoral
            </div>
          )}

          {/* Runner ups */}
          {results.length > 1 && (
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {results.slice(1, 4).map((r, i) => (
                <div
                  key={i}
                  style={{
                    background: '#F7F6F3',
                    border: '1px solid #E5E3DE',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1A56A0' }}>{r.matchPct}%</span>
                  <span style={{ fontSize: '14px', color: '#444444' }}>{r.partyAbbr}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right half — mini compass */}
        <div
          style={{
            width: '520px',
            height: '630px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Compass background */}
          <svg
            width={compassSize + 40}
            height={compassSize + 40}
            viewBox={`0 0 ${compassSize + 40} ${compassSize + 40}`}
          >
            {/* Grid */}
            <rect x="20" y="20" width={compassSize} height={compassSize} fill="#F7F6F3" stroke="#E5E3DE" strokeWidth="1" />
            <line x1={20 + compassSize / 2} y1="20" x2={20 + compassSize / 2} y2={20 + compassSize} stroke="#E5E3DE" strokeWidth="1" />
            <line x1="20" y1={20 + compassSize / 2} x2={20 + compassSize} y2={20 + compassSize / 2} stroke="#E5E3DE" strokeWidth="1" />

            {/* Candidate dots */}
            {compassDots.map((dot, i) => {
              const cx = 20 + ((dot.x + 1) / 2) * compassSize
              const cy = 20 + ((dot.y + 1) / 2) * compassSize
              return <circle key={i} cx={cx} cy={cy} r="4" fill="#CBCAC5" opacity="0.6" />
            })}

            {/* User dot */}
            <circle
              cx={20 + ((userX + 1) / 2) * compassSize}
              cy={20 + ((userY + 1) / 2) * compassSize}
              r="10"
              fill="#1A56A0"
              stroke="white"
              strokeWidth="3"
            />
          </svg>

          {/* Labels */}
          <div style={{ position: 'absolute', top: compassY - 30, left: compassX - 100, right: compassX - 100, display: 'flex', justifyContent: 'center' }}>
            <span style={{ fontSize: '11px', color: '#999999' }}>Progresista</span>
          </div>
          <div style={{ position: 'absolute', bottom: '50px', left: compassX - 100, right: compassX - 100, display: 'flex', justifyContent: 'center' }}>
            <span style={{ fontSize: '11px', color: '#999999' }}>Conservador</span>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '16px 80px',
            background: '#F7F6F3',
            borderTop: '1px solid #E5E3DE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ color: '#1A56A0', fontSize: '18px', fontWeight: 'bold' }}>
            Descubre el tuyo en votoabierto.pe/quiz
          </span>
          <span style={{ color: '#999999', fontSize: '14px' }}>
            Datos: JNE | Elecciones 12 de abril 2026
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
