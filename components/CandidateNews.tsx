'use client'

import { useState, useEffect } from 'react'

interface NewsItem {
  headline: string
  source_name: string | null
  source_url: string
  published_at: string | null
  summary: string | null
}

export default function CandidateNews({ slug }: { slug: string }) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/candidatos/${slug}/noticias`)
      .then(res => res.json())
      .then(data => setNews(data.news || []))
      .catch(() => setNews([]))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-[#F7F6F3] rounded-lg" />
        ))}
      </div>
    )
  }

  if (news.length === 0) {
    return (
      <p className="text-[#999999] text-sm italic">No hay noticias recientes verificadas.</p>
    )
  }

  return (
    <div className="space-y-3">
      {news.map((item, i) => (
        <a
          key={i}
          href={item.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block border border-[#E5E3DE] rounded-lg p-4 hover:bg-[#F7F6F3] transition-colors"
        >
          <h4 className="text-sm font-medium text-[#111111] leading-snug mb-1">{item.headline}</h4>
          <div className="flex items-center gap-2 text-xs text-[#999999]">
            {item.source_name && <span>{item.source_name}</span>}
            {item.source_name && item.published_at && <span>·</span>}
            {item.published_at && (
              <span>{new Date(item.published_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}</span>
            )}
          </div>
        </a>
      ))}
      <a
        href={`https://news.google.com/search?q=${encodeURIComponent(slug.replace(/-/g, ' '))}+Peru+2026&hl=es-419&gl=PE&ceid=PE:es-419`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-sm text-[#1A56A0] hover:underline mt-1"
      >
        Ver más en Google News →
      </a>
    </div>
  )
}
