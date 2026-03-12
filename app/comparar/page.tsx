import { Suspense } from 'react';
import Link from 'next/link';
import { ComparatorClient } from '@/components/Comparator/ComparatorClient';
import { DiputadosComparator } from '@/components/Comparator/DiputadosComparator';
import { getCandidates, getCandidatesByIds, getPositions } from '@/lib/data';
import diputadosCandidates from '@/data/diputados-candidates.json';
import FeedbackWidget from '@/components/FeedbackWidget';
import type { Metadata } from 'next';

interface Props {
  searchParams: Promise<{ ids?: string; tipo?: string }>;
}

export const metadata: Metadata = {
  title: 'Comparar Candidatos — VotoAbierto',
  description: 'Compara candidatos peruanos lado a lado: presidencia, senado, diputados y parlamento andino.',
  openGraph: {
    title: 'Comparar Candidatos — VotoAbierto',
    description: 'Compara candidatos peruanos lado a lado para las Elecciones Generales 2026.',
    images: ['/api/og/comparar'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Comparar Candidatos — VotoAbierto',
    description: 'Compara candidatos peruanos lado a lado para las Elecciones Generales 2026.',
    images: ['/api/og/comparar'],
  },
};

const ELECTION_TABS = [
  { key: 'presidente', label: 'Presidencia', href: '/comparar?tipo=presidente' },
  { key: 'senado', label: 'Senado', href: '/comparar?tipo=senado' },
  { key: 'diputados', label: 'Diputados', href: '/comparar?tipo=diputados' },
  { key: 'parlamento-andino', label: 'Parlamento Andino', href: '/comparar?tipo=parlamento-andino' },
] as const;

export default async function ComparePage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const tipo = resolvedParams.tipo ?? 'presidente';
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

        {/* Election type tabs */}
        <div className="flex flex-wrap gap-1 mb-8 border-b border-[#E5E3DE]">
          {ELECTION_TABS.map((tab) => (
            <Link
              key={tab.key}
              href={tab.href}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tipo === tab.key
                  ? 'border-[#1A56A0] text-[#1A56A0]'
                  : 'border-transparent text-[#777777] hover:text-[#444444] hover:border-[#E5E3DE]'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {tipo === 'presidente' ? (
          <Suspense fallback={<div className="text-[#777777]">Cargando...</div>}>
            <ComparatorClient
              initialSelected={selectedCandidates}
              allCandidates={allCandidates}
              allPositions={allPositions}
            />
          </Suspense>
        ) : tipo === 'diputados' ? (
          <DiputadosComparator candidates={diputadosCandidates as Array<{ id: string; name: string; party: string; partyId: string; district: string; listPosition: number; imageUrl: string | null }>} />
        ) : (
          <div className="text-center py-16 border border-[#E5E3DE] rounded-xl bg-[#F7F6F3]">
            <p className="text-lg font-semibold text-[#111111] mb-2">
              Comparador de {tipo === 'senado' ? 'Senado' : 'Parlamento Andino'}
            </p>
            <p className="text-[#777777] text-sm max-w-md mx-auto mb-4">
              Estamos recopilando datos de posiciones para candidatos al{' '}
              {tipo === 'senado' ? 'Senado' : 'Parlamento Andino'}.
              Por ahora, puedes ver la lista completa de candidatos.
            </p>
            <Link
              href={`/${tipo}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A56A0] text-white rounded-lg text-sm font-medium hover:bg-[#164A8A] transition-colors"
            >
              Ver candidatos
            </Link>
            <p className="text-xs text-[#CBCAC5] mt-4">
              ¿Tienes información sobre las posiciones de estos candidatos?{' '}
              <Link href="/contribuir" className="text-[#1A56A0] hover:underline">Contribuir</Link>
            </p>
          </div>
        )}

        <div className="mt-8">
          <FeedbackWidget pageUrl="/comparar" />
        </div>

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
