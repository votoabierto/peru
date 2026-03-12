'use client'

import { useState, useMemo, useEffect } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import issuesData from '@/data/issues.json'
import candidatePositionsData from '@/data/candidate-positions.json'
import type { QuizTheme } from '@/lib/types'

type CandidatePosition = {
  candidate_id: string
  candidate_name: string
  party: string
  party_abbreviation: string
  positions: Record<string, { score: number | null; label: string; verified: boolean }>
}

const themes = issuesData.themes as QuizTheme[]
const allQuestions = themes.flatMap((t) => t.questions)
const TOTAL_QUESTIONS = allQuestions.length
const candidatePositions = candidatePositionsData as CandidatePosition[]

function calculateMatch(
  userAnswers: Record<string, number>,
  weights: Record<string, number>,
  positions: Record<string, { score: number | null }>,
): number | null {
  const sharedIssues = Object.keys(userAnswers).filter((k) => {
    const p = positions[k]
    return p && p.score !== null
  })
  if (sharedIssues.length < 3) return null

  let weightedDiff = 0
  let totalWeight = 0
  for (const issue of sharedIssues) {
    const w = weights[issue] ?? 1
    const diff = Math.abs(userAnswers[issue] - positions[issue].score!)
    weightedDiff += diff * w
    totalWeight += w * 4
  }
  return Math.round((1 - weightedDiff / totalWeight) * 100)
}

function encodeResults(answers: Record<string, number>, weights: Record<string, number>): string {
  const payload = JSON.stringify({ a: answers, w: weights })
  return btoa(payload).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const ANSWER_OPTIONS = [
  { score: 5, label: 'Muy de acuerdo' },
  { score: 4, label: 'De acuerdo' },
  { score: 3, label: 'Neutral / No sé' },
  { score: 2, label: 'En desacuerdo' },
  { score: 1, label: 'Muy en desacuerdo' },
] as const

const WEIGHT_OPTIONS = [
  { value: 2, label: 'Muy importante' },
  { value: 1, label: 'Importante' },
  { value: 0.5, label: 'No tanto' },
] as const

export default function QuizWidgetClient() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [weights, setWeights] = useState<Record<string, number>>({})

  const isWeightingStep = step === TOTAL_QUESTIONS
  const isResultsStep = step > TOTAL_QUESTIONS
  const currentQuestion = step >= 0 && step < TOTAL_QUESTIONS ? allQuestions[step] : null

  const results = useMemo(() => {
    if (!isResultsStep) return []
    return candidatePositions
      .map((cp) => ({
        candidateId: cp.candidate_id,
        name: cp.candidate_name,
        party: cp.party,
        partyAbbr: cp.party_abbreviation,
        matchPct: calculateMatch(answers, weights, cp.positions),
      }))
      .filter((r) => r.matchPct !== null)
      .sort((a, b) => (b.matchPct ?? 0) - (a.matchPct ?? 0))
  }, [isResultsStep, answers, weights])

  // Post results to parent iframe
  useEffect(() => {
    if (isResultsStep && results.length > 0) {
      const encoded = encodeResults(answers, weights)
      window.parent?.postMessage({
        type: 'votoabierto-quiz-result',
        topMatch: results[0],
        resultsUrl: `https://votoabierto.pe/quiz?r=${encoded}`,
      }, '*')
    }
  }, [isResultsStep, results, answers, weights])

  const progress = isResultsStep ? 100 : Math.round((step / (TOTAL_QUESTIONS + 1)) * 100)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#F7F6F3] border-b border-[#E5E3DE] px-4 py-4 text-center">
        <p className="text-[#1A56A0] text-xs font-semibold uppercase tracking-widest mb-1">
          Quiz Electoral 2026
        </p>
        <h1 className="text-xl font-extrabold text-[#111111]">
          {isResultsStep ? 'Tus resultados' : '¿Con quién votas?'}
        </h1>
      </div>

      {/* Progress */}
      {!isResultsStep && (
        <div className="px-4 pt-4">
          <div className="flex justify-between text-xs text-[#777777] mb-1">
            <span>{isWeightingStep ? 'Prioriza temas' : `Pregunta ${step + 1} de ${TOTAL_QUESTIONS}`}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#EEEDE9] rounded-full overflow-hidden">
            <div className="h-full bg-[#1A56A0] rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="px-4 py-6">
        {/* Questions */}
        {currentQuestion && (
          <div>
            <h2 className="text-lg font-bold text-[#111111] mb-1">{currentQuestion.question}</h2>
            <p className="text-xs text-[#777777] italic mb-4">{currentQuestion.context}</p>
            <div className="space-y-2 mb-6">
              {ANSWER_OPTIONS.map((opt) => (
                <button
                  key={opt.score}
                  onClick={() => {
                    setAnswers((prev) => ({ ...prev, [currentQuestion.key]: opt.score }))
                    setStep((s) => s + 1)
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                    answers[currentQuestion.key] === opt.score
                      ? 'bg-[#EEF4FF] border-[#1A56A0] text-[#1A56A0]'
                      : 'bg-white border-[#E5E3DE] text-[#444444] hover:border-[#1A56A0]'
                  }`}
                >
                  <span className="font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              {step > 0 && (
                <button onClick={() => setStep((s) => s - 1)} className="text-xs text-[#777777] flex items-center gap-1">
                  <ArrowLeft size={14} /> Atrás
                </button>
              )}
              <button
                onClick={() => {
                  setAnswers((prev) => { const n = { ...prev }; delete n[currentQuestion.key]; return n })
                  setStep((s) => s + 1)
                }}
                className="text-xs text-[#777777] ml-auto"
              >
                Omitir
              </button>
            </div>
          </div>
        )}

        {/* Weighting */}
        {isWeightingStep && (
          <div>
            <h2 className="text-lg font-bold text-[#111111] mb-1">Prioriza tus temas</h2>
            <p className="text-xs text-[#777777] mb-4">¿Qué temas pesan más para tu decisión?</p>
            <div className="space-y-3 mb-6">
              {themes.map((theme) => {
                const themeQuestionKeys = theme.questions.map((q) => q.key)
                const hasAnswers = themeQuestionKeys.some((k) => k in answers)
                return (
                  <div key={theme.key} className={`p-3 rounded-lg border border-[#E5E3DE] ${!hasAnswers ? 'opacity-50' : ''}`}>
                    <p className="text-xs font-semibold text-[#111111] mb-1.5">
                      {theme.icon} {theme.label}
                    </p>
                    <div className="flex gap-1.5">
                      {WEIGHT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            for (const qk of themeQuestionKeys) {
                              setWeights((prev) => ({ ...prev, [qk]: opt.value }))
                            }
                          }}
                          disabled={!hasAnswers}
                          className={`flex-1 px-2 py-1.5 rounded text-xs font-medium border transition-colors ${
                            (weights[themeQuestionKeys[0]] ?? 1) === opt.value
                              ? 'bg-[#1A56A0] text-white border-[#1A56A0]'
                              : 'bg-white text-[#444444] border-[#E5E3DE]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep((s) => s - 1)} className="text-xs text-[#777777] flex items-center gap-1">
                <ArrowLeft size={14} /> Atrás
              </button>
              <button
                onClick={() => setStep(TOTAL_QUESTIONS + 1)}
                className="px-4 py-2 bg-[#1A56A0] text-white text-sm font-medium rounded-lg hover:bg-[#164A8A] transition-colors flex items-center gap-1"
              >
                Ver resultados <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {isResultsStep && (
          <div>
            <div className="space-y-2 mb-6">
              {results.slice(0, 5).map((r, i) => (
                <a
                  key={r.candidateId}
                  href={`https://votoabierto.pe/candidatos/${r.candidateId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border border-[#E5E3DE] bg-white hover:shadow transition-all"
                >
                  <span className="text-sm font-bold text-[#777777] w-6 text-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#111111] truncate">{r.name}</p>
                    <p className="text-xs text-[#777777] truncate">{r.party}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    (r.matchPct ?? 0) >= 80 ? 'bg-green-100 text-green-800 border-green-300' :
                    (r.matchPct ?? 0) >= 60 ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                    'bg-gray-100 text-gray-600 border-gray-300'
                  }`}>
                    {r.matchPct}%
                  </span>
                </a>
              ))}
            </div>

            <div className="text-center">
              <a
                href={`https://votoabierto.pe/quiz?r=${encodeResults(answers, weights)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-[#1A56A0] text-white text-sm font-medium rounded-lg hover:bg-[#164A8A] transition-colors"
              >
                Ver resultados completos en VotoAbierto
              </a>
            </div>

            <p className="text-center text-[10px] text-[#CBCAC5] mt-4">
              Datos: JNE | Elecciones 12 de abril 2026 | votoabierto.pe
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
