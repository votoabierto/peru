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

  const totalDiff = sharedIssues.reduce((sum, issue) => {
    const userScore = userAnswers[issue]
    const candidateScore = candidatePositions[issue].score!
    return sum + Math.abs(userScore - candidateScore)
  }, 0)

  const maxPossibleDiff = sharedIssues.length * 4
  const matchPct = Math.round((1 - totalDiff / maxPossibleDiff) * 100)

  return { matchPct, verifiedIssueCount, dataQuality }
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
    .sort((a, b) => (b.matchPct ?? -1) - (a.matchPct ?? -1))

  return NextResponse.json({
    matches,
    department: department ?? null,
    answeredQuestions: Object.keys(answers).length,
  })
}
