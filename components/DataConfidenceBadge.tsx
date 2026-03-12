'use client'

import { useState } from 'react'
import type { DataConfidence } from '@/lib/types'

const CONFIDENCE_CONFIG: Record<DataConfidence, { label: string; bg: string; text: string; border: string; description: string }> = {
  official: {
    label: 'Oficial JNE',
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    description: 'Datos verificados directamente de fuentes oficiales del JNE (Jurado Nacional de Elecciones).',
  },
  scraped: {
    label: 'Extraído JNE',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    description: 'Datos extraídos de la API pública del JNE. Algunos campos pueden estar incompletos.',
  },
  community: {
    label: 'Contribución ciudadana',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    description: 'Datos aportados por la comunidad. Pendiente de verificación con fuentes oficiales.',
  },
  pending: {
    label: 'Sin verificar',
    bg: 'bg-gray-50',
    text: 'text-gray-500',
    border: 'border-gray-200',
    description: 'Datos pendientes de verificación. Consulte la fuente oficial para confirmar.',
  },
}

interface Props {
  confidence: DataConfidence
  source?: string
  lastVerified?: string | null
  className?: string
}

export default function DataConfidenceBadge({ confidence, source, lastVerified, className = '' }: Props) {
  const [showTooltip, setShowTooltip] = useState(false)
  const config = CONFIDENCE_CONFIG[confidence]

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium ${config.bg} ${config.text} ${config.border} cursor-help transition-colors`}
      >
        {confidence === 'official' && <span>&#10003;</span>}
        {config.label}
      </button>

      {showTooltip && (
        <div className="absolute z-50 bottom-full left-0 mb-2 w-64 p-3 rounded-lg border border-[#E5E3DE] bg-white shadow-lg text-xs text-[#333333]">
          <p className="font-medium mb-1">{config.label}</p>
          <p className="text-[#555555] leading-relaxed">{config.description}</p>
          {source && (
            <p className="mt-2 text-[#777777]">Fuente: {source}</p>
          )}
          {lastVerified && (
            <p className="text-[#CBCAC5] mt-1">Verificado: {lastVerified}</p>
          )}
          <div className="absolute top-full left-4 w-2 h-2 bg-white border-r border-b border-[#E5E3DE] transform rotate-45 -mt-1" />
        </div>
      )}
    </div>
  )
}
