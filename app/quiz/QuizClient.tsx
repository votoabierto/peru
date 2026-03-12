'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react'
import FeedbackWidget from '@/components/FeedbackWidget'
import PoliticalCompass, { computeEconomicAxis, computeSocialAxis } from '@/components/PoliticalCompass'
import ShareButtons from '@/components/ShareButtons'
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

const WEIGHT_OPTIONS = [
  { value: 2, label: 'Muy importante' },
  { value: 1, label: 'Importante' },
  { value: 0.5, label: 'No tanto' },
] as const

function calculateMatch(
  userAnswers: Record<string, number>,
  weights: Record<string, number>,
  candidatePositions: Record<string, { score: number | null; label: string; verified: boolean }>,
): { matchPct: number | null; verifiedIssueCount: number; dataQuality: 'verified' | 'partial' | 'insufficient' } {
  const answeredIssues = Object.keys(userAnswers)

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

  let weightedDiff = 0
  let totalWeight = 0

  for (const issue of sharedIssues) {
    const w = weights[issue] ?? 1
    const diff = Math.abs(userAnswers[issue] - candidatePositions[issue].score!)
    weightedDiff += diff * w
    totalWeight += w * 4
  }

  const matchPct = Math.round((1 - weightedDiff / totalWeight) * 100)

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

// Encode answers + weights to URL-safe base64
function encodeResults(answers: Record<string, number>, weights: Record<string, number>): string {
  const payload = JSON.stringify({ a: answers, w: weights })
  return btoa(payload).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function decodeResults(encoded: string): { answers: Record<string, number>; weights: Record<string, number> } | null {
  try {
    const padded = encoded.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice(0, (4 - (encoded.length % 4)) % 4)
    const json = atob(padded)
    const parsed = JSON.parse(json)
    if (parsed.a && typeof parsed.a === 'object') {
      return { answers: parsed.a, weights: parsed.w ?? {} }
    }
    return null
  } catch {
    return null
  }
}

// Steps: 0=department, 1-10=questions, 11=weighting, 12=results
const STEP_RESULTS = issues.length + 2
const TOTAL_STEPS = issues.length + 3

export default function QuizClient() {
  const [step, setStep] = useState(0)
  const [department, setDepartment] = useState('')
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [weights, setWeights] = useState<Record<string, number>>({})
  const [showAll, setShowAll] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loadedFromUrl, setLoadedFromUrl] = useState(false)

  // Load results from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const encoded = params.get('r')
    if (encoded) {
      const decoded = decodeResults(encoded)
      if (decoded) {
        setAnswers(decoded.answers)
        setWeights(decoded.weights)
        setStep(STEP_RESULTS)
        setLoadedFromUrl(true)
      }
    }
  }, [])

  const currentIssue = step >= 1 && step <= issues.length ? issues[step - 1] : null
  const isWeightingStep = step === issues.length + 1
  const isResultsStep = step >= STEP_RESULTS

  const results = useMemo(() => {
    if (!isResultsStep) return [] as MatchResult[]
    return candidatePositions
      .map((cp): MatchResult => {
        const { matchPct, verifiedIssueCount, dataQuality } = calculateMatch(answers, weights, cp.positions)
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
  }, [isResultsStep, answers, weights])

  const verifiedResults = results
    .filter((r) => r.dataQuality === 'verified' && r.matchPct !== null)
    .sort((a, b) => (b.matchPct ?? 0) - (a.matchPct ?? 0))

  const partialResults = results
    .filter((r) => r.dataQuality === 'partial' && r.matchPct !== null)
    .sort((a, b) => (b.matchPct ?? 0) - (a.matchPct ?? 0))

  const insufficientResults = results
    .filter((r) => r.dataQuality === 'insufficient' || r.matchPct === null)
    .sort((a, b) => a.name.localeCompare(b.name))

  // Compass data
  const compassCandidates = useMemo(() => {
    if (!isResultsStep) return []
    return candidatePositions
      .filter((cp) => {
        const count = Object.values(cp.positions).filter((p) => p.score !== null).length
        return count >= 6
      })
      .map((cp) => {
        const x = computeEconomicAxis(cp.positions) ?? 0
        const y = computeSocialAxis(cp.positions) ?? 0
        const match = results.find((r) => r.candidateId === cp.candidate_id)
        return {
          id: cp.candidate_id,
          name: cp.candidate_name,
          partyAbbr: cp.party_abbreviation,
          x,
          y,
          matchPct: match?.matchPct ?? null,
        }
      })
  }, [isResultsStep, results])

  const userX = computeEconomicAxis({}, answers) ?? 0
  const userY = computeSocialAxis({}, answers) ?? 0

  function handleAnswer(score: number) {
    if (!currentIssue) return
    setAnswers((prev) => ({ ...prev, [currentIssue.key]: score }))
    setStep((s) => s + 1)
  }

  function handleSkip() {
    if (!currentIssue) return
    setAnswers((prev) => {
      const next = { ...prev }
      delete next[currentIssue.key]
      return next
    })
    setStep((s) => s + 1)
  }

  function handleSetWeight(issueKey: string, value: number) {
    setWeights((prev) => ({ ...prev, [issueKey]: value }))
  }

  function getResultsUrl(): string {
    const encoded = encodeResults(answers, weights)
    return `${window.location.origin}/quiz?r=${encoded}`
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(getResultsUrl())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleRestart() {
    setStep(0)
    setDepartment('')
    setAnswers({})
    setWeights({})
    setShowAll(false)
    setCopied(false)
    setLoadedFromUrl(false)
    window.history.replaceState(null, '', '/quiz')
  }

  const answeredIssueKeys = Object.keys(answers)
  const progress = step === 0 ? 0 : isResultsStep ? 100 : Math.round((step / (TOTAL_STEPS - 1)) * 100)

  const shareText = verifiedResults[0]
    ? `Respondí el quiz de VotoAbierto y tengo ${verifiedResults[0].matchPct}% de afinidad con ${verifiedResults[0].name}. ¿Y tú?`
    : 'Hice el quiz electoral en VotoAbierto. ¿Y tú?'

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#F7F6F3] border-b border-[#E5E3DE]">
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <p className="text-[#1A56A0] text-sm font-semibold uppercase tracking-widest mb-2">
            Quiz Electoral
          </p>
          {step === 0 && !loadedFromUrl ? (
            <>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111]">
                ¿Con quién votas el 12 de abril?
              </h1>
              <p className="text-[#444444] mt-3 max-w-lg mx-auto">
                Responde 10 preguntas sobre los temas más importantes para el Perú.
                Descubre qué candidatos comparten tu visión.
              </p>
              <div className="flex items-center justify-center gap-4 mt-4 text-sm text-[#777777]">
                <span>3 minutos</span>
                <span className="text-[#E5E3DE]">|</span>
                <span>100% anónimo</span>
                <span className="text-[#E5E3DE]">|</span>
                <span>Datos de planes de gobierno JNE</span>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111]">
                {isResultsStep ? 'Tus resultados' : '¿Con quién votas? Descúbrelo en 3 minutos'}
              </h1>
              {!isResultsStep && (
                <p className="text-[#777777] mt-2 max-w-lg mx-auto">
                  Responde 10 preguntas sobre temas clave y descubre qué candidatos presidenciales comparten tus ideas. Anónimo, sin registro.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {!isResultsStep && (
        <div className="max-w-3xl mx-auto px-4 pt-6">
          <div className="flex items-center justify-between text-xs text-[#777777] mb-2">
            <span>
              {step === 0
                ? 'Selecciona tu departamento'
                : isWeightingStep
                  ? 'Prioriza tus temas'
                  : `Pregunta ${step} de ${issues.length}`}
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
                {department ? 'Continuar' : 'Empezar quiz'}
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

        {/* Step 11: Importance weighting */}
        {isWeightingStep && (
          <div>
            <h2 className="text-xl font-bold text-[#111111] mb-2">
              ¿Qué temas son más importantes para ti?
            </h2>
            <p className="text-sm text-[#777777] mb-6">
              Indica cuánto peso debe tener cada tema al calcular tu afinidad con los candidatos.
            </p>

            <div className="space-y-4 mb-8">
              {issues.map((issue) => {
                const answered = answeredIssueKeys.includes(issue.key)
                const currentWeight = weights[issue.key] ?? 1
                return (
                  <div
                    key={issue.key}
                    className={`p-4 rounded-xl border border-[#E5E3DE] bg-white ${!answered ? 'opacity-50' : ''}`}
                  >
                    <p className="text-sm font-semibold text-[#111111] mb-2">{issue.label}</p>
                    <div className="flex gap-2">
                      {WEIGHT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleSetWeight(issue.key, opt.value)}
                          disabled={!answered}
                          className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                            currentWeight === opt.value
                              ? 'bg-[#1A56A0] text-white border-[#1A56A0]'
                              : 'bg-white text-[#444444] border-[#E5E3DE] hover:border-[#1A56A0]'
                          } ${!answered ? 'cursor-not-allowed' : ''}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {!answered && (
                      <p className="text-[10px] text-[#999999] mt-1">No respondiste esta pregunta</p>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1 text-sm text-[#777777] hover:text-[#111111] transition-colors"
              >
                <ArrowLeft size={16} />
                Atrás
              </button>
              <button
                onClick={() => setStep(STEP_RESULTS)}
                className="btn-primary"
              >
                Ver mis resultados
                <ArrowRight size={16} className="ml-1 inline" />
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {isResultsStep && (
          <div>
            {loadedFromUrl && (
              <div className="mb-6 p-4 rounded-xl bg-[#EEF4FF] border border-[#1A56A0]/20">
                <p className="text-sm text-[#1A56A0]">
                  Estás viendo resultados guardados.{' '}
                  <button onClick={handleRestart} className="underline font-medium">
                    Hacer tu propio quiz
                  </button>
                </p>
              </div>
            )}

            {/* Political compass */}
            {compassCandidates.length > 0 && (
              <div className="mb-10">
                <h3 className="text-lg font-bold text-[#111111] mb-1 text-center">
                  Tu posición en el mapa político
                </h3>
                <p className="text-xs text-[#777777] mb-4 text-center">
                  Basado en tus respuestas sobre economía, seguridad y reformas institucionales
                </p>
                <PoliticalCompass
                  candidates={compassCandidates}
                  userX={userX}
                  userY={userY}
                />
              </div>
            )}

            {/* Top matches */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-[#111111] mb-2">
                Candidatos más afines
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
                  {(showAll ? verifiedResults : verifiedResults.slice(0, 5)).map((r, i) => (
                    <div key={r.candidateId}>
                      <ResultCard r={r} rank={i + 1} />
                      <p className="text-[10px] text-[#999999] mt-0.5 ml-12">
                        Basado en {r.verifiedIssueCount} de 10 temas verificados
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
                  Sin datos suficientes
                </h3>
                <p className="text-xs text-[#999999] mb-3">
                  No tenemos datos suficientes de sus posiciones. Revisa su plan de gobierno en JNE.
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

            {!showAll && (verifiedResults.length > 5 || partialResults.length > 5) && (
              <div className="text-center mb-8">
                <button
                  onClick={() => setShowAll(true)}
                  className="text-sm font-medium text-[#1A56A0] hover:underline"
                >
                  Ver todos los candidatos
                </button>
              </div>
            )}

            {/* Share section */}
            <div className="bg-[#F7F6F3] rounded-xl p-6 mb-8">
              <h3 className="text-sm font-bold text-[#111111] mb-1 text-center">Compartir resultado</h3>
              {verifiedResults[0] && (
                <p className="text-xs text-[#777777] text-center mb-4">
                  &ldquo;Tomé el quiz de VotoAbierto y tengo {verifiedResults[0].matchPct}% de afinidad con {verifiedResults[0].name}. ¿Y tú?&rdquo;
                </p>
              )}
              <div className="flex justify-center">
                <ShareButtons
                  url={isResultsStep ? getResultsUrl() : '/quiz'}
                  text={shareText}
                />
              </div>
            </div>

            {/* Save results */}
            {!loadedFromUrl && (
              <div className="text-center mb-8">
                <button
                  onClick={handleCopyLink}
                  className="btn-outline text-sm"
                >
                  {copied ? 'Enlace copiado — guárdalo para volver a tus resultados' : 'Guardar mis resultados (copiar enlace)'}
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-3 justify-center">
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
        {isResultsStep && (
          <div className="mt-8">
            <FeedbackWidget pageUrl="/quiz" />
          </div>
        )}
      </div>
    </main>
  )
}
