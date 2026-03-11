import CandidatosList from '@/components/CandidatosList'
import { getCandidates } from '@/lib/data'

export default async function CandidatosPage() {
  const candidates = await getCandidates()

  return (
    <div className="bg-votoclaro-base min-h-screen">
      {/* Page header */}
      <section className="border-b border-votoclaro-border py-10 bg-votoclaro-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="label mb-2">Elecciones Perú 2026</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-votoclaro-text mb-2">
            Candidatos
          </h1>
          <p className="text-votoclaro-text-muted">
            Conoce a los principales candidatos presidenciales y al congreso.
          </p>
        </div>
      </section>

      <CandidatosList initialCandidates={candidates} />
    </div>
  )
}
