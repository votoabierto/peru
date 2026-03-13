import { NextResponse } from 'next/server'

const CORS = { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=3600' }

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    name: 'VotoAbierto Public API',
    version: '1.0.0',
    description: 'Datos oficiales de candidatos para las Elecciones Generales Perú 2026',
    docs: '/api/v1/openapi.json',
    endpoints: {
      candidates: '/api/v1/candidates',
      parties: '/api/v1/parties',
      senate: '/api/v1/senate',
      diputados: '/api/v1/diputados',
      andino: '/api/v1/andino',
    },
    source: 'JNE — Jurado Nacional de Elecciones',
    license: 'MIT',
    contact: 'api@votoabierto.org',
  }, { headers: CORS })
}
