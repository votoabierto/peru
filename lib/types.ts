// ─── Election Types ─────────────────────────────────────────────────────────

export type ElectionType = 'presidente' | 'senado' | 'diputados' | 'parlamento-andino'

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
  social_media?: {
    twitter?: string | null
    instagram?: string | null
    facebook?: string | null
    youtube?: string | null
    tiktok?: string | null
  } | null
  social_media_verified?: boolean
  is_verified?: boolean
  has_criminal_record?: boolean
  criminal_record_detail?: string
  // JNE enriched data
  jne_party_id?: number
  planGobiernoResumen?: string
  planGobiernoEjes?: Array<{ eje: string; descripcion: string }>
  proposals?: string[]
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
  'far-left': 'bg-red-100 text-red-800 border border-red-300',
  left: 'bg-red-50 text-red-700 border border-red-200',
  'center-left': 'bg-orange-50 text-orange-700 border border-orange-200',
  center: 'bg-gray-100 text-gray-700 border border-gray-300',
  'center-right': 'bg-blue-50 text-blue-700 border border-blue-200',
  right: 'bg-blue-100 text-blue-800 border border-blue-300',
  'far-right': 'bg-blue-200 text-blue-900 border border-blue-400',
  populist: 'bg-purple-50 text-purple-700 border border-purple-200',
  nationalist: 'bg-amber-50 text-amber-700 border border-amber-200',
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
  electionType?: ElectionType
  sourceVerified?: boolean
}

// ─── Party & District Types ─────────────────────────────────────────────────

export interface PartyRegistry {
  id: string
  name: string
  abbr: string
  color: string
  presidentCandidate: string
}

export interface ElectoralDistrict {
  code: string
  name: string
  seats: number
}

// ─── Relational Schema Types (v2) ──────────────────────────────────────────

export type CandidateType = 'presidente' | 'senado' | 'diputado' | 'andino'

export interface PartyV2 {
  id: number
  srop_id: number | null
  name: string
  abbreviation: string | null
  logo_url: string | null
  spectrum: string | null
  ideology_family: string | null
  plan_gobierno_resumen: string | null
  plan_gobierno_ejes: Array<{ eje: string; descripcion: string }> | null
  plan_gobierno_pdf_url: string | null
  color: string | null
  founded_year: number | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface PresidentialCandidate {
  id: string
  slug: string
  full_name: string
  party_id: number | null
  party?: PartyV2
  image_url: string | null
  bio: string | null
  bio_short: string | null
  profession: string | null
  birth_year: number | null
  birth_place: string | null
  years_in_politics: number | null
  social_media: Record<string, string> | null
  data_quality: string
  created_at: string
}

export interface SenateCandidate {
  id: string
  slug: string
  full_name: string
  party_id: number | null
  party?: PartyV2
  district_type: string
  district: string | null
  district_ubigeo: string | null
  list_position: number | null
  image_url: string | null
  bio_short: string | null
  social_media: Record<string, string> | null
  created_at: string
}

export interface DiputadoCandidate {
  id: string
  slug: string
  full_name: string
  party_id: number | null
  party?: PartyV2
  district: string
  district_ubigeo: string | null
  district_seats: number | null
  list_position: number | null
  image_url: string | null
  bio_short: string | null
  social_media: Record<string, string> | null
  created_at: string
}

export interface AndinoCandidate {
  id: string
  slug: string
  full_name: string
  party_id: number | null
  party?: PartyV2
  list_position: number | null
  image_url: string | null
  bio_short: string | null
  social_media: Record<string, string> | null
  created_at: string
}
