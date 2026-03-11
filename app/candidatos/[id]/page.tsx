import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCandidateById, getPositionsByCandidateId, getFactChecksByCandidateId, getCandidates } from '@/lib/data'
import {
  CandidateHero,
  CandidateStats,
  CandidatePositions,
  CandidateFactChecks,
  CandidateCriminalRecord,
  ExpandableBio,
} from '@/components/CandidateProfile'
import { CandidateShareButtons } from '@/components/CandidateProfile/CandidateShareButtons'
import CandidateNews from '@/components/CandidateNews'
import { Metadata } from 'next'
import candidatePositionsData from '@/data/candidate-positions.json'

type CandidatePositionEntry = {
  candidate_id: string
  candidate_name: string
  party: string
  party_abbreviation: string
  positions: Record<string, { score: number; label: string; verified: boolean }>
}

const positionsMatrix = candidatePositionsData as CandidatePositionEntry[]

function calculatePositionMatch(
  aScores: Record<string, number>,
  bScores: Record<string, number>,
): number {
  const issues = Object.keys(aScores)
  if (issues.length === 0) return 0
  const totalDiff = issues.reduce((sum, issue) => {
    return sum + Math.abs((aScores[issue] ?? 3) - (bScores[issue] ?? 3))
  }, 0)
  const maxPossibleDiff = issues.length * 4
  return Math.round((1 - totalDiff / maxPossibleDiff) * 100)
}

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const candidate = await getCandidateById(id)
  if (!candidate) return { title: 'Candidato no encontrado — VotoAbierto' }
  const description = candidate.bio_short ?? candidate.career_summary?.slice(0, 150) ?? ''
  const slug = candidate.slug ?? candidate.id
  return {
    title: `${candidate.full_name} — VotoAbierto`,
    description,
    openGraph: {
      title: `${candidate.full_name} | ${candidate.party_name}`,
      description,
      images: [`/api/og/candidato/${slug}`],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${candidate.full_name} — VotoAbierto`,
      description,
      images: [`/api/og/candidato/${slug}`],
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

  const [positions, factChecks, allCandidates] = await Promise.all([
    getPositionsByCandidateId(candidate.id),
    getFactChecksByCandidateId(candidate.id),
    getCandidates(),
  ])

  const bio = candidate.bio ?? candidate.career_summary ?? ''
  const criminalRecords = candidate.criminal_records ?? []

  // Same party candidates
  const samePartyCandidates = allCandidates
    .filter((c) => c.party_name === candidate.party_name && c.id !== candidate.id)
    .slice(0, 3)

  // Similar position candidates
  const currentPositionEntry = positionsMatrix.find((cp) => cp.candidate_id === candidate.id)
  let similarCandidates: { id: string; name: string; party: string; matchPct: number }[] = []
  if (currentPositionEntry) {
    const currentScores: Record<string, number> = {}
    for (const [key, val] of Object.entries(currentPositionEntry.positions)) {
      currentScores[key] = val.score
    }
    similarCandidates = positionsMatrix
      .filter((cp) => cp.candidate_id !== candidate.id)
      .map((cp) => {
        const scores: Record<string, number> = {}
        for (const [key, val] of Object.entries(cp.positions)) {
          scores[key] = val.score
        }
        return {
          id: cp.candidate_id,
          name: cp.candidate_name,
          party: cp.party,
          matchPct: calculatePositionMatch(currentScores, scores),
        }
      })
      .sort((a, b) => b.matchPct - a.matchPct)
      .slice(0, 3)
  }

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

        <section>
          <h2 className="text-xl font-bold text-[#111111] mb-4 flex items-center gap-2">
            <span>📰</span> Noticias recientes
          </h2>
          <CandidateNews slug={candidate.slug} />
        </section>

        <div className="border border-[#E5E3DE] rounded-xl p-5 bg-[#F7F6F3]">
          <h3 className="font-semibold text-[#111111] mb-1">¿Tienes información sobre este candidato?</h3>
          <p className="text-[#666666] text-sm mb-3">
            Si encontraste una corrección, un plan de gobierno, o una declaración importante,
            ayúdanos a mantener el perfil actualizado.
          </p>
          <a href={`/contribuir?candidato=${candidate.slug}`}
             className="inline-flex items-center gap-2 text-[#1A56A0] text-sm font-medium hover:underline">
            📋 Enviar información verificada →
          </a>
        </div>

        {/* Similar position candidates */}
        {similarCandidates.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-[#111111] mb-4 flex items-center gap-2">
              <span>🤝</span> Candidatos con posiciones similares
            </h2>
            <p className="text-sm text-[#777777] mb-4">
              Candidatos con posiciones similares en los temas clave.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {similarCandidates.map((sc) => (
                <Link
                  key={sc.id}
                  href={`/candidatos/${sc.id}`}
                  className="block p-4 rounded-xl border border-[#E5E3DE] hover:shadow-md transition-all bg-white"
                >
                  <p className="text-sm font-semibold text-[#111111]">{sc.name}</p>
                  <p className="text-xs text-[#777777] mt-1">{sc.party}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-[#EEEDE9] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${sc.matchPct >= 80 ? 'bg-green-500' : sc.matchPct >= 60 ? 'bg-yellow-500' : 'bg-gray-400'}`}
                        style={{ width: `${sc.matchPct}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#1A56A0]">{sc.matchPct}%</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Same party candidates */}
        {samePartyCandidates.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-[#111111] mb-4 flex items-center gap-2">
              <span>🏛️</span> Candidatos del mismo partido
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {samePartyCandidates.map((sc) => (
                <Link
                  key={sc.id}
                  href={`/candidatos/${sc.slug}`}
                  className="block p-4 rounded-xl border border-[#E5E3DE] hover:shadow-md transition-all bg-white"
                >
                  <p className="text-sm font-semibold text-[#111111]">
                    {sc.common_name ?? sc.full_name}
                  </p>
                  <p className="text-xs text-[#777777] mt-1">{sc.party_name}</p>
                  <span className="mt-2 inline-block text-xs font-medium text-[#777777] bg-[#EEEDE9] border border-[#E5E3DE] rounded px-2 py-0.5">
                    {sc.role === 'president' ? 'Presidente' : sc.role}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

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
