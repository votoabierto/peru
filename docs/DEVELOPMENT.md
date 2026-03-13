# Development Guide — VotoAbierto

## Build & Deploy

### Local development
```bash
npm run dev        # runs prebuild (generate-data-freshness.mjs) then next dev
npm run build      # runs prebuild then next build
```

### Vercel deployment
**Critical:** Vercel uses `npm run build` (forced via `vercel.json`), NOT `next build`.
This ensures the `prebuild` script runs before every deploy, generating `lib/generated/data-freshness-meta.ts`.

`vercel.json` must always contain:
```json
{ "buildCommand": "npm run build" }
```
**Never delete `vercel.json`.** Without it, Vercel skips `prebuild` and the build fails.

### Generated files
`lib/generated/data-freshness-meta.ts` is committed to the repo as a static fallback.
The `prebuild` script regenerates it with real git timestamps on every build.
**Never add `lib/generated/` to `.gitignore`** — it must be present for cold builds.

---

## Wave Development Standards

### Task file structure (mandatory)
Every wave task file MUST start with the TERMINAL_WARNING block as the first lines:

```
# ⚠️  TERMINAL USAGE — CRITICAL (READ THIS FIRST — NON-NEGOTIABLE):
# Run ALL shell commands as single bash -c invocations:
#   bash -c "cd /path && cat file.tsx"
#   bash -c "cd /path && ls app/"
#   bash -c "cd /path && npm run build"
# NEVER open persistent/interactive terminal sessions. NEVER use createTerminal.
# ALL commands (ls, cat, git, npm, node) must be bash -c "..." invocations.
```

This must come BEFORE the wave title. Agents read linearly — if the warning is buried, they ignore it.
Use `scripts/votoclaro-task-template.txt` as the base for all new task files.

### Mandatory wave → stress test flow
No wave is done without a stress test:
```bash
# 1. Build wave
bash scripts/votoabierto-run.sh /tmp/va-wave-X.txt "wave-X" "SIGNAL_X"

# 2. Stress test immediately after (same session)
bash scripts/votoabierto-run.sh /tmp/va-stress-X.txt "stress-X" "SIGNAL_STRESS_X"

# 3. Fix ALL P0/P1/P2 findings before closing
```

**P2 findings are not optional.** All severities must be fixed before the wave is closed.

### createTerminal deadlock
The acpx agent framework maps shell commands to `createTerminal`. When called with empty
options (`createTerminal({})`), it triggers `session/request_permission` and freezes indefinitely.

`scripts/acpx-watchdog.sh` auto-kills the agent after 90s of no output when this is detected.
Prevention: TERMINAL_WARNING as first lines in every task file.

---

## Permanent Product Decisions

### No PWA (FOREVER)
VotoAbierto is web-only. No app install, no offline mode, no service worker.

Files that must NOT exist:
- `app/offline/` — deleted
- `public/sw.js` — deleted
- `public/manifest.json` with `display: standalone` — deleted
- `public/icons/icon-192.png` + `icon-512.png` — deleted

Code that must NOT be in `app/layout.tsx`:
- `<link rel="manifest">` — removed
- `apple-mobile-web-app-*` meta tags — removed
- Any `<Script>` that registers a service worker — removed

If any wave re-adds PWA: reject it. The decision is final.

### No "Lenguaje Simple" toggle (FOREVER)
Content should be simple by default. The toggle was patronizing and added dead code.

- `components/SimpleLanguageToggle.tsx` — deleted
- `isSimple` / `setIsSimple` in I18nProvider — removed
- All `simple.*` and `a11y.simple_*` keys in translation files — removed

Do not re-add. Write clear content instead.

### No ideology filter on candidate list (FOREVER)
Candidates don't have a clear ideology, and users don't know what ideologies mean.
The filter was removed from `components/CandidatosList.tsx` in Wave P.

---

## Data Pipeline

### JNE APIs (confirmed working)
- Base: `https://votoinformadoia.jne.gob.pe/ServiciosWeb`
- `POST /api/v1/ListaCandidatos/filtrar` with `{idProcesoElectoral: 124, idTipoEleccion: 1, tipoAutoridad: 1, pagina: 1, cantidad: 200}` → all 36 presidential candidates with photos, judicial records, plan PDF
- `POST /api/v1/plan-gobierno/resumen-por-organizacion` → plan de gobierno per party

### Auto-refresh
GitHub Actions at `.github/workflows/refresh-jne-data.yml` runs every Monday 06:00 UTC.
Creates a PR with data changes — does not push directly to main.

### Data files
| File | Content | Updated by |
|------|---------|-----------|
| `data/candidates.json` | 36 presidential candidates | Manual / JNE scripts |
| `data/parties.json` | 38 parties (incl. FREPAP + CPP) | Manual |
| `data/senate-candidates.json` | 1131 senators | JNE scraper |
| `data/diputados-candidates.json` | 4100+ diputados | JNE scraper |
| `data/andino-candidates.json` | 528 andino candidates | JNE scraper |
| `data/pledges.json` | 10 civic pledges | Manual |
| `data/public-office-records.json` | Governance records for candidates with public office history | Manual |
| `data/issues.json` | 13 quiz questions with axis + axis_weight | Editorial team |
| `data/candidate-positions.json` | Candidate positions + axis_scores + role + department | Editorial team / community |
| `lib/generated/data-freshness-meta.ts` | Build-time timestamps | Auto-generated by prebuild |

---

## Lessons Learned

### TypeScript: fix the code not the constraint
Never use `any`, never use `@ts-ignore`. If the type system complains, fix the code to match the types.

### Quiz axis design
Use real candidate data standard deviation for weights, not guesses. Preguntas donde todos los candidatos opinan lo mismo no discriminan y deben tener peso bajo.

### Objectivity in axis labels
Axis labels describe policy dimensions only — never ideological tribes. "Económico" not "izquierda económica". "Social" not "conservador vs progresista".

---

## Common Errors & Fixes

### Vercel build failing with missing import
**Symptom:** `Cannot find module '@/lib/generated/data-freshness-meta'`
**Cause:** Either `vercel.json` is missing (so Vercel runs `next build` skipping `prebuild`), or `lib/generated/` was added to `.gitignore`
**Fix:** Ensure `vercel.json` has `"buildCommand": "npm run build"` AND `lib/generated/data-freshness-meta.ts` is committed to the repo

### createTerminal deadlock
**Symptom:** Agent produces output for a few lines, then nothing for 90s+ → watchdog kills it
**Cause:** Agent called `createTerminal({})` with empty options
**Fix:** Ensure task file starts with TERMINAL_WARNING. Check `scripts/acpx-watchdog.sh` is running.

### PWA install prompt appearing
**Symptom:** Browser shows "Install VotoAbierto" button or native install dialog
**Cause:** `manifest.json` with `display: standalone` and/or service worker registered
**Fix:** Wave Q killed this permanently. If it reappears, a wave re-added the files. Revert.

### Party ID references broken (senate/diputados candidates)
**Symptom:** `partyId` values in congress candidate files don't match `data/parties.json` IDs
**Cause:** JNE uses different party name formats; slugification doesn't always match
**Fix:** Run `scripts/fix-party-links.py` (created in Wave O)
