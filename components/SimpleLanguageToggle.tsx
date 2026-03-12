'use client'

import { useI18n } from '@/lib/i18n/I18nProvider'

export default function SimpleLanguageToggle() {
  const { isSimple, setIsSimple, t } = useI18n()

  return (
    <button
      onClick={() => setIsSimple(!isSimple)}
      className={`px-2 py-1 rounded text-xs transition-colors focus:outline-2 focus:outline-[#1A56A0] focus:outline-offset-2 ${
        isSimple
          ? 'bg-[#D91023] text-white font-medium'
          : 'text-[#555555] hover:text-[#D91023] hover:bg-[#FFF0F0]'
      }`}
      aria-pressed={isSimple}
      aria-label={isSimple ? t('a11y.normal_language') : t('a11y.simple_language')}
    >
      {isSimple ? t('a11y.normal_language') : t('a11y.simple_language')}
    </button>
  )
}
