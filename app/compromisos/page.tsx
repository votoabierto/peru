'use client'

import Link from 'next/link'
import { useState } from 'react'
import pledgesData from '@/data/pledges.json'
import { Pledge, PledgeCategory, PLEDGE_CATEGORY_LABELS } from '@/lib/types'

const pledges = pledgesData as unknown as Pledge[]

const ALL_CATEGORIES: PledgeCategory[] = [
  'anticorrupcion', 'educacion', 'medioambiente', 'economia', 'salud', 'democracia', 'seguridad',
]

function countByStatus(pledge: Pledge) {
  const responses = Object.values(pledge.responses)
  return {
    committed: responses.filter((r) => r.status === 'committed').length,
    declined: responses.filter((r) => r.status === 'declined').length,
    no_response: responses.filter((r) => r.status === 'no_response').length,
    total: responses.length,
  }
}

export default function CompromisosPage() {
  const [activeCategory, setActiveCategory] = useState<PledgeCategory | 'all'>('all')

  const filtered = activeCategory === 'all'
    ? pledges
    : pledges.filter((p) => p.category === activeCategory)

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-[#111111] mb-2">Compromisos Ciudadanos</h1>
        <p className="text-[#555555] mb-8 max-w-2xl">
          Compromisos propuestos por la ciudadanía que los candidatos presidenciales pueden adoptar
          públicamente. Las respuestas — o silencios — se documentan objetivamente.
        </p>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              activeCategory === 'all'
                ? 'bg-[#111111] text-white border-[#111111]'
                : 'bg-white text-[#555555] border-[#E5E3DE] hover:border-[#111111]'
            }`}
          >
            Todos ({pledges.length})
          </button>
          {ALL_CATEGORIES.map((cat) => {
            const meta = PLEDGE_CATEGORY_LABELS[cat]
            const count = pledges.filter((p) => p.category === cat).length
            if (count === 0) return null
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  activeCategory === cat
                    ? 'bg-[#111111] text-white border-[#111111]'
                    : `bg-white text-[#555555] border-[#E5E3DE] hover:border-[#111111]`
                }`}
              >
                {meta.label} ({count})
              </button>
            )
          })}
        </div>

        {/* Pledge cards */}
        <div className="space-y-4">
          {filtered.map((pledge) => {
            const counts = countByStatus(pledge)
            const catMeta = PLEDGE_CATEGORY_LABELS[pledge.category]
            return (
              <Link
                key={pledge.id}
                href={`/compromisos/${pledge.id}`}
                className="block border border-[#E5E3DE] rounded-xl p-5 hover:shadow-md transition-all bg-white"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h2 className="text-lg font-semibold text-[#111111]">{pledge.title}</h2>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium whitespace-nowrap ${catMeta.color}`}>
                    {catMeta.label}
                  </span>
                </div>
                <p className="text-sm text-[#555555] mb-4 line-clamp-2">{pledge.description}</p>
                <div className="flex items-center gap-4 text-xs text-[#777777]">
                  {counts.committed > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      {counts.committed} comprometidos
                    </span>
                  )}
                  {counts.declined > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      {counts.declined} rechazados
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-300" />
                    {counts.no_response} sin respuesta
                  </span>
                  <span className="ml-auto text-[#CBCAC5]">de {counts.total} candidatos</span>
                </div>
              </Link>
            )
          })}
        </div>

        {/* CTA to propose */}
        <div className="mt-10 p-6 border border-dashed border-[#E5E3DE] rounded-xl text-center">
          <h3 className="text-base font-semibold text-[#111111] mb-2">Propone un compromiso</h3>
          <p className="text-sm text-[#555555] mb-4">
            Los compromisos son propuestos por la ciudadanía. Si tienes una propuesta
            específica y verificable, puedes enviarla a través de GitHub.
          </p>
          <a
            href="https://github.com/ApoEsp/votoclaro/issues/new?template=pledge.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#1A56A0] border border-[#1A56A0] rounded-lg hover:bg-[#EEF4FF] transition-colors"
          >
            Proponer compromiso
          </a>
        </div>
      </div>
    </main>
  )
}
