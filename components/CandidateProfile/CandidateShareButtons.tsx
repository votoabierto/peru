'use client'
import { useState } from 'react'
import { Candidate } from '@/lib/types'

interface Props {
  candidate: Candidate
}

export function CandidateShareButtons({ candidate }: Props) {
  const [copied, setCopied] = useState(false)

  const profileUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/candidatos/${candidate.slug}`
      : `/candidatos/${candidate.slug}`

  const polling = candidate.polling_percentage ?? candidate.current_polling
  const whatsappText = encodeURIComponent(
    `Conoce más sobre ${candidate.full_name} (${candidate.party_name}) en VotoClaro: ${profileUrl}`
  )
  const twitterText = encodeURIComponent(
    `Candidato: ${candidate.full_name} | ${candidate.party_name}${polling != null ? ` | ${polling}% en encuestas` : ''}. Más info:`
  )

  const copyLink = async () => {
    await navigator.clipboard.writeText(profileUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[#777777] text-xs font-medium uppercase tracking-wide">Compartir</p>
      <a
        href={`https://wa.me/?text=${whatsappText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 bg-[#F0FAF4] hover:bg-[#DCFCE7] border border-[#2D7D46] rounded-lg text-[#1A6B35] text-xs font-medium transition-colors"
      >
        <span>📱</span> WhatsApp
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${twitterText}&url=${encodeURIComponent(profileUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 bg-[#EEF4FF] hover:bg-[#DBEAFE] border border-[#1A56A0] rounded-lg text-[#1A56A0] text-xs font-medium transition-colors"
      >
        <span>🐦</span> Twitter/X
      </a>
      <button
        onClick={copyLink}
        className="flex items-center gap-2 px-3 py-2 bg-[#F7F6F3] hover:bg-[#EEEDE9] border border-[#E5E3DE] rounded-lg text-[#444444] text-xs font-medium transition-colors"
      >
        <span>{copied ? '✅' : '🔗'}</span> {copied ? 'Copiado' : 'Copiar link'}
      </button>
    </div>
  )
}
