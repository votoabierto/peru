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

  const stats: { label: string; value: string; icon: string; highlight: boolean }[] = []

  if (candidate.declared_assets_pen) {
    stats.push({
      label: 'Bienes declarados',
      value: formatPEN(candidate.declared_assets_pen),
      icon: '💼',
      highlight: false,
    })
  }

  if (hasCriminalRecord) {
    stats.push({
      label: 'Antecedentes',
      value: criminalCount > 0
        ? `${criminalCount} registro${criminalCount > 1 ? 's' : ''}`
        : 'Registros disponibles',
      icon: '⚖️',
      highlight: true,
    })
  }

  if (candidate.years_in_politics) {
    stats.push({
      label: 'Años en política',
      value: `${candidate.years_in_politics} años`,
      icon: '🗓️',
      highlight: false,
    })
  }

  if (candidate.prior_offices?.length) {
    stats.push({
      label: 'Cargos previos',
      value: `${candidate.prior_offices.length} cargo${candidate.prior_offices.length > 1 ? 's' : ''}`,
      icon: '🏛️',
      highlight: false,
    })
  }

  if (stats.length === 0) return null

  return (
    <div className="border-y border-[#E5E3DE] bg-[#F7F6F3]">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className={`grid gap-4 ${stats.length === 1 ? 'grid-cols-1' : stats.length === 2 ? 'grid-cols-2' : stats.length === 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
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
