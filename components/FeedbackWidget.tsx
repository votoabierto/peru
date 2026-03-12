'use client'

import { useState } from 'react'

interface FeedbackWidgetProps {
  candidateSlug?: string
  pageUrl?: string
}

const FEEDBACK_TYPES = [
  { value: 'dato_incorrecto', label: 'Dato incorrecto' },
  { value: 'falta_informacion', label: 'Falta información' },
  { value: 'link_roto', label: 'Link roto' },
  { value: 'other', label: 'Otro' },
] as const

export default function FeedbackWidget({ candidateSlug, pageUrl }: FeedbackWidgetProps) {
  const [open, setOpen] = useState(false)
  const [tipo, setTipo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fuente, setFuente] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!tipo || !descripcion.trim()) return

    setSubmitting(true)
    setError('')

    try {
      const currentUrl = pageUrl ?? (typeof window !== 'undefined' ? window.location.href : '')
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo,
          descripcion: descripcion.trim(),
          fuente_url: fuente.trim() || null,
          page_url: currentUrl,
          candidate_slug: candidateSlug ?? null,
        }),
      })
      if (!res.ok) throw new Error('Error al enviar')
      setDone(true)
    } catch {
      setError('No se pudo enviar. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="border border-[#2D7D46] bg-[#F0FAF4] rounded-xl p-4 text-center">
        <p className="text-sm font-semibold text-[#1A6B35]">Gracias por tu reporte</p>
        <p className="text-xs text-[#4B5563] mt-1">
          Lo revisaremos lo antes posible. Tu contribución ayuda a mejorar la información para todos.
        </p>
      </div>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full border border-[#E5E3DE] rounded-xl p-4 text-left hover:bg-[#F7F6F3] transition-colors"
      >
        <p className="text-sm font-semibold text-[#111111]">
          ¿Algo está incorrecto?
        </p>
        <p className="text-xs text-[#777777] mt-1">
          Ayúdanos a corregir errores o completar información faltante.
        </p>
      </button>
    )
  }

  return (
    <div className="border border-[#E5E3DE] rounded-xl p-5 bg-[#F7F6F3]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#111111] text-sm">Reportar un problema</h3>
        <button
          onClick={() => setOpen(false)}
          className="text-[#777777] hover:text-[#111111] text-xs"
        >
          Cerrar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#444444] mb-1.5">
            ¿Qué encontraste?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {FEEDBACK_TYPES.map((ft) => (
              <button
                key={ft.value}
                type="button"
                onClick={() => setTipo(ft.value)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  tipo === ft.value
                    ? 'bg-[#1A56A0] text-white border-[#1A56A0]'
                    : 'bg-white text-[#444444] border-[#E5E3DE] hover:border-[#1A56A0]'
                }`}
              >
                {ft.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="fb-desc" className="block text-xs font-medium text-[#444444] mb-1.5">
            Descripción
          </label>
          <textarea
            id="fb-desc"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value.slice(0, 300))}
            placeholder="Describe el problema..."
            rows={3}
            className="w-full px-3 py-2 border border-[#E5E3DE] rounded-lg text-sm text-[#222222] placeholder-[#999999] bg-white focus:border-[#1A56A0] outline-none resize-none"
            required
          />
          <p className="text-[10px] text-[#CBCAC5] mt-1 text-right">{descripcion.length}/300</p>
        </div>

        <div>
          <label htmlFor="fb-source" className="block text-xs font-medium text-[#444444] mb-1.5">
            Fuente (opcional)
          </label>
          <input
            id="fb-source"
            type="url"
            value={fuente}
            onChange={(e) => setFuente(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-[#E5E3DE] rounded-lg text-sm text-[#222222] placeholder-[#999999] bg-white focus:border-[#1A56A0] outline-none"
          />
        </div>

        {error && <p className="text-xs text-[#9B1C1C]">{error}</p>}

        <button
          type="submit"
          disabled={!tipo || !descripcion.trim() || submitting}
          className="w-full py-2.5 rounded-lg text-sm font-medium text-white bg-[#1A56A0] hover:bg-[#164A8A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Enviando...' : 'Enviar reporte'}
        </button>

        <p className="text-[10px] text-[#CBCAC5] text-center">
          No se requiere registro. Tu reporte es anónimo.
        </p>
      </form>
    </div>
  )
}
