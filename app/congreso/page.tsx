import { getCongressCandidates } from '@/lib/data'
import CongresoClient from '@/components/CongresoClient'

export const metadata = {
  title: 'Congreso de la República — VotoAbierto',
  description: 'Candidatos al Congreso de la República del Perú para las elecciones del 12 de abril de 2026.',
}

export default async function CongresoPage() {
  const candidates = await getCongressCandidates()

  const parties = [...new Set(candidates.map((c) => c.party))].sort()
  const regions = [...new Set(candidates.map((c) => c.region))].sort()

  return (
    <div className="bg-white min-h-screen">
      <section className="border-b border-[#E5E3DE] py-10 bg-[#F7F6F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="label mb-2">Elecciones Perú 2026</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111] mb-2">
            Candidatos al Congreso
          </h1>
          <p className="text-[#777777]">
            El Congreso del Perú tiene 130 escaños unicamerales distribuidos por regiones según población.
          </p>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CongresoClient candidates={candidates} parties={parties} regions={regions} />
      </div>
    </div>
  )
}
