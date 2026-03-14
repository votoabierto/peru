#!/usr/bin/env python3
"""Generate GitHub issue markdown files for candidates who need data contributions."""

import argparse
import json
import os
import re
import urllib.parse

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(REPO_ROOT, "data")

ISSUES_FILE = os.path.join(DATA_DIR, "issues.json")
PRESIDENTIAL_FILE = os.path.join(DATA_DIR, "candidate-positions.json")
CONGRESS_FILE = os.path.join(DATA_DIR, "congress-positions.json")
OUTPUT_DIR = "/tmp/contribution-issues"

# Issue key to human-readable name
ISSUE_LABELS = {
    "economia_igv": "IGV / impuestos al consumo",
    "economia_mineria": "Impuestos a la minería",
    "economia_inversion": "Control de inversión extranjera",
    "economia_informal": "Formalización de microempresas",
    "medioambiente_industrias": "Medio ambiente vs. industria extractiva",
    "seguridad_pena_muerte": "Pena de muerte",
    "seguridad_fuerzas_armadas": "Rol de las FF.AA. en seguridad",
    "seguridad_narcotrafico": "Política antidrogas",
    "educacion_meritocracia": "Evaluación docente / meritocracia",
    "inst_constitucion": "Nueva constitución",
    "inst_anticorrupcion": "Inhabilitación por corrupción",
    "inst_fiscal": "Elección de fiscales/jueces",
    "territorio_descentralizacion": "Descentralización presupuestal",
}


def load_issue_keys():
    with open(ISSUES_FILE) as f:
        data = json.load(f)
    keys = []
    for theme in data["themes"]:
        for q in theme["questions"]:
            keys.append(q["key"])
    return keys


def slugify(name):
    s = name.lower().strip()
    s = re.sub(r"[áà]", "a", s)
    s = re.sub(r"[éè]", "e", s)
    s = re.sub(r"[íì]", "i", s)
    s = re.sub(r"[óò]", "o", s)
    s = re.sub(r"[úù]", "u", s)
    s = re.sub(r"[ñ]", "n", s)
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def google_news_url(name):
    q = urllib.parse.quote(f"{name} elecciones Perú 2026")
    return f"https://news.google.com/search?q={q}&hl=es-419&gl=PE"


def jne_search_url(name):
    q = urllib.parse.quote(name)
    return f"https://declara.jne.gob.pe/ASSETS/PLANGOBIERNO/FILEPLANGOBIERNO/{q}"


def infogob_url(name):
    q = urllib.parse.quote(name)
    return f"https://infogob.jne.gob.pe/Politico/FichaPersonal?strPolitico={q}"


def generate_issue(candidate, issue_keys):
    positions = candidate.get("positions", {})
    name = candidate["candidate_name"]
    party = candidate.get("party", "Sin partido")
    abbrev = candidate.get("party_abbreviation", "")
    role = candidate.get("role", "presidential")
    cid = candidate["candidate_id"]

    missing = []
    unverified = []
    for key in issue_keys:
        pos = positions.get(key)
        if pos is None or pos.get("score") is None:
            missing.append(key)
        elif not pos.get("verified", False):
            unverified.append(key)

    total_gaps = len(missing) + len(unverified)
    if total_gaps == 0:
        return None, 0

    role_label = {"presidential": "Presidencial", "senado": "Senado", "diputados": "Diputados"}.get(role, role)

    lines = []
    lines.append(f"## Datos faltantes: {name}")
    lines.append("")
    lines.append(f"**Candidato:** {name}")
    lines.append(f"**Partido:** {party} ({abbrev})")
    lines.append(f"**Cargo:** {role_label}")
    lines.append(f"**ID:** `{cid}`")
    lines.append("")

    if missing:
        lines.append(f"### Posiciones sin datos ({len(missing)} de {len(issue_keys)})")
        lines.append("")
        lines.append("Estas posiciones necesitan un score (1-5), un label descriptivo, y una fuente verificable:")
        lines.append("")
        for key in missing:
            label = ISSUE_LABELS.get(key, key)
            lines.append(f"- [ ] **{key}** — {label}")
        lines.append("")

    if unverified:
        lines.append(f"### Posiciones sin verificar ({len(unverified)})")
        lines.append("")
        lines.append("Estas posiciones tienen score pero necesitan `source_url` para ser verificadas:")
        lines.append("")
        for key in unverified:
            label = ISSUE_LABELS.get(key, key)
            score = positions[key].get("score")
            lines.append(f"- [ ] **{key}** — {label} (score actual: {score})")
        lines.append("")

    lines.append("### Fuentes sugeridas")
    lines.append("")
    lines.append(f"- [Google News: {name}]({google_news_url(name)})")
    lines.append(f"- [Infogob]({infogob_url(name)})")
    lines.append(f"- [JNE Plan de Gobierno]({jne_search_url(name)})")
    lines.append("")

    lines.append("### Plantilla JSON")
    lines.append("")
    lines.append("Copia y pega este bloque con los datos que encuentres:")
    lines.append("")
    lines.append("```json")
    template = {}
    for key in missing:
        template[key] = {
            "score": None,
            "label": "COMPLETAR",
            "verified": True,
            "source_url": "COMPLETAR_URL",
        }
    for key in unverified:
        template[key] = {
            "score": positions[key].get("score"),
            "label": positions[key].get("label", "COMPLETAR"),
            "verified": True,
            "source_url": "COMPLETAR_URL",
        }
    lines.append(json.dumps(template, indent=2, ensure_ascii=False))
    lines.append("```")
    lines.append("")
    lines.append("### Reglas")
    lines.append("")
    lines.append("- Score: 1 (totalmente en desacuerdo) a 5 (totalmente de acuerdo)")
    lines.append("- Solo se acepta `verified: true` con `source_url` válida")
    lines.append("- Fuentes válidas: declaración individual del candidato (entrevista, plan de gobierno, tweet oficial)")
    lines.append("- NO se acepta: plan de partido genérico, inferencia, rumores")

    return "\n".join(lines), total_gaps


def main():
    parser = argparse.ArgumentParser(description="Generate contribution issue files for candidates with data gaps")
    parser.add_argument("--role", choices=["presidential", "senado", "all"], default="all",
                        help="Filter by candidate role")
    parser.add_argument("--min-gaps", type=int, default=1,
                        help="Minimum number of gaps to generate an issue (default: 1)")
    args = parser.parse_args()

    issue_keys = load_issue_keys()
    candidates = []

    if args.role in ("presidential", "all"):
        with open(PRESIDENTIAL_FILE) as f:
            candidates.extend(json.load(f))
    if args.role in ("senado", "all"):
        with open(CONGRESS_FILE) as f:
            candidates.extend(json.load(f))

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    generated = 0
    for c in candidates:
        content, gaps = generate_issue(c, issue_keys)
        if content and gaps >= args.min_gaps:
            filename = f"{slugify(c['candidate_name'])}.md"
            filepath = os.path.join(OUTPUT_DIR, filename)
            with open(filepath, "w") as f:
                f.write(content)
            generated += 1
            print(f"  {filename} ({gaps} gaps)")

    print(f"\nGenerated {generated} issue files in {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
