import Link from 'next/link'
import CountdownTimer from '@/components/CountdownTimer'
import FactCheckBadge from '@/components/FactCheckBadge'
import { ISSUE_LABELS, type IssueArea } from '@/lib/types'
import { getCandidates, getFactChecks } from '@/lib/data'

const FEATURES = [
  {
    icon: '🗳️',
    title: 'Candidatos',
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
    title: 'Compara',
    description:
      'Compara hasta 3 candidatos lado a lado por posición en temas clave.',
    href: '/comparar',
    cta: 'Comparar',
  },
  {
    icon: '🔍',
    title: 'Verifica',
    description:
      'Fact-checks independientes de las declaraciones más importantes de campaña.',
    href: '/verificar',
    cta: 'Ver verificaciones',
  },
]

const STATS = [
  { value: '35+', label: 'Candidatos presidenciales' },
  { value: '25', label: 'Regiones' },
  { value: '60', label: 'Senadores a elegir' },
  { value: '130', label: 'Diputados a elegir' },
]

const ISSUE_AREAS = Object.keys(ISSUE_LABELS) as IssueArea[]

export default async function HomePage() {
  const [candidates, factChecks] = await Promise.all([
    getCandidates(),
    getFactChecks(),
  ])
  const latestFactChecks = factChecks.slice(0, 3)

  return (
    <div className="bg-votoclaro-base">
      {/* Hero */}
      <section className="relative py-20 sm:py-28 border-b border-votoclaro-border overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-votoclaro-gold/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl">
            <p className="text-votoclaro-gold text-sm font-semibold uppercase tracking-widest mb-4">
              Elecciones Generales · Perú 2026
            </p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-votoclaro-text mb-6 leading-tight">
              Vota{' '}
              <span className="text-votoclaro-gold">informado.</span>
            </h1>
            <p className="text-lg sm:text-xl text-votoclaro-text-muted leading-relaxed mb-8 max-w-2xl">
              El 12 de abril de 2026 los peruanos elegirán presidente, vicepresidentes y,
              por primera vez desde 1992, un Congreso bicameral con{' '}
              <strong className="text-votoclaro-text">60 senadores</strong> y{' '}
              <strong className="text-votoclaro-text">130 diputados</strong>.
              VotoClaro te ayuda a conocer a los candidatos y sus propuestas.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/candidatos" className="btn-primary">
                Ver candidatos
              </Link>
              <Link href="/comparar" className="btn-outline">
                Comparar candidatos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown */}
      <section className="py-12 border-b border-votoclaro-border bg-votoclaro-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CountdownTimer />
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-8 border-b border-votoclaro-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-extrabold text-votoclaro-gold">{stat.value}</p>
                <p className="text-xs text-votoclaro-text-muted mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="py-16 border-b border-votoclaro-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title mb-2">
            Explora <span className="text-votoclaro-gold">VotoClaro</span>
          </h2>
          <p className="text-votoclaro-text-muted mb-8">
            Todo lo que necesitas para votar con información.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((feature) => (
              <Link key={feature.href} href={feature.href} className="group">
                <div className="card h-full flex flex-col group-hover:border-votoclaro-gold/60 transition-all duration-200">
                  <span className="text-3xl mb-3">{feature.icon}</span>
                  <h3 className="text-base font-semibold text-votoclaro-text mb-2 group-hover:text-votoclaro-gold transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-votoclaro-text-muted leading-relaxed flex-1">
                    {feature.description}
                  </p>
                  <span className="mt-4 text-sm font-medium text-votoclaro-gold">
                    {feature.cta} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Issue selector */}
      <section className="py-16 border-b border-votoclaro-border bg-votoclaro-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title mb-2">¿Sobre qué te importa más?</h2>
          <p className="text-votoclaro-text-muted mb-8">
            Selecciona un tema para ver las posiciones de los candidatos.
          </p>
          <div className="flex flex-wrap gap-3">
            {ISSUE_AREAS.map((area) => {
              const info = ISSUE_LABELS[area]
              return (
                <Link
                  key={area}
                  href={`/candidatos?issue=${area}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-votoclaro-surface-2 border border-votoclaro-border rounded-full text-sm font-medium text-votoclaro-text-muted hover:border-votoclaro-gold hover:text-votoclaro-gold transition-colors"
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

      {/* Latest fact checks */}
      <section className="py-16 border-b border-votoclaro-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title mb-1">Últimas verificaciones</h2>
              <p className="text-votoclaro-text-muted text-sm">
                Fact-checks de las declaraciones más recientes.
              </p>
            </div>
            <Link
              href="/verificar"
              className="text-sm font-medium text-votoclaro-gold hover:underline"
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
                    <p className="text-xs font-semibold text-votoclaro-gold">
                      {candidate.common_name ?? candidate.full_name} ·{' '}
                      {candidate.party_abbreviation}
                    </p>
                  )}
                  <p className="text-sm text-votoclaro-text leading-relaxed line-clamp-3">
                    &ldquo;{fc.claim}&rdquo;
                  </p>
                  <div className="mt-auto pt-2">
                    <FactCheckBadge verdict={fc.verdict} size="sm" />
                  </div>
                  <p className="text-xs text-votoclaro-text-muted line-clamp-2">
                    {fc.explanation}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-votoclaro-text mb-3">
            Tu voto vale.{' '}
            <span className="text-votoclaro-gold">Úsalo bien.</span>
          </h2>
          <p className="text-votoclaro-text-muted mb-8 max-w-xl mx-auto">
            Plataforma no-partidaria. No apoyamos a ningún candidato. Solo
            información verificada para el ciudadano peruano.
          </p>
          <Link href="/candidatos" className="btn-primary">
            Conoce a los candidatos
          </Link>
        </div>
      </section>
    </div>
  )
}
