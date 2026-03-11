import Link from 'next/link'
import { CheckCircle, AlertTriangle } from 'lucide-react'
import { IDEOLOGY_COLORS, IDEOLOGY_LABELS } from '@/lib/types'

// CandidateCardProps intentionally exported for re-use

export interface CandidateCardProps {
  id: string
  slug: string
  full_name: string
  common_name?: string
  party_abbreviation: string
  party_name: string
  role: string
  region_name?: string
  current_polling?: number
  photo_url?: string
  ideology?: string
  is_verified?: boolean
  has_criminal_record?: boolean
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter((word) => word.length > 2)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

const ROLE_LABELS: Record<string, string> = {
  president: 'Presidente',
  vice_president: 'Vicepresidente',
  senator: 'Senador',
  representative: 'Diputado',
}

export default function CandidateCard({
  slug,
  full_name,
  common_name,
  party_abbreviation,
  party_name,
  role,
  region_name,
  current_polling,
  photo_url,
  ideology,
  is_verified,
  has_criminal_record,
}: CandidateCardProps) {
  const initials = getInitials(full_name)
  const ideologyColor = ideology ? (IDEOLOGY_COLORS[ideology] ?? 'bg-gray-600 text-gray-100') : 'bg-gray-600 text-gray-100'
  const ideologyLabel = ideology ? (IDEOLOGY_LABELS[ideology] ?? ideology) : null
  const displayName = common_name ?? full_name

  return (
    <Link href={`/candidatos/${slug}`} className="block group">
      <div className="card group-hover:border-votoclaro-gold/60 transition-all duration-200 h-full flex flex-col">
        {/* Header: photo + name */}
        <div className="flex items-start gap-4 mb-4">
          {/* Photo or initials */}
          <div className="flex-shrink-0">
            {photo_url ? (
              <img
                src={photo_url}
                alt={full_name}
                className="w-16 h-16 rounded-full object-cover border-2 border-votoclaro-border"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-votoclaro-surface-2 border-2 border-votoclaro-border flex items-center justify-center">
                <span className="text-lg font-bold text-votoclaro-text-muted">
                  {initials}
                </span>
              </div>
            )}
          </div>

          {/* Name + badges */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="text-sm font-semibold text-votoclaro-text truncate leading-tight group-hover:text-votoclaro-gold transition-colors">
                {displayName}
              </h3>
              {is_verified && (
                <CheckCircle size={14} className="text-votoclaro-gold flex-shrink-0" />
              )}
              {has_criminal_record && (
                <AlertTriangle size={14} className="text-votoclaro-alert flex-shrink-0" />
              )}
            </div>
            {common_name && (
              <p className="text-xs text-votoclaro-text-muted mb-1 truncate">
                {full_name}
              </p>
            )}
            {/* Role badge */}
            <span className="inline-block text-xs font-medium text-votoclaro-text-muted bg-votoclaro-surface-2 border border-votoclaro-border rounded px-2 py-0.5">
              {ROLE_LABELS[role] ?? role}
              {region_name && ` · ${region_name}`}
            </span>
          </div>
        </div>

        {/* Party + ideology */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="badge bg-votoclaro-surface-2 border border-votoclaro-border text-votoclaro-text font-semibold text-xs">
            {party_abbreviation}
          </span>
          <span className="text-xs text-votoclaro-text-muted truncate">{party_name}</span>
          {ideologyLabel && (
            <span className={`badge text-xs font-medium ${ideologyColor}`}>
              {ideologyLabel}
            </span>
          )}
        </div>

        {/* Polling bar */}
        {current_polling !== undefined && current_polling !== null && (
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-votoclaro-text-muted">Intención de voto</span>
              <span className="text-sm font-bold text-votoclaro-gold">
                {current_polling.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-votoclaro-surface-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-votoclaro-gold rounded-full transition-all duration-500"
                style={{ width: `${Math.min(current_polling * 5, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Criminal record warning */}
        {has_criminal_record && (
          <p className="mt-3 text-xs text-votoclaro-alert flex items-center gap-1">
            <AlertTriangle size={12} />
            Tiene antecedentes penales
          </p>
        )}

        {/* Secondary action: Compare */}
        <div className="mt-3 pt-3 border-t border-votoclaro-border">
          <Link
            href={`/comparar?ids=${slug}`}
            className="text-xs text-votoclaro-text-muted hover:text-votoclaro-gold transition-colors"
            onClick={e => e.stopPropagation()}
          >
            ⚖️ Comparar
          </Link>
        </div>
      </div>
    </Link>
  )
}
