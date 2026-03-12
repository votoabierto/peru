import { NextRequest, NextResponse } from 'next/server'
import partiesData from '@/data/parties.json'

const CORS = { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=3600' }

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')

  let parties = partiesData as Record<string, unknown>[]

  if (q) {
    const query = q.toLowerCase()
    parties = parties.filter(p =>
      (p.name as string)?.toLowerCase().includes(query) ||
      (p.abbr as string)?.toLowerCase().includes(query)
    )
  }

  const clean = parties.map(p => ({
    id: p.id,
    name: p.name,
    abbr: p.abbr,
    color: p.color,
    ideological_family: p.ideological_family,
    spectrum: p.spectrum,
    presidentCandidate: p.presidentCandidate,
  }))

  return NextResponse.json({
    total: clean.length,
    data: clean,
  }, { headers: CORS })
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: { ...CORS, 'Access-Control-Allow-Methods': 'GET', 'Access-Control-Allow-Headers': '*' },
  })
}
