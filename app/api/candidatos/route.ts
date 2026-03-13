import { NextRequest, NextResponse } from 'next/server'
import { getCandidates, type CandidateFilters } from '@/lib/data'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)

  const filters: CandidateFilters = {}
  const role = searchParams.get('role')
  const party = searchParams.get('party')
  const q = searchParams.get('q')

  if (
    role === 'president' ||
    role === 'vice_president' ||
    role === 'senator' ||
    role === 'representative'
  ) {
    filters.role = role
  }
  if (party) filters.party = party
  if (q) filters.searchQuery = q

  try {
    const candidates = await getCandidates(filters)
    return NextResponse.json({ candidates, total: candidates.length })
  } catch (error) {
    console.error('API /candidatos error:', error)
    return NextResponse.json(
      { error: 'Error al obtener candidatos' },
      { status: 500 }
    )
  }
}
