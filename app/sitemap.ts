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

  return allPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : path.startsWith('/candidatos/') ? 0.8 : 0.6,
  }))
}
