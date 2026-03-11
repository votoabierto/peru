'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, CheckCircle, X } from 'lucide-react'
import { IDEOLOGY_LABELS, ISSUE_LABELS, type IssueArea } from '@/lib/types'
import type { Candidate, Position } from '@/lib/types'

const ALL_ISSUES = Object.keys(ISSUE_LABELS) as IssueArea[]

const ROLE_LABELS: Record<string, string> = {
  president: 'Presidente',
  vice_president: 'Vicepresidente',
  senator: 'Senador',
  representative: 'Diputado',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function CandidateSelector({
  slot,
  selected,
  onSelect,
  onClear,
  usedIds,
  allCandidates,
}: {
  slot: number
  selected: Candidate | null
  onSelect: (c: Candidate) => void
  onClear: () => void
  usedIds: string[]
  allCandidates: Candidate[]
}) {
  const available = allCandidates.filter((c) => !usedIds.includes(c.id) || selected?.id === c.id)

  if (selected) {
    return (
      <div className="bg-[#F7F6F3] border border-[#1A56A0]/40 rounded-xl p-4 relative">
        <button
          onClick={onClear}
          className="absolute top-3 right-3 text-[#777777] hover:text-[#9B1C1C] transition-colors"
          aria-label="Quitar candidato"
        >
          <X size={16} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#EEEDE9] border border-[#E5E3DE] flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-[#777777]">
              {getInitials(selected.full_name)}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#111111] leading-tight">
              {selected.common_name ?? selected.full_name}
            </p>
            <p className="text-xs text-[#777777]">
              {selected.party_abbreviation} · {ROLE_LABELS[selected.role]}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#F7F6F3] border border-[#E5E3DE] rounded-xl p-4">
      <p className="text-xs text-[#777777] mb-2 font-medium">
        Candidato {slot}
      </p>
      <select
        onChange={(e) => {
          const c = allCandidates.find((c) => c.id === e.target.value)
          if (c) onSelect(c)
        }}
        defaultValue=""
        className="w-full px-3 py-2 bg-[#EEEDE9] border border-[#E5E3DE] rounded-lg text-sm text-[#111111] focus:outline-none focus:border-[#1A56A0] transition-colors"
      >
        <option value="" disabled className="bg-[#EEEDE9]">
          Selecciona un candidato...
        </option>
        {available.map((c) => (
          <option key={c.id} value={c.id} className="bg-[#EEEDE9]">
            {c.full_name} ({c.party_abbreviation})
          </option>
        ))}
      </select>
    </div>
  )
}

export default function CompararClient({
  allCandidates,
  allPositions,
}: {
  allCandidates: Candidate[]
  allPositions: Position[]
}) {
  const [candidates, setCandidates] = useState<(Candidate | null)[]>([null, null, null])

  const selected = candidates.filter(Boolean) as Candidate[]

  function handleSelect(slot: number, candidate: Candidate) {
    setCandidates((prev) => {
      const next = [...prev]
      next[slot] = candidate
      return next
    })
  }

  function handleClear(slot: number) {
    setCandidates((prev) => {
      const next = [...prev]
      next[slot] = null
      return next
    })
  }

  const usedIds = candidates.filter(Boolean).map((c) => c!.id)

  function getStance(candidateId: string, issue: IssueArea): string | null {
    const pos = allPositions.find(
      (p) => p.candidate_id === candidateId && p.issue_area === issue
    )
    return pos?.stance ?? null
  }

  const issuesWithData = ALL_ISSUES.filter((issue) =>
    selected.some((c) => getStance(c.id, issue) !== null)
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Selector row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[0, 1, 2].map((slot) => (
          <CandidateSelector
            key={slot}
            slot={slot + 1}
            selected={candidates[slot]}
            onSelect={(c) => handleSelect(slot, c)}
            onClear={() => handleClear(slot)}
            usedIds={usedIds}
            allCandidates={allCandidates}
          />
        ))}
      </div>

      {selected.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[#E5E3DE] rounded-xl">
          <p className="text-[#777777] text-lg">
            Selecciona al menos un candidato para comenzar la comparación.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Basic info table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#777777] uppercase tracking-wider bg-[#F7F6F3] border border-[#E5E3DE] rounded-tl-lg w-40">
                    Campo
                  </th>
                  {selected.map((c) => (
                    <th
                      key={c.id}
                      className="text-left py-3 px-4 text-sm font-semibold text-[#1A56A0] bg-[#F7F6F3] border border-[#E5E3DE]"
                    >
                      {c.common_name ?? c.full_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Partido */}
                <tr>
                  <td className="py-3 px-4 text-xs font-medium text-[#777777] bg-[#F7F6F3] border border-[#E5E3DE]">
                    Partido
                  </td>
                  {selected.map((c) => (
                    <td key={c.id} className="py-3 px-4 text-sm text-[#111111] bg-[#EEEDE9] border border-[#E5E3DE]">
                      <span className="font-semibold">{c.party_abbreviation}</span>
                      <span className="text-[#777777] ml-1">— {c.party_name}</span>
                    </td>
                  ))}
                </tr>

                {/* Ideología */}
                <tr>
                  <td className="py-3 px-4 text-xs font-medium text-[#777777] bg-[#F7F6F3] border border-[#E5E3DE]">
                    Ideología
                  </td>
                  {selected.map((c) => (
                    <td key={c.id} className="py-3 px-4 text-sm text-[#111111] bg-[#EEEDE9] border border-[#E5E3DE]">
                      {c.ideology ? (IDEOLOGY_LABELS[c.ideology] ?? c.ideology) : '—'}
                    </td>
                  ))}
                </tr>

                {/* Encuesta */}
                <tr>
                  <td className="py-3 px-4 text-xs font-medium text-[#777777] bg-[#F7F6F3] border border-[#E5E3DE]">
                    Intención de voto
                  </td>
                  {selected.map((c) => (
                    <td key={c.id} className="py-3 px-4 bg-[#EEEDE9] border border-[#E5E3DE]">
                      {c.current_polling !== undefined ? (
                        <span className="text-lg font-bold text-[#1A56A0]">
                          {c.current_polling.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-[#777777]">—</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Cargo */}
                <tr>
                  <td className="py-3 px-4 text-xs font-medium text-[#777777] bg-[#F7F6F3] border border-[#E5E3DE]">
                    Cargo
                  </td>
                  {selected.map((c) => (
                    <td key={c.id} className="py-3 px-4 text-sm text-[#111111] bg-[#EEEDE9] border border-[#E5E3DE]">
                      {ROLE_LABELS[c.role] ?? c.role}
                    </td>
                  ))}
                </tr>

                {/* Antecedentes */}
                <tr>
                  <td className="py-3 px-4 text-xs font-medium text-[#777777] bg-[#F7F6F3] border border-[#E5E3DE]">
                    Antecedentes penales
                  </td>
                  {selected.map((c) => (
                    <td key={c.id} className="py-3 px-4 bg-[#EEEDE9] border border-[#E5E3DE]">
                      {c.has_criminal_record ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#9B1C1C]">
                          <AlertTriangle size={13} />
                          Sí
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#1A6B35]">
                          <CheckCircle size={13} />
                          No
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Issue stances comparison */}
          {issuesWithData.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-[#111111] mb-4">
                Posiciones por tema
              </h2>
              <div className="space-y-4">
                {issuesWithData.map((issue) => {
                  const info = ISSUE_LABELS[issue]
                  return (
                    <div key={issue} className="border border-[#E5E3DE] rounded-xl overflow-hidden">
                      {/* Issue header */}
                      <div className="bg-[#F7F6F3] px-4 py-3 flex items-center gap-2">
                        <span className="text-lg" role="img" aria-label={info.label}>
                          {info.icon}
                        </span>
                        <span className="text-sm font-semibold text-[#111111]">
                          {info.label}
                        </span>
                      </div>
                      {/* Stance columns */}
                      <div className={`grid grid-cols-1 sm:grid-cols-${selected.length} divide-y sm:divide-y-0 sm:divide-x divide-[#E5E3DE]`}>
                        {selected.map((c) => {
                          const stance = getStance(c.id, issue)
                          return (
                            <div key={c.id} className="p-4 bg-[#EEEDE9]">
                              <p className="text-xs font-semibold text-[#1A56A0] mb-2">
                                {c.common_name ?? c.full_name}
                              </p>
                              {stance ? (
                                <p className="text-xs text-[#777777] leading-relaxed">
                                  {stance}
                                </p>
                              ) : (
                                <p className="text-xs text-[#777777] italic">
                                  Sin posición registrada.
                                </p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Individual profile links */}
          <div className="border-t border-[#E5E3DE] pt-6">
            <p className="text-xs text-[#777777] mb-3">Ver perfiles completos:</p>
            <div className="flex flex-wrap gap-3">
              {selected.map((c) => (
                <Link
                  key={c.id}
                  href={`/candidatos/${c.slug}`}
                  className="text-sm font-medium text-[#1A56A0] hover:underline"
                >
                  {c.common_name ?? c.full_name} →
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
