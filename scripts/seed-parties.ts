/**
 * Seed parties_v2 table from data/parties.json + data/candidates.json
 * Run: npx tsx scripts/seed-parties.ts
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

interface PartyJson {
  id: string
  name: string
  abbr: string
  color: string
  presidentCandidate: string
  ideological_family?: string
  spectrum?: string
}

interface CandidateJson {
  id: string
  slug: string
  full_name: string
  party_abbreviation: string
  party_name: string
  jne_party_id?: number
  photo_url?: string
  planGobiernoResumen?: string
  planGobiernoEjes?: Array<{ eje: string; descripcion: string }>
}

async function main() {
  const partiesPath = resolve(__dirname, '../data/parties.json')
  const candidatesPath = resolve(__dirname, '../data/candidates.json')

  const parties: PartyJson[] = JSON.parse(readFileSync(partiesPath, 'utf-8'))
  const candidates: CandidateJson[] = JSON.parse(readFileSync(candidatesPath, 'utf-8'))

  // Build a map: party name → candidate data (for plan_gobierno + jne_party_id)
  const candidateByPartyName = new Map<string, CandidateJson>()
  for (const c of candidates) {
    candidateByPartyName.set(c.party_name, c)
  }

  // Also map by abbreviation for fallback
  const candidateByAbbr = new Map<string, CandidateJson>()
  for (const c of candidates) {
    candidateByAbbr.set(c.party_abbreviation, c)
  }

  const rows = []
  for (const party of parties) {
    // Try to find the candidate for this party by name first, then abbr
    const candidate = candidateByPartyName.get(party.name) || candidateByAbbr.get(party.abbr)

    const sropId = candidate?.jne_party_id
    if (!sropId) {
      console.warn(`⚠ No srop_id for party "${party.name}" (${party.abbr}) — skipping FK`)
    }

    rows.push({
      srop_id: sropId ?? null,
      name: party.name,
      abbreviation: party.abbr,
      color: party.color,
      spectrum: party.spectrum ?? null,
      ideology_family: party.ideological_family ?? null,
      plan_gobierno_resumen: candidate?.planGobiernoResumen ?? null,
      plan_gobierno_ejes: candidate?.planGobiernoEjes ?? null,
      active: true,
    })
  }

  console.log(`Upserting ${rows.length} parties into parties_v2...`)

  // Upsert by srop_id where available, otherwise insert
  for (const row of rows) {
    if (row.srop_id) {
      const { error } = await supabase
        .from('parties_v2')
        .upsert(row, { onConflict: 'srop_id' })
      if (error) {
        console.error(`✗ Failed to upsert party "${row.name}":`, error.message)
      } else {
        console.log(`✓ ${row.name} (srop_id=${row.srop_id})`)
      }
    } else {
      // No srop_id — insert with generated id, skip if name already exists
      const { error } = await supabase
        .from('parties_v2')
        .insert(row)
      if (error) {
        if (error.message.includes('duplicate')) {
          console.log(`⏭ ${row.name} already exists`)
        } else {
          console.error(`✗ Failed to insert party "${row.name}":`, error.message)
        }
      } else {
        console.log(`✓ ${row.name} (no srop_id)`)
      }
    }
  }

  // Verify
  const { count } = await supabase
    .from('parties_v2')
    .select('*', { count: 'exact', head: true })
  console.log(`\n✓ Total parties in parties_v2: ${count}`)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
