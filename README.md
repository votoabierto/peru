# VotoAbierto

> La plataforma de transparencia electoral más completa del Perú para las elecciones generales del 12 de abril de 2026.

[![Live](https://img.shields.io/badge/Live-votoabierto.org-1A56A0)](https://votoabierto.org)
[![License: MIT](https://img.shields.io/badge/Licencia-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-bienvenidos-brightgreen.svg)](CONTRIBUTING.md)
[![Datos: JNE](https://img.shields.io/badge/Datos-JNE%20oficiales-D91023)](https://www.jne.gob.pe)

---

## Qué es VotoAbierto

VotoAbierto es una plataforma **open source y no partidaria** que reúne datos verificados sobre todos los candidatos a las elecciones generales del Perú 2026: presidente, senadores, diputados y parlamentarios andinos. Combatimos la desinformación electoral poniendo información oficial de fuentes del Estado peruano al alcance de cada votante. Construida por ciudadanos, para ciudadanos.

**Web-only por diseño** — no hay app, no hay instalación, no hay modo offline. Un enlace y funciona.

## Principios

Objetividad absoluta y fuente siempre visible. No fabricamos datos, no editorizamos, no favorecemos a ningún candidato. Si un dato no tiene fuente oficial, no lo mostramos. Más detalle en [PRINCIPLES.md](PRINCIPLES.md).

## Funcionalidades

| Funcionalidad | Descripción |
|---|---|
| Candidatos presidenciales | 36 candidatos con foto JNE, profesión, antecedentes penales, plan de gobierno PDF, hoja de vida |
| Senadores | 1,131 candidatos con perfiles individuales |
| Diputados | 4,106 candidatos con perfiles individuales |
| Parlamento Andino | 528 candidatos con perfiles individuales |
| Quiz de afinidad | 20 preguntas con ponderación de importancia, % de match por candidato, explicación de temas alineados y divergentes |
| Comparar | Comparación lado a lado de candidatos |
| Compromisos ciudadanos | Compromisos cívicos propuestos por la ciudadanía, seguimiento de respuestas de candidatos |
| Registros de cargo público | Historial dialectal de cargos públicos para candidatos que ejercieron funciones |
| API pública | REST API libre en `/api/v1/` — sin autenticación, CORS abierto, rate limit 60/min |
| Data confidence | Badges de confianza por dato: oficial / scraped / community / pending |
| Auto-refresh | GitHub Actions actualiza datos de JNE cada lunes 06:00 UTC |
| Multilingüe | Español (es) + Quechua (qu) |
| Accesibilidad | WCAG 2.1 AA — skip links, contraste, navegación por teclado |

## Datos

| Dato | Fuente | Última actualización | Registros |
|---|---|---|---|
| Candidatos presidenciales | [JNE API](https://votoinformadoia.jne.gob.pe) | marzo 2026 | 36 |
| Senadores | [JNE API](https://votoinformadoia.jne.gob.pe) | marzo 2026 | 1,131 |
| Diputados | [JNE API](https://votoinformadoia.jne.gob.pe) | marzo 2026 | 4,106 |
| Parlamento Andino | [JNE API](https://votoinformadoia.jne.gob.pe) | marzo 2026 | 528 |
| Planes de gobierno | [JNE](https://votoinformadoia.jne.gob.pe) | marzo 2026 | por partido |
| Antecedentes penales | [JNE](https://votoinformadoia.jne.gob.pe) (declarados) | marzo 2026 | por candidato |
| Registros de cargo público | JNE / fuentes oficiales | marzo 2026 | candidatos con historial |
| Compromisos ciudadanos | Comunidad | marzo 2026 | ver data/pledges.json |

Documentación técnica completa de las APIs en [DATA_SOURCES.md](DATA_SOURCES.md).

## Arquitectura

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Next.js 16 │────>│  data/*.json     │<────│  JNE API     │
│  App Router │     │  (git-versionado) │     │  (semanal)   │
└──────┬──────┘     └──────────────────┘     └──────────────┘
       │
       ├───> /api/v1/ (REST API pública)
       │
       └───> Vercel (deploy automático)
```

JSON es la fuente primaria — los datos viven en git, versionados. Más detalle en [ARCHITECTURE.md](ARCHITECTURE.md).

## Desarrollo local

```bash
git clone https://github.com/ApoEsp/votoclaro.git
cd votoclaro
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). La app usa datos de `data/`.

## Data Pipeline

Los datos de candidatos provienen de APIs oficiales del JNE y se actualizan automáticamente cada lunes.

| Fuente | Frecuencia | Método |
|--------|-----------|--------|
| JNE Voto Informado IA | Semanal (lunes 06:00 UTC) | GitHub Actions auto-refresh |
| JNE SROP | Semanal | GitHub Actions auto-refresh |
| Contribuciones comunitarias | Tiempo real | Pull request |

### Refresh manual
```bash
node scripts/jne-scraper.js
node scripts/fetch-hojas-de-vida.js
node scripts/fetch-bienes.js
```

### Verificar frescura de datos
```bash
node scripts/check-data-freshness.mjs
```

## Scripts de datos

| Script | Qué hace |
|---|---|
| `scripts/jne-scraper.js` | Descarga candidatos presidenciales, senadores, diputados y andinos de la API de JNE |
| `scripts/fetch-hojas-de-vida.js` | Obtiene hojas de vida (CV) de los 36 candidatos presidenciales |
| `scripts/fetch-planes-gobierno.js` | Descarga resúmenes de planes de gobierno por partido |
| `scripts/process-planes-gobierno.js` | Procesa y enriquece candidates.json con datos de planes de gobierno |
| `scripts/fetch-social-media.js` | Busca y agrega cuentas oficiales de redes sociales |
| `scripts/export-yaml.mjs` | Exporta datos JSON a YAML para revisión en PRs |
| `scripts/check-data-freshness.mjs` | Verifica frescura de datos locales vs JNE |

## API Pública

VotoAbierto expone sus datos como API REST libre. Sin autenticación, sin clave de API. Rate limit: 60 requests/minuto.

```bash
# Candidatos presidenciales
curl https://votoabierto.org/api/v1/candidates

# Detalle de candidato
curl https://votoabierto.org/api/v1/candidates/keiko-fujimori

# Partido específico
curl https://votoabierto.org/api/v1/parties/party-fp

# Senadores del Partido Aprista
curl "https://votoabierto.org/api/v1/senate?party=partido-aprista"

# Diputados por distrito
curl "https://votoabierto.org/api/v1/diputados?district=Lima&limit=50"

# Parlamento Andino
curl "https://votoabierto.org/api/v1/andino"
```

Endpoints: `/api/v1/candidates`, `/api/v1/parties`, `/api/v1/senate`, `/api/v1/diputados`, `/api/v1/andino`

OpenAPI spec: `https://votoabierto.org/api/v1/openapi.json`

Ver documentación completa: https://votoabierto.org/datos

## Compromisos Ciudadanos

VotoAbierto permite a la ciudadanía proponer compromisos específicos que los candidatos pueden adoptar públicamente. Las respuestas (o silencios) se documentan objetivamente.

Para proponer un nuevo compromiso, [abre un issue](https://github.com/ApoEsp/votoclaro/issues/new?template=pledge.md).

## Contribuir

Por favor lee nuestro [Código de Conducta](CODE_OF_CONDUCT.md) antes de contribuir.

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para la guía completa. Formas de ayudar:

1. **Agregar datos** (sin código) — edita archivos YAML en `data/`, ejecuta `node scripts/export-yaml.mjs`, envía un PR
2. **Proponer un compromiso ciudadano** — abre un issue con la plantilla pledge
3. **Traducir al Quechua** — edita `lib/i18n/qu.ts` y envía un PR
4. **Reportar errores** — usa las [plantillas de Issues](https://github.com/ApoEsp/votoclaro/issues)
5. **Código** — fork, branch, PR. `npm run build` debe pasar sin errores
6. **Usar la API** — construye herramientas cívicas sobre nuestros datos

## Licencia

[MIT](LICENSE) — libre para usar, adaptar y replicar en otras elecciones.

**VotoAbierto no está afiliado a ningún partido político, candidato o entidad gubernamental.**

## Contacto

embed@votoabierto.org
