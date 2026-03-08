import RegionCard from '@/components/RegionCard'
import { PERU_REGIONS } from '@/lib/regions-data'

export default function RegionesPage() {
  return (
    <div className="bg-votoclaro-base min-h-screen">
      {/* Page header */}
      <section className="border-b border-votoclaro-border py-10 bg-votoclaro-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="label mb-2">Elecciones Perú 2026</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-votoclaro-text mb-2">
            Regiones
          </h1>
          <p className="text-votoclaro-text-muted max-w-2xl">
            El Perú tiene <strong className="text-votoclaro-text">24 regiones</strong> y{' '}
            <strong className="text-votoclaro-text">27 distritos electorales</strong> (Lima
            Metropolitana, Lima Provincias y Callao son distritos separados). Explora los
            temas más importantes por región.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-votoclaro-border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-6 text-center max-w-md">
            <div>
              <p className="text-2xl font-extrabold text-votoclaro-gold">24</p>
              <p className="text-xs text-votoclaro-text-muted mt-1">Regiones</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-votoclaro-gold">27</p>
              <p className="text-xs text-votoclaro-text-muted mt-1">Distritos electorales</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-votoclaro-gold">33M</p>
              <p className="text-xs text-votoclaro-text-muted mt-1">Electores aprox.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Regions grid */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {PERU_REGIONS.map((region) => (
              <RegionCard
                key={region.code}
                name={region.name}
                code={region.code}
                population={region.population}
                key_issues={region.key_issues}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
