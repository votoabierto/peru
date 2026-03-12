#!/usr/bin/env node
/**
 * Seed all Supabase tables from fetched data
 *
 * Sources:
 * - /tmp/hojas-de-vida-raw.json (from fetch-hojas-de-vida.js)
 * - /tmp/antecedentes-raw.json (from fetch-hojas-de-vida.js)
 * - data/candidates.json (existing enriched data)
 * - data/candidate-positions.json (structured positions)
 *
 * Usage: node scripts/seed-all-data.js
 */

const fs = require('fs');
const path = require('path');

// Load env
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) env[key.trim()] = rest.join('=').trim();
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const HEADERS = {
  'Content-Type': 'application/json',
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  Prefer: 'resolution=merge-duplicates',
};

async function supabasePost(table, rows) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...HEADERS, Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase ${table} insert failed (${res.status}): ${text}`);
  }
  return res;
}

async function supabaseUpsert(table, rows) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...HEADERS, Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const text = await res.text();
    console.warn(`  Warning: ${table} upsert issue (${res.status}): ${text.slice(0, 200)}`);
    return null;
  }
  return res;
}

function loadJSON(filepath) {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (e) {
    console.warn(`Could not load ${filepath}: ${e.message}`);
    return null;
  }
}

async function seedCandidateProfiles(candidates, hojasDeVida) {
  console.log('\n--- Seeding candidate_profiles ---');

  // Build a lookup from hojas de vida by slug
  const hdvMap = {};
  for (const h of (hojasDeVida || [])) {
    hdvMap[h.slug] = h;
  }

  const rows = candidates.map((c) => {
    const hdv = hdvMap[c.slug] || {};
    return {
      candidate_slug: c.slug,
      candidate_name: c.full_name,
      party_id: c.jne_party_id || hdv.party_id || null,
      party_name: c.party_name,
      election_type: 'presidente',
      image_url: hdv.photo_url || c.photo_url || null,
      image_source: 'jne',
      bio: c.bio || c.career_summary || null,
      bio_short: c.bio_short || (c.career_summary || '').slice(0, 280) || null,
      plan_gobierno_resumen: c.planGobiernoResumen || null,
      plan_gobierno_ejes: c.planGobiernoEjes || null,
      plan_gobierno_pdf_url: hdv.plan_gobierno_pdf_url || null,
      plan_gobierno_source_id: hdv.party_id || null,
      propuestas_clave: c.proposals ? c.proposals.map((p, i) => ({ tema: `propuesta_${i + 1}`, propuesta: p })) : null,
      jne_fetched_at: hdv._fetched_at || null,
      data_quality: hdv._source ? 'jne_api' : 'seed_data',
      search_text: [
        c.full_name, c.party_name, c.bio_short, c.planGobiernoResumen,
        ...(c.proposals || [])
      ].filter(Boolean).join(' '),
    };
  });

  await supabaseUpsert('candidate_profiles', rows);
  console.log(`  Inserted/updated ${rows.length} profiles`);
}

async function seedHojasDeVida(hojasDeVida) {
  console.log('\n--- Seeding candidate_hoja_de_vida ---');
  if (!hojasDeVida) { console.log('  Skipped (no data)'); return; }

  const rows = hojasDeVida.map((h) => ({
    candidate_slug: h.slug,
    education: h.education && h.education.length > 0 ? h.education : null,
    work_history: h.work_history && h.work_history.length > 0 ? h.work_history : null,
    birth_date: h.birth_date || null,
    birth_place: h.birth_place || null,
    age: h.age || null,
    profession: h.profession || null,
    source: h._source || 'jne_api',
    fetched_at: h._fetched_at || new Date().toISOString(),
  }));

  await supabaseUpsert('candidate_hoja_de_vida', rows);
  console.log(`  Inserted ${rows.length} hojas de vida`);
}

async function seedAntecedentes(hojasDeVida) {
  console.log('\n--- Seeding candidate_antecedentes ---');
  if (!hojasDeVida) { console.log('  Skipped (no data)'); return; }

  const rows = [];
  for (const h of hojasDeVida) {
    if (!h.antecedentes || h.antecedentes.length === 0) continue;
    for (const a of h.antecedentes) {
      rows.push({
        candidate_slug: h.slug,
        tipo: a.tipo || 'proceso_judicial',
        descripcion: a.descripcion || `${a.fallo || ''} - ${a.materia || ''}`.trim() || 'Sin detalle',
        fuente: a.fuente || 'JNE',
        fuente_url: null,
        fecha_inicio: a.fecha ? parseDateSafe(a.fecha) : null,
        estado: a.cumplimiento || a.modalidad || null,
        gravedad: a.materia && (a.materia.includes('PECULADO') || a.materia.includes('COLUSIÓN') || a.materia.includes('CORRUPCIÓN')) ? 'alto' : 'medio',
        verified: true,
      });
    }
  }

  if (rows.length > 0) {
    await supabaseUpsert('candidate_antecedentes', rows);
  }
  console.log(`  Inserted ${rows.length} antecedentes for ${new Set(rows.map(r => r.candidate_slug)).size} candidates`);
}

function parseDateSafe(dateStr) {
  if (!dateStr) return null;
  // Try dd/mm/yyyy format
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [d, m, y] = parts;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  // Try ISO
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

async function seedBienes(hojasDeVida) {
  console.log('\n--- Seeding candidate_bienes ---');
  if (!hojasDeVida) { console.log('  Skipped (no data)'); return; }

  const rows = [];
  for (const h of hojasDeVida) {
    if (!h.bienes || (!h.bienes.total_bienes_pen && !h.bienes.bienes_inmuebles)) continue;
    rows.push({
      candidate_slug: h.slug,
      total_bienes_pen: h.bienes.total_bienes_pen || null,
      total_ingresos_anuales_pen: h.bienes.total_ingresos_anuales_pen || null,
      bienes_inmuebles: h.bienes.bienes_inmuebles || null,
      bienes_muebles: h.bienes.bienes_muebles || null,
      declaration_year: 2025,
      source: 'JNE',
    });
  }

  if (rows.length > 0) {
    await supabaseUpsert('candidate_bienes', rows);
  }
  console.log(`  Inserted ${rows.length} bienes declarations`);
}

async function seedPositions(candidates) {
  console.log('\n--- Seeding candidate_positions_db ---');
  const positionsData = loadJSON(path.join(__dirname, '..', 'data', 'candidate-positions.json'));
  if (!positionsData) { console.log('  Skipped (no data)'); return; }

  const rows = [];
  for (const cp of positionsData) {
    // Match slug: candidate_id in positions json matches candidate slug
    const slug = cp.candidate_id;
    for (const [issueKey, pos] of Object.entries(cp.positions)) {
      rows.push({
        candidate_slug: slug,
        issue_key: issueKey,
        position_score: pos.score,
        position_label: pos.label,
        evidence: null,
        source: pos.verified ? 'plan_gobierno' : 'estimado',
      });
    }
  }

  if (rows.length > 0) {
    // Batch in chunks of 100
    for (let i = 0; i < rows.length; i += 100) {
      await supabaseUpsert('candidate_positions_db', rows.slice(i, i + 100));
    }
  }
  console.log(`  Inserted ${rows.length} positions for ${positionsData.length} candidates`);
}

async function main() {
  console.log('VotoClaro — Seed All Data');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Supabase URL: ${SUPABASE_URL}`);

  const candidates = loadJSON(path.join(__dirname, '..', 'data', 'candidates.json'));
  const hojasDeVida = loadJSON('/tmp/hojas-de-vida-raw.json');

  if (!candidates) {
    console.error('No candidates.json found');
    process.exit(1);
  }

  console.log(`\nLoaded: ${candidates.length} candidates, ${(hojasDeVida || []).length} hojas de vida`);

  // Apply migration first
  console.log('\n--- Applying migration 005 ---');
  const migrationSQL = fs.readFileSync(
    path.join(__dirname, '..', 'supabase', 'migrations', '005_full_data_architecture.sql'),
    'utf8'
  );
  const migRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ query: migrationSQL }),
  });
  // Migration may fail if already applied — that's OK
  if (migRes.ok) {
    console.log('  Migration applied successfully');
  } else {
    console.log('  Migration may already be applied (or needs manual application via Supabase dashboard)');
  }

  await seedCandidateProfiles(candidates, hojasDeVida);
  await seedHojasDeVida(hojasDeVida);
  await seedAntecedentes(hojasDeVida);
  await seedBienes(hojasDeVida);
  await seedPositions(candidates);

  console.log('\n✓ All data seeded successfully');
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
