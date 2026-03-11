'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { SearchModal } from './SearchModal'

const navLinks = [
  { href: '/candidatos', label: 'Presidente' },
  { href: '/senado', label: 'Senado' },
  { href: '/diputados', label: 'Diputados' },
  { href: '/parlamento-andino', label: 'Parlamento Andino' },
  { href: '/comparar', label: 'Comparar' },
  { href: '/verificar', label: 'Verificar' },
  { href: '/congreso', label: 'Congreso' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <nav className="bg-white border-b border-[#E5E3DE] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="border-l-[3px] border-[#D91023] pl-2 text-xl font-bold text-[#111111] tracking-tight">
              VotoAbierto
            </span>
            <span className="hidden sm:inline-block text-xs text-[#777777] font-medium uppercase tracking-widest border border-[#E5E3DE] rounded px-1.5 py-0.5">
              Perú 2026
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-[#444444] hover:text-[#111111] hover:bg-[#F7F6F3] rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search button + mobile menu */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#F7F6F3] border border-[#E5E3DE] rounded-lg text-[#777777] hover:text-[#111111] hover:border-[#1A56A0]/40 transition-colors text-sm"
              aria-label="Buscar"
            >
              <span>🔍</span>
              <span className="hidden sm:inline">Buscar</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white rounded border border-[#E5E3DE] text-xs opacity-60">
                ⌘K
              </kbd>
            </button>
            <button
              className="md:hidden p-2 rounded-lg text-[#444444] hover:text-[#111111] hover:bg-[#F7F6F3] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Abrir menú"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E5E3DE] bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2.5 text-sm font-medium text-[#444444] hover:text-[#111111] hover:bg-[#F7F6F3] rounded-lg transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </nav>
  )
}
