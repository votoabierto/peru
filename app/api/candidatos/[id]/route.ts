import { NextRequest, NextResponse } from 'next/server'
import { getCandidateById, getPositions, getFactChecks } from '@/lib/data'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params
  try {
    const [candidate, positions, factChecks] = await Promise.all([
      getCandidateById(id),
      getPositions(id),
      getFactChecks(id),
    ])

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidato no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ candidate, positions, factChecks })
  } catch (error) {
    console.error(`API /candidatos/${id} error:`, error)
    return NextResponse.json(
      { error: 'Error al obtener candidato' },
      { status: 500 }
    )
  }
}
