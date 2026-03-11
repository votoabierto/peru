import type { Verdict } from '@/lib/types'
import { VERDICT_LABELS } from '@/lib/types'

export interface FactCheckBadgeProps {
  verdict: Verdict
  size?: 'sm' | 'md' | 'lg'
}

const VERDICT_STYLES: Record<Verdict, string> = {
  true: 'bg-[#F0FAF4] border-[#2D7D46] text-[#1A6B35]',
  false: 'bg-[#FEF2F2] border-[#DC2626] text-[#9B1C1C]',
  misleading: 'bg-[#FFFBEB] border-[#D97706] text-[#92400E]',
  unverifiable: 'bg-[#F9FAFB] border-[#9CA3AF] text-[#4B5563]',
  context_needed: 'bg-[#EEF4FF] border-[#1A56A0] text-[#1A56A0]',
}

const VERDICT_DOT: Record<Verdict, string> = {
  true: 'bg-[#2D7D46]',
  false: 'bg-[#DC2626]',
  misleading: 'bg-[#D97706]',
  unverifiable: 'bg-[#9CA3AF]',
  context_needed: 'bg-[#1A56A0]',
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
