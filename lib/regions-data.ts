import type { IssueArea } from './types'
import regionsJson from '../data/regions.json'
import regionsDetailJson from '../data/regions-detail.json'

// ─── Legacy type used by getRegions() / RegionCard ───────────────────────────

export interface RegionData {
  name: string
  code: string
  population: number
  key_issues: IssueArea[]
}

// Data lives in data/regions.json — edit there for contributions.
export const PERU_REGIONS: RegionData[] = regionsJson as RegionData[]

// ─── Rich region data for detail pages ───────────────────────────────────────

export interface RegionDetailData {
  code: string;            // 3-letter code, e.g. "CAJ"
  name: string;            // Full region name
  capital: string;         // Capital city
  population: number;      // 2024 estimate
  area_km2: number;
  key_issues: string[];    // 4-6 key issues for this region
  gdp_per_capita_usd: number;
  main_industries: string[];
  congressional_seats: number;
  description: string;     // 2-3 sentences
}

// Data lives in data/regions-detail.json — edit there for contributions.
export const REGIONS_DATA: RegionDetailData[] = regionsDetailJson as RegionDetailData[]
