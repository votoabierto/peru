'use client'
import { useState } from 'react'

interface Props {
  bio: string
}

export function ExpandableBio({ bio }: Props) {
  const [expanded, setExpanded] = useState(false)
  const shouldTruncate = bio.length > 400
  const displayText = shouldTruncate && !expanded ? bio.slice(0, 400) + '...' : bio

  return (
    <div>
      <p className="text-[#444444] leading-relaxed">{displayText}</p>
      {shouldTruncate && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="mt-2 text-[#1A56A0] text-sm hover:underline"
        >
          {expanded ? 'Leer menos ▲' : 'Leer más ▼'}
        </button>
      )}
    </div>
  )
}
