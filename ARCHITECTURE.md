# Arquitectura — VotoAbierto

## Stack

| Componente | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript (strict mode) |
| Estilos | Tailwind CSS v4 |
| Base de datos | Supabase (PostgreSQL) |
| Deploy | Vercel |
| Tipografía | Noto Sans + IBM Plex Mono |
| OG Images | @vercel/og |
| Iconos | lucide-react |

## Estructura de archivos

```
votoclaro/
├── app/                       # Páginas de Next.js (App Router)
│   ├── page.tsx               # Homepage con countdown y stats
│   ├── candidatos/            # Lista y perfiles presidenciales
│   ├── senado/                # Candidatos al senado
│   ├── diputados/             # Candidatos a diputados
│   ├── parlamento-andino/     # Parlamento Andino
│   ├── regiones/              # Desglose por región
│   ├── comparar/              # Comparador lado a lado
│   ├── quiz/                  # Quiz "¿Con quién votas?"
│   ├── verificar/             # Feed de fact-checks
│   ├── buscar/                # Búsqueda
│   ├── contribuir/            # Guía de contribución
│   ├── metodologia/           # Metodología
│   ├── embed/                 # Widget embebible
│   ├── widget/                # Widgets para embed externo
│   ├── admin/                 # Panel de administración
│   └── api/                   # Rutas API (13 endpoints)
├── components/                # Componentes React
│   ├── CandidateProfile/      # 8 componentes de perfil de candidato
│   ├── Comparator/            # 6 componentes del comparador
│   ├── Navbar.tsx             # Navegación con búsqueda
│   ├── Footer.tsx             # Pie de página
│   ├── CountdownTimer.tsx     # Cuenta regresiva al 12 de abril
│   ├── PoliticalCompass.tsx   # Brújula política del quiz
│   ├── ShareButtons.tsx       # Botones para compartir en redes
│   └── ...                    # ~35 componentes en total
├── lib/                       # Tipos, helpers, datos
│   ├── data.ts                # Carga de datos (getCandidates, getFactChecks, etc.)
│   ├── types.ts               # Tipos TypeScript
│   ├── supabase.ts            # Cliente Supabase
│   ├── seed-data.ts           # Datos semilla como fallback
│   ├── congress-data.ts       # Datos del congreso
│   └── regions-data.ts        # Datos regionales
├── data/                      # Archivos JSON (fuente primaria, versionada en git)
├── scripts/                   # Scripts de fetch y seed de datos JNE
├── supabase/                  # Migraciones SQL
├── public/                    # Assets estáticos
└── docs/                      # Documentación del proyecto
```

## Datos: JSON vs Supabase

- **`data/*.json`** — fuente primaria, versionada en git, siempre disponible offline
- **Supabase** — datos adicionales: resultados del quiz, contribuciones de la comunidad
- **Si Supabase no responde, el sitio funciona 100% desde JSON**

El flujo de datos:

```
JNE API ──[scripts/]──▶ data/*.json ──[lib/data.ts]──▶ Componentes React
                                                            │
Supabase ──[lib/supabase.ts]──────────────────────────────▶─┘
```

## Cómo actualizar datos de candidatos

```bash
# 1. Descargar datos frescos de JNE
node scripts/jne-scraper.js

# 2. Enriquecer con hojas de vida
node scripts/fetch-hojas-de-vida.js

# 3. Commit y deploy
git add data/
git commit -m "data: actualización desde JNE [fecha]"
git push  # Vercel redeploy automático
```

## Quiz: cómo funcionan los scores

1. El usuario responde 10 preguntas en escala 1-5 por tema
2. Los candidatos tienen scores por tema extraídos de sus planes de gobierno
3. `score = null` si el candidato no abordó el tema
4. Match % = promedio ponderado de `|user_score - candidate_score|` para temas compartidos verificados
5. Se requiere mínimo 3 temas compartidos verificados para mostrar un porcentaje de match
6. El quiz es 100% anónimo — no se guarda ningún dato identificable

## API Routes

| Ruta | Método | Descripción |
|---|---|---|
| `/api/candidatos` | GET | Lista/busca candidatos |
| `/api/candidatos/[id]` | GET | Detalle de candidato |
| `/api/candidatos/[id]/noticias` | GET | Noticias del candidato |
| `/api/buscar` | GET | Búsqueda full-text |
| `/api/quiz` | POST | Procesa respuestas del quiz |
| `/api/verificar` | GET | Feed de fact-checks |
| `/api/contribuciones` | POST | Envía contribución ciudadana |
| `/api/feedback` | POST | Envía feedback del usuario |
| `/api/og/candidato` | GET | Genera imagen OG de candidato |
| `/api/og/comparar` | GET | Genera imagen OG de comparación |
| `/api/og/quiz-result` | GET | Genera imagen OG de resultado del quiz |
| `/api/embed` | GET | Datos para widget embebible |
| `/api/admin/contribuciones` | GET | Admin: revisa contribuciones |

## PWA y Offline

El sitio funciona como Progressive Web App con Service Worker. La página `/offline` se muestra cuando no hay conexión. Los datos JSON se cachean localmente para acceso offline.
