# VotoAbierto

**Transparencia electoral para el Peru. Open source, non-partisan.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript)](https://typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-deployed-black?logo=vercel)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<!-- screenshot -->

---

## Que es VotoAbierto?

VotoAbierto es una plataforma de informacion electoral **no-partidaria** para las elecciones generales del Peru del **12 de abril de 2026**. Combatimos la desinformacion electoral poniendo datos verificados sobre candidatos, propuestas y hechos al alcance de todos los votantes peruanos. Construida por ciudadanos, para ciudadanos.

> 67% de peruanos obtiene informacion politica de WhatsApp y redes sociales. VotoAbierto es la fuente de verdad que van a usar.

---

## Features

- **Perfiles de candidatos** — Todos los candidatos presidenciales, senatoriales y de diputados con datos verificados
- **Comparador** — Compara hasta 3 candidatos lado a lado en temas clave
- **Fact-checking** — Verificacion de claims con veredictos claros (Verdadero / Falso / Enganoso)
- **Por region** — Candidatos y temas por las 24 regiones del Peru
- **Cuenta regresiva** — Dias para el 12 de abril de 2026
- **Tarjetas compartibles** — Disenado para WhatsApp y redes sociales

---

## Tech stack

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL) |
| Deployment | Vercel |
| Font | Noto Sans + IBM Plex Mono |

---

## Project structure

```
votoabierto/
├── app/                    # Next.js App Router pages and API routes
│   ├── page.tsx            # Homepage with countdown and candidate cards
│   ├── candidatos/         # Presidential candidate list and profiles
│   ├── senado/             # Senate candidates
│   ├── diputados/          # House candidates
│   ├── regiones/           # Regional breakdown
│   ├── comparar/           # Side-by-side candidate comparator
│   ├── verificar/          # Fact-check feed
│   └── api/                # API routes (search, candidates, fact-checks)
├── components/             # React components (Navbar, Footer, Cards, etc.)
├── lib/                    # Data fetching, Supabase client, TypeScript types
├── data/                   # JSON data files — edit here to contribute data
│   ├── candidates.json     # Presidential candidates
│   ├── congress.json       # Congressional candidates
│   ├── regions.json        # Regions of Peru
│   ├── fact-checks.json    # Verified claims
│   └── positions.json      # Candidate stances on issues
├── docs/                   # Project documentation
│   ├── ROADMAP.md          # Launch roadmap
│   └── SOURCES.md          # Verified data sources
├── supabase/               # Database migrations
└── scripts/                # Seed scripts for database
```

---

## How to contribute

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide. Three ways to help:

1. **Add data** (no coding needed) — edit JSON files in `data/` and submit a PR
2. **Fix bugs** — check [Issues](https://github.com/votoabierto/votoabierto/issues) for open bugs
3. **Add features** — pick up a feature request or propose your own

---

## Local setup

```bash
# 1. Clone the repo
git clone https://github.com/votoabierto/votoabierto.git
cd votoabierto

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials (optional — app works without them using seed data)

# 4. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app uses seed data from `data/` when Supabase is not configured.

### With Supabase (optional)

1. Create a project at [supabase.com](https://supabase.com)
2. Run migrations in SQL Editor: `supabase/migrations/001_initial.sql` then `002_indexes_and_rls.sql`
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`
4. Seed the database: `SUPABASE_SERVICE_ROLE_KEY=your-key npx tsx scripts/seed-candidates.ts`

---

## Data sources

All data is sourced from official Peruvian electoral authorities and verified media. See [docs/SOURCES.md](docs/SOURCES.md) for the complete list of sources and verification protocol.

---

## License

[MIT](LICENSE) — free to use, modify, and distribute with attribution.

**VotoAbierto no esta afiliado a ningun partido politico, candidato o entidad gubernamental.**
*Construido por ciudadanos, para ciudadanos.*
