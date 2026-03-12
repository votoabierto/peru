#!/usr/bin/env node
/**
 * Seeds candidate_profiles table in Supabase from enriched candidates.json
 * Also creates the table if it doesn't exist (via raw SQL through the API).
 *
 * Uses service_role key for full write access.
 */

const fs = require('fs');
const path = require('path');

// Load .env.local manually (no dotenv dependency)
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const candidatePositions = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'candidate-positions.json'), 'utf-8')
);

async function supabaseRequest(endpoint, method = 'GET', body = null, extraHeaders = {}) {
  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=minimal',
    ...extraHeaders,
  };

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${endpoint}: ${res.status} ${text}`);
  }
  if (res.status === 204 || res.headers.get('content-length') === '0') return null;
  return res.json();
}

async function createTableIfNeeded() {
  // Check if the table exists by trying to select from it
  try {
    await supabaseRequest('candidate_profiles?select=id&limit=1');
    console.log('Table candidate_profiles already exists.');
    return;
  } catch (err) {
    if (err.message.includes('404') || err.message.includes('does not exist') || err.message.includes('42P01')) {
      console.log('Table does not exist. Will create via migration SQL...');
      // We'll use Supabase SQL editor API
      const migrationSQL = fs.readFileSync(
        path.join(__dirname, '..', 'supabase', 'migrations', '004_candidate_profiles.sql'),
        'utf-8'
      );
      // Try running via rpc
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/rpc`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: migrationSQL }),
        });
      } catch (e) {
        console.log('Could not auto-create table. Please run the migration manually:');
        console.log('  supabase db push OR paste supabase/migrations/004_candidate_profiles.sql in the SQL editor');
        console.log('Continuing with seed (will fail if table missing)...');
      }
    } else {
      // Table exists but other error — continue anyway
      console.log('Warning:', err.message);
    }
  }
}

async function main() {
  const candidatesPath = path.join(__dirname, '..', 'data', 'candidates.json');
  const candidates = JSON.parse(fs.readFileSync(candidatesPath, 'utf-8'));

  // Try to create table
  await createTableIfNeeded();

  console.log(`\nSeeding ${candidates.length} candidate profiles...\n`);

  let seeded = 0;
  let errors = 0;

  for (const c of candidates) {
    const cpEntry = candidatePositions.find(cp => cp.candidate_id === c.id);
    const hasPositions = !!cpEntry;

    const row = {
      candidate_slug: c.id,
      candidate_name: c.full_name,
      party_id: c.jne_party_id || null,
      party_name: c.party_name,
      bio: c.bio_short || c.career_summary || null,
      bio_source: 'JNE',
      plan_gobierno_resumen: c.planGobiernoResumen || null,
      plan_gobierno_ejes: c.planGobiernoEjes || null,
      propuestas_clave: c.proposals
        ? c.proposals.map((p, i) => ({ tema: `Propuesta ${i + 1}`, propuesta: p, prioridad: i + 1 }))
        : null,
      has_positions: hasPositions,
      jne_api_fetched_at: new Date().toISOString(),
      data_quality: 'jne_api',
      updated_at: new Date().toISOString(),
    };

    try {
      // Upsert by candidate_slug using the Prefer header
      await supabaseRequest(
        'candidate_profiles',
        'POST',
        row,
        {
          Prefer: 'resolution=merge-duplicates,return=minimal',
        }
      );
      console.log(`  Seeded: ${c.full_name}`);
      seeded++;
    } catch (err) {
      console.error(`  ERROR seeding ${c.full_name}: ${err.message}`);
      errors++;
    }
  }

  console.log(`\nDone. Seeded: ${seeded}, Errors: ${errors}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
