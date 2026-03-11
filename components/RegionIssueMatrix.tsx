'use client';

import { Candidate, Position } from '@/lib/types';
import { RegionDetailData } from '@/lib/regions-data';

const STANCE_STYLES: Record<string, { cls: string; label: string }> = {
  favor:   { cls: 'bg-green-900/50 text-green-300 border border-green-800',   label: 'Favor' },
  support: { cls: 'bg-green-900/50 text-green-300 border border-green-800',   label: 'Favor' },
  neutral: { cls: 'bg-gray-800 text-gray-400 border border-gray-700',         label: 'Neutral' },
  against: { cls: 'bg-red-900/50 text-red-300 border border-red-800',         label: 'Contra' },
  oppose:  { cls: 'bg-red-900/50 text-red-300 border border-red-800',         label: 'Contra' },
};

interface Props {
  region: RegionDetailData;
  candidates: Candidate[];
  allPositions: Position[];
}

// Map region key issues (Spanish strings) to IssueArea enum values for position lookup
function matchIssueToArea(issue: string): string | null {
  const lower = issue.toLowerCase();
  const mapping: Array<[string, string]> = [
    ['minería', 'mining'],
    ['canon minero', 'mining'],
    ['minería ilegal', 'mining'],
    ['agua', 'environment'],
    ['deforestación', 'environment'],
    ['medio ambiente', 'environment'],
    ['contaminación', 'environment'],
    ['pobreza', 'economy'],
    ['turismo', 'economy'],
    ['agricultura', 'economy'],
    ['agroexportación', 'economy'],
    ['economía', 'economy'],
    ['empleo', 'economy'],
    ['industria', 'economy'],
    ['seguridad', 'security'],
    ['inseguridad', 'security'],
    ['narcotráfico', 'security'],
    ['crimen', 'security'],
    ['educación', 'education'],
    ['salud', 'health'],
    ['anemia', 'health'],
    ['desnutrición', 'health'],
    ['corrupción', 'corruption'],
    ['infraestructura', 'infrastructure'],
    ['vial', 'infrastructure'],
    ['transporte', 'infrastructure'],
    ['programas sociales', 'social_programs'],
    ['reparaciones', 'social_programs'],
    ['política exterior', 'foreign_policy'],
    ['frontera', 'foreign_policy'],
  ];
  for (const [keyword, area] of mapping) {
    if (lower.includes(keyword)) return area;
  }
  return null;
}

export function RegionIssueMatrix({ region, candidates, allPositions }: Props) {
  if (candidates.length === 0) {
    return <p className="text-gray-500 text-sm">No hay candidatos disponibles para mostrar.</p>;
  }

  // Take top 4 key issues for the matrix
  const matrixIssues = region.key_issues.slice(0, 4);

  return (
    <div className="overflow-x-auto -mx-4 md:mx-0">
      <div className="min-w-[500px] bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {/* Header row */}
        <div
          className="grid border-b border-gray-800"
          style={{ gridTemplateColumns: `180px repeat(${candidates.length}, 1fr)` }}
        >
          <div className="p-3 bg-gray-900/50" />
          {candidates.map(c => {
            const initials = c.full_name.split(' ').slice(0, 2).map((n: string) => n[0]).join('');
            return (
              <div key={c.id} className="p-3 text-center border-l border-gray-800">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white mx-auto mb-1">
                  {initials}
                </div>
                <div className="text-gray-300 text-xs leading-tight font-medium">
                  {c.full_name.split(' ')[0]}
                </div>
                <div className="text-gray-600 text-xs">{c.polling_percentage ?? '—'}%</div>
              </div>
            );
          })}
        </div>

        {/* Issue rows */}
        {matrixIssues.map((issue, i) => {
          const mappedArea = matchIssueToArea(issue);
          return (
            <div
              key={issue}
              className={`grid border-b border-gray-800 ${i % 2 === 0 ? '' : 'bg-gray-900/30'}`}
              style={{ gridTemplateColumns: `180px repeat(${candidates.length}, 1fr)` }}
            >
              <div className="p-3 flex items-center">
                <span className="text-gray-400 text-xs font-medium capitalize leading-tight">{issue}</span>
              </div>
              {candidates.map(c => {
                const pos = mappedArea
                  ? allPositions.find(p => p.candidate_id === c.id && p.issue_area === mappedArea)
                  : undefined;

                if (!pos) {
                  return (
                    <div key={c.id} className="p-3 border-l border-gray-800 flex items-center justify-center">
                      <span className="text-gray-700 text-xs">—</span>
                    </div>
                  );
                }

                const style = STANCE_STYLES[pos.stance] ?? STANCE_STYLES['neutral'];
                return (
                  <div key={c.id} className="p-2 border-l border-gray-800 flex items-center justify-center group relative">
                    <span className={`text-xs font-medium px-2 py-1 rounded cursor-help ${style.cls}`}>
                      {style.label}
                    </span>
                    {pos.stance_description && (
                      <div className="hidden group-hover:block absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 bg-gray-800 border border-gray-600 rounded-lg p-2 text-xs text-gray-300 text-left shadow-xl">
                        {pos.stance_description}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Footer note */}
        <div className="p-3 bg-gray-900/20">
          <p className="text-gray-600 text-xs">
            Posiciones basadas en planes de gobierno y declaraciones públicas. &ldquo;—&rdquo; indica posición no registrada.
          </p>
        </div>
      </div>
    </div>
  );
}
