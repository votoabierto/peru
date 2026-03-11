import { NextRequest, NextResponse } from 'next/server'
import { getFactChecks } from '@/lib/data'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const candidateId = searchParams.get('candidato') ?? undefined

  try {
    const factChecks = await getFactChecks(candidateId)
    return NextResponse.json({ factChecks, total: factChecks.length })
  } catch (error) {
    console.error('API /verificar error:', error)
    return NextResponse.json(
      { error: 'Error al obtener verificaciones' },
      { status: 500 }
    )
  }
}
