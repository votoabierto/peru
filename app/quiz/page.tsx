'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Share2, ExternalLink } from 'lucide-react'
import FeedbackWidget from '@/components/FeedbackWidget'
import issuesData from '@/data/issues.json'
import candidatePositionsData from '@/data/candidate-positions.json'

type CandidatePosition = {
  candidate_id: string
  candidate_name: string
  party: string
  party_abbreviation: string
  positions: Record<string, { score: number | null; label: string; verified: boolean }>
}

type MatchResult = {
  candidateId: string
  name: string
  party: string
  partyAbbr: string
  matchPct: number | null
  dataQuality: 'verified' | 'partial' | 'insufficient'
  verifiedIssueCount: number
}

const issues = issuesData.issues
const candidatePositions = candidatePositionsData as CandidatePosition[]

const DEPARTMENTS = [
  'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca',
  'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín',
  'La Libertad', 'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios',
  'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna',
  'Tumbes', 'Ucayali',
]

function calculateMatch(
  userAnswers: Record<string, number>,
  candidatePositions: Record<string, { score: number | null; label: string; verified: boolean }>,
): { matchPct: number | null; verifiedIssueCount: number; dataQuality: 'verified' | 'partial' | 'insufficient' } {
  const answeredIssues = Object.keys(userAnswers)

  // Only compare issues where both user answered AND candidate has real data
  const sharedIssues = answeredIssues.filter((issue) => {
    const pos = candidatePositions[issue]
    return pos && pos.score !== null
  })

  const verifiedIssueCount = Object.values(candidatePositions).filter(
    (p) => p.score !== null
  ).length

  const dataQuality: 'verified' | 'partial' | 'insufficient' =
    verifiedIssueCount >= 8 ? 'verified' :
    verifiedIssueCount >= 3 ? 'partial' : 'insufficient'

  if (sharedIssues.length < 3) {
    return { matchPct: null, verifiedIssueCount, dataQuality }
  }

  const totalDiff = sharedIssues.reduce((sum, issue) => {
    const userScore = userAnswers[issue]
    const candidateScore = candidatePositions[issue].score!
    return sum + Math.abs(userScore - candidateScore)
  }, 0)

  const maxPossibleDiff = sharedIssues.length * 4
  const matchPct = Math.round((1 - totalDiff / maxPossibleDiff) * 100)

  return { matchPct, verifiedIssueCount, dataQuality }
}

function matchColor(pct: number): string {
  if (pct >= 80) return 'bg-green-100 text-green-800 border-green-300'
  if (pct >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
  return 'bg-gray-100 text-gray-600 border-gray-300'
}

function matchBarColor(pct: number): string {
  if (pct >= 80) return 'bg-green-500'
  if (pct >= 60) return 'bg-yellow-500'
  return 'bg-gray-400'
}

function ResultCard({ r, rank, muted }: { r: MatchResult; rank: number; muted?: boolean }) {
  return (
    <Link
      href={`/candidatos/${r.candidateId}`}
      className="block"
    >
      <div className={`flex items-center gap-4 p-4 rounded-xl border border-[#E5E3DE] hover:shadow-md transition-all bg-white ${muted ? 'opacity-75' : ''}`}>
        <span className="text-lg font-bold text-[#777777] w-8 text-center flex-shrink-0">
          {rank}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-[#111111] truncate">
              {r.name}
            </span>
            <span className="text-xs text-[#777777]">
              {r.partyAbbr}
            </span>
          </div>
          <p className="text-xs text-[#777777] truncate">{r.party}</p>
          {r.matchPct !== null && (
            <div className="mt-2 w-full h-1.5 bg-[#EEEDE9] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${matchBarColor(r.matchPct)}`}
                style={{ width: `${r.matchPct}%` }}
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {r.matchPct !== null ? (
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${matchColor(r.matchPct)}`}
            >
              {r.matchPct}%
            </span>
          ) : (
            <span className="text-xs text-[#999999]">Sin datos</span>
          )}
          <ExternalLink size={14} className="text-[#777777]" />
        </div>
      </div>
    </Link>
  )
}

export default function QuizPage() {
  const [step, setStep] = useState(0)
  const [department, setDepartment] = useState('')
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [showAll, setShowAll] = useState(false)

  const totalSteps = issues.length + 2

  const currentIssue = step >= 1 && step <= issues.length ? issues[step - 1] : null

  const results = useMemo(() => {
    if (step < totalSteps - 1) return [] as MatchResult[]
    return candidatePositions
      .map((cp): MatchResult => {
        const { matchPct, verifiedIssueCount, dataQuality } = calculateMatch(answers, cp.positions)
        return {
          candidateId: cp.candidate_id,
          name: cp.candidate_name,
          party: cp.party,
          partyAbbr: cp.party_abbreviation,
          matchPct,
          dataQuality,
          verifiedIssueCount,
        }
      })
  }, [step, answers, totalSteps])

  const verifiedResults = results
    .filter((r) => r.dataQuality === 'verified' && r.matchPct !== null)
    .sort((a, b) => (b.matchPct ?? 0) - (a.matchPct ?? 0))

  const partialResults = results
    .filter((r) => r.dataQuality === 'partial' && r.matchPct !== null)
    .sort((a, b) => (b.matchPct ?? 0) - (a.matchPct ?? 0))

  const insufficientResults = results
    .filter((r) => r.dataQuality === 'insufficient' || r.matchPct === null)
    .sort((a, b) => a.name.localeCompare(b.name))

  function handleAnswer(score: number) {
    if (!currentIssue) return
    setAnswers((prev) => ({ ...prev, [currentIssue.key]: score }))
    setStep((s) => s + 1)
  }

  function handleSkip() {
    if (!currentIssue) return
    // Remove the answer for this issue instead of defaulting to 3
    setAnswers((prev) => {
      const next = { ...prev }
      delete next[currentIssue.key]
      return next
    })
    setStep((s) => s + 1)
  }

  function handleShare() {
    // Only share top candidate from verified section
    const topVerified = verifiedResults[0]
    const shareText = topVerified
      ? `Respondí el quiz de VotoAbierto y tengo ${topVerified.matchPct}% de afinidad con ${topVerified.name}. ¿Y tú? votoabierto.org/quiz`
      : `Hice el quiz electoral en votoabierto.org/quiz`

    if (navigator.share) {
      navigator.share({ text: shareText }).catch(() => {
        navigator.clipboard.writeText(shareText)
        alert('Texto copiado al portapapeles')
      })
    } else {
      navigator.clipboard.writeText(shareText)
      alert('Texto copiado al portapapeles')
    }
  }

  function handleRestart() {
    setStep(0)
    setDepartment('')
    setAnswers({})
    setShowAll(false)
  }

  const progress = step === 0 ? 0 : step >= totalSteps - 1 ? 100 : Math.round((step / (totalSteps - 1)) * 100)

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#F7F6F3] border-b border-[#E5E3DE]">
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <p className="text-[#1A56A0] text-sm font-semibold uppercase tracking-widest mb-2">
            Quiz Electoral
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111]">
            ¿Con quién votas? Descúbrelo en 5 minutos
          </h1>
          <p className="text-[#777777] mt-2 max-w-lg mx-auto">
            Responde 10 preguntas sobre temas clave y descubre qué candidatos presidenciales comparten tus ideas. Anónimo, sin registro.
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {step < totalSteps - 1 && (
        <div className="max-w-3xl mx-auto px-4 pt-6">
          <div className="flex items-center justify-between text-xs text-[#777777] mb-2">
            <span>
              {step === 0 ? 'Selecciona tu departamento' : `Pregunta ${step} de ${issues.length}`}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-[#EEEDE9] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1A56A0] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Step 0: Department selector */}
        {step === 0 && (
          <div>
            <h2 className="text-xl font-bold text-[#111111] mb-2">¿En qué departamento votas?</h2>
            <p className="text-sm text-[#777777] mb-6">
              Opcional — nos ayuda a mostrarte información relevante de tu región.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-8">
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setDepartment(dept)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    department === dept
                      ? 'bg-[#1A56A0] text-white border-[#1A56A0]'
                      : 'bg-white text-[#444444] border-[#E5E3DE] hover:border-[#1A56A0] hover:text-[#1A56A0]'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="btn-primary"
              >
                {department ? 'Continuar' : 'Saltar y comenzar'}
                <ArrowRight size={16} className="ml-1 inline" />
              </button>
            </div>
          </div>
        )}

        {/* Steps 1-10: Questions */}
        {currentIssue && (
          <div>
            <h2 className="text-xl font-bold text-[#111111] mb-2">{currentIssue.label}</h2>
            <p className="text-base text-[#444444] mb-8">{currentIssue.question}</p>

            <div className="space-y-3 mb-8">
              {[
                { score: 1, label: currentIssue.left_label, sublabel: 'Muy de acuerdo' },
                { score: 2, label: currentIssue.left_label, sublabel: 'De acuerdo' },
                { score: 3, label: 'Centro / No tengo una posición clara', sublabel: '' },
                { score: 4, label: currentIssue.right_label, sublabel: 'De acuerdo' },
                { score: 5, label: currentIssue.right_label, sublabel: 'Muy de acuerdo' },
              ].map((option) => (
                <button
                  key={option.score}
                  onClick={() => handleAnswer(option.score)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                    answers[currentIssue.key] === option.score
                      ? 'bg-[#EEF4FF] border-[#1A56A0] text-[#1A56A0]'
                      : 'bg-white border-[#E5E3DE] text-[#444444] hover:border-[#1A56A0] hover:bg-[#F7F6F3]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {option.score}
                    </span>
                    <div>
                      <span className="text-sm font-medium">{option.label}</span>
                      {option.sublabel && (
                        <span className="text-xs text-[#777777] ml-2">({option.sublabel})</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="flex items-center gap-1 text-sm text-[#777777] hover:text-[#111111] transition-colors"
              >
                <ArrowLeft size={16} />
                Atrás
              </button>
              <button
                onClick={handleSkip}
                className="text-sm text-[#777777] hover:text-[#1A56A0] transition-colors"
              >
                Prefiero no responder
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {step >= totalSteps - 1 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-[#111111] mb-2">
                Candidatos más afines a tus posiciones
              </h2>
              <p className="text-[#777777]">
                Basado en tus respuestas, estos candidatos tienen posiciones más cercanas a las tuyas.
              </p>
              <p className="text-xs text-[#777777] mt-1">
                Esto no es una recomendación de voto. Investiga más antes de decidir.
              </p>
            </div>

            {/* Section 1: Verified candidates */}
            {verifiedResults.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-[#111111] mb-1">
                  Candidatos con datos verificados
                </h3>
                <p className="text-xs text-[#777777] mb-3">
                  Posiciones extraídas de sus planes de gobierno oficiales (JNE)
                </p>
                <div className="space-y-3">
                  {(showAll ? verifiedResults : verifiedResults.slice(0, 10)).map((r, i) => (
                    <div key={r.candidateId}>
                      <ResultCard r={r} rank={i + 1} />
                      <p className="text-[10px] text-[#999999] mt-0.5 ml-12">
                        Basado en {r.verifiedIssueCount} de 10 temas con datos verificados
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 2: Partial data candidates */}
            {partialResults.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-[#777777] mb-1">
                  Candidatos con datos parciales
                </h3>
                <p className="text-xs text-[#999999] mb-3">
                  Su plan de gobierno no cubre todos los temas del quiz
                </p>
                <div className="space-y-3">
                  {(showAll ? partialResults : partialResults.slice(0, 5)).map((r, i) => (
                    <div key={r.candidateId}>
                      <ResultCard r={r} rank={i + 1} muted />
                      <p className="text-[10px] text-[#999999] mt-0.5 ml-12">
                        {r.verifiedIssueCount} de 10 temas con datos
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 3: Insufficient data */}
            {insufficientResults.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-[#999999] mb-1">
                  Sin datos suficientes para calcular
                </h3>
                <p className="text-xs text-[#999999] mb-3">
                  No tenemos datos suficientes de sus posiciones para calcular afinidad. Revisa su plan de gobierno en JNE.
                </p>
                <div className="space-y-2">
                  {insufficientResults.map((r) => (
                    <div
                      key={r.candidateId}
                      className="flex items-center justify-between p-3 rounded-lg border border-[#EEEDE9] bg-[#FAFAF8]"
                    >
                      <div>
                        <span className="text-sm text-[#777777]">{r.name}</span>
                        <span className="text-xs text-[#999999] ml-2">{r.partyAbbr}</span>
                      </div>
                      <Link
                        href={`/candidatos/${r.candidateId}`}
                        className="text-xs text-[#1A56A0] hover:underline"
                      >
                        Ver perfil
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!showAll && (verifiedResults.length > 10 || partialResults.length > 5) && (
              <div className="text-center mb-8">
                <button
                  onClick={() => setShowAll(true)}
                  className="text-sm font-medium text-[#1A56A0] hover:underline"
                >
                  Ver todos los candidatos
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={handleShare}
                className="btn-outline flex items-center gap-2"
              >
                <Share2 size={16} />
                Compartir mi resultado
              </button>
              <button
                onClick={handleRestart}
                className="btn-outline"
              >
                Repetir el quiz
              </button>
              <Link href="/candidatos" className="btn-primary">
                Ver todos los candidatos
              </Link>
            </div>

            <p className="text-center text-xs text-[#777777] mt-8">
              Esta herramienta es informativa. El voto es tuyo.
              <br />
              Anónimo. Sin registro. No guardamos tus respuestas individuales.
              <br />
              Los porcentajes reflejan afinidad en posiciones declaradas, no una recomendación de voto.
            </p>
          </div>
        )}
        {step >= totalSteps - 1 && (
          <div className="mt-8">
            <FeedbackWidget pageUrl="/quiz" />
          </div>
        )}
      </div>
    </main>
  )
}
