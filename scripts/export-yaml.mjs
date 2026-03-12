// scripts/export-yaml.mjs
// Run: node scripts/export-yaml.mjs
// Exports data/candidates.json → data/candidates.yaml (key fields only)
//         data/parties.json   → data/parties.yaml

import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import yaml from 'js-yaml'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '..', 'data')

// Export candidates (key fields only for easier community review)
const candidates = JSON.parse(readFileSync(join(dataDir, 'candidates.json'), 'utf-8'))
const candidatesSlim = candidates.map(c => ({
  id: c.id,
  full_name: c.full_name,
  party_name: c.party_name,
  party_abbreviation: c.party_abbreviation,
  data_confidence: c.data_confidence ?? null,
  photo_url: c.photo_url ?? null,
  jne_url_plan: c.jne_url_plan ?? null,
}))
writeFileSync(join(dataDir, 'candidates.yaml'), yaml.dump(candidatesSlim, { lineWidth: 120, noRefs: true }), 'utf-8')
console.log(`Exported ${candidatesSlim.length} candidates → data/candidates.yaml`)

// Export parties
const parties = JSON.parse(readFileSync(join(dataDir, 'parties.json'), 'utf-8'))
writeFileSync(join(dataDir, 'parties.yaml'), yaml.dump(parties, { lineWidth: 120, noRefs: true }), 'utf-8')
console.log(`Exported ${parties.length} parties → data/parties.yaml`)
