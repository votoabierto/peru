'use client'

import { useI18n } from '@/lib/i18n/I18nProvider'

interface Props {
  fetchedAt?: string
  jneUrl?: string | null
  className?: string
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function daysSince(dateStr: string): number {
  const d = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
}

export default function DataFreshness({ fetchedAt, jneUrl, className = '' }: Props) {
  const { t } = useI18n()

  if (!fetchedAt) return null

  const stale = daysSince(fetchedAt) > 7

  return (
    <div className={`text-xs text-[#666666] ${className}`}>
      {stale && (
        <span className="text-[#92400E] font-medium mr-1" role="alert">
          ⚠️ {t('data.stale_warning')} —{' '}
        </span>
      )}
      {t('data.updated')}: {formatDate(fetchedAt)}
      {jneUrl && (
        <>
          {' | '}
          <a
            href={jneUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1A56A0] hover:underline"
          >
            {t('data.view_jne')} →
          </a>
        </>
      )}
    </div>
  )
}
