'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function EmbedPage() {
  const [tab, setTab] = useState<'quiz' | 'candidato'>('quiz')
  const [slug, setSlug] = useState('keiko-fujimori')
  const [copiedQuiz, setCopiedQuiz] = useState(false)
  const [copiedCand, setCopiedCand] = useState(false)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://votoabierto.pe'

  const quizEmbed = `<iframe\n  src="${baseUrl}/widget/quiz"\n  width="100%"\n  height="600"\n  frameborder="0"\n  style="border:none;border-radius:12px;max-width:480px;"\n  title="Quiz Electoral VotoAbierto 2026"\n  loading="lazy"\n></iframe>`

  const candidatoEmbed = `<iframe\n  src="${baseUrl}/widget/candidato/${slug}"\n  width="100%"\n  height="480"\n  frameborder="0"\n  style="border:none;border-radius:12px;max-width:400px;"\n  title="Candidato VotoAbierto 2026"\n  loading="lazy"\n></iframe>`

  const copyCode = async (code: string, type: 'quiz' | 'candidato') => {
    await navigator.clipboard.writeText(code)
    if (type === 'quiz') { setCopiedQuiz(true); setTimeout(() => setCopiedQuiz(false), 2000) }
    else { setCopiedCand(true); setTimeout(() => setCopiedCand(false), 2000) }
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-10">
          <p className="text-[#1A56A0] text-sm font-semibold uppercase tracking-widest mb-2">
            Para medios y organizaciones
          </p>
          <h1 className="text-3xl font-bold text-[#111111] mb-3">
            Embeber VotoAbierto en tu sitio
          </h1>
          <p className="text-[#444444] max-w-xl">
            Copia y pega el codigo HTML en tu sitio web para ofrecer a tus lectores
            acceso directo al quiz electoral o a los perfiles de candidatos.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-[#E5E3DE]">
          <button
            onClick={() => setTab('quiz')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === 'quiz' ? 'border-[#1A56A0] text-[#1A56A0]' : 'border-transparent text-[#777777]'
            }`}
          >
            Quiz Electoral
          </button>
          <button
            onClick={() => setTab('candidato')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === 'candidato' ? 'border-[#1A56A0] text-[#1A56A0]' : 'border-transparent text-[#777777]'
            }`}
          >
            Perfil de Candidato
          </button>
        </div>

        {tab === 'quiz' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Code */}
            <div>
              <h2 className="text-lg font-bold text-[#111111] mb-3">Codigo HTML</h2>
              <div className="relative">
                <pre className="bg-[#F7F6F3] border border-[#E5E3DE] rounded-xl p-4 text-xs text-[#444444] overflow-x-auto whitespace-pre-wrap">
                  {quizEmbed}
                </pre>
                <button
                  onClick={() => copyCode(quizEmbed, 'quiz')}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-white border border-[#E5E3DE] rounded-lg text-xs font-medium text-[#444444] hover:border-[#1A56A0] transition-colors"
                >
                  {copiedQuiz ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* Preview */}
            <div>
              <h2 className="text-lg font-bold text-[#111111] mb-3">Vista previa</h2>
              <div className="border border-[#E5E3DE] rounded-xl overflow-hidden" style={{ maxWidth: 480 }}>
                <iframe
                  src="/widget/quiz"
                  width="100%"
                  height="600"
                  style={{ border: 'none' }}
                  title="Quiz Electoral VotoAbierto 2026"
                />
              </div>
            </div>
          </div>
        )}

        {tab === 'candidato' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Code */}
            <div>
              <h2 className="text-lg font-bold text-[#111111] mb-3">Codigo HTML</h2>
              <div className="mb-3">
                <label className="text-xs text-[#777777] mb-1 block">Slug del candidato</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E5E3DE] rounded-lg focus:border-[#1A56A0] outline-none"
                  placeholder="keiko-fujimori"
                />
              </div>
              <div className="relative">
                <pre className="bg-[#F7F6F3] border border-[#E5E3DE] rounded-xl p-4 text-xs text-[#444444] overflow-x-auto whitespace-pre-wrap">
                  {candidatoEmbed}
                </pre>
                <button
                  onClick={() => copyCode(candidatoEmbed, 'candidato')}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-white border border-[#E5E3DE] rounded-lg text-xs font-medium text-[#444444] hover:border-[#1A56A0] transition-colors"
                >
                  {copiedCand ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* Preview */}
            <div>
              <h2 className="text-lg font-bold text-[#111111] mb-3">Vista previa</h2>
              <div className="border border-[#E5E3DE] rounded-xl overflow-hidden" style={{ maxWidth: 400 }}>
                <iframe
                  src={`/widget/candidato/${slug}`}
                  width="100%"
                  height="480"
                  style={{ border: 'none' }}
                  title="Candidato VotoAbierto 2026"
                />
              </div>
            </div>
          </div>
        )}

        {/* Usage guidelines */}
        <div className="mt-12 bg-[#F7F6F3] border border-[#E5E3DE] rounded-xl p-6">
          <h2 className="text-lg font-bold text-[#111111] mb-4">Condiciones de uso</h2>
          <ul className="space-y-2 text-sm text-[#444444]">
            <li className="flex items-start gap-2">
              <span className="text-[#1A56A0] font-bold mt-0.5">1.</span>
              <span><strong>No-partidario:</strong> VotoAbierto es una plataforma informativa imparcial. No debe presentarse como apoyo a ningun candidato.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#1A56A0] font-bold mt-0.5">2.</span>
              <span><strong>Gratuito:</strong> El uso es libre y gratuito para medios, organizaciones civiles y ciudadanos.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#1A56A0] font-bold mt-0.5">3.</span>
              <span><strong>Atribucion:</strong> Por favor mantener la atribucion a VotoAbierto y JNE visible en el widget.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#1A56A0] font-bold mt-0.5">4.</span>
              <span><strong>Datos oficiales:</strong> Toda la informacion proviene de fuentes oficiales del JNE (Jurado Nacional de Elecciones).</span>
            </li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-[#777777]">
            ¿Preguntas sobre integraciones?{' '}
            <Link href="/contribuir" className="text-[#1A56A0] hover:underline">Contactanos</Link>
          </p>
          <p className="text-[10px] text-[#CBCAC5] mt-2">
            Datos: JNE | VotoAbierto es un proyecto ciudadano independiente
          </p>
        </div>
      </div>
    </main>
  )
}
