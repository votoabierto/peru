import { NextRequest, NextResponse } from 'next/server'
import candidatesData from '@/data/candidates.json'
import type { DataConfidence } from '@/lib/types'

interface PresidentialCandidateJSON {
  id: string
  slug: string
  full_name: string
  party_id: string
  party_abbreviation: string
  party_name: string
  role: string
  bio_short: string | null
  career_summary: string | null
  photo_url: string | null
  jne_profile_url: string | null
  jne_ocupacion: string[] | null
  jne_url_plan: string | null
  has_criminal_record: boolean
  data_confidence: DataConfidence
  created_at: string
  updated_at: string
}

const CORS = { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=3600' }

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const party = searchParams.get('party')
  const q = searchParams.get('q')

  let candidates = candidatesData as PresidentialCandidateJSON[]

  if (party) {
    candidates = candidates.filter(c =>
      c.party_abbreviation?.toLowerCase() === party.toLowerCase() ||
      c.party_id?.toLowerCase() === party.toLowerCase()
    )
  }

  if (q) {
    const query = q.toLowerCase()
    candidates = candidates.filter(c =>
      c.full_name?.toLowerCase().includes(query) ||
      c.party_name?.toLowerCase().includes(query)
    )
  }

  const clean = candidates.map((c: PresidentialCandidateJSON) => ({
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
