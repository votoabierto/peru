'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { href: '/candidatos', label: 'Candidatos' },
  { href: '/regiones', label: 'Regiones' },
  { href: '/comparar', label: 'Comparar' },
  { href: '/verificar', label: 'Verificar' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-votoclaro-surface border-b border-votoclaro-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xl font-bold text-votoclaro-gold tracking-tight">
              VotoClaro
            </span>
            <span className="hidden sm:inline-block text-xs text-votoclaro-text-muted font-medium uppercase tracking-widest border border-votoclaro-border rounded px-1.5 py-0.5">
              Perú 2026
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-votoclaro-text-muted hover:text-votoclaro-gold hover:bg-votoclaro-surface-2 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-votoclaro-text-muted hover:text-votoclaro-gold hover:bg-votoclaro-surface-2 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Abrir menú"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-votoclaro-border bg-votoclaro-surface">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2.5 text-sm font-medium text-votoclaro-text-muted hover:text-votoclaro-gold hover:bg-votoclaro-surface-2 rounded-lg transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
