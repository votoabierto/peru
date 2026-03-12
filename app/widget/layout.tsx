import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'VotoAbierto Widget',
  robots: 'noindex, nofollow',
}

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="font-sans antialiased bg-white m-0 p-0">
        {children}
      </body>
    </html>
  )
}
