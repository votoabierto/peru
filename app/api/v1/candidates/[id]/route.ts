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
  photo_url: string | null
  bio_short: string | null
  career_summary: string | null
  jne_ocupacion: string[] | null
  jne_url_plan: string | null
  jne_profile_url: string | null
  jne_titulos_academicos: string[] | null
  jne_bienes: Record<string, unknown> | null
  has_criminal_record: boolean
  sentencia_penal: string | null
  sentencia_penal_detalle: Record<string, unknown>[] | null
  planGobiernoResumen: string | null
  planGobiernoEjes: Array<{ eje: string; descripcion: string }> | null
  proposals: string[] | null
  social_media: Record<string, string | null> | null
  data_confidence: DataConfidence
  updated_at: string
}

const CORS = { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=3600' }

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const candidates = candidatesData as PresidentialCandidateJSON[]
  const candidate = candidates.find(c => c.id === id || c.slug === id)

  if (!candidate) {
    return NextResponse.json(
      { error: 'Candidate not found', id },
      { status: 404, headers: CORS }
    )
  }

  return NextResponse.json({
    election_type: 'presidente',
    data: {
      id: candidate.id,
      slug: candidate.slug,
      full_name: candidate.full_name,
      party_id: candidate.party_id,
      party_name: candidate.party_name,
      party_abbreviation: candidate.party_abbreviation,
      photo_url: candidate.photo_url,
      bio_short: candidate.bio_short,
      career_summary: candidate.career_summary,
      jne_ocupacion: candidate.jne_ocupacion,
      jne_url_plan: candidate.jne_url_plan,
      jne_profile_url: candidate.jne_profile_url,
      jne_titulos_academicos: candidate.jne_titulos_academicos,
      jne_bienes: candidate.jne_bienes,
      has_criminal_record: candidate.has_criminal_record,
      sentencia_penal: candidate.sentencia_penal,
      sentencia_penal_detalle: candidate.sentencia_penal_detalle,
      planGobiernoResumen: candidate.planGobiernoResumen,
      planGobiernoEjes: candidate.planGobiernoEjes,
      proposals: candidate.proposals,
      social_media: candidate.social_media,
      data_confidence: candidate.data_confidence,
      updated_at: candidate.updated_at,
    },
  }, { headers: CORS })
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: { ...CORS, 'Access-Control-Allow-Methods': 'GET', 'Access-Control-Allow-Headers': '*' },
  })
}
