import { NextRequest, NextResponse } from 'next/server'
import candidatePositionsData from '@/data/candidate-positions.json'

type CandidatePosition = {
  candidate_id: string
  candidate_name: string
  party: string
  party_abbreviation: string
  positions: Record<string, { score: number; label: string; verified: boolean }>
}

const candidatePositions = candidatePositionsData as CandidatePosition[]

function calculateMatch(
  userAnswers: Record<string, number>,
  candidateScores: Record<string, number>,
): number {
  const answeredIssues = Object.keys(userAnswers)
  if (answeredIssues.length === 0) return 0
  const totalDiff = answeredIssues.reduce((sum, issue) => {
    const userScore = userAnswers[issue] ?? 3
    const candidateScore = candidateScores[issue] ?? 3
    return sum + Math.abs(userScore - candidateScore)
  }, 0)
  const maxPossibleDiff = answeredIssues.length * 4
  return Math.round((1 - totalDiff / maxPossibleDiff) * 100)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { answers, department } = body as {
    answers: Record<string, number>
    department?: string
  }

  if (!answers || typeof answers !== 'object') {
    return NextResponse.json({ error: 'answers is required' }, { status: 400 })
  }

  const matches = candidatePositions
    .map((cp) => {
      const scores: Record<string, number> = {}
      for (const [key, val] of Object.entries(cp.positions)) {
        scores[key] = val.score
      }
      return {
        candidateId: cp.candidate_id,
        name: cp.candidate_name,
        party: cp.party,
        partyAbbr: cp.party_abbreviation,
        matchPct: calculateMatch(answers, scores),
      }
    })
    .sort((a, b) => b.matchPct - a.matchPct)

  return NextResponse.json({
    matches,
    department: department ?? null,
    answeredQuestions: Object.keys(answers).length,
  })
}
