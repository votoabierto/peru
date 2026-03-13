import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getHojaDeVida, getAntecedentes, getBienes } from '@/lib/data'
import FeedbackWidget from '@/components/FeedbackWidget'
import DataConfidenceBadge from '@/components/DataConfidenceBadge'
import andinoCandidates from '@/data/andino-candidates.json'
import type { Metadata } from 'next'

interface AndinoCandidate {
  id: string
  name: string
  party: string
  partyId: string
  electionType: string
  listPosition: number
  imageUrl: string | null
  sourceUrl: string
  data_confidence?: 'official' | 'scraped' | 'community' | 'pending'
}

const candidates = andinoCandidates as AndinoCandidate[]

function formatPEN(n: number | null | undefined): string {
  if (!n) return 'Sin datos registrados'
  if (n >= 1_000_000) return `S/ ${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `S/ ${(n / 1_000).toFixed(0)}K`
  return `S/ ${n.toLocaleString()}`
}

interface Props {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-static'
export const revalidate = 86400
export const dynamicParams = true

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const c = candidates.find((x) => x.id === id)
  if (!c) return { title: 'Candidato no encontrado — VotoAbierto' }
  return {
    title: `${c.name} — Parlamento Andino 2026 | VotoAbierto`,
    description: `Conoce la hoja de vida, antecedentes y bienes declarados de ${c.name}, candidato al Parlamento Andino por ${c.party}. Elecciones Perú 2026.`,
    openGraph: {
      title: `${c.name} — Parlamento Andino 2026 | VotoAbierto`,
      description: `Candidato al Parlamento Andino por ${c.party}. #${c.listPosition} en lista.`,
      url: `https://votoabierto.pe/parlamento-andino/${c.id}`,
    },
    alternates: { canonical: `https://votoabierto.pe/parlamento-andino/${c.id}` },
  }
}

export default async function AndinoCandidatePage({ params }: Props) {
  const { id } = await params
  const c = candidates.find((x) => x.id === id)
  if (!c) notFound()

  const [hojaDeVida, antecedentes, bienes] = await Promise.all([
    getHojaDeVida(c.id),
    getAntecedentes(c.id),
    getBienes(c.id),
  ])

  const initials = c.name.split(' ').slice(0, 2).map((w) => w[0]).join('')

  return (
    <main className="min-h-screen bg-white">
      {/* Back link */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <Link href="/parlamento-andino" className="text-sm text-[#1A56A0] hover:underline">
          &larr; Volver al Parlamento Andino
        </Link>
      </div>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-5">
          {c.imageUrl ? (
            <Image src={c.imageUrl} alt={c.name} width={80} height={80} className="w-20 h-20 rounded-full object-cover border-2 border-[#E5E3DE]" sizes="80px" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#F7F6F3] border-2 border-[#E5E3DE] flex items-center justify-center">
              <span className="text-2xl font-bold text-[#777777]">{initials}</span>
            </div>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111]">{c.name}</h1>
            <p className="text-[#555555] mt-1">{c.party}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#F0F4FA] text-[#1A56A0] font-medium">#{c.listPosition} en lista</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#EEEDE9] text-[#555555] font-medium">Parlamento Andino</span>
              <DataConfidenceBadge confidence={c.data_confidence ?? 'scraped'} source="JNE ListaCandidatos API" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-10 space-y-12">
        {/* Info callout */}
        <div className="bg-[#F0F4FA] border border-[#C7D7F4] rounded-xl p-4">
          <p className="text-sm text-[#1A56A0]">
            El Parlamento Andino es el órgano legislativo de la Comunidad Andina (CAN). Perú elige 5 representantes.
          </p>
        </div>

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
            </div>
          ) : (
            <div className="text-[#777777] text-sm py-4 px-4 bg-[#F7F6F3] border border-[#E5E3DE] rounded-lg">
              Próximamente — Estamos recopilando la hoja de vida de este candidato.
            </div>
          )}

          {hojaDeVida?.work_history && hojaDeVida.work_history.length > 0 && (
            <div className="mb-6 mt-6">
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
            </div>
          )}
        </section>

        {/* Antecedentes */}
        <section>
          <h2 className="text-xl font-bold text-[#111111] mb-4 flex items-center justify-between">
            <span>Antecedentes penales</span>
            <span className="text-[10px] font-normal text-[#CBCAC5]">Fuente: JNE</span>
          </h2>
          {antecedentes.length > 0 ? (
            <div className="space-y-3">
              {antecedentes.map((ant, i) => (
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
          ) : (
            <div className="text-[#777777] text-sm py-4 px-4 bg-[#F7F6F3] border border-[#E5E3DE] rounded-lg">
              Próximamente — Estamos recopilando los antecedentes de este candidato.
            </div>
          )}
        </section>

        {/* Bienes Declarados */}
        <section>
          <h2 className="text-xl font-bold text-[#111111] mb-4 flex items-center justify-between">
            <span>Bienes declarados</span>
            <span className="text-[10px] font-normal text-[#CBCAC5]">Fuente: JNE</span>
          </h2>
          {bienes && (bienes.total_bienes_pen || bienes.total_ingresos_anuales_pen) ? (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {bienes.total_bienes_pen != null && (
                  <div className="bg-[#F7F6F3] border border-[#E5E3DE] rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-[#1A56A0]">{formatPEN(bienes.total_bienes_pen)}</p>
                    <p className="text-xs text-[#777777] mt-1">Total bienes</p>
                  </div>
                )}
                {bienes.total_ingresos_anuales_pen != null && (
                  <div className="bg-[#F7F6F3] border border-[#E5E3DE] rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-[#1A56A0]">{formatPEN(bienes.total_ingresos_anuales_pen)}</p>
                    <p className="text-xs text-[#777777] mt-1">Ingresos anuales</p>
                  </div>
                )}
                {bienes.total_deudas_pen != null && (
                  <div className="bg-[#F7F6F3] border border-[#E5E3DE] rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-[#9B1C1C]">{formatPEN(bienes.total_deudas_pen)}</p>
                    <p className="text-xs text-[#777777] mt-1">Deudas</p>
                  </div>
                )}
              </div>
              {bienes.bienes_inmuebles && bienes.bienes_inmuebles.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-[#111111] mb-2">Bienes inmuebles</h3>
                  <div className="space-y-2">
                    {bienes.bienes_inmuebles.map((b, i) => (
                      <div key={i} className="flex items-center justify-between text-sm text-[#4B5563] bg-white border border-[#E5E3DE] rounded-lg px-3 py-2">
                        <span>{b.descripcion}</span>
                        <span className="font-medium">{formatPEN(b.valor_pen)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-[10px] text-[#CBCAC5] mt-2">Declaración {bienes.declaration_year || '2025'}</p>
            </div>
          ) : (
            <div className="text-[#777777] text-sm py-4 px-4 bg-[#F7F6F3] border border-[#E5E3DE] rounded-lg">
              Próximamente — Estamos recopilando los bienes declarados de este candidato.
            </div>
          )}
        </section>

        {/* Source badge */}
        <div className="border border-[#E5E3DE] rounded-xl p-4 bg-white">
          <p className="text-[10px] text-[#CBCAC5]">
            Datos provenientes de: JNE (Jurado Nacional de Elecciones).{' '}
            Todos los datos son públicos y verificables.{' '}
            <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[#1A56A0] hover:underline">
              Ver en JNE &rarr;
            </a>
          </p>
        </div>

        <FeedbackWidget pageUrl={`/parlamento-andino/${c.id}`} />
      </div>
    </main>
  )
}
