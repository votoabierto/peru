'use client'

import { useI18n } from '@/lib/i18n/I18nProvider'
import type { Locale } from '@/lib/i18n'

const LOCALES: { value: Locale; label: string; flag?: string }[] = [
  { value: 'es', label: 'Español' },
  { value: 'qu', label: 'Quechua' },
]

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()

  return (
    <div className="flex items-center gap-1 text-xs" role="group" aria-label="Idioma">
      {LOCALES.map((l) => (
        <button
          key={l.value}
          onClick={() => setLocale(l.value)}
          className={`px-2 py-1 rounded transition-colors focus:outline-2 focus:outline-[#1A56A0] focus:outline-offset-2 ${
            locale === l.value
              ? 'bg-[#1A56A0] text-white font-medium'
              : 'text-[#555555] hover:text-[#1A56A0] hover:bg-[#EEF4FF]'
          }`}
          aria-pressed={locale === l.value}
          aria-label={`Cambiar idioma a ${l.label}`}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
