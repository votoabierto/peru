import type { CongressCandidate } from './types'
import congressJson from '../data/congress.json'

// Data lives in data/congress.json — edit there for contributions.
export const CONGRESS_CANDIDATES: CongressCandidate[] = congressJson as CongressCandidate[]
