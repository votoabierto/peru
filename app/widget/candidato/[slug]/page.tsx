import candidatesJson from '@/data/candidates.json'
import candidatePositionsData from '@/data/candidate-positions.json'
import type { Metadata } from 'next'

type CandidateData = {
  slug: string
  full_name: string
  party_name: string
  party_abbreviation: string
  planGobiernoEjes?: { eje: string; descripcion: string }[]
}

type CandidatePositionEntry = {
  candidate_id: string
  positions: Record<string, { score: number | null; label: string; verified: boolean }>
}

const candidates = candidatesJson as CandidateData[]
const positionsMatrix = candidatePositionsData as CandidatePositionEntry[]

export async function generateStaticParams() {
  return candidates.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const candidate = candidates.find((c) => c.slug === slug)
  return {
    title: candidate ? `${candidate.full_name} — VotoAbierto Widget` : 'VotoAbierto Widget',
  }
}

export default async function WidgetCandidatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const candidate = candidates.find((c) => c.slug === slug)

  if (!candidate) {
    return (
      <div className="p-6 text-center text-[#777777]">Candidato no encontrado</div>
    )
  }

  const initials = candidate.full_name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')

  const ejes = (candidate.planGobiernoEjes ?? []).slice(0, 3)
  const posEntry = positionsMatrix.find((cp) => cp.candidate_id === candidate.slug)
  const topPositions = posEntry
    ? Object.entries(posEntry.positions)
        .filter(([, p]) => p.score !== null && p.verified)
        .slice(0, 3)
    : []

  return (
    <div className="bg-white font-sans max-w-[400px] mx-auto">
      <style>{`body { margin: 0; font-family: 'Noto Sans', system-ui, sans-serif; }`}</style>

      {/* Header bar */}
      <div className="h-1 bg-[#1A56A0]" />

      <div className="p-5">
        {/* Profile */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-[#1A56A0] flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
            {initials}
          </div>
          <div>
            <h2 className="text-base font-bold text-[#111111] leading-tight">{candidate.full_name}</h2>
            <p className="text-xs text-[#777777]">{candidate.party_name}</p>
            <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold text-[#1A56A0] bg-[#EEF4FF] border border-[#1A56A0] rounded-full">
              {candidate.party_abbreviation}
            </span>
          </div>
        </div>

        {/* Ejes */}
        {ejes.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-[#777777] uppercase tracking-wide mb-2">Ejes principales</h3>
            <div className="space-y-2">
              {ejes.map((eje, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1A56A0] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-[#111111]">{eje.eje}</p>
                    <p className="text-[11px] text-[#444444] leading-snug">
                      {eje.descripcion.slice(0, 80)}{eje.descripcion.length > 80 ? '...' : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Positions */}
        {topPositions.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-[#777777] uppercase tracking-wide mb-2">Posiciones clave</h3>
            <div className="space-y-1.5">
              {topPositions.map(([key, pos]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[#EEEDE9] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#1A56A0]" style={{ width: `${((pos.score ?? 0) / 5) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-[#777777] w-20 text-right truncate">{pos.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <a
          href={`https://votoabierto.pe/candidatos/${candidate.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center px-4 py-2 bg-[#1A56A0] text-white text-xs font-medium rounded-lg hover:bg-[#164A8A] transition-colors"
        >
          Ver perfil completo en VotoAbierto
        </a>

        <p className="text-center text-[9px] text-[#CBCAC5] mt-3">
          Datos: JNE | votoabierto.pe
        </p>
      </div>
    </div>
  )
}
