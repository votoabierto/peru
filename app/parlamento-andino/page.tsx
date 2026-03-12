import ContributionNotice from '@/components/ContributionNotice'
import FeedbackWidget from '@/components/FeedbackWidget'
import andinoCandidates from '@/data/andino-candidates.json'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Parlamento Andino — VotoAbierto',
  description: 'Candidatos al Parlamento Andino por el Perú para las elecciones del 12 de abril de 2026. 5 representantes.',
}

interface AndinoCandidate {
  id: string
  name: string
  party: string
  partyId: string
  electionType: string
  listPosition: number
  imageUrl: string | null
  sourceUrl: string
}

export default function ParlamentoAndinoPage() {
  const candidates = andinoCandidates as AndinoCandidate[]

  // Group by party and sort by list position
  const byParty = new Map<string, AndinoCandidate[]>()
  for (const c of candidates) {
    const list = byParty.get(c.party) ?? []
    list.push(c)
    byParty.set(c.party, list)
  }
  for (const list of byParty.values()) {
    list.sort((a, b) => a.listPosition - b.listPosition)
  }

  const sortedParties = [...byParty.entries()].sort((a, b) => a[0].localeCompare(b[0]))

  return (
    <div className="bg-white min-h-screen">
      <section className="border-b border-[#E5E3DE] py-10 bg-[#F7F6F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#1A56A0] text-sm font-semibold uppercase tracking-widest mb-2">Elecciones Perú 2026</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111] mb-2">
            Parlamento Andino — 5 representantes
          </h1>
          <p className="text-[#777777] max-w-3xl">
            El Parlamento Andino es el órgano deliberante de la Comunidad Andina de Naciones (Bolivia, Colombia, Ecuador y Perú).
            Se eligen 5 representantes peruanos en distrito nacional único.
            Se muestran {candidates.length} candidatos de {sortedParties.length} partidos.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <ContributionNotice />

        {sortedParties.map(([party, list]) => (
          <div key={party}>
            <h2 className="text-lg font-bold text-[#111111] mb-3 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#1A56A0] flex-shrink-0" />
              {party}
              <span className="text-sm font-normal text-[#777777]">({list.length} candidatos)</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {list.map((c) => (
                <div key={c.id + '-' + c.listPosition} className="card flex items-center gap-3 p-3">
                  <div className="flex-shrink-0">
                    {c.imageUrl ? (
                      <img
                        src={c.imageUrl}
                        alt={c.name}
                        className="w-10 h-10 rounded-full object-cover border border-[#E5E3DE]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#F7F6F3] border border-[#E5E3DE] flex items-center justify-center">
                        <span className="text-xs font-bold text-[#777777]">
                          {c.name.split(' ').slice(0, 2).map(w => w[0]).join('')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#111111] truncate">{c.name}</p>
                    <p className="text-xs text-[#777777]">#{c.listPosition}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <FeedbackWidget pageUrl="/parlamento-andino" />

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
