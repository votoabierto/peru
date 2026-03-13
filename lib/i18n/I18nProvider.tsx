'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { t as translate, type Locale } from './index'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextType>({
  locale: 'es',
  setLocale: () => {},
  t: (key) => key,
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('es')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('va-locale') as Locale | null
    if (saved === 'es' || saved === 'qu') setLocaleState(saved)
    // Clear any stale simple-mode flag from localStorage
    localStorage.removeItem('va-simple')
    document.documentElement.classList.remove('simple-mode')
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    document.documentElement.lang = locale === 'qu' ? 'qu' : 'es'
  }, [locale, mounted])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    localStorage.setItem('va-locale', l)
  }, [])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(key, locale, params),
    [locale],
  )

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
