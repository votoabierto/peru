import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')
      ?? 'unknown'

    const body = await request.json()
    const {
      answers,
      economic_score,
      social_score,
      institutions_score,
      top_match_candidate_id,
      top_match_score,
      completed_seconds,
      department,
    } = body

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'Invalid answers' }, { status: 400, headers: CORS })
    }

    // Speed check: reject bots (must take at least 25s)
    if (completed_seconds !== undefined && completed_seconds < 25) {
      return NextResponse.json({ ok: true, stored: false }, { status: 200, headers: CORS })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) {
      console.error('quiz submit: missing Supabase config')
      return NextResponse.json({ ok: true, stored: false }, { status: 200, headers: CORS })
    }

    // Hash IP (one-way) for dedup check
    const salt = process.env.QUIZ_DEDUP_SALT ?? 'votoabierto-salt-2026'
    const ipHash = createHash('sha256').update(ip + salt).digest('hex')

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check dedup
    const { data: existing } = await supabase
      .from('quiz_dedup')
      .select('ip_hash, created_at')
      .eq('ip_hash', ipHash)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ ok: true, stored: false }, { status: 200, headers: CORS })
    }

    // Store anonymous response
    const { error: insertError } = await supabase
      .from('quiz_responses')
      .insert({
        answers,
        economic_score: economic_score ?? null,
        social_score: social_score ?? null,
        institutions_score: institutions_score ?? null,
        top_match_candidate_id: top_match_candidate_id ?? null,
        top_match_score: top_match_score ?? null,
        completed_seconds: completed_seconds ?? null,
        department: department ?? null,
      })

    if (insertError) {
      console.error('quiz_responses insert error:', insertError)
      return NextResponse.json({ error: 'Storage error' }, { status: 500, headers: CORS })
    }

    // Record dedup hash (separate table, zero link to response)
    await supabase.from('quiz_dedup').insert({ ip_hash: ipHash })

    return NextResponse.json({ ok: true, stored: true }, { status: 200, headers: CORS })
  } catch (err) {
    console.error('quiz submit error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500, headers: CORS })
  }
}
