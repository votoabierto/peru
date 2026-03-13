import { NextRequest, NextResponse } from 'next/server'
import candidatePositionsData from '@/data/candidate-positions.json'

type CandidatePosition = {
  candidate_id: string
  candidate_name: string
  party: string
  party_abbreviation: string
  positions: Record<string, { score: number | null; label: string; verified: boolean }>
}

const candidatePositions = candidatePositionsData as CandidatePosition[]

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

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json()
  const { answers, weights, department } = body as {
    answers: Record<string, number>
    weights?: Record<string, number>
    department?: string
  }

  if (!answers || typeof answers !== 'object') {
    return NextResponse.json({ error: 'answers is required' }, { status: 400 })
  }

  const resolvedWeights = weights ?? {}

  const matches = candidatePositions
    .map((cp) => {
      const { matchPct, verifiedIssueCount, dataQuality } = calculateMatch(answers, resolvedWeights, cp.positions)
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
    .sort((a, b) => (b.matchPct ?? -1) - (a.matchPct ?? -1))

  return NextResponse.json({
    matches,
    department: department ?? null,
    answeredQuestions: Object.keys(answers).length,
  })
}
