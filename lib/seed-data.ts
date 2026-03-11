import type { Candidate, Position, FactCheck } from './types'
import candidatesJson from '../data/candidates.json'
import positionsJson from '../data/positions.json'
import factChecksJson from '../data/fact-checks.json'

// ─── Seed Candidates ─────────────────────────────────────────────────────────
// Source: JNE — Voto Informado (votoinformado.jne.gob.pe)
// Official list of 36 presidential candidates for Peru 2026 general elections (12 April 2026)
// Data lives in data/candidates.json — edit there for contributions.

export const SEED_CANDIDATES: Candidate[] = candidatesJson as Candidate[]

// ─── Seed Positions ───────────────────────────────────────────────────────────
// Positions will be populated from verified sources only.
// Data lives in data/positions.json — edit there for contributions.

export const SEED_POSITIONS: Position[] = positionsJson as Position[]

// ─── Seed Fact Checks ─────────────────────────────────────────────────────────
// Fact checks will be populated from verified sources only.
// Data lives in data/fact-checks.json — edit there for contributions.

export const SEED_FACT_CHECKS: FactCheck[] = factChecksJson as FactCheck[]
