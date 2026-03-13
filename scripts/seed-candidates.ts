#!/usr/bin/env tsx
/**
 * VotoAbierto Production Seeder
 * Seeds all candidates, positions, fact-checks, congress candidates, and regions into Supabase.
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
 *   npx tsx scripts/seed-candidates.ts
 *
 * The service role key bypasses RLS policies (needed for inserts).
 * NEVER use this key client-side or expose it publicly.
 *
 * Requires migrations 001 and 002 to be applied first.
 */

import { createClient } from '@supabase/supabase-js'
import { SEED_CANDIDATES, SEED_POSITIONS, SEED_FACT_CHECKS } from '../lib/seed-data'
import { CONGRESS_CANDIDATES } from '../lib/congress-data'
import { PERU_REGIONS } from '../lib/regions-data'

// ============================================================
// Configuration validation
// ============================================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing required environment variables:')
  if (!supabaseUrl) console.error('   NEXT_PUBLIC_SUPABASE_URL is not set')
  if (!serviceKey) console.error('   SUPABASE_SERVICE_ROLE_KEY is not set')
  console.error('\nUsage:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \\')
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \\')
  console.error('  npx tsx scripts/seed-candidates.ts')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// ============================================================
// Party UUID mapping
// Maps seed data party_id strings → actual DB UUIDs
// UUIDs starting with 11111111 are seeded in migration 001
// UUIDs starting with 22222222 are new parties seeded here
// ============================================================
const PARTY_ID_MAP: Record<string, string | undefined> = {
  // Parties from migration 001
  'party-rp-0001':     '11111111-0000-0000-0000-000000000001', // Renovación Popular
  'party-fp-0003':     '11111111-0000-0000-0000-000000000002', // Fuerza Popular
  'party-pl-0002':     '11111111-0000-0000-0000-000000000003', // Perú Libre
  'party-app-0005':    '11111111-0000-0000-0000-000000000004', // Alianza para el Progreso
  'party-ppt-0006':    '11111111-0000-0000-0000-000000000005', // País para Todos
  'party-an-0004':     '11111111-0000-0000-0000-000000000006', // Ahora Nación
  'party-avp-0010':    '11111111-0000-0000-0000-000000000007', // Avanza País / Avancemos Perú
  'party-pap-0018':    '11111111-0000-0000-0000-000000000008', // Partido Aprista Peruano
  'party-sp-0014':     '11111111-0000-0000-0000-000000000009', // Somos Perú
  'party-ap-0009':     '11111111-0000-0000-0000-000000000010', // Acción Popular
  'party-ppc-0015':    '11111111-0000-0000-0000-000000000011', // Partido Popular Cristiano
  // New parties not in migration 001
  'party-pp-0007':     '22222222-0000-0000-0000-000000000001', // Podemos Perú
  'party-pm-0008':     '22222222-0000-0000-0000-000000000002', // Partido Morado
  'party-ind-0011':    '22222222-0000-0000-0000-000000000003', // Independiente
  'party-vn-0012':     '22222222-0000-0000-0000-000000000004', // Victoria Nacional
  'party-azp-0016':    '22222222-0000-0000-0000-000000000005', // Avanza País (Hernando de Soto)
  'party-jp-0017':     '22222222-0000-0000-0000-000000000006', // Juntos por el Perú
  'party-cpc-0020':    '22222222-0000-0000-0000-000000000007', // Ciudadanos por el Cambio
  'party-etan-0022':   '22222222-0000-0000-0000-000000000008', // ETAN
  'party-pnp-0023':    '22222222-0000-0000-0000-000000000009', // Partido Nacionalista Peruano
  'party-pl-ind-0025': '22222222-0000-0000-0000-000000000010', // Partido Liberal (Carlos Anderson)
  'party-cp-0026':     '22222222-0000-0000-0000-000000000011', // Coalición Progresista
  'party-fa-0027':     '22222222-0000-0000-0000-000000000012', // Frente Amplio
  'party-frepap-0028': '22222222-0000-0000-0000-000000000013', // FREPAP
  // These reuse existing UUIDs (same underlying party)
  'party-plm-0031':    '11111111-0000-0000-0000-000000000003', // Perú Libre / Mov. Magisterial
}

// Extra parties to upsert (those not in migration 001).
// ideology must match parties table CHECK constraint values.
const EXTRA_PARTIES = [
  { id: '22222222-0000-0000-0000-000000000001', name: 'Podemos Perú',                abbreviation: 'PP',     ideology: 'center'       },
  { id: '22222222-0000-0000-0000-000000000002', name: 'Partido Morado',               abbreviation: 'PM',     ideology: 'center'       },
  { id: '22222222-0000-0000-0000-000000000003', name: 'Independiente',                abbreviation: 'IND',    ideology: 'center'       },
  { id: '22222222-0000-0000-0000-000000000004', name: 'Victoria Nacional',            abbreviation: 'VN',     ideology: 'center-right' },
  { id: '22222222-0000-0000-0000-000000000005', name: 'Avanza País',                  abbreviation: 'AZP',    ideology: 'right'        },
  { id: '22222222-0000-0000-0000-000000000006', name: 'Juntos por el Perú',           abbreviation: 'JP',     ideology: 'left'         },
  { id: '22222222-0000-0000-0000-000000000007', name: 'Ciudadanos por el Cambio',     abbreviation: 'CPC',    ideology: 'populist'     },
  { id: '22222222-0000-0000-0000-000000000008', name: 'ETAN',                         abbreviation: 'ETAN',   ideology: 'left'         },
  { id: '22222222-0000-0000-0000-000000000009', name: 'Partido Nacionalista Peruano', abbreviation: 'PNP',    ideology: 'left'         },
  { id: '22222222-0000-0000-0000-000000000010', name: 'Partido Liberal',              abbreviation: 'PLI',    ideology: 'center'       },
  { id: '22222222-0000-0000-0000-000000000011', name: 'Coalición Progresista',        abbreviation: 'CP',     ideology: 'center-left'  },
  { id: '22222222-0000-0000-0000-000000000012', name: 'Frente Amplio',                abbreviation: 'FA',     ideology: 'left'         },
  { id: '22222222-0000-0000-0000-000000000013', name: 'FREPAP',                       abbreviation: 'FREPAP', ideology: 'center'       },
]

// ============================================================
// Utility
// ============================================================
function log(message: string): void {
  console.log(message)
}

function logError(message: string, error: unknown): void {
  console.error(`❌ ${message}`)
  if (error && typeof error === 'object' && 'message' in error) {
    console.error(`   ${(error as { message: string }).message}`)
  } else {
    console.error('   ', error)
  }
}

// ============================================================
// Seeding functions
// ============================================================

async function seedExtraParties(): Promise<void> {
  log(`\n🏛️  Upserting ${EXTRA_PARTIES.length} additional parties...`)
  const { error } = await supabase
    .from('parties')
    .upsert(EXTRA_PARTIES, { onConflict: 'id' })
  if (error) throw new Error(`Upsert parties failed: ${error.message}`)
  log(`  ✅ ${EXTRA_PARTIES.length} additional parties upserted`)
}

async function seedRegions(): Promise<void> {
  log(`\n📍 Upserting ${PERU_REGIONS.length} regions...`)
  // Migration 001 already seeds regions; this upserts additional region data.
  // Using ignoreDuplicates since regions table uses SERIAL id (not specified in insert).
  const records = PERU_REGIONS.map(r => ({
    name: r.name,
    code: r.code,
    population: r.population,
    key_issues: r.key_issues as string[],
  }))
  const { error } = await supabase
    .from('regions')
    .upsert(records, { onConflict: 'code', ignoreDuplicates: true })
  if (error) {
    log(`  ⚠️  Region upsert note: ${error.message} (migration 001 already seeds regions)`)
  } else {
    log(`  ✅ ${PERU_REGIONS.length} regions upserted`)
  }
}

async function seedCandidates(): Promise<void> {
  log(`\n👤 Seeding ${SEED_CANDIDATES.length} presidential candidates...`)

  // Map TypeScript role values to DB CHECK constraint values
  const roleMap: Record<string, string> = {
    president: 'president',
    vice_president: 'vice_president',
    senator: 'senator',
    representative: 'deputy',
  }

  const records = SEED_CANDIDATES.map(c => ({
    id: c.id,
    slug: c.slug,
    full_name: c.full_name,
    common_name: c.common_name ?? null,
    role: roleMap[c.role] ?? c.role,
    // Map seed party_id string → actual UUID from parties table
    party_id: PARTY_ID_MAP[c.party_id] ?? null,
    age: c.age ?? null,
    career_summary: c.career_summary ?? null,
    photo_url: c.photo_url ?? null,
    current_polling: c.current_polling ?? null,
    is_verified: c.is_verified ?? false,
    has_criminal_record: c.has_criminal_record ?? false,
    criminal_record_detail: c.criminal_record_detail ?? null,
  }))

  const BATCH_SIZE = 20
  let seeded = 0
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE)
    const { error } = await supabase
      .from('candidates')
      .upsert(batch, { onConflict: 'id' })
    if (error) throw new Error(`Upsert candidates batch failed: ${error.message}`)
    seeded += batch.length
    log(`  ✅ ${seeded}/${records.length} candidates seeded`)
  }
}

async function seedPositions(): Promise<void> {
  log(`\n📋 Seeding ${SEED_POSITIONS.length} candidate positions...`)

  // SEED_POSITIONS uses non-UUID ids ('pos-0001-sec') — cannot upsert by id.
  // Delete existing positions for all affected candidates, then re-insert.
  const candidateIds = [...new Set(SEED_POSITIONS.map(p => p.candidate_id))]
  const { error: delErr } = await supabase
    .from('positions')
    .delete()
    .in('candidate_id', candidateIds)
  if (delErr) throw new Error(`Delete positions failed: ${delErr.message}`)

  // Insert without id (DB generates UUID)
  const records = SEED_POSITIONS.map(p => ({
    candidate_id: p.candidate_id,
    issue_area: p.issue_area,
    stance: p.stance,
    quote: p.quote ?? null,
    source_url: p.source_url ?? null,
    verified: p.verified ?? false,
  }))

  const BATCH_SIZE = 50
  let seeded = 0
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE)
    const { error } = await supabase.from('positions').insert(batch)
    if (error) throw new Error(`Insert positions batch failed: ${error.message}`)
    seeded += batch.length
    log(`  ✅ ${seeded}/${records.length} positions seeded`)
  }
}

async function seedFactChecks(): Promise<void> {
  log(`\n✔️  Seeding ${SEED_FACT_CHECKS.length} fact-checks...`)

  // SEED_FACT_CHECKS uses non-UUID ids — cannot upsert by id.
  // Field mapping: source_url (singular) → source_urls (array), checked_at → published_at.
  const candidateIds = [...new Set(SEED_FACT_CHECKS.map(f => f.candidate_id))]
  const { error: delErr } = await supabase
    .from('fact_checks')
    .delete()
    .in('candidate_id', candidateIds)
  if (delErr) throw new Error(`Delete fact_checks failed: ${delErr.message}`)

  const records = SEED_FACT_CHECKS.map(f => ({
    candidate_id: f.candidate_id,
    claim: f.claim,
    verdict: f.verdict,
    explanation: f.explanation,
    source_urls: f.source_url ? [f.source_url] : [],
    published_at: f.checked_at,
  }))

  const { error } = await supabase.from('fact_checks').insert(records)
  if (error) throw new Error(`Insert fact_checks failed: ${error.message}`)
  log(`  ✅ ${SEED_FACT_CHECKS.length} fact-checks seeded`)
}

async function seedCongressCandidates(): Promise<void> {
  log(`\n🏛️  Seeding ${CONGRESS_CANDIDATES.length} congressional candidates...`)

  const records = CONGRESS_CANDIDATES.map(c => ({
    id: c.id,
    full_name: c.full_name,
    party: c.party,
    party_abbreviation: c.party_abbreviation,
    region: c.region,
    list_position: c.list_position,
    role: c.role,
    bio: c.bio ?? null,
    photo_url: c.photo_url ?? null,
    prior_roles: c.prior_roles,    // Supabase JSONB accepts arrays directly
    key_stances: c.key_stances,    // Supabase JSONB accepts arrays directly
    polling_percentage: c.polling_percentage ?? null,
  }))

  const BATCH_SIZE = 20
  let seeded = 0
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE)
    const { error } = await supabase
      .from('congress_candidates')
      .upsert(batch, { onConflict: 'id' })
    if (error) throw new Error(`Upsert congress_candidates batch failed: ${error.message}`)
    seeded += batch.length
    log(`  ✅ ${seeded}/${records.length} congress candidates seeded`)
  }
}

async function verifySeeding(): Promise<void> {
  log('\n🔍 Verifying seeded data...')

  const checks = [
    { table: 'candidates',          expected: SEED_CANDIDATES.length },
    { table: 'positions',           expected: SEED_POSITIONS.length },
    { table: 'fact_checks',         expected: SEED_FACT_CHECKS.length },
    { table: 'congress_candidates', expected: CONGRESS_CANDIDATES.length },
  ]

  for (const { table, expected } of checks) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })

    if (error) {
      log(`  ❌ ${table}: error counting rows — ${error.message}`)
    } else if (count === null) {
      log(`  ⚠️  ${table}: count returned null`)
    } else if (count < expected) {
      log(`  ⚠️  ${table}: ${count} rows (expected at least ${expected})`)
    } else {
      log(`  ✅ ${table}: ${count} rows`)
    }
  }
}

// ============================================================
// Main
// ============================================================
async function main(): Promise<void> {
  log('🇵🇪 VotoAbierto — Production Seeder')
  log('==================================')
  log(`📡 Supabase URL: ${supabaseUrl}`)
  log(`📊 Data to seed:`)
  log(`   Presidential candidates: ${SEED_CANDIDATES.length}`)
  log(`   Positions: ${SEED_POSITIONS.length}`)
  log(`   Fact-checks: ${SEED_FACT_CHECKS.length}`)
  log(`   Congressional candidates: ${CONGRESS_CANDIDATES.length}`)
  log(`   Regions: ${PERU_REGIONS.length}`)
  log('')
  log('⚠️  Positions and fact-checks are DELETE+INSERT per candidate set')
  log('⚠️  Candidates, parties, and congress candidates are UPSERT')
  log('')

  try {
    await seedExtraParties()
    await seedRegions()
    await seedCandidates()
    await seedPositions()
    await seedFactChecks()
    await seedCongressCandidates()
    await verifySeeding()

    log('\n🎉 Seeding complete! Database is ready for production.')
    log('')
    log('Next steps:')
    log('1. Verify data in Supabase dashboard → Table Editor')
    log('2. Set env vars in Vercel dashboard')
    log('3. Trigger a redeploy to use live data')
    process.exit(0)
  } catch (error) {
    logError('Seeding failed:', error)
    log('\n💡 Troubleshooting:')
    log('   1. Check that migrations 001 and 002 have been applied in Supabase SQL editor')
    log('   2. Verify SUPABASE_SERVICE_ROLE_KEY is the service role key (not anon key)')
    log('   3. Check Supabase dashboard for any schema issues')
    process.exit(1)
  }
}

main()
