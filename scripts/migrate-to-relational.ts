/**
 * Migrate existing candidate data from old tables into new relational tables.
 * - candidates → candidates_president (role='president')
 * - Plan de gobierno data → parties_v2 (if not already seeded)
 *
 * Run: npx tsx scripts/migrate-to-relational.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function main() {
  console.log('=== Migrating to relational schema ===\n')

  // 1. Read candidates from JSON (authoritative source)
  const candidatesPath = resolve(__dirname, '../data/candidates.json')
  const candidates = JSON.parse(readFileSync(candidatesPath, 'utf-8'))

  console.log(`Found ${candidates.length} presidential candidates in data/candidates.json`)

  // 2. Insert presidential candidates into candidates_president
  let inserted = 0
  let skipped = 0
  for (const c of candidates) {
    const row = {
      slug: c.slug || c.id,
      full_name: c.full_name,
      party_id: c.jne_party_id ?? null,
      image_url: c.photo_url ?? null,
      bio: c.bio ?? c.career_summary ?? null,
      bio_short: c.bio_short ?? null,
      social_media: null,
      data_quality: 'jne_api',
    }

    const { error } = await supabase
      .from('candidates_president')
      .upsert(row, { onConflict: 'slug' })

    if (error) {
      if (error.message.includes('duplicate') || error.message.includes('already exists')) {
        skipped++
      } else {
        console.error(`✗ ${c.full_name}: ${error.message}`)
      }
    } else {
      inserted++
    }
  }
  console.log(`✓ candidates_president: ${inserted} inserted, ${skipped} skipped\n`)

  // 3. Migrate candidate_positions from candidate_positions_db
  // (set candidate_type = 'presidente' for existing rows — already done by migration 010)

  // 4. Migrate senate candidates from data/senate-candidates.json
  const senatePath = resolve(__dirname, '../data/senate-candidates.json')
  try {
    const senateCandidates = JSON.parse(readFileSync(senatePath, 'utf-8'))
    console.log(`Found ${senateCandidates.length} senate candidates`)
    let senateInserted = 0
    for (const c of senateCandidates) {
      const slug = c.slug || c.id || `${(c.full_name || c.name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
      const row = {
        slug,
        full_name: c.full_name || c.name || c.nombre || '',
        party_id: c.jne_party_id ?? c.party_id ?? null,
        district_type: c.district_type || c.tipo_distrito || 'nacional',
        district: c.district || c.departamento || null,
        list_position: c.list_position || c.listPosition || c.numero_orden || null,
        image_url: c.photo_url || c.image_url || c.imageUrl || null,
        bio_short: c.bio_short || null,
      }
      const { error } = await supabase
        .from('candidates_senate')
        .upsert(row, { onConflict: 'slug' })
      if (!error) senateInserted++
      else if (!error.message.includes('duplicate')) {
        console.error(`  ✗ senate ${slug}: ${error.message}`)
      }
    }
    console.log(`✓ candidates_senate: ${senateInserted} inserted\n`)
  } catch {
    console.log('⏭ No senate-candidates.json found, skipping\n')
  }

  // 5. Migrate diputados from data/diputados-candidates.json
  const diputadosPath = resolve(__dirname, '../data/diputados-candidates.json')
  try {
    const diputados = JSON.parse(readFileSync(diputadosPath, 'utf-8'))
    console.log(`Found ${diputados.length} diputados candidates`)
    let dipInserted = 0
    for (const c of diputados) {
      const slug = c.slug || c.id || `${(c.full_name || c.name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
      const row = {
        slug,
        full_name: c.full_name || c.name || c.nombre || '',
        party_id: c.jne_party_id ?? c.party_id ?? null,
        district: c.district || c.departamento || c.region || '',
        list_position: c.list_position || c.listPosition || c.numero_orden || null,
        image_url: c.photo_url || c.image_url || c.imageUrl || null,
        bio_short: c.bio_short || null,
      }
      const { error } = await supabase
        .from('candidates_diputados')
        .upsert(row, { onConflict: 'slug' })
      if (!error) dipInserted++
      else if (!error.message.includes('duplicate')) {
        console.error(`  ✗ diputado ${slug}: ${error.message}`)
      }
    }
    console.log(`✓ candidates_diputados: ${dipInserted} inserted\n`)
  } catch {
    console.log('⏭ No diputados-candidates.json found, skipping\n')
  }

  // 6. Migrate andino from data/andino-candidates.json
  const andinoPath = resolve(__dirname, '../data/andino-candidates.json')
  try {
    const andinos = JSON.parse(readFileSync(andinoPath, 'utf-8'))
    console.log(`Found ${andinos.length} andino candidates`)
    let andInserted = 0
    for (const c of andinos) {
      const slug = c.slug || c.id || `${(c.full_name || c.name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
      const row = {
        slug,
        full_name: c.full_name || c.name || c.nombre || '',
        party_id: c.jne_party_id ?? c.party_id ?? null,
        list_position: c.list_position || c.listPosition || c.numero_orden || null,
        image_url: c.photo_url || c.image_url || c.imageUrl || null,
        bio_short: c.bio_short || null,
      }
      const { error } = await supabase
        .from('candidates_andino')
        .upsert(row, { onConflict: 'slug' })
      if (!error) andInserted++
      else if (!error.message.includes('duplicate')) {
        console.error(`  ✗ andino ${slug}: ${error.message}`)
      }
    }
    console.log(`✓ candidates_andino: ${andInserted} inserted\n`)
  } catch {
    console.log('⏭ No andino-candidates.json found, skipping\n')
  }

  // 7. Verify counts
  console.log('=== Verification ===')
  const tables = ['parties_v2', 'candidates_president', 'candidates_senate', 'candidates_diputados', 'candidates_andino']
  for (const table of tables) {
    const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
    console.log(`  ${table}: ${count} rows`)
  }
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
