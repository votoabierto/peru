'use client'

interface PolicyCompassProps {
  candidates: Array<{
    id: string
    name: string
    party: string
    partyAbbr: string
    economic: number   // 0–100
    social: number     // 0–100
    institutions: number // 0–100
  }>
  userEconomic: number   // 0–100
  userSocial: number     // 0–100
  userInstitutions: number // 0–100
}

// Map 0-100 score to pixel position within the chart area
function toPos(value: number, size: number): number {
  const padding = 0.08
  return size * (padding + (1 - 2 * padding) * (value / 100))
}

// Map institutions score (0-100) to bubble radius
function toRadius(institutions: number): number {
  return 6 + (institutions / 100) * 8
}

export default function PolicyCompass({ candidates, userEconomic, userSocial, userInstitutions }: PolicyCompassProps) {
  const W = 400
  const H = 400

  const userX = toPos(userEconomic, W)
  const userY = H - toPos(userSocial, H) // Y is inverted in SVG
  const userR = toRadius(userInstitutions)

  return (
    <div className="w-full max-w-md mx-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label="Mapa de posiciones en ejes de política pública"
      >
        {/* Background */}
        <rect x="0" y="0" width={W} height={H} fill="#FAFAF8" rx="8" />

        {/* Grid quadrants */}
        <line x1={W / 2} y1="30" x2={W / 2} y2={H - 30} stroke="#E5E3DE" strokeDasharray="4 4" />
        <line x1="30" y1={H / 2} x2={W - 30} y2={H / 2} stroke="#E5E3DE" strokeDasharray="4 4" />

        {/* Axis labels */}
        {/* X-axis: Economic */}
        <text x="32" y={H / 2 - 8} fontSize="8" fill="#999" textAnchor="start">
          Mayor libre
        </text>
        <text x="32" y={H / 2 + 2} fontSize="8" fill="#999" textAnchor="start">
          mercado
        </text>
        <text x={W - 32} y={H / 2 - 8} fontSize="8" fill="#999" textAnchor="end">
          Mayor intervención
        </text>
        <text x={W - 32} y={H / 2 + 2} fontSize="8" fill="#999" textAnchor="end">
          estatal
        </text>

        {/* Y-axis: Social */}
        <text x={W / 2} y="24" fontSize="8" fill="#999" textAnchor="middle">
          Mayor énfasis en libertades individuales
        </text>
        <text x={W / 2} y={H - 14} fontSize="8" fill="#999" textAnchor="middle">
          Mayor énfasis en orden
        </text>

        {/* Candidate dots — bubble size = institutions axis */}
        {candidates.map((c) => {
          const cx = toPos(c.economic, W)
          const cy = H - toPos(c.social, H)
          const r = toRadius(c.institutions)
          return (
            <g key={c.id}>
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="#E5E3DE"
                stroke="#999"
                strokeWidth="0.5"
                opacity="0.8"
              />
              <text
                x={cx}
                y={cy + 3}
                fontSize="7"
                fill="#444"
                textAnchor="middle"
                fontWeight="600"
              >
                {c.partyAbbr}
              </text>
            </g>
          )
        })}

        {/* User position — prominent diamond */}
        <g>
          <circle
            cx={userX}
            cy={userY}
            r={userR + 4}
            fill="#1A56A0"
            stroke="#fff"
            strokeWidth="2"
            opacity="0.9"
          />
          <text
            x={userX}
            y={userY + 4}
            fontSize="9"
            fill="#fff"
            textAnchor="middle"
            fontWeight="700"
          >
            Tú
          </text>
        </g>
      </svg>

      {/* Legend for bubble size */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <div className="flex items-center gap-1">
          <svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#E5E3DE" stroke="#999" strokeWidth="0.5" /></svg>
          <span className="text-[10px] text-[#999]">Menor reforma institucional</span>
        </div>
        <div className="flex items-center gap-1">
          <svg width="20" height="20"><circle cx="10" cy="10" r="8" fill="#E5E3DE" stroke="#999" strokeWidth="0.5" /></svg>
          <span className="text-[10px] text-[#999]">Mayor reforma institucional</span>
        </div>
      </div>
    </div>
  )
}
