import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#111111] border-t border-[#E5E3DE] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <p className="text-xl font-bold text-white mb-2">VotoAbierto</p>
            <p className="text-sm text-[#AAAAAA] leading-relaxed">
              Vota informado. Plataforma no-partidaria de información electoral
              para las elecciones generales del Perú, 12 de abril de 2026.
            </p>
            <p className="mt-3 text-sm italic text-[#888888]">
              No somos partidarios. Somos ciudadanos.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-semibold text-[#888888] uppercase tracking-wider mb-3">
              Secciones
            </p>
            <ul className="space-y-2">
              {[
                { href: '/candidatos', label: 'Candidatos' },
                { href: '/regiones', label: 'Regiones' },
                { href: '/comparar', label: 'Comparar' },
                { href: '/verificar', label: 'Verificar hechos' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#AAAAAA] hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Institutional */}
          <div>
            <p className="text-xs font-semibold text-[#888888] uppercase tracking-wider mb-3">
              Fuentes oficiales
            </p>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.jne.gob.pe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#AAAAAA] hover:text-white transition-colors"
                >
                  JNE — Jurado Nacional de Elecciones
                </a>
              </li>
              <li>
                <a
                  href="https://www.onpe.gob.pe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#AAAAAA] hover:text-white transition-colors"
                >
                  ONPE — Oficina Nacional de Procesos Electorales
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#333333] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#AAAAAA]">
            Información para el ciudadano. Plataforma no-partidaria.
          </p>
          <p className="text-xs text-[#AAAAAA]">
            Elecciones generales · 12 de abril de 2026
          </p>
        </div>
      </div>
    </footer>
  )
}
