import Link from 'next/link'
import { Metadata } from 'next'
import { getDataStats } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Datos y Fuentes — VotoAbierto',
  description: 'Transparencia total: de dónde vienen los datos de VotoAbierto y cómo los verificamos.',
}

const DATA_SOURCES = [
  {
    name: 'Jurado Nacional de Elecciones (JNE)',
    description: 'Fuente principal de datos electorales: candidatos inscritos, hojas de vida, planes de gobierno, antecedentes penales declarados.',
    url: 'https://votoinformado.jne.gob.pe',
    dataTypes: ['Candidatos inscritos', 'Hojas de vida', 'Planes de gobierno (PDF)', 'Antecedentes penales declarados', 'Fotos oficiales'],
    api: 'API Voto Informado + Voto Informado IA',
    reliability: 'Oficial — datos declarados por candidatos ante el JNE',
  },
  {
    name: 'Infogob',
    description: 'Plataforma del JNE con historial político: elecciones anteriores, cargos previos, trayectoria partidaria.',
    url: 'https://infogob.jne.gob.pe',
    dataTypes: ['Historial electoral', 'Cargos públicos previos', 'Militancia partidaria'],
    api: 'Web scraping (datos públicos)',
    reliability: 'Oficial — registro histórico del JNE',
  },
  {
    name: 'ONPE',
    description: 'Oficina Nacional de Procesos Electorales: financiamiento de campaña, aportes y gastos declarados.',
    url: 'https://www.onpe.gob.pe',
    dataTypes: ['Financiamiento de campaña', 'Aportes privados', 'Gastos declarados'],
    api: 'Datos públicos',
    reliability: 'Oficial — fiscalización electoral',
  },
  {
    name: 'JNE Fact Checking',
    description: 'Verificación de afirmaciones de candidatos por el equipo de fact-checking del JNE.',
    url: 'https://factchecking.jne.gob.pe',
    dataTypes: ['Verificación de declaraciones', 'Veredictos (verdadero/falso/engañoso)'],
    api: 'Web',
    reliability: 'Oficial — verificación independiente del JNE',
  },
]

const DATA_MODEL = [
  {
    table: 'candidate_profiles',
    description: 'Perfil base del candidato: nombre, partido, biografía, plan de gobierno, propuestas.',
    source: 'JNE',
    fields: 36,
  },
  {
    table: 'candidate_hoja_de_vida',
    description: 'Curriculum vitae: educación, experiencia laboral, cargos públicos previos.',
    source: 'JNE — API Hoja de Vida',
    fields: null,
  },
  {
    table: 'candidate_antecedentes',
    description: 'Antecedentes legales: sentencias penales, civiles, procesos judiciales.',
    source: 'JNE — Declaración jurada',
    fields: null,
  },
  {
    table: 'candidate_bienes',
    description: 'Bienes declarados: inmuebles, muebles, ingresos, deudas.',
    source: 'JNE — Declaración jurada',
    fields: null,
  },
  {
    table: 'candidate_positions_db',
    description: 'Posiciones en temas clave (1-5): economía, seguridad, educación, salud, etc.',
    source: 'Análisis de planes de gobierno',
    fields: null,
  },
  {
    table: 'candidate_factchecks',
    description: 'Verificaciones de declaraciones con veredicto y fuente.',
    source: 'JNE Fact Checking',
    fields: null,
  },
  {
    table: 'candidate_financiamiento',
    description: 'Financiamiento de campaña: aportes, gastos, principales donantes.',
    source: 'ONPE',
    fields: null,
  },
]

export default async function DatosPage() {
  const stats = await getDataStats()

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-[#111111] mb-2">Datos y Transparencia</h1>
        <p className="text-[#777777] mb-10">
          VotoAbierto es una plataforma no partidaria. Cada dato tiene una fuente verificable.
          Aquí explicamos de dónde viene toda la información y cómo la procesamos.
        </p>

        {/* Data Stats */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[#111111] mb-4">Estado de los datos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard label="Candidatos presidenciales" value={stats.totalCandidates} />
            <StatCard label="Hojas de vida" value={stats.totalWithHdv} />
            <StatCard label="Registros de antecedentes" value={stats.totalWithAntecedentes} />
            <StatCard label="Declaraciones de bienes" value={stats.totalWithBienes} />
            <StatCard label="Posiciones por tema" value={stats.totalPositions} />
            <StatCard label="Verificaciones" value={stats.totalFactchecks} />
          </div>
          {stats.lastUpdated && (
            <p className="text-xs text-[#CBCAC5] mt-3">
              Última consulta: {new Date(stats.lastUpdated).toLocaleDateString('es-PE')}
            </p>
          )}
        </section>

        {/* Sources */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[#111111] mb-4">Fuentes de datos</h2>
          <div className="space-y-6">
            {DATA_SOURCES.map((source) => (
              <div key={source.name} className="border border-[#E5E3DE] rounded-xl p-5 bg-[#F7F6F3]">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-[#111111]">{source.name}</h3>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#1A56A0] hover:underline flex-shrink-0"
                  >
                    Visitar sitio
                  </a>
                </div>
                <p className="text-sm text-[#4B5563] mb-3">{source.description}</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {source.dataTypes.map((dt) => (
                    <span key={dt} className="text-[10px] px-2 py-0.5 rounded bg-white border border-[#E5E3DE] text-[#777777]">
                      {dt}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-[#CBCAC5]">
                  Acceso: {source.api} · Confiabilidad: {source.reliability}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Data Model */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[#111111] mb-4">Modelo de datos</h2>
          <p className="text-sm text-[#777777] mb-4">
            Cada tabla almacena un tipo específico de información. Todos los datos son públicos y accesibles.
          </p>
          <div className="border border-[#E5E3DE] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F7F6F3] border-b border-[#E5E3DE]">
                  <th className="text-left px-4 py-3 text-[#777777] font-medium text-xs">Tabla</th>
                  <th className="text-left px-4 py-3 text-[#777777] font-medium text-xs">Descripción</th>
                  <th className="text-left px-4 py-3 text-[#777777] font-medium text-xs">Fuente</th>
                </tr>
              </thead>
              <tbody>
                {DATA_MODEL.map((model, i) => (
                  <tr key={model.table} className={`border-b border-[#E5E3DE] ${i % 2 === 0 ? '' : 'bg-[#FAFAF9]'}`}>
                    <td className="px-4 py-3 font-mono text-xs text-[#1A56A0]">{model.table}</td>
                    <td className="px-4 py-3 text-[#4B5563] text-xs">{model.description}</td>
                    <td className="px-4 py-3 text-[#777777] text-xs">{model.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Methodology */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[#111111] mb-4">Metodología</h2>
          <div className="prose prose-sm max-w-none text-[#4B5563]">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-[#111111]">Recolección de datos</h3>
                <p className="text-sm">
                  Los datos se obtienen directamente de las APIs y sitios web oficiales del JNE, Infogob y ONPE.
                  No se fabrican ni estiman datos — si una fuente no tiene la información, el campo se muestra como
                  &ldquo;No disponible&rdquo;.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#111111]">Posiciones por tema</h3>
                <p className="text-sm">
                  Las posiciones se extraen de los planes de gobierno oficiales presentados al JNE.
                  Se asigna una puntuación del 1 al 5 basada en las propuestas concretas del candidato.
                  Las posiciones sin verificar se marcan como tal.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#111111]">Antecedentes</h3>
                <p className="text-sm">
                  Los antecedentes penales provienen de la declaración jurada que cada candidato presenta al JNE
                  como parte de su hoja de vida. Son datos públicos por ley y no representan una opinión editorial.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#111111]">Neutralidad</h3>
                <p className="text-sm">
                  VotoAbierto no apoya a ningún candidato ni partido. La presentación de datos es uniforme
                  para todos los candidatos. No se editorializan los datos — se presentan tal como están
                  en las fuentes oficiales.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Missing data */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[#111111] mb-4">Datos pendientes</h2>
          <div className="border border-[#E5E3DE] rounded-xl p-5 bg-[#F7F6F3]">
            <ul className="space-y-2 text-sm text-[#4B5563]">
              <li className="flex items-start gap-2">
                <span className="text-[#CBCAC5] mt-0.5">&#x25CB;</span>
                Financiamiento de campaña (ONPE — disponible después del cierre de cuentas)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#CBCAC5] mt-0.5">&#x25CB;</span>
                Verificaciones completas de fact-checking del JNE
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#CBCAC5] mt-0.5">&#x25CB;</span>
                Historial electoral detallado desde Infogob
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#CBCAC5] mt-0.5">&#x25CB;</span>
                Embeddings para búsqueda semántica (próxima versión)
              </li>
            </ul>
          </div>
        </section>

        {/* Contribute */}
        <section className="border border-[#1A56A0] rounded-xl p-6 bg-[#F0F4FA] text-center">
          <h2 className="text-xl font-bold text-[#111111] mb-2">Contribuye</h2>
          <p className="text-sm text-[#4B5563] mb-4">
            ¿Encontraste un error? ¿Tienes datos verificables que faltan?
            Ayúdanos a mantener la información actualizada.
          </p>
          <Link
            href="/contribuir"
            className="inline-block bg-[#1A56A0] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#154785] transition-colors"
          >
            Enviar corrección
          </Link>
        </section>
      </div>
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[#F7F6F3] border border-[#E5E3DE] rounded-xl p-4 text-center">
      <p className="text-2xl font-bold text-[#1A56A0]">{value}</p>
      <p className="text-xs text-[#777777] mt-1">{label}</p>
    </div>
  )
}
