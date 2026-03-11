'use client'
import { useState } from 'react'
import { CriminalRecord } from '@/lib/types'

interface Props {
  records: CriminalRecord[]
}

export function CandidateCriminalRecord({ records }: Props) {
  const [open, setOpen] = useState(false)

  if (records.length === 0) return null

  const OUTCOME_COLORS: Record<string, string> = {
    Sobreseído: 'text-green-400',
    Condenado: 'text-red-400',
    'En proceso': 'text-yellow-400',
    Archivado: 'text-gray-400',
    Sancionado: 'text-orange-400',
  }

  return (
    <div className="border border-orange-900/50 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-orange-900/20 hover:bg-orange-900/30 transition-colors text-left"
      >
        <span className="flex items-center gap-2 text-orange-300 font-medium">
          <span>⚖️</span>
          <span>Antecedentes legales ({records.length})</span>
        </span>
        <span className="text-orange-400 text-lg">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="divide-y divide-gray-800">
          {records.map((r) => (
            <div key={r.id} className="px-4 py-4 bg-gray-900/50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-gray-300 text-sm font-medium mb-1">{r.description}</div>
                  {r.court && <div className="text-gray-500 text-xs">{r.court}</div>}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-gray-500 text-xs mb-1">{r.year}</div>
                  <div
                    className={`text-xs font-semibold ${
                      OUTCOME_COLORS[r.outcome] ?? 'text-gray-300'
                    }`}
                  >
                    {r.outcome}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
