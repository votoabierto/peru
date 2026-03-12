import type { MetadataRoute } from 'next'
import candidatesData from '@/data/candidates.json'
import regionsJson from '@/data/regions.json'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://votoabierto.pe'

  const staticPages = [
    '',
    '/candidatos',
    '/comparar',
    '/quiz',
    '/senado',
    '/diputados',
    '/parlamento-andino',
    '/regiones',
    '/buscar',
    '/contribuir',
    '/datos',
    '/metodologia',
    '/verificar',
    '/congreso',
  ]

  const candidatePages = candidatesData.map((c: { slug: string }) => `/candidatos/${c.slug}`)

  const regionPages = (regionsJson as Array<{ code: string }>).map(
    (r) => `/regiones/${r.code.toLowerCase()}`
  )

  const allPages = [...staticPages, ...candidatePages, ...regionPages]

  const priorityMap: Record<string, number> = {
    '': 1.0,
    '/candidatos': 0.9,
    '/quiz': 0.9,
    '/comparar': 0.8,
    '/senado': 0.8,
    '/diputados': 0.7,
    '/parlamento-andino': 0.7,
    '/regiones': 0.7,
    '/verificar': 0.7,
    '/datos': 0.6,
    '/metodologia': 0.5,
  }

  return allPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: (path === '' ? 'daily' : 'weekly') as 'daily' | 'weekly',
    priority: priorityMap[path] ?? (path.startsWith('/candidatos/') ? 0.8 : path.startsWith('/regiones/') ? 0.6 : 0.5),
  }))
}
