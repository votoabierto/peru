import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'

const VALID_TYPES = [
  'fact_correction',
  'new_proposal',
  'criminal_record',
  'government_plan',
  'social_media',
  'news_article',
  'other',
] as const

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { candidate_id, candidate_name, contribution_type, content, source_url, contributor_email } = body as {
    candidate_id?: string
    candidate_name?: string
    contribution_type?: string
    content?: string
    source_url?: string
    contributor_email?: string
  }

  if (!candidate_id || !candidate_name || !contribution_type || !content) {
    return NextResponse.json({ error: 'Campos requeridos: candidate_id, candidate_name, contribution_type, content' }, { status: 400 })
  }

  if (!VALID_TYPES.includes(contribution_type as typeof VALID_TYPES[number])) {
    return NextResponse.json({ error: 'Tipo de contribución no válido' }, { status: 400 })
  }

  // source_url required for all types except 'other'
  if (contribution_type !== 'other' && !source_url) {
    return NextResponse.json({ error: 'Se requiere URL de fuente para este tipo de contribución' }, { status: 400 })
  }

  if (!isSupabaseConfigured()) {
    // In dev without Supabase, just acknowledge
    return NextResponse.json({ success: true, message: 'Contribución recibida (modo desarrollo)' })
  }

  const client = getSupabaseClient()!
  const { error } = await client.from('community_contributions').insert({
    candidate_id,
    candidate_name,
    contribution_type,
    content,
    source_url: source_url || null,
    contributor_email: contributor_email || null,
  })

  if (error) {
    console.error('[VotoAbierto] Error inserting contribution:', error)
    return NextResponse.json({ error: 'Error al guardar la contribución' }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: 'Contribución recibida. Será revisada antes de publicarse.' })
}
