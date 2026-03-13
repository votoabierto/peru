'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search } from 'lucide-react'
import CandidateCard from '@/components/CandidateCard'
import type { Candidate } from '@/lib/types'

const PAGE_SIZE = 12

const ROLE_OPTIONS = [
  { value: '', label: 'Todos los cargos' },
  { value: 'president', label: 'Presidente' },
  { value: 'vice_president', label: 'Vicepresidente' },
  { value: 'senator', label: 'Senador' },
  { value: 'representative', label: 'Diputado' },
]

interface Props {
  initialCandidates: Candidate[]
}

export default function CandidatosList({ initialCandidates }: Props) {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [partyFilter, setPartyFilter] = useState('')
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

  // Reset pagination whenever filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [search, roleFilter, partyFilter])

  const filtered = useMemo(() => {
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

      return matchesSearch && matchesRole && matchesParty
    }).sort((a, b) => {
      // Sort alphabetically by last name (apellido) for equal treatment
      const aLastName = a.full_name.split(' ').pop() ?? a.full_name
      const bLastName = b.full_name.split(' ').pop() ?? b.full_name
      return aLastName.localeCompare(bLastName, 'es')
    })
  }, [initialCandidates, search, roleFilter, partyFilter])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  return (
    <>
      {/* Filters */}
      <section className="bg-[#F7F6F3] sticky top-16 z-40 border-b border-[#E5E3DE] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777777]"
              />
              <input
                type="text"
                placeholder="Buscar candidato o partido..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E5E3DE] rounded-lg text-sm text-[#111111] placeholder-[#999999] focus:outline-none focus:border-[#1A56A0] transition-colors"
              />
            </div>

            {/* Role filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2.5 bg-white border border-[#E5E3DE] rounded-lg text-sm text-[#111111] focus:outline-none focus:border-[#1A56A0] transition-colors"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-white">
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Party filter */}
            <select
              value={partyFilter}
              onChange={(e) => setPartyFilter(e.target.value)}
              className="px-3 py-2.5 bg-white border border-[#E5E3DE] rounded-lg text-sm text-[#111111] focus:outline-none focus:border-[#1A56A0] transition-colors"
            >
              {partyOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-white">
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
              <p className="text-[#777777] text-lg">
                No se encontraron candidatos con ese criterio.
              </p>
              <button
                onClick={() => {
                  setSearch('')
                  setRoleFilter('')
                  setPartyFilter('')
                }}
                className="mt-4 text-sm text-[#1A56A0] hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs text-[#777777] mb-6">
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
                    className="px-6 py-3 bg-[#F7F6F3] border border-[#E5E3DE] rounded-lg text-sm text-[#111111] hover:border-[#1A56A0] transition-colors"
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
