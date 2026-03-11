// app/icon.tsx
import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: 'flex',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        {/* Peru flag: red | white | red vertical stripes */}
        <div style={{ flex: 1, backgroundColor: '#D91023' }} />
        <div style={{ flex: 1, backgroundColor: '#FFFFFF' }} />
        <div style={{ flex: 1, backgroundColor: '#D91023' }} />
      </div>
    ),
    { ...size }
  )
}
