'use client';
import { useState } from 'react';
import { Candidate } from '@/lib/types';

interface Props { candidates: Candidate[]; }

export function CompareShareButton({ candidates }: Props) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/comparar?ids=${candidates.map(c => c.slug || c.id).join(',')}`
    : '';

  const whatsappSummary = candidates.map(c =>
    `• ${c.full_name} (${c.party_name}): ${c.polling_percentage ?? c.current_polling ?? '?'}% en encuestas`
  ).join('\n');

  const whatsappText = encodeURIComponent(
    `Comparé candidatos en VotoClaro:\n\n${whatsappSummary}\n\nVer comparación completa: ${shareUrl}`
  );

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <span className="text-gray-500 text-sm">Compartir esta comparación:</span>
      <a
        href={`https://wa.me/?text=${whatsappText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 bg-green-800/30 hover:bg-green-800/50 border border-green-800 rounded-lg text-green-300 text-sm font-medium transition-colors"
      >
        📱 WhatsApp
      </a>
      <button
        onClick={copyLink}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 text-sm font-medium transition-colors"
      >
        {copied ? '✅ Copiado' : '🔗 Copiar link'}
      </button>
    </div>
  );
}
