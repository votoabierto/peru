'use client';
import { useState, useMemo } from 'react';
import { Candidate } from '@/lib/types';

interface Props {
  candidates: Candidate[];
  onSelect: (candidate: Candidate) => void;
}

export function CandidateSelector({ candidates, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return candidates.slice(0, 8);
    const q = query.toLowerCase();
    return candidates.filter(c =>
      c.full_name.toLowerCase().includes(q) ||
      c.party_name.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [candidates, query]);

  const handleSelect = (c: Candidate) => {
    onSelect(c);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus-within:border-[#d4af37] transition-colors">
        <span className="text-gray-500">🔍</span>
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder="Buscar candidato por nombre o partido..."
          className="bg-transparent text-gray-200 placeholder-gray-600 text-sm flex-1 outline-none"
        />
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 overflow-hidden">
          {filtered.map(c => {
            const initials = c.full_name.split(' ').slice(0, 2).map(n => n[0]).join('');
            return (
              <button
                key={c.id}
                onMouseDown={() => handleSelect(c)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {initials}
                </div>
                <div>
                  <div className="text-gray-200 text-sm font-medium">{c.full_name}</div>
                  <div className="text-gray-500 text-xs">{c.party_name}</div>
                </div>
                {c.polling_percentage !== undefined && (
                  <div className="ml-auto text-[#d4af37] text-xs font-semibold">
                    {c.polling_percentage}%
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
