import ContributionNotice from '@/components/ContributionNotice'
import districts from '@/data/districts.json'
import type { ElectoralDistrict } from '@/lib/types'

export const metadata = {
  title: 'Cámara de Diputados — VotoAbierto',
  description: 'Candidatos a la Cámara de Diputados del Perú para las elecciones del 12 de abril de 2026. 130 escaños en 27 circunscripciones.',
}

export default function DiputadosPage() {
  const districtList = districts as ElectoralDistrict[]
  const totalSeats = districtList.reduce((sum, d) => sum + d.seats, 0)

  return (
    <div className="bg-white min-h-screen">
      <section className="border-b border-[#E5E3DE] py-10 bg-[#F7F6F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#1A56A0] text-sm font-semibold uppercase tracking-widest mb-2">Elecciones Perú 2026</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111] mb-2">
            Cámara de Diputados — {totalSeats} escaños en {districtList.length} circunscripciones
          </h1>
          <p className="text-[#777777] max-w-3xl">
            Los diputados se eligen por circunscripción regional. Cada región tiene un número de escaños proporcional a su población.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <ContributionNotice />

        <div>
          <h2 className="text-xl font-bold text-[#111111] mb-4">Circunscripciones electorales</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {districtList.map((district) => (
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
                  Ver candidatos en JNE
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
