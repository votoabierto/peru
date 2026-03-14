import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const THRESHOLD = parseInt(process.env.QUIZ_RELEASE_THRESHOLD ?? '1000', 10)

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}

export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Not configured' }, { status: 503, headers: CORS })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { count, error: countError } = await supabase
      .from('quiz_responses')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      return NextResponse.json({ error: 'Query error' }, { status: 500, headers: CORS })
    }

    const total = count ?? 0

    if (total < THRESHOLD) {
      return NextResponse.json({
        status: 'collecting',
        count: total,
        threshold: THRESHOLD,
        message: `Recopilando respuestas. Resultados disponibles después de ${THRESHOLD} participantes.`,
      }, { status: 200, headers: CORS })
    }

    const { data, error } = await supabase
      .from('quiz_responses')
      .select('economic_score, social_score, institutions_score, top_match_candidate_id, department')

    if (error || !data) {
      return NextResponse.json({ error: 'Query error' }, { status: 500, headers: CORS })
    }

    const validEconomic = data.filter(r => r.economic_score != null).map(r => r.economic_score as number)
    const validSocial = data.filter(r => r.social_score != null).map(r => r.social_score as number)
    const validInstitutions = data.filter(r => r.institutions_score != null).map(r => r.institutions_score as number)

    const avg = (arr: number[]): number | null =>
      arr.length > 0 ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null

    const matchCounts: Record<string, number> = {}
    for (const row of data) {
      if (row.top_match_candidate_id) {
        matchCounts[row.top_match_candidate_id] = (matchCounts[row.top_match_candidate_id] ?? 0) + 1
      }
    }
    const topMatches = Object.entries(matchCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([candidateId, count]) => ({
        candidateId,
        count,
        percentage: Math.round((count / total) * 1000) / 10,
      }))

    const deptCounts: Record<string, number> = {}
    for (const row of data) {
      if (row.department) {
        deptCounts[row.department] = (deptCounts[row.department] ?? 0) + 1
      }
    }

    return NextResponse.json({
      status: 'published',
      total_responses: total,
      last_updated: new Date().toISOString(),
      aggregate: {
        avg_economic_score: avg(validEconomic),
        avg_social_score: avg(validSocial),
        avg_institutions_score: avg(validInstitutions),
      },
      top_matches: topMatches,
      by_department: deptCounts,
      privacy_notice: 'Todas las respuestas son anónimas. No se almacenan IPs ni datos personales.',
    }, { status: 200, headers: CORS })
  } catch (err) {
    console.error('quiz results error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500, headers: CORS })
  }
}
