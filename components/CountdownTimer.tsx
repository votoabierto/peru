'use client'

import { useState, useEffect } from 'react'

// April 12, 2026 00:00:00 Lima time (UTC-5)
const ELECTION_DATE = new Date('2026-04-12T05:00:00Z')

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calculateTimeLeft(): TimeLeft {
  const now = new Date()
  const diff = ELECTION_DATE.getTime() - now.getTime()

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds }
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white border border-[#E5E3DE] rounded-xl px-5 py-4 min-w-[80px] flex items-center justify-center">
        <span className="text-3xl sm:text-4xl font-bold text-[#111111] font-mono tabular-nums leading-none">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="mt-2 text-xs font-medium text-[#888888] uppercase tracking-widest">
        {label}
      </span>
    </div>
  )
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const isElectionDay =
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0

  return (
    <div className="text-center border-t-2 border-[#D91023] pt-6">
      <p className="text-sm font-semibold text-[#1A56A0] uppercase tracking-widest mb-4">
        Elección general · 12 de abril de 2026
      </p>

      {isElectionDay ? (
        <div className="text-2xl font-bold text-[#1A56A0]">
          ¡Hoy es el día de las elecciones!
        </div>
      ) : (
        <div className="flex items-start justify-center gap-4">
          {mounted ? (
            <>
              <TimeUnit value={timeLeft.days} label="Días" />
              <div className="text-2xl font-bold text-[#CBCAC5] mt-4">:</div>
              <TimeUnit value={timeLeft.hours} label="Horas" />
              <div className="text-2xl font-bold text-[#CBCAC5] mt-4">:</div>
              <TimeUnit value={timeLeft.minutes} label="Minutos" />
              <div className="text-2xl font-bold text-[#CBCAC5] mt-4">:</div>
              <TimeUnit value={timeLeft.seconds} label="Segundos" />
            </>
          ) : (
            // Skeleton while not mounted (SSR)
            <>
              {['Días', 'Horas', 'Minutos', 'Segundos'].map((label) => (
                <div key={label} className="flex flex-col items-center">
                  <div className="bg-white border border-[#E5E3DE] rounded-xl px-5 py-4 min-w-[80px] flex items-center justify-center">
                    <span className="text-3xl sm:text-4xl font-bold text-[#111111] font-mono tabular-nums leading-none">
                      --
                    </span>
                  </div>
                  <span className="mt-2 text-xs font-medium text-[#888888] uppercase tracking-widest">
                    {label}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
