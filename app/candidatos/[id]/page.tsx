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
  ExpandableBio,
} from '@/components/CandidateProfile'
import CandidateShareSection from '@/components/CandidateShareSection'
import CandidateNews from '@/components/CandidateNews'
import FeedbackWidget from '@/components/FeedbackWidget'
import DataFreshness from '@/components/DataFreshness'
import DataConfidenceBadge from '@/components/DataConfidenceBadge'
import { Metadata } from 'next'
import candidatePositionsData from '@/data/candidate-positions.json'
import pledgesData from '@/data/pledges.json'
import { Pledge, PLEDGE_CATEGORY_LABELS, PLEDGE_STATUS_LABELS } from '@/lib/types'

const allPledges = pledgesData as unknown as Pledge[]

type CandidatePositionEntry = {
  candidate_id: string
  candidate_name: string
  party: string
  party_abbreviation: string
  positions: Record<string, { score: number | null; label: string; verified: boolean }>
}

const positionsMatrix = candidatePositionsData as unknown as CandidatePositionEntry[]

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^#{1,3}\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
}

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
  if (!n) return 'Sin datos registrados'
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
  const slug = candidate.slug ?? candidate.id
  const description = `Conoce el plan de gobierno, propuestas y hoja de vida de ${candidate.full_name}, candidato/a a la presidencia del Perú en las elecciones del 12 de abril de 2026.`
  return {
    title: `${candidate.full_name} — Candidato 2026 | VotoAbierto`,
    description,
    keywords: [candidate.full_name, candidate.party_name, 'candidato 2026', 'elecciones Peru', 'plan de gobierno'],
    openGraph: {
      title: `${candidate.full_name} | VotoAbierto`,
      description: candidate.bio_short ?? `Candidato/a presidencial por ${candidate.party_name}`,
      url: `https://votoabierto.pe/candidatos/${slug}`,
      images: [`/api/og/candidato/${slug}`],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${candidate.full_name} — VotoAbierto`,
      description,
      images: [`/api/og/candidato/${slug}`],
    },
    alternates: { canonical: `https://votoabierto.pe/candidatos/${slug}` },
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
      if (val.score != null) currentScores[key] = val.score
    }
    similarCandidates = positionsMatrix
      .filter((cp) => cp.candidate_id !== candidate.id)
      .map((cp) => {
        const scores: Record<string, number> = {}
        for (const [key, val] of Object.entries(cp.positions)) {
          if (val.score != null) scores[key] = val.score
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

  // JNE sentencia penal data (from candidates.json)
  const sentenciaPenal = candidate.sentencia_penal ?? ''
  const sentenciaDetalle = candidate.sentencia_penal_detalle ?? []
  const hasSinAntecedentes = sentenciaPenal === 'SIN ANTECEDENTES PENALES'
  const jneProfileUrl = candidate.jne_profile_url ?? 'https://votoinformado.jne.gob.pe/presidente-vicepresidentes'

  // Bienes: prefer DB data, fallback to JNE API data in candidates.json
  const jneBienes = (candidate as unknown as Record<string, unknown>).jne_bienes as {
    total_bienes_pen?: number | null
    total_ingresos_anuales_pen?: number | null
    bienes_inmuebles?: Array<{ descripcion: string; valor_pen: number }>
    declaration_year?: string
    source?: string
  } | undefined
  const effectiveBienes = bienesDB ?? (jneBienes ? {
    total_bienes_pen: jneBienes.total_bienes_pen ?? null,
    total_ingresos_anuales_pen: jneBienes.total_ingresos_anuales_pen ?? null,
    total_deudas_pen: null,
    bienes_inmuebles: jneBienes.bienes_inmuebles ?? null,
    declaration_year: jneBienes.declaration_year ?? '2024',
  } : null)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: candidate.full_name,
    jobTitle: 'Candidato/a Presidencial',
    affiliation: {
      '@type': 'Organization',
      name: candidate.party_name,
    },
    description: candidate.bio_short ?? candidate.career_summary?.slice(0, 200) ?? '',
    url: `https://votoabierto.pe/candidatos/${slug}`,
    sameAs: [
      candidate.social_media?.twitter ? `https://twitter.com/${candidate.social_media.twitter}` : null,
      candidate.social_media?.instagram ? `https://instagram.com/${candidate.social_media.instagram}` : null,
      candidate.jne_profile_url,
    ].filter(Boolean),
    knowsAbout: ejes.map((e) => e.eje),
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://votoabierto.pe' },
      { '@type': 'ListItem', position: 2, name: 'Candidatos', item: 'https://votoabierto.pe/candidatos' },
      { '@type': 'ListItem', position: 3, name: candidate.full_name },
    ],
  }

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <CandidateHero candidate={candidate} />
      <CandidateStats candidate={candidate} />

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">
        <div className="flex items-center gap-3 mb-2">
          <DataConfidenceBadge
            confidence={candidate.data_confidence ?? 'pending'}
            source="JNE ListaCandidatos API"
            lastVerified={candidate.updated_at?.slice(0, 10)}
          />
          <DataFreshness
            fetchedAt={hojaDeVida?.fetched_at ?? candidate.updated_at}
            jneUrl={candidate.jne_profile_url}
          />
        </div>
        {bio && (
          <section>
            <h2 className="text-xl font-bold text-[#111111] mb-4 flex items-center gap-2">
              <span>Biografía</span>
            </h2>
            <ExpandableBio bio={bio} />
          </section>
        )}

        {/* Hoja de Vida */}
        <section>
          <h2 className="text-xl font-bold text-[#111111] mb-4 flex items-center justify-between">
            <span>Hoja de Vida</span>
            <span className="text-[10px] font-normal text-[#CBCAC5]">Fuente: JNE</span>
          </h2>

          {hojaDeVida?.education && hojaDeVida.education.length > 0 ? (
            <div className="mb-6">
              <h3 className="text-base font-semibold text-[#111111] mb-3">Formación académica</h3>
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
              <p className="text-[10px] text-[#CBCAC5] mt-2">Actualizado: {hojaDeVida?.fetched_at?.slice(0, 10)}</p>
            </div>
          ) : (
            <div className="mb-6">
              <a
                href={candidate.jne_profile_url ?? 'https://votoinformado.jne.gob.pe/presidente-vicepresidentes'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#1A56A0] border border-[#1A56A0] rounded-lg hover:bg-[#EEF4FF] transition-colors"
              >
                Ver hoja de vida completa en JNE &rarr;
              </a>
            </div>
          )}

          {/* JNE titulos académicos fallback */}
          {(!hojaDeVida?.education || hojaDeVida.education.length === 0) && candidate.jne_titulos_academicos && candidate.jne_titulos_academicos.length > 0 && (
            <div className="mb-6">
              <h3 className="text-base font-semibold text-[#111111] mb-3">Títulos académicos</h3>
              <ul className="space-y-2">
                {candidate.jne_titulos_academicos.map((t, i) => (
                  <li key={i} className="text-sm text-[#333333] flex gap-2 items-start">
                    <span className="text-[#1A56A0] mt-0.5">&#8226;</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[10px] text-[#CBCAC5] mt-2">Fuente: JNE — Hoja de Vida</p>
            </div>
          )}

          {/* JNE ocupación */}
          {candidate.jne_ocupacion && candidate.jne_ocupacion.length > 0 && (
            <div className="mb-6">
              <h3 className="text-base font-semibold text-[#111111] mb-2">Ocupación / Profesión</h3>
              <p className="text-sm text-[#333333]">{candidate.jne_ocupacion.join(', ')}</p>
            </div>
          )}

          {hojaDeVida?.work_history && hojaDeVida.work_history.length > 0 && (
            <div className="mb-6">
              <h3 className="text-base font-semibold text-[#111111] mb-3">Experiencia laboral</h3>
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
            </div>
          )}
        </section>

        {/* Antecedentes */}
        <section>
          <h2 className="text-xl font-bold text-[#111111] mb-4 flex items-center justify-between">
            <span>Antecedentes penales</span>
            <span className="text-[10px] font-normal text-[#CBCAC5]">Fuente: JNE</span>
          </h2>
          {sentenciaDetalle.length > 0 ? (
            <div className="space-y-3">
              {sentenciaDetalle.map((r, i) => (
                <div key={i} className="border border-[#E5E3DE] rounded-lg p-4 bg-[#FAFAFA]">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-medium text-[#111111] text-sm">{r.materia}</span>
                    {(() => {
                      const fallo = r.fallo ?? ''
                      const modalidad = r.modalidad ?? ''
                      if (['ABSUELTO', 'SOBRESEIDA', 'ANULADA'].some(k => fallo.includes(k))) {
                        return <span className="text-xs px-2 py-0.5 bg-[#F0F4FF] text-[#1A56A0] rounded-full border border-[#C7D7F4] whitespace-nowrap">{fallo}</span>
                      }
                      if (modalidad === 'EFECTIVA') {
                        return <span className="text-xs px-2 py-0.5 bg-[#FFF4F4] text-[#9B1C1C] rounded-full border border-[#FECACA] whitespace-nowrap">{fallo} ({modalidad})</span>
                      }
                      return <span className="text-xs px-2 py-0.5 bg-[#F7F6F3] text-[#555555] rounded-full border border-[#E5E3DE] whitespace-nowrap">{fallo}{modalidad ? ` (${modalidad})` : ''}</span>
                    })()}
                  </div>
                  <div className="text-xs text-[#777777] space-y-1">
                    <div>Expediente: {r.expediente} | {r.fuero}</div>
                    <div>Sentencia: {r.fecSentencia}{r.cumplimientoPena ? ` | Estado: ${r.cumplimientoPena}` : ''}</div>
                    {r.txComentario && (
                      <div className="text-[#555555] italic mt-1">&ldquo;{r.txComentario}&rdquo;</div>
                    )}
                  </div>
                </div>
              ))}
              <a
                href={jneProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#1A56A0] hover:underline"
              >
                Ver hoja de vida completa en JNE &rarr;
              </a>
            </div>
          ) : allAntecedentes.length > 0 ? (
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
          ) : hasSinAntecedentes ? (
            <div className="text-sm text-[#555555] flex items-center gap-2 py-4 px-4 bg-[#F7F6F3] border border-[#E5E3DE] rounded-lg">
              <span className="text-green-600">&#10003;</span>
              Sin antecedentes penales registrados en JNE
              <a href={jneProfileUrl} target="_blank" rel="noopener noreferrer" className="text-[#1A56A0] hover:underline text-xs ml-1">
                Verificar en JNE &rarr;
              </a>
            </div>
          ) : (
            <div className="text-[#777777] text-sm py-4 px-4 bg-[#F7F6F3] border border-[#E5E3DE] rounded-lg">
              <a
                href={jneProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1A56A0] hover:underline"
              >
                Ver antecedentes en JNE &rarr;
              </a>
            </div>
          )}
        </section>

        {/* Bienes Declarados */}
        <section>
          <h2 className="text-xl font-bold text-[#111111] mb-4 flex items-center justify-between">
            <span>Bienes declarados</span>
            <span className="text-[10px] font-normal text-[#CBCAC5]">Fuente: JNE</span>
          </h2>
        {effectiveBienes && (effectiveBienes.total_bienes_pen || effectiveBienes.total_ingresos_anuales_pen) ? (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {effectiveBienes.total_bienes_pen != null && (
                <div className="bg-[#F7F6F3] border border-[#E5E3DE] rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-[#1A56A0]">{formatPEN(effectiveBienes.total_bienes_pen)}</p>
                  <p className="text-xs text-[#777777] mt-1">Total bienes</p>
                </div>
              )}
              {effectiveBienes.total_ingresos_anuales_pen != null && (
                <div className="bg-[#F7F6F3] border border-[#E5E3DE] rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-[#1A56A0]">{formatPEN(effectiveBienes.total_ingresos_anuales_pen)}</p>
                  <p className="text-xs text-[#777777] mt-1">Ingresos anuales</p>
                </div>
              )}
              {effectiveBienes.total_deudas_pen != null && (
                <div className="bg-[#F7F6F3] border border-[#E5E3DE] rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-[#9B1C1C]">{formatPEN(effectiveBienes.total_deudas_pen)}</p>
                  <p className="text-xs text-[#777777] mt-1">Deudas</p>
                </div>
              )}
            </div>
            {effectiveBienes.bienes_inmuebles && effectiveBienes.bienes_inmuebles.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-[#111111] mb-2">Bienes inmuebles</h3>
                <div className="space-y-2">
                  {effectiveBienes.bienes_inmuebles.map((b, i) => (
                    <div key={i} className="flex items-center justify-between text-sm text-[#4B5563] bg-white border border-[#E5E3DE] rounded-lg px-3 py-2">
                      <span>{b.descripcion}</span>
                      <span className="font-medium">{formatPEN(b.valor_pen)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <p className="text-[10px] text-[#CBCAC5] mt-2">
              Declaración {effectiveBienes.declaration_year || '2025'}
            </p>
          </div>
        ) : (
          <div className="text-[#777777] text-sm py-4 text-center border border-dashed border-[#E5E3DE] rounded-lg">
            No hay datos de bienes declarados disponibles —{' '}
            <Link href={`/contribuir?candidato=${slug}`} className="text-[#1A56A0] hover:underline">Contribuir con información</Link>
          </div>
        )}
        </section>

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
        <section>
          <h2 className="text-xl font-bold text-[#111111] mb-4 flex items-center justify-between">
            <span>Plan de Gobierno</span>
            <span className="text-[10px] font-normal text-[#CBCAC5]">Fuente: JNE</span>
          </h2>
        {candidate.jne_url_plan && (
          <a
            href={candidate.jne_url_plan}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mb-4 text-sm text-[#1A56A0] hover:underline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            Descargar plan de gobierno completo (PDF &mdash; JNE)
          </a>
        )}
        {ejes.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ejes.map((eje, i) => (
                <div key={i} className="bg-[#F7F6F3] border border-[#E5E3DE] rounded-xl p-4">
                  <h3 className="font-semibold text-[#111111] text-sm mb-2">{eje.eje}</h3>
                  <p className="text-[#4B5563] text-xs leading-relaxed">{stripMarkdown(eje.descripcion)}</p>
                </div>
              ))}
            </div>
            {proposals.length > 0 && (
              <div className="mt-6">
                <h3 className="text-base font-semibold text-[#111111] mb-3">Propuestas clave</h3>
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
              </div>
            )}
          </div>
        ) : (
          <div className="text-[#777777] text-sm py-4 text-center border border-dashed border-[#E5E3DE] rounded-lg">
            No hay datos del plan de gobierno disponibles —{' '}
            <Link href={`/contribuir?candidato=${slug}`} className="text-[#1A56A0] hover:underline">Contribuir con información</Link>
          </div>
        )}
        </section>

        {/* Posiciones por tema — visual bars */}
        <section>
          <h2 className="text-xl font-bold text-[#111111] mb-4 flex items-center justify-between">
            <span>Posiciones por tema</span>
            <span className="text-[10px] font-normal text-[#CBCAC5]">Fuente: JNE Plan de Gobierno</span>
          </h2>
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
                        style={{ width: `${((pos.score ?? 0) / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#1A56A0] w-6 text-right">{pos.score ?? 0}/5</span>
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
            <div className="text-[#777777] text-sm py-4 text-center border border-dashed border-[#E5E3DE] rounded-lg">
              No hay datos de posiciones disponibles —{' '}
              <Link href={`/contribuir?candidato=${slug}`} className="text-[#1A56A0] hover:underline">Contribuir con información</Link>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#111111] mb-4">Verificaciones</h2>
          <CandidateFactChecks factChecks={factChecks} candidateSlug={slug} />
        </section>

        {/* Compromisos Ciudadanos */}
        {(() => {
          const candidatePledges = allPledges.filter((p) => {
            const r = p.responses[candidate.id]
            return r && (r.status === 'committed' || r.status === 'declined')
          })
          if (candidatePledges.length > 0) {
            return (
              <section>
                <h2 className="text-xl font-bold text-[#111111] mb-4">Compromisos Ciudadanos</h2>
                <div className="space-y-3">
                  {candidatePledges.map((pledge) => {
                    const response = pledge.responses[candidate.id]
                    const statusMeta = PLEDGE_STATUS_LABELS[response.status]
                    const catMeta = PLEDGE_CATEGORY_LABELS[pledge.category]
                    return (
                      <Link
                        key={pledge.id}
                        href={`/compromisos/${pledge.id}`}
                        className="block border border-[#E5E3DE] rounded-lg p-4 hover:shadow-sm transition-shadow bg-white"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-sm font-semibold text-[#111111]">{pledge.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium whitespace-nowrap ${statusMeta.color}`}>
                            {statusMeta.label}
                          </span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${catMeta.color}`}>
                          {catMeta.label}
                        </span>
                        {response.statement && (
                          <p className="text-xs text-[#555555] mt-2 italic">&ldquo;{response.statement}&rdquo;</p>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </section>
            )
          }
          return (
            <section>
              <h2 className="text-xl font-bold text-[#111111] mb-4">Compromisos Ciudadanos</h2>
              <div className="text-[#777777] text-sm py-4 text-center border border-dashed border-[#E5E3DE] rounded-lg">
                Ningún compromiso registrado —{' '}
                <Link href="/compromisos" className="text-[#1A56A0] hover:underline">ver todos los compromisos</Link>
              </div>
            </section>
          )
        })()}

        <section>
          <h2 className="text-xl font-bold text-[#111111] mb-4">Noticias recientes</h2>
          <CandidateNews slug={candidate.slug} />
        </section>

        <FeedbackWidget candidateSlug={slug} />

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

        <CandidateShareSection
          candidateName={candidate.full_name}
          candidateSlug={slug}
          partyName={candidate.party_name}
        />
      </div>
    </main>
  )
}
