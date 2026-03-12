import type { Metadata } from 'next'
import QuizClient from './QuizClient'

interface Props {
  searchParams: Promise<{ r?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const encoded = params.r

  const baseOg = {
    title: 'Quiz Electoral — VotoAbierto',
    description: 'Descubre qué candidatos presidenciales comparten tu visión. 20 preguntas, 5 minutos, 100% anónimo.',
  }

  if (!encoded) {
    return {
      ...baseOg,
      openGraph: {
        ...baseOg,
        url: 'https://votoabierto.pe/quiz',
        images: ['/api/og/quiz-result'],
      },
      twitter: {
        card: 'summary_large_image',
        ...baseOg,
        images: ['/api/og/quiz-result'],
      },
    }
  }

  return {
    title: 'Mis resultados del Quiz Electoral — VotoAbierto',
    description: 'Mira mis resultados del quiz electoral de VotoAbierto. Descubre tu candidato ideal.',
    openGraph: {
      title: 'Mis resultados del Quiz Electoral — VotoAbierto',
      description: 'Mira mis resultados del quiz electoral y descubre tu candidato ideal.',
      url: `https://votoabierto.pe/quiz?r=${encoded}`,
      images: [`/api/og/quiz-result?r=${encoded}`],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Quiz Electoral — VotoAbierto',
      description: 'Mira mis resultados del quiz electoral y descubre tu candidato ideal.',
      images: [`/api/og/quiz-result?r=${encoded}`],
    },
  }
}

export default function QuizPage() {
  return <QuizClient />
}
