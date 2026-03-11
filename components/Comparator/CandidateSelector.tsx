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
      <div className="flex items-center gap-2 bg-[#EEEDE9] border border-[#E5E3DE] rounded-lg px-3 py-2 focus-within:border-[#1A56A0] transition-colors">
        <span className="text-[#777777]">🔍</span>
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder="Buscar candidato por nombre o partido..."
          className="bg-transparent text-[#222222] placeholder-[#999999] text-sm flex-1 outline-none"
        />
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E3DE] rounded-lg shadow-2xl z-50 overflow-hidden">
          {filtered.map(c => {
            const initials = c.full_name.split(' ').slice(0, 2).map(n => n[0]).join('');
            return (
              <button
                key={c.id}
                onMouseDown={() => handleSelect(c)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F7F6F3] transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-[#EEEDE9] flex items-center justify-center text-xs font-bold text-[#111111] flex-shrink-0">
                  {initials}
                </div>
                <div>
                  <div className="text-[#222222] text-sm font-medium">{c.full_name}</div>
                  <div className="text-[#777777] text-xs">{c.party_name}</div>
                </div>
                {c.polling_percentage !== undefined && (
                  <div className="ml-auto text-[#1A56A0] text-xs font-semibold">
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
