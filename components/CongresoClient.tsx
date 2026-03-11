'use client'

import { useState } from 'react'
import type { CongressCandidate } from '@/lib/types'

type TabType = 'partido' | 'region'

interface CongresoClientProps {
  candidates: CongressCandidate[]
  parties: string[]
  regions: string[]
}

const REGION_NAMES: Record<string, string> = {
  AMA: 'Amazonas',
  ANC: 'Áncash',
  APU: 'Apurímac',
  ARE: 'Arequipa',
  AYA: 'Ayacucho',
  CAJ: 'Cajamarca',
  CAL: 'Callao',
  CUS: 'Cusco',
  HUV: 'Huancavelica',
  HUC: 'Huánuco',
  ICA: 'Ica',
  JUN: 'Junín',
  LAL: 'La Libertad',
  LAM: 'Lambayeque',
  LIM: 'Lima Metropolitana',
  LOR: 'Loreto',
  MDD: 'Madre de Dios',
  MOQ: 'Moquegua',
  PAS: 'Pasco',
  PIU: 'Piura',
  PUN: 'Puno',
  SAM: 'San Martín',
  TAC: 'Tacna',
  TUM: 'Tumbes',
  UCA: 'Ucayali',
  nacional: 'Lista Nacional',
}

export default function CongresoClient({ candidates, parties, regions }: CongresoClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('partido')
  const [selectedParty, setSelectedParty] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')

  const filtered = candidates.filter((c) => {
    if (activeTab === 'partido' && selectedParty) return c.party === selectedParty
    if (activeTab === 'region' && selectedRegion) return c.region === selectedRegion
    return true
  })

  const grouped: Record<string, CongressCandidate[]> = {}
  filtered.forEach((c) => {
    const key = activeTab === 'partido' ? c.party : (REGION_NAMES[c.region] ?? c.region)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(c)
  })

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setSelectedParty('')
    setSelectedRegion('')
  }

  return (
    <div>
      {/* Tab selector */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => handleTabChange('partido')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'partido'
              ? 'bg-[#1A56A0] text-white'
              : 'bg-[#F7F6F3] text-[#777777] hover:bg-[#EEEDE9]'
          }`}
        >
          Por Partido
        </button>
        <button
          onClick={() => handleTabChange('region')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'region'
              ? 'bg-[#1A56A0] text-white'
              : 'bg-[#F7F6F3] text-[#777777] hover:bg-[#EEEDE9]'
          }`}
        >
          Por Región
        </button>
      </div>

      {/* Filter dropdown */}
      <div className="mb-6">
        {activeTab === 'partido' ? (
          <select
            value={selectedParty}
            onChange={(e) => setSelectedParty(e.target.value)}
            className="border border-[#E5E3DE] bg-[#F7F6F3] text-[#111111] rounded-lg px-3 py-2 text-sm w-full max-w-xs"
          >
            <option value="">Todos los partidos</option>
            {parties.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        ) : (
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="border border-[#E5E3DE] bg-[#F7F6F3] text-[#111111] rounded-lg px-3 py-2 text-sm w-full max-w-xs"
          >
            <option value="">Todas las regiones</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {REGION_NAMES[r] ?? r}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-[#777777] mb-4">
        {filtered.length} candidato{filtered.length !== 1 ? 's' : ''}
        {selectedParty ? ` de ${selectedParty}` : ''}
        {selectedRegion ? ` en ${REGION_NAMES[selectedRegion] ?? selectedRegion}` : ''}
      </p>

      {/* Grouped candidates */}
      <div className="space-y-8">
        {Object.entries(grouped)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([group, groupCandidates]) => (
            <div key={group}>
              <h2 className="text-xl font-semibold mb-3 pb-2 border-b border-[#E5E3DE] text-[#111111]">
                {group}
                <span className="text-sm font-normal text-[#777777] ml-2">
                  ({groupCandidates.length} candidato{groupCandidates.length !== 1 ? 's' : ''})
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupCandidates.map((c) => (
                  <div
                    key={c.id}
                    className="border border-[#E5E3DE] rounded-lg p-4 bg-[#F7F6F3] hover:bg-[#EEEDE9] transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#EEEDE9] flex items-center justify-center text-sm font-bold text-[#1A56A0] shrink-0">
                        {c.full_name
                          .split(' ')
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[#111111] truncate">{c.full_name}</div>
                        <div className="text-sm text-[#777777]">
                          {activeTab === 'partido'
                            ? `${REGION_NAMES[c.region] ?? c.region} · Posición ${c.list_position}`
                            : `${c.party_abbreviation} · Posición ${c.list_position}`}
                        </div>
                        <p className="text-xs text-[#777777] mt-1 line-clamp-2">{c.bio}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>

      {Object.keys(grouped).length === 0 && (
        <div className="text-center py-12 text-[#777777]">
          No se encontraron candidatos con los filtros seleccionados.
        </div>
      )}
    </div>
  )
}
