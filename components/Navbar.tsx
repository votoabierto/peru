'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { SearchModal } from './SearchModal'
import LanguageSwitcher from './LanguageSwitcher'
import SimpleLanguageToggle from './SimpleLanguageToggle'
import { useI18n } from '@/lib/i18n/I18nProvider'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { t } = useI18n()

  const navLinks = [
    { href: '/candidatos', label: t('nav.candidates') },
    { href: '/senado', label: t('nav.senate') },
    { href: '/diputados', label: t('nav.deputies') },
    { href: '/parlamento-andino', label: t('nav.andean') },
    { href: '/comparar', label: t('nav.compare') },
    { href: '/verificar', label: t('nav.verify') },
    { href: '/congreso', label: t('nav.congress') },
    { href: '/contribuir', label: t('nav.contribute') },
    { href: '/quiz', label: t('nav.quiz'), highlight: true },
  ] as const

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
    <>
      {/* Peru flag bar */}
      <div className="h-1 bg-gradient-to-r from-[#D91023] via-[#FFFFFF] to-[#D91023]" aria-hidden="true" />

      <nav className="bg-white border-b border-[#E5E3DE] sticky top-0 z-50" aria-label="Navegación principal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 focus:outline-2 focus:outline-[#1A56A0] focus:outline-offset-2 rounded-lg">
              <span className="text-[#D91023] text-xl" aria-hidden="true">🗳️</span>
              <span className="font-bold text-[#111111] text-lg">Voto<span className="text-[#D91023]">Abierto</span></span>
              <span className="hidden sm:inline-block text-xs text-[#555555] font-medium uppercase tracking-widest border border-[#E5E3DE] rounded px-1.5 py-0.5">
                Perú 2026
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    'highlight' in link && link.highlight
                      ? 'px-4 py-2 text-sm font-semibold text-[#1A56A0] hover:bg-[#EEF4FF] rounded-lg transition-colors focus:outline-2 focus:outline-[#1A56A0] focus:outline-offset-2'
                      : 'px-4 py-2 text-sm font-medium text-[#444444] hover:text-[#111111] hover:bg-[#F7F6F3] rounded-lg transition-colors focus:outline-2 focus:outline-[#1A56A0] focus:outline-offset-2'
                  }
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side: language switcher, simple toggle, search, mobile menu */}
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-1">
                <LanguageSwitcher />
                <span className="text-[#E5E3DE]" aria-hidden="true">|</span>
                <SimpleLanguageToggle />
              </div>
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#F7F6F3] border border-[#E5E3DE] rounded-lg text-[#555555] hover:text-[#111111] hover:border-[#1A56A0]/40 transition-colors text-sm focus:outline-2 focus:outline-[#1A56A0] focus:outline-offset-2"
                aria-label={t('nav.search')}
              >
                <span aria-hidden="true">🔍</span>
                <span className="hidden sm:inline">{t('nav.search')}</span>
                <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white rounded border border-[#E5E3DE] text-xs opacity-60">
                  ⌘K
                </kbd>
              </button>
              <button
                className="md:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[#444444] hover:text-[#111111] hover:bg-[#F7F6F3] transition-colors focus:outline-2 focus:outline-[#1A56A0] focus:outline-offset-2"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={mobileOpen}
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
                  className="flex items-center px-4 py-3 min-h-[44px] text-sm font-medium text-[#444444] hover:text-[#111111] hover:bg-[#F7F6F3] rounded-lg transition-colors focus:outline-2 focus:outline-[#1A56A0] focus:outline-offset-2"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {/* Language & simple mode in mobile */}
              <div className="flex items-center gap-2 px-4 py-3 border-t border-[#E5E3DE] mt-2 pt-4">
                <LanguageSwitcher />
                <span className="text-[#E5E3DE]" aria-hidden="true">|</span>
                <SimpleLanguageToggle />
              </div>
            </div>
          </div>
        )}

        <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      </nav>
    </>
  )
}
