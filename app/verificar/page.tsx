import VerificarClient from '@/components/VerificarClient'
import { getFactChecks, getCandidates } from '@/lib/data'

export default async function VerificarPage() {
  const [factChecks, candidates] = await Promise.all([
    getFactChecks(),
    getCandidates(),
  ])

  return (
    <div className="bg-votoclaro-base min-h-screen">
      {/* Header */}
      <section className="border-b border-votoclaro-border py-10 bg-votoclaro-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="label mb-2">Verificación de hechos</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-votoclaro-text mb-2">
            Verificar
          </h1>
          <p className="text-votoclaro-text-muted max-w-2xl">
            Fact-checks independientes de las declaraciones más importantes de la campaña
            electoral 2026. Revisamos las afirmaciones de los candidatos con fuentes
            verificables.
          </p>
        </div>
      </section>

      <VerificarClient factChecks={factChecks} candidates={candidates} />
    </div>
  )
}
