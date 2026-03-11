'use client';
import { useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Candidate, Position } from '@/lib/types';
import { CandidateSelector } from './CandidateSelector';
import { ComparisonTable } from './ComparisonTable';
import { CompareShareButton } from './CompareShareButton';

interface Props {
  initialSelected: Candidate[];
  allCandidates: Candidate[];
  allPositions: Position[];
}

export function ComparatorClient({ initialSelected, allCandidates, allPositions }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [selected, setSelected] = useState<Candidate[]>(initialSelected);

  const updateUrl = useCallback((candidates: Candidate[]) => {
    const ids = candidates.map(c => c.slug || c.id).join(',');
    const url = ids ? `${pathname}?ids=${ids}` : pathname;
    router.replace(url, { scroll: false });
  }, [pathname, router]);

  const addCandidate = (candidate: Candidate) => {
    if (selected.length >= 3) return;
    if (selected.find(c => c.id === candidate.id)) return;
    const next = [...selected, candidate];
    setSelected(next);
    updateUrl(next);
  };

  const removeCandidate = (candidateId: string) => {
    const next = selected.filter(c => c.id !== candidateId);
    setSelected(next);
    updateUrl(next);
  };

  const availableCandidates = allCandidates.filter(
    c => !selected.find(s => s.id === c.id)
  );

  return (
    <div className="space-y-8">
      {/* Selector */}
      <div className="bg-[#F7F6F3] border border-[#E5E3DE] rounded-xl p-6">
        <h2 className="text-[#111111] font-semibold mb-4">
          Candidatos seleccionados ({selected.length}/3)
        </h2>

        {/* Selected chips */}
        <div className="flex flex-wrap gap-3 mb-4">
          {selected.map(c => (
            <div key={c.id} className="flex items-center gap-2 bg-[#EEEDE9] border border-[#E5E3DE] rounded-full px-3 py-1.5">
              <div className="w-6 h-6 rounded-full bg-[#EEEDE9] flex items-center justify-center text-xs font-bold text-[#111111]">
                {c.full_name.split(' ')[0][0]}
              </div>
              <span className="text-[#222222] text-sm">{c.full_name.split(' ')[0]}</span>
              <button
                onClick={() => removeCandidate(c.id)}
                className="text-[#777777] hover:text-[#9B1C1C] transition-colors ml-1 text-xs"
                aria-label={`Quitar a ${c.full_name}`}
              >
                ✕
              </button>
            </div>
          ))}
          {selected.length === 0 && (
            <p className="text-[#777777] text-sm">Busca y añade candidatos abajo</p>
          )}
        </div>

        {/* Search input */}
        {selected.length < 3 && (
          <CandidateSelector
            candidates={availableCandidates}
            onSelect={addCandidate}
          />
        )}
      </div>

      {/* Comparison table */}
      {selected.length >= 2 ? (
        <>
          <ComparisonTable
            candidates={selected}
            allPositions={allPositions}
          />
          <div className="flex justify-center">
            <CompareShareButton candidates={selected} />
          </div>
        </>
      ) : (
        <div className="text-center py-20 text-[#777777]">
          <div className="text-4xl mb-4">⚖️</div>
          <p className="text-lg">Selecciona al menos 2 candidatos para comparar</p>
          <p className="text-sm mt-2">Puedes comparar hasta 3 candidatos</p>
        </div>
      )}
    </div>
  );
}
