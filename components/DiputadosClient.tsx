'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

function toDistritoSlug(district: string): string {
  return district.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
    .replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n')
}

interface DiputadoCandidate {
  id: string
  name: string
  party: string
  partyId: string
  electionType: string
  district: string
  listPosition: number
  imageUrl: string | null
  sourceUrl: string
}

interface ElectoralDistrict {
  code: string
  name: string
  seats: number
}

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export default function DiputadosClient({
  candidates,
  districtList,
}: {
  candidates: DiputadoCandidate[]
  districtList: ElectoralDistrict[]
}) {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('')

  // Group candidates by district
  const byDistrict = useMemo(() => {
    const map = new Map<string, DiputadoCandidate[]>()
    for (const c of candidates) {
      const list = map.get(c.district) ?? []
      list.push(c)
      map.set(c.district, list)
    }
    return map
  }, [candidates])

  // Match candidate districts to district list (accent-insensitive)
  const districtMatch = useMemo(() => {
    const map = new Map<string, ElectoralDistrict>()
    for (const d of districtList) {
      map.set(normalize(d.name), d)
    }
    return map
  }, [districtList])

  function getDistrictInfo(district: string): ElectoralDistrict | undefined {
    return districtMatch.get(normalize(district))
  }

  const districtsWithData = new Set(byDistrict.keys())

  // Filter districts to show
  const visibleDistricts = selectedDistrict
    ? [[selectedDistrict, byDistrict.get(selectedDistrict) ?? []] as [string, DiputadoCandidate[]]]
    : [...byDistrict.entries()].sort((a, b) => a[0].localeCompare(b[0]))

  const districtsWithoutData = districtList.filter(
    (d) => ![...districtsWithData].some((cd) => normalize(cd) === normalize(d.name))
  )

  return (
    <>
      {/* District selector */}
      <div className="bg-white sticky top-0 z-10 border-b border-[#E5E3DE] py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <label htmlFor="district-select" className="text-sm font-medium text-[#555555] whitespace-nowrap">
            Circunscripción:
          </label>
          <select
            id="district-select"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-[#E5E3DE] rounded-lg text-sm text-[#111111] bg-white focus:outline-none focus:ring-2 focus:ring-[#1A56A0]/30 focus:border-[#1A56A0]"
          >
            <option value="">Todas las circunscripciones ({candidates.length} candidatos)</option>
            {[...byDistrict.entries()]
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([district, dCandidates]) => {
                const info = getDistrictInfo(district)
                return (
                  <option key={district} value={district}>
                    {district} — {dCandidates.length} candidatos{info ? `, ${info.seats} escaños` : ''}
                  </option>
                )
              })}
          </select>
          {selectedDistrict && (
            <button
              onClick={() => setSelectedDistrict('')}
              className="text-xs text-[#1A56A0] hover:underline"
            >
              Ver todas
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* DNI lookup prompt */}
        <div className="bg-[#F7F6F3] border border-[#E5E3DE] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#111111]">¿Quieres ver tus candidatos exactos?</p>
            <p className="text-xs text-[#777777]">Ingresa tu DNI en el JNE para ver la lista de tu circunscripción.</p>
          </div>
          <a
            href="https://votoinformadoia.jne.gob.pe"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A56A0] text-white rounded-lg text-sm font-medium hover:bg-[#164A8A] transition-colors flex-shrink-0"
          >
            Consultar con DNI
          </a>
        </div>

        {/* Districts with candidate data */}
        {visibleDistricts.map(([district, dCandidates]) => {
          const byParty = new Map<string, DiputadoCandidate[]>()
          for (const c of dCandidates) {
            const list = byParty.get(c.party) ?? []
            list.push(c)
            byParty.set(c.party, list)
          }
          for (const list of byParty.values()) {
            list.sort((a, b) => a.listPosition - b.listPosition)
          }

          const districtInfo = getDistrictInfo(district)

          return (
            <div key={district} id={`district-${normalize(district).replace(/\s+/g, '-')}`}>
              <h2 className="text-xl font-bold text-[#111111] mb-1">{district}</h2>
              <p className="text-sm text-[#777777] mb-4">
                {districtInfo ? `${districtInfo.seats} escaños` : ''} — {dCandidates.length} candidatos de {byParty.size} partidos
              </p>
              {[...byParty.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([party, list]) => (
                <div key={party} className="mb-4">
                  <h3 className="text-sm font-semibold text-[#555555] mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#1A56A0] flex-shrink-0" />
                    {party} ({list.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 ml-4">
                    {list.map((c) => (
                      <Link key={c.id + '-' + c.listPosition} href={`/diputados/${toDistritoSlug(c.district)}/${c.id}`} className="block hover:shadow-md transition-shadow rounded-lg">
                        <div className="flex items-center gap-2 p-2 border border-[#E5E3DE] rounded-lg bg-white">
                          <div className="flex-shrink-0">
                            {c.imageUrl ? (
                              <img
                                src={c.imageUrl}
                                alt={c.name}
                                className="w-8 h-8 rounded-full object-cover border border-[#E5E3DE]"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-[#F7F6F3] border border-[#E5E3DE] flex items-center justify-center">
                                <span className="text-[10px] font-bold text-[#777777]">
                                  {c.name.split(' ').slice(0, 2).map(w => w[0]).join('')}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[#111111] truncate">{c.name}</p>
                            <p className="text-[10px] text-[#777777]">#{c.listPosition}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        })}

        {/* Districts without data (only when showing all) */}
        {!selectedDistrict && districtsWithoutData.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-[#111111] mb-4">Otras circunscripciones</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {districtsWithoutData.map((district) => (
                <div key={district.code} className="border border-[#E5E3DE] rounded-lg p-4 flex items-center justify-between bg-white">
                  <div>
                    <p className="text-sm font-semibold text-[#111111]">{district.name}</p>
                    <p className="text-xs text-[#777777]">
                      {district.seats} {district.seats === 1 ? 'escaño' : 'escaños'} — Sin datos
                    </p>
                  </div>
                  <a
                    href={`https://votoinformado.jne.gob.pe/voto/candidato-lista-diputados?dist=${encodeURIComponent(district.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-[#1A56A0] hover:underline flex-shrink-0"
                  >
                    Ver en JNE
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
