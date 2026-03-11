import { Suspense } from 'react';
import { ComparatorClient } from '@/components/Comparator/ComparatorClient';
import { getCandidates, getCandidatesByIds, getPositions } from '@/lib/data';
import type { Metadata } from 'next';

interface Props {
  searchParams: Promise<{ ids?: string }>;
}

export const metadata: Metadata = {
  title: 'Comparar Candidatos — VotoClaro',
  description: 'Compara hasta 3 candidatos presidenciales peruanos lado a lado.',
};

export default async function ComparePage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const idList = resolvedParams.ids
    ? resolvedParams.ids.split(',').filter(Boolean).slice(0, 3)
    : [];

  const [selectedCandidates, allCandidates, allPositions] = await Promise.all([
    idList.length > 0 ? getCandidatesByIds(idList) : Promise.resolve([]),
    getCandidates(),
    getPositions(),
  ]);

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Comparar Candidatos</h1>
          <p className="text-gray-400">Selecciona hasta 3 candidatos para comparar sus propuestas, historial y posiciones.</p>
        </div>

        <Suspense fallback={<div className="text-gray-500">Cargando...</div>}>
          <ComparatorClient
            initialSelected={selectedCandidates}
            allCandidates={allCandidates}
            allPositions={allPositions}
          />
        </Suspense>
      </div>
    </main>
  );
}
