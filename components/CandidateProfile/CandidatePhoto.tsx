'use client'

import { useState } from 'react'
import { Candidate } from '@/lib/types'

interface Props {
  candidate: Candidate
}

function getInitials(name: string): string {
  const parts = name.split(' ').filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0]?.[0]?.toUpperCase() ?? '?'
}

export function CandidatePhoto({ candidate }: Props) {
  const [imgError, setImgError] = useState(false)
  const initials = getInitials(candidate.full_name)

  if (candidate.photo_url && !imgError) {
    return (
      <img
        src={candidate.photo_url}
        alt={candidate.full_name}
        className="w-32 h-32 rounded-full object-cover border-4 border-[#E5E3DE]"
        onError={() => setImgError(true)}
      />
    )
  }

  return (
    <div
      className="w-32 h-32 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-[#E5E3DE]"
      style={{ backgroundColor: '#E5E3DE', color: '#777777' }}
    >
      {initials}
    </div>
  )
}
