'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import CandidateCard from '@/components/CandidateCard'
import { IDEOLOGY_LABELS } from '@/lib/types'
import type { Candidate } from '@/lib/types'

const PAGE_SIZE = 12

const ROLE_OPTIONS = [
  { value: '', label: 'Todos los cargos' },
  { value: 'president', label: 'Presidente' },
  { value: 'vice_president', label: 'Vicepresidente' },
  { value: 'senator', label: 'Senador' },
  { value: 'representative', label: 'Diputado' },
]

export default function CandidatosList({ initialCandidates }: { initialCandidates: Candidate[] }) {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [partyFilter, setPartyFilter] = useState('')
  const [ideologyFilter, setIdeologyFilter] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const partyOptions = useMemo(() => {
    const seen = new Map<string, string>()
    initialCandidates.forEach((c) => {
      if (!seen.has(c.party_abbreviation)) {
        seen.set(c.party_abbreviation, c.party_name)
      }
    })
    return [
      { value: '', label: 'Todos los partidos' },
      ...Array.from(seen.entries()).map(([abbr, name]) => ({
        value: abbr,
        label: `${abbr} — ${name}`,
      })),
    ]
  }, [initialCandidates])

  const ideologyOptions = useMemo(() => {
    const seen = new Set<string>()
    initialCandidates.forEach((c) => {
      if (c.ideology) seen.add(c.ideology)
    })
    return [
      { value: '', label: 'Toda ideología' },
      ...Array.from(seen).map((id) => ({
        value: id,
        label: IDEOLOGY_LABELS[id] ?? id,
      })),
    ]
  }, [initialCandidates])

  const filtered = useMemo(() => {
    // Reset pagination whenever filters change
    setVisibleCount(PAGE_SIZE)
    return initialCandidates.filter((c) => {
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        c.full_name.toLowerCase().includes(q) ||
        (c.common_name ?? '').toLowerCase().includes(q) ||
        c.party_name.toLowerCase().includes(q) ||
        c.party_abbreviation.toLowerCase().includes(q)

      const matchesRole = !roleFilter || c.role === roleFilter
      const matchesParty = !partyFilter || c.party_abbreviation === partyFilter
      const matchesIdeology = !ideologyFilter || c.ideology === ideologyFilter

      return matchesSearch && matchesRole && matchesParty && matchesIdeology
    })
  }, [initialCandidates, search, roleFilter, partyFilter, ideologyFilter])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  return (
    <>
      {/* Filters */}
      <section className="border-b border-votoclaro-border py-4 bg-votoclaro-surface sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-votoclaro-text-muted"
              />
              <input
                type="text"
                placeholder="Buscar candidato o partido..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-votoclaro-surface-2 border border-votoclaro-border rounded-lg text-sm text-votoclaro-text placeholder-votoclaro-text-muted focus:outline-none focus:border-votoclaro-gold transition-colors"
              />
            </div>

            {/* Role filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2.5 bg-votoclaro-surface-2 border border-votoclaro-border rounded-lg text-sm text-votoclaro-text focus:outline-none focus:border-votoclaro-gold transition-colors"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-votoclaro-surface-2">
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Party filter */}
            <select
              value={partyFilter}
              onChange={(e) => setPartyFilter(e.target.value)}
              className="px-3 py-2.5 bg-votoclaro-surface-2 border border-votoclaro-border rounded-lg text-sm text-votoclaro-text focus:outline-none focus:border-votoclaro-gold transition-colors"
            >
              {partyOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-votoclaro-surface-2">
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Ideology filter */}
            <select
              value={ideologyFilter}
              onChange={(e) => setIdeologyFilter(e.target.value)}
              className="px-3 py-2.5 bg-votoclaro-surface-2 border border-votoclaro-border rounded-lg text-sm text-votoclaro-text focus:outline-none focus:border-votoclaro-gold transition-colors"
            >
              {ideologyOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-votoclaro-surface-2">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Candidates grid */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-votoclaro-text-muted text-lg">
                No se encontraron candidatos con ese criterio.
              </p>
              <button
                onClick={() => {
                  setSearch('')
                  setRoleFilter('')
                  setPartyFilter('')
                  setIdeologyFilter('')
                }}
                className="mt-4 text-sm text-votoclaro-gold hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs text-votoclaro-text-muted mb-6">
                Mostrando {Math.min(visibleCount, filtered.length)} de {filtered.length} candidato
                {filtered.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {visible.map((candidate) => (
                  <CandidateCard key={candidate.id} {...candidate} />
                ))}
              </div>
              {hasMore && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                    className="px-6 py-3 bg-votoclaro-surface-2 border border-votoclaro-border rounded-lg text-sm text-votoclaro-text hover:border-votoclaro-gold transition-colors"
                  >
                    Ver más candidatos ({filtered.length - visibleCount} restantes)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
