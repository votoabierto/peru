import { Suspense } from 'react';
import Link from 'next/link';
import { ComparatorClient } from '@/components/Comparator/ComparatorClient';
import { getCandidates, getCandidatesByIds, getPositions } from '@/lib/data';
import type { Metadata } from 'next';

interface Props {
  searchParams: Promise<{ ids?: string }>;
}

export const metadata: Metadata = {
  title: 'Comparar Candidatos — VotoAbierto',
  description: 'Compara hasta 3 candidatos presidenciales peruanos lado a lado.',
  openGraph: {
    title: 'Comparar Candidatos — VotoAbierto',
    description: 'Compara hasta 3 candidatos presidenciales peruanos lado a lado.',
    images: ['/api/og/comparar'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Comparar Candidatos — VotoAbierto',
    description: 'Compara hasta 3 candidatos presidenciales peruanos lado a lado.',
    images: ['/api/og/comparar'],
  },
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
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#111111] mb-2">Comparar Candidatos</h1>
          <p className="text-[#777777]">
            Selecciona hasta 3 candidatos para comparar sus propuestas, historial y posiciones.
          </p>
        </div>

        <Suspense fallback={<div className="text-[#777777]">Cargando...</div>}>
          <ComparatorClient
            initialSelected={selectedCandidates}
            allCandidates={allCandidates}
            allPositions={allPositions}
          />
        </Suspense>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-[#CBCAC5]">
            Datos de posiciones extraídos de planes de gobierno presentados al JNE.{' '}
            <Link href="/datos" className="text-[#1A56A0] hover:underline">Ver fuentes completas</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
