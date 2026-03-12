'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n/I18nProvider'

// April 12, 2026 00:00:00 Lima time (UTC-5)
const ELECTION_DATE = new Date('2026-04-12T05:00:00Z')
// April 13, 2026 00:00:00 Lima time — day after
const DAY_AFTER = new Date('2026-04-13T05:00:00Z')

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
      <span className="text-4xl sm:text-5xl md:text-6xl font-bold text-white font-mono tabular-nums leading-none" aria-hidden="true">
        {String(value).padStart(2, '0')}
      </span>
      <span className="mt-2 text-[10px] font-medium text-[#666666] uppercase tracking-widest">
        {label}
      </span>
    </div>
  )
}

function Separator() {
  return (
    <span className="text-[#D91023] text-3xl font-bold mt-1" aria-hidden="true">:</span>
  )
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft())
  const [mounted, setMounted] = useState(false)
  const { t } = useI18n()

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const now = new Date()
  const isPast = now >= DAY_AFTER
  const isElectionDay = now >= ELECTION_DATE && now < DAY_AFTER
  const showDetailed = timeLeft.days < 7 && timeLeft.days > 0

  // Screen reader accessible text
  const srText = t('countdown.remaining', {
    days: timeLeft.days,
    hours: timeLeft.hours,
    minutes: timeLeft.minutes,
  })

  return (
    <div className="bg-[#111111] py-10 px-4" role="timer" aria-label={srText}>
      <div className="max-w-2xl mx-auto text-center">
        {isPast ? (
          <div className="text-xl font-bold text-[#D91023]">
            {t('countdown.past')}
          </div>
        ) : isElectionDay ? (
          <div className="text-2xl font-bold text-[#D91023]">
            {t('countdown.election_day')}
          </div>
        ) : (
          <>
            <p className="text-[#888888] text-xs uppercase tracking-widest mb-4">{t('home.days_left')}</p>

            {showDetailed && mounted && (
              <p className="text-white text-lg font-semibold mb-4">
                {t('countdown.remaining', {
                  days: timeLeft.days,
                  hours: timeLeft.hours,
                  minutes: timeLeft.minutes,
                })}
              </p>
            )}

            <div className="flex justify-center items-end gap-6 md:gap-10">
              {mounted ? (
                <>
                  <TimeUnit value={timeLeft.days} label={t('countdown.days')} />
                  <Separator />
                  <TimeUnit value={timeLeft.hours} label={t('countdown.hours')} />
                  <Separator />
                  <TimeUnit value={timeLeft.minutes} label={t('countdown.minutes')} />
                  <Separator />
                  <TimeUnit value={timeLeft.seconds} label={t('countdown.seconds')} />
                </>
              ) : (
                // Skeleton while not mounted (SSR)
                <>
                  {[t('countdown.days'), t('countdown.hours'), t('countdown.minutes'), t('countdown.seconds')].map((label, i) => (
                    <div key={label} className="flex flex-col items-center">
                      <span className="text-4xl sm:text-5xl md:text-6xl font-bold text-white font-mono tabular-nums leading-none">
                        --
                      </span>
                      <span className="mt-2 text-[10px] font-medium text-[#666666] uppercase tracking-widest">
                        {label}
                      </span>
                      {i < 3 && <span className="text-[#D91023] text-3xl font-bold mt-1 hidden">:</span>}
                    </div>
                  ))}
                </>
              )}
            </div>
          </>
        )}

        {!isPast && !isElectionDay && (
          <p className="text-[#888888] text-sm mt-6">{t('home.for_elections')}</p>
        )}
      </div>
    </div>
  )
}
