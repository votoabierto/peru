import type { IssueArea } from './types'

export interface RegionData {
  name: string
  code: string
  population: number
  key_issues: IssueArea[]
}

export const PERU_REGIONS: RegionData[] = [
  { name: 'Amazonas', code: 'AMA', population: 426_806, key_issues: ['environment', 'infrastructure', 'health'] },
  { name: 'Áncash', code: 'ANC', population: 1_180_638, key_issues: ['mining', 'corruption', 'infrastructure'] },
  { name: 'Apurímac', code: 'APU', population: 430_736, key_issues: ['mining', 'social_programs', 'health'] },
  { name: 'Arequipa', code: 'ARE', population: 1_497_438, key_issues: ['mining', 'economy', 'infrastructure'] },
  { name: 'Ayacucho', code: 'AYA', population: 696_152, key_issues: ['social_programs', 'infrastructure', 'health'] },
  { name: 'Cajamarca', code: 'CAJ', population: 1_453_671, key_issues: ['mining', 'environment', 'corruption'] },
  { name: 'Callao', code: 'CAL', population: 1_129_854, key_issues: ['security', 'infrastructure', 'economy'] },
  { name: 'Cusco', code: 'CUS', population: 1_357_075, key_issues: ['mining', 'social_programs', 'environment'] },
  { name: 'Huancavelica', code: 'HUV', population: 347_639, key_issues: ['social_programs', 'health', 'infrastructure'] },
  { name: 'Huánuco', code: 'HUC', population: 786_802, key_issues: ['infrastructure', 'health', 'social_programs'] },
  { name: 'Ica', code: 'ICA', population: 1_005_970, key_issues: ['economy', 'infrastructure', 'environment'] },
  { name: 'Junín', code: 'JUN', population: 1_370_274, key_issues: ['security', 'mining', 'corruption'] },
  { name: 'La Libertad', code: 'LAL', population: 2_016_771, key_issues: ['security', 'economy', 'education'] },
  { name: 'Lambayeque', code: 'LAM', population: 1_310_785, key_issues: ['security', 'economy', 'infrastructure'] },
  { name: 'Lima', code: 'LIM', population: 11_591_400, key_issues: ['security', 'economy', 'infrastructure'] },
  { name: 'Loreto', code: 'LOR', population: 1_027_559, key_issues: ['environment', 'infrastructure', 'health'] },
  { name: 'Madre de Dios', code: 'MDD', population: 174_690, key_issues: ['environment', 'mining', 'security'] },
  { name: 'Moquegua', code: 'MOQ', population: 196_030, key_issues: ['mining', 'economy', 'environment'] },
  { name: 'Pasco', code: 'PAS', population: 271_736, key_issues: ['mining', 'environment', 'health'] },
  { name: 'Piura', code: 'PIU', population: 2_047_954, key_issues: ['infrastructure', 'economy', 'environment'] },
  { name: 'Puno', code: 'PUN', population: 1_172_697, key_issues: ['social_programs', 'mining', 'security'] },
  { name: 'San Martín', code: 'SAM', population: 899_648, key_issues: ['environment', 'economy', 'infrastructure'] },
  { name: 'Tacna', code: 'TAC', population: 374_780, key_issues: ['economy', 'infrastructure', 'foreign_policy'] },
  { name: 'Tumbes', code: 'TUM', population: 247_880, key_issues: ['security', 'economy', 'environment'] },
  { name: 'Ucayali', code: 'UCA', population: 591_180, key_issues: ['environment', 'infrastructure', 'health'] },
]
