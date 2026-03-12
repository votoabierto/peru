import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tipo, descripcion, fuente_url, page_url, candidate_slug } = body

    if (!tipo || !descripcion) {
      return NextResponse.json(
        { error: 'tipo and descripcion are required' },
        { status: 400 }
      )
    }

    const validTypes = ['dato_incorrecto', 'falta_informacion', 'link_roto', 'other']
    if (!validTypes.includes(tipo)) {
      return NextResponse.json(
        { error: 'Invalid tipo' },
        { status: 400 }
      )
    }

    if (descripcion.length > 300) {
      return NextResponse.json(
        { error: 'descripcion must be 300 characters or less' },
        { status: 400 }
      )
    }

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!
      const { error } = await client.from('community_contributions').insert({
        candidate_id: candidate_slug ?? 'unknown',
        candidate_name: candidate_slug ?? 'unknown',
        contribution_type: tipo,
        content: descripcion,
        source_url: fuente_url ?? null,
        page_url: page_url ?? null,
        candidate_slug: candidate_slug ?? null,
        status: 'pending',
      })

      if (error) {
        console.error('[VotoAbierto] Feedback insert error:', error)
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
      }
    } else {
      // Log to console when Supabase is not configured
      console.log('[VotoAbierto] Feedback received (no DB):', { tipo, descripcion, fuente_url, page_url, candidate_slug })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
