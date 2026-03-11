import { Candidate } from '@/lib/types'

function formatPEN(amount: number): string {
  if (amount >= 1_000_000) return `S/ ${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `S/ ${(amount / 1_000).toFixed(0)}K`
  return `S/ ${amount}`
}

interface Props {
  candidate: Candidate
}

export function CandidateStats({ candidate }: Props) {
  const criminalCount = candidate.criminal_records?.length ?? 0
  const hasCriminalRecord = criminalCount > 0 || candidate.has_criminal_record

  const stats = [
    {
      label: 'Bienes declarados',
      value: candidate.declared_assets_pen
        ? formatPEN(candidate.declared_assets_pen)
        : 'No declarado',
      icon: '💼',
      highlight: false,
    },
    {
      label: 'Antecedentes',
      value: criminalCount > 0
        ? `${criminalCount} registro${criminalCount > 1 ? 's' : ''}`
        : hasCriminalRecord
        ? 'Registros disponibles'
        : 'Sin antecedentes',
      icon: '⚖️',
      highlight: hasCriminalRecord,
    },
    {
      label: 'Años en política',
      value: candidate.years_in_politics ? `${candidate.years_in_politics} años` : 'N/A',
      icon: '🗓️',
      highlight: false,
    },
    {
      label: 'Cargos previos',
      value: candidate.prior_offices?.length
        ? `${candidate.prior_offices.length} cargo${candidate.prior_offices.length > 1 ? 's' : ''}`
        : 'Ninguno',
      icon: '🏛️',
      highlight: false,
    },
  ]

  return (
    <div className="border-y border-[#E5E3DE] bg-[#F7F6F3]">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className={`font-semibold text-sm ${s.highlight ? 'text-[#92400E]' : 'text-[#111111]'}`}>
                {s.value}
              </div>
              <div className="text-[#777777] text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
