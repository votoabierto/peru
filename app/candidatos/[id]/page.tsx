import { notFound } from 'next/navigation'
import { getCandidateById, getPositionsByCandidateId, getFactChecksByCandidateId } from '@/lib/data'
import {
  CandidateHero,
  CandidateStats,
  CandidatePositions,
  CandidateFactChecks,
  CandidateCriminalRecord,
  ExpandableBio,
} from '@/components/CandidateProfile'
import { CandidateShareButtons } from '@/components/CandidateProfile/CandidateShareButtons'
import { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const candidate = await getCandidateById(id)
  if (!candidate) return { title: 'Candidato no encontrado — VotoAbierto' }
  const description = candidate.bio_short ?? candidate.career_summary?.slice(0, 150) ?? ''
  return {
    title: `${candidate.full_name} — VotoAbierto`,
    description,
    openGraph: {
      title: `${candidate.full_name} | ${candidate.party_name}`,
      description,
    },
  }
}

export async function generateStaticParams() {
  const { SEED_CANDIDATES } = await import('@/lib/seed-data')
  return SEED_CANDIDATES.map((c) => ({ id: c.slug }))
}

export default async function CandidatePage({ params }: Props) {
  const { id } = await params
  const candidate = await getCandidateById(id)
  if (!candidate) notFound()

  const [positions, factChecks] = await Promise.all([
    getPositionsByCandidateId(candidate.id),
    getFactChecksByCandidateId(candidate.id),
  ])

  const bio = candidate.bio ?? candidate.career_summary ?? ''
  const criminalRecords = candidate.criminal_records ?? []

  return (
    <main className="min-h-screen bg-white">
      <CandidateHero candidate={candidate} />
      <CandidateStats candidate={candidate} />

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">
        {bio && (
          <section>
            <h2 className="text-xl font-bold text-[#111111] mb-4 flex items-center gap-2">
              <span>👤</span> Biografía
            </h2>
            <ExpandableBio bio={bio} />
          </section>
        )}

        {criminalRecords.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-[#111111] mb-4 flex items-center gap-2">
              <span>⚖️</span> Antecedentes legales
            </h2>
            <CandidateCriminalRecord records={criminalRecords} />
          </section>
        )}

        {(candidate.prior_offices?.length ?? 0) > 0 && (
          <section>
            <h2 className="text-xl font-bold text-[#111111] mb-4 flex items-center gap-2">
              <span>🏛️</span> Cargos previos
            </h2>
            <ul className="space-y-2">
              {candidate.prior_offices!.map((office, i) => (
                <li key={i} className="flex items-center gap-3 text-[#4B5563] text-sm">
                  <span className="w-2 h-2 rounded-full bg-[#1A56A0] flex-shrink-0" />
                  {office}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h2 className="text-xl font-bold text-[#111111] mb-4 flex items-center gap-2">
            <span>📋</span> Posiciones por tema
          </h2>
          <CandidatePositions positions={positions} />
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#111111] mb-4 flex items-center gap-2">
            <span>🔍</span> Verificaciones
          </h2>
          <CandidateFactChecks factChecks={factChecks} />
        </section>

        <section className="border border-[#E5E3DE] rounded-xl p-6 bg-[#F7F6F3] text-center">
          <h2 className="text-xl font-bold text-[#111111] mb-2">Comparte este perfil</h2>
          <p className="text-[#777777] text-sm mb-6">
            Ayuda a otros peruanos a conocer a los candidatos antes de votar el 12 de abril.
          </p>
          <div className="flex justify-center">
            <CandidateShareButtons candidate={candidate} />
          </div>
        </section>
      </div>
    </main>
  )
}
