import ContributionNotice from '@/components/ContributionNotice'
import DiputadosClient from '@/components/DiputadosClient'
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
  const districtsWithData = new Set(candidates.map(c => c.district))

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

      <DiputadosClient candidates={candidates} districtList={districtList} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 space-y-4">
        <ContributionNotice />
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
