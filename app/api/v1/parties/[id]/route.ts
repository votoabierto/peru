import { NextRequest, NextResponse } from 'next/server'
import partiesData from '@/data/parties.json'

interface PartyJSON {
  id: string
  name: string
  abbr: string
  color: string
  presidentCandidate: string | null
}

const CORS = { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=3600' }

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params
  const parties = partiesData as PartyJSON[]
  const party = parties.find(p => p.id === id || p.abbr?.toLowerCase() === id.toLowerCase())

  if (!party) {
    return NextResponse.json(
      { error: 'Party not found', id },
      { status: 404, headers: CORS }
    )
  }

  return NextResponse.json({
    data: {
      id: party.id,
      name: party.name,
      abbr: party.abbr,
      color: party.color,
      presidentCandidate: party.presidentCandidate,
    },
  }, { headers: CORS })
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: { ...CORS, 'Access-Control-Allow-Methods': 'GET', 'Access-Control-Allow-Headers': '*' },
  })
}
