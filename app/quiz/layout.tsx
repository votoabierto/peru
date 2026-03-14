import type { Metadata } from 'next'
import { QUIZ_QUESTION_COUNT } from '@/lib/quiz-config'

export const metadata: Metadata = {
  title: '¿Con quién votas? — Quiz de afinidad electoral | VotoAbierto',
  description:
    `Descubre con qué candidato presidencial coincides más. Responde ${QUIZ_QUESTION_COUNT} preguntas sobre los temas que más importan en las elecciones peruanas del 12 de abril 2026.`,
  keywords: [
    'quiz electoral peru 2026',
    'con quien votas',
    'afinidad candidatos',
    'elecciones peru 2026',
    'test electoral',
  ],
  openGraph: {
    title: '¿Con quién votas? — Quiz Electoral | VotoAbierto',
    description:
      `Responde ${QUIZ_QUESTION_COUNT} preguntas y descubre qué candidatos presidenciales comparten tus ideas. Anónimo, sin registro.`,
    url: 'https://votoabierto.pe/quiz',
  },
  alternates: { canonical: 'https://votoabierto.pe/quiz' },
}

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo funciona el quiz de afinidad electoral?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Respondes ${QUIZ_QUESTION_COUNT} preguntas sobre temas clave como economía, seguridad, educación y corrupción. Comparamos tus respuestas con las posiciones declaradas de los candidatos en sus planes de gobierno oficiales (JNE) para calcular tu porcentaje de afinidad.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Es anónimo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, no recopilamos ningún dato personal. No necesitas registrarte ni crear una cuenta. Tus respuestas no se guardan.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo son las elecciones en Perú 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las elecciones generales del Perú son el 12 de abril de 2026. Se eligen presidente, 60 senadores, 130 diputados y 5 parlamentarios andinos.',
      },
    },
  ],
}

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      {children}
    </>
  )
}
