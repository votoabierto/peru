# Changelog

All notable changes to VotoAbierto are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Wave W] — 2026-03-14

### Added
- **Anonymous quiz result storage** — responses stored with zero identity data; SHA-256(IP+salt) dedup table, never joined to responses table; bot speed check silently rejects submissions under 25s
- **Results API** (`/api/v1/quiz/results`) — aggregate stats gated at 1,000 responses; returns top matches and distribution data for research use
- **Privacy page** (`/privacy`) — full anonymization methodology in Spanish, sourcing and retention policy
- **Landing page redesign** — summarized candidate cards with key proposals, dedicated "Cómo Votar" section with official steps and key Peru 2026 dates
- **Rate limiting** — 3 quiz submissions per hour per IP via Edge middleware
- **`PRIVACY.md`** — technical documentation of the anonymization architecture

### Changed
- Quiz results: relative bar scaling — bars proportional to field range, not absolute 0–100%; top candidate fills full bar, others proportional
- Quiz color thresholds: green ≥70% (was ≥80%), yellow ≥50% (was ≥60%) — reflects real candidate score distribution

---

## [Stress Fix R–V] — 2026-03-13

### Fixed
- **P1**: CORS wildcard on quiz submit route replaced with explicit origin allowlist
- **P1**: `dangerouslySetInnerHTML` removed from candidate bio display — replaced with sanitized rendering
- **P1**: `X-Forwarded-For` header injection vulnerability in IP extraction (quiz rate limit)
- **P2**: TypeScript strict null violations in `CandidatosList`, `CandidateHero`, `PolicyCompass`
- **P2**: Missing `key` props in dynamic list renders across 3 components
- **P2**: `useEffect` dependency array gaps in `ComparisonTable`

---

## [Wave V] — 2026-03-13

### Added
- Image optimization: `next/image` with priority loading for candidate photos
- Cache headers: `Cache-Control: public, max-age=86400` on static candidate routes
- 24h ISR cache on all candidate profile pages

---

## [Wave U] — 2026-03-12

### Added
- Congress candidate ISR routes — switched from `generateStaticParams` to on-demand ISR; reduced build output from 740MB to ~15MB

---

## [Wave T] — 2026-03-12

### Added
- **Quiz: importance weighting step** — users rate how much each issue matters (Muy importante / Importante / No tanto); suggested weights auto-calculated from answer strength; final match reflects weighted affinity

---

## [Wave S] — 2026-03-11

### Added
- **Quiz: 13-question policy quiz** — 3 axes (economic, social, institutional); PolicyCompass visualization; match percentage per candidate; "Coinciden / Difieren" issue breakdown per result

---

## [Wave R] — 2026-03-10

### Removed
- Ideology labels ("izquierda", "derecha", "centro") removed from all candidate data, UI, and API responses — permanent rule; VotoAbierto describes policy dimensions, not ideological tribes

---

## [Wave Q] — 2026-03-09

### Removed
- SimpleLanguageToggle and all "Lenguaje simple" functionality removed — permanent rule

---

## Earlier waves (A–P)

Waves A–P covered: schema design, JNE data ingestion, candidate profiles, comparator, regional views, SEO, accessibility (WCAG 2.1 AA), antecedentes penales, fact-check integration, congress candidates (senadores, diputados, parlamento andino), public API v1, widget embeds, sharing (OG images), and data refresh automation.
