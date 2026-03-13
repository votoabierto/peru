# VotoAbierto — Core Principles

## 1. Objectivity
- We display facts, not opinions
- If data is unverified, we say so explicitly
- If data doesn't exist, we show "Sin datos" — never a guess, never a default
- Wrong information is worse than no information
- No political party colors, no spectrum labels, no editorializing

## 2. Source Always Visible
- Every fact links to its source (JNE, ONPE, Infogob)
- Citizens must be able to verify anything with one click
- Source label shown next to every data point
- If we can't cite a source, we don't show the data

## 3. Equal Treatment
- Every candidate gets the same sections, same layout
- Missing data is displayed identically regardless of who is missing it
- No candidate gets prominence over another (alphabetical ordering)

## 4. Privacy
- No user data collected without consent
- Quiz results are anonymous by default
- No login required for any civic information

## 5. Quiz Design Principles
- Questions map to observable policy positions, not ideological labels
- Candidate positions sourced from: JNE hojas de vida, government plans, public statements with citation
- Null position data > assumed position: if we don't have a candidate's stance, we don't show a score
- Questions only included when ≥15 candidates have documented positions (otherwise excluded)
- `axis_weight` derived from actual candidate score variance (std dev) — questions that better discriminate candidates get higher weight
- No "left/right/center" labels — axes describe policy dimensions only
- Users see policy positions, not ideological tribe assignments

---

## Implementation Rules (for agents and developers)

| Situation | Correct behavior |
|---|---|
| Photo not verified | Show initials avatar + link to JNE |
| Position score unverified | Show null + "Ver plan en JNE →" |
| Antecedentes unknown | Hide stat — never claim "Sin antecedentes" |
| Bio not available | Link to JNE profile — never fabricate |
| Social media unconfirmed | Don't show it |
| API data missing | "Sin datos disponibles — [Fuente: JNE]" |

## Data Sources (in order of trust)
1. **JNE** — Jurado Nacional de Elecciones (highest authority)
2. **ONPE** — Oficina Nacional de Procesos Electorales
3. **Infogob** — JNE's political history portal
4. **Community contributions** — citizen-submitted, manually reviewed before display
5. **AI-extracted** — from plans de gobierno, labeled as such, lower trust
