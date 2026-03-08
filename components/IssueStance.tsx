import { ExternalLink, CheckCircle } from 'lucide-react'
import { ISSUE_LABELS, type IssueArea } from '@/lib/types'

export interface IssueStanceProps {
  issue_area: IssueArea
  stance: string
  quote?: string
  source_url?: string
  verified?: boolean
}

export default function IssueStance({
  issue_area,
  stance,
  quote,
  source_url,
  verified,
}: IssueStanceProps) {
  const issueInfo = ISSUE_LABELS[issue_area] ?? { label: issue_area, icon: '📋' }

  return (
    <div className="bg-votoclaro-surface-2 border border-votoclaro-border rounded-xl p-4 hover:border-votoclaro-gold/30 transition-colors">
      {/* Issue area header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl" role="img" aria-label={issueInfo.label}>
          {issueInfo.icon}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-votoclaro-text">
            {issueInfo.label}
          </span>
          {verified && (
            <CheckCircle size={14} className="text-votoclaro-gold flex-shrink-0" />
          )}
        </div>
      </div>

      {/* Stance text */}
      <p className="text-sm text-votoclaro-text-muted leading-relaxed">
        {stance}
      </p>

      {/* Quote */}
      {quote && (
        <blockquote className="mt-3 pl-3 border-l-2 border-votoclaro-gold">
          <p className="text-sm italic text-votoclaro-text">
            &ldquo;{quote}&rdquo;
          </p>
        </blockquote>
      )}

      {/* Source link */}
      {source_url && (
        <a
          href={source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-xs text-votoclaro-text-muted hover:text-votoclaro-gold transition-colors"
        >
          <ExternalLink size={12} />
          Ver fuente
        </a>
      )}
    </div>
  )
}
