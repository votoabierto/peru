import { Suspense } from 'react';
import { searchAll } from '@/lib/data';
import type { Metadata } from 'next';

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const q = params.q ?? '';
  return {
    title: q ? `"${q}" — Búsqueda — VotoAbierto` : 'Buscar — VotoAbierto',
    description: 'Busca candidatos, verificaciones y regiones en VotoAbierto.',
  };
}

export default async function BuscarPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = (params.q ?? '').trim();
  const results = q ? await searchAll(q) : { candidates: [], factChecks: [], regions: [] };
  const totalResults = results.candidates.length + results.factChecks.length + results.regions.length;

  const verdictLabels: Record<string, { label: string; color: string }> = {
    true: { label: 'Verdadero', color: 'text-[#1A6B35]' },
    false: { label: 'Falso', color: 'text-[#9B1C1C]' },
    misleading: { label: 'Engañoso', color: 'text-[#92400E]' },
    unverifiable: { label: 'No verificable', color: 'text-[#777777]' },
    context_needed: { label: 'Necesita contexto', color: 'text-[#1A56A0]' },
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#111111] mb-4">Búsqueda</h1>
          <form action="/buscar" method="GET">
            <div className="flex items-center gap-3 bg-[#F7F6F3] border border-[#E5E3DE] rounded-xl px-4 py-3 focus-within:border-[#1A56A0] transition-colors">
              <span className="text-[#777777] text-lg">🔍</span>
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder='Busca por nombre, partido, región... (ej. "Keiko", "Cajamarca", "minería")'
                className="flex-1 bg-transparent text-[#111111] placeholder-[#9CA3AF] text-base outline-none"
                autoFocus={!q}
              />
              {q && (
                <a href="/buscar" className="text-[#777777] hover:text-[#1A56A0] text-sm">✕ Limpiar</a>
              )}
            </div>
          </form>
        </div>

        {!q ? (
          <BuscarEmptyState />
        ) : (
          <Suspense fallback={<div className="text-[#777777]">Buscando...</div>}>
            <div>
              <p className="text-[#777777] text-sm mb-6">
                {totalResults > 0
                  ? `${totalResults} resultado${totalResults > 1 ? 's' : ''} para "${q}"`
                  : `Sin resultados para "${q}"`}
              </p>

              {totalResults === 0 && <BuscarNoResults query={q} />}

              {results.candidates.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-[#111111] font-semibold text-lg mb-4 flex items-center gap-2">
                    <span>👤</span>
                    <span>Candidatos</span>
                    <span className="text-[#777777] text-sm font-normal">({results.candidates.length})</span>
                  </h2>
                  <div className="space-y-3">
                    {results.candidates.map(c => {
                      const initials = c.full_name.split(' ').slice(0, 2).map((n: string) => n[0]).join('');
                      return (
                        <a
                          key={c.id}
                          href={`/candidatos/${c.slug || c.id}`}
                          className="flex items-center gap-4 p-4 bg-[#F7F6F3] border border-[#E5E3DE] rounded-xl hover:border-[#1A56A0]/50 transition-colors"
                        >
                          <div className="w-12 h-12 rounded-full bg-[#EEEDE9] flex items-center justify-center text-sm font-bold text-[#111111] flex-shrink-0">
                            {initials}
                          </div>
                          <div className="flex-1">
                            <div className="text-[#111111] font-semibold">{c.full_name}</div>
                            <div className="text-[#777777] text-sm">{c.party_name}</div>
                          </div>
                          {c.polling_percentage !== undefined && (
                            <div className="text-[#1A56A0] font-semibold text-sm">{c.polling_percentage}%</div>
                          )}
                          <span className="text-[#777777] text-sm">→</span>
                        </a>
                      );
                    })}
                  </div>
                  <a href={`/candidatos?q=${encodeURIComponent(q)}`} className="inline-block mt-3 text-[#1A56A0] text-sm hover:underline">
                    Ver todos los candidatos →
                  </a>
                </section>
              )}

              {results.factChecks.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-[#111111] font-semibold text-lg mb-4 flex items-center gap-2">
                    <span>🔍</span>
                    <span>Verificaciones</span>
                    <span className="text-[#777777] text-sm font-normal">({results.factChecks.length})</span>
                  </h2>
                  <div className="space-y-3">
                    {results.factChecks.map(fc => {
                      const vd = verdictLabels[fc.verdict] ?? verdictLabels.unverifiable;
                      return (
                        <div key={fc.id} className="p-4 bg-[#F7F6F3] border border-[#E5E3DE] rounded-xl">
                          <div className="flex items-start gap-3">
                            <span className={`text-xs font-bold flex-shrink-0 mt-0.5 ${vd.color}`}>
                              {vd.label}
                            </span>
                            <div>
                              <p className="text-[#4B5563] text-sm italic">&quot;{fc.claim}&quot;</p>
                              {fc.candidate_name && (
                                <p className="text-[#777777] text-xs mt-1">{fc.candidate_name}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <a href="/verificar" className="inline-block mt-3 text-[#1A56A0] text-sm hover:underline">
                    Ver todas las verificaciones →
                  </a>
                </section>
              )}

              {results.regions.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-[#111111] font-semibold text-lg mb-4 flex items-center gap-2">
                    <span>🗺️</span>
                    <span>Regiones</span>
                    <span className="text-[#777777] text-sm font-normal">({results.regions.length})</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {results.regions.map(r => (
                      <a
                        key={r.id}
                        href={`/regiones/${r.code.toLowerCase()}`}
                        className="flex items-center gap-3 p-4 bg-[#F7F6F3] border border-[#E5E3DE] rounded-xl hover:border-[#1A56A0]/50 transition-colors"
                      >
                        <span className="text-2xl">📍</span>
                        <div>
                          <div className="text-[#111111] font-medium">{r.name}</div>
                          <div className="text-[#777777] text-xs">{r.capital}</div>
                        </div>
                        <span className="ml-auto text-[#777777] text-sm">→</span>
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </Suspense>
        )}
      </div>
    </main>
  );
}

function BuscarEmptyState() {
  const suggestions = [
    { label: 'Keiko Fujimori', href: '/buscar?q=Keiko' },
    { label: 'Rafael López Aliaga', href: '/buscar?q=Lopez+Aliaga' },
    { label: 'Cajamarca', href: '/buscar?q=Cajamarca' },
    { label: 'minería', href: '/buscar?q=mineria' },
    { label: 'corrupción', href: '/buscar?q=corrupcion' },
    { label: 'Fuerza Popular', href: '/buscar?q=Fuerza+Popular' },
  ];

  return (
    <div>
      <p className="text-[#777777] mb-6">Busca candidatos, verificaciones y regiones del Perú.</p>
      <div>
        <p className="text-[#777777] text-sm mb-3 font-medium">Búsquedas sugeridas:</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map(s => (
            <a
              key={s.label}
              href={s.href}
              className="px-4 py-2 bg-[#F7F6F3] border border-[#E5E3DE] rounded-full text-[#777777] text-sm hover:border-[#1A56A0]/50 hover:text-[#1A56A0] transition-colors"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function BuscarNoResults({ query }: { query: string }) {
  return (
    <div className="text-center py-16">
      <div className="text-4xl mb-4">🔍</div>
      <p className="text-[#777777] text-lg mb-2">No encontramos resultados para &quot;{query}&quot;</p>
      <p className="text-[#777777] text-sm mb-8">Prueba con otro término o explora directamente:</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a href="/candidatos" className="px-6 py-3 bg-[#F7F6F3] border border-[#E5E3DE] rounded-xl text-[#4B5563] hover:border-[#1A56A0]/50 transition-colors">
          Ver candidatos
        </a>
        <a href="/verificar" className="px-6 py-3 bg-[#F7F6F3] border border-[#E5E3DE] rounded-xl text-[#4B5563] hover:border-[#1A56A0]/50 transition-colors">
          Ver verificaciones
        </a>
        <a href="/regiones" className="px-6 py-3 bg-[#F7F6F3] border border-[#E5E3DE] rounded-xl text-[#4B5563] hover:border-[#1A56A0]/50 transition-colors">
          Ver regiones
        </a>
      </div>
    </div>
  );
}
