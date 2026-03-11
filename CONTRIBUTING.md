# Contributing to VotoAbierto

Gracias por tu interes en contribuir a VotoAbierto. Cada contribucion ayuda a que mas peruanos tengan acceso a informacion electoral verificada.

---

## Ways to contribute (no coding required)

### 1. Add or update candidate data

Edit `data/candidates.json`. Each candidate has these fields:

```json
{
  "id": "slug-del-candidato",
  "slug": "slug-del-candidato",
  "full_name": "Nombre Completo",
  "party_id": "party-xx",
  "party_abbreviation": "XX",
  "party_name": "Nombre del Partido",
  "role": "president",
  "bio_short": "Descripcion breve",
  "career_summary": "Resumen de carrera",
  "criminal_records": [],
  "has_criminal_record": false,
  "is_verified": false,
  "created_at": "2026-03-01T00:00:00Z",
  "updated_at": "2026-03-11T00:00:00Z"
}
```

### 2. Submit fact-checks

Edit `data/fact-checks.json`. Each fact-check has these fields:

```json
{
  "id": "fc-unique-id",
  "candidate_id": "slug-del-candidato",
  "candidate_name": "Nombre del Candidato",
  "claim": "Lo que dijo el candidato",
  "verdict": "true | false | misleading | unverifiable | context_needed",
  "explanation": "Explicacion detallada del veredicto",
  "source_url": "https://fuente-oficial.gob.pe/...",
  "source": "Nombre de la fuente",
  "date_checked": "2026-03-11"
}
```

Verdicts: `true` (Verdadero), `false` (Falso), `misleading` (Enganoso), `unverifiable` (No verificable), `context_needed` (Necesita contexto).

### 3. Update regional issues

Edit `data/regions.json` for basic region data or `data/regions-detail.json` for detailed information. Region fields:

```json
{
  "name": "Nombre de la Region",
  "code": "XXX",
  "population": 1000000,
  "key_issues": ["security", "economy", "infrastructure"]
}
```

Issue areas: `security`, `education`, `health`, `economy`, `environment`, `mining`, `corruption`, `infrastructure`, `social_programs`, `foreign_policy`.

### 4. Report bugs

Use [GitHub Issues](https://github.com/votoabierto/votoabierto/issues) with the **Bug Report** template.

### 5. Suggest features

Use [GitHub Issues](https://github.com/votoabierto/votoabierto/issues) with the **Feature Request** template.

---

## Data schema reference

### Candidate fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (same as slug) |
| `slug` | string | URL-friendly name |
| `full_name` | string | Full legal name |
| `party_id` | string | Party identifier |
| `party_abbreviation` | string | Party abbreviation (e.g., FP, APP) |
| `party_name` | string | Full party name |
| `role` | string | `president`, `vice_president`, `senator`, `representative` |
| `bio_short` | string | Short bio (1-2 sentences) |
| `career_summary` | string | Career summary |
| `ideology` | string | Political ideology |
| `age` | number | Age |
| `has_criminal_record` | boolean | Whether the candidate has a criminal record |
| `is_verified` | boolean | Whether the profile has been verified against INFOGOB |

### FactCheck fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `candidate_id` | string | Links to candidate |
| `claim` | string | The claim being checked |
| `verdict` | string | `true`, `false`, `misleading`, `unverifiable`, `context_needed` |
| `explanation` | string | Why this verdict was reached |
| `source_url` | string | URL of the source used to verify |
| `source` | string | Name of the source |
| `date_checked` | string | Date the check was performed |

### CongressCandidate fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `full_name` | string | Full legal name |
| `party` | string | Party name |
| `party_abbreviation` | string | Party abbreviation |
| `region` | string | 3-letter region code |
| `list_position` | number | Position on the party list |
| `ideology` | string | Political ideology |
| `bio` | string | Short biography |
| `prior_roles` | string[] | Previous positions held |
| `key_stances` | string[] | Key policy positions |

### Region fields

| Field | Type | Description |
|-------|------|-------------|
| `code` | string | 3-letter region code |
| `name` | string | Region name |
| `population` | number | Population estimate |
| `key_issues` | string[] | Top 3 issue areas |

---

## Code contribution guide

### Setup

1. Fork the repo
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/votoabierto.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feat/your-feature`

### Development

```bash
npm run dev      # Start dev server
npm run build    # Production build (must pass before PR)
npm run lint     # Lint check
```

### Making changes

1. Make your changes
2. Run `npm run build` — must pass with zero errors
3. Commit with a descriptive message
4. Push to your fork
5. Open a Pull Request

### PR title format

- `feat: description` — new feature
- `fix: description` — bug fix
- `data: description` — data addition or correction
- `docs: description` — documentation change

### PR description

Include:
- What changed and why
- Screenshots if it's a UI change
- Source link if it's a data change

---

## Code style

- **TypeScript strict mode** — no `any` types
- **Tailwind CSS** for all styling (no inline styles, no CSS modules)
- **Server Components by default** — use `'use client'` only when needed (interactivity, hooks)
- **Colors**: bg `#0a0a0a` (dark), gold `#d4af37`, text `gray-300`/`gray-400`

---

## Editorial principles

- **Non-partisan:** We do not express preference for any candidate
- **Two sources:** No data published without 2 verified sources
- **Transparency:** Every data point carries its source
- **Corrections:** Errors are corrected publicly with a correction note
