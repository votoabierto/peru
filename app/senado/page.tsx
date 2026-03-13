import Link from 'next/link'
import Image from 'next/image'
import ContributionNotice from '@/components/ContributionNotice'
import FeedbackWidget from '@/components/FeedbackWidget'
import senateCandidates from '@/data/senate-candidates.json'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Candidatos al Senado 2026 — VotoAbierto',
  description: 'Conoce a los candidatos al Senado de la República del Perú para las elecciones del 12 de abril de 2026. 60 escaños en distrito nacional único. Datos verificados del JNE.',
  keywords: ['senado peru 2026', 'candidatos senado', 'elecciones peru', 'senadores 2026', 'bicameral peru'],
  openGraph: {
    title: 'Candidatos al Senado 2026 | VotoAbierto',
    description: '60 senadores se eligen en distrito nacional único. Conoce a los candidatos con datos verificados del JNE.',
    url: 'https://votoabierto.pe/senado',
  },
  alternates: { canonical: 'https://votoabierto.pe/senado' },
}

interface SenateCandidate {
  id: string
  name: string
  party: string
  partyId: string
  electionType: string
  listPosition: number
  imageUrl: string | null
  sourceUrl: string
}

export default function SenadoPage() {
  const candidates = senateCandidates as SenateCandidate[]

  // Group by party and sort by list position
  const byParty = new Map<string, SenateCandidate[]>()
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
            Senado de la República — 60 escaños
          </h1>
          <p className="text-[#777777] max-w-3xl">
            Por primera vez desde 1992, el Perú restaura el sistema bicameral. Los 60 senadores se eligen en un distrito nacional único mediante voto preferencial.
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
                <Link key={c.id + '-' + c.listPosition} href={`/senado/${c.id}`} className="block hover:shadow-md transition-shadow rounded-lg">
                  <div className="card flex items-center gap-3 p-3">
                    <div className="flex-shrink-0">
                      {c.imageUrl ? (
                        <Image
                          src={c.imageUrl}
                          alt={c.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover border border-[#E5E3DE]"
                          loading="lazy"
                          sizes="40px"
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
                </Link>
              ))}
            </div>
          </div>
        ))}

        <FeedbackWidget pageUrl="/senado" />

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
