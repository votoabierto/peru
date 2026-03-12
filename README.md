# VotoAbierto 🗳️

> La plataforma de transparencia electoral más completa del Perú para las elecciones generales del 12 de abril de 2026.

[![Live](https://img.shields.io/badge/Live-votoabierto.org-1A56A0)](https://votoabierto.org)
[![License: MIT](https://img.shields.io/badge/Licencia-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-bienvenidos-brightgreen.svg)](CONTRIBUTING.md)
[![Datos: JNE](https://img.shields.io/badge/Datos-JNE%20oficiales-D91023)](https://www.jne.gob.pe)

---

## ¿Qué es VotoAbierto?

VotoAbierto es una plataforma **open source y no partidaria** que reúne datos verificados sobre todos los candidatos a las elecciones generales del Perú 2026: presidente, senadores, diputados y parlamentarios andinos. Combatimos la desinformación electoral poniendo información oficial de fuentes del Estado peruano al alcance de cada votante. Construida por ciudadanos, para ciudadanos.

## Principios

Objetividad absoluta y fuente siempre visible. No fabricamos datos, no editorizamos, no favorecemos a ningún candidato. Si un dato no tiene fuente oficial, no lo mostramos. Más detalle en [PRINCIPLES.md](PRINCIPLES.md).

## Datos

| Dato | Fuente | Última actualización | Registros |
|---|---|---|---|
| Candidatos presidenciales | [JNE API](https://votoinformadoia.jne.gob.pe) | marzo 2026 | 36 |
| Senadores | [JNE API](https://votoinformadoia.jne.gob.pe) | marzo 2026 | 1,131 |
| Diputados | [JNE API](https://votoinformadoia.jne.gob.pe) | marzo 2026 | 4,106 |
| Parlamento Andino | [JNE API](https://votoinformadoia.jne.gob.pe) | marzo 2026 | 528 |
| Planes de gobierno | [JNE](https://votoinformadoia.jne.gob.pe) | marzo 2026 | por partido |
| Antecedentes penales | [JNE](https://votoinformadoia.jne.gob.pe) (declarados) | marzo 2026 | por candidato |

Documentación técnica completa de las APIs en [DATA_SOURCES.md](DATA_SOURCES.md).

## Arquitectura

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Next.js 16 │────▶│  data/*.json     │◀────│  JNE API     │
│  App Router │     │  (git-versionado) │     │  (scraping)  │
└──────┬──────┘     └──────────────────┘     └──────────────┘
       │
       ├───▶ Supabase (quiz results, contribuciones)
       │
       └───▶ Vercel (deploy automático)
```

JSON es la fuente primaria — el sitio funciona 100% offline sin Supabase. Más detalle en [ARCHITECTURE.md](ARCHITECTURE.md).

## Desarrollo local

```bash
git clone https://github.com/votoabierto/peru.git
cd peru
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). La app usa datos de `data/` cuando Supabase no está configurado.

### Con Supabase (opcional)

```bash
cp .env.local.example .env.local
# Edita .env.local con tus credenciales de Supabase
npx tsx scripts/seed-candidates.ts
```

## Data Pipeline

Los datos de candidatos provienen de APIs oficiales del JNE y se actualizan automáticamente.

| Fuente | Frecuencia | Método |
|--------|-----------|--------|
| JNE Voto Informado IA | Semanal | GitHub Actions auto-refresh |
| JNE SROP | Semanal | GitHub Actions auto-refresh |
| Contribuciones comunitarias | Tiempo real | Pull request |

### Refresh manual
```bash
node scripts/fetch-planes-gobierno.js
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
| `scripts/seed-all-data.js` | Siembra todos los datos en Supabase desde archivos locales |
| `scripts/seed-candidates.ts` | Siembra candidatos en Supabase |
| `scripts/seed-parties.ts` | Siembra partidos políticos en Supabase |
| `scripts/reset-and-seed.sh` | Resetea y re-siembra la base de datos completa |

## Contribuir

Por favor lee nuestro [Código de Conducta](CODE_OF_CONDUCT.md) antes de contribuir.

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para la guía completa. Tres formas de ayudar:

1. **Agregar datos** (sin código) — edita archivos JSON en `data/` y envía un PR con fuente
2. **Reportar errores** — usa las [plantillas de Issues](https://github.com/votoabierto/peru/issues)
3. **Código** — fork, branch, PR. `npm run build` debe pasar sin errores

## Licencia

[MIT](LICENSE) — libre para usar, adaptar y replicar en otras elecciones.

**VotoAbierto no está afiliado a ningún partido político, candidato o entidad gubernamental.**

## Contacto

embed@votoabierto.org
