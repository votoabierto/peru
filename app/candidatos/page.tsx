'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import CandidateCard from '@/components/CandidateCard'
import { SEED_CANDIDATES } from '@/lib/seed-data'
import { IDEOLOGY_LABELS } from '@/lib/types'

const ROLE_OPTIONS = [
  { value: '', label: 'Todos los cargos' },
  { value: 'president', label: 'Presidente' },
  { value: 'vice_president', label: 'Vicepresidente' },
  { value: 'senator', label: 'Senador' },
  { value: 'representative', label: 'Diputado' },
]

const PARTY_OPTIONS = [
  { value: '', label: 'Todos los partidos' },
  ...Array.from(new Set(SEED_CANDIDATES.map((c) => c.party_abbreviation))).map(
    (abbr) => ({
      value: abbr,
      label: `${abbr} — ${SEED_CANDIDATES.find((c) => c.party_abbreviation === abbr)?.party_name ?? ''}`,
    })
  ),
]

const IDEOLOGY_OPTIONS = [
  { value: '', label: 'Toda ideología' },
  ...Array.from(
    new Set(SEED_CANDIDATES.map((c) => c.ideology).filter(Boolean))
  ).map((id) => ({
    value: id as string,
    label: IDEOLOGY_LABELS[id as string] ?? id as string,
  })),
]

export default function CandidatosPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [partyFilter, setPartyFilter] = useState('')
  const [ideologyFilter, setIdeologyFilter] = useState('')

  const filtered = useMemo(() => {
    return SEED_CANDIDATES.filter((c) => {
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
  }, [search, roleFilter, partyFilter, ideologyFilter])

  return (
    <div className="bg-votoclaro-base min-h-screen">
      {/* Page header */}
      <section className="border-b border-votoclaro-border py-10 bg-votoclaro-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="label mb-2">Elecciones Perú 2026</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-votoclaro-text mb-2">
            Candidatos
          </h1>
          <p className="text-votoclaro-text-muted">
            Conoce a los principales candidatos presidenciales y al congreso.
          </p>
        </div>
      </section>

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
              {PARTY_OPTIONS.map((opt) => (
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
              {IDEOLOGY_OPTIONS.map((opt) => (
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
                {filtered.length} candidato{filtered.length !== 1 ? 's' : ''} encontrado
                {filtered.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((candidate) => (
                  <CandidateCard key={candidate.id} {...candidate} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
