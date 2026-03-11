import { FactCheck, VERDICT_LABELS } from '@/lib/types'

const VERDICT_STYLES: Record<string, { bg: string; text: string }> = {
  true: { bg: 'bg-green-900/50 border-green-800', text: 'text-green-300' },
  false: { bg: 'bg-red-900/50 border-red-800', text: 'text-red-300' },
  misleading: { bg: 'bg-orange-900/50 border-orange-800', text: 'text-orange-300' },
  unverifiable: { bg: 'bg-gray-800 border-gray-700', text: 'text-gray-300' },
  context_needed: { bg: 'bg-blue-900/50 border-blue-800', text: 'text-blue-300' },
}

interface Props {
  factChecks: FactCheck[]
}

export function CandidateFactChecks({ factChecks }: Props) {
  if (factChecks.length === 0) {
    return (
      <p className="text-gray-500 text-sm">
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
                <blockquote className="text-gray-200 text-sm italic mb-2">
                  &ldquo;{fc.claim}&rdquo;
                </blockquote>
                <p className="text-gray-400 text-xs leading-relaxed mb-2">{fc.explanation}</p>
                {sourceLink && (
                  <a
                    href={sourceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#d4af37] text-xs hover:underline inline-flex items-center gap-1"
                  >
                    Ver fuente ↗
                  </a>
                )}
                {dateStr && (
                  <span className="text-gray-600 text-xs ml-4">
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
