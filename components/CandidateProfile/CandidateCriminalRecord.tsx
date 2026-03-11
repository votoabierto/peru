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
    Sobreseído: 'text-[#1A6B35]',
    Condenado: 'text-[#9B1C1C]',
    'En proceso': 'text-[#92400E]',
    Archivado: 'text-[#777777]',
    Sancionado: 'text-[#92400E]',
  }

  return (
    <div className="border border-[#D97706] rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#FFFBEB] hover:bg-[#FEF3C7] transition-colors text-left"
      >
        <span className="flex items-center gap-2 text-[#92400E] font-medium">
          <span>⚖️</span>
          <span>Antecedentes legales ({records.length})</span>
        </span>
        <span className="text-[#92400E] text-lg">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="divide-y divide-[#E5E3DE]">
          {records.map((r) => (
            <div key={r.id} className="px-4 py-4 bg-[#F7F6F3]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[#444444] text-sm font-medium mb-1">{r.description}</div>
                  {r.court && <div className="text-[#777777] text-xs">{r.court}</div>}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[#777777] text-xs mb-1">{r.year}</div>
                  <div
                    className={`text-xs font-semibold ${
                      OUTCOME_COLORS[r.outcome] ?? 'text-[#4B5563]'
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
