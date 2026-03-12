import { isSupabaseConfigured, warnIfNotConfigured, getSupabaseClient } from './supabase'
import {
  SEED_CANDIDATES,
  SEED_POSITIONS,
  SEED_FACT_CHECKS,
} from './seed-data'
import { PERU_REGIONS, type RegionData } from './regions-data'
import { CONGRESS_CANDIDATES } from './congress-data'
import type { Candidate, Position, FactCheck, CongressCandidate } from './types'

export interface CandidateFilters {
  role?: 'president' | 'vice_president' | 'senator' | 'representative'
  party?: string
  ideology?: string
  searchQuery?: string
}

export async function getCandidates(filters?: CandidateFilters): Promise<Candidate[]> {
  warnIfNotConfigured()

  let candidates: Candidate[]

  if (!isSupabaseConfigured()) {
    candidates = SEED_CANDIDATES
  } else {
    const client = getSupabaseClient()!
    let query = client.from('candidates').select('*')

    if (filters?.role) {
      query = query.eq('role', filters.role)
    }
    if (filters?.party) {
      query = query.eq('party_abbreviation', filters.party)
    }

    const { data, error } = await query
    if (error || !data) {
      console.error('[VotoAbierto] Supabase getCandidates error, falling back to seed data:', error)
      candidates = SEED_CANDIDATES
    } else {
      candidates = data as Candidate[]
    }
  }

  // Apply client-side filters (work for both seed and Supabase data)
  if (filters?.ideology) {
    candidates = candidates.filter((c) => c.ideology === filters.ideology)
  }
  if (filters?.searchQuery) {
    const q = filters.searchQuery.toLowerCase()
    candidates = candidates.filter(
      (c) =>
        c.full_name.toLowerCase().includes(q) ||
        c.party_name.toLowerCase().includes(q) ||
        c.career_summary?.toLowerCase().includes(q)
    )
  }

  return candidates
}

export async function getCandidateById(id: string): Promise<Candidate | null> {
  warnIfNotConfigured()

  if (!isSupabaseConfigured()) {
    return SEED_CANDIDATES.find((c) => c.id === id || c.slug === id) ?? null
  }

  const client = getSupabaseClient()!
  // Try by id first, then by slug
  const { data, error } = await client
    .from('candidates')
    .select('*')
    .or(`id.eq.${id},slug.eq.${id}`)
    .limit(1)
    .maybeSingle()

  if (error || !data) {
    const seedCandidate = SEED_CANDIDATES.find((c) => c.id === id || c.slug === id)
    if (seedCandidate) return seedCandidate
    return null
  }

  return data as Candidate
}

export async function getPositions(candidateId?: string): Promise<Position[]> {
  warnIfNotConfigured()

  if (!isSupabaseConfigured()) {
    if (candidateId) {
      return SEED_POSITIONS.filter((p) => p.candidate_id === candidateId)
    }
    return SEED_POSITIONS
  }

  const client = getSupabaseClient()!
  let query = client.from('positions').select('*')
  if (candidateId) {
    query = query.eq('candidate_id', candidateId)
  }

  const { data, error } = await query
  if (error || !data) {
    console.error('[VotoAbierto] Supabase getPositions error, falling back to seed data:', error)
    if (candidateId) {
      return SEED_POSITIONS.filter((p) => p.candidate_id === candidateId)
    }
    return SEED_POSITIONS
  }

  return data as Position[]
}

export async function getFactChecks(candidateId?: string): Promise<FactCheck[]> {
  warnIfNotConfigured()

  if (!isSupabaseConfigured()) {
    if (candidateId) {
      return SEED_FACT_CHECKS.filter((f) => f.candidate_id === candidateId)
    }
    return SEED_FACT_CHECKS
  }

  const client = getSupabaseClient()!
  let query = client.from('fact_checks').select('*')
  if (candidateId) {
    query = query.eq('candidate_id', candidateId)
  }

  const { data, error } = await query
  if (error || !data) {
    console.error('[VotoAbierto] Supabase getFactChecks error, falling back to seed data:', error)
    if (candidateId) {
      return SEED_FACT_CHECKS.filter((f) => f.candidate_id === candidateId)
    }
    return SEED_FACT_CHECKS
  }

  return data as FactCheck[]
}

export async function getRegions(): Promise<RegionData[]> {
  warnIfNotConfigured()

  if (!isSupabaseConfigured()) {
    return PERU_REGIONS
  }

  const client = getSupabaseClient()!
  const { data, error } = await client
    .from('regions')
    .select('name, code, population, key_issues')

  if (error || !data) {
    console.error('[VotoAbierto] Supabase getRegions error, falling back to seed data:', error)
    return PERU_REGIONS
  }

  return data as RegionData[]
}

export interface CongressFilters {
  party?: string
  region?: string
}

export async function getCongressCandidates(filters?: CongressFilters): Promise<CongressCandidate[]> {
  warnIfNotConfigured()

  let candidates: CongressCandidate[]

  if (!isSupabaseConfigured()) {
    candidates = CONGRESS_CANDIDATES
  } else {
    const client = getSupabaseClient()!
    let query = client.from('congress_candidates').select('*')

    if (filters?.party) {
      query = query.eq('party', filters.party)
    }
    if (filters?.region) {
      query = query.eq('region', filters.region)
    }

    const { data, error } = await query
    if (error || !data) {
      console.error('[VotoAbierto] Supabase getCongressCandidates error, falling back to seed data:', error)
      candidates = CONGRESS_CANDIDATES
    } else {
      candidates = data as CongressCandidate[]
    }
  }

  if (filters?.party) {
    candidates = candidates.filter((c) => c.party === filters.party)
  }
  if (filters?.region) {
    candidates = candidates.filter((c) => c.region === filters.region)
  }

  return candidates.sort((a, b) => {
    if (a.party !== b.party) return a.party.localeCompare(b.party)
    return a.list_position - b.list_position
  })
}

export async function getCandidatesByIds(ids: string[]): Promise<Candidate[]> {
  if (ids.length === 0) return [];

  if (isSupabaseConfigured()) {
    const client = getSupabaseClient()!
    const { data } = await client
      .from('candidates')
      .select('*')
      .in('id', ids);
    if (data && data.length > 0) return data as Candidate[];
  }

  // Fallback: match by id OR slug (wave 6 added slug support)
  return SEED_CANDIDATES.filter(c => ids.includes(c.id) || ids.includes(c.slug));
}

export async function getPositionsByCandidateId(candidateId: string): Promise<Position[]> {
  return getPositions(candidateId)
}

export async function getFactChecksByCandidateId(candidateId: string): Promise<FactCheck[]> {
  return getFactChecks(candidateId)
}

// Enhanced searchCandidates — supports Supabase pg_trgm or seed data fallback
export async function searchCandidates(query: string, limit = 10): Promise<Candidate[]> {
  if (!query.trim()) return [];

  if (isSupabaseConfigured()) {
    const client = getSupabaseClient()!
    const { data } = await client
      .from('candidates')
      .select('*')
      .or(`full_name.ilike.%${query}%,bio.ilike.%${query}%,party_name.ilike.%${query}%`)
      .order('polling_percentage', { ascending: false, nullsFirst: false })
      .limit(limit);
    if (data && data.length > 0) return data as Candidate[];
  }

  const q = query.toLowerCase();
  return SEED_CANDIDATES
    .filter(c =>
      c.full_name.toLowerCase().includes(q) ||
      c.party_name.toLowerCase().includes(q) ||
      (c.bio ?? '').toLowerCase().includes(q) ||
      (c.ideology ?? '').toLowerCase().includes(q)
    )
    .sort((a, b) => (b.polling_percentage ?? 0) - (a.polling_percentage ?? 0))
    .slice(0, limit);
}

export async function searchFactChecks(query: string, limit = 6): Promise<FactCheck[]> {
  if (!query.trim()) return [];

  if (isSupabaseConfigured()) {
    const client = getSupabaseClient()!
    const { data } = await client
      .from('fact_checks')
      .select('*')
      .or(`claim.ilike.%${query}%,explanation.ilike.%${query}%,candidate_name.ilike.%${query}%`)
      .order('date_checked', { ascending: false })
      .limit(limit);
    if (data && data.length > 0) return data as FactCheck[];
  }

  const q = query.toLowerCase();
  return SEED_FACT_CHECKS
    .filter(fc =>
      fc.claim.toLowerCase().includes(q) ||
      fc.explanation.toLowerCase().includes(q) ||
      (fc.candidate_name ?? '').toLowerCase().includes(q)
    )
    .slice(0, limit);
}

export async function searchRegions(query: string, limit = 5): Promise<Array<{ id: string; name: string; code: string; capital: string }>> {
  if (!query.trim()) return [];
  const { REGIONS_DATA } = await import('./regions-data');
  const q = query.toLowerCase();
  return REGIONS_DATA
    .filter((r: { name: string; capital: string; key_issues?: string[]; main_industries?: string[] }) =>
      r.name.toLowerCase().includes(q) ||
      r.capital.toLowerCase().includes(q) ||
      (r.key_issues ?? []).some((i: string) => i.toLowerCase().includes(q)) ||
      (r.main_industries ?? []).some((i: string) => i.toLowerCase().includes(q))
    )
    .slice(0, limit)
    .map((r: { name: string; code: string; capital: string }) => ({ id: r.code, name: r.name, code: r.code, capital: r.capital }));
}

export async function searchAll(query: string): Promise<{
  candidates: Candidate[];
  factChecks: FactCheck[];
  regions: Array<{ id: string; name: string; code: string; capital: string }>;
}> {
  if (!query.trim()) return { candidates: [], factChecks: [], regions: [] };

  const [candidates, factChecks, regions] = await Promise.all([
    searchCandidates(query, 5),
    searchFactChecks(query, 3),
    searchRegions(query, 3),
  ]);

  return { candidates, factChecks, regions };
}

// ─── Relational Data Functions (v2 schema) ──────────────────────────────

import type {
  PartyV2,
  PresidentialCandidate,
  SenateCandidate,
  DiputadoCandidate,
  AndinoCandidate,
  CandidateType,
} from './types'

const CANDIDATE_TABLE_MAP: Record<CandidateType, string> = {
  presidente: 'candidates_president',
  senado: 'candidates_senate',
  diputado: 'candidates_diputados',
  andino: 'candidates_andino',
}

export async function getParties(): Promise<PartyV2[]> {
  if (!isSupabaseConfigured()) return []
  const client = getSupabaseClient()!
  const { data, error } = await client.from('parties_v2').select('*').eq('active', true)
  if (error) {
    console.error('[VotoAbierto] getParties error:', error.message)
    return []
  }
  return data as PartyV2[]
}

export async function getPartyBySropId(sropId: number): Promise<PartyV2 | null> {
  if (!isSupabaseConfigured()) return null
  const client = getSupabaseClient()!
  const { data } = await client
    .from('parties_v2')
    .select('*')
    .eq('srop_id', sropId)
    .maybeSingle()
  return data as PartyV2 | null
}

export async function getCandidatesV2(
  type: CandidateType,
  filters?: { party_id?: number; district?: string; search?: string }
): Promise<(PresidentialCandidate | SenateCandidate | DiputadoCandidate | AndinoCandidate)[]> {
  if (!isSupabaseConfigured()) return []
  const client = getSupabaseClient()!
  const table = CANDIDATE_TABLE_MAP[type]

  let query = client.from(table).select('*, parties_v2!party_id(*)')

  if (filters?.party_id) {
    query = query.eq('party_id', filters.party_id)
  }
  if (filters?.district && (type === 'senado' || type === 'diputado')) {
    query = query.eq('district', filters.district)
  }
  if (filters?.search) {
    query = query.ilike('full_name', `%${filters.search}%`)
  }

  const { data, error } = await query
  if (error) {
    console.error(`[VotoAbierto] getCandidatesV2(${type}) error:`, error.message)
    return []
  }

  // Map joined party to nested object
  return (data ?? []).map((row: Record<string, unknown>) => {
    const { parties_v2, ...candidate } = row
    return { ...candidate, party: parties_v2 } as PresidentialCandidate | SenateCandidate | DiputadoCandidate | AndinoCandidate
  })
}

export async function getCandidateWithParty(
  slug: string,
  type: CandidateType = 'presidente'
): Promise<(PresidentialCandidate | SenateCandidate | DiputadoCandidate | AndinoCandidate) | null> {
  if (!isSupabaseConfigured()) return null
  const client = getSupabaseClient()!
  const table = CANDIDATE_TABLE_MAP[type]

  const { data, error } = await client
    .from(table)
    .select('*, parties_v2!party_id(*)')
    .eq('slug', slug)
    .maybeSingle()

  if (error || !data) return null

  const { parties_v2, ...candidate } = data as Record<string, unknown>
  return { ...candidate, party: parties_v2 } as PresidentialCandidate | SenateCandidate | DiputadoCandidate | AndinoCandidate
}

// ─── New Data Architecture Functions ─────────────────────────────────────

export interface HojaDeVida {
  id: string
  candidate_slug: string
  education: Array<{
    nivel: string
    institucion: string
    titulo: string
    year_start: string
    year_end: string
    country: string
  }> | null
  work_history: Array<{
    cargo: string
    institucion: string
    sector: string
    year_start: string
    year_end: string
    pais: string
    departamento: string
  }> | null
  public_offices: Array<{
    cargo: string
    institucion: string
    year_start: string
    year_end: string
  }> | null
  birth_date: string | null
  birth_place: string | null
  age: number | null
  profession: string | null
  source: string
  fetched_at: string
}

export interface Antecedente {
  id: string
  candidate_slug: string
  tipo: string
  descripcion: string
  fuente: string
  fuente_url: string | null
  fecha_inicio: string | null
  fecha_fin: string | null
  estado: string | null
  gravedad: string | null
  verified: boolean
  created_at: string
}

export interface BienesCandidato {
  id: string
  candidate_slug: string
  total_bienes_pen: number | null
  total_ingresos_anuales_pen: number | null
  total_deudas_pen: number | null
  bienes_inmuebles: Array<{ descripcion: string; valor_pen: number; ubicacion: string }> | null
  bienes_muebles: Array<{ descripcion: string; valor_pen: number }> | null
  declaration_year: number | null
  source: string
}

export interface CandidatePositionDB {
  id: string
  candidate_slug: string
  issue_key: string
  position_score: number
  position_label: string
  evidence: string | null
  source: string
}

export interface CandidateFactcheckDB {
  id: string
  candidate_slug: string
  claim: string
  verdict: string
  explanation: string | null
  source_url: string | null
  checked_at: string | null
}

export async function getHojaDeVida(slug: string): Promise<HojaDeVida | null> {
  if (!isSupabaseConfigured()) return null
  const client = getSupabaseClient()!
  const { data } = await client
    .from('candidate_hoja_de_vida')
    .select('*')
    .eq('candidate_slug', slug)
    .maybeSingle()
  return data as HojaDeVida | null
}

export async function getAntecedentes(slug: string): Promise<Antecedente[]> {
  if (!isSupabaseConfigured()) return []
  const client = getSupabaseClient()!
  const { data } = await client
    .from('candidate_antecedentes')
    .select('*')
    .eq('candidate_slug', slug)
  return (data as Antecedente[]) ?? []
}

export async function getBienes(slug: string): Promise<BienesCandidato | null> {
  if (!isSupabaseConfigured()) return null
  const client = getSupabaseClient()!
  const { data } = await client
    .from('candidate_bienes')
    .select('*')
    .eq('candidate_slug', slug)
    .maybeSingle()
  return data as BienesCandidato | null
}

export async function getCandidatePositionsDB(slug: string): Promise<CandidatePositionDB[]> {
  if (!isSupabaseConfigured()) return []
  const client = getSupabaseClient()!
  const { data } = await client
    .from('candidate_positions_db')
    .select('*')
    .eq('candidate_slug', slug)
  return (data as CandidatePositionDB[]) ?? []
}

export async function getCandidateFactchecks(slug: string): Promise<CandidateFactcheckDB[]> {
  if (!isSupabaseConfigured()) return []
  const client = getSupabaseClient()!
  const { data } = await client
    .from('candidate_factchecks')
    .select('*')
    .eq('candidate_slug', slug)
  return (data as CandidateFactcheckDB[]) ?? []
}

export async function getDataStats(): Promise<{
  totalCandidates: number
  totalWithHdv: number
  totalWithAntecedentes: number
  totalWithBienes: number
  totalPositions: number
  totalFactchecks: number
  lastUpdated: string | null
}> {
  const defaults = {
    totalCandidates: 36,
    totalWithHdv: 0,
    totalWithAntecedentes: 0,
    totalWithBienes: 0,
    totalPositions: 0,
    totalFactchecks: 0,
    lastUpdated: null,
  }
  if (!isSupabaseConfigured()) return defaults

  const client = getSupabaseClient()!
  const [profiles, hdv, ant, bienes, positions, fc] = await Promise.all([
    client.from('candidate_profiles').select('candidate_slug', { count: 'exact', head: true }),
    client.from('candidate_hoja_de_vida').select('candidate_slug', { count: 'exact', head: true }),
    client.from('candidate_antecedentes').select('candidate_slug', { count: 'exact', head: true }),
    client.from('candidate_bienes').select('candidate_slug', { count: 'exact', head: true }),
    client.from('candidate_positions_db').select('candidate_slug', { count: 'exact', head: true }),
    client.from('candidate_factchecks').select('candidate_slug', { count: 'exact', head: true }),
  ])

  return {
    totalCandidates: profiles.count ?? 36,
    totalWithHdv: hdv.count ?? 0,
    totalWithAntecedentes: ant.count ?? 0,
    totalWithBienes: bienes.count ?? 0,
    totalPositions: positions.count ?? 0,
    totalFactchecks: fc.count ?? 0,
    lastUpdated: new Date().toISOString(),
  }
}
