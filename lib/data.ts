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
