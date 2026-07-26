#!/usr/bin/env bash
# npm-audit CI gate with a documented, EXPIRING allowlist.
#
# Why this exists: `npm audit --audit-level=high` has only one lever -- the
# threshold. When a single unfixable advisory appears, the choices are to leave
# the gate red forever (so nobody reads it, and the next real vulnerability
# lands unnoticed) or to lower the threshold (so the gate stops catching the
# class entirely). Both are worse than an explicit, justified exception with an
# expiry date.
#
# This gate fails on ANY advisory at or above <level> that is not listed in
# .github/audit-allowlist.json, and additionally fails when an allowlist entry
# passes its review_by date -- so an exception cannot rot silently.
#
# Usage: scripts/ci-audit-gate.sh <directory> <level>
#   level: low | moderate | high | critical
set -uo pipefail

DIR="${1:?usage: ci-audit-gate.sh <directory> <level>}"
LEVEL="${2:?usage: ci-audit-gate.sh <directory> <level>}"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ALLOWLIST="$REPO_ROOT/.github/audit-allowlist.json"

cd "$REPO_ROOT/$DIR" || { echo "::error::no such directory: $DIR"; exit 2; }

# npm audit exits non-zero when it finds anything at/above the level; we do our
# own gating, so capture the JSON and ignore its exit status here.
AUDIT_FILE="$(mktemp)"
trap 'rm -f "$AUDIT_FILE"' EXIT
npm audit --json >"$AUDIT_FILE" 2>/dev/null
if [ ! -s "$AUDIT_FILE" ]; then
  echo "::error::npm audit produced no output in $DIR (is the dependency tree installed?)"
  exit 2
fi

# The audit JSON goes via a FILE, not stdin: stdin is already carrying the
# python script below, and a command has only one stdin.
ALLOWLIST="$ALLOWLIST" DIR="$DIR" LEVEL="$LEVEL" AUDIT_FILE="$AUDIT_FILE" python3 - <<'PY'
import json, os, sys, datetime

ORDER = {"info": 0, "low": 1, "moderate": 2, "high": 3, "critical": 4}
level = ORDER[os.environ["LEVEL"]]
directory = os.environ["DIR"]

with open(os.environ["AUDIT_FILE"]) as fh:
    audit = json.load(fh)

allow = {}
try:
    with open(os.environ["ALLOWLIST"]) as fh:
        for entry in json.load(fh).get("allow", []):
            allow[entry["id"]] = entry
except FileNotFoundError:
    pass

# Collect advisories at/above the threshold, keyed by GHSA id.
found = {}
for name, vuln in (audit.get("vulnerabilities") or {}).items():
    for via in vuln.get("via") or []:
        if not isinstance(via, dict):
            continue
        sev = via.get("severity", "info")
        if ORDER.get(sev, 0) < level:
            continue
        ghsa = (via.get("url") or "").rsplit("/", 1)[-1]
        found.setdefault(ghsa, {"severity": sev, "packages": set(), "title": via.get("title", "")})
        found[ghsa]["packages"].add(name)

today = datetime.date.today()
blocking, expired = [], []

for ghsa, info in sorted(found.items()):
    entry = allow.get(ghsa)
    if entry is None:
        blocking.append((ghsa, info))
        continue
    # An allowlisted advisory still blocks once its review date passes.
    review_by = datetime.date.fromisoformat(entry["review_by"])
    if today > review_by:
        expired.append((ghsa, info, entry, review_by))
    else:
        pkgs = ", ".join(sorted(info["packages"]))
        print(f"::notice::[{directory}] allowing {ghsa} ({info['severity']}, {pkgs}) "
              f"until {review_by} -- {entry['reason'][:160]}")

# An allowlist entry whose advisory is gone is dead weight; report, don't fail.
for ghsa, entry in allow.items():
    if entry.get("directory") == directory and ghsa not in found:
        print(f"::warning::[{directory}] allowlist entry {ghsa} no longer matches any "
              f"advisory -- remove it from .github/audit-allowlist.json")

rc = 0
for ghsa, info, entry, review_by in expired:
    print(f"::error::[{directory}] allowlist entry {ghsa} EXPIRED on {review_by}. "
          f"Re-assess it and either fix the advisory or extend review_by deliberately. "
          f"Context: {entry.get('why_not_fixed', '')[:200]}")
    rc = 1

for ghsa, info in blocking:
    pkgs = ", ".join(sorted(info["packages"]))
    print(f"::error::[{directory}] {info['severity']} advisory {ghsa} in {pkgs} "
          f"is not allowlisted: {info['title']}")
    rc = 1

if rc == 0 and not found:
    print(f"[{directory}] npm audit clean at level '{os.environ['LEVEL']}'")
elif rc == 0:
    print(f"[{directory}] no blocking advisories at level '{os.environ['LEVEL']}' "
          f"({len(found)} allowlisted)")

sys.exit(rc)
PY
