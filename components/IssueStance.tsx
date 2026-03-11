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
    <div className="bg-[#EEEDE9] border border-[#E5E3DE] rounded-xl p-4 hover:border-[#1A56A0]/30 transition-colors">
      {/* Issue area header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl" role="img" aria-label={issueInfo.label}>
          {issueInfo.icon}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#111111]">
            {issueInfo.label}
          </span>
          {verified && (
            <CheckCircle size={14} className="text-[#1A56A0] flex-shrink-0" />
          )}
        </div>
      </div>

      {/* Stance text */}
      <p className="text-sm text-[#777777] leading-relaxed">
        {stance}
      </p>

      {/* Quote */}
      {quote && (
        <blockquote className="mt-3 pl-3 border-l-2 border-[#1A56A0]">
          <p className="text-sm italic text-[#111111]">
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
          className="mt-3 inline-flex items-center gap-1 text-xs text-[#777777] hover:text-[#1A56A0] transition-colors"
        >
          <ExternalLink size={12} />
          Ver fuente
        </a>
      )}
    </div>
  )
}
