#!/usr/bin/env node
/**
 * Fetch hojas de vida (CV) for all 36 presidential candidates from JNE API
 *
 * Data source: https://votoinformadoia.jne.gob.pe/ServiciosWeb
 * Process: Elecciones Generales 2026 (id=124), Presidencial (tipo=1)
 *
 * Usage: node scripts/fetch-hojas-de-vida.js
 */

const fs = require('fs');
const path = require('path');

const API_BASE = 'https://votoinformadoia.jne.gob.pe/ServiciosWeb';
const PROCESO_ELECTORAL = 124;
const TIPO_ELECCION = 1;
const DELAY_MS = 500;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJSON(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  return res.json();
}

function toSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function toTitleCase(s) {
  return s
    .toLowerCase()
    .replace(/(?:^|\s|['\-(])\S/g, (c) => c.toUpperCase());
}

function parseBirthDate(dateStr) {
  if (!dateStr) return null;
  // Format: "15/06/1973" or "5/10/1980 00:00:00"
  const parts = dateStr.split(' ')[0].split('/');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function calculateAge(birthDateStr) {
  const bd = parseBirthDate(birthDateStr);
  if (!bd) return null;
  const birth = new Date(bd);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

async function fetchPresidentialCandidates() {
  console.log('Fetching presidential candidate list...');
  const data = await fetchJSON(`${API_BASE}/api/v1/ListaCandidatos/filtrar`, {
    idProcesoElectoral: PROCESO_ELECTORAL,
    idTipoEleccion: TIPO_ELECCION,
  });

  if (!data.success && !data.data) {
    throw new Error('Failed to fetch candidate list: ' + JSON.stringify(data));
  }

  const results = (data.data || data).resultados || [];
  return results.filter((r) => r.cargo === 'PRESIDENTE DE LA REPÚBLICA');
}

async function fetchHojaDeVida(dni, idOrganizacionPolitica) {
  const data = await fetchJSON(`${API_BASE}/api/v1/candidato/hoja-de-vida-integrado`, {
    idProcesoElectoral: PROCESO_ELECTORAL,
    idTipoEleccion: TIPO_ELECCION,
    dni,
    idOrganizacionPolitica,
  });
  return data;
}

function extractEducation(hdv) {
  const education = [];

  // The API nests education under formacionAcademica
  const fa = hdv.formacionAcademica || {};

  // University education
  const uni = fa.educacionUniversitaria || hdv.educacionUniversitaria || [];
  for (const e of uni) {
    education.push({
      nivel: 'universitaria',
      institucion: e.universidad || e.centroEstudio,
      titulo: e.carreraUni || e.profesion,
      year_start: e.anioTitulo || e.anioBachiller || null,
      year_end: null,
      country: 'Peru',
      concluido: e.concluidoEduUni === 'SI',
    });
  }

  // Postgrado
  const post = fa.educacionPosgrado || hdv.postgrado || [];
  for (const e of post) {
    education.push({
      nivel: 'postgrado',
      institucion: e.txCenEstudioPosgrado || e.centroEstudio,
      titulo: e.txEspecialidadPosgrado || e.especialidad,
      year_start: e.txAnioPosgrado || null,
      year_end: null,
      country: 'Peru',
      concluido: e.concluidoPosgrado === 'SI',
    });
  }

  // Technical education
  const tec = fa.educacionTecnico || hdv.educacionTecnica || [];
  for (const e of tec) {
    education.push({
      nivel: 'tecnica',
      institucion: e.centroEstudio || e.txCenEstudio,
      titulo: e.carrera || e.profesion,
      year_start: null,
      year_end: null,
      country: 'Peru',
      concluido: e.concluidoEduTec === 'SI',
    });
  }

  // Non-university
  const noUni = fa.educacionNoUniversitaria || hdv.educacionNoUniversitaria || [];
  for (const e of noUni) {
    education.push({
      nivel: 'no_universitaria',
      institucion: e.centroEstudio || e.txCenEstudio,
      titulo: e.carrera || e.profesion,
      year_start: null,
      year_end: null,
      country: 'Peru',
    });
  }

  return education;
}

function extractWorkHistory(hdv) {
  const work = [];
  const exp = hdv.experienciaLaboral || [];
  for (const e of exp) {
    work.push({
      cargo: e.ocupacionProfesion,
      institucion: e.centroTrabajo,
      sector: e.rucTrabajo ? 'privado' : 'publico',
      year_start: e.anioTrabajoDesde,
      year_end: e.anioTrabajoHasta,
      pais: e.trabajoPais || 'PERU',
      departamento: e.trabajoDepartamento,
      descripcion: e.txComentario,
    });
  }
  return work;
}

function extractAntecedentes(hdv, candidateInfo) {
  const antecedentes = [];
  const sentencias = hdv.sentenciaPenal || candidateInfo.sentenciaPenalDetalle || [];
  for (const s of sentencias) {
    antecedentes.push({
      tipo: 'sentencia_penal',
      descripcion: `${s.fallo || ''} - ${s.materia || ''}`.trim(),
      fuente: 'JNE - Hoja de Vida',
      fuero: s.fuero,
      expediente: s.expediente,
      fecha: s.fecSentencia,
      modalidad: s.modalidad,
      cumplimiento: s.cumplimientoPena,
      materia: s.materia,
      comentario: s.txComentario,
    });
  }

  // Civil sentences
  const civil = hdv.sentenciaCivil || [];
  for (const s of civil) {
    antecedentes.push({
      tipo: 'sentencia_civil',
      descripcion: s.fallo || s.materia || 'Sentencia civil',
      fuente: 'JNE - Hoja de Vida',
      fuero: s.fuero,
      expediente: s.expediente,
    });
  }

  return antecedentes;
}

function extractBienes(hdv) {
  const dj = hdv.declaracionJurada || {};
  const bienesInmuebles = dj.bienInmueble || hdv.bienInmueble || [];
  const bienesMuebles = dj.bienMueble || hdv.bienMueble || [];
  const ingresos = dj.ingreso || hdv.ingresos || hdv.ingreso || [];

  let totalBienes = 0;
  const inmuebles = bienesInmuebles.map((b) => {
    const valor = parseFloat(b.autoavaluo || b.valor || 0);
    totalBienes += valor;
    return {
      descripcion: b.tipoBienInmueble || b.descripcion || 'Inmueble',
      valor_pen: valor,
      ubicacion: b.inmuebleDireccion || [b.inmuebleDistrito, b.inmuebleProvincia, b.inmuebleDepartamento].filter(Boolean).join(', '),
    };
  });

  const muebles = bienesMuebles.map((b) => {
    const valor = parseFloat(b.valor || 0);
    totalBienes += valor;
    return {
      descripcion: b.tipoBienMueble || b.vehiculo || b.descripcion || 'Mueble',
      valor_pen: valor,
    };
  });

  let totalIngresos = 0;
  for (const i of ingresos) {
    totalIngresos += parseFloat(i.totalIngresos || i.total || i.monto || 0);
  }

  return {
    total_bienes_pen: totalBienes || null,
    total_ingresos_anuales_pen: totalIngresos || null,
    bienes_inmuebles: inmuebles.length > 0 ? inmuebles : null,
    bienes_muebles: muebles.length > 0 ? muebles : null,
  };
}

async function main() {
  console.log('JNE Hoja de Vida Fetcher — Elecciones Generales 2026');
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  // Step 1: Get all presidential candidates
  const candidates = await fetchPresidentialCandidates();
  console.log(`Found ${candidates.length} presidential candidates\n`);

  const results = [];
  let fetched = 0;
  let failed = 0;

  for (const c of candidates) {
    const fullName = toTitleCase(
      [c.nombres, c.apellidoPaterno, c.apellidoMaterno].filter(Boolean).join(' ')
    );
    const slug = toSlug(
      [c.nombres, c.apellidoPaterno, c.apellidoMaterno].filter(Boolean).join(' ')
    );

    console.log(`[${fetched + failed + 1}/${candidates.length}] ${fullName} (${c.organizacionPolitica})...`);

    try {
      const hdvResponse = await fetchHojaDeVida(c.dni, c.idOrganizacionPolitica);
      const hdv = hdvResponse.data || hdvResponse;

      const general = hdv.datoGeneral || {};
      const education = extractEducation(hdv);
      const workHistory = extractWorkHistory(hdv);
      const antecedentes = extractAntecedentes(hdv, c);
      const bienes = extractBienes(hdv);

      const birthPlace = [general.naciDistrito, general.naciProvincia, general.naciDepartamento]
        .filter(Boolean)
        .join(', ');

      results.push({
        slug,
        full_name: fullName,
        dni: c.dni,
        party_id: c.idOrganizacionPolitica,
        party_name: toTitleCase(c.organizacionPolitica),
        photo_url: c.urlFoto,
        plan_gobierno_pdf_url: c.urlPlanGobierno,
        plan_gobierno_id: c.idPlanGobierno,

        // Personal
        birth_date: parseBirthDate(c.fechaNacimiento || general.feNacimiento),
        birth_place: birthPlace,
        age: calculateAge(c.fechaNacimiento || general.feNacimiento),
        profession: (c.ocupacionProfesion || [])[0] || null,
        all_professions: c.ocupacionProfesion || [],
        academic_titles: c.titulosAcademicos || [],

        // Hoja de vida
        education,
        work_history: workHistory,

        // Antecedentes
        has_antecedentes: c.sentenciaPenal === 'CON ANTECEDENTES PENALES',
        antecedentes,

        // Bienes
        bienes,

        // Raw data for debugging
        _raw_sentencia_summary: c.sentenciaPenal,
        _fetched_at: new Date().toISOString(),
        _source: 'JNE API - votoinformadoia',
      });

      fetched++;
      console.log(`  ✓ Education: ${education.length}, Work: ${workHistory.length}, Antecedentes: ${antecedentes.length}`);
    } catch (err) {
      console.log(`  ✗ Failed: ${err.message}`);
      // Still save basic info from candidate list
      results.push({
        slug,
        full_name: fullName,
        dni: c.dni,
        party_id: c.idOrganizacionPolitica,
        party_name: toTitleCase(c.organizacionPolitica),
        photo_url: c.urlFoto,
        plan_gobierno_pdf_url: c.urlPlanGobierno,
        birth_date: parseBirthDate(c.fechaNacimiento),
        age: calculateAge(c.fechaNacimiento),
        profession: (c.ocupacionProfesion || [])[0] || null,
        has_antecedentes: c.sentenciaPenal === 'CON ANTECEDENTES PENALES',
        antecedentes: c.sentenciaPenalDetalle || [],
        education: [],
        work_history: [],
        bienes: {},
        _error: err.message,
        _fetched_at: new Date().toISOString(),
        _source: 'JNE API - partial (list only)',
      });
      failed++;
    }

    await sleep(DELAY_MS);
  }

  // Save results
  const outputPath = '/tmp/hojas-de-vida-raw.json';
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nDone! ${fetched} fetched, ${failed} failed. Saved to ${outputPath}`);

  // Also save antecedentes separately
  const allAntecedentes = results
    .filter((r) => r.antecedentes && r.antecedentes.length > 0)
    .map((r) => ({
      candidate_slug: r.slug,
      candidate_name: r.full_name,
      party: r.party_name,
      antecedentes: r.antecedentes,
      source: 'JNE - Hoja de Vida',
    }));
  fs.writeFileSync('/tmp/antecedentes-raw.json', JSON.stringify(allAntecedentes, null, 2));
  console.log(`Antecedentes: ${allAntecedentes.length} candidates with records → /tmp/antecedentes-raw.json`);
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
