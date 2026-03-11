import { NextRequest, NextResponse } from 'next/server';
import { searchAll, searchCandidates, searchFactChecks, searchRegions } from '@/lib/data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') ?? '';
  const type = searchParams.get('type') ?? 'all';

  if (!q.trim()) {
    return NextResponse.json({ candidates: [], factChecks: [], regions: [] });
  }

  try {
    switch (type) {
      case 'candidates': {
        const candidates = await searchCandidates(q);
        return NextResponse.json({ candidates });
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

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
