import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sin conexion — VotoAbierto',
}

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6" aria-hidden="true">
          📡
        </div>
        <h1 className="text-2xl font-bold text-[#111111] mb-3">
          Sin conexion
        </h1>
        <p className="text-[#777777] mb-6">
          No tienes conexion a internet. Los candidatos que ya visitaste
          estan disponibles sin conexion.
        </p>
        <Link
          href="/candidatos"
          className="btn-primary inline-block"
        >
          Ver candidatos guardados
        </Link>
      </div>
    </div>
  )
}
