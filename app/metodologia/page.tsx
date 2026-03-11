import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Metodología — VotoAbierto',
  description: 'Cómo verificamos las afirmaciones de los candidatos en VotoAbierto.',
};

export default function MetodologiaPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b border-[#E5E3DE] py-10 bg-[#F7F6F3]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="label mb-2">Transparencia</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111] mb-4">Nuestra Metodología</h1>
          <p className="text-[#777777] text-lg">
            VotoAbierto es una plataforma de información electoral independiente. Esta página explica cómo seleccionamos, investigamos y calificamos las afirmaciones de los candidatos.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-12">
          {/* Selección de afirmaciones */}
          <section>
            <h2 className="text-2xl font-bold text-[#111111] mb-4 flex items-center gap-2">
              <span>🔍</span> Selección de afirmaciones
            </h2>
            <p className="text-[#777777] leading-relaxed mb-3">
              Priorizamos afirmaciones que son: (1) verificables con datos, (2) relevantes para la decisión electoral, (3) ampliamente difundidas o influyentes en la opinión pública.
            </p>
            <p className="text-[#777777] leading-relaxed">
              No verificamos opiniones ni valores, solo afirmaciones de hecho. No cubrimos ataques personales sin base factual.
            </p>
          </section>

          {/* Definición de veredictos */}
          <section>
            <h2 className="text-2xl font-bold text-[#111111] mb-4 flex items-center gap-2">
              <span>⚖️</span> Definición de veredictos
            </h2>
            <div className="space-y-4">
              {[
                {
                  verdict: 'Verdadero ✅',
                  color: 'text-[#1A6B35]',
                  border: 'border-[#2D7D46]',
                  bg: 'bg-[#F0FAF4]',
                  desc: 'La afirmación es precisa y está respaldada por fuentes verificables. Puede haber matices menores, pero el núcleo del argumento es correcto.',
                },
                {
                  verdict: 'Falso ❌',
                  color: 'text-[#9B1C1C]',
                  border: 'border-[#DC2626]',
                  bg: 'bg-[#FEF2F2]',
                  desc: 'La afirmación es factualmente incorrecta según múltiples fuentes primarias. El error es sustancial, no una imprecisión menor.',
                },
                {
                  verdict: 'Engañoso ⚠️',
                  color: 'text-[#92400E]',
                  border: 'border-[#D97706]',
                  bg: 'bg-[#FFFBEB]',
                  desc: 'La afirmación tiene base real pero está presentada de forma que distorsiona la realidad: datos descontextualizados, comparaciones incorrectas, o énfasis que lleva a conclusiones falsas.',
                },
                {
                  verdict: 'Necesita contexto 📋',
                  color: 'text-[#1A56A0]',
                  border: 'border-[#1A56A0]',
                  bg: 'bg-[#EEF4FF]',
                  desc: 'El dato es correcto pero incompleto. Sin el contexto adecuado, el dato puede ser interpretado de forma errónea.',
                },
                {
                  verdict: 'No verificable ❓',
                  color: 'text-[#4B5563]',
                  border: 'border-[#9CA3AF]',
                  bg: 'bg-[#F9FAFB]',
                  desc: 'No existen fuentes suficientes para confirmar o desmentir la afirmación. Puede ser verdadera o falsa, pero no podemos determinarlo con la evidencia disponible.',
                },
              ].map(item => (
                <div key={item.verdict} className={`border rounded-lg p-4 ${item.border} ${item.bg}`}>
                  <div className={`font-semibold mb-1 ${item.color}`}>{item.verdict}</div>
                  <p className="text-[#777777] text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Fuentes primarias */}
          <section>
            <h2 className="text-2xl font-bold text-[#111111] mb-4 flex items-center gap-2">
              <span>📚</span> Fuentes primarias
            </h2>
            <p className="text-[#777777] mb-4">
              Priorizamos fuentes oficiales peruanas e internacionales reconocidas:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: 'INEI', desc: 'Instituto Nacional de Estadística e Informática', url: 'https://www.inei.gob.pe' },
                { name: 'ONPE', desc: 'Oficina Nacional de Procesos Electorales', url: 'https://www.onpe.gob.pe' },
                { name: 'JNE', desc: 'Jurado Nacional de Elecciones', url: 'https://www.jne.gob.pe' },
                { name: 'BCRP', desc: 'Banco Central de Reserva del Perú', url: 'https://www.bcrp.gob.pe' },
                { name: 'MEF', desc: 'Ministerio de Economía y Finanzas', url: 'https://www.mef.gob.pe' },
                { name: 'Contraloría', desc: 'Contraloría General de la República', url: 'https://www.contraloria.gob.pe' },
              ].map(s => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 bg-[#F7F6F3] border border-[#E5E3DE] rounded-lg p-3 hover:border-[#1A56A0]/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#EEF4FF] border border-[#1A56A0]/30 flex items-center justify-center text-[#1A56A0] text-xs font-bold flex-shrink-0">
                    {s.name[0]}
                  </div>
                  <div>
                    <div className="text-[#111111] text-sm font-medium">{s.name}</div>
                    <div className="text-[#777777] text-xs">{s.desc}</div>
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* Transparencia del equipo */}
          <section>
            <h2 className="text-2xl font-bold text-[#111111] mb-4 flex items-center gap-2">
              <span>👥</span> Transparencia del equipo
            </h2>
            <div className="bg-[#F7F6F3] border border-[#E5E3DE] rounded-xl p-6">
              <p className="text-[#777777] leading-relaxed mb-4">
                VotoAbierto es un proyecto voluntario e independiente, desarrollado sin financiamiento de partidos políticos, candidatos o entidades gubernamentales. Las verificaciones son realizadas con asistencia de inteligencia artificial y revisadas manualmente.
              </p>
              <p className="text-[#777777] leading-relaxed mb-4">
                Si encuentras un error en una verificación, contáctanos. Publicamos correcciones con transparencia, incluyendo qué cambió y por qué.
              </p>
              <p className="text-[#777777] text-sm">
                Las verificaciones tienen fecha de publicación. Los hechos políticos cambian — siempre indicamos cuándo se verificó cada afirmación.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
