import { NextRequest, NextResponse } from 'next/server';
import { searchAll, searchCandidates, searchFactChecks, searchRegions } from '@/lib/data';
import type { ElectionType } from '@/lib/types';

const VALID_TIPOS: ElectionType[] = ['presidente', 'senado', 'diputados', 'parlamento-andino'];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') ?? '';
  const type = searchParams.get('type') ?? 'all';
  const tipo = searchParams.get('tipo') as ElectionType | null;

  if (!q.trim()) {
    return NextResponse.json({ candidates: [], factChecks: [], regions: [] });
  }

  // Validate tipo param if provided
  if (tipo && !VALID_TIPOS.includes(tipo)) {
    return NextResponse.json(
      { error: `Tipo inválido. Valores válidos: ${VALID_TIPOS.join(', ')}`, candidates: [], factChecks: [], regions: [] },
      { status: 400 }
    );
  }

  try {
    switch (type) {
      case 'candidates': {
        const candidates = await searchCandidates(q);
        const filtered = tipo ? filterByElectionType(candidates, tipo) : candidates;
        return NextResponse.json({ candidates: filtered });
      }
      case 'factchecks': {
        const factChecks = await searchFactChecks(q);
        return NextResponse.json({ factChecks });
      }
      case 'regions': {
        const regions = await searchRegions(q);
        return NextResponse.json({ regions });
      }
      default: {
        const results = await searchAll(q);
        if (tipo) {
          results.candidates = filterByElectionType(results.candidates, tipo);
        }
        return NextResponse.json(results);
      }
    }
  } catch (error) {
    console.error('[/api/buscar] Search error:', error);
    return NextResponse.json(
      { error: 'Error en la búsqueda', candidates: [], factChecks: [], regions: [] },
      { status: 500 }
    );
  }
}

function filterByElectionType<T extends { role?: string }>(candidates: T[], tipo: ElectionType): T[] {
  const roleMap: Record<ElectionType, string> = {
    'presidente': 'president',
    'senado': 'senator',
    'diputados': 'representative',
    'parlamento-andino': 'representative',
  }
  return candidates.filter(c => c.role === roleMap[tipo])
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
