import { FactCheck, VERDICT_LABELS } from '@/lib/types'

const VERDICT_STYLES: Record<string, { bg: string; text: string }> = {
  true: { bg: 'bg-[#F0FAF4] border-[#2D7D46]', text: 'text-[#1A6B35]' },
  false: { bg: 'bg-[#FEF2F2] border-[#DC2626]', text: 'text-[#9B1C1C]' },
  misleading: { bg: 'bg-[#FFFBEB] border-[#D97706]', text: 'text-[#92400E]' },
  unverifiable: { bg: 'bg-[#F7F6F3] border-[#E5E3DE]', text: 'text-[#4B5563]' },
  context_needed: { bg: 'bg-[#EEF4FF] border-[#1A56A0]', text: 'text-[#1A56A0]' },
}

interface Props {
  factChecks: FactCheck[]
}

export function CandidateFactChecks({ factChecks }: Props) {
  if (factChecks.length === 0) {
    return (
      <p className="text-[#777777] text-sm">
        No hay verificaciones para este candidato aún.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {factChecks.map((fc) => {
        const style = VERDICT_STYLES[fc.verdict] ?? VERDICT_STYLES.unverifiable
        const label = VERDICT_LABELS[fc.verdict] ?? fc.verdict
        const sourceLink = fc.source_url ?? fc.source
        const dateStr = fc.date_checked ?? fc.checked_at

        return (
          <div key={fc.id} className={`border rounded-lg p-4 ${style.bg}`}>
            <div className="flex items-start gap-3">
              <span
                className={`text-xs font-bold px-2 py-1 rounded border flex-shrink-0 ${style.bg} ${style.text}`}
              >
                {label}
              </span>
              <div className="flex-1">
                <blockquote className="text-[#222222] text-sm italic mb-2">
                  &ldquo;{fc.claim}&rdquo;
                </blockquote>
                <p className="text-[#777777] text-xs leading-relaxed mb-2">{fc.explanation}</p>
                {sourceLink && (
                  <a
                    href={sourceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1A56A0] text-xs hover:underline inline-flex items-center gap-1"
                  >
                    Ver fuente ↗
                  </a>
                )}
                {dateStr && (
                  <span className="text-[#999999] text-xs ml-4">
                    {new Date(dateStr).toLocaleDateString('es-PE')}
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
