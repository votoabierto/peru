import type { Candidate, Position, FactCheck } from './types'

// ─── Seed Candidates ─────────────────────────────────────────────────────────
// Source: JNE — Voto Informado (votoinformado.jne.gob.pe)
// Official list of 36 presidential candidates for Peru 2026 general elections (12 April 2026)

function makeCandidate(
  slug: string,
  full_name: string,
  party_name: string,
  party_abbreviation: string,
  party_id: string,
): Candidate {
  return {
    id: slug,
    slug,
    full_name,
    party_id,
    party_abbreviation,
    party_name,
    role: 'president',
    bio_short: `Candidato presidencial por ${party_name} para las Elecciones Generales del 12 de abril de 2026.`,
    career_summary: `Candidato presidencial por ${party_name} para las Elecciones Generales del 12 de abril de 2026.`,
    criminal_records: [],
    has_criminal_record: false,
    is_verified: false,
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-11T00:00:00Z',
  }
}

export const SEED_CANDIDATES: Candidate[] = [
  makeCandidate(
    'keiko-fujimori',
    'Keiko Fujimori',
    'Fuerza Popular',
    'FP',
    'party-fp',
  ),
  makeCandidate(
    'cesar-acuna',
    'César Acuña',
    'Alianza para el Progreso',
    'APP',
    'party-app',
  ),
  makeCandidate(
    'jorge-nieto-montesinos',
    'Jorge Nieto Montesinos',
    'Partido del Buen Gobierno',
    'PBG',
    'party-pbg',
  ),
  makeCandidate(
    'rosario-del-pilar-fernandez',
    'Rosario del Pilar Fernández',
    'Un Camino Diferente',
    'UCD',
    'party-ucd',
  ),
  makeCandidate(
    'herbert-caller',
    'Herbert Caller',
    'Partido Patriótico del Perú',
    'PPP',
    'party-ppp',
  ),
  makeCandidate(
    'alfonso-lopez-chau',
    'Alfonso López-Chau',
    'Ahora Nación',
    'AN',
    'party-an',
  ),
  makeCandidate(
    'jose-luna-galvez',
    'José Luna Gálvez',
    'Podemos Perú',
    'PP',
    'party-pp',
  ),
  makeCandidate(
    'roberto-sanchez',
    'Roberto Sánchez',
    'Juntos por el Perú',
    'JP',
    'party-jp',
  ),
  makeCandidate(
    'carlos-jaico',
    'Carlos Jaico',
    'Perú Moderno',
    'PM',
    'party-pm',
  ),
  makeCandidate(
    'fernando-olivera',
    'Fernando Olivera',
    'Partido Frente de la Esperanza 2021',
    'FE',
    'party-fe',
  ),
  makeCandidate(
    'charlie-carrasco',
    'Charlie Carrasco',
    'Partido Demócrata Unido Perú',
    'PDUP',
    'party-pdup',
  ),
  makeCandidate(
    'marisol-perez-tello',
    'Marisol Pérez Tello',
    'Primero la Gente',
    'PLG',
    'party-plg',
  ),
  makeCandidate(
    'paul-jaimes',
    'Paul Jaimes',
    'Progresemos',
    'PROG',
    'party-prog',
  ),
  makeCandidate(
    'mesias-guevara',
    'Mesías Guevara',
    'Partido Morado',
    'MORA',
    'party-mora',
  ),
  makeCandidate(
    'alvaro-paz-de-la-barra',
    'Álvaro Paz de la Barra',
    'Fe en el Perú',
    'FEP',
    'party-fep',
  ),
  makeCandidate(
    'george-forsyth',
    'George Forsyth',
    'Partido Democrático Somos Perú',
    'SP',
    'party-sp',
  ),
  makeCandidate(
    'carlos-alvarez',
    'Carlos Álvarez',
    'País Para Todos',
    'PPT',
    'party-ppt',
  ),
  makeCandidate(
    'francisco-diez-canseco',
    'Francisco Diez-Canseco',
    'Perú Acción',
    'PA',
    'party-pa',
  ),
  makeCandidate(
    'wolfgang-grozo',
    'Wolfgang Grozo',
    'Integridad Democrática',
    'ID',
    'party-id',
  ),
  makeCandidate(
    'ricardo-belmont',
    'Ricardo Belmont',
    'Partido Cívico Obras',
    'PCO',
    'party-pco',
  ),
  makeCandidate(
    'napoleon-becerra',
    'Napoleón Becerra',
    'Partido de los Trabajadores y Emprendedores PTE-Perú',
    'PTE',
    'party-pte',
  ),
  makeCandidate(
    'ronald-atencio',
    'Ronald Atencio',
    'Alianza Electoral Venceremos',
    'AEV',
    'party-aev',
  ),
  makeCandidate(
    'yonhy-lescano',
    'Yonhy Lescano',
    'Partido Político Cooperación Popular',
    'CP',
    'party-cp',
  ),
  makeCandidate(
    'mario-vizcarra',
    'Mario Vizcarra',
    'Partido Político Perú Primero',
    'PPR',
    'party-ppr',
  ),
  makeCandidate(
    'joaquin-masse-fernandez',
    'Joaquín Massé Fernández',
    'Partido Democrático Federal',
    'PDF',
    'party-pdf',
  ),
  makeCandidate(
    'enrique-valderrama',
    'Enrique Valderrama',
    'Partido Aprista Peruano',
    'PAP',
    'party-pap',
  ),
  makeCandidate(
    'alex-gonzales-castillo',
    'Alex Gonzales Castillo',
    'Partido Demócrata Verde',
    'PDV',
    'party-pdv',
  ),
  makeCandidate(
    'roberto-chiabra',
    'Roberto Chiabra',
    'Unidad Nacional',
    'UN',
    'party-un',
  ),
  makeCandidate(
    'rafael-belaunde',
    'Rafael Belaunde',
    'Libertad Popular',
    'LP',
    'party-lp',
  ),
  makeCandidate(
    'carlos-espa',
    'Carlos Espá',
    'Partido SíCreo',
    'SC',
    'party-sc',
  ),
  makeCandidate(
    'antonio-ortiz-villano',
    'Antonio Ortiz Villano',
    'Salvemos al Perú',
    'SAP',
    'party-sap',
  ),
  makeCandidate(
    'fiorella-molinelli',
    'Fiorella Molinelli',
    'Fuerza y Libertad',
    'FYL',
    'party-fyl',
  ),
  makeCandidate(
    'vladimir-cerron',
    'Vladimir Cerrón',
    'Partido Político Nacional Perú Libre',
    'PL',
    'party-pl',
  ),
  makeCandidate(
    'walter-chirinos',
    'Walter Chirinos',
    'Partido Político PRIN',
    'PRIN',
    'party-prin',
  ),
  makeCandidate(
    'rafael-lopez-aliaga',
    'Rafael López Aliaga',
    'Renovación Popular',
    'RP',
    'party-rp',
  ),
  makeCandidate(
    'jose-williams-zapata',
    'José Williams Zapata',
    'Avanza País',
    'AVP',
    'party-avp',
  ),
]

// ─── Seed Positions ───────────────────────────────────────────────────────────
// Positions will be populated from verified sources only.

export const SEED_POSITIONS: Position[] = []

// ─── Seed Fact Checks ─────────────────────────────────────────────────────────
// Fact checks will be populated from verified sources only.

export const SEED_FACT_CHECKS: FactCheck[] = []
