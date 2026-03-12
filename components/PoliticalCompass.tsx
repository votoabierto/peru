'use client'

type CompassCandidate = {
  id: string
  name: string
  partyAbbr: string
  x: number // -1 (state) to 1 (free market)
  y: number // -1 (progressive) to 1 (conservative)
  matchPct: number | null
}

type Props = {
  candidates: CompassCandidate[]
  userX: number
  userY: number
}

// Map a 1-5 score to -1..1 range
export function scoreToAxis(score: number): number {
  return (score - 3) / 2
}

// Compute economic axis from economia + recursos_naturales + politica_social
export function computeEconomicAxis(
  positions: Record<string, { score: number | null }>,
  answers?: Record<string, number>,
): number | null {
  const keys = ['economia', 'recursos_naturales', 'politica_social']
  const source = answers ?? positions
  const scores: number[] = []
  for (const k of keys) {
    const val = answers ? (source as Record<string, number>)[k] : (positions[k]?.score ?? null)
    if (val !== null && val !== undefined) scores.push(val as number)
  }
  if (scores.length === 0) return null
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  return scoreToAxis(avg)
}

// Compute social axis from constitucion + reforma_judicial + seguridad
export function computeSocialAxis(
  positions: Record<string, { score: number | null }>,
  answers?: Record<string, number>,
): number | null {
  const keys = ['constitucion', 'reforma_judicial', 'seguridad']
  const source = answers ?? positions
  const scores: number[] = []
  for (const k of keys) {
    const val = answers ? (source as Record<string, number>)[k] : (positions[k]?.score ?? null)
    if (val !== null && val !== undefined) scores.push(val as number)
  }
  if (scores.length === 0) return null
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  return scoreToAxis(avg)
}

function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
}

export default function PoliticalCompass({ candidates, userX, userY }: Props) {
  // Find nearest 3 candidates to highlight
  const sorted = [...candidates].sort(
    (a, b) => distance(a.x, a.y, userX, userY) - distance(b.x, b.y, userX, userY),
  )
  const nearest3Ids = new Set(sorted.slice(0, 3).map((c) => c.id))

  // Map coordinates to SVG space (0-400, with padding)
  const pad = 40
  const size = 400
  const inner = size - pad * 2
  const toSvgX = (v: number) => pad + ((v + 1) / 2) * inner
  const toSvgY = (v: number) => pad + ((v + 1) / 2) * inner // +1 = conservative = top in data, top in SVG

  return (
    <div className="w-full max-w-lg mx-auto">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto" role="img" aria-label="Mapa político 2D">
        {/* Background */}
        <rect x={pad} y={pad} width={inner} height={inner} fill="#F7F6F3" rx="4" />

        {/* Grid lines */}
        <line x1={toSvgX(0)} y1={pad} x2={toSvgX(0)} y2={size - pad} stroke="#E5E3DE" strokeWidth="1" />
        <line x1={pad} y1={toSvgY(0)} x2={size - pad} y2={toSvgY(0)} stroke="#E5E3DE" strokeWidth="1" />

        {/* Quadrant labels */}
        <text x={pad + 8} y={pad + 18} fontSize="8" fill="#999999" fontFamily="sans-serif">
          Estado fuerte
        </text>
        <text x={pad + 8} y={pad + 28} fontSize="8" fill="#999999" fontFamily="sans-serif">
          + progresista
        </text>

        <text x={size - pad - 8} y={pad + 18} fontSize="8" fill="#999999" fontFamily="sans-serif" textAnchor="end">
          Libre mercado
        </text>
        <text x={size - pad - 8} y={pad + 28} fontSize="8" fill="#999999" fontFamily="sans-serif" textAnchor="end">
          + progresista
        </text>

        <text x={pad + 8} y={size - pad - 10} fontSize="8" fill="#999999" fontFamily="sans-serif">
          Estado fuerte
        </text>
        <text x={pad + 8} y={size - pad - 0} fontSize="8" fill="#999999" fontFamily="sans-serif">
          + conservador
        </text>

        <text x={size - pad - 8} y={size - pad - 10} fontSize="8" fill="#999999" fontFamily="sans-serif" textAnchor="end">
          Libre mercado
        </text>
        <text x={size - pad - 8} y={size - pad - 0} fontSize="8" fill="#999999" fontFamily="sans-serif" textAnchor="end">
          + conservador
        </text>

        {/* Axis labels */}
        <text x={size / 2} y={pad - 8} fontSize="9" fill="#777777" fontFamily="sans-serif" textAnchor="middle">
          Progresista
        </text>
        <text x={size / 2} y={size - pad + 16} fontSize="9" fill="#777777" fontFamily="sans-serif" textAnchor="middle">
          Conservador
        </text>
        <text x={pad - 8} y={size / 2} fontSize="9" fill="#777777" fontFamily="sans-serif" textAnchor="middle" transform={`rotate(-90, ${pad - 8}, ${size / 2})`}>
          Estado
        </text>
        <text x={size - pad + 8} y={size / 2} fontSize="9" fill="#777777" fontFamily="sans-serif" textAnchor="middle" transform={`rotate(90, ${size - pad + 8}, ${size / 2})`}>
          Mercado
        </text>

        {/* Candidate dots (non-highlighted first) */}
        {candidates
          .filter((c) => !nearest3Ids.has(c.id))
          .map((c) => (
            <circle
              key={c.id}
              cx={toSvgX(c.x)}
              cy={toSvgY(c.y)}
              r="4"
              fill="#AAAAAA"
              opacity="0.5"
            />
          ))}

        {/* Highlighted candidates (nearest 3) */}
        {candidates
          .filter((c) => nearest3Ids.has(c.id))
          .map((c) => {
            const cx = toSvgX(c.x)
            const cy = toSvgY(c.y)
            // Position label to avoid overlap with user marker
            const labelX = cx + (c.x > userX ? 8 : -8)
            const anchor = c.x > userX ? 'start' : 'end'
            return (
              <g key={c.id}>
                <circle cx={cx} cy={cy} r="6" fill="#444444" stroke="#111111" strokeWidth="1" />
                <text
                  x={labelX}
                  y={cy - 8}
                  fontSize="9"
                  fill="#111111"
                  fontWeight="600"
                  fontFamily="sans-serif"
                  textAnchor={anchor}
                >
                  {c.name.split(' ').slice(0, 2).join(' ')}
                </text>
                {c.matchPct !== null && (
                  <text
                    x={labelX}
                    y={cy + 2}
                    fontSize="8"
                    fill="#777777"
                    fontFamily="sans-serif"
                    textAnchor={anchor}
                  >
                    {c.matchPct}%
                  </text>
                )}
              </g>
            )
          })}

        {/* User position */}
        <circle
          cx={toSvgX(userX)}
          cy={toSvgY(userY)}
          r="10"
          fill="#1A56A0"
          stroke="#FFFFFF"
          strokeWidth="2"
          opacity="0.9"
        />
        <text
          x={toSvgX(userX)}
          y={toSvgY(userY) + 3.5}
          fontSize="10"
          fill="#FFFFFF"
          fontWeight="bold"
          fontFamily="sans-serif"
          textAnchor="middle"
        >
          Tú
        </text>
      </svg>
      <p className="text-[10px] text-[#999999] text-center mt-2">
        El mapa es una aproximación basada en planes de gobierno. No representa una clasificación oficial.
      </p>
    </div>
  )
}
