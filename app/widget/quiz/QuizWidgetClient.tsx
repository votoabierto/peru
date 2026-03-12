'use client'

import { useState, useMemo, useEffect } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import issuesData from '@/data/issues.json'
import candidatePositionsData from '@/data/candidate-positions.json'

type CandidatePosition = {
  candidate_id: string
  candidate_name: string
  party: string
  party_abbreviation: string
  positions: Record<string, { score: number | null; label: string; verified: boolean }>
}

const issues = issuesData.issues
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

const WEIGHT_OPTIONS = [
  { value: 2, label: 'Muy importante' },
  { value: 1, label: 'Importante' },
  { value: 0.5, label: 'No tanto' },
] as const

export default function QuizWidgetClient() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [weights, setWeights] = useState<Record<string, number>>({})

  const isWeightingStep = step === issues.length
  const isResultsStep = step > issues.length
  const currentIssue = step >= 0 && step < issues.length ? issues[step] : null

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

  const progress = isResultsStep ? 100 : Math.round((step / (issues.length + 1)) * 100)

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
            <span>{isWeightingStep ? 'Prioriza temas' : `Pregunta ${step + 1} de ${issues.length}`}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#EEEDE9] rounded-full overflow-hidden">
            <div className="h-full bg-[#1A56A0] rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="px-4 py-6">
        {/* Questions */}
        {currentIssue && (
          <div>
            <h2 className="text-lg font-bold text-[#111111] mb-1">{currentIssue.label}</h2>
            <p className="text-sm text-[#444444] mb-6">{currentIssue.question}</p>
            <div className="space-y-2 mb-6">
              {[
                { score: 1, label: currentIssue.left_label, sub: 'Muy de acuerdo' },
                { score: 2, label: currentIssue.left_label, sub: 'De acuerdo' },
                { score: 3, label: 'Centro / No tengo posición clara', sub: '' },
                { score: 4, label: currentIssue.right_label, sub: 'De acuerdo' },
                { score: 5, label: currentIssue.right_label, sub: 'Muy de acuerdo' },
              ].map((opt) => (
                <button
                  key={opt.score}
                  onClick={() => {
                    setAnswers((prev) => ({ ...prev, [currentIssue.key]: opt.score }))
                    setStep((s) => s + 1)
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                    answers[currentIssue.key] === opt.score
                      ? 'bg-[#EEF4FF] border-[#1A56A0] text-[#1A56A0]'
                      : 'bg-white border-[#E5E3DE] text-[#444444] hover:border-[#1A56A0]'
                  }`}
                >
                  <span className="font-medium">{opt.label}</span>
                  {opt.sub && <span className="text-xs text-[#777777] ml-1">({opt.sub})</span>}
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
                  setAnswers((prev) => { const n = { ...prev }; delete n[currentIssue.key]; return n })
                  setStep((s) => s + 1)
                }}
                className="text-xs text-[#777777] ml-auto"
              >
                Prefiero no responder
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
              {issues.map((issue) => {
                const answered = issue.key in answers
                return (
                  <div key={issue.key} className={`p-3 rounded-lg border border-[#E5E3DE] ${!answered ? 'opacity-50' : ''}`}>
                    <p className="text-xs font-semibold text-[#111111] mb-1.5">{issue.label}</p>
                    <div className="flex gap-1.5">
                      {WEIGHT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setWeights((prev) => ({ ...prev, [issue.key]: opt.value }))}
                          disabled={!answered}
                          className={`flex-1 px-2 py-1.5 rounded text-xs font-medium border transition-colors ${
                            (weights[issue.key] ?? 1) === opt.value
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
                onClick={() => setStep(issues.length + 1)}
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
