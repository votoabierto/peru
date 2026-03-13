import { NextResponse } from 'next/server'

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'VotoAbierto Public API',
    version: '1.0.0',
    description: 'API pública con datos oficiales de candidatos para las Elecciones Generales del Perú 2026. Datos del JNE (Jurado Nacional de Elecciones). Sin autenticación requerida. Rate limit: 60 solicitudes/minuto por IP.',
    license: { name: 'MIT', url: 'https://opensource.org/licenses/MIT' },
    contact: { email: 'api@votoabierto.org', url: 'https://votoabierto.org/datos' },
  },
  servers: [
    { url: 'https://votoabierto.org', description: 'Production' },
  ],
  paths: {
    '/api/v1/candidates': {
      get: {
        summary: 'Lista de candidatos presidenciales',
        description: 'Retorna los 36 candidatos presidenciales inscritos. Soporta filtro por partido y búsqueda por nombre.',
        parameters: [
          { name: 'party', in: 'query', schema: { type: 'string' }, description: 'Filtrar por party_id o abreviatura (ej: fuerza-popular, FP)', example: 'fuerza-popular' },
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Búsqueda por nombre o partido', example: 'keiko' },
        ],
        responses: {
          '200': {
            description: 'Lista de candidatos',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CandidateListResponse' } } },
          },
          '429': { description: 'Rate limit excedido (60 req/min). Incluye header Retry-After con segundos de espera.' },
        },
      },
    },
    '/api/v1/candidates/{id}': {
      get: {
        summary: 'Detalle de candidato presidencial',
        description: 'Retorna perfil completo incluyendo plan de gobierno, antecedentes, bienes declarados y títulos académicos.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID o slug del candidato', example: 'keiko-fujimori' },
        ],
        responses: {
          '200': { description: 'Detalle del candidato', content: { 'application/json': { schema: { $ref: '#/components/schemas/CandidateDetailResponse' } } } },
          '404': { description: 'Candidato no encontrado' },
          '429': { description: 'Rate limit excedido. Incluye header Retry-After.' },
        },
      },
    },
    '/api/v1/parties': {
      get: {
        summary: 'Lista de partidos políticos',
        description: 'Retorna todos los partidos inscritos con su color, espectro ideológico y candidato presidencial.',
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Búsqueda por nombre o abreviatura', example: 'fuerza' },
        ],
        responses: {
          '200': { description: 'Lista de partidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/PartyListResponse' } } } },
          '429': { description: 'Rate limit excedido. Incluye header Retry-After.' },
        },
      },
    },
    '/api/v1/parties/{id}': {
      get: {
        summary: 'Detalle de partido político',
        description: 'Retorna detalle de un partido por ID o abreviatura.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del partido o abreviatura', example: 'fuerza-popular' },
        ],
        responses: {
          '200': { description: 'Detalle del partido', content: { 'application/json': { schema: { $ref: '#/components/schemas/PartyDetailResponse' } } } },
          '404': { description: 'Partido no encontrado' },
          '429': { description: 'Rate limit excedido. Incluye header Retry-After.' },
        },
      },
    },
    '/api/v1/senate': {
      get: {
        summary: 'Candidatos al Senado',
        description: 'Retorna los 1,131 candidatos al Senado. Soporta paginación, filtro por partido y búsqueda.',
        parameters: [
          { name: 'party', in: 'query', schema: { type: 'string' }, description: 'Filtrar por partyId o nombre del partido' },
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Búsqueda por nombre' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 100, maximum: 500 }, description: 'Cantidad por página (máx 500)' },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 }, description: 'Desplazamiento para paginación' },
        ],
        responses: {
          '200': { description: 'Lista paginada de senadores', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedCongressResponse' } } } },
          '429': { description: 'Rate limit excedido. Incluye header Retry-After.' },
        },
      },
    },
    '/api/v1/diputados': {
      get: {
        summary: 'Candidatos a Diputados',
        description: 'Retorna los 4,106 candidatos a la Cámara de Diputados. Soporta filtro por distrito, partido, búsqueda y paginación.',
        parameters: [
          { name: 'district', in: 'query', schema: { type: 'string' }, description: 'Filtrar por distrito electoral (ej: Lima)', example: 'Lima' },
          { name: 'party', in: 'query', schema: { type: 'string' }, description: 'Filtrar por partyId o nombre del partido' },
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Búsqueda por nombre' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 100, maximum: 500 }, description: 'Cantidad por página (máx 500)' },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 }, description: 'Desplazamiento para paginación' },
        ],
        responses: {
          '200': { description: 'Lista paginada de diputados', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedCongressResponse' } } } },
          '429': { description: 'Rate limit excedido. Incluye header Retry-After.' },
        },
      },
    },
    '/api/v1/andino': {
      get: {
        summary: 'Candidatos al Parlamento Andino',
        description: 'Retorna los 528 candidatos al Parlamento Andino. Soporta filtro por partido, búsqueda y paginación.',
        parameters: [
          { name: 'party', in: 'query', schema: { type: 'string' }, description: 'Filtrar por partyId o nombre del partido' },
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Búsqueda por nombre' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 100, maximum: 500 }, description: 'Cantidad por página (máx 500)' },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 }, description: 'Desplazamiento para paginación' },
        ],
        responses: {
          '200': { description: 'Lista paginada de candidatos andinos', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedCongressResponse' } } } },
          '429': { description: 'Rate limit excedido. Incluye header Retry-After.' },
        },
      },
    },
  },
  components: {
    schemas: {
      CandidateListResponse: {
        type: 'object',
        properties: {
          total: { type: 'integer' },
          election_type: { type: 'string', example: 'presidente' },
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'keiko-fujimori' },
                slug: { type: 'string', example: 'keiko-fujimori' },
                full_name: { type: 'string', example: 'Keiko Fujimori Higuchi' },
                party_id: { type: 'string' },
                party_name: { type: 'string' },
                party_abbreviation: { type: 'string' },
                photo_url: { type: 'string', nullable: true },
                bio_short: { type: 'string', nullable: true },
                jne_ocupacion: { type: 'array', items: { type: 'string' }, nullable: true },
                jne_url_plan: { type: 'string', nullable: true },
                has_criminal_record: { type: 'boolean' },
                data_confidence: { type: 'string', enum: ['official', 'scraped', 'community', 'pending'] },
                jne_profile_url: { type: 'string', nullable: true },
              },
            },
          },
        },
      },
      CandidateDetailResponse: {
        type: 'object',
        properties: {
          election_type: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'keiko-fujimori' },
              slug: { type: 'string' },
              full_name: { type: 'string' },
              party_id: { type: 'string' },
              party_name: { type: 'string' },
              party_abbreviation: { type: 'string' },
              photo_url: { type: 'string', nullable: true },
              bio_short: { type: 'string', nullable: true },
              career_summary: { type: 'string', nullable: true },
              jne_ocupacion: { type: 'array', items: { type: 'string' }, nullable: true },
              jne_url_plan: { type: 'string', nullable: true },
              jne_profile_url: { type: 'string', nullable: true },
              jne_titulos_academicos: { type: 'array', items: { type: 'string' }, nullable: true },
              jne_bienes: { type: 'object', nullable: true },
              has_criminal_record: { type: 'boolean' },
              sentencia_penal: { type: 'string', nullable: true },
              sentencia_penal_detalle: { type: 'array', nullable: true },
              planGobiernoResumen: { type: 'string', nullable: true },
              planGobiernoEjes: { type: 'array', items: { type: 'object', properties: { eje: { type: 'string' }, descripcion: { type: 'string' } } }, nullable: true },
              proposals: { type: 'array', items: { type: 'string' }, nullable: true },
              social_media: { type: 'object', nullable: true },
              data_confidence: { type: 'string', enum: ['official', 'scraped', 'community', 'pending'] },
              updated_at: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
      PartyListResponse: {
        type: 'object',
        properties: {
          total: { type: 'integer' },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Party' },
          },
        },
      },
      PartyDetailResponse: {
        type: 'object',
        properties: {
          data: { $ref: '#/components/schemas/Party' },
        },
      },
      Party: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'fuerza-popular' },
          name: { type: 'string', example: 'Fuerza Popular' },
          abbr: { type: 'string', example: 'FP' },
          color: { type: 'string', example: '#FF6B00' },
          ideological_family: { type: 'string', nullable: true },
          spectrum: { type: 'string', nullable: true },
          presidentCandidate: { type: 'string', nullable: true },
        },
      },
      PaginatedCongressResponse: {
        type: 'object',
        properties: {
          total: { type: 'integer' },
          limit: { type: 'integer' },
          offset: { type: 'integer' },
          election_type: { type: 'string', enum: ['senado', 'diputados', 'parlamento-andino'] },
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                party: { type: 'string' },
                partyId: { type: 'string' },
                listPosition: { type: 'integer' },
                imageUrl: { type: 'string', nullable: true },
                electionType: { type: 'string' },
                district: { type: 'string', nullable: true, description: 'Solo presente para diputados' },
              },
            },
          },
        },
      },
    },
  },
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(spec, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=86400',
      'Content-Type': 'application/json',
    },
  })
}
