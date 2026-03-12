#!/usr/bin/env node
/**
 * Fetch bienes declarados (assets) from JNE hoja-de-vida API for all candidates.
 * Updates data/candidates.json with bienes data.
 */
const fs = require('fs')
const path = require('path')

const CANDIDATES_PATH = path.join(__dirname, '..', 'data', 'candidates.json')
const API_URL = 'https://votoinformadoia.jne.gob.pe/ServiciosWeb/api/v1/candidato/hoja-de-vida-integrado'
const DELAY_MS = 500

async function fetchBienes(dni, partyId) {
  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idProcesoElectoral: 124,
      idOrganizacionPolitica: partyId,
      dni: dni,
    }),
    signal: AbortSignal.timeout(10000),
  })
  if (!resp.ok) return null
  const json = await resp.json()
  if (!json.success) return null
  return json.data?.declaracionJurada ?? null
}

function parseBienes(dj) {
  if (!dj) return null

  const ingresos = dj.ingreso ?? []
  const inmuebles = dj.bienInmueble ?? []
  const muebles = dj.bienMueble ?? []
  const otroMueble = dj.otroMueble ?? []

  const totalIngresos = ingresos.reduce((sum, i) => sum + parseFloat(i.totalIngresos || '0'), 0)
  const totalInmuebles = inmuebles.reduce((sum, i) => sum + parseFloat(i.autoavaluo || '0'), 0)
  const totalMuebles = muebles.reduce((sum, i) => sum + parseFloat(i.valor || '0'), 0)
  const totalOtros = otroMueble.reduce((sum, i) => sum + parseFloat(i.valor || '0'), 0)
  const totalBienes = totalInmuebles + totalMuebles + totalOtros

  const bienesInmuebles = inmuebles.map(b => ({
    descripcion: [b.tipoPredioPropiedadInmueble, b.direccion].filter(Boolean).join(' — ') || 'Inmueble',
    valor_pen: parseFloat(b.autoavaluo || '0'),
  }))

  const bienesMuebles = muebles.map(b => ({
    descripcion: [b.vehiculo, b.caracteristica, b.marca, b.placa?.trim()].filter(Boolean).join(' — ') || 'Bien mueble',
    valor_pen: parseFloat(b.valor || '0'),
    comentario: b.comentario || null,
  }))

  return {
    total_bienes_pen: totalBienes || null,
    total_ingresos_anuales_pen: totalIngresos || null,
    bienes_inmuebles: bienesInmuebles.length > 0 ? bienesInmuebles : undefined,
    bienes_muebles: bienesMuebles.length > 0 ? bienesMuebles : undefined,
    declaration_year: ingresos[0]?.anioIngresos || '2024',
    source: 'JNE — Declaración Jurada',
  }
}

async function main() {
  const candidates = JSON.parse(fs.readFileSync(CANDIDATES_PATH, 'utf-8'))
  let updated = 0

  for (const c of candidates) {
    if (!c.jne_dni || !c.jne_party_id) {
      console.log(`SKIP ${c.full_name}: missing DNI or party ID`)
      continue
    }

    try {
      console.log(`Fetching bienes for ${c.full_name} (DNI: ${c.jne_dni})...`)
      const dj = await fetchBienes(c.jne_dni, c.jne_party_id)
      const bienes = parseBienes(dj)

      if (bienes && (bienes.total_bienes_pen || bienes.total_ingresos_anuales_pen)) {
        c.jne_bienes = bienes
        updated++
        console.log(`  -> ${c.full_name}: bienes=${bienes.total_bienes_pen}, ingresos=${bienes.total_ingresos_anuales_pen}`)
      } else {
        console.log(`  -> ${c.full_name}: no bienes data`)
      }
    } catch (err) {
      console.error(`  ERROR ${c.full_name}: ${err.message}`)
    }

    await new Promise(r => setTimeout(r, DELAY_MS))
  }

  fs.writeFileSync(CANDIDATES_PATH, JSON.stringify(candidates, null, 2) + '\n')
  console.log(`\nDone. Updated ${updated}/${candidates.length} candidates with bienes data.`)
}

main().catch(console.error)
