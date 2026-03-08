'use client'

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import FactCheckBadge from '@/components/FactCheckBadge'
import { SEED_FACT_CHECKS, SEED_CANDIDATES } from '@/lib/seed-data'
import { VERDICT_LABELS, type Verdict } from '@/lib/types'

const ALL_VERDICTS: Verdict[] = ['true', 'false', 'misleading', 'unverifiable', 'context_needed']

const VERDICT_TABS: { value: Verdict | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'true', label: 'Verdadero' },
  { value: 'false', label: 'Falso' },
  { value: 'misleading', label: 'Engañoso' },
  { value: 'unverifiable', label: 'No verificable' },
  { value: 'context_needed', label: 'Necesita contexto' },
]

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function VerificarPage() {
  const [activeTab, setActiveTab] = useState<Verdict | 'all'>('all')

  const filtered =
    activeTab === 'all'
      ? SEED_FACT_CHECKS
      : SEED_FACT_CHECKS.filter((fc) => fc.verdict === activeTab)

  const countByVerdict = (verdict: Verdict) =>
    SEED_FACT_CHECKS.filter((fc) => fc.verdict === verdict).length

  return (
    <div className="bg-votoclaro-base min-h-screen">
      {/* Header */}
      <section className="border-b border-votoclaro-border py-10 bg-votoclaro-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="label mb-2">Verificación de hechos</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-votoclaro-text mb-2">
            Verificar
          </h1>
          <p className="text-votoclaro-text-muted max-w-2xl">
            Fact-checks independientes de las declaraciones más importantes de la campaña
            electoral 2026. Revisamos las afirmaciones de los candidatos con fuentes
            verificables.
          </p>
        </div>
      </section>

      {/* Verdict summary */}
      <section className="border-b border-votoclaro-border py-6 bg-votoclaro-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3">
            {ALL_VERDICTS.map((verdict) => {
              const count = countByVerdict(verdict)
              if (count === 0) return null
              return (
                <div key={verdict} className="flex items-center gap-2">
                  <FactCheckBadge verdict={verdict} size="sm" />
                  <span className="text-xs text-votoclaro-text-muted">({count})</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="border-b border-votoclaro-border bg-votoclaro-surface sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2 no-scrollbar">
            {VERDICT_TABS.map((tab) => {
              const count =
                tab.value === 'all'
                  ? SEED_FACT_CHECKS.length
                  : countByVerdict(tab.value as Verdict)
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.value
                      ? 'bg-votoclaro-gold text-votoclaro-base'
                      : 'text-votoclaro-text-muted hover:text-votoclaro-gold hover:bg-votoclaro-surface-2'
                  }`}
                >
                  {tab.label}
                  <span
                    className={`ml-1.5 text-xs ${
                      activeTab === tab.value ? 'text-votoclaro-base/70' : 'text-votoclaro-text-muted'
                    }`}
                  >
                    ({count})
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Fact check list */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-votoclaro-text-muted">
                No hay verificaciones con ese veredicto.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((fc) => {
                const candidate = SEED_CANDIDATES.find((c) => c.id === fc.candidate_id)
                return (
                  <article
                    key={fc.id}
                    className="bg-votoclaro-surface border border-votoclaro-border rounded-xl p-5 flex flex-col gap-3 hover:border-votoclaro-gold/40 transition-colors"
                  >
                    {/* Candidate */}
                    {candidate && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-votoclaro-gold">
                          {candidate.common_name ?? candidate.full_name}
                          <span className="text-votoclaro-text-muted font-normal ml-1">
                            · {candidate.party_abbreviation}
                          </span>
                        </span>
                        <span className="text-xs text-votoclaro-text-muted">
                          {formatDate(fc.checked_at)}
                        </span>
                      </div>
                    )}

                    {/* Claim */}
                    <blockquote className="border-l-2 border-votoclaro-border pl-3">
                      <p className="text-sm text-votoclaro-text leading-relaxed italic">
                        &ldquo;{fc.claim}&rdquo;
                      </p>
                    </blockquote>

                    {/* Verdict badge */}
                    <div>
                      <FactCheckBadge verdict={fc.verdict} size="md" />
                    </div>

                    {/* Explanation */}
                    <p className="text-sm text-votoclaro-text-muted leading-relaxed">
                      {fc.explanation}
                    </p>

                    {/* Source */}
                    {fc.source_url && (
                      <a
                        href={fc.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto inline-flex items-center gap-1.5 text-xs text-votoclaro-text-muted hover:text-votoclaro-gold transition-colors"
                      >
                        <ExternalLink size={12} />
                        Ver fuente
                      </a>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Methodology note */}
      <section className="py-8 border-t border-votoclaro-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-votoclaro-surface border border-votoclaro-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-votoclaro-text mb-2">
              Metodología de verificación
            </h3>
            <p className="text-xs text-votoclaro-text-muted leading-relaxed">
              Cada verificación analiza una afirmación pública de un candidato. Usamos
              fuentes oficiales (INEI, BCR, JNE, ONPE, Poder Judicial) y medios de
              comunicación verificables. Los veredictos son:{' '}
              <strong className="text-green-400">Verdadero</strong> (se sostiene con
              evidencia), <strong className="text-red-400">Falso</strong> (contradice la
              evidencia), <strong className="text-orange-400">Engañoso</strong> (contiene
              verdad parcial con contexto distorsionado),{' '}
              <strong className="text-gray-400">No verificable</strong> (sin datos
              suficientes) y{' '}
              <strong className="text-blue-400">Necesita contexto</strong> (la afirmación
              es incompleta sin información adicional).
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
