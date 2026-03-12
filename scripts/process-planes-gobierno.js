#!/usr/bin/env node
/**
 * Process raw JNE plan de gobierno responses and enrich candidates.json
 *
 * Maps JNE party IDs → candidate slugs using party name matching.
 * Extracts: resumen, ejes estratégicos, top proposals, bio snippet.
 */

const fs = require('fs');
const path = require('path');

// Map JNE party ID → candidate slug (matched via party_name in candidates.json)
const PARTY_ID_TO_SLUG = {
  1366: 'keiko-fujimori',
  1257: 'cesar-acuna',
  2173: 'jose-williams-zapata',
  22: 'rafael-lopez-aliaga',
  2218: 'vladimir-cerron',
  14: 'george-forsyth',
  2840: 'mesias-guevara',
  2731: 'jose-luna-galvez',
  1264: 'roberto-sanchez',
  2930: 'enrique-valderrama',
  2995: 'yonhy-lescano',
  3023: 'roberto-chiabra',
  2857: 'fernando-olivera',
  2931: 'marisol-perez-tello',
  2961: 'jorge-nieto-montesinos',
  2898: 'alvaro-paz-de-la-barra',
  2924: 'carlos-jaico',
  3024: 'fiorella-molinelli',
  2921: 'walter-chirinos',
  2932: 'francisco-diez-canseco',
  2967: 'paul-jaimes',
  2933: 'rafael-belaunde',
  2935: 'carlos-espa',
  2998: 'rosario-del-pilar-fernandez',
  2956: 'carlos-alvarez',
  2927: 'antonio-ortiz-villano',
  2980: 'alfonso-lopez-chau',
  2869: 'herbert-caller',
  2895: 'alex-gonzales-castillo',
  2941: 'ricardo-belmont',
  2986: 'joaquin-masse-fernandez',
  2867: 'charlie-carrasco',
  2925: 'mario-vizcarra',
  2939: 'napoleon-becerra',
  3025: 'ronald-atencio',
  2985: 'wolfgang-grozo',
};

/**
 * Extract structured ejes (pillars) from a plan de gobierno summary text.
 * JNE summaries typically mention key areas separated by periods or semicolons.
 */
function extractEjes(resumen) {
  if (!resumen) return [];

  const ejes = [];
  const text = resumen;

  // Common thematic patterns in Peruvian government plans
  const themePatterns = [
    { eje: 'Seguridad', patterns: /seguridad\s+ciudadana|lucha\s+contra\s+(la\s+)?delincuencia|orden\s+interno|polic[ií]a|crimen/i },
    { eje: 'Economía', patterns: /econom[ií]a|empleo|MYPE|pyme|inversi[oó]n|competitividad|productiv|tributari|fiscal|crecimiento\s+econ/i },
    { eje: 'Educación', patterns: /educaci[oó]n|escuela|universidad|docente|aprendizaje|formaci[oó]n/i },
    { eje: 'Salud', patterns: /salud|hospital|atenci[oó]n\s+(m[eé]dica|primaria)|vacuna|sistema\s+sanitario/i },
    { eje: 'Corrupción', patterns: /corrupci[oó]n|transparencia|integridad|rendici[oó]n\s+de\s+cuentas|anticorrupci/i },
    { eje: 'Infraestructura', patterns: /infraestructura|conectividad|carretera|transporte|vial|agua\s+potable|saneamiento/i },
    { eje: 'Medio Ambiente', patterns: /medio\s+ambiente|ambiental|cambio\s+clim[aá]tico|recursos\s+naturales|biodiversidad|sostenib/i },
    { eje: 'Reforma del Estado', patterns: /reforma\s+(del\s+)?estado|descentralizaci[oó]n|modernizaci[oó]n|gesti[oó]n\s+p[uú]blica|institucional/i },
    { eje: 'Justicia', patterns: /justicia|judicial|poder\s+judicial|fiscal[ií]a|derecho|constituc/i },
    { eje: 'Agricultura', patterns: /agricultur|agropecuari|campo|rural|campesino|riego/i },
    { eje: 'Tecnología', patterns: /tecnolog[ií]a|digital|innovaci[oó]n|ciencia|investigaci[oó]n/i },
    { eje: 'Política Social', patterns: /social|pobreza|inclusi[oó]n|igualdad|g[eé]nero|protecci[oó]n\s+social|programa/i },
  ];

  // Split text into sentences for context extraction
  const sentences = text.split(/[.;]/).map(s => s.trim()).filter(s => s.length > 20);

  for (const theme of themePatterns) {
    const matchingSentences = sentences.filter(s => theme.patterns.test(s));
    if (matchingSentences.length > 0) {
      // Take the best (longest) matching sentence as description
      const desc = matchingSentences.sort((a, b) => b.length - a.length)[0];
      ejes.push({
        eje: theme.eje,
        descripcion: desc.slice(0, 300),
      });
    }
  }

  return ejes.slice(0, 6); // Top 6 ejes
}

/**
 * Extract top 5 concrete proposals from the plan text.
 */
function extractProposals(resumen) {
  if (!resumen) return [];

  // Split into sentences, pick the most concrete ones (those with verbs of action)
  const sentences = resumen
    .split(/[.;]/)
    .map(s => s.trim())
    .filter(s => s.length > 30 && s.length < 200);

  // Score sentences by "proposal-ness"
  const actionWords = /promover|implementar|fortalecer|crear|establecer|garantizar|mejorar|reformar|impulsar|desarrollar|reducir|eliminar|ampliar|fomentar|construir|modernizar|asegurar|incrementar|priorizar|invertir/i;

  const scored = sentences.map(s => ({
    text: s,
    score: (actionWords.test(s) ? 2 : 0) + (s.length > 60 ? 1 : 0),
  }));

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(s => s.text);
}

function main() {
  // Load raw JNE data
  const rawPath = '/tmp/planes-gobierno-raw.json';
  if (!fs.existsSync(rawPath)) {
    console.error('ERROR: /tmp/planes-gobierno-raw.json not found. Run fetch-planes-gobierno.js first.');
    process.exit(1);
  }
  const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf-8'));

  // Load candidates.json
  const candidatesPath = path.join(__dirname, '..', 'data', 'candidates.json');
  const candidates = JSON.parse(fs.readFileSync(candidatesPath, 'utf-8'));

  // Build resumen map: partyId → resumen
  const resumenMap = {};
  for (const entry of rawData) {
    const resumen = entry.response?.data?.resumen;
    if (resumen) {
      resumenMap[entry.partyId] = resumen;
    }
  }

  console.log(`Loaded ${Object.keys(resumenMap).length} plan summaries from JNE.`);
  console.log(`Processing ${candidates.length} candidates...\n`);

  let enriched = 0;
  let skipped = 0;

  for (const candidate of candidates) {
    // Find the JNE party ID for this candidate
    const partyId = Object.keys(PARTY_ID_TO_SLUG).find(
      id => PARTY_ID_TO_SLUG[id] === candidate.id
    );

    if (!partyId) {
      console.log(`  SKIP: ${candidate.id} — no party ID mapping`);
      skipped++;
      continue;
    }

    const resumen = resumenMap[partyId];
    if (!resumen) {
      console.log(`  NO DATA: ${candidate.id} (party ${partyId}) — JNE has no summary`);
      skipped++;
      continue;
    }

    // Extract structured data
    const ejes = extractEjes(resumen);
    const proposals = extractProposals(resumen);

    // Enrich candidate
    candidate.planGobiernoResumen = resumen;
    candidate.planGobiernoEjes = ejes;
    candidate.proposals = proposals;
    candidate.jne_party_id = Number(partyId);

    // Update bio if it's still the generic placeholder
    if (candidate.bio_short?.includes('Candidato presidencial por') && proposals.length > 0) {
      candidate.bio_short = `Candidato/a presidencial por ${candidate.party_name}. ${proposals[0]}.`;
    }

    console.log(`  OK: ${candidate.full_name} — ${ejes.length} ejes, ${proposals.length} propuestas`);
    enriched++;
  }

  // Write updated candidates.json
  fs.writeFileSync(candidatesPath, JSON.stringify(candidates, null, 2) + '\n');
  console.log(`\nDone. Enriched ${enriched}/${candidates.length} candidates (${skipped} skipped).`);
  console.log(`Updated: ${candidatesPath}`);
}

main();
