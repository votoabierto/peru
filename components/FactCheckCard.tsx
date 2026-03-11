'use client';
import { useState } from 'react';
import type { FactCheck } from '@/lib/types';

const VERDICT_CONFIG: Record<string, { bg: string; border: string; text: string; icon: string; label: string }> = {
  true:           { bg: 'bg-[#F0FAF4]',  border: 'border-[#2D7D46]',  text: 'text-[#1A6B35]',  icon: '✅', label: 'Verdadero' },
  false:          { bg: 'bg-[#FEF2F2]',   border: 'border-[#DC2626]',  text: 'text-[#9B1C1C]',  icon: '❌', label: 'Falso' },
  misleading:     { bg: 'bg-orange-50',    border: 'border-orange-400', text: 'text-orange-700',  icon: '⚠️', label: 'Engañoso' },
  unverifiable:   { bg: 'bg-[#F9FAFB]',   border: 'border-[#9CA3AF]',  text: 'text-[#4B5563]',  icon: '❓', label: 'No verificable' },
  context_needed: { bg: 'bg-blue-50',      border: 'border-blue-400',   text: 'text-blue-700',    icon: '📋', label: 'Necesita contexto' },
};

interface Props { factCheck: FactCheck; }

export function FactCheckCard({ factCheck: fc }: Props) {
  const [expanded, setExpanded] = useState(false);
  const cfg = VERDICT_CONFIG[fc.verdict] ?? VERDICT_CONFIG.unverifiable;
  const dateStr = fc.date_checked ?? fc.checked_at;
  const sourceUrl = fc.source ?? fc.source_url;

  return (
    <div className={`border rounded-xl overflow-hidden ${cfg.border} ${cfg.bg}`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Verdict badge */}
          <span className={`text-xs font-bold px-2 py-1 rounded border flex-shrink-0 mt-0.5 ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            {cfg.icon} {cfg.label}
          </span>
          <div className="flex-1">
            {/* Candidate name */}
            {fc.candidate_name && (
              <div className="text-[#777777] text-xs mb-1">{fc.candidate_name}</div>
            )}
            {/* Claim */}
            <blockquote className="text-[#111111] text-sm font-medium italic leading-relaxed">
              &ldquo;{fc.claim}&rdquo;
            </blockquote>
          </div>
        </div>

        {/* Expandable explanation */}
        <button
          onClick={() => setExpanded(e => !e)}
          className={`mt-3 text-xs font-medium flex items-center gap-1 ${cfg.text} hover:underline`}
        >
          {expanded ? '▲ Ocultar explicación' : '▼ Ver explicación'}
        </button>

        {expanded && (
          <div className="mt-3 space-y-3">
            <p className="text-[#777777] text-sm leading-relaxed">{fc.explanation}</p>
            <div className="flex items-center justify-between">
              {sourceUrl && (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1A56A0] text-xs hover:underline inline-flex items-center gap-1"
                >
                  🔗 Ver fuente
                </a>
              )}
              {dateStr && (
                <span className="text-[#777777] text-xs">
                  Verificado: {new Date(dateStr).toLocaleDateString('es-PE')}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
