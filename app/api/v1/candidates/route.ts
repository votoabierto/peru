import { NextRequest, NextResponse } from 'next/server'
import candidatesData from '@/data/candidates.json'

const CORS = { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=3600' }

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const party = searchParams.get('party')
  const q = searchParams.get('q')

  let candidates = candidatesData as Record<string, unknown>[]

  if (party) {
    candidates = candidates.filter(c =>
      (c.party_abbreviation as string)?.toLowerCase() === party.toLowerCase() ||
      (c.party_id as string)?.toLowerCase() === party.toLowerCase()
    )
  }

  if (q) {
    const query = q.toLowerCase()
    candidates = candidates.filter(c =>
      (c.full_name as string)?.toLowerCase().includes(query) ||
      (c.party_name as string)?.toLowerCase().includes(query)
    )
  }

  const clean = candidates.map(c => ({
    id: c.id,
    slug: c.slug,
    full_name: c.full_name,
    party_id: c.party_id,
    party_name: c.party_name,
    party_abbreviation: c.party_abbreviation,
    photo_url: c.photo_url,
    bio_short: c.bio_short,
    jne_ocupacion: c.jne_ocupacion,
    jne_url_plan: c.jne_url_plan,
    has_criminal_record: c.has_criminal_record,
    data_confidence: c.data_confidence,
    jne_profile_url: c.jne_profile_url,
  }))

  return NextResponse.json({
    total: clean.length,
    election_type: 'presidente',
    data: clean,
  }, { headers: CORS })
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: { ...CORS, 'Access-Control-Allow-Methods': 'GET', 'Access-Control-Allow-Headers': '*' },
  })
}
