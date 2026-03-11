import Link from 'next/link'
import { REGIONS_DATA } from '@/lib/regions-data'

function formatPopulation(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M hab.`
  if (n >= 1_000) return `${Math.round(n / 1_000)}K hab.`
  return `${n.toLocaleString('es-PE')} hab.`
}

export default function RegionesPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Page header */}
      <section className="border-b border-[#E5E3DE] py-10 bg-[#F7F6F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="label mb-2">Elecciones Perú 2026</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111] mb-2">
            Regiones
          </h1>
          <p className="text-[#777777] max-w-2xl">
            El Perú tiene <strong className="text-[#111111]">25 regiones</strong> y{' '}
            <strong className="text-[#111111]">27 distritos electorales</strong> (Lima
            Metropolitana, Lima Provincias y Callao son distritos separados). Explora los
            temas más importantes por región.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-[#E5E3DE] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-6 text-center max-w-md">
            <div>
              <p className="text-2xl font-extrabold text-[#1A56A0]">25</p>
              <p className="text-xs text-[#777777] mt-1">Regiones</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#1A56A0]">130</p>
              <p className="text-xs text-[#777777] mt-1">Escaños en Congreso</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#1A56A0]">33M</p>
              <p className="text-xs text-[#777777] mt-1">Electores aprox.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Regions grid */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {REGIONS_DATA.map((region) => {
              const href = `/regiones/${region.code.toLowerCase()}`
              return (
                <Link key={region.code} href={href} className="block group">
                  <div className="card group-hover:border-[#1A56A0]/60 transition-all duration-200 h-full flex flex-col">
                    {/* Header: code chip + congressional seats */}
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs font-bold text-[#1A56A0] bg-[#EEF4FF] border border-[#1A56A0]/30 rounded px-2 py-0.5 uppercase tracking-widest">
                        {region.code}
                      </span>
                      <span className="text-xs text-[#777777] bg-[#EEEDE9] border border-[#E5E3DE] rounded px-2 py-0.5">
                        🏛️ {region.congressional_seats} escaño{region.congressional_seats > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Region name */}
                    <h3 className="text-base font-semibold text-[#111111] group-hover:text-[#1A56A0] transition-colors mb-1">
                      {region.name}
                    </h3>

                    {/* Population */}
                    <p className="text-xs text-[#777777] mb-3">
                      {formatPopulation(region.population)}
                    </p>

                    {/* Main industries (first 2) */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {region.main_industries.slice(0, 2).map(ind => (
                        <span
                          key={ind}
                          className="inline-flex items-center text-xs bg-[#EEF4FF] border border-[#1A56A0]/20 rounded-full px-2.5 py-1 text-[#1A56A0] capitalize"
                        >
                          {ind}
                        </span>
                      ))}
                    </div>

                    {/* Key issues */}
                    <div className="mt-auto">
                      <p className="text-xs text-[#777777] mb-2">Temas clave</p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {region.key_issues.slice(0, 3).map(issue => (
                          <span
                            key={issue}
                            className="inline-flex items-center text-xs bg-[#EEEDE9] border border-[#E5E3DE] rounded-full px-2.5 py-1 text-[#777777]"
                          >
                            {issue}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="mt-2 text-xs text-[#1A56A0] group-hover:underline">
                      Ver región →
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
