import { Candidate } from '@/lib/types'
import { IDEOLOGY_COLORS, IDEOLOGY_LABELS } from '@/lib/types'
import { CandidateShareButtons } from './CandidateShareButtons'

interface Props {
  candidate: Candidate
}

export function CandidateHero({ candidate }: Props) {
  const ideologyKey = candidate.ideology ?? 'center'
  const ideologyColorClass = IDEOLOGY_COLORS[ideologyKey] ?? 'bg-gray-600 text-gray-100'
  const ideologyLabel = IDEOLOGY_LABELS[ideologyKey] ?? ideologyKey

  const bgColor = '#1A56A0'

  const initials = candidate.full_name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')

  const polling = candidate.polling_percentage ?? candidate.current_polling

  return (
    <div className="relative bg-[#F7F6F3] border-b border-[#E5E3DE]">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-start gap-8">
          <div className="flex-shrink-0">
            {candidate.photo_url ? (
              <img
                src={candidate.photo_url}
                alt={candidate.full_name}
                className="w-32 h-32 rounded-full object-cover border-4 border-[#E5E3DE]"
              />
            ) : (
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center text-3xl font-bold text-white border-4 border-[#E5E3DE]"
                style={{ backgroundColor: bgColor }}
              >
                {initials}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${ideologyColorClass}`}>
                {ideologyLabel}
              </span>
              {polling !== undefined && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#EEF4FF] text-[#1A56A0] border border-[#1A56A0]">
                  {polling}% en encuestas
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#111111] mb-1">{candidate.full_name}</h1>
            <p className="text-[#1A56A0] font-medium text-lg mb-3">{candidate.party_name}</p>
            {candidate.bio_short && (
              <p className="text-[#777777] text-base max-w-2xl">{candidate.bio_short}</p>
            )}
            {!candidate.bio_short && candidate.career_summary && (
              <p className="text-[#777777] text-base max-w-2xl line-clamp-2">{candidate.career_summary}</p>
            )}
          </div>
          <div className="flex-shrink-0">
            <CandidateShareButtons candidate={candidate} />
          </div>
        </div>
      </div>
    </div>
  )
}
