import Link from 'next/link'
import CountdownTimer from '@/components/CountdownTimer'
import FactCheckBadge from '@/components/FactCheckBadge'
import { ISSUE_LABELS, type IssueArea } from '@/lib/types'
import { getCandidates, getFactChecks } from '@/lib/data'

const ELECTION_TYPES = [
  {
    icon: '🏛️',
    title: 'Presidente',
    description: '36 candidatos presidenciales compiten en distrito nacional único.',
    href: '/candidatos',
  },
  {
    icon: '🏦',
    title: 'Senado',
    description: '60 escaños en distrito nacional único. Bicameral restaurado desde 1992.',
    href: '/senado',
  },
  {
    icon: '🗳️',
    title: 'Diputados',
    description: '130 escaños en 27 circunscripciones regionales.',
    href: '/diputados',
  },
  {
    icon: '🌎',
    title: 'Parlamento Andino',
    description: '5 representantes ante la Comunidad Andina de Naciones.',
    href: '/parlamento-andino',
  },
]

const FEATURES = [
  {
    icon: '🗳️',
    title: 'Presidentes',
    description:
      'Conoce el perfil, trayectoria y propuestas de los candidatos a la presidencia y el congreso.',
    href: '/candidatos',
    cta: 'Ver candidatos',
  },
  {
    icon: '📍',
    title: 'Por Región',
    description:
      'Explora los candidatos y temas más importantes de las 25 regiones del Perú.',
    href: '/regiones',
    cta: 'Ver regiones',
  },
  {
    icon: '⚖️',
    title: '¿A quién vas a comparar?',
    description:
      'Compara hasta 3 candidatos lado a lado por posición en temas clave.',
    href: '/comparar',
    cta: 'Comparar',
  },
  {
    icon: '🔍',
    title: 'Verificación de hechos',
    description:
      'Fact-checks independientes de las declaraciones más importantes de campaña.',
    href: '/verificar',
    cta: 'Ver verificaciones',
  },
]

const STATS = [
  { value: '36', label: 'Candidatos presidenciales' },
  { value: '60', label: 'Senadores a elegir' },
  { value: '130', label: 'Diputados a elegir' },
  { value: '5', label: 'Parlamento Andino' },
]

const ISSUE_AREAS = Object.keys(ISSUE_LABELS) as IssueArea[]

function SectionDivider() {
  return (
    <div className="flex items-center gap-3 my-0">
      <div className="h-px bg-[#E5E3DE] flex-1" />
      <div className="w-8 h-1 bg-[#D91023] rounded-full" />
      <div className="h-px bg-[#E5E3DE] flex-1" />
    </div>
  )
}

export default async function HomePage() {
  const [candidates, factChecks] = await Promise.all([
    getCandidates(),
    getFactChecks(),
  ])
  const latestFactChecks = factChecks.slice(0, 3)

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="border-t-4 border-[#D91023] bg-white pt-12 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Eyebrow tag */}
          <div className="inline-flex items-center gap-2 bg-[#FFF0F0] border border-[#D91023] rounded-full px-4 py-1 mb-6">
            <span className="text-[#D91023] text-xs font-bold uppercase tracking-widest">Elecciones Generales</span>
            <span className="text-[#D91023] font-mono text-xs font-bold">12 abril 2026</span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl md:text-5xl font-bold text-[#111111] leading-tight mb-4">
            Conoce a tus candidatos<br/>
            <span className="text-[#D91023]">antes del 12 de abril</span>
          </h1>

          <p className="text-[#555555] text-lg max-w-2xl mx-auto mb-8">
            36 candidatos presidenciales · 60 senadores · 130 diputados · 5 parlamentarios andinos.
            Datos verificados de fuentes oficiales. No te vendemos ningún candidato.
          </p>

          {/* Quiz CTA — primary action */}
          <Link href="/quiz" className="inline-flex items-center gap-2 bg-[#D91023] text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-[#B00D1C] transition-colors shadow-lg shadow-red-100">
            ¿Con quién votas? →
          </Link>
          <p className="text-[#888888] text-sm mt-3">Anónimo · 5 minutos · Sin registro</p>
        </div>
      </section>

      {/* Countdown */}
      <CountdownTimer />

      {/* Stats bar */}
      <section className="py-8 border-b border-[#E5E3DE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-extrabold text-[#111111] font-mono">{stat.value}</p>
                <p className="text-xs text-[#777777] mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Election type cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title mb-2">Elecciones 2026</h2>
          <p className="text-[#777777] mb-8">
            Cuatro elecciones simultáneas el 12 de abril de 2026.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ELECTION_TYPES.map((election) => (
              <Link key={election.href} href={election.href} className="group">
                <div className="card h-full flex flex-col transition-all duration-200">
                  <span className="text-3xl mb-3">{election.icon}</span>
                  <h3 className="text-base font-semibold text-[#111111] mb-2 group-hover:text-[#1A56A0] transition-colors">
                    {election.title}
                  </h3>
                  <p className="text-sm text-[#777777] leading-relaxed flex-1">
                    {election.description}
                  </p>
                  <span className="mt-4 text-sm font-medium text-[#1A56A0]">
                    Ver más →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Feature cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title mb-2">
            Explora <span className="text-[#D91023]">VotoAbierto</span>
          </h2>
          <p className="text-[#777777] mb-8">
            Vota informado. Perú merece más.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((feature) => (
              <Link key={feature.href} href={feature.href} className="group">
                <div className="card h-full flex flex-col transition-all duration-200">
                  <span className="text-3xl mb-3">{feature.icon}</span>
                  <h3 className="text-base font-semibold text-[#111111] mb-2 group-hover:text-[#1A56A0] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[#777777] leading-relaxed flex-1">
                    {feature.description}
                  </p>
                  <span className="mt-4 text-sm font-medium text-[#1A56A0]">
                    {feature.cta} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Issue selector */}
      <section className="py-16 bg-[#F7F6F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title mb-2">¿Sobre qué te importa más?</h2>
          <p className="text-[#777777] mb-8">
            Selecciona un tema para ver las posiciones de los candidatos.
          </p>
          <div className="flex flex-wrap gap-3">
            {ISSUE_AREAS.map((area) => {
              const info = ISSUE_LABELS[area]
              return (
                <Link
                  key={area}
                  href={`/candidatos?issue=${area}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#EEEDE9] border border-[#E5E3DE] rounded-full text-sm font-medium text-[#444444] hover:border-[#1A56A0] hover:text-[#1A56A0] transition-colors"
                >
                  <span role="img" aria-label={info.label}>
                    {info.icon}
                  </span>
                  {info.label}
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Latest fact checks */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title mb-1">Últimas verificaciones</h2>
              <p className="text-[#777777] text-sm">
                Fact-checks de las declaraciones más recientes.
              </p>
            </div>
            <Link
              href="/verificar"
              className="text-sm font-medium text-[#1A56A0] hover:underline"
            >
              Ver todas →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {latestFactChecks.map((fc) => {
              const candidate = candidates.find((c) => c.id === fc.candidate_id)
              return (
                <div key={fc.id} className="card flex flex-col gap-3">
                  {candidate && (
                    <p className="text-xs font-semibold text-[#1A56A0]">
                      {candidate.common_name ?? candidate.full_name} ·{' '}
                      {candidate.party_abbreviation}
                    </p>
                  )}
                  <p className="text-sm text-[#111111] leading-relaxed line-clamp-3">
                    &ldquo;{fc.claim}&rdquo;
                  </p>
                  <div className="mt-auto pt-2">
                    <FactCheckBadge verdict={fc.verdict} size="sm" />
                  </div>
                  <p className="text-xs text-[#777777] line-clamp-2">
                    {fc.explanation}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Quiz CTA Card */}
      <section className="py-16 bg-[#F7F6F3]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#EEF4FF] border border-[#1A56A0] rounded-xl p-6 text-center">
            <h2 className="text-xl font-bold text-[#111111]">¿Con quién votas?</h2>
            <p className="text-[#444444] mt-2">Responde 10 preguntas y descubre qué candidatos comparten tus ideas.</p>
            <Link href="/quiz" className="mt-4 inline-block bg-[#1A56A0] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0D3E7A] transition-colors">
              Comenzar el quiz
            </Link>
            <p className="text-xs text-[#777777] mt-2">Anónimo. Sin registro. Solo información.</p>
          </div>
        </div>
      </section>

      {/* Source trust bar */}
      <section className="py-6 bg-white border-t border-[#E5E3DE]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-[#777777]">
            Todos los datos provienen de{' '}
            <span className="font-semibold text-[#444444]">JNE</span> ·{' '}
            <span className="font-semibold text-[#444444]">ONPE</span> ·{' '}
            <span className="font-semibold text-[#444444]">Infogob</span>
            {' '}— Fuentes oficiales del Estado peruano.
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 border-t-2 border-[#D91023]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-[#111111] mb-3">
            Tu voto vale.{' '}
            <span className="text-[#D91023]">Úsalo bien.</span>
          </h2>
          <p className="text-[#777777] mb-8 max-w-xl mx-auto">
            VotoAbierto es una plataforma independiente y no partidaria. No tenemos afiliación
            política. Solo información verificada para el ciudadano peruano.
          </p>
          <Link href="/candidatos" className="btn-primary">
            Conoce a los candidatos
          </Link>
        </div>
      </section>
    </div>
  )
}
