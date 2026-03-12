import ContributionNotice from '@/components/ContributionNotice'
import FeedbackWidget from '@/components/FeedbackWidget'
import districts from '@/data/districts.json'
import diputadosCandidates from '@/data/diputados-candidates.json'
import type { ElectoralDistrict } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cámara de Diputados — VotoAbierto',
  description: 'Candidatos a la Cámara de Diputados del Perú para las elecciones del 12 de abril de 2026. 130 escaños en 27 circunscripciones.',
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

export default function DiputadosPage() {
  const districtList = districts as ElectoralDistrict[]
  const totalSeats = districtList.reduce((sum, d) => sum + d.seats, 0)
  const candidates = diputadosCandidates as DiputadoCandidate[]

  // Group candidates by district
  const byDistrict = new Map<string, DiputadoCandidate[]>()
  for (const c of candidates) {
    const list = byDistrict.get(c.district) ?? []
    list.push(c)
    byDistrict.set(c.district, list)
  }

  // Districts with data
  const districtsWithData = new Set(byDistrict.keys())

  return (
    <div className="bg-white min-h-screen">
      <section className="border-b border-[#E5E3DE] py-10 bg-[#F7F6F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#1A56A0] text-sm font-semibold uppercase tracking-widest mb-2">Elecciones Perú 2026</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111] mb-2">
            Cámara de Diputados — {totalSeats} escaños en {districtList.length} circunscripciones
          </h1>
          <p className="text-[#777777] max-w-3xl">
            Los diputados se eligen por circunscripción regional. Se muestran {candidates.length} candidatos de {districtsWithData.size} circunscripciones con datos disponibles.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <ContributionNotice />

        {/* Districts with candidate data */}
        {[...byDistrict.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([district, dCandidates]) => {
          // Group by party within district
          const byParty = new Map<string, DiputadoCandidate[]>()
          for (const c of dCandidates) {
            const list = byParty.get(c.party) ?? []
            list.push(c)
            byParty.set(c.party, list)
          }
          for (const list of byParty.values()) {
            list.sort((a, b) => a.listPosition - b.listPosition)
          }

          const districtInfo = districtList.find(d => d.name.toLowerCase() === district.toLowerCase())

          return (
            <div key={district}>
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
                    {list.slice(0, 8).map((c) => (
                      <div key={c.id + '-' + c.listPosition} className="flex items-center gap-2 p-2 border border-[#E5E3DE] rounded-lg bg-white">
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
                    ))}
                    {list.length > 8 && (
                      <div className="flex items-center justify-center p-2 border border-[#E5E3DE] rounded-lg bg-[#F7F6F3]">
                        <span className="text-xs text-[#777777]">+{list.length - 8} más</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        })}

        {/* Districts without data */}
        <div>
          <h2 className="text-xl font-bold text-[#111111] mb-4">Otras circunscripciones</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {districtList
              .filter(d => !districtsWithData.has(d.name))
              .map((district) => (
                <div key={district.code} className="card flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#111111]">{district.name}</p>
                    <p className="text-xs text-[#777777]">
                      {district.seats} {district.seats === 1 ? 'escaño' : 'escaños'}
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

        <FeedbackWidget pageUrl="/diputados" />

        <div className="text-center text-xs text-[#777777] py-4">
          Fuente:{' '}
          <a href="https://votoinformado.jne.gob.pe" target="_blank" rel="noopener noreferrer" className="text-[#1A56A0] underline">
            Jurado Nacional de Elecciones (JNE)
          </a>
          {' '}— Datos obtenidos de la API oficial del JNE.
        </div>
      </div>
    </div>
  )
}
