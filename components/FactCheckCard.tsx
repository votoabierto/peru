'use client';
import { useState } from 'react';
import type { FactCheck } from '@/lib/types';

const VERDICT_CONFIG: Record<string, { bg: string; border: string; text: string; icon: string; label: string }> = {
  true:           { bg: 'bg-green-900/20',  border: 'border-green-800',  text: 'text-green-300',  icon: '✅', label: 'Verdadero' },
  false:          { bg: 'bg-red-900/20',    border: 'border-red-800',    text: 'text-red-300',    icon: '❌', label: 'Falso' },
  misleading:     { bg: 'bg-orange-900/20', border: 'border-orange-800', text: 'text-orange-300', icon: '⚠️', label: 'Engañoso' },
  unverifiable:   { bg: 'bg-gray-900/40',   border: 'border-gray-700',   text: 'text-gray-300',   icon: '❓', label: 'No verificable' },
  context_needed: { bg: 'bg-blue-900/20',   border: 'border-blue-800',   text: 'text-blue-300',   icon: '📋', label: 'Necesita contexto' },
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
              <div className="text-votoclaro-text-muted text-xs mb-1">{fc.candidate_name}</div>
            )}
            {/* Claim */}
            <blockquote className="text-votoclaro-text text-sm font-medium italic leading-relaxed">
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
            <p className="text-votoclaro-text-muted text-sm leading-relaxed">{fc.explanation}</p>
            <div className="flex items-center justify-between">
              {sourceUrl && (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-votoclaro-gold text-xs hover:underline inline-flex items-center gap-1"
                >
                  🔗 Ver fuente
                </a>
              )}
              {dateStr && (
                <span className="text-votoclaro-text-muted text-xs">
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
