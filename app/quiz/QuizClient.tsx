'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react'
import FeedbackWidget from '@/components/FeedbackWidget'
import ShareButtons from '@/components/ShareButtons'
import PolicyCompass from '@/components/PolicyCompass'
import issuesData from '@/data/issues.json'
import candidatePositionsData from '@/data/candidate-positions.json'
import type { QuizTheme, PolicyAxis } from '@/lib/types'

type CandidatePosition = {
  candidate_id: string
  candidate_name: string
  party: string
  party_abbreviation: string
  role: 'presidential' | 'senate' | 'diputados' | 'andino'
  department: string | null
  positions: Record<string, { score: number | null; label: string; verified: boolean }>
  axis_scores?: { economic: number | null; social: number | null; institutions: number | null }
}

type IssueScore = { issue: string; diff: number; weight: number }

type MatchResult = {
  candidateId: string
  name: string
  party: string
  partyAbbr: string
  matchPct: number | null
  dataQuality: 'verified' | 'partial' | 'insufficient'
  verifiedIssueCount: number
  topAligned: IssueScore[]
  topDivergent: IssueScore[]
}

const themes = issuesData.themes as QuizTheme[]
const allQuestions = themes.flatMap((t) => t.questions)

// Build issue key → short label map for match breakdown display
const ISSUE_SHORT_LABELS: Record<string, string> = {
  economia_igv: 'IGV',
  economia_mineria: 'Minería',
  economia_informal: 'Economía informal',
  economia_inversion: 'Inversión extranjera',
  medioambiente_industrias: 'Medio ambiente',
  seguridad_pena_muerte: 'Pena de muerte',
  seguridad_fuerzas_armadas: 'Fuerzas Armadas',
  seguridad_narcotrafico: 'Narcotráfico',
  educacion_meritocracia: 'Meritocracia docente',
  inst_constitucion: 'Nueva Constitución',
  inst_fiscal: 'Elección de jueces',
  inst_anticorrupcion: 'Anticorrupción',
  territorio_descentralizacion: 'Descentralización',
}

// Build axis config from issues data for weighted scoring
const AXIS_CONFIG: Record<string, { axis: PolicyAxis; inverted: boolean; weight: number }> = {}
for (const theme of themes) {
  for (const q of theme.questions) {
    AXIS_CONFIG[q.key] = { axis: q.axis as PolicyAxis, inverted: q.axis_inverted, weight: q.axis_weight }
  }
}

// Build issue key → axis_weight map for match calculation
const ISSUE_AXIS_WEIGHTS: Record<string, number> = {}
for (const theme of themes) {
  for (const q of theme.questions) {
    ISSUE_AXIS_WEIGHTS[q.key] = q.axis_weight
  }
}
const TOTAL_QUESTIONS = allQuestions.length
const candidatePositions = candidatePositionsData as CandidatePosition[]

function computeUserAxisScore(
  answers: Record<string, number>,
  axis: PolicyAxis
): number | null {
  let weightedSum = 0
  let totalWeight = 0
  for (const [key, config] of Object.entries(AXIS_CONFIG)) {
    if (config.axis !== axis) continue
    const score = answers[key]
    if (score === undefined) continue
    let normalized = (score - 1) / 4
    if (config.inverted) normalized = 1 - normalized
    weightedSum += normalized * config.weight
    totalWeight += config.weight
  }
  if (totalWeight === 0) return null
  return Math.round((weightedSum / totalWeight) * 100)
}

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

const ANSWER_OPTIONS = [
  { score: 5, label: 'Muy de acuerdo' },
  { score: 4, label: 'De acuerdo' },
  { score: 3, label: 'Neutral / No sé' },
  { score: 2, label: 'En desacuerdo' },
  { score: 1, label: 'Muy en desacuerdo' },
] as const

function calculateMatch(
  userAnswers: Record<string, number>,
  weights: Record<string, number>,
  candidatePositions: Record<string, { score: number | null; label: string; verified: boolean }>,
): { matchPct: number | null; verifiedIssueCount: number; dataQuality: 'verified' | 'partial' | 'insufficient'; topAligned: IssueScore[]; topDivergent: IssueScore[] } {
  const answeredIssues = Object.keys(userAnswers)

  // Only consider active questions (those in current issues.json)
  const activeKeys = new Set(allQuestions.map(q => q.key))

  const sharedIssues = answeredIssues.filter((issue) => {
    if (!activeKeys.has(issue)) return false
    const pos = candidatePositions[issue]
    return pos && pos.score !== null
  })

  const verifiedIssueCount = Object.entries(candidatePositions).filter(
    ([key, p]) => activeKeys.has(key) && p.score !== null
  ).length

  const dataQuality: 'verified' | 'partial' | 'insufficient' =
    verifiedIssueCount >= 10 ? 'verified' :
    verifiedIssueCount >= 5 ? 'partial' : 'insufficient'

  if (sharedIssues.length < 3) {
    return { matchPct: null, verifiedIssueCount, dataQuality, topAligned: [], topDivergent: [] }
  }

  let weightedDiff = 0
  let totalWeight = 0
  const issueScores: IssueScore[] = []

  for (const issue of sharedIssues) {
    const userWeight = weights[issue] ?? 1
    const axisWeight = ISSUE_AXIS_WEIGHTS[issue] ?? 1
    const combinedWeight = userWeight * axisWeight
    const diff = Math.abs(userAnswers[issue] - candidatePositions[issue].score!)
    weightedDiff += diff * combinedWeight
    totalWeight += combinedWeight * 4
    issueScores.push({ issue, diff, weight: combinedWeight })
  }

  const matchPct = Math.round((1 - weightedDiff / totalWeight) * 100)

  const sorted = [...issueScores].sort((a, b) => a.diff - b.diff)
  const topAligned = sorted.slice(0, 3)
  const topDivergent = sorted.slice(-3).reverse()

  return { matchPct, verifiedIssueCount, dataQuality, topAligned, topDivergent }
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
      <div className={`p-4 rounded-xl border border-[#E5E3DE] hover:shadow-md transition-all bg-white ${muted ? 'opacity-75' : ''}`}>
        <div className="flex items-center gap-4">
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
        {/* Match breakdown */}
        {r.matchPct !== null && (r.topAligned.length > 0 || r.topDivergent.length > 0) && (
          <div className="mt-3 ml-12 flex flex-wrap gap-x-4 gap-y-1">
            {r.topAligned.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] text-green-700">✓ Coinciden:</span>
                {r.topAligned.map((a) => (
                  <span key={a.issue} className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">
                    {ISSUE_SHORT_LABELS[a.issue] ?? a.issue}
                  </span>
                ))}
              </div>
            )}
            {r.topDivergent.filter(d => d.diff > 1).length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] text-red-600">✗ Difieren:</span>
                {r.topDivergent.filter(d => d.diff > 1).map((d) => (
                  <span key={d.issue} className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-200">
                    {ISSUE_SHORT_LABELS[d.issue] ?? d.issue}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
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

// Flatten questions with theme info for sequential navigation
type FlatQuestion = { themeKey: string; themeLabel: string; themeIcon: string; questionIndex: number; isFirstInTheme: boolean } & typeof allQuestions[number]

function buildFlatQuestions(): FlatQuestion[] {
  const flat: FlatQuestion[] = []
  for (const theme of themes) {
    for (let qi = 0; qi < theme.questions.length; qi++) {
      flat.push({
        ...theme.questions[qi],
        themeKey: theme.key,
        themeLabel: theme.label,
        themeIcon: theme.icon,
        questionIndex: qi,
        isFirstInTheme: qi === 0,
      })
    }
  }
  return flat
}

const flatQuestions = buildFlatQuestions()

// Steps: 0=department, 1..N=questions, N+1=weighting, N+2=results
const STEP_WEIGHTING = TOTAL_QUESTIONS + 1
const STEP_RESULTS = TOTAL_QUESTIONS + 2
const STEP_WEIGHTS = STEP_WEIGHTING

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

  const questionIndex = step >= 1 && step <= TOTAL_QUESTIONS ? step - 1 : -1
  const currentQuestion = questionIndex >= 0 ? flatQuestions[questionIndex] : null
  const isWeightingStep = step === STEP_WEIGHTING
  const isResultsStep = step >= STEP_RESULTS

  // Pre-compute suggested weights based on answer strength
  const suggestedWeights = useMemo(() => {
    const suggested: Record<string, number> = {}
    for (const [issue, score] of Object.entries(answers)) {
      if (score === 5 || score === 1) suggested[issue] = 2       // strong feeling → muy importante
      else if (score === 3) suggested[issue] = 0.5               // neutral → no tanto
      else suggested[issue] = 1                                   // moderate → importante
    }
    return suggested
  }, [answers])

  // Initialize weights with suggested values when entering weighting step
  useEffect(() => {
    if (step === STEP_WEIGHTS && Object.keys(weights).length === 0) {
      setWeights(suggestedWeights)
    }
  }, [step, suggestedWeights, weights])

  // Which theme is current question in
  const currentThemeKey = currentQuestion?.themeKey ?? null

  const results = useMemo(() => {
    if (!isResultsStep) return [] as MatchResult[]
    return candidatePositions
      .filter((cp) => {
        // Presidential candidates: always show (department is null)
        if (!cp.department) return true
        // Congress candidates: only show if matches user's department
        return cp.department === department
      })
      .map((cp): MatchResult => {
        const { matchPct, verifiedIssueCount, dataQuality, topAligned, topDivergent } = calculateMatch(answers, weights, cp.positions)
        return {
          candidateId: cp.candidate_id,
          name: cp.candidate_name,
          party: cp.party,
          partyAbbr: cp.party_abbreviation,
          matchPct,
          dataQuality,
          verifiedIssueCount,
          topAligned,
          topDivergent,
        }
      })
  }, [isResultsStep, answers, weights, department])

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
    if (!currentQuestion) return
    setAnswers((prev) => ({ ...prev, [currentQuestion.key]: score }))
    setStep((s) => s + 1)
  }

  function handleSkip() {
    if (!currentQuestion) return
    setAnswers((prev) => {
      const next = { ...prev }
      delete next[currentQuestion.key]
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

  // Jump to a theme's first question
  function jumpToTheme(themeKey: string) {
    const idx = flatQuestions.findIndex((q) => q.themeKey === themeKey)
    if (idx >= 0) setStep(idx + 1)
  }

  const answeredCount = Object.keys(answers).length
  const progress = step === 0 ? 0 : isResultsStep ? 100 : Math.round((step / (STEP_RESULTS)) * 100)

  // Keyboard navigation (Task 6)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isResultsStep || isWeightingStep) return

    // Number keys 1-5 to select answer
    if (currentQuestion && e.key >= '1' && e.key <= '5') {
      e.preventDefault()
      const score = 6 - parseInt(e.key) // 1 maps to score 5 (Muy de acuerdo), 5 maps to score 1
      handleAnswer(score)
      return
    }

    // Arrow right or Enter to go next (if answer already selected)
    if ((e.key === 'ArrowRight' || e.key === 'Enter') && currentQuestion && answers[currentQuestion.key] !== undefined) {
      e.preventDefault()
      setStep((s) => s + 1)
      return
    }

    // Arrow left to go back
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      setStep((s) => Math.max(0, s - 1))
      return
    }

    // Escape to go back
    if (e.key === 'Escape') {
      e.preventDefault()
      setStep((s) => Math.max(0, s - 1))
      return
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, isResultsStep, isWeightingStep, answers])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

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
                Responde {TOTAL_QUESTIONS} preguntas sobre los temas más importantes para el Perú.
                Descubre qué candidatos comparten tu visión.
              </p>
              <div className="flex items-center justify-center gap-4 mt-4 text-sm text-[#777777]">
                <span>5 minutos</span>
                <span className="text-[#E5E3DE]">|</span>
                <span>100% anónimo</span>
                <span className="text-[#E5E3DE]">|</span>
                <span>Datos de planes de gobierno JNE</span>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111]">
                {isResultsStep ? 'Tus resultados' : '¿Con quién votas? Descúbrelo en 5 minutos'}
              </h1>
              {!isResultsStep && (
                <p className="text-[#777777] mt-2 max-w-lg mx-auto">
                  {TOTAL_QUESTIONS} preguntas sobre temas clave. Descubre qué candidatos presidenciales comparten tus ideas. Anónimo, sin registro.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Progress bar + theme pills */}
      {!isResultsStep && step > 0 && (
        <div className="max-w-3xl mx-auto px-4 pt-6">
          {/* Theme pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {themes.map((theme) => {
              const isActive = currentThemeKey === theme.key
              const themeQuestionKeys = theme.questions.map((q) => q.key)
              const answeredInTheme = themeQuestionKeys.filter((k) => k in answers).length
              const allAnswered = answeredInTheme === theme.questions.length
              return (
                <button
                  key={theme.key}
                  onClick={() => jumpToTheme(theme.key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    isActive
                      ? 'bg-[#1A56A0] text-white border-[#1A56A0]'
                      : allAnswered
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-white text-[#777777] border-[#E5E3DE] hover:border-[#1A56A0] hover:text-[#1A56A0]'
                  }`}
                >
                  <span>{theme.icon}</span>
                  <span>{theme.label}</span>
                  {allAnswered && !isActive && <span className="text-green-500">✓</span>}
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-[#777777] mb-2">
            <span>
              {isWeightingStep
                ? 'Prioriza tus temas'
                : `Pregunta ${questionIndex + 1} de ${TOTAL_QUESTIONS}`}
            </span>
            <span>{answeredCount}/{TOTAL_QUESTIONS} respondidas</span>
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

        {/* Questions */}
        {currentQuestion && (
          <div>
            {/* Theme separator when entering new theme */}
            {currentQuestion.isFirstInTheme && (
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E5E3DE]">
                <span className="text-2xl">{currentQuestion.themeIcon}</span>
                <div>
                  <h3 className="text-lg font-bold text-[#111111]">{currentQuestion.themeLabel}</h3>
                  <p className="text-xs text-[#777777]">
                    {themes.find((t) => t.key === currentQuestion.themeKey)?.questions.length} preguntas en esta sección
                  </p>
                </div>
              </div>
            )}

            <h2 className="text-xl font-bold text-[#111111] mb-3" style={{ fontSize: '20px' }}>
              {currentQuestion.question}
            </h2>
            <p className="text-sm text-[#777777] italic mb-8">
              {currentQuestion.context}
            </p>

            <div className="space-y-3 mb-4" role="radiogroup" aria-label="Opciones de respuesta">
              {ANSWER_OPTIONS.map((option, idx) => (
                <button
                  key={option.score}
                  onClick={() => handleAnswer(option.score)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all focus:outline-2 focus:outline-[#1A56A0] focus:outline-offset-2 ${
                    answers[currentQuestion.key] === option.score
                      ? 'bg-[#EEF4FF] border-[#1A56A0] text-[#1A56A0]'
                      : 'bg-white border-[#E5E3DE] text-[#444444] hover:border-[#1A56A0] hover:bg-[#F7F6F3]'
                  }`}
                  role="radio"
                  aria-checked={answers[currentQuestion.key] === option.score}
                  aria-label={`Opción ${idx + 1}: ${option.label}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="text-sm font-medium">{option.label}</span>
                      {option.score === 5 && (
                        <span className="text-xs text-[#666666] ml-2">({currentQuestion.agree_label})</span>
                      )}
                      {option.score === 1 && (
                        <span className="text-xs text-[#666666] ml-2">({currentQuestion.disagree_label})</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {/* Keyboard shortcut hints */}
            <p className="text-xs text-[#666666] mb-4 text-center" aria-hidden="true">
              (1-5) para seleccionar | → siguiente | ← atrás | Esc volver
            </p>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="flex items-center gap-1 text-sm text-[#666666] hover:text-[#111111] transition-colors focus:outline-2 focus:outline-[#1A56A0] focus:outline-offset-2 rounded-lg px-2 py-1"
                aria-label="Ir a la pregunta anterior"
              >
                <ArrowLeft size={16} />
                Atrás
              </button>
              <button
                onClick={handleSkip}
                className="text-sm text-[#666666] hover:text-[#1A56A0] transition-colors focus:outline-2 focus:outline-[#1A56A0] focus:outline-offset-2 rounded-lg px-2 py-1"
                aria-label="Omitir esta pregunta y pasar a la siguiente"
              >
                Omitir esta pregunta
              </button>
            </div>
          </div>
        )}

        {/* Weighting step */}
        {isWeightingStep && (
          <div>
            <h2 className="text-xl font-bold text-[#111111] mb-2">
              ¿Qué temas son más importantes para ti?
            </h2>
            <p className="text-sm text-[#777777] mb-6">
              Indica cuánto peso debe tener cada tema al calcular tu afinidad con los candidatos.
            </p>

            <div className="space-y-4 mb-8">
              {themes.map((theme) => {
                const themeQuestionKeys = theme.questions.map((q) => q.key)
                const answeredInTheme = themeQuestionKeys.filter((k) => k in answers).length
                const hasAnswers = answeredInTheme > 0
                return (
                  <div
                    key={theme.key}
                    className={`p-4 rounded-xl border border-[#E5E3DE] bg-white ${!hasAnswers ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span>{theme.icon}</span>
                      <p className="text-sm font-semibold text-[#111111]">{theme.label}</p>
                      <span className="text-xs text-[#777777]">({answeredInTheme}/{theme.questions.length})</span>
                    </div>
                    <div className="flex gap-2">
                      {WEIGHT_OPTIONS.map((opt) => {
                        // Apply weight to all questions in theme
                        const currentWeight = weights[themeQuestionKeys[0]] ?? 1
                        return (
                          <button
                            key={opt.value}
                            onClick={() => {
                              for (const qk of themeQuestionKeys) {
                                handleSetWeight(qk, opt.value)
                              }
                            }}
                            disabled={!hasAnswers}
                            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                              currentWeight === opt.value
                                ? 'bg-[#1A56A0] text-white border-[#1A56A0]'
                                : 'bg-white text-[#444444] border-[#E5E3DE] hover:border-[#1A56A0]'
                            } ${!hasAnswers ? 'cursor-not-allowed' : ''}`}
                          >
                            {opt.label}
                          </button>
                        )
                      })}
                    </div>
                    {!hasAnswers && (
                      <p className="text-[10px] text-[#999999] mt-1">No respondiste preguntas de este tema</p>
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

            {/* Top matches */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-[#111111] mb-2">
                Candidatos más afines
              </h2>
              <p className="text-[#777777]">
                Basado en tus respuestas, estos candidatos tienen posiciones más cercanas a las tuyas.
              </p>
              {department && (
                <p className="text-sm text-[#666666] mt-1">
                  Candidatos presidenciales · Votante en {department}
                </p>
              )}
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
                        Basado en {r.verifiedIssueCount} de {TOTAL_QUESTIONS} temas verificados
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
                        {r.verifiedIssueCount} de {TOTAL_QUESTIONS} temas con datos
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
                  ¿Por qué no aparece mi candidato?
                </h3>
                <p className="text-xs text-[#999999] mb-3">
                  El quiz compara tus respuestas con las posiciones verificadas de cada candidato.
                  Si un candidato tiene pocos datos verificados (menos de 6 temas), no aparece en los resultados principales.
                  Puedes ver todos los candidatos en la lista completa.
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

            {/* Policy Compass */}
            {(() => {
              const userEcon = computeUserAxisScore(answers, 'economic')
              const userSoc = computeUserAxisScore(answers, 'social')
              const userInst = computeUserAxisScore(answers, 'institutions')
              if (userEcon === null || userSoc === null) return null
              const compassCandidates = candidatePositions
                .filter((cp) => cp.axis_scores?.economic != null && cp.axis_scores?.social != null)
                .map((cp) => ({
                  id: cp.candidate_id,
                  name: cp.candidate_name,
                  party: cp.party,
                  partyAbbr: cp.party_abbreviation,
                  economic: cp.axis_scores!.economic!,
                  social: cp.axis_scores!.social!,
                  institutions: cp.axis_scores?.institutions ?? 50,
                }))
              return (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-[#111111] mb-1 text-center">
                    Tu posición en los ejes de política pública
                  </h3>
                  <p className="text-xs text-[#777777] text-center mb-4 max-w-md mx-auto">
                    Este diagrama muestra tu posición en tres dimensiones de política pública. Tamaño = posición en reforma institucional.
                  </p>
                  <PolicyCompass
                    candidates={compassCandidates}
                    userEconomic={userEcon}
                    userSocial={userSoc}
                    userInstitutions={userInst ?? 50}
                  />
                </div>
              )
            })()}

            {/* Axis breakdown for top candidates */}
            {(() => {
              const userEcon = computeUserAxisScore(answers, 'economic')
              const userSoc = computeUserAxisScore(answers, 'social')
              const userInst = computeUserAxisScore(answers, 'institutions')
              const topCandidates = [...verifiedResults, ...partialResults].slice(0, 3)
              if (topCandidates.length === 0 || userEcon === null) return null

              const axisLabels = [
                { key: 'economic' as const, label: 'Económico', user: userEcon },
                { key: 'social' as const, label: 'Social', user: userSoc },
                { key: 'institutions' as const, label: 'Institucional', user: userInst },
              ]

              return (
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-[#111111] mb-3">
                    Ejes de política pública
                  </h3>
                  <div className="space-y-4">
                    {topCandidates.map((r) => {
                      const cp = candidatePositions.find(c => c.candidate_id === r.candidateId)
                      if (!cp?.axis_scores) return null
                      return (
                        <div key={r.candidateId} className="p-3 rounded-lg border border-[#E5E3DE] bg-white">
                          <p className="text-xs font-semibold text-[#111111] mb-2">{r.name} <span className="text-[#777777] font-normal">{r.partyAbbr}</span></p>
                          <div className="space-y-1.5">
                            {axisLabels.map(({ key, label, user }) => {
                              const candidateScore = cp.axis_scores?.[key]
                              if (candidateScore == null || user == null) return null
                              return (
                                <div key={key} className="flex items-center gap-2 text-[10px]">
                                  <span className="w-20 text-[#777777] text-right shrink-0">{label}</span>
                                  <div className="flex-1 flex items-center gap-1">
                                    <div className="flex-1 h-1.5 bg-[#EEEDE9] rounded-full overflow-hidden relative">
                                      <div className="h-full bg-[#999] rounded-full" style={{ width: `${candidateScore}%` }} />
                                    </div>
                                    <span className="w-7 text-[#777777]">{candidateScore}%</span>
                                  </div>
                                  <span className="text-[#999] mx-0.5">vs</span>
                                  <div className="flex-1 flex items-center gap-1">
                                    <div className="flex-1 h-1.5 bg-[#EEEDE9] rounded-full overflow-hidden">
                                      <div className="h-full bg-[#1A56A0] rounded-full" style={{ width: `${user}%` }} />
                                    </div>
                                    <span className="w-7 text-[#1A56A0]">{user}%</span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-[10px] text-[#999] mt-1">Gris = candidato | Azul = tú</p>
                </div>
              )
            })()}

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
