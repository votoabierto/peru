import CandidatosList from '@/components/CandidatosList'
import { getCandidates } from '@/lib/data'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Candidatos Presidenciales 2026 — VotoAbierto',
  description: 'Conoce a los 36 candidatos presidenciales para las elecciones generales del Perú del 12 de abril de 2026. Perfiles, propuestas y plan de gobierno. Datos verificados del JNE.',
  keywords: ['candidatos presidenciales 2026', 'elecciones peru 2026', 'candidatos presidente peru', 'plan de gobierno'],
  openGraph: {
    title: 'Candidatos Presidenciales 2026 | VotoAbierto',
    description: '36 candidatos presidenciales compiten en las elecciones del 12 de abril de 2026. Datos verificados del JNE.',
    url: 'https://votoabierto.pe/candidatos',
  },
  alternates: { canonical: 'https://votoabierto.pe/candidatos' },
}

export default async function CandidatosPage() {
  const candidates = await getCandidates()

  return (
    <div className="bg-white min-h-screen">
      {/* Page header */}
      <section className="border-b border-[#E5E3DE] py-10 bg-[#F7F6F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="label mb-2">Elecciones Perú 2026</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111] mb-2">
            Candidatos
          </h1>
          <p className="text-[#777777]">
            Conoce a los principales candidatos presidenciales y al congreso.
          </p>
        </div>
      </section>

      <CandidatosList initialCandidates={candidates} />

      <p className="text-xs text-[#777777] text-center mt-2 pb-6">
        Fuente oficial: <a href="https://votoinformado.jne.gob.pe" target="_blank" rel="noopener" className="underline">JNE — Voto Informado</a>.
        Datos actualizados a marzo 2026.
      </p>
    </div>
  )
}
