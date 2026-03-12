'use client';
import { useState } from 'react';
import { Candidate } from '@/lib/types';

interface Props { candidates: Candidate[]; }

export function CompareShareButton({ candidates }: Props) {
  const [copied, setCopied] = useState(false);

  if (candidates.length === 0) return null;

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/comparar?ids=${candidates.map(c => c.slug || c.id).join(',')}`
    : '';

  const candidateNames = candidates.map(c => c.common_name ?? c.full_name);
  const nameList = candidateNames.length <= 2
    ? candidateNames.join(' y ')
    : `${candidateNames.slice(0, -1).join(', ')} y ${candidateNames[candidateNames.length - 1]}`;

  const whatsappText = encodeURIComponent(
    `Compare a ${nameList} en VotoAbierto. Mira sus diferencias: ${shareUrl}`
  );

  const twitterText = encodeURIComponent(
    `Compare a ${nameList} en VotoAbierto. Elecciones Peru 2026`
  );

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Comparacion: ${nameList}`, url: shareUrl });
      } catch { /* cancelled */ }
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <span className="text-[#777777] text-sm">Compartir esta comparacion:</span>
      <div className="flex flex-wrap items-center gap-2">
        {/* WhatsApp */}
        <a
          href={`https://wa.me/?text=${whatsappText}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Compartir en WhatsApp"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#25D366] text-white text-sm font-medium hover:bg-[#1da851] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp
        </a>

        {/* X / Twitter */}
        <a
          href={`https://twitter.com/intent/tweet?text=${twitterText}&url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Compartir en X"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111111] text-white text-sm font-medium hover:bg-[#333333] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          X
        </a>

        {/* Copy link */}
        <button
          onClick={copyLink}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-[#444444] text-sm font-medium border border-[#E5E3DE] hover:border-[#1A56A0] transition-colors"
        >
          {copied ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          )}
          {copied ? 'Copiado' : 'Copiar enlace'}
        </button>

        {/* Native share (mobile) */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={nativeShare}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F7F6F3] text-[#444444] text-sm font-medium border border-[#E5E3DE] hover:border-[#1A56A0] transition-colors sm:hidden"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
            Compartir
          </button>
        )}
      </div>
    </div>
  );
}
