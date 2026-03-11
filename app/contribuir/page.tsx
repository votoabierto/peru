'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'

const CONTRIBUTION_TYPES = [
  { value: 'fact_correction', icon: '📰', label: 'Corrección de datos', desc: 'Encontré información incorrecta sobre este candidato' },
  { value: 'new_proposal', icon: '📋', label: 'Propuesta o posición', desc: 'El candidato ha declarado su posición sobre un tema' },
  { value: 'criminal_record', icon: '⚖️', label: 'Antecedente legal', desc: 'Hay información sobre antecedentes judiciales' },
  { value: 'government_plan', icon: '📄', label: 'Plan de Gobierno', desc: 'Encontré su plan de gobierno oficial' },
  { value: 'social_media', icon: '📱', label: 'Redes Sociales', desc: 'Su perfil oficial en redes sociales' },
  { value: 'news_article', icon: '📰', label: 'Noticia relevante', desc: 'Artículo periodístico relevante' },
  { value: 'other', icon: '💬', label: 'Otro', desc: 'Otra información relevante' },
] as const

interface CandidateOption {
  slug: string
  full_name: string
  party_name: string
}

function ContribuirForm() {
  const searchParams = useSearchParams()
  const preselectedCandidate = searchParams.get('candidato') || ''

  const [step, setStep] = useState(preselectedCandidate ? 2 : 1)
  const [candidates, setCandidates] = useState<CandidateOption[]>([])
  const [candidateSearch, setCandidateSearch] = useState('')
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateOption | null>(null)
  const [contributionType, setContributionType] = useState('')
  const [content, setContent] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)

  // Load candidates on first render
  useMemo(() => {
    if (loaded) return
    setLoaded(true)
    import('@/lib/seed-data').then(({ SEED_CANDIDATES }) => {
      const opts = SEED_CANDIDATES
        .filter(c => c.role === 'president')
        .map(c => ({ slug: c.slug, full_name: c.full_name, party_name: c.party_name }))
      setCandidates(opts)

      if (preselectedCandidate) {
        const match = opts.find(c => c.slug === preselectedCandidate)
        if (match) setSelectedCandidate(match)
      }
    })
  }, [loaded, preselectedCandidate])

  const filteredCandidates = candidateSearch
    ? candidates.filter(c =>
        c.full_name.toLowerCase().includes(candidateSearch.toLowerCase()) ||
        c.party_name.toLowerCase().includes(candidateSearch.toLowerCase())
      )
    : candidates

  const selectedType = CONTRIBUTION_TYPES.find(t => t.value === contributionType)
  const needsSource = contributionType !== 'other'

  async function handleSubmit() {
    if (!selectedCandidate || !contributionType || !content) return
    if (needsSource && !sourceUrl) {
      setError('Se requiere una URL de fuente para este tipo de contribución.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/contribuciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_id: selectedCandidate.slug,
          candidate_name: selectedCandidate.full_name,
          contribution_type: contributionType,
          content,
          source_url: sourceUrl || undefined,
          contributor_email: email || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al enviar')
      }

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar la contribución')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-[#111111] mb-2">¡Gracias por tu contribución!</h1>
        <p className="text-[#666666] mb-6">
          Tu información será revisada antes de publicarse. Esto nos ayuda a mantener los perfiles actualizados y verificados.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href={`/candidatos/${selectedCandidate?.slug}`} className="px-4 py-2 bg-[#1A56A0] text-white rounded-lg text-sm font-medium hover:bg-[#154A8A] transition-colors">
            Volver al perfil
          </Link>
          <button onClick={() => { setSubmitted(false); setStep(1); setContributionType(''); setContent(''); setSourceUrl(''); setEmail(''); setSelectedCandidate(null) }} className="px-4 py-2 border border-[#E5E3DE] rounded-lg text-sm font-medium text-[#444444] hover:bg-[#F7F6F3] transition-colors">
            Enviar otra
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-[#111111] mb-1">Contribuir información</h1>
      <p className="text-[#666666] text-sm mb-8">
        Ayuda a mantener los perfiles de candidatos actualizados con información verificada.
      </p>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-[#1A56A0]' : 'bg-[#E5E3DE]'}`} />
        ))}
      </div>

      {/* Step 1: Select candidate */}
      {step === 1 && (
        <div>
          <h2 className="text-lg font-semibold text-[#111111] mb-4">1. Selecciona el candidato</h2>
          <input
            type="text"
            placeholder="Buscar por nombre o partido..."
            value={candidateSearch}
            onChange={e => setCandidateSearch(e.target.value)}
            className="w-full px-4 py-3 border border-[#E5E3DE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56A0]/30 focus:border-[#1A56A0] mb-3"
          />
          <div className="max-h-80 overflow-y-auto space-y-1">
            {filteredCandidates.map(c => (
              <button
                key={c.slug}
                onClick={() => { setSelectedCandidate(c); setStep(2) }}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                  selectedCandidate?.slug === c.slug
                    ? 'border-[#1A56A0] bg-[#1A56A0]/5'
                    : 'border-[#E5E3DE] hover:bg-[#F7F6F3]'
                }`}
              >
                <span className="font-medium text-[#111111] text-sm">{c.full_name}</span>
                <span className="text-[#777777] text-xs ml-2">{c.party_name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Select type */}
      {step === 2 && (
        <div>
          <h2 className="text-lg font-semibold text-[#111111] mb-1">2. Tipo de información</h2>
          <p className="text-[#777777] text-xs mb-4">Candidato: <strong>{selectedCandidate?.full_name}</strong></p>
          <div className="space-y-2">
            {CONTRIBUTION_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => { setContributionType(t.value); setStep(3) }}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                  contributionType === t.value
                    ? 'border-[#1A56A0] bg-[#1A56A0]/5'
                    : 'border-[#E5E3DE] hover:bg-[#F7F6F3]'
                }`}
              >
                <span className="text-base mr-2">{t.icon}</span>
                <span className="font-medium text-[#111111] text-sm">{t.label}</span>
                <p className="text-[#777777] text-xs mt-0.5 ml-7">{t.desc}</p>
              </button>
            ))}
          </div>
          <button onClick={() => setStep(1)} className="mt-4 text-sm text-[#1A56A0] hover:underline">← Cambiar candidato</button>
        </div>
      )}

      {/* Step 3: Content */}
      {step === 3 && (
        <div>
          <h2 className="text-lg font-semibold text-[#111111] mb-1">3. Detalle</h2>
          <p className="text-[#777777] text-xs mb-4">
            {selectedCandidate?.full_name} · {selectedType?.icon} {selectedType?.label}
          </p>

          <label className="block text-sm font-medium text-[#111111] mb-1">Información</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Describe la información que deseas aportar..."
            rows={5}
            className="w-full px-4 py-3 border border-[#E5E3DE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56A0]/30 focus:border-[#1A56A0] mb-4 resize-none"
          />

          {needsSource && (
            <>
              <label className="block text-sm font-medium text-[#111111] mb-1">URL de fuente <span className="text-[#D91023]">*</span></label>
              <input
                type="url"
                value={sourceUrl}
                onChange={e => setSourceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-3 border border-[#E5E3DE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56A0]/30 focus:border-[#1A56A0] mb-4"
              />
            </>
          )}

          <label className="block text-sm font-medium text-[#111111] mb-1">Email (opcional)</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Para contactarte si necesitamos más detalle"
            className="w-full px-4 py-3 border border-[#E5E3DE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56A0]/30 focus:border-[#1A56A0] mb-6"
          />

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="px-4 py-2 border border-[#E5E3DE] rounded-lg text-sm text-[#444444] hover:bg-[#F7F6F3] transition-colors">← Atrás</button>
            <button
              onClick={() => { if (content && (!needsSource || sourceUrl)) setStep(4) }}
              disabled={!content || (needsSource && !sourceUrl)}
              className="px-6 py-2 bg-[#1A56A0] text-white rounded-lg text-sm font-medium hover:bg-[#154A8A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Revisar →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review + submit */}
      {step === 4 && (
        <div>
          <h2 className="text-lg font-semibold text-[#111111] mb-4">4. Revisa y envía</h2>

          <div className="border border-[#E5E3DE] rounded-lg p-5 space-y-3 mb-6 bg-[#FAFAF9]">
            <div>
              <span className="text-xs text-[#777777] uppercase tracking-wide">Candidato</span>
              <p className="text-sm font-medium text-[#111111]">{selectedCandidate?.full_name} <span className="text-[#777777] font-normal">({selectedCandidate?.party_name})</span></p>
            </div>
            <div>
              <span className="text-xs text-[#777777] uppercase tracking-wide">Tipo</span>
              <p className="text-sm text-[#111111]">{selectedType?.icon} {selectedType?.label}</p>
            </div>
            <div>
              <span className="text-xs text-[#777777] uppercase tracking-wide">Información</span>
              <p className="text-sm text-[#111111] whitespace-pre-wrap">{content}</p>
            </div>
            {sourceUrl && (
              <div>
                <span className="text-xs text-[#777777] uppercase tracking-wide">Fuente</span>
                <p className="text-sm text-[#1A56A0] break-all">{sourceUrl}</p>
              </div>
            )}
            {email && (
              <div>
                <span className="text-xs text-[#777777] uppercase tracking-wide">Email</span>
                <p className="text-sm text-[#111111]">{email}</p>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(3)} className="px-4 py-2 border border-[#E5E3DE] rounded-lg text-sm text-[#444444] hover:bg-[#F7F6F3] transition-colors">← Editar</button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-[#1A56A0] text-white rounded-lg text-sm font-medium hover:bg-[#154A8A] transition-colors disabled:opacity-60"
            >
              {submitting ? 'Enviando...' : 'Enviar contribución'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ContribuirPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-16 text-center text-[#777777]">Cargando...</div>}>
      <ContribuirForm />
    </Suspense>
  )
}
