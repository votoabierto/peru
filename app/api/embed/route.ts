import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'quiz'
  const slug = searchParams.get('slug') || ''
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://votoabierto.pe'

  let src: string
  let height: string
  let title: string

  switch (type) {
    case 'candidato':
      if (!slug) {
        return NextResponse.json({ error: 'slug parameter required for candidato embed' }, { status: 400 })
      }
      src = `${baseUrl}/widget/candidato/${slug}`
      height = '480'
      title = 'Candidato VotoAbierto 2026'
      break
    case 'quiz':
    default:
      src = `${baseUrl}/widget/quiz`
      height = '600'
      title = 'Quiz Electoral VotoAbierto 2026'
      break
  }

  const embedCode = `<iframe src="${src}" width="100%" height="${height}" frameborder="0" style="border:none;border-radius:12px;max-width:480px;" title="${title}" loading="lazy"></iframe>`

  return NextResponse.json({ embed: embedCode, src, type })
}
