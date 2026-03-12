import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getCandidateById,
  getPositionsByCandidateId,
  getFactChecksByCandidateId,
  getCandidates,
  getHojaDeVida,
  getAntecedentes,
  getBienes,
  getCandidatePositionsDB,
} from '@/lib/data'
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

const POSITION_LABELS: Record<string, string> = {
  economia: 'Economía',
  seguridad: 'Seguridad',
  corrupcion: 'Corrupción',
  educacion: 'Educación',
  recursos_naturales: 'Recursos Naturales',
  salud: 'Salud',
  descentralizacion: 'Descentralización',
  reforma_judicial: 'Reforma Judicial',
  politica_social: 'Política Social',
  constitucion: 'Constitución',
}

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

function formatPEN(n: number | null | undefined): string {
  if (!n) return 'N/D'
  if (n >= 1_000_000) return `S/ ${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `S/ ${(n / 1_000).toFixed(0)}K`
  return `S/ ${n.toLocaleString()}`
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

  const slug = candidate.slug ?? candidate.id

  const [positions, factChecks, allCandidates, hojaDeVida, antecedentesDB, bienesDB, positionsDB] = await Promise.all([
    getPositionsByCandidateId(candidate.id),
    getFactChecksByCandidateId(candidate.id),
    getCandidates(),
    getHojaDeVida(slug),
    getAntecedentes(slug),
    getBienes(slug),
    getCandidatePositionsDB(slug),
  ])

  const bio = candidate.planGobiernoResumen ?? candidate.bio ?? candidate.career_summary ?? ''
  const criminalRecords = candidate.criminal_records ?? []

  // Position scores from candidate-positions.json
  const positionEntry = positionsMatrix.find((cp) => cp.candidate_id === candidate.id)

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

  const ejes = candidate.planGobiernoEjes ?? []
  const proposals = candidate.proposals ?? []

  // Merge antecedentes from DB + seed data
  const allAntecedentes = antecedentesDB.length > 0 ? antecedentesDB : []

  return (
    <main className="min-h-screen bg-white">
      <CandidateHero candidate={candidate} />
      <CandidateStats candidate={candidate} />

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">
        {bio && (
          <section>
            <h2 className="text-xl font-bold text-[#111111] mb-4 flex items-center gap-2">
              <span>Biografía</span>
            </h2>
            <ExpandableBio bio={bio} />
          </section>
        )}

        {/* Hoja de Vida — Education */}
        {hojaDeVida?.education && hojaDeVida.education.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-[#111111] mb-4">Formación académica</h2>
            <div className="space-y-3">
              {hojaDeVida.education.map((edu, i) => (
                <div key={i} className="flex gap-4 items-start border-l-2 border-[#1A56A0] pl-4 py-1">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#111111]">{edu.titulo}</p>
                    <p className="text-xs text-[#4B5563]">{edu.institucion}</p>
                    <p className="text-xs text-[#777777] mt-0.5">
                      {edu.year_start}{edu.year_end ? ` — ${edu.year_end}` : ''} · {edu.country || 'Peru'}
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#F0F4FA] text-[#1A56A0] font-medium capitalize">
                    {edu.nivel?.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-[#CBCAC5] mt-2">Fuente: JNE — Hoja de Vida · Actualizado: {hojaDeVida.fetched_at?.slice(0, 10)}</p>
          </section>
        )}

        {/* Hoja de Vida — Work History */}
        {hojaDeVida?.work_history && hojaDeVida.work_history.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-[#111111] mb-4">Experiencia laboral</h2>
            <div className="space-y-3">
              {hojaDeVida.work_history.slice(0, 10).map((job, i) => (
                <div key={i} className="flex gap-4 items-start border-l-2 border-[#E5E3DE] pl-4 py-1">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#111111]">{job.cargo}</p>
                    <p className="text-xs text-[#4B5563]">{job.institucion}</p>
                    <p className="text-xs text-[#777777] mt-0.5">
                      {job.year_start}{job.year_end ? ` — ${job.year_end}` : ' — presente'}
                      {job.departamento ? ` · ${job.departamento}` : ''}
                    </p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                    job.sector === 'publico' ? 'bg-[#F0FAF4] text-[#1A6B35]' : 'bg-[#F7F6F3] text-[#777777]'
                  }`}>
                    {job.sector === 'publico' ? 'Público' : 'Privado'}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-[#CBCAC5] mt-2">Fuente: JNE — Hoja de Vida</p>
          </section>
        )}

        {/* Antecedentes from DB */}
        {allAntecedentes.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-[#111111] mb-4">Antecedentes legales</h2>
            <div className="space-y-3">
              {allAntecedentes.map((ant, i) => (
                <div key={ant.id || i} className={`rounded-xl border p-4 ${
                  ant.gravedad === 'alto' ? 'border-red-200 bg-red-50' : 'border-[#E5E3DE] bg-[#F7F6F3]'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      ant.gravedad === 'alto' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {ant.tipo?.replace('_', ' ')}
                    </span>
                    {ant.estado && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#EEEDE9] text-[#777777] font-medium">
                        {ant.estado}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#222222]">{ant.descripcion}</p>
                  <p className="text-[10px] text-[#CBCAC5] mt-2">
                    Fuente: {ant.fuente}{ant.fecha_inicio ? ` · ${ant.fecha_inicio}` : ''}
                    {ant.verified ? ' · Verificado' : ''}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Legacy criminal records fallback */}
        {criminalRecords.length > 0 && allAntecedentes.length === 0 && (
          <section>
            <h2 className="text-xl font-bold text-[#111111] mb-4">Antecedentes legales</h2>
            <CandidateCriminalRecord records={criminalRecords} />
          </section>
        )}

        {/* Bienes Declarados */}
        {bienesDB && (bienesDB.total_bienes_pen || bienesDB.total_ingresos_anuales_pen) && (
          <section>
            <h2 className="text-xl font-bold text-[#111111] mb-4">Bienes declarados</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {bienesDB.total_bienes_pen != null && (
                <div className="bg-[#F7F6F3] border border-[#E5E3DE] rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-[#1A56A0]">{formatPEN(bienesDB.total_bienes_pen)}</p>
                  <p className="text-xs text-[#777777] mt-1">Total bienes</p>
                </div>
              )}
              {bienesDB.total_ingresos_anuales_pen != null && (
                <div className="bg-[#F7F6F3] border border-[#E5E3DE] rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-[#1A56A0]">{formatPEN(bienesDB.total_ingresos_anuales_pen)}</p>
                  <p className="text-xs text-[#777777] mt-1">Ingresos anuales</p>
                </div>
              )}
              {bienesDB.total_deudas_pen != null && (
                <div className="bg-[#F7F6F3] border border-[#E5E3DE] rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-[#9B1C1C]">{formatPEN(bienesDB.total_deudas_pen)}</p>
                  <p className="text-xs text-[#777777] mt-1">Deudas</p>
                </div>
              )}
            </div>
            {bienesDB.bienes_inmuebles && bienesDB.bienes_inmuebles.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-[#111111] mb-2">Bienes inmuebles</h3>
                <div className="space-y-2">
                  {bienesDB.bienes_inmuebles.map((b, i) => (
                    <div key={i} className="flex items-center justify-between text-sm text-[#4B5563] bg-white border border-[#E5E3DE] rounded-lg px-3 py-2">
                      <span>{b.descripcion}</span>
                      <span className="font-medium">{formatPEN(b.valor_pen)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <p className="text-[10px] text-[#CBCAC5] mt-2">
              Fuente: {bienesDB.source || 'JNE'} · Declaración {bienesDB.declaration_year || '2025'}
            </p>
          </section>
        )}

        {(candidate.prior_offices?.length ?? 0) > 0 && (
          <section>
            <h2 className="text-xl font-bold text-[#111111] mb-4">Cargos previos</h2>
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

        {/* Plan de Gobierno ejes */}
        {ejes.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-[#111111] mb-4">Plan de Gobierno</h2>
            <p className="text-sm text-[#777777] mb-4">
              Ejes estratégicos del plan de gobierno según JNE.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ejes.map((eje, i) => (
                <div key={i} className="bg-[#F7F6F3] border border-[#E5E3DE] rounded-xl p-4">
                  <h3 className="font-semibold text-[#111111] text-sm mb-2">{eje.eje}</h3>
                  <p className="text-[#4B5563] text-xs leading-relaxed">{eje.descripcion}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Propuestas clave */}
        {proposals.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-[#111111] mb-4">Propuestas clave</h2>
            <ol className="space-y-3">
              {proposals.map((proposal, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1A56A0] text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-[#222222] text-sm leading-relaxed">{proposal}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Posiciones por tema — visual bars */}
        <section>
          <h2 className="text-xl font-bold text-[#111111] mb-4">Posiciones por tema</h2>
          {positionEntry ? (
            <div className="space-y-3">
              {Object.entries(positionEntry.positions).map(([key, pos]) => (
                <div key={key} className="bg-white border border-[#E5E3DE] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#111111]">
                      {POSITION_LABELS[key] ?? key}
                    </span>
                    <span className="text-xs text-[#777777]">{pos.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-[#EEEDE9] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#1A56A0] transition-all"
                        style={{ width: `${(pos.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#1A56A0] w-6 text-right">{pos.score}/5</span>
                  </div>
                  {!pos.verified && (
                    <p className="text-[10px] text-[#CBCAC5] mt-1">Sin verificar</p>
                  )}
                </div>
              ))}
            </div>
          ) : positionsDB.length > 0 ? (
            <div className="space-y-3">
              {positionsDB.map((pos) => (
                <div key={pos.issue_key} className="bg-white border border-[#E5E3DE] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#111111]">
                      {POSITION_LABELS[pos.issue_key] ?? pos.issue_key}
                    </span>
                    <span className="text-xs text-[#777777]">{pos.position_label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-[#EEEDE9] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#1A56A0] transition-all"
                        style={{ width: `${(pos.position_score / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#1A56A0] w-6 text-right">{pos.position_score}/5</span>
                  </div>
                  {pos.source && (
                    <p className="text-[10px] text-[#CBCAC5] mt-1">Fuente: {pos.source}</p>
                  )}
                </div>
              ))}
            </div>
          ) : positions.length > 0 ? (
            <CandidatePositions positions={positions} />
          ) : (
            <div className="text-[#777777] text-center py-8">
              No hay posiciones registradas para este candidato.
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#111111] mb-4">Verificaciones</h2>
          <CandidateFactChecks factChecks={factChecks} />
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#111111] mb-4">Noticias recientes</h2>
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
            Enviar información verificada
          </a>
        </div>

        {/* Data source transparency */}
        <div className="border border-[#E5E3DE] rounded-xl p-4 bg-white">
          <p className="text-[10px] text-[#CBCAC5]">
            Datos provenientes de: JNE (Jurado Nacional de Elecciones), Infogob, ONPE.
            {hojaDeVida?.fetched_at && ` Última actualización: ${hojaDeVida.fetched_at.slice(0, 10)}.`}
            {' '}Todos los datos son públicos y verificables.
            <Link href="/datos" className="text-[#1A56A0] hover:underline ml-1">Ver fuentes completas</Link>
          </p>
        </div>

        {/* Similar position candidates */}
        {similarCandidates.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-[#111111] mb-4">Candidatos con posiciones similares</h2>
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
            <h2 className="text-xl font-bold text-[#111111] mb-4">Candidatos del mismo partido</h2>
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
