'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

interface DiputadoCandidate {
  id: string
  name: string
  party: string
  partyId: string
  district: string
  listPosition: number
  imageUrl: string | null
}

export function DiputadosComparator({ candidates }: { candidates: DiputadoCandidate[] }) {
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [selected, setSelected] = useState<DiputadoCandidate[]>([])

  const districts = useMemo(
    () => [...new Set(candidates.map(c => c.district))].sort(),
    [candidates]
  )

  const filteredCandidates = useMemo(
    () => selectedDistrict ? candidates.filter(c => c.district === selectedDistrict) : [],
    [candidates, selectedDistrict]
  )

  const availableCandidates = filteredCandidates.filter(
    c => !selected.find(s => s.id === c.id)
  )

  // Group available by party
  const byParty = useMemo(() => {
    const map = new Map<string, DiputadoCandidate[]>()
    for (const c of availableCandidates) {
      const list = map.get(c.party) ?? []
      list.push(c)
      map.set(c.party, list)
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [availableCandidates])

  const addCandidate = (c: DiputadoCandidate) => {
    if (selected.length >= 3) return
    setSelected([...selected, c])
  }

  const removeCandidate = (id: string) => {
    setSelected(selected.filter(c => c.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* District selector */}
      <div className="bg-[#F7F6F3] border border-[#E5E3DE] rounded-xl p-4">
        <label htmlFor="compare-district" className="block text-sm font-medium text-[#555555] mb-2">
          Selecciona tu departamento para comparar candidatos:
        </label>
        <select
          id="compare-district"
          value={selectedDistrict}
          onChange={(e) => {
            setSelectedDistrict(e.target.value)
            setSelected([])
          }}
          className="w-full sm:w-auto px-3 py-2 border border-[#E5E3DE] rounded-lg text-sm text-[#111111] bg-white focus:outline-none focus:ring-2 focus:ring-[#1A56A0]/30 focus:border-[#1A56A0]"
        >
          <option value="">Selecciona un departamento...</option>
          {districts.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {!selectedDistrict && (
        <div className="text-center py-12 border border-[#E5E3DE] rounded-xl bg-[#F7F6F3]">
          <p className="text-lg font-semibold text-[#111111] mb-2">Selecciona tu departamento</p>
          <p className="text-sm text-[#777777]">
            Los diputados se eligen por circunscripción. Selecciona tu departamento arriba para ver y comparar candidatos.
          </p>
        </div>
      )}

      {selectedDistrict && (
        <>
          {/* Selected candidates comparison */}
          {selected.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-[#555555] mb-3">
                Comparando {selected.length}/3 candidatos de {selectedDistrict}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {selected.map(c => (
                  <div key={c.id} className="border border-[#1A56A0] rounded-xl p-4 bg-white relative">
                    <button
                      onClick={() => removeCandidate(c.id)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#F7F6F3] text-[#777777] hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-xs"
                    >
                      x
                    </button>
                    <div className="flex items-center gap-3 mb-3">
                      {c.imageUrl ? (
                        <img src={c.imageUrl} alt={c.name} className="w-12 h-12 rounded-full object-cover border border-[#E5E3DE]" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#F7F6F3] border border-[#E5E3DE] flex items-center justify-center">
                          <span className="text-sm font-bold text-[#777777]">
                            {c.name.split(' ').slice(0, 2).map(w => w[0]).join('')}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-[#111111]">{c.name}</p>
                        <p className="text-xs text-[#777777]">{c.party}</p>
                        <p className="text-xs text-[#CBCAC5]">Posición #{c.listPosition}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Candidate selector */}
          {selected.length < 3 && (
            <div>
              <h3 className="text-sm font-semibold text-[#555555] mb-3">
                {selected.length === 0 ? 'Selecciona hasta 3 candidatos para comparar:' : 'Agregar candidato:'}
              </h3>
              <div className="max-h-96 overflow-y-auto border border-[#E5E3DE] rounded-xl bg-white">
                {byParty.map(([party, list]) => (
                  <div key={party}>
                    <div className="px-3 py-2 bg-[#F7F6F3] text-xs font-semibold text-[#555555] sticky top-0 border-b border-[#E5E3DE]">
                      {party} ({list.length})
                    </div>
                    {list.sort((a, b) => a.listPosition - b.listPosition).map(c => (
                      <button
                        key={c.id}
                        onClick={() => addCandidate(c)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#F7F6F3] text-left border-b border-[#E5E3DE] last:border-b-0 transition-colors"
                      >
                        {c.imageUrl ? (
                          <img src={c.imageUrl} alt={c.name} className="w-8 h-8 rounded-full object-cover border border-[#E5E3DE]" loading="lazy" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#F7F6F3] border border-[#E5E3DE] flex items-center justify-center">
                            <span className="text-[10px] font-bold text-[#777777]">
                              {c.name.split(' ').slice(0, 2).map(w => w[0]).join('')}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-medium text-[#111111]">{c.name}</p>
                          <p className="text-[10px] text-[#777777]">#{c.listPosition}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-[#CBCAC5] text-center">
            Datos de posiciones para candidatos a la Cámara de Diputados se están recopilando.{' '}
            <Link href="/contribuir" className="text-[#1A56A0] hover:underline">Contribuir</Link>
          </p>
        </>
      )}
    </div>
  )
}
