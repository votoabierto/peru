'use client'

import { useState, useEffect, useCallback } from 'react'

interface Contribution {
  id: string
  candidate_id: string
  candidate_name: string
  contribution_type: string
  content: string
  source_url: string | null
  contributor_email: string | null
  status: string
  reviewer_note: string | null
  created_at: string
  reviewed_at: string | null
}

const TYPE_LABELS: Record<string, string> = {
  fact_correction: '📰 Corrección de datos',
  new_proposal: '📋 Propuesta',
  criminal_record: '⚖️ Antecedente legal',
  government_plan: '📄 Plan de Gobierno',
  social_media: '📱 Redes Sociales',
  news_article: '📰 Noticia',
  other: '💬 Otro',
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
}

export default function AdminContribuciones() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [loading, setLoading] = useState(false)

  const fetchContributions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/contribuciones')
      if (res.status === 401) {
        setAuthenticated(false)
        return
      }
      const data = await res.json()
      setContributions(data.contributions || [])
      setAuthenticated(true)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContributions()
  }, [fetchContributions])

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoginError('')
    const res = await fetch('/api/admin/contribuciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', password }),
    })
    if (res.ok) {
      setAuthenticated(true)
      fetchContributions()
    } else {
      const data = await res.json()
      setLoginError(data.error || 'Error de autenticación')
    }
  }

  async function handleAction(id: string, action: 'approve' | 'reject') {
    const res = await fetch('/api/admin/contribuciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, id }),
    })
    if (res.ok) {
      fetchContributions()
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F6F3]">
        <form onSubmit={handleLogin} className="bg-white border border-[#E5E3DE] rounded-xl p-8 w-full max-w-sm shadow-sm">
          <h1 className="text-xl font-bold text-[#111111] mb-4">Admin — Contribuciones</h1>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full px-4 py-3 border border-[#E5E3DE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56A0]/30 focus:border-[#1A56A0] mb-3"
            autoFocus
          />
          {loginError && <p className="text-red-600 text-sm mb-3">{loginError}</p>}
          <button type="submit" className="w-full py-2.5 bg-[#1A56A0] text-white rounded-lg text-sm font-medium hover:bg-[#154A8A] transition-colors">
            Entrar
          </button>
        </form>
      </div>
    )
  }

  const filtered = filter === 'all' ? contributions : contributions.filter(c => c.status === filter)

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#111111]">Contribuciones</h1>
        <div className="flex gap-1 text-sm">
          {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${filter === f ? 'bg-[#1A56A0] text-white' : 'text-[#444444] hover:bg-[#F7F6F3]'}`}
            >
              {f === 'pending' ? 'Pendientes' : f === 'approved' ? 'Aprobadas' : f === 'rejected' ? 'Rechazadas' : 'Todas'}
              {f !== 'all' && ` (${contributions.filter(c => c.status === f).length})`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-[#777777] text-center py-12">Cargando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-[#777777] text-center py-12">No hay contribuciones {filter !== 'all' ? `con estado "${filter}"` : ''}</p>
      ) : (
        <div className="space-y-4">
          {filtered.map(c => (
            <div key={c.id} className="border border-[#E5E3DE] rounded-xl p-5 bg-white">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <span className="font-semibold text-[#111111] text-sm">{c.candidate_name}</span>
                  <span className="mx-2 text-[#E5E3DE]">·</span>
                  <span className="text-sm text-[#666666]">{TYPE_LABELS[c.contribution_type] || c.contribution_type}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded border ${STATUS_STYLES[c.status] || ''}`}>
                  {c.status}
                </span>
              </div>

              <p className="text-sm text-[#333333] whitespace-pre-wrap mb-3">{c.content}</p>

              {c.source_url && (
                <a href={c.source_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#1A56A0] hover:underline break-all block mb-2">
                  {c.source_url}
                </a>
              )}

              <div className="flex items-center justify-between text-xs text-[#999999] mt-3 pt-3 border-t border-[#F0EFEC]">
                <span>{new Date(c.created_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                {c.contributor_email && <span>{c.contributor_email}</span>}
              </div>

              {c.status === 'pending' && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleAction(c.id, 'approve')}
                    className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => handleAction(c.id, 'reject')}
                    className="px-4 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    Rechazar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
