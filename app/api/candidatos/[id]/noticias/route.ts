import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'
import { SEED_CANDIDATES } from '@/lib/seed-data'

interface NewsItem {
  headline: string
  source_name: string | null
  source_url: string
  published_at: string | null
  summary: string | null
}

function parseRssItems(xml: string): NewsItem[] {
  const items: NewsItem[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1]
    const title = itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1').trim() || ''
    const link = itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() || ''
    const pubDate = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() || null
    const source = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1').trim() || null
    const description = itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1').replace(/<[^>]*>/g, '').trim() || null

    if (title && link) {
      items.push({
        headline: title,
        source_name: source,
        source_url: link,
        published_at: pubDate ? new Date(pubDate).toISOString() : null,
        summary: description?.slice(0, 300) || null,
      })
    }
  }

  return items.slice(0, 10)
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id: slug } = await params
  const candidate = SEED_CANDIDATES.find(c => c.slug === slug || c.id === slug)

  if (!candidate) {
    return NextResponse.json({ error: 'Candidato no encontrado' }, { status: 404 })
  }

  // Check cache in Supabase
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient()!
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const { data: cached } = await client
      .from('candidate_news')
      .select('*')
      .eq('candidate_id', candidate.slug)
      .gte('fetched_at', sevenDaysAgo)
      .order('published_at', { ascending: false })
      .limit(10)

    if (cached && cached.length > 0) {
      return NextResponse.json({ news: cached })
    }
  }

  // Fetch from Google News RSS
  const searchName = encodeURIComponent(`${candidate.full_name} Peru 2026`)
  const rssUrl = `https://news.google.com/rss/search?q=${searchName}&hl=es-419&gl=PE&ceid=PE:es-419`

  try {
    const res = await fetch(rssUrl, {
      headers: { 'User-Agent': 'VotoAbierto/1.0' },
      next: { revalidate: 3600 }, // cache for 1 hour
    })

    if (!res.ok) {
      return NextResponse.json({ news: [], message: 'No se pudieron obtener noticias' })
    }

    const xml = await res.text()
    const items = parseRssItems(xml)

    // Store in Supabase if configured
    if (isSupabaseConfigured() && items.length > 0) {
      const client = getSupabaseClient()!
      const rows = items.map(item => ({
        candidate_id: candidate.slug,
        candidate_name: candidate.full_name,
        headline: item.headline,
        summary: item.summary,
        source_name: item.source_name,
        source_url: item.source_url,
        published_at: item.published_at,
        category: 'general' as const,
      }))
      const { error: insertErr } = await client.from('candidate_news').insert(rows)
      if (insertErr) {
        console.warn('[VotoAbierto] News cache insert failed:', insertErr.message)
      }
    }

    return NextResponse.json({ news: items })
  } catch (err) {
    console.error('[VotoAbierto] News fetch error:', err)
    return NextResponse.json({ news: [], message: 'Error al obtener noticias' })
  }
}
