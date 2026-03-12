'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[VotoAbierto] Error:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-5xl font-bold text-[#D91023] mb-4">Error</h1>
      <p className="text-xl text-[#111111] font-semibold mb-2">
        Algo salió mal.
      </p>
      <p className="text-[#777777] mb-8 max-w-md">
        Estamos trabajando para solucionarlo. Puedes intentar de nuevo o volver al inicio.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-6 py-3 bg-[#1A56A0] text-white rounded-lg font-semibold hover:bg-[#0D3E7A] transition-colors"
        >
          Intentar de nuevo
        </button>
        <Link href="/" className="btn-outline px-6 py-3">
          Volver al inicio
        </Link>
      </div>
      <p className="text-xs text-[#CBCAC5] mt-8">
        Si el problema persiste, escríbenos a{' '}
        <a href="mailto:contacto@votoabierto.pe" className="text-[#1A56A0] hover:underline">
          contacto@votoabierto.pe
        </a>
      </p>
    </div>
  )
}
