# Arquitectura — VotoAbierto

## Stack

| Componente | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript (strict mode) |
| Estilos | Tailwind CSS v4 |
| Deploy | Vercel |
| Tipografía | Noto Sans + IBM Plex Mono |
| OG Images | @vercel/og |
| Iconos | lucide-react |
| i18n | Custom I18nProvider (es + qu) |

## Estructura de archivos

```
votoclaro/
├── app/                       # Páginas de Next.js (App Router)
│   ├── page.tsx               # Homepage con countdown, stats y quiz CTA
│   ├── candidatos/            # Lista y perfiles presidenciales
│   ├── senado/                # Candidatos al senado
│   ├── diputados/             # Candidatos a diputados
│   ├── parlamento-andino/     # Parlamento Andino
│   ├── regiones/              # Desglose por región
│   ├── comparar/              # Comparador lado a lado
│   ├── quiz/                  # Quiz de afinidad (13 preguntas, 3 ejes)
│   ├── compromisos/           # Compromisos ciudadanos
│   ├── verificar/             # Feed de fact-checks
│   ├── buscar/                # Búsqueda
│   ├── contribuir/            # Guía de contribución
│   ├── metodologia/           # Metodología
│   ├── embed/                 # Widget embebible
│   ├── widget/                # Widgets para embed externo
│   ├── datos/                 # Documentación de la API pública
│   ├── api/                   # Rutas API internas
│   └── api/v1/                # API REST pública
├── components/                # Componentes React
│   ├── CandidateProfile/      # Componentes de perfil de candidato
│   ├── Comparator/            # Componentes del comparador
│   ├── Navbar.tsx             # Navegación con búsqueda
│   ├── Footer.tsx             # Pie de página
│   ├── DataConfidenceBadge.tsx # Badges de confianza de datos
│   ├── CountdownTimer.tsx     # Cuenta regresiva al 12 de abril
│   ├── PolicyCompass.tsx      # Brújula de política pública (3 ejes)
│   ├── ShareButtons.tsx       # Botones para compartir en redes
│   ├── LanguageSwitcher.tsx   # Selector de idioma (es/qu)
│   └── ...
├── lib/                       # Tipos, helpers, datos
│   ├── data.ts                # Carga de datos (getCandidates, getFactChecks, etc.)
│   ├── types.ts               # Tipos TypeScript
│   ├── i18n/                  # Internacionalización
│   │   ├── I18nProvider.tsx   # Context provider para traducciones
│   │   ├── es.ts              # Traducciones español
│   │   └── qu.ts              # Traducciones quechua
│   ├── congress-data.ts       # Datos del congreso
│   └── regions-data.ts        # Datos regionales
├── data/                      # Archivos JSON (fuente primaria, versionada en git)
├── scripts/                   # Scripts de fetch y seed de datos JNE
├── public/                    # Assets estáticos
├── .github/workflows/         # GitHub Actions (auto-refresh semanal)
└── docs/                      # Documentación del proyecto
```

## Datos: JSON como fuente de verdad

- **`data/*.json`** — fuente primaria, versionada en git
- **`data/*.yaml`** — mirrors de JSON para facilitar revisión de PRs
- **El sitio funciona 100% desde archivos JSON** — no requiere base de datos

```
JNE API ──[scripts/]──> data/*.json ──[lib/data.ts]──> Componentes React
                             │
GitHub Actions ──[semanal]───┘  (auto-refresh cada lunes 06:00 UTC)
```

## API pública `/api/v1/`

REST API libre para desarrolladores y herramientas cívicas.

| Endpoint | Método | Descripción |
|---|---|---|
| `/api/v1/candidates` | GET | Lista candidatos presidenciales |
| `/api/v1/candidates/[slug]` | GET | Detalle de candidato |
| `/api/v1/parties` | GET | Lista partidos políticos |
| `/api/v1/parties/[id]` | GET | Detalle de partido |
| `/api/v1/senate` | GET | Candidatos al senado (filtrable por partido) |
| `/api/v1/diputados` | GET | Candidatos a diputados (filtrable por distrito) |
| `/api/v1/andino` | GET | Candidatos al Parlamento Andino |
| `/api/v1/openapi.json` | GET | Especificación OpenAPI |

### Rate limiting

- 60 requests/minuto por IP
- Respuestas 429 incluyen headers CORS
- Sin autenticación requerida

### CORS

Abierto a cualquier origen — diseñado para consumo desde cualquier sitio web.

## Data Confidence System

El componente `DataConfidenceBadge` muestra el nivel de confianza de cada dato:

| Nivel | Significado |
|---|---|
| `official` | Dato directo de JNE/ONPE/fuente oficial |
| `scraped` | Extraído de portal oficial pero no de API estructurada |
| `community` | Contribuido por la comunidad, verificado editorialmente |
| `pending` | Pendiente de verificación |

## Internacionalización (i18n)

- `I18nProvider` wraps the app, provides `useTranslation()` hook
- Traducciones en `lib/i18n/es.ts` (español) y `lib/i18n/qu.ts` (quechua)
- `LanguageSwitcher` component en el Navbar
- Quechua translations cover navigation, quiz, and key UI labels

## Compromisos Ciudadanos

- Datos en `data/pledges.json`
- Rutas: `/compromisos` (lista) y `/compromisos/[id]` (detalle)
- Ciudadanos proponen compromisos via GitHub Issues (plantilla pledge)
- Candidatos pueden responder — respuestas se documentan objetivamente
- Silencio también se documenta

## Registros de cargo público

- Datos en `data/public-office-records.json`
- Integrados en las páginas de perfil presidencial
- Muestran historial de cargos para candidatos que ejercieron funciones públicas

## Quiz de afinidad

1. 13 preguntas en 3 ejes temáticos (Económico, Social, Institucional)
2. Cada pregunta tiene `axis`, `axis_inverted`, y `axis_weight` (calculado por desviación estándar de respuestas de candidatos)
3. Ponderación de importancia por eje temático
4. Match % por candidato basado en posiciones extraídas de planes de gobierno
5. PolicyCompass: visualización en 3 dimensiones (economic × social × institutions)
6. Filtro por departamento: candidatos presidenciales siempre visibles, candidatos al congreso filtrados por departamento del votante
7. Resultados compartibles (URL + OG image)

### Datos del quiz

- `data/issues.json` — 13 preguntas con `axis`, `axis_inverted`, `axis_weight` por pregunta
- `data/candidate-positions.json` — posiciones de candidatos con `axis_scores` (economic, social, institutions) + `role` + `department`

## API Routes (internas)

| Ruta | Método | Descripción |
|---|---|---|
| `/api/candidatos` | GET | Lista/busca candidatos |
| `/api/candidatos/[id]` | GET | Detalle de candidato |
| `/api/buscar` | GET | Búsqueda full-text |
| `/api/quiz` | POST | Procesa respuestas del quiz |
| `/api/verificar` | GET | Feed de fact-checks |
| `/api/feedback` | POST | Envía feedback del usuario |
| `/api/og/candidato` | GET | Genera imagen OG de candidato |
| `/api/og/comparar` | GET | Genera imagen OG de comparación |
| `/api/og/quiz-result` | GET | Genera imagen OG de resultado del quiz |
| `/api/embed` | GET | Datos para widget embebible |

## Wave History

| Wave | Qué se construyó |
|------|---|
| A | SEO — Schema.org, sitemap, FAQ |
| B | PWA (removido en Wave Q) |
| C | Political compass + mejora del quiz |
| D | Share buttons (WhatsApp/X icon-only) |
| E | Quechua + WCAG 2.1 AA |
| F | Antecedentes penales + bienes + hoja de vida |
| G | Quiz topic expansion + political compass |
| H | OSS docs — README, ARCHITECTURE, CONTRIBUTING |
| I | Perfiles individuales de congreso (Senado, Diputados, Andino) |
| J | Dead code cleanup |
| K | Data confidence markers + YAML export + CoC |
| L | Auto-refresh pipeline (GitHub Actions) |
| M | API pública /api/v1/ + OpenAPI |
| N | Compromisos ciudadanos |
| O | Data audit — party refs, bios, null-safety |
| P | Quiz match explanation, registros de cargo público, Quechua content, quiz prominence |
| Q | PWA killed + dead code cleanup + full docs update |
| R-T | Quiz redesign: 3-axis model, PolicyCompass, axis_weight by std dev, keyboard navigation |
| U | Department filter + OSS launch docs |
