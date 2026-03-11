'use client';
import { useState, useMemo } from 'react';
import { SEED_FACT_CHECKS, SEED_CANDIDATES } from '@/lib/seed-data';
import { FactCheckCard } from '@/components/FactCheckCard';

const VERDICTS = [
  { key: 'all', label: 'Todos', color: 'bg-[#EEEDE9] text-[#4B5563]' },
  { key: 'false', label: 'Falso', color: 'bg-[#FEF2F2] text-[#9B1C1C] border border-[#DC2626]' },
  { key: 'misleading', label: 'Engañoso', color: 'bg-[#FFFBEB] text-[#92400E] border border-[#D97706]' },
  { key: 'true', label: 'Verdadero', color: 'bg-[#F0FAF4] text-[#1A6B35] border border-[#2D7D46]' },
  { key: 'context_needed', label: 'Necesita contexto', color: 'bg-[#EEF4FF] text-[#1A56A0] border border-[#1A56A0]' },
  { key: 'unverifiable', label: 'No verificable', color: 'bg-[#F9FAFB] text-[#4B5563] border border-[#9CA3AF]' },
];

const PAGE_SIZE = 12;

export default function VerificarPage() {
  const [verdictFilter, setVerdictFilter] = useState<string>('all');
  const [candidateFilter, setCandidateFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  const facts = SEED_FACT_CHECKS;

  // Count per candidate for sidebar
  const candidateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    facts.forEach(f => {
      counts[f.candidate_id] = (counts[f.candidate_id] ?? 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [facts]);

  const filtered = useMemo(() => {
    return facts.filter(f => {
      if (verdictFilter !== 'all' && f.verdict !== verdictFilter) return false;
      if (candidateFilter !== 'all' && f.candidate_id !== candidateFilter) return false;
      return true;
    });
  }, [facts, verdictFilter, candidateFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleVerdictChange = (v: string) => { setVerdictFilter(v); setPage(1); };
  const handleCandidateChange = (c: string) => { setCandidateFilter(c); setPage(1); };

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b border-[#E5E3DE] py-10 bg-[#F7F6F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="label mb-2">Verificación de hechos</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111] mb-2">Verificar</h1>
          <p className="text-[#777777] max-w-2xl">
            Verificamos las afirmaciones de los candidatos con fuentes oficiales.{' '}
            <a href="/metodologia" className="text-[#1A56A0] hover:underline">Ver metodología →</a>
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1">
            {/* Verdict filter tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {VERDICTS.map(v => (
                <button
                  key={v.key}
                  onClick={() => handleVerdictChange(v.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    verdictFilter === v.key
                      ? v.color + ' ring-2 ring-[#1A56A0]/20'
                      : 'bg-[#F7F6F3] text-[#777777] border border-[#E5E3DE] hover:border-[#1A56A0]/50'
                  }`}
                >
                  {v.label}
                  {v.key !== 'all' && (
                    <span className="ml-2 text-xs opacity-70">
                      {facts.filter(f => f.verdict === v.key).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Candidate filter dropdown */}
            <div className="mb-6">
              <select
                value={candidateFilter}
                onChange={e => handleCandidateChange(e.target.value)}
                className="bg-[#F7F6F3] border border-[#E5E3DE] text-[#111111] text-sm rounded-lg px-3 py-2 focus:border-[#1A56A0] outline-none"
              >
                <option value="all">Todos los candidatos</option>
                {candidateCounts.map(([id, count]) => {
                  const name = SEED_CANDIDATES.find(c => c.id === id || c.slug === id)?.full_name ?? id;
                  return (
                    <option key={id} value={id}>{name} ({count})</option>
                  );
                })}
              </select>
            </div>

            {/* Results count */}
            <div className="text-[#777777] text-sm mb-4">
              Mostrando {paginated.length} de {filtered.length} verificaciones
            </div>

            {/* Fact check cards */}
            <div className="space-y-4">
              {paginated.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-[#777777]">No hay verificaciones con ese filtro.</p>
                </div>
              ) : (
                paginated.map(fc => (
                  <FactCheckCard key={fc.id} factCheck={fc} />
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-[#F7F6F3] border border-[#E5E3DE] rounded-lg text-[#777777] text-sm disabled:opacity-40 hover:border-[#1A56A0]/50 transition-colors"
                >
                  ← Anterior
                </button>
                <span className="text-[#777777] text-sm px-4">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-[#F7F6F3] border border-[#E5E3DE] rounded-lg text-[#777777] text-sm disabled:opacity-40 hover:border-[#1A56A0]/50 transition-colors"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>

          {/* Sidebar: most checked candidates */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-[#F7F6F3] border border-[#E5E3DE] rounded-xl p-5 sticky top-20">
              <h3 className="text-[#111111] font-semibold mb-4">Más verificados</h3>
              <div className="space-y-3">
                {candidateCounts.slice(0, 8).map(([id, count]) => {
                  const candidate = SEED_CANDIDATES.find(c => c.id === id || c.slug === id);
                  const initials = candidate?.full_name.split(' ').slice(0, 2).map(n => n[0]).join('') ?? '?';
                  return (
                    <button
                      key={id}
                      onClick={() => handleCandidateChange(candidateFilter === id ? 'all' : id)}
                      className={`w-full flex items-center gap-3 text-left rounded-lg p-2 transition-colors ${
                        candidateFilter === id
                          ? 'bg-[#EEEDE9] border border-[#E5E3DE]'
                          : 'hover:bg-[#EEEDE9]/50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#EEEDE9] flex items-center justify-center text-xs font-bold text-[#1A56A0] flex-shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[#111111] text-xs font-medium truncate">
                          {candidate?.full_name ?? id}
                        </div>
                      </div>
                      <span className="text-[#777777] text-xs">{count}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-[#E5E3DE]">
                <a href="/metodologia" className="text-[#1A56A0] text-xs hover:underline">
                  ¿Cómo verificamos? →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
