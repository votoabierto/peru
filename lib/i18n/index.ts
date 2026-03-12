import { es } from './es'
import { qu } from './qu'

export type Locale = 'es' | 'qu'

const translations: Record<Locale, Record<string, string>> = { es, qu }

export function t(key: string, locale: Locale = 'es', params?: Record<string, string | number>): string {
  let text = translations[locale]?.[key] ?? translations.es[key] ?? key
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v))
    }
  }
  return text
}

export { es, qu }
