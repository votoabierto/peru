import Link from 'next/link'
import { ISSUE_LABELS, type IssueArea } from '@/lib/types'

export interface RegionCardProps {
  name: string
  code: string
  population?: number
  key_issues: IssueArea[]
}

function formatPopulation(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1)}M hab.`
  }
  if (n >= 1_000) {
    return `${Math.round(n / 1_000)}K hab.`
  }
  return `${n.toLocaleString('es-PE')} hab.`
}

export default function RegionCard({ name, code, population, key_issues }: RegionCardProps) {
  const displayIssues = key_issues.slice(0, 3)

  return (
    <Link href={`/regiones/${code.toLowerCase()}`} className="block group">
      <div className="card group-hover:border-votoclaro-gold/60 transition-all duration-200 h-full flex flex-col">
        {/* Region code chip */}
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-bold text-votoclaro-gold bg-votoclaro-gold/10 border border-votoclaro-gold/30 rounded px-2 py-0.5 uppercase tracking-widest">
            {code}
          </span>
          {population && (
            <span className="text-xs text-votoclaro-text-muted">
              {formatPopulation(population)}
            </span>
          )}
        </div>

        {/* Region name */}
        <h3 className="text-base font-semibold text-votoclaro-text group-hover:text-votoclaro-gold transition-colors mb-4">
          {name}
        </h3>

        {/* Key issues */}
        {displayIssues.length > 0 && (
          <div className="mt-auto">
            <p className="text-xs text-votoclaro-text-muted mb-2">Temas clave</p>
            <div className="flex flex-wrap gap-1.5">
              {displayIssues.map((issue) => {
                const info = ISSUE_LABELS[issue]
                return info ? (
                  <span
                    key={issue}
                    className="inline-flex items-center gap-1 text-xs bg-votoclaro-surface-2 border border-votoclaro-border rounded-full px-2.5 py-1 text-votoclaro-text-muted"
                  >
                    <span role="img" aria-label={info.label}>
                      {info.icon}
                    </span>
                    {info.label}
                  </span>
                ) : null
              })}
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
