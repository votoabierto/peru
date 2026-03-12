#!/usr/bin/env node
/**
 * JNE Scraper — Fetches real candidate data from the JNE Voto Informado API
 *
 * Usage: node scripts/jne-scraper.js
 *
 * Data sources:
 * - API: https://web.jne.gob.pe/serviciovotoinformado/api/votoinf/listarCanditatos
 * - Photos: https://mpesije.jne.gob.pe/apidocs/{guid}.jpg
 * - Logos: https://sroppublico.jne.gob.pe/Consulta/Simbolo/GetSimbolo/{id}
 *
 * Election IDs (Elecciones Generales 2026 = 124):
 * - Presidencial: tipo 1
 * - Parlamento Andino: tipo 3
 * - Senadores Distrito Único: tipo 20
 * - Diputados: tipo 15
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_URL = 'https://web.jne.gob.pe/serviciovotoinformado/api/votoinf/listarCanditatos';
const IMAGE_BASE = 'https://mpesije.jne.gob.pe/apidocs/';
const PROCESO_ELECTORAL = 124; // Elecciones Generales 2026

const ELECTION_TYPES = {
  presidente: { id: 1, label: 'Presidente' },
  senado: { id: 20, label: 'Senadores Distrito Único' },
  'parlamento-andino': { id: 3, label: 'Parlamento Andino' },
  diputados: { id: 15, label: 'Diputados' },
};

// Ubigeo prefix → department name (fallback when strDepartamento is empty)
const UBIGEO_TO_DEPT = {
  '01': 'AMAZONAS', '02': 'ANCASH', '03': 'APURIMAC', '04': 'AREQUIPA',
  '05': 'AYACUCHO', '06': 'CAJAMARCA', '07': 'CALLAO', '08': 'CUSCO',
  '09': 'HUANCAVELICA', '10': 'HUANUCO', '11': 'ICA', '12': 'JUNIN',
  '13': 'LA LIBERTAD', '14': 'LAMBAYEQUE', '15': 'LIMA', '16': 'LORETO',
  '17': 'MADRE DE DIOS', '18': 'MOQUEGUA', '19': 'PASCO', '20': 'PIURA',
  '21': 'PUNO', '22': 'SAN MARTIN', '23': 'TACNA', '24': 'TUMBES', '25': 'UCAYALI',
};

function fetchAPI(body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const url = new URL(API_URL);
    const req = https.request(
      {
        hostname: url.hostname,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(new Error(`Failed to parse response: ${e.message}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function toTitleCase(s) {
  return s
    .toLowerCase()
    .replace(/(?:^|\s|['\-\(])\S/g, (c) => c.toUpperCase());
}

function toSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildCandidateRecord(raw, electionType, district) {
  const fullName = [raw.strNombres, raw.strApellidoPaterno, raw.strApellidoMaterno]
    .filter(Boolean)
    .join(' ');

  const record = {
    id: toSlug(fullName),
    name: toTitleCase(fullName),
    party: toTitleCase(raw.strOrganizacionPolitica),
    partyId: toSlug(raw.strOrganizacionPolitica),
    electionType,
    listPosition: raw.intPosicion,
    imageUrl: raw.strGuidFoto ? `${IMAGE_BASE}${raw.strGuidFoto}.jpg` : null,
    sourceUrl: `https://votoinformado.jne.gob.pe/${electionType === 'parlamento-andino' ? 'parlamento-andino' : electionType === 'senado' ? 'senadores' : electionType}`,
  };

  if (district) {
    record.district = toTitleCase(district);
  }

  return record;
}

async function scrapePresidential() {
  console.log('\n--- Scraping Presidential Candidates ---');
  const res = await fetchAPI({
    idProcesoElectoral: PROCESO_ELECTORAL,
    idTipoEleccion: ELECTION_TYPES.presidente.id,
    strDepartamento: '',
  });

  const dataPath = path.join(__dirname, '..', 'data', 'candidates.json');
  const existing = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  let updated = 0;
  let unchanged = 0;

  for (const raw of res.data) {
    const fullName = [raw.strNombres, raw.strApellidoPaterno, raw.strApellidoMaterno]
      .filter(Boolean)
      .join(' ');
    const photoUrl = raw.strGuidFoto ? `${IMAGE_BASE}${raw.strGuidFoto}.jpg` : null;

    // Match by last name similarity
    const match = existing.find((c) => {
      const existingNorm = c.full_name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const jneNorm = fullName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      // Match if last name appears in both
      const existingParts = existingNorm.split(' ');
      const jneParts = jneNorm.split(' ');
      return existingParts.some((p) => p.length > 3 && jneParts.includes(p));
    });

    if (match) {
      if (photoUrl && match.photo_url !== photoUrl) {
        match.photo_url = photoUrl;
        match.jne_profile_url = 'https://votoinformado.jne.gob.pe/presidente-vicepresidentes';
        updated++;
      } else {
        unchanged++;
      }
    }
  }

  fs.writeFileSync(dataPath, JSON.stringify(existing, null, 2) + '\n');
  console.log(`  Presidential: ${updated} updated, ${unchanged} unchanged, ${res.data.length} total from JNE`);
}

async function scrapeSenate() {
  console.log('\n--- Scraping Senate Candidates ---');
  const res = await fetchAPI({
    idProcesoElectoral: PROCESO_ELECTORAL,
    idTipoEleccion: ELECTION_TYPES.senado.id,
    strDepartamento: '',
  });

  const candidates = res.data.map((raw) => buildCandidateRecord(raw, 'senado'));
  const dataPath = path.join(__dirname, '..', 'data', 'senate-candidates.json');
  fs.writeFileSync(dataPath, JSON.stringify(candidates, null, 2) + '\n');
  console.log(`  Senate: ${candidates.length} candidates from ${new Set(candidates.map((c) => c.party)).size} parties`);
}

async function scrapeAndino() {
  console.log('\n--- Scraping Parlamento Andino Candidates ---');
  const res = await fetchAPI({
    idProcesoElectoral: PROCESO_ELECTORAL,
    idTipoEleccion: ELECTION_TYPES['parlamento-andino'].id,
    strDepartamento: '',
  });

  const candidates = res.data.map((raw) => buildCandidateRecord(raw, 'parlamento-andino'));
  const dataPath = path.join(__dirname, '..', 'data', 'andino-candidates.json');
  fs.writeFileSync(dataPath, JSON.stringify(candidates, null, 2) + '\n');
  console.log(`  Andino: ${candidates.length} candidates from ${new Set(candidates.map((c) => c.party)).size} parties`);
}

async function scrapeDiputados() {
  console.log('\n--- Scraping Diputados Candidates ---');
  const res = await fetchAPI({
    idProcesoElectoral: PROCESO_ELECTORAL,
    idTipoEleccion: ELECTION_TYPES.diputados.id,
    strDepartamento: '',
  });

  // Only include candidates with a known department (skip records with empty strDepartamento)
  const withDept = res.data.filter((raw) => raw.strDepartamento);
  const candidates = withDept.map((raw) => buildCandidateRecord(raw, 'diputados', raw.strDepartamento));

  const dataPath = path.join(__dirname, '..', 'data', 'diputados-candidates.json');
  fs.writeFileSync(dataPath, JSON.stringify(candidates, null, 2) + '\n');

  const byDistrict = {};
  for (const c of candidates) {
    byDistrict[c.district] = (byDistrict[c.district] || 0) + 1;
  }
  console.log(`  Diputados: ${candidates.length} total from ${Object.keys(byDistrict).length} districts`);
  for (const [d, count] of Object.entries(byDistrict)) {
    console.log(`    ${d}: ${count}`);
  }
  console.log(`  (${res.data.length} total from API, ${withDept.length} with known department, ${res.data.length - withDept.length} skipped)`);
}

async function main() {
  console.log('JNE Scraper — Fetching candidate data from Voto Informado API');
  console.log(`Proceso Electoral: ${PROCESO_ELECTORAL} (Elecciones Generales 2026)`);
  console.log(`Timestamp: ${new Date().toISOString()}`);

  await scrapePresidential();
  await scrapeSenate();
  await scrapeAndino();
  await scrapeDiputados();

  console.log('\nDone! All data files updated.');
}

main().catch((e) => {
  console.error('Scraper failed:', e);
  process.exit(1);
});
