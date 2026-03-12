import type { Metadata } from 'next'
import QuizWidgetClient from './QuizWidgetClient'

export const metadata: Metadata = {
  title: 'Quiz Electoral — VotoAbierto Widget',
  robots: 'noindex',
}

export default function QuizWidgetPage() {
  return <QuizWidgetClient />
}
