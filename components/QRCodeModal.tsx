'use client'

import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface QRCodeModalProps {
  url: string
  label: string
}

export default function QRCodeModal({ url, label }: QRCodeModalProps) {
  const [open, setOpen] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const fullUrl = typeof window !== 'undefined' && url.startsWith('/')
    ? `${window.location.origin}${url}`
    : url

  useEffect(() => {
    if (open && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, fullUrl, {
        width: 220,
        margin: 2,
        color: { dark: '#111111', light: '#FFFFFF' },
      })
    }
  }, [open, fullUrl])

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F7F6F3] hover:bg-[#EEEDE9] border border-[#E5E3DE] transition-colors"
        aria-label="Mostrar codigo QR"
        title="Codigo QR"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
          <rect x="14" y="14" width="3" height="3"/>
          <line x1="21" y1="14" x2="21" y2="14.01"/>
          <line x1="21" y1="21" x2="21" y2="21.01"/>
          <line x1="17" y1="21" x2="17" y2="21.01"/>
        </svg>
      </button>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-9 h-9 flex items-center justify-center rounded-full bg-[#EEF4FF] border border-[#1A56A0] transition-colors"
        aria-label="Mostrar codigo QR"
        title="Codigo QR"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A56A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
          <rect x="14" y="14" width="3" height="3"/>
          <line x1="21" y1="14" x2="21" y2="14.01"/>
          <line x1="21" y1="21" x2="21" y2="21.01"/>
          <line x1="17" y1="21" x2="17" y2="21.01"/>
        </svg>
      </button>

      {/* Modal overlay */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={() => setOpen(false)}
      >
        <div
          className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center">
            <p className="text-sm font-semibold text-[#111111] mb-1">Escanea para ver el perfil</p>
            <p className="text-xs text-[#777777] mb-4">{label}</p>
            <div className="flex justify-center mb-4">
              <canvas ref={canvasRef} />
            </div>
            <p className="text-[10px] text-[#CBCAC5] mb-4 break-all">{fullUrl}</p>
            <button
              onClick={() => setOpen(false)}
              className="text-sm text-[#777777] hover:text-[#111111] transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
