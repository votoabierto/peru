#!/usr/bin/env node
/**
 * Fetch plan de gobierno summaries from JNE API for all parties.
 * Saves raw responses to /tmp/planes-gobierno-raw.json
 */

const PARTIES = {
  1366: 'FUERZA POPULAR',
  1257: 'ALIANZA PARA EL PROGRESO',
  2173: 'AVANZA PAIS',
  22: 'RENOVACION POPULAR',
  2218: 'PARTIDO POLITICO NACIONAL PERU LIBRE',
  14: 'PARTIDO DEMOCRATICO SOMOS PERU',
  2840: 'PARTIDO MORADO',
  2731: 'PODEMOS PERU',
  1264: 'JUNTOS POR EL PERU',
  2930: 'PARTIDO APRISTA PERUANO',
  2995: 'PARTIDO POLITICO COOPERACION POPULAR',
  3023: 'UNIDAD NACIONAL',
  2857: 'PARTIDO FRENTE DE LA ESPERANZA 2021',
  2931: 'PRIMERO LA GENTE',
  2961: 'PARTIDO DEL BUEN GOBIERNO',
  2898: 'FE EN EL PERU',
  2924: 'PERU MODERNO',
  3024: 'FUERZA Y LIBERTAD',
  2921: 'PARTIDO POLITICO PRIN',
  2932: 'PARTIDO POLITICO PERU ACCION',
  2967: 'PROGRESEMOS',
  2933: 'LIBERTAD POPULAR',
  2935: 'PARTIDO SICREO',
  2998: 'UN CAMINO DIFERENTE',
  2956: 'PARTIDO PAIS PARA TODOS',
  2927: 'SALVEMOS AL PERU',
  2980: 'AHORA NACION',
  2869: 'PARTIDO PATRIOTICO DEL PERU',
  2895: 'PARTIDO DEMOCRATA VERDE',
  2941: 'PARTIDO CIVICO OBRAS',
  2986: 'PARTIDO DEMOCRATICO FEDERAL',
  2867: 'PARTIDO DEMOCRATA UNIDO PERU',
  2925: 'PARTIDO POLITICO PERU PRIMERO',
  2939: 'PARTIDO DE LOS TRABAJADORES Y EMPRENDEDORES PTE-PERU',
  3025: 'ALIANZA ELECTORAL VENCEREMOS',
  2985: 'PARTIDO POLITICO INTEGRIDAD DEMOCRATICA',
};

const BASE_URL = 'https://votoinformadoia.jne.gob.pe/ServiciosWeb';

async function fetchPlanGobierno(partyId) {
  const url = `${BASE_URL}/api/v1/plan-gobierno/resumen-por-organizacion`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idOrganizacionPolitica: Number(partyId) }),
  });
  if (!res.ok) {
    return { partyId, partyName: PARTIES[partyId], error: `HTTP ${res.status}`, data: null };
  }
  const json = await res.json();
  return { partyId: Number(partyId), partyName: PARTIES[partyId], response: json };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const results = [];
  const partyIds = Object.keys(PARTIES);

  console.log(`Fetching plan de gobierno for ${partyIds.length} parties...`);

  for (let i = 0; i < partyIds.length; i++) {
    const partyId = partyIds[i];
    const partyName = PARTIES[partyId];
    process.stdout.write(`[${i + 1}/${partyIds.length}] ${partyName}... `);

    try {
      const result = await fetchPlanGobierno(partyId);
      const hasData = result.response?.data?.resumen ? 'OK' : 'NO DATA';
      console.log(hasData);
      results.push(result);
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      results.push({ partyId: Number(partyId), partyName, error: err.message, data: null });
    }

    if (i < partyIds.length - 1) {
      await sleep(500);
    }
  }

  const fs = require('fs');
  fs.writeFileSync('/tmp/planes-gobierno-raw.json', JSON.stringify(results, null, 2));

  const withData = results.filter(r => r.response?.data?.resumen);
  console.log(`\nDone. ${withData.length}/${results.length} parties have plan summaries.`);
  console.log('Saved to /tmp/planes-gobierno-raw.json');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
