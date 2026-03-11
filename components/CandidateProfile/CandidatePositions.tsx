import { Position, ISSUE_LABELS } from '@/lib/types'


interface Props {
  positions: Position[]
}

export function CandidatePositions({ positions }: Props) {
  if (positions.length === 0) {
    return (
      <div className="text-[#777777] text-center py-8">
        No hay posiciones registradas para este candidato.
      </div>
    )
  }

  // Group by issue_area
  const grouped = positions.reduce<Record<string, Position[]>>((acc, p) => {
    if (!acc[p.issue_area]) acc[p.issue_area] = []
    acc[p.issue_area].push(p)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([area, areaPositions]) => {
        const issueInfo = ISSUE_LABELS[area as keyof typeof ISSUE_LABELS]
        return (
          <div key={area}>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-[#111111] mb-3">
              <span>{issueInfo?.icon ?? '📋'}</span>
              <span>{issueInfo?.label ?? area}</span>
            </h3>
            <div className="space-y-3">
              {areaPositions.map((pos) => {
                const stanceText = pos.stance_description ?? pos.stance
                const sourceQuote = pos.source_quote ?? pos.quote
                return (
                  <div key={pos.id} className="bg-white border border-[#E5E3DE] rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-[#222222] text-sm leading-relaxed">{stanceText}</p>
                        {sourceQuote && (
                          <blockquote className="mt-2 pl-3 border-l-2 border-[#1A56A0] text-[#777777] text-xs italic">
                            &ldquo;{sourceQuote}&rdquo;
                          </blockquote>
                        )}
                        {pos.source_url && (
                          <a
                            href={pos.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-block text-[#1A56A0] text-xs hover:underline"
                          >
                            Ver fuente ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
