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
    title: q ? `"${q}" — Búsqueda — VotoClaro` : 'Buscar — VotoClaro',
    description: 'Busca candidatos, verificaciones y regiones en VotoClaro.',
  };
}

export default async function BuscarPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = (params.q ?? '').trim();
  const results = q ? await searchAll(q) : { candidates: [], factChecks: [], regions: [] };
  const totalResults = results.candidates.length + results.factChecks.length + results.regions.length;

  const verdictLabels: Record<string, { label: string; color: string }> = {
    true: { label: 'Verdadero', color: 'text-green-400' },
    false: { label: 'Falso', color: 'text-red-400' },
    misleading: { label: 'Engañoso', color: 'text-orange-400' },
    unverifiable: { label: 'No verificable', color: 'text-gray-400' },
    context_needed: { label: 'Necesita contexto', color: 'text-blue-400' },
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Búsqueda</h1>
          <form action="/buscar" method="GET">
            <div className="flex items-center gap-3 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus-within:border-[#d4af37] transition-colors">
              <span className="text-gray-500 text-lg">🔍</span>
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder='Busca por nombre, partido, región... (ej. "Keiko", "Cajamarca", "minería")'
                className="flex-1 bg-transparent text-white placeholder-gray-600 text-base outline-none"
                autoFocus={!q}
              />
              {q && (
                <a href="/buscar" className="text-gray-600 hover:text-gray-400 text-sm">✕ Limpiar</a>
              )}
            </div>
          </form>
        </div>

        {!q ? (
          <BuscarEmptyState />
        ) : (
          <Suspense fallback={<div className="text-gray-500">Buscando...</div>}>
            <div>
              <p className="text-gray-500 text-sm mb-6">
                {totalResults > 0
                  ? `${totalResults} resultado${totalResults > 1 ? 's' : ''} para "${q}"`
                  : `Sin resultados para "${q}"`}
              </p>

              {totalResults === 0 && <BuscarNoResults query={q} />}

              {results.candidates.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                    <span>👤</span>
                    <span>Candidatos</span>
                    <span className="text-gray-600 text-sm font-normal">({results.candidates.length})</span>
                  </h2>
                  <div className="space-y-3">
                    {results.candidates.map(c => {
                      const initials = c.full_name.split(' ').slice(0, 2).map((n: string) => n[0]).join('');
                      return (
                        <a
                          key={c.id}
                          href={`/candidatos/${c.slug || c.id}`}
                          className="flex items-center gap-4 p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-[#d4af37]/50 transition-colors"
                        >
                          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                            {initials}
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-semibold">{c.full_name}</div>
                            <div className="text-gray-500 text-sm">{c.party_name}</div>
                          </div>
                          {c.polling_percentage !== undefined && (
                            <div className="text-[#d4af37] font-semibold text-sm">{c.polling_percentage}%</div>
                          )}
                          <span className="text-gray-600 text-sm">→</span>
                        </a>
                      );
                    })}
                  </div>
                  <a href={`/candidatos?q=${encodeURIComponent(q)}`} className="inline-block mt-3 text-[#d4af37] text-sm hover:underline">
                    Ver todos los candidatos →
                  </a>
                </section>
              )}

              {results.factChecks.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                    <span>🔍</span>
                    <span>Verificaciones</span>
                    <span className="text-gray-600 text-sm font-normal">({results.factChecks.length})</span>
                  </h2>
                  <div className="space-y-3">
                    {results.factChecks.map(fc => {
                      const vd = verdictLabels[fc.verdict] ?? verdictLabels.unverifiable;
                      return (
                        <div key={fc.id} className="p-4 bg-gray-900 border border-gray-800 rounded-xl">
                          <div className="flex items-start gap-3">
                            <span className={`text-xs font-bold flex-shrink-0 mt-0.5 ${vd.color}`}>
                              {vd.label}
                            </span>
                            <div>
                              <p className="text-gray-300 text-sm italic">&quot;{fc.claim}&quot;</p>
                              {fc.candidate_name && (
                                <p className="text-gray-600 text-xs mt-1">{fc.candidate_name}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <a href="/verificar" className="inline-block mt-3 text-[#d4af37] text-sm hover:underline">
                    Ver todas las verificaciones →
                  </a>
                </section>
              )}

              {results.regions.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                    <span>🗺️</span>
                    <span>Regiones</span>
                    <span className="text-gray-600 text-sm font-normal">({results.regions.length})</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {results.regions.map(r => (
                      <a
                        key={r.id}
                        href={`/regiones/${r.code.toLowerCase()}`}
                        className="flex items-center gap-3 p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-[#d4af37]/50 transition-colors"
                      >
                        <span className="text-2xl">📍</span>
                        <div>
                          <div className="text-white font-medium">{r.name}</div>
                          <div className="text-gray-500 text-xs">{r.capital}</div>
                        </div>
                        <span className="ml-auto text-gray-600 text-sm">→</span>
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
      <p className="text-gray-500 mb-6">Busca candidatos, verificaciones y regiones del Perú.</p>
      <div>
        <p className="text-gray-600 text-sm mb-3 font-medium">Búsquedas sugeridas:</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map(s => (
            <a
              key={s.label}
              href={s.href}
              className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-full text-gray-400 text-sm hover:border-[#d4af37]/50 hover:text-[#d4af37] transition-colors"
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
      <p className="text-gray-400 text-lg mb-2">No encontramos resultados para &quot;{query}&quot;</p>
      <p className="text-gray-600 text-sm mb-8">Prueba con otro término o explora directamente:</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a href="/candidatos" className="px-6 py-3 bg-gray-900 border border-gray-800 rounded-xl text-gray-300 hover:border-[#d4af37]/50 transition-colors">
          Ver candidatos
        </a>
        <a href="/verificar" className="px-6 py-3 bg-gray-900 border border-gray-800 rounded-xl text-gray-300 hover:border-[#d4af37]/50 transition-colors">
          Ver verificaciones
        </a>
        <a href="/regiones" className="px-6 py-3 bg-gray-900 border border-gray-800 rounded-xl text-gray-300 hover:border-[#d4af37]/50 transition-colors">
          Ver regiones
        </a>
      </div>
    </div>
  );
}
