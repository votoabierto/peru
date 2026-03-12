/**
 * Apply SQL migration to Supabase using the service role key.
 * Uses the Supabase Management API or direct pg connection.
 * Usage: npx tsx scripts/apply-migration.ts <path-to-sql>
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load env
const envPath = resolve(__dirname, '../.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const env: Record<string, string> = {}
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) env[match[1].trim()] = match[2].trim()
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const sqlFile = process.argv[2]
if (!sqlFile) {
  console.error('Usage: npx tsx scripts/apply-migration.ts <path-to-sql>')
  process.exit(1)
}

async function executeSql(sql: string): Promise<{ success: boolean; error?: string }> {
  // Try Supabase's SQL API endpoint (available with service role)
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({})
  })

  // The RPC endpoint won't work for raw SQL. Use the query endpoint instead.
  // Supabase exposes a /pg endpoint for direct SQL with service role
  return { success: true }
}

async function main() {
  const sql = readFileSync(resolve(process.cwd(), sqlFile), 'utf-8')
  console.log(`Applying migration: ${sqlFile} (${sql.length} bytes)\n`)

  // Split into executable blocks (handle DO $$ blocks properly)
  const blocks: string[] = []
  let current = ''
  let inDoBlock = false

  for (const line of sql.split('\n')) {
    const trimmed = line.trim()

    // Skip pure comment lines
    if (trimmed.startsWith('--') && !inDoBlock) {
      if (current.trim()) {
        // Flush current before comment block
      }
      continue
    }

    current += line + '\n'

    if (trimmed.startsWith('do $$') || trimmed.startsWith('do $')) {
      inDoBlock = true
    }
    if (inDoBlock && (trimmed === 'end $$;' || trimmed === 'end$;')) {
      inDoBlock = false
      blocks.push(current.trim())
      current = ''
    }

    if (!inDoBlock && trimmed.endsWith(';') && !trimmed.startsWith('--')) {
      blocks.push(current.trim())
      current = ''
    }
  }
  if (current.trim()) blocks.push(current.trim())

  // Filter out empty/comment-only blocks
  const stmts = blocks.filter(b => {
    const cleaned = b.replace(/--[^\n]*/g, '').trim()
    return cleaned.length > 0
  })

  console.log(`Found ${stmts.length} SQL statements to execute\n`)

  // Create a supabase client with service role to test basic connectivity
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

  // Test connectivity
  const { error: testError } = await supabase.from('candidates').select('id', { count: 'exact', head: true })
  if (testError) {
    console.error('Cannot connect to Supabase:', testError.message)
    process.exit(1)
  }
  console.log('✓ Supabase connection verified\n')

  // For each statement, try to execute via the Supabase SQL endpoint
  // Supabase provides a /pg endpoint at the project URL
  let success = 0
  let failed = 0

  for (let i = 0; i < stmts.length; i++) {
    const stmt = stmts[i]
    const preview = stmt.substring(0, 100).replace(/\n/g, ' ').trim()

    // Use the Supabase query API
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({ sql: stmt })
    })

    if (res.ok) {
      console.log(`  [${i + 1}/${stmts.length}] ✓ ${preview}...`)
      success++
    } else {
      const errBody = await res.text()
      // 404 means the rpc function doesn't exist — expected
      if (res.status === 404) {
        console.log(`  [${i + 1}/${stmts.length}] ⚠ exec_sql function not available`)
        console.log('\nThe exec_sql function is not installed on this Supabase project.')
        console.log('Please apply the migration manually:')
        console.log(`  1. Go to ${SUPABASE_URL.replace('.supabase.co', '.supabase.co')}/project/default/sql`)
        console.log(`  2. Paste the contents of ${sqlFile}`)
        console.log(`  3. Click "Run"`)
        console.log(`\nAlternatively, use supabase CLI:`)
        console.log(`  supabase db push --linked`)
        process.exit(0)
      }
      console.error(`  [${i + 1}/${stmts.length}] ✗ ${preview}...`)
      console.error(`    ${errBody.substring(0, 200)}`)
      failed++
    }
  }

  console.log(`\nDone: ${success} succeeded, ${failed} failed`)
}

main().catch(err => {
  console.error('Failed:', err)
  process.exit(1)
})
