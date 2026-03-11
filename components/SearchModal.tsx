'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface SearchResult {
  type: 'candidate' | 'factcheck' | 'region';
  id: string;
  label: string;
  sublabel?: string;
  href: string;
  badge?: string;
  badgeColor?: string;
}

interface ApiResponse {
  candidates: Array<{
    id: string; slug?: string; full_name: string; party_name: string; polling_percentage?: number;
  }>;
  factChecks: Array<{
    id: string; claim: string; candidate_name?: string; verdict: string;
  }>;
  regions: Array<{
    id: string; name: string; code: string; capital?: string;
  }>;
}

const VERDICT_LABELS: Record<string, string> = {
  true: 'Verdadero', false: 'Falso',
  misleading: 'Engañoso', unverifiable: 'No verificable', context_needed: 'Contexto',
};
const VERDICT_COLORS: Record<string, string> = {
  true: 'text-green-400', false: 'text-red-400',
  misleading: 'text-orange-400', unverifiable: 'text-gray-400', context_needed: 'text-blue-400',
};

function flattenResults(data: ApiResponse): SearchResult[] {
  const results: SearchResult[] = [];
  for (const c of (data.candidates ?? [])) {
    results.push({
      type: 'candidate',
      id: c.id,
      label: c.full_name,
      sublabel: c.party_name,
      href: `/candidatos/${c.slug ?? c.id}`,
      badge: c.polling_percentage ? `${c.polling_percentage}%` : undefined,
      badgeColor: 'text-[#d4af37]',
    });
  }
  for (const fc of (data.factChecks ?? [])) {
    results.push({
      type: 'factcheck',
      id: fc.id,
      label: fc.claim.length > 70 ? fc.claim.slice(0, 70) + '…' : fc.claim,
      sublabel: fc.candidate_name,
      href: '/verificar',
      badge: VERDICT_LABELS[fc.verdict],
      badgeColor: VERDICT_COLORS[fc.verdict],
    });
  }
  for (const r of (data.regions ?? [])) {
    results.push({
      type: 'region',
      id: r.id,
      label: r.name,
      sublabel: r.capital,
      href: `/regiones/${r.code.toLowerCase()}`,
    });
  }
  return results;
}

const TYPE_ICONS: Record<string, string> = {
  candidate: '👤',
  factcheck: '🔍',
  region: '📍',
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setActiveIndex(-1);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/buscar?q=${encodeURIComponent(q)}`);
      const data: ApiResponse = await res.json();
      setResults(flattenResults(data));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    setActiveIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(q), 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        router.push(results[activeIndex].href);
        onClose();
      } else if (query.trim()) {
        router.push(`/buscar?q=${encodeURIComponent(query)}`);
        onClose();
      }
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-[15vh] px-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Búsqueda"
    >
      <div className="w-full max-w-2xl bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-800">
          <span className="text-gray-500 text-lg flex-shrink-0">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleKeyDown}
            placeholder="Buscar candidatos, verificaciones, regiones..."
            className="flex-1 bg-transparent text-white placeholder-gray-600 text-base outline-none"
          />
          {loading && <span className="text-gray-600 text-xs flex-shrink-0">Buscando...</span>}
          <kbd className="hidden sm:inline-flex items-center px-2 py-1 bg-gray-800 border border-gray-700 rounded text-gray-500 text-xs flex-shrink-0">
            Esc
          </kbd>
        </div>

        {results.length > 0 ? (
          <div className="max-h-[60vh] overflow-y-auto">
            {results.map((r, i) => (
              <a
                key={`${r.type}-${r.id}`}
                href={r.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 transition-colors border-b border-gray-800/50 last:border-0 ${
                  i === activeIndex ? 'bg-gray-800' : 'hover:bg-gray-800/50'
                }`}
              >
                <span className="text-lg flex-shrink-0">{TYPE_ICONS[r.type]}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-200 text-sm font-medium truncate">{r.label}</div>
                  {r.sublabel && <div className="text-gray-500 text-xs truncate">{r.sublabel}</div>}
                </div>
                {r.badge && (
                  <span className={`text-xs font-semibold flex-shrink-0 ${r.badgeColor}`}>{r.badge}</span>
                )}
                <span className="text-gray-600 text-xs flex-shrink-0">→</span>
              </a>
            ))}

            {query.trim() && (
              <a
                href={`/buscar?q=${encodeURIComponent(query)}`}
                onClick={onClose}
                className="flex items-center justify-center gap-2 px-4 py-3 text-[#d4af37] text-sm hover:bg-gray-800/50 transition-colors"
              >
                Ver todos los resultados para &quot;{query}&quot; →
              </a>
            )}
          </div>
        ) : query.trim() && !loading ? (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">
            No se encontraron resultados para &quot;{query}&quot;
          </div>
        ) : !query.trim() ? (
          <div className="px-4 py-6">
            <p className="text-gray-600 text-xs font-medium uppercase tracking-wide mb-3">Búsquedas populares</p>
            <div className="flex flex-wrap gap-2">
              {['Keiko Fujimori', 'López Aliaga', 'Cajamarca', 'minería', 'corrupción'].map(s => (
                <button
                  key={s}
                  onClick={() => {
                    setQuery(s);
                    doSearch(s);
                  }}
                  className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-full text-gray-400 text-xs hover:border-[#d4af37]/50 hover:text-[#d4af37] transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-gray-600 text-xs">
              <span>↑↓ navegar</span>
              <span>↵ seleccionar</span>
              <span>Esc cerrar</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
