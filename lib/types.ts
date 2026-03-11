// ─── Domain Types ────────────────────────────────────────────────────────────

export type IssueArea =
  | 'security'
  | 'education'
  | 'health'
  | 'economy'
  | 'environment'
  | 'mining'
  | 'corruption'
  | 'infrastructure'
  | 'social_programs'
  | 'foreign_policy'

export type Verdict =
  | 'true'
  | 'false'
  | 'misleading'
  | 'unverifiable'
  | 'context_needed'

export type IdeologyType =
  | 'far-left'
  | 'left'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'right'
  | 'far-right'
  | 'populist'
  | 'nationalist'

// ─── Database Entity Types ────────────────────────────────────────────────────

export interface Region {
  id: string
  name: string
  code: string
  population?: number
  key_issues: IssueArea[]
  created_at: string
  updated_at: string
}

export interface Party {
  id: string
  abbreviation: string
  name: string
  ideology?: IdeologyType
  color?: string
  founded_year?: number
  logo_url?: string
  created_at: string
  updated_at: string
}

export interface CriminalRecord {
  id: string
  candidate_id: string
  year: number
  description: string
  outcome: string
  court?: string
}

export interface Candidate {
  id: string
  slug: string
  full_name: string
  common_name?: string
  party_id: string
  party_abbreviation: string
  party_name: string
  role: 'president' | 'vice_president' | 'senator' | 'representative'
  region_id?: string
  region_name?: string
  ideology?: IdeologyType
  age?: number
  photo_url?: string
  career_summary?: string
  bio?: string
  bio_short?: string
  current_polling?: number
  polling_percentage?: number
  declared_assets_pen?: number
  criminal_records?: CriminalRecord[]
  years_in_politics?: number
  prior_offices?: string[]
  born_year?: number
  born_city?: string
  website?: string
  twitter?: string
  facebook?: string
  is_verified?: boolean
  has_criminal_record?: boolean
  criminal_record_detail?: string
  created_at: string
  updated_at: string
}

export interface Position {
  id: string
  candidate_id: string
  issue_area: IssueArea
  stance: string
  stance_description?: string
  quote?: string
  source_quote?: string
  source_url?: string
  source?: string
  verified?: boolean
  created_at: string
  updated_at: string
}

export interface FactCheck {
  id: string
  candidate_id: string
  candidate_name?: string
  claim: string
  verdict: Verdict
  explanation: string
  source_url?: string
  source?: string
  checked_at?: string
  date_checked?: string
  category?: string
  created_at?: string
  updated_at?: string
}

// ─── Label & Color Maps ───────────────────────────────────────────────────────

export const ISSUE_LABELS: Record<IssueArea, { label: string; icon: string }> = {
  security: { label: 'Seguridad', icon: '🔒' },
  education: { label: 'Educación', icon: '📚' },
  health: { label: 'Salud', icon: '🏥' },
  economy: { label: 'Economía', icon: '💰' },
  environment: { label: 'Medioambiente', icon: '🌿' },
  mining: { label: 'Minería', icon: '⛏️' },
  corruption: { label: 'Corrupción', icon: '⚖️' },
  infrastructure: { label: 'Infraestructura', icon: '🏗️' },
  social_programs: { label: 'Programas Sociales', icon: '🤝' },
  foreign_policy: { label: 'Política Exterior', icon: '🌐' },
}

export const IDEOLOGY_COLORS: Record<string, string> = {
  'far-left': 'bg-red-900 text-red-200',
  left: 'bg-red-700 text-red-100',
  'center-left': 'bg-orange-700 text-orange-100',
  center: 'bg-gray-600 text-gray-100',
  'center-right': 'bg-blue-700 text-blue-100',
  right: 'bg-blue-800 text-blue-100',
  'far-right': 'bg-blue-900 text-blue-200',
  populist: 'bg-purple-700 text-purple-100',
  nationalist: 'bg-yellow-700 text-yellow-100',
}

export const IDEOLOGY_LABELS: Record<string, string> = {
  'far-left': 'Extrema izquierda',
  left: 'Izquierda',
  'center-left': 'Centro-izquierda',
  center: 'Centro',
  'center-right': 'Centro-derecha',
  right: 'Derecha',
  'far-right': 'Extrema derecha',
  populist: 'Populista',
  nationalist: 'Nacionalista',
}

export const VERDICT_LABELS: Record<Verdict, string> = {
  true: 'Verdadero',
  false: 'Falso',
  misleading: 'Engañoso',
  unverifiable: 'No verificable',
  context_needed: 'Necesita contexto',
}

export interface CongressCandidate {
  id: string
  full_name: string
  party: string
  party_abbreviation: string
  region: string
  list_position: number
  role: 'congresista'
  ideology: IdeologyType
  bio: string
  photo_url: string | null
  prior_roles: string[]
  key_stances: string[]
  polling_percentage?: number | null
}
