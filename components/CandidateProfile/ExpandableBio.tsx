'use client'
import { useState } from 'react'

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^#{1,3}\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
}

interface Props {
  bio: string
}

export function ExpandableBio({ bio }: Props) {
  const [expanded, setExpanded] = useState(false)
  const cleanBio = stripMarkdown(bio)
  const shouldTruncate = cleanBio.length > 400
  const displayText = shouldTruncate && !expanded ? cleanBio.slice(0, 400) + '...' : cleanBio

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
