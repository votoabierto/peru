// scripts/check-data-freshness.mjs
// Run: node scripts/check-data-freshness.mjs
// Exits 0 if all data is fresh, exits 1 if any file is stale (>7 days since last git commit touching it)

import { execSync } from 'child_process'
import { existsSync } from 'fs'

const DATA_FILES = [
  'data/candidates.json',
  'data/senate-candidates.json',
  'data/diputados-candidates.json',
  'data/andino-candidates.json',
  'data/parties.json',
]

const STALE_THRESHOLD_DAYS = 7

let anyStale = false

for (const file of DATA_FILES) {
  if (!existsSync(file)) {
    console.log(`MISSING: ${file}`)
    anyStale = true
    continue
  }

  try {
    const lastCommit = execSync(
      `git log -1 --format="%ci" -- ${file}`,
      { encoding: 'utf8' }
    ).trim()

    if (!lastCommit) {
      console.log(`UNTRACKED: ${file}`)
      continue
    }

    const lastCommitDate = new Date(lastCommit)
    const daysSince = (Date.now() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24)

    if (daysSince > STALE_THRESHOLD_DAYS) {
      console.log(`STALE (${Math.floor(daysSince)}d): ${file} — last updated ${lastCommit}`)
      anyStale = true
    } else {
      console.log(`FRESH (${Math.floor(daysSince)}d): ${file}`)
    }
  } catch (e) {
    console.log(`ERROR checking ${file}: ${e.message}`)
  }
}

process.exit(anyStale ? 1 : 0)
