import { notFound } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, CheckCircle, ExternalLink, Share2 } from 'lucide-react'
import IssueStance from '@/components/IssueStance'
import FactCheckBadge from '@/components/FactCheckBadge'
import { SEED_CANDIDATES, SEED_POSITIONS, SEED_FACT_CHECKS } from '@/lib/seed-data'
import { IDEOLOGY_COLORS, IDEOLOGY_LABELS } from '@/lib/types'

interface CandidatePageProps {
  params: { id: string }
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
  president: 'Candidato a Presidente',
  vice_president: 'Candidato a Vicepresidente',
  senator: 'Candidato a Senador',
  representative: 'Candidato a Diputado',
}

export async function generateStaticParams() {
  return SEED_CANDIDATES.map((c) => ({ id: c.slug }))
}

export default function CandidatePage({ params }: CandidatePageProps) {
  const candidate = SEED_CANDIDATES.find((c) => c.slug === params.id)

  if (!candidate) {
    notFound()
  }

  const positions = SEED_POSITIONS.filter((p) => p.candidate_id === candidate.id)
  const factChecks = SEED_FACT_CHECKS.filter((fc) => fc.candidate_id === candidate.id)
  const initials = getInitials(candidate.full_name)
  const ideologyColor = candidate.ideology
    ? (IDEOLOGY_COLORS[candidate.ideology] ?? 'bg-gray-600 text-gray-100')
    : null
  const ideologyLabel = candidate.ideology ? (IDEOLOGY_LABELS[candidate.ideology] ?? candidate.ideology) : null

  const shareText = encodeURIComponent(
    `Conoce a ${candidate.common_name ?? candidate.full_name} (${candidate.party_abbreviation}) en VotoClaro — Vota informado. #Peru2026`
  )
  const currentUrl = encodeURIComponent(`https://votoclaro.pe/candidatos/${candidate.slug}`)
  const whatsappUrl = `https://wa.me/?text=${shareText}%20${currentUrl}`
  const twitterUrl = `https://x.com/intent/tweet?text=${shareText}&url=${currentUrl}`

  return (
    <div className="bg-votoclaro-base min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-votoclaro-border bg-votoclaro-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-votoclaro-text-muted">
            <Link href="/" className="hover:text-votoclaro-gold transition-colors">
              Inicio
            </Link>
            <span>/</span>
            <Link href="/candidatos" className="hover:text-votoclaro-gold transition-colors">
              Candidatos
            </Link>
            <span>/</span>
            <span className="text-votoclaro-text">
              {candidate.common_name ?? candidate.full_name}
            </span>
          </nav>
        </div>
      </div>

      {/* Profile header */}
      <section className="border-b border-votoclaro-border bg-votoclaro-surface py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Photo / initials */}
            <div className="flex-shrink-0">
              {candidate.photo_url ? (
                <img
                  src={candidate.photo_url}
                  alt={candidate.full_name}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-votoclaro-border"
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-votoclaro-surface-2 border-2 border-votoclaro-border flex items-center justify-center">
                  <span className="text-3xl sm:text-4xl font-bold text-votoclaro-text-muted">
                    {initials}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-votoclaro-text">
                  {candidate.full_name}
                </h1>
                {candidate.is_verified && (
                  <CheckCircle size={20} className="text-votoclaro-gold" />
                )}
                {candidate.has_criminal_record && (
                  <AlertTriangle size={20} className="text-votoclaro-alert" />
                )}
              </div>

              {candidate.common_name && (
                <p className="text-votoclaro-text-muted text-sm mb-3">
                  Conocido como &ldquo;{candidate.common_name}&rdquo;
                  {candidate.age ? ` · ${candidate.age} años` : ''}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="badge bg-votoclaro-surface-2 border border-votoclaro-border text-votoclaro-text font-semibold">
                  {candidate.party_abbreviation}
                </span>
                <span className="text-sm text-votoclaro-text-muted">
                  {candidate.party_name}
                </span>
                {ideologyColor && ideologyLabel && (
                  <span className={`badge ${ideologyColor} font-medium`}>
                    {ideologyLabel}
                  </span>
                )}
                <span className="badge bg-votoclaro-surface-2 border border-votoclaro-border text-votoclaro-text-muted">
                  {ROLE_LABELS[candidate.role] ?? candidate.role}
                  {candidate.region_name ? ` · ${candidate.region_name}` : ''}
                </span>
              </div>

              {/* Polling */}
              {candidate.current_polling !== undefined && (
                <div className="flex items-center gap-3 mb-4">
                  <div>
                    <p className="text-xs text-votoclaro-text-muted mb-1">Intención de voto</p>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-votoclaro-surface-2 rounded-full overflow-hidden border border-votoclaro-border">
                        <div
                          className="h-full bg-votoclaro-gold rounded-full"
                          style={{
                            width: `${Math.min(candidate.current_polling * 5, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-lg font-bold text-votoclaro-gold">
                        {candidate.current_polling.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Criminal record warning */}
              {candidate.has_criminal_record && candidate.criminal_record_detail && (
                <div className="bg-votoclaro-alert/10 border border-votoclaro-alert/40 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-votoclaro-alert flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-votoclaro-alert mb-1">
                        Antecedentes penales
                      </p>
                      <p className="text-xs text-votoclaro-text-muted leading-relaxed">
                        {candidate.criminal_record_detail}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Share buttons */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-votoclaro-text-muted flex items-center gap-1">
                  <Share2 size={12} />
                  Compartir:
                </span>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-700/20 border border-green-700/40 text-green-400 text-xs font-medium rounded-lg hover:bg-green-700/30 transition-colors"
                >
                  WhatsApp
                </a>
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-700/20 border border-sky-700/40 text-sky-400 text-xs font-medium rounded-lg hover:bg-sky-700/30 transition-colors"
                >
                  X / Twitter
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Career summary */}
            {candidate.career_summary && (
              <section>
                <h2 className="text-lg font-bold text-votoclaro-text mb-4">Trayectoria</h2>
                <div className="bg-votoclaro-surface border border-votoclaro-border rounded-xl p-5">
                  <p className="text-sm text-votoclaro-text-muted leading-relaxed">
                    {candidate.career_summary}
                  </p>
                </div>
              </section>
            )}

            {/* Issue positions */}
            {positions.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-votoclaro-text mb-4">
                  Posiciones por tema
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  {positions.map((pos) => (
                    <IssueStance
                      key={pos.id}
                      issue_area={pos.issue_area}
                      stance={pos.stance}
                      quote={pos.quote}
                      source_url={pos.source_url}
                      verified={pos.verified}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar: fact checks */}
          <div className="lg:col-span-1">
            <section>
              <h2 className="text-lg font-bold text-votoclaro-text mb-4">
                Verificaciones de hechos
              </h2>
              {factChecks.length === 0 ? (
                <p className="text-sm text-votoclaro-text-muted">
                  No hay verificaciones disponibles para este candidato.
                </p>
              ) : (
                <div className="space-y-4">
                  {factChecks.map((fc) => (
                    <div
                      key={fc.id}
                      className="bg-votoclaro-surface border border-votoclaro-border rounded-xl p-4"
                    >
                      <p className="text-xs text-votoclaro-text-muted mb-2 leading-relaxed italic">
                        &ldquo;{fc.claim}&rdquo;
                      </p>
                      <FactCheckBadge verdict={fc.verdict} size="sm" />
                      <p className="mt-2 text-xs text-votoclaro-text-muted leading-relaxed">
                        {fc.explanation}
                      </p>
                      {fc.source_url && (
                        <a
                          href={fc.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs text-votoclaro-text-muted hover:text-votoclaro-gold transition-colors"
                        >
                          <ExternalLink size={11} />
                          Fuente
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Compare CTA */}
            <div className="mt-6 bg-votoclaro-surface border border-votoclaro-border rounded-xl p-4">
              <p className="text-sm font-semibold text-votoclaro-text mb-2">
                ¿Quieres comparar?
              </p>
              <p className="text-xs text-votoclaro-text-muted mb-3">
                Compara a {candidate.common_name ?? candidate.full_name} con otros candidatos lado a lado.
              </p>
              <Link href="/comparar" className="btn-primary text-sm py-2 px-4 inline-block">
                Ir a Comparar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
