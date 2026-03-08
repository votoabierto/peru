import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-votoclaro-surface border-t border-votoclaro-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <p className="text-xl font-bold text-votoclaro-gold mb-2">VotoClaro</p>
            <p className="text-sm text-votoclaro-text-muted leading-relaxed">
              Vota informado. Plataforma no-partidaria de información electoral
              para las elecciones generales del Perú, 12 de abril de 2026.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-semibold text-votoclaro-text-muted uppercase tracking-wider mb-3">
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
                    className="text-sm text-votoclaro-text-muted hover:text-votoclaro-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Institutional */}
          <div>
            <p className="text-xs font-semibold text-votoclaro-text-muted uppercase tracking-wider mb-3">
              Fuentes oficiales
            </p>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.jne.gob.pe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-votoclaro-text-muted hover:text-votoclaro-gold transition-colors"
                >
                  JNE — Jurado Nacional de Elecciones
                </a>
              </li>
              <li>
                <a
                  href="https://www.onpe.gob.pe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-votoclaro-text-muted hover:text-votoclaro-gold transition-colors"
                >
                  ONPE — Oficina Nacional de Procesos Electorales
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-votoclaro-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-votoclaro-text-muted">
            Información para el ciudadano. Plataforma no-partidaria.
          </p>
          <p className="text-xs text-votoclaro-text-muted">
            Elecciones generales · 12 de abril de 2026
          </p>
        </div>
      </div>
    </footer>
  )
}
