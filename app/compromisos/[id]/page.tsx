import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import pledgesData from '@/data/pledges.json'
import candidatesData from '@/data/candidates.json'
import { Pledge, Candidate, PLEDGE_CATEGORY_LABELS, PLEDGE_STATUS_LABELS, PledgeStatus } from '@/lib/types'

const pledges = pledgesData as unknown as Pledge[]
const candidates = candidatesData as unknown as Candidate[]

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const pledge = pledges.find((p) => p.id === id)
  if (!pledge) return { title: 'Compromiso no encontrado — VotoAbierto' }
  return {
    title: `${pledge.title} — Compromisos Ciudadanos | VotoAbierto`,
    description: pledge.description,
  }
}

export async function generateStaticParams() {
  return pledges.map((p) => ({ id: p.id }))
}

const STATUS_ORDER: PledgeStatus[] = ['committed', 'declined', 'no_response']

export default async function PledgeDetailPage({ params }: Props) {
  const { id } = await params
  const pledge = pledges.find((p) => p.id === id)
  if (!pledge) notFound()

  const catMeta = PLEDGE_CATEGORY_LABELS[pledge.category]

  // Build candidate cards with response status, sorted by status priority
  const candidateCards = candidates
    .map((c) => {
      const response = pledge.responses[c.id]
      return {
        candidate: c,
        status: (response?.status ?? 'no_response') as PledgeStatus,
        statement: response?.statement ?? null,
        responded_at: response?.responded_at ?? null,
      }
    })
    .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status))

  const counts = {
    committed: candidateCards.filter((c) => c.status === 'committed').length,
    declined: candidateCards.filter((c) => c.status === 'declined').length,
    no_response: candidateCards.filter((c) => c.status === 'no_response').length,
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-[#777777] mb-6">
          <Link href="/compromisos" className="hover:text-[#1A56A0]">Compromisos</Link>
          <span className="mx-2">/</span>
          <span className="text-[#111111]">{pledge.title}</span>
        </nav>

        {/* Pledge header */}
        <div className="mb-8">
          <div className="flex items-start gap-3 mb-3">
            <h1 className="text-2xl font-bold text-[#111111]">{pledge.title}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium whitespace-nowrap mt-1 ${catMeta.color}`}>
              {catMeta.label}
            </span>
          </div>
          <p className="text-[#555555] mb-4 max-w-3xl">{pledge.description}</p>
          <div className="flex items-center gap-4 text-xs text-[#777777]">
            <span>Propuesto por: {pledge.proposed_by}</span>
            <span>{pledge.proposed_at}</span>
            {pledge.source_org && <span>Org: {pledge.source_org}</span>}
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{counts.committed}</p>
            <p className="text-xs text-green-600 mt-1">Comprometidos</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-700">{counts.declined}</p>
            <p className="text-xs text-red-600 mt-1">Rechazados</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-600">{counts.no_response}</p>
            <p className="text-xs text-gray-500 mt-1">Sin respuesta</p>
          </div>
        </div>

        {/* Candidate response grid */}
        <h2 className="text-xl font-bold text-[#111111] mb-4">Respuestas de candidatos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidateCards.map(({ candidate, status, statement }) => {
            const statusMeta = PLEDGE_STATUS_LABELS[status]
            return (
              <div
                key={candidate.id}
                className="border border-[#E5E3DE] rounded-xl p-4 bg-white hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3 mb-2">
                  {candidate.photo_url ? (
                    <img
                      src={candidate.photo_url}
                      alt={candidate.full_name}
                      className="w-10 h-10 rounded-full object-cover border border-[#E5E3DE]"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#F7F6F3] border border-[#E5E3DE] flex items-center justify-center text-[#777777] text-sm font-bold">
                      {candidate.full_name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/candidatos/${candidate.slug ?? candidate.id}`}
                      className="text-sm font-semibold text-[#111111] hover:text-[#1A56A0] truncate block"
                    >
                      {candidate.common_name ?? candidate.full_name}
                    </Link>
                    <p className="text-xs text-[#777777] truncate">{candidate.party_name}</p>
                  </div>
                </div>
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full border font-medium ${statusMeta.color}`}>
                  {statusMeta.label}
                </span>
                {statement && (
                  <p className="text-xs text-[#555555] mt-2 italic">&ldquo;{statement}&rdquo;</p>
                )}
              </div>
            )
          })}
        </div>

        {/* Back link */}
        <div className="mt-10 text-center">
          <Link href="/compromisos" className="text-sm text-[#1A56A0] hover:underline">
            &larr; Ver todos los compromisos
          </Link>
        </div>
      </div>
    </main>
  )
}
