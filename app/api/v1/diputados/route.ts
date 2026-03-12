import { NextRequest, NextResponse } from 'next/server'
import diputadosData from '@/data/diputados-candidates.json'

const CORS = { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=3600' }

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const party = searchParams.get('party')
  const district = searchParams.get('district')
  const q = searchParams.get('q')
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '100', 10) || 100, 1), 500)
  const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10) || 0, 0)

  let candidates = diputadosData as Record<string, unknown>[]

  if (party) {
    candidates = candidates.filter(c =>
      (c.partyId as string)?.toLowerCase() === party.toLowerCase() ||
      (c.party as string)?.toLowerCase() === party.toLowerCase()
    )
  }

  if (district) {
    const d = district.toLowerCase()
    candidates = candidates.filter(c =>
      (c.district as string)?.toLowerCase() === d
    )
  }

  if (q) {
    const query = q.toLowerCase()
    candidates = candidates.filter(c =>
      (c.name as string)?.toLowerCase().includes(query)
    )
  }

  const total = candidates.length
  const paginated = candidates.slice(offset, offset + limit)

  const clean = paginated.map(c => ({
    id: c.id,
    name: c.name,
    party: c.party,
    partyId: c.partyId,
    district: c.district,
    listPosition: c.listPosition,
    imageUrl: c.imageUrl ?? null,
    electionType: c.electionType,
  }))

  return NextResponse.json({
    total,
    limit,
    offset,
    election_type: 'diputados',
    data: clean,
  }, { headers: CORS })
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: { ...CORS, 'Access-Control-Allow-Methods': 'GET', 'Access-Control-Allow-Headers': '*' },
  })
}
