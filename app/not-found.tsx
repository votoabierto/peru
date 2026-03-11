import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-[#D91023] mb-4">404</h1>
      <p className="text-xl text-[#111111] font-semibold mb-2">
        Esta página no existe.
      </p>
      <p className="text-[#777777] mb-8">
        Como muchas promesas de campaña.
      </p>
      <Link href="/" className="btn-primary">
        Volver al inicio
      </Link>
    </div>
  )
}
