#!/usr/bin/env python3
"""VotoAbierto Data Audit — gap analysis for candidate position data."""

import json
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(REPO_ROOT, "data")

ISSUES_FILE = os.path.join(DATA_DIR, "issues.json")
PRESIDENTIAL_FILE = os.path.join(DATA_DIR, "candidate-positions.json")
CONGRESS_FILE = os.path.join(DATA_DIR, "congress-positions.json")
OUTPUT_FILE = "/tmp/votoabierto-data-gaps.json"


def load_issue_keys():
    with open(ISSUES_FILE) as f:
        data = json.load(f)
    keys = []
    for theme in data["themes"]:
        for q in theme["questions"]:
            keys.append(q["key"])
    return keys


def audit_candidate(candidate, issue_keys):
    positions = candidate.get("positions", {})
    verified = 0
    unverified = 0
    null_count = 0
    missing_keys = []
    unverified_keys = []

    for key in issue_keys:
        pos = positions.get(key)
        if pos is None:
            null_count += 1
            missing_keys.append(key)
            continue
        score = pos.get("score")
        is_verified = pos.get("verified", False)
        if score is None:
            null_count += 1
            missing_keys.append(key)
        elif is_verified:
            verified += 1
        else:
            unverified += 1
            unverified_keys.append(key)

    return {
        "candidate_id": candidate["candidate_id"],
        "candidate_name": candidate["candidate_name"],
        "party": candidate.get("party", ""),
        "party_abbreviation": candidate.get("party_abbreviation", ""),
        "role": candidate.get("role", "presidential"),
        "verified": verified,
        "unverified": unverified,
        "null": null_count,
        "total_issues": len(issue_keys),
        "completeness_pct": round((verified + unverified) / len(issue_keys) * 100, 1),
        "verified_pct": round(verified / len(issue_keys) * 100, 1),
        "missing_keys": missing_keys,
        "unverified_keys": unverified_keys,
    }


def print_report(title, audits):
    print(f"\n{'=' * 70}")
    print(f"  {title}")
    print(f"{'=' * 70}")
    # Sort by most gaps first (null desc, then unverified desc)
    audits_sorted = sorted(audits, key=lambda a: (-a["null"], -a["unverified"]))

    for a in audits_sorted:
        gap_bar = "█" * a["null"] + "░" * a["unverified"] + "·" * a["verified"]
        print(
            f"  {a['candidate_name']:<35} "
            f"verified={a['verified']:>2}  "
            f"unverified={a['unverified']:>2}  "
            f"null={a['null']:>2}  "
            f"[{gap_bar}]"
        )
        if a["missing_keys"]:
            print(f"    ↳ missing: {', '.join(a['missing_keys'])}")

    total_v = sum(a["verified"] for a in audits)
    total_u = sum(a["unverified"] for a in audits)
    total_n = sum(a["null"] for a in audits)
    total_all = total_v + total_u + total_n
    print(f"\n  Summary: {total_v} verified, {total_u} unverified, {total_n} null out of {total_all} total data points")
    if total_all > 0:
        print(f"  Overall completeness: {round((total_v + total_u) / total_all * 100, 1)}%")
        print(f"  Overall verified: {round(total_v / total_all * 100, 1)}%")


def main():
    issue_keys = load_issue_keys()
    print(f"Issues tracked: {len(issue_keys)}")
    print(f"Keys: {', '.join(issue_keys)}")

    # Presidential
    with open(PRESIDENTIAL_FILE) as f:
        presidential = json.load(f)
    presidential_audits = [audit_candidate(c, issue_keys) for c in presidential]
    print_report(f"PRESIDENTIAL CANDIDATES ({len(presidential)})", presidential_audits)

    # Congress
    with open(CONGRESS_FILE) as f:
        congress = json.load(f)
    congress_audits = [audit_candidate(c, issue_keys) for c in congress]
    print_report(f"CONGRESS CANDIDATES ({len(congress)})", congress_audits)

    # Write structured output
    output = {
        "generated_at": "2026-03-14",
        "issue_keys": issue_keys,
        "presidential": presidential_audits,
        "congress": congress_audits,
        "summary": {
            "presidential_count": len(presidential_audits),
            "congress_count": len(congress_audits),
            "presidential_verified_pct": round(
                sum(a["verified"] for a in presidential_audits)
                / (len(presidential_audits) * len(issue_keys)) * 100, 1
            ) if presidential_audits else 0,
            "congress_verified_pct": round(
                sum(a["verified"] for a in congress_audits)
                / (len(congress_audits) * len(issue_keys)) * 100, 1
            ) if congress_audits else 0,
        },
    }

    with open(OUTPUT_FILE, "w") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    print(f"\nStructured output written to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
