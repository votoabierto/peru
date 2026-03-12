'use client'

import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'va-pwa-dismiss'
const PAGE_COUNT_KEY = 'va-pwa-pages'
const DISMISS_DAYS = 7

function isDismissed(): boolean {
  if (typeof window === 'undefined') return true
  const raw = localStorage.getItem(DISMISS_KEY)
  if (!raw) return false
  const dismissedAt = parseInt(raw, 10)
  const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24)
  return daysSince < DISMISS_DAYS
}

function incrementPageCount(): number {
  if (typeof window === 'undefined') return 0
  const count = parseInt(sessionStorage.getItem(PAGE_COUNT_KEY) || '0', 10) + 1
  sessionStorage.setItem(PAGE_COUNT_KEY, String(count))
  return count
}

export default function PWAInstallPrompt() {
  const [show, setShow] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone)
    setIsStandalone(!!standalone)

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(ios)

    const pageCount = incrementPageCount()

    if (standalone || isDismissed() || pageCount < 2) return

    // On non-iOS, listen for beforeinstallprompt
    if (!ios) {
      const handler = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e as BeforeInstallPromptEvent)
        setShow(true)
      }
      window.addEventListener('beforeinstallprompt', handler)
      return () => window.removeEventListener('beforeinstallprompt', handler)
    } else {
      // On iOS, just show instructions after 2 pages
      setShow(true)
    }
  }, [])

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShow(false)
    }
    setDeferredPrompt(null)
  }, [deferredPrompt])

  const handleDismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setShow(false)
  }, [])

  if (isStandalone || !show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-[#E5E3DE] shadow-lg safe-bottom">
      <div className="max-w-lg mx-auto flex items-center gap-3">
        <div className="flex-1 min-w-0">
          {isIOS ? (
            <p className="text-sm text-[#444444]">
              Instala VotoAbierto: toca{' '}
              <span className="font-semibold">Compartir</span> y luego{' '}
              <span className="font-semibold">Agregar a pantalla de inicio</span>
            </p>
          ) : (
            <p className="text-sm text-[#444444]">
              Instala VotoAbierto para acceder sin internet
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!isIOS && (
            <button
              onClick={handleInstall}
              className="px-4 py-2.5 bg-[#1A56A0] text-white text-sm font-semibold rounded-lg hover:bg-[#0D3E7A] transition-colors min-h-[44px]"
            >
              Instalar
            </button>
          )}
          <button
            onClick={handleDismiss}
            className="px-3 py-2.5 text-sm text-[#777777] hover:text-[#111111] transition-colors min-h-[44px]"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  )
}
