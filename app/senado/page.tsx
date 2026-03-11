import ContributionNotice from '@/components/ContributionNotice'
import parties from '@/data/parties.json'
import type { PartyRegistry } from '@/lib/types'

export const metadata = {
  title: 'Senado de la República — VotoAbierto',
  description: 'Candidatos al Senado de la República del Perú para las elecciones del 12 de abril de 2026. 60 escaños en distrito nacional único.',
}

export default function SenadoPage() {
  const partyList = parties as PartyRegistry[]

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
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <ContributionNotice />

        <div>
          <h2 className="text-xl font-bold text-[#111111] mb-4">Partidos que presentan listas al Senado</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {partyList.map((party) => (
              <div key={party.id} className="card flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: party.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#111111] truncate">{party.name}</p>
                  <p className="text-xs text-[#777777]">{party.abbr}</p>
                </div>
                <a
                  href={`https://votoinformado.jne.gob.pe/voto/candidato-lista-senadores?org=${encodeURIComponent(party.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-[#1A56A0] hover:underline flex-shrink-0"
                >
                  Ver candidatos
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center text-xs text-[#777777] py-4">
          Fuente:{' '}
          <a href="https://votoinformado.jne.gob.pe" target="_blank" rel="noopener noreferrer" className="text-[#1A56A0] underline">
            Jurado Nacional de Elecciones (JNE)
          </a>
        </div>
      </div>
    </div>
  )
}
