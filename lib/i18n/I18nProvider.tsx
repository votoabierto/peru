'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { t as translate, type Locale } from './index'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
  isSimple: boolean
  setIsSimple: (v: boolean) => void
}

const I18nContext = createContext<I18nContextType>({
  locale: 'es',
  setLocale: () => {},
  t: (key) => key,
  isSimple: false,
  setIsSimple: () => {},
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('es')
  const [isSimple, setIsSimpleState] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('va-locale') as Locale | null
    if (saved === 'es' || saved === 'qu') setLocaleState(saved)
    const simple = localStorage.getItem('va-simple') === 'true'
    setIsSimpleState(simple)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    document.documentElement.lang = locale === 'qu' ? 'qu' : 'es'
  }, [locale, mounted])

  useEffect(() => {
    if (!mounted) return
    if (isSimple) {
      document.documentElement.classList.add('simple-mode')
    } else {
      document.documentElement.classList.remove('simple-mode')
    }
  }, [isSimple, mounted])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    localStorage.setItem('va-locale', l)
  }, [])

  const setIsSimple = useCallback((v: boolean) => {
    setIsSimpleState(v)
    localStorage.setItem('va-simple', String(v))
  }, [])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      // In simple mode, try simple.* key first (Spanish only)
      if (isSimple && locale === 'es') {
        const simpleKey = `simple.${key}`
        const simpleText = translate(simpleKey, 'es', params)
        if (simpleText !== simpleKey) return simpleText
      }
      return translate(key, locale, params)
    },
    [locale, isSimple],
  )

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isSimple, setIsSimple }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
