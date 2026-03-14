#!/usr/bin/env python3
"""Validate candidate position data files — runs in CI on every PR."""

import json
import os
import re
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(REPO_ROOT, "data")

PRESIDENTIAL_FILE = os.path.join(DATA_DIR, "candidate-positions.json")
CONGRESS_FILE = os.path.join(DATA_DIR, "congress-positions.json")
ISSUES_FILE = os.path.join(DATA_DIR, "issues.json")

CANDIDATE_ID_PATTERN = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
URL_PATTERN = re.compile(r"^https?://[^\s]+$")

errors = []
warnings = []


def error(msg):
    errors.append(msg)
    print(f"  ERROR: {msg}")


def warn(msg):
    warnings.append(msg)
    print(f"  WARN:  {msg}")


def load_issue_keys():
    with open(ISSUES_FILE) as f:
        data = json.load(f)
    inverted = {}
    for theme in data["themes"]:
        for q in theme["questions"]:
            inverted[q["key"]] = q.get("axis_inverted", False)
    return inverted


def validate_file(filepath, label, issue_info):
    print(f"\nValidating {label}: {filepath}")

    try:
        with open(filepath) as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        error(f"JSON parse error in {label}: {e}")
        return
    except FileNotFoundError:
        error(f"File not found: {filepath}")
        return

    if not isinstance(data, list):
        error(f"{label}: root must be an array")
        return

    seen_ids = set()
    required_fields = ["candidate_id", "candidate_name", "party", "party_abbreviation", "positions"]

    for i, candidate in enumerate(data):
        prefix = f"{label}[{i}]"

        # Check required fields
        for field in required_fields:
            if field not in candidate:
                error(f"{prefix}: missing required field '{field}'")

        cid = candidate.get("candidate_id", f"UNKNOWN_{i}")

        # Validate candidate_id pattern
        if "candidate_id" in candidate:
            if not CANDIDATE_ID_PATTERN.match(candidate["candidate_id"]):
                error(f"{prefix} ({cid}): candidate_id must be lowercase with hyphens only, got '{candidate['candidate_id']}'")

        # Check for duplicate candidate_ids
        if cid in seen_ids:
            error(f"{prefix}: duplicate candidate_id '{cid}'")
        seen_ids.add(cid)

        # Validate positions
        positions = candidate.get("positions", {})
        if not isinstance(positions, dict):
            error(f"{prefix} ({cid}): positions must be an object")
            continue

        for key, pos in positions.items():
            pos_prefix = f"{prefix} ({cid}).positions.{key}"

            if not isinstance(pos, dict):
                error(f"{pos_prefix}: must be an object")
                continue

            score = pos.get("score")
            verified = pos.get("verified", False)
            label_text = pos.get("label")
            source_url = pos.get("source_url")

            # Score validation: must be 1-5 or null
            if score is not None:
                if not isinstance(score, (int, float)):
                    error(f"{pos_prefix}: score must be a number or null, got {type(score).__name__}")
                elif score < 1 or score > 5:
                    error(f"{pos_prefix}: score must be 1-5 or null, got {score}")

            # Verified requires source_url and label
            if verified:
                if source_url is None:
                    error(f"{pos_prefix}: verified=true requires non-null source_url")
                elif not URL_PATTERN.match(str(source_url)):
                    error(f"{pos_prefix}: source_url must be a valid URL, got '{source_url}'")
                if label_text is None:
                    error(f"{pos_prefix}: verified=true requires non-null label")

            # Axis inversion check (warn only)
            if score is not None and key in issue_info:
                is_inverted = issue_info[key]
                if is_inverted and score == 5:
                    warn(f"{pos_prefix}: score=5 on axis_inverted issue — verify this is intentional (high score = agree with inverted axis)")
                elif not is_inverted and score == 1:
                    # This is fine — 1 means disagree, which is valid
                    pass

    print(f"  Candidates: {len(data)}, unique IDs: {len(seen_ids)}")


def main():
    issue_info = load_issue_keys()

    validate_file(PRESIDENTIAL_FILE, "candidate-positions", issue_info)
    validate_file(CONGRESS_FILE, "congress-positions", issue_info)

    print(f"\n{'=' * 50}")
    print(f"Errors: {len(errors)}")
    print(f"Warnings: {len(warnings)}")

    if errors:
        print("\nVALIDATION FAILED")
        for e in errors:
            print(f"  - {e}")
        sys.exit(1)
    else:
        print("\nVALIDATION PASSED")
        sys.exit(0)


if __name__ == "__main__":
    main()
