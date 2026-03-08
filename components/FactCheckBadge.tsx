import type { Verdict } from '@/lib/types'
import { VERDICT_LABELS } from '@/lib/types'

export interface FactCheckBadgeProps {
  verdict: Verdict
  size?: 'sm' | 'md' | 'lg'
}

const VERDICT_STYLES: Record<Verdict, string> = {
  true: 'bg-green-900/60 border-green-700 text-green-300',
  false: 'bg-red-900/60 border-red-700 text-red-300',
  misleading: 'bg-orange-900/60 border-orange-700 text-orange-300',
  unverifiable: 'bg-gray-700/60 border-gray-600 text-gray-300',
  context_needed: 'bg-blue-900/60 border-blue-700 text-blue-300',
}

const VERDICT_DOT: Record<Verdict, string> = {
  true: 'bg-green-400',
  false: 'bg-red-400',
  misleading: 'bg-orange-400',
  unverifiable: 'bg-gray-400',
  context_needed: 'bg-blue-400',
}

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'text-xs px-2 py-0.5 gap-1.5',
  md: 'text-sm px-3 py-1 gap-2',
  lg: 'text-base px-4 py-1.5 gap-2',
}

const DOT_SIZE: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
}

export default function FactCheckBadge({ verdict, size = 'md' }: FactCheckBadgeProps) {
  const label = VERDICT_LABELS[verdict]
  const style = VERDICT_STYLES[verdict]
  const dotColor = VERDICT_DOT[verdict]
  const sizeClass = SIZE_CLASSES[size]
  const dotSize = DOT_SIZE[size]

  return (
    <span
      className={`inline-flex items-center font-semibold border rounded-full ${style} ${sizeClass}`}
    >
      <span className={`rounded-full flex-shrink-0 ${dotColor} ${dotSize}`} />
      {label}
    </span>
  )
}
