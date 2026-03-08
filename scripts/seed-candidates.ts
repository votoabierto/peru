/**
 * VotoClaro — Seed script for top presidential candidates
 * Run with: npx tsx scripts/seed-candidates.ts
 *
 * Requires env vars:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (bypasses RLS)
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!supabaseUrl || !serviceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

// ─── Party IDs (must match migration 001) ───────────────────────────────────

const PARTY = {
  RP: "11111111-0000-0000-0000-000000000001",
  FP: "11111111-0000-0000-0000-000000000002",
  PL: "11111111-0000-0000-0000-000000000003",
  APP: "11111111-0000-0000-0000-000000000004",
  PPT: "11111111-0000-0000-0000-000000000005",
  AN: "11111111-0000-0000-0000-000000000006",
};

// ─── Candidate IDs (fixed, idempotent) ─────────────────────────────────────

const CANDIDATE = {
  LOPEZ_ALIAGA: "aaaaaaaa-0000-0000-0000-000000000001",
  CERRON: "aaaaaaaa-0000-0000-0000-000000000002",
  FUJIMORI: "aaaaaaaa-0000-0000-0000-000000000003",
  LOPEZ_CHAU: "aaaaaaaa-0000-0000-0000-000000000004",
  ACUNA: "aaaaaaaa-0000-0000-0000-000000000005",
  ALVAREZ: "aaaaaaaa-0000-0000-0000-000000000006",
};

// ─── Candidates ─────────────────────────────────────────────────────────────

const candidates = [
  {
    id: CANDIDATE.LOPEZ_ALIAGA,
    full_name: "Rafael López Aliaga",
    common_name: "Porky",
    slug: "rafael-lopez-aliaga",
    role: "president",
    party_id: PARTY.RP,
    age: 59,
    current_polling: 14.0,
    has_criminal_record: false,
    is_verified: true,
    education: "Ingeniería Industrial, Universidad de Lima",
    career_summary:
      "Empresario inmobiliario y exalcalde de Lima (2023-2025). Miembro del Opus Dei. " +
      "Estilo comunicativo populista comparado con Donald Trump. Lideró Renovación Popular " +
      "desde su fundación en 2020. Promete mano dura contra el crimen con apoyo militar.",
    wikipedia_url: "https://es.wikipedia.org/wiki/Rafael_L%C3%B3pez_Aliaga",
  },
  {
    id: CANDIDATE.CERRON,
    full_name: "Vladimir Cerrón",
    common_name: "Cerrón",
    slug: "vladimir-cerron",
    role: "president",
    party_id: PARTY.PL,
    age: 54,
    current_polling: 9.0,
    has_criminal_record: true,
    criminal_record_detail:
      "Prófugo de la justicia desde octubre de 2023. Condenado por corrupción y cohecho durante " +
      "su gestión como gobernador regional de Junín (2003-2010). Anunció candidatura desde la " +
      "clandestinidad en enero de 2026. Elegibilidad bajo revisión del JNE.",
    is_verified: true,
    education: "Médico cirujano, UNMSM",
    career_summary:
      "Fundador y líder de Perú Libre. Exgobernador regional de Junín. Artífice del ascenso de " +
      "Pedro Castillo a la presidencia en 2021. Ideología marxista-leninista. Opera desde la " +
      "clandestinidad con fuerte base en el sur andino y regiones rurales.",
    wikipedia_url: "https://es.wikipedia.org/wiki/Vladimir_Cerr%C3%B3n",
  },
  {
    id: CANDIDATE.FUJIMORI,
    full_name: "Keiko Fujimori",
    common_name: "Keiko",
    slug: "keiko-fujimori",
    role: "president",
    party_id: PARTY.FP,
    age: 51,
    current_polling: 9.0,
    has_criminal_record: true,
    criminal_record_detail:
      "Investigada por irregularidades en el financiamiento de su partido. Tres veces candidata " +
      "presidencial (2011, 2016, 2021) y tres veces perdedora en segunda vuelta. Hija del " +
      "expresidente Alberto Fujimori (1990-2000), actualmente fallecido.",
    is_verified: true,
    education: "Administración de Empresas, Boston University",
    career_summary:
      "Líder de Fuerza Popular y figura central de la derecha peruana. Tres candidaturas " +
      "presidenciales con derrotas en segunda vuelta. Base electoral concentrada en distritos " +
      "pobres de Lima y norte del país, vinculada al legado social del fujimorismo.",
    wikipedia_url: "https://es.wikipedia.org/wiki/Keiko_Fujimori",
  },
  {
    id: CANDIDATE.LOPEZ_CHAU,
    full_name: "Alfonso López Chau",
    common_name: "López Chau",
    slug: "alfonso-lopez-chau",
    role: "president",
    party_id: PARTY.AN,
    age: 62,
    current_polling: 5.1,
    has_criminal_record: false,
    criminal_record_detail:
      "Bajo investigación por presuntos actos de corrupción durante su gestión como rector de " +
      "la Universidad Nacional de Ingeniería (UNI, 2021-2025). No hay sentencia firme.",
    is_verified: true,
    education: "Economía, PUCP. PhD, Universidad de Cambridge",
    career_summary:
      "Exdirector del Banco Central de Reserva del Perú (2006-2012). Exrector de la UNI. " +
      "Perfil tecnocrático de centro-izquierda. Candidato de Ahora Nación, coalición de " +
      "partidos reformistas moderados.",
  },
  {
    id: CANDIDATE.ACUNA,
    full_name: "César Acuña Peralta",
    common_name: "Acuña",
    slug: "cesar-acuna",
    role: "president",
    party_id: PARTY.APP,
    age: 63,
    current_polling: 4.4,
    has_criminal_record: false,
    is_verified: true,
    education: "Educación, Universidad César Vallejo (fundador)",
    career_summary:
      "Empresario del sector educativo y exgobernador regional de La Libertad. Fundó la " +
      "Universidad César Vallejo y el Grupo Acuña. Alianza para el Progreso tiene presencia " +
      "parlamentaria significativa. Candidato de perfil empresarial y pragmático.",
    wikipedia_url: "https://es.wikipedia.org/wiki/C%C3%A9sar_Acu%C3%B1a",
  },
  {
    id: CANDIDATE.ALVAREZ,
    full_name: 'Carlos Álvarez Campos',
    common_name: "Cachín",
    slug: "carlos-alvarez-cachin",
    role: "president",
    party_id: PARTY.PPT,
    age: 56,
    current_polling: 4.0,
    has_criminal_record: false,
    is_verified: false,
    education: "Comunicaciones",
    career_summary:
      "Comediante e imitador político conocido como 'Cachín'. Representa el voto protesta y " +
      "el hartazgo ciudadano con la clase política tradicional. Usa el humor y la parodia como " +
      "herramienta de campaña. Candidato atípico en un año de récord de candidatos.",
    wikipedia_url: "https://es.wikipedia.org/wiki/Carlos_%C3%81lvarez_(comediante)",
  },
];

// ─── Positions ───────────────────────────────────────────────────────────────

const positions = [
  // López Aliaga
  {
    candidate_id: CANDIDATE.LOPEZ_ALIAGA,
    issue_area: "security",
    stance:
      "Propone juzgar crímenes violentos en tribunales militares. Solicitar asistencia militar " +
      "de Estados Unidos. Desplegar Fuerzas Armadas en zonas de alta criminalidad al estilo " +
      "Bukele (El Salvador).",
    quote:
      "Vamos a declarar el estado de emergencia en los distritos con más crimen y meter al ejército.",
    verified: true,
  },
  {
    candidate_id: CANDIDATE.LOPEZ_ALIAGA,
    issue_area: "economy",
    stance:
      "Reducir ministerios y burocracia estatal. Promover inversión privada extranjera. " +
      "Acuerdos de libre comercio con Estados Unidos. Reducir el rol del Estado en la economía.",
    verified: true,
  },
  {
    candidate_id: CANDIDATE.LOPEZ_ALIAGA,
    issue_area: "education",
    stance:
      "Recuperar la carrera pública magisterial. Más autonomía para escuelas privadas. " +
      "Vouchers educativos para familias de bajos recursos.",
    verified: false,
  },
  {
    candidate_id: CANDIDATE.LOPEZ_ALIAGA,
    issue_area: "foreign_policy",
    stance:
      "Alineamiento con Estados Unidos y administración Trump. Distanciamiento de China. " +
      "Apoyo a bloque democrático latinoamericano contra Venezuela, Cuba y Nicaragua.",
    verified: true,
  },

  // Cerrón
  {
    candidate_id: CANDIDATE.CERRON,
    issue_area: "economy",
    stance:
      "Estatización de recursos naturales estratégicos (minería, gas). Modelo de economía " +
      "mixta con fuerte intervención estatal. Redistribución de la renta minera a comunidades.",
    verified: true,
  },
  {
    candidate_id: CANDIDATE.CERRON,
    issue_area: "mining",
    stance:
      "Renegociación de contratos mineros. El Estado debe tener participación mayoritaria en " +
      "las grandes operaciones mineras. Prioridad a las comunidades sobre las empresas extractivas.",
    verified: true,
  },
  {
    candidate_id: CANDIDATE.CERRON,
    issue_area: "education",
    stance:
      "Educación pública gratuita y de calidad como derecho constitucional. " +
      "Incremento del presupuesto educativo al 10% del PBI. Nacionalización de universidades privadas con fines de lucro.",
    verified: false,
  },
  {
    candidate_id: CANDIDATE.CERRON,
    issue_area: "security",
    stance:
      "Enfoque social para reducir la criminalidad: empleo, educación y reducción de la desigualdad. " +
      "Se opone a militarización de la seguridad ciudadana.",
    verified: false,
  },

  // Fujimori
  {
    candidate_id: CANDIDATE.FUJIMORI,
    issue_area: "security",
    stance:
      "Pena de muerte para terroristas y narcotraficantes. Cadena perpetua sin beneficios " +
      "para crimen organizado. Mayor presupuesto a policía y fiscalía anticorrupción.",
    quote: "Defenderé a los peruanos honestos con mano firme contra la delincuencia.",
    verified: true,
  },
  {
    candidate_id: CANDIDATE.FUJIMORI,
    issue_area: "economy",
    stance:
      "Continuidad del modelo de economía de mercado con apertura comercial. Incentivos " +
      "tributarios para inversión en regiones. Formalización del empleo informal.",
    verified: true,
  },
  {
    candidate_id: CANDIDATE.FUJIMORI,
    issue_area: "social_programs",
    stance:
      "Ampliar programas sociales focalizados (alimentación, salud materna). Recuperar el " +
      "legado de los programas sociales fujimoristas de los años 90.",
    verified: false,
  },

  // López Chau
  {
    candidate_id: CANDIDATE.LOPEZ_CHAU,
    issue_area: "economy",
    stance:
      "Reforma fiscal progresiva que incremente la recaudación. Mayor inversión pública en " +
      "infraestructura. Política monetaria independiente y responsable.",
    verified: true,
  },
  {
    candidate_id: CANDIDATE.LOPEZ_CHAU,
    issue_area: "education",
    stance:
      "Reforma estructural del sistema educativo. Meritocracia docente. Educación técnica " +
      "vinculada al mercado laboral. Incremento presupuestal gradual.",
    verified: true,
  },
  {
    candidate_id: CANDIDATE.LOPEZ_CHAU,
    issue_area: "corruption",
    stance:
      "Fortalecimiento del sistema anticorrupción. Independencia del Ministerio Público. " +
      "Ley de transparencia reforzada para funcionarios públicos y candidatos.",
    verified: true,
  },

  // Acuña
  {
    candidate_id: CANDIDATE.ACUNA,
    issue_area: "economy",
    stance:
      "Modelo de economía de mercado con apoyo al sector privado. Reducción de trabas " +
      "burocráticas para las MYPE. Incentivos para la inversión en regiones.",
    verified: true,
  },
  {
    candidate_id: CANDIDATE.ACUNA,
    issue_area: "education",
    stance:
      "Experiencia en educación privada. Propone alianzas público-privadas en educación. " +
      "Mejorar infraestructura educativa en regiones. Becas para jóvenes con talento.",
    verified: false,
  },
  {
    candidate_id: CANDIDATE.ACUNA,
    issue_area: "infrastructure",
    stance:
      "Acelerar obras de infraestructura paralizadas. Asociaciones público-privadas para " +
      "grandes proyectos. Descentralización real de la inversión pública.",
    verified: true,
  },

  // Álvarez / Cachín
  {
    candidate_id: CANDIDATE.ALVAREZ,
    issue_area: "corruption",
    stance:
      "Propone reducción drástica del sueldo de congresistas y funcionarios. Transparencia " +
      "total en el gasto público. Abolir los privilegios parlamentarios.",
    quote: "En el Perú la corrupción no es un problema, es una costumbre. Hay que romperla.",
    verified: false,
  },
  {
    candidate_id: CANDIDATE.ALVAREZ,
    issue_area: "security",
    stance:
      "Propuestas de seguridad basadas en tecnología y prevención comunitaria. " +
      "Critica la corrupción policial como causa raíz del problema de seguridad.",
    verified: false,
  },
];

// ─── Fact checks ─────────────────────────────────────────────────────────────

const factChecks = [
  {
    candidate_id: CANDIDATE.LOPEZ_ALIAGA,
    claim:
      "Rafael López Aliaga afirmó que Lima tuvo el mayor descenso de criminalidad de América Latina durante su gestión como alcalde.",
    verdict: "misleading",
    explanation:
      "Las estadísticas del INEI y la PNP muestran una reducción marginal en algunos delitos durante 2023-2024, " +
      "pero Lima no figura en rankings regionales de seguridad como la ciudad con mayor mejora. " +
      "La afirmación exagera el impacto real y carece de fuente oficial que la respalde.",
    source_urls: [
      "https://www.inei.gob.pe/estadisticas/indice-tematico/seguridad-ciudadana/",
    ],
  },
  {
    candidate_id: CANDIDATE.CERRON,
    claim:
      "Vladimir Cerrón sostiene que no existe sentencia firme en su contra y que es víctima de persecución política.",
    verdict: "false",
    explanation:
      "El Poder Judicial peruano emitió sentencia condenatoria contra Cerrón por los delitos de " +
      "negociación incompatible y corrupción de funcionarios durante su gestión como gobernador de Junín. " +
      "La sentencia fue confirmada en segunda instancia. Su condición de prófugo es un hecho establecido.",
    source_urls: [
      "https://www.pj.gob.pe/",
    ],
  },
  {
    candidate_id: CANDIDATE.FUJIMORI,
    claim:
      "Keiko Fujimori afirmó que el gobierno de su padre no cometió violaciones a los derechos humanos.",
    verdict: "false",
    explanation:
      "La Comisión de la Verdad y Reconciliación del Perú (CVR) documentó casos de esterilizaciones " +
      "forzadas, desapariciones y ejecuciones extrajudiciales durante el gobierno de Alberto Fujimori " +
      "(1990-2000). Cortes internacionales también han reconocido estas violaciones.",
    source_urls: [
      "https://www.cverdad.org.pe/",
    ],
  },
  {
    candidate_id: CANDIDATE.LOPEZ_CHAU,
    claim:
      "Alfonso López Chau señaló que fue el Banco Central de Reserva quien controló la inflación durante 2008-2010.",
    verdict: "context_needed",
    explanation:
      "Es correcto que el BCRP implementó políticas de control inflacionario durante ese período. " +
      "Sin embargo, también influyeron factores externos como los precios de commodities internacionales " +
      "y la política fiscal del ejecutivo. El rol del BCR fue relevante pero no exclusivo.",
    source_urls: [
      "https://www.bcrp.gob.pe/estadisticas/cuadros-anuales-historicos.html",
    ],
  },
  {
    candidate_id: CANDIDATE.ACUNA,
    claim:
      "César Acuña afirmó que la Universidad César Vallejo es la más grande del Perú por número de alumnos.",
    verdict: "true",
    explanation:
      "Según datos de la SUNEDU (Superintendencia Nacional de Educación Superior Universitaria), " +
      "la Universidad César Vallejo es efectivamente la institución universitaria con mayor matrícula " +
      "en el Perú, con más de 120,000 estudiantes registrados.",
    source_urls: [
      "https://www.sunedu.gob.pe/",
    ],
  },
  {
    candidate_id: CANDIDATE.ALVAREZ,
    claim:
      "Carlos Álvarez 'Cachín' aseguró que el 80% del presupuesto del Congreso se gasta en beneficios para congresistas.",
    verdict: "unverifiable",
    explanation:
      "No existe una auditoría pública que desagregue el presupuesto del Congreso en esos términos. " +
      "El portal de transparencia del Congreso muestra datos de ejecución presupuestal pero no con " +
      "el nivel de detalle que permitiría verificar esta afirmación específica.",
    source_urls: [
      "https://www.congreso.gob.pe/transparencia/",
    ],
  },
];

// ─── Main ────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("🗳️  VotoClaro — seeding candidates...\n");

  // Upsert candidates
  const { error: candErr } = await supabase
    .from("candidates")
    .upsert(candidates, { onConflict: "id", ignoreDuplicates: false });

  if (candErr) {
    console.error("❌ Error seeding candidates:", candErr.message);
    process.exit(1);
  }
  console.log(`✅ ${candidates.length} candidatos insertados/actualizados`);

  // Upsert positions (delete + insert since no stable ID)
  const candidateIds = candidates.map((c) => c.id);
  await supabase.from("positions").delete().in("candidate_id", candidateIds);

  const { error: posErr } = await supabase.from("positions").insert(positions);
  if (posErr) {
    console.error("❌ Error seeding positions:", posErr.message);
    process.exit(1);
  }
  console.log(`✅ ${positions.length} posiciones insertadas`);

  // Upsert fact checks
  await supabase.from("fact_checks").delete().in("candidate_id", candidateIds);
  const { error: fcErr } = await supabase.from("fact_checks").insert(factChecks);
  if (fcErr) {
    console.error("❌ Error seeding fact_checks:", fcErr.message);
    process.exit(1);
  }
  console.log(`✅ ${factChecks.length} fact checks insertados`);

  console.log("\n🎉 Seed completo. VotoClaro listo para los datos de elecciones.");
}

seed();
