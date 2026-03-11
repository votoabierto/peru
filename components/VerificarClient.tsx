'use client'

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import FactCheckBadge from '@/components/FactCheckBadge'
import { type Verdict } from '@/lib/types'
import type { Candidate, FactCheck } from '@/lib/types'

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

export default function VerificarClient({
  factChecks,
  candidates,
}: {
  factChecks: FactCheck[]
  candidates: Candidate[]
}) {
  const [activeTab, setActiveTab] = useState<Verdict | 'all'>('all')

  const filtered =
    activeTab === 'all'
      ? factChecks
      : factChecks.filter((fc) => fc.verdict === activeTab)

  const countByVerdict = (verdict: Verdict) =>
    factChecks.filter((fc) => fc.verdict === verdict).length

  return (
    <>
      {/* Verdict summary */}
      <section className="border-b border-[#E5E3DE] py-6 bg-[#F7F6F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3">
            {ALL_VERDICTS.map((verdict) => {
              const count = countByVerdict(verdict)
              if (count === 0) return null
              return (
                <div key={verdict} className="flex items-center gap-2">
                  <FactCheckBadge verdict={verdict} size="sm" />
                  <span className="text-xs text-[#777777]">({count})</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="border-b border-[#E5E3DE] bg-[#F7F6F3] sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2 no-scrollbar">
            {VERDICT_TABS.map((tab) => {
              const count =
                tab.value === 'all'
                  ? factChecks.length
                  : countByVerdict(tab.value as Verdict)
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.value
                      ? 'bg-[#1A56A0] text-white'
                      : 'text-[#777777] hover:text-[#1A56A0] hover:bg-[#EEEDE9]'
                  }`}
                >
                  {tab.label}
                  <span
                    className={`ml-1.5 text-xs ${
                      activeTab === tab.value ? 'text-white/70' : 'text-[#777777]'
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
              <p className="text-[#777777]">
                No hay verificaciones con ese veredicto.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((fc) => {
                const candidate = candidates.find((c) => c.id === fc.candidate_id)
                return (
                  <article
                    key={fc.id}
                    className="bg-[#F7F6F3] border border-[#E5E3DE] rounded-xl p-5 flex flex-col gap-3 hover:border-[#1A56A0]/40 transition-colors"
                  >
                    {/* Candidate */}
                    {candidate && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#1A56A0]">
                          {candidate.common_name ?? candidate.full_name}
                          <span className="text-[#777777] font-normal ml-1">
                            · {candidate.party_abbreviation}
                          </span>
                        </span>
                        <span className="text-xs text-[#777777]">
                          {formatDate(fc.checked_at ?? fc.date_checked ?? '')}
                        </span>
                      </div>
                    )}

                    {/* Claim */}
                    <blockquote className="border-l-2 border-[#E5E3DE] pl-3">
                      <p className="text-sm text-[#111111] leading-relaxed italic">
                        &ldquo;{fc.claim}&rdquo;
                      </p>
                    </blockquote>

                    {/* Verdict badge */}
                    <div>
                      <FactCheckBadge verdict={fc.verdict} size="md" />
                    </div>

                    {/* Explanation */}
                    <p className="text-sm text-[#777777] leading-relaxed">
                      {fc.explanation}
                    </p>

                    {/* Source */}
                    {fc.source_url && (
                      <a
                        href={fc.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto inline-flex items-center gap-1.5 text-xs text-[#777777] hover:text-[#1A56A0] transition-colors"
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
      <section className="py-8 border-t border-[#E5E3DE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#F7F6F3] border border-[#E5E3DE] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[#111111] mb-2">
              Metodología de verificación
            </h3>
            <p className="text-xs text-[#777777] leading-relaxed">
              Cada verificación analiza una afirmación pública de un candidato. Usamos
              fuentes oficiales (INEI, BCR, JNE, ONPE, Poder Judicial) y medios de
              comunicación verificables. Los veredictos son:{' '}
              <strong className="text-[#1A6B35]">Verdadero</strong> (se sostiene con
              evidencia), <strong className="text-[#9B1C1C]">Falso</strong> (contradice la
              evidencia), <strong className="text-orange-600">Engañoso</strong> (contiene
              verdad parcial con contexto distorsionado),{' '}
              <strong className="text-[#777777]">No verificable</strong> (sin datos
              suficientes) y{' '}
              <strong className="text-blue-600">Necesita contexto</strong> (la afirmación
              es incompleta sin información adicional).
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
