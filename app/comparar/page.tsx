import CompararClient from '@/components/CompararClient'
import { getCandidates, getPositions } from '@/lib/data'

export default async function CompararPage() {
  const [allCandidates, allPositions] = await Promise.all([
    getCandidates(),
    getPositions(),
  ])

  return (
    <div className="bg-votoclaro-base min-h-screen">
      {/* Header */}
      <section className="border-b border-votoclaro-border py-10 bg-votoclaro-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="label mb-2">Herramienta de comparación</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-votoclaro-text mb-2">
            Comparar candidatos
          </h1>
          <p className="text-votoclaro-text-muted">
            Selecciona hasta 3 candidatos para comparar sus perfiles y posiciones lado a lado.
          </p>
        </div>
      </section>

      <CompararClient allCandidates={allCandidates} allPositions={allPositions} />
    </div>
  )
}
