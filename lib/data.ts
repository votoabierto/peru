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
      console.error('[VotoClaro] Supabase getCandidates error, falling back to seed data:', error)
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
    console.error('[VotoClaro] Supabase getPositions error, falling back to seed data:', error)
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
    console.error('[VotoClaro] Supabase getFactChecks error, falling back to seed data:', error)
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
    console.error('[VotoClaro] Supabase getRegions error, falling back to seed data:', error)
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
      console.error('[VotoClaro] Supabase getCongressCandidates error, falling back to seed data:', error)
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

export async function getPositionsByCandidateId(candidateId: string): Promise<Position[]> {
  return getPositions(candidateId)
}

export async function getFactChecksByCandidateId(candidateId: string): Promise<FactCheck[]> {
  return getFactChecks(candidateId)
}

export async function searchCandidates(query: string): Promise<Candidate[]> {
  if (!query.trim()) return []
  warnIfNotConfigured()

  const q = query.toLowerCase()

  if (!isSupabaseConfigured()) {
    return SEED_CANDIDATES.filter(
      (c) =>
        c.full_name.toLowerCase().includes(q) ||
        c.party_name.toLowerCase().includes(q) ||
        c.career_summary?.toLowerCase().includes(q)
    )
  }

  const client = getSupabaseClient()!
  const { data, error } = await client
    .from('candidates')
    .select('*')
    .or(
      `full_name.ilike.%${query}%,party_name.ilike.%${query}%,career_summary.ilike.%${query}%`
    )
    .limit(10)

  if (error || !data) {
    console.error('[VotoClaro] Supabase searchCandidates error, falling back to seed data:', error)
    return SEED_CANDIDATES.filter(
      (c) =>
        c.full_name.toLowerCase().includes(q) ||
        c.party_name.toLowerCase().includes(q) ||
        c.career_summary?.toLowerCase().includes(q)
    )
  }

  return data as Candidate[]
}
