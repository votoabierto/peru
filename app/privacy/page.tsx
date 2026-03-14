import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad — VotoAbierto',
  description: 'No almacenamos datos personales. Nunca. Ni siquiera tu IP.',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="text-sm text-[#1A56A0] hover:underline mb-6 inline-block">
          ← Volver al inicio
        </Link>

        <h1 className="text-3xl font-extrabold text-[#111111] mb-2">
          Política de Privacidad
        </h1>
        <p className="text-lg text-[#1A56A0] font-semibold mb-8">
          No almacenamos datos personales. Nunca. Ni siquiera tu IP.
        </p>

        <div className="prose prose-sm max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold text-[#111111] mb-3">¿Qué guardamos del quiz?</h2>
            <p className="text-sm text-[#555555] mb-3">Cuando completas el quiz, guardamos únicamente:</p>
            <ul className="space-y-1.5 text-sm text-[#555555]">
              <li className="flex items-start gap-2"><span className="text-[#1A56A0] mt-0.5">•</span>Tus respuestas a las 13 preguntas (valores numéricos por pregunta)</li>
              <li className="flex items-start gap-2"><span className="text-[#1A56A0] mt-0.5">•</span>Tu puntuación en los 3 ejes: económico, social e instituciones</li>
              <li className="flex items-start gap-2"><span className="text-[#1A56A0] mt-0.5">•</span>El candidato con mayor coincidencia y el porcentaje</li>
              <li className="flex items-start gap-2"><span className="text-[#1A56A0] mt-0.5">•</span>El tiempo que tomaste (para detectar bots — no para identificarte)</li>
              <li className="flex items-start gap-2"><span className="text-[#1A56A0] mt-0.5">•</span>Tu departamento, <strong>solo si lo seleccionaste voluntariamente</strong> (opcional)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111111] mb-3">¿Qué NO guardamos?</h2>
            <ul className="space-y-1.5 text-sm text-[#555555]">
              <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">✗</span>Dirección IP (nunca, en ningún momento)</li>
              <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">✗</span>Nombre, correo, teléfono — nada que te identifique</li>
              <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">✗</span>Cookies de seguimiento</li>
              <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">✗</span>Identificadores de dispositivo o navegador</li>
              <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">✗</span>Historial de navegación</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111111] mb-3">¿Cómo prevenimos duplicados sin guardar IPs?</h2>
            <p className="text-sm text-[#555555] mb-3">
              Para evitar que una misma persona envíe múltiples respuestas, usamos <strong>hash unidireccional</strong>:
            </p>
            <ol className="space-y-2 text-sm text-[#555555] list-decimal list-inside">
              <li>Tu IP llega temporalmente en memoria del servidor (nunca escrita a disco)</li>
              <li>La combinamos con una clave secreta aleatoria conocida solo por nosotros</li>
              <li>Aplicamos SHA-256 — una función matemática que no puede revertirse</li>
              <li>Guardamos solo ese hash, nunca tu IP real</li>
            </ol>
            <p className="text-sm text-[#555555] mt-3 italic">
              Es como tomar una huella dactilar de una huella dactilar — no puedes reconstruir el original.
            </p>
            <p className="text-xs text-[#777777] mt-2">
              Los hashes de deduplicación se eliminan automáticamente a los 30 días.
              Los hashes están en una tabla separada que nunca se cruza con las respuestas del quiz.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111111] mb-3">¿Cuándo se publican los resultados?</h2>
            <p className="text-sm text-[#555555] mb-2">
              Los resultados agregados se publican una vez que tengamos 1,000 respuestas o más.
            </p>
            <p className="text-sm text-[#555555]">
              Los resultados son siempre <strong>agregados</strong>: distribución de ejes, candidatos más elegidos,
              participación por departamento. Nunca mostramos respuestas individuales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111111] mb-3">Código abierto como garantía</h2>
            <p className="text-sm text-[#555555] mb-3">
              Todo el código que maneja tus datos es público y verificable en GitHub:
            </p>
            <ul className="space-y-1 text-sm text-[#555555] font-mono">
              <li>app/api/v1/quiz/submit/route.ts</li>
              <li>app/api/v1/quiz/results/route.ts</li>
              <li>supabase/migrations/011_quiz_responses.sql</li>
            </ul>
          </section>

          <section className="border-t border-[#E5E3DE] pt-6">
            <p className="text-sm text-[#777777]">
              ¿Preguntas sobre privacidad? Abre un issue en GitHub.
            </p>
            <p className="text-xs text-[#999999] mt-4">
              Última actualización: Marzo 2026 · VotoAbierto es un proyecto de código abierto.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
