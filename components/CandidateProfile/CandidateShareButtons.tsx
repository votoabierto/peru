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
      : `https://votoabierto.org/candidatos/${candidate.slug}`

  const whatsappText = encodeURIComponent(
    `Conoce a ${candidate.full_name} (${candidate.party_name}) antes del 12 de abril: ${profileUrl}`
  )
  const twitterText = encodeURIComponent(
    `Conoce a ${candidate.full_name} | ${candidate.party_name} | Elecciones Perú 2026`
  )

  const copyLink = async () => {
    await navigator.clipboard.writeText(profileUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      {/* WhatsApp */}
      <a
        href={`https://wa.me/?text=${whatsappText}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartir en WhatsApp"
        title="Compartir en WhatsApp"
        className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F7F6F3] hover:bg-[#EEEDE9] border border-[#E5E3DE] transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      {/* X / Twitter */}
      <a
        href={`https://twitter.com/intent/tweet?text=${twitterText}&url=${encodeURIComponent(profileUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartir en X (Twitter)"
        title="Compartir en X"
        className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F7F6F3] hover:bg-[#EEEDE9] border border-[#E5E3DE] transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#111111">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>

      {/* Copy link */}
      <button
        onClick={copyLink}
        aria-label={copied ? 'Link copiado' : 'Copiar link'}
        title={copied ? 'Copiado' : 'Copiar link'}
        className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F7F6F3] hover:bg-[#EEEDE9] border border-[#E5E3DE] transition-colors"
      >
        {copied ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
        )}
      </button>
    </div>
  )
}
