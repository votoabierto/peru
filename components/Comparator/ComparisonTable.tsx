import { Candidate, Position, IDEOLOGY_LABELS, type IssueArea } from '@/lib/types';
import candidatePositionsData from '@/data/candidate-positions.json';

// Shape of candidate-positions.json entries
interface CandidatePositionEntry {
  candidate_id: string;
  candidate_name: string;
  party: string;
  party_abbreviation: string;
  positions: Record<string, { score: number; label: string; verified: boolean }>;
}

const positionsData = candidatePositionsData as CandidatePositionEntry[];

const COMPARISON_ISSUE_LABELS: Record<string, string> = {
  economy: 'Economía',
  security: 'Seguridad',
  education: 'Educación',
  environment: 'Medioambiente',
  health: 'Salud',
  corruption: 'Corrupción',
  infrastructure: 'Infraestructura',
  foreign_policy: 'Política Exterior',
  social_programs: 'Programas Sociales',
  mining: 'Minería',
};

// Map English issue keys (ComparisonTable) → Spanish keys (candidate-positions.json)
const ISSUE_KEY_MAP: Record<string, string> = {
  economy: 'economia',
  security: 'seguridad',
  education: 'educacion',
  environment: 'recursos_naturales',
  health: 'salud',
  corruption: 'corrupcion',
  infrastructure: 'descentralizacion',
  foreign_policy: 'reforma_judicial',
  social_programs: 'politica_social',
  mining: 'constitucion',
};

// Known years in politics for prominent candidates
const KNOWN_YEARS_IN_POLITICS: Record<string, string> = {
  'keiko-fujimori': '20+ años',
  'rafael-lopez-aliaga': '8 años',
  'cesar-acuna': '25+ años',
  'george-forsyth': '8 años',
  'vladimir-cerron': '15+ años',
};

const STANCE_BADGE: Record<string, { cls: string; label: string }> = {
  favor:   { cls: 'bg-[#F0FAF4] text-[#1A6B35] border border-[#2D7D46]',   label: 'Favor' },
  neutral: { cls: 'bg-[#F9FAFB] text-[#4B5563] border border-[#9CA3AF]',    label: 'Neutral' },
  against: { cls: 'bg-[#FEF2F2] text-[#9B1C1C] border border-[#DC2626]',   label: 'Contra' },
};

function ScoreDots({ score }: { score: number }) {
  return (
    <div className="flex items-center justify-center gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          className={`inline-block w-2.5 h-2.5 rounded-full ${
            n <= score ? 'bg-[#1A56A0]' : 'bg-[#E5E3DE]'
          }`}
        />
      ))}
    </div>
  );
}

interface Props {
  candidates: Candidate[];
  allPositions: Position[];
}

export function ComparisonTable({ candidates, allPositions }: Props) {
  // Get positions per candidate per issue from the old Position[] format
  const positionMap: Record<string, Record<string, Position | undefined>> = {};
  for (const c of candidates) {
    positionMap[c.id] = {};
    for (const area of Object.keys(COMPARISON_ISSUE_LABELS)) {
      positionMap[c.id][area] = allPositions.find(
        p => p.candidate_id === c.id && p.issue_area === (area as IssueArea)
      );
    }
  }

  // Build lookup from candidate-positions.json
  const cpMap: Record<string, CandidatePositionEntry | undefined> = {};
  for (const c of candidates) {
    cpMap[c.id] = positionsData.find(
      p => p.candidate_id === c.id || p.candidate_id === c.slug
    );
  }

  function formatPEN(n?: number) {
    if (!n) return 'N/D';
    if (n >= 1_000_000) return `S/ ${(n / 1_000_000).toFixed(1)}M`;
    return `S/ ${Math.round(n / 1000)}K`;
  }

  function getYearsInPolitics(c: Candidate): string {
    if (c.years_in_politics) return `${c.years_in_politics}`;
    const known = KNOWN_YEARS_IN_POLITICS[c.slug] || KNOWN_YEARS_IN_POLITICS[c.id];
    if (known) return known;
    return 'N/D';
  }

  function getIdeology(c: Candidate): string {
    if (c.ideology) return IDEOLOGY_LABELS[c.ideology] ?? c.ideology;
    return 'N/D';
  }

  // Table header candidates
  const candidateCols = candidates.map(c => {
    const initials = c.full_name.split(' ').slice(0, 2).map(n => n[0]).join('');
    return { ...c, initials };
  });

  return (
    <div className="overflow-x-auto -mx-4 md:mx-0">
      <div className="min-w-[600px] bg-white border border-[#E5E3DE] rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid divide-x divide-[#E5E3DE]" style={{ gridTemplateColumns: `200px repeat(${candidates.length}, 1fr)` }}>
          <div className="p-4 bg-[#F7F6F3]" />
          {candidateCols.map(c => (
            <div key={c.id} className="p-4 text-center border-b border-[#E5E3DE]">
              <div className="w-12 h-12 rounded-full bg-[#EEEDE9] flex items-center justify-center text-lg font-bold text-[#111111] mx-auto mb-2">
                {c.initials}
              </div>
              <div className="text-[#111111] font-semibold text-sm leading-tight">{c.full_name}</div>
              <div className="text-[#1A56A0] text-xs mt-0.5">{c.party_name}</div>
            </div>
          ))}
        </div>

        {/* Stats rows */}
        {[
          { label: 'Ideología', render: (c: Candidate) => getIdeology(c) },
          { label: 'Encuestas', render: (c: Candidate) => c.polling_percentage ? `${c.polling_percentage}%` : (c.current_polling ? `${c.current_polling.toFixed(1)}%` : 'N/D') },
          { label: 'Bienes declarados', render: (c: Candidate) => formatPEN(c.declared_assets_pen) },
          { label: 'Antecedentes', render: (c: Candidate) => c.criminal_records?.length ? `${c.criminal_records.length}` : (c.has_criminal_record ? 'Sí' : '0') },
          { label: 'Años en política', render: (c: Candidate) => getYearsInPolitics(c) },
        ].map((row, i) => (
          <div
            key={row.label}
            className={`grid divide-x divide-[#E5E3DE] border-b border-[#E5E3DE] ${i % 2 === 0 ? 'bg-[#F7F6F3]' : ''}`}
            style={{ gridTemplateColumns: `200px repeat(${candidates.length}, 1fr)` }}
          >
            <div className="px-4 py-3 text-[#777777] text-xs font-medium flex items-center">{row.label}</div>
            {candidates.map(c => (
              <div key={c.id} className="px-4 py-3 text-[#222222] text-sm text-center font-medium">
                {row.render(c)}
              </div>
            ))}
          </div>
        ))}

        {/* Issue positions */}
        <div className="px-4 py-3 bg-[#EEEDE9] border-b border-[#E5E3DE]">
          <span className="text-[#444444] text-xs font-semibold uppercase tracking-wide">Posiciones por tema</span>
        </div>
        {Object.entries(COMPARISON_ISSUE_LABELS).map(([area, label], i) => (
          <div
            key={area}
            className={`grid divide-x divide-[#E5E3DE] border-b border-[#E5E3DE] ${i % 2 === 0 ? 'bg-[#F7F6F3]' : ''}`}
            style={{ gridTemplateColumns: `200px repeat(${candidates.length}, 1fr)` }}
          >
            <div className="px-4 py-3 text-[#777777] text-xs font-medium flex items-center">{label}</div>
            {candidates.map(c => {
              // First try the old Position[] format
              const pos = positionMap[c.id]?.[area];
              if (pos) {
                const badge = STANCE_BADGE[pos.stance] ?? STANCE_BADGE.neutral;
                return (
                  <div key={c.id} className="px-2 py-3 text-center group relative">
                    <span className={`inline-block text-xs font-medium px-2 py-1 rounded cursor-help ${badge.cls}`}>
                      {badge.label}
                    </span>
                    {pos.stance_description && (
                      <div className="hidden group-hover:block absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-white border border-[#E5E3DE] rounded-lg p-3 text-xs text-[#444444] text-left shadow-xl">
                        {pos.stance_description}
                      </div>
                    )}
                  </div>
                );
              }

              // Try candidate-positions.json score data
              const cpEntry = cpMap[c.id];
              const spanishKey = ISSUE_KEY_MAP[area];
              const cpPos = cpEntry?.positions?.[spanishKey];
              if (cpPos) {
                return (
                  <div key={c.id} className="px-2 py-3 text-center group relative">
                    <ScoreDots score={cpPos.score} />
                    <p className="text-[10px] text-[#777777] mt-1">{cpPos.label}</p>
                    {!cpPos.verified && (
                      <span className="text-[9px] text-[#CBCAC5]">sin verificar</span>
                    )}
                  </div>
                );
              }

              return (
                <div key={c.id} className="px-2 py-3 text-center">
                  <span className="text-[#CBCAC5] text-xs">—</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
