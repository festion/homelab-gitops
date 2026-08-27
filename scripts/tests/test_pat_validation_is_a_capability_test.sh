#!/usr/bin/env bash
# The weekly audit's PAT check must test CAPABILITY, not presence (ops #3202).
#
# The step used to be named "Validate GitHub PAT is set" and its whole body was:
#
#   if (-not $env:GH_REPO_PAT) { Write-Error "..."; exit 1 }
#
# A revoked or expired PAT is a non-empty string, so that guard passed green
# and the real failure surfaced two steps later as a generic script error:
#
#   Failed to fetch repos from GitHub API: { "message": "Bad credentials",
#                                            "status": "401" }
#
# It failed that way every Sunday for 47 consecutive runs -- last success
# 2025-09-28, first failure 2025-10-05 -- while the step whose entire job was
# to catch this reported success each time. A fail-open guard is worse than no
# guard, because a green step is read as evidence.
#
# This suite pins the properties that make it a real check. It CANNOT run the
# PowerShell (there is no pwsh on the dev host), so it asserts on the step's
# text -- which is exactly the surface a regression would change.
#
# Run: bash scripts/tests/test_pat_validation_is_a_capability_test.sh
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
WF="$HERE/../../.github/workflows/weekly_audit_email.yml"

fail=0
ok()  { printf 'ok   - %s\n' "$1"; }
bad() { printf 'FAIL - %s\n' "$1"; fail=1; }

if [ ! -f "$WF" ]; then
  bad "weekly_audit_email.yml not found at $WF -- this suite silently checks nothing"
  echo "----"; echo "SOME TESTS FAILED"; exit 1
fi

# Extract the validation step: from its `- name:` line up to the next `- name:`.
# POSITIVE CONTROL first -- if the step cannot be located, every assertion below
# would pass vacuously against an empty string, which is the reassuring
# direction. Refuse to report anything in that case.
start=$(grep -n '^      - name: Validate ' "$WF" | head -1 | cut -d: -f1)
if [ -z "$start" ]; then
  bad "could not locate a '- name: Validate ...' step -- the extractor is broken, so a pass below would prove nothing"
  echo "----"; echo "SOME TESTS FAILED"; exit 1
fi
next=$(awk -v s="$start" 'NR>s && /^      - name: /{print NR; exit}' "$WF")
[ -z "$next" ] && next=$(wc -l < "$WF")
STEP="$(sed -n "${start},$((next-1))p" "$WF")"
# Strip PowerShell comments: the block deliberately QUOTES the old fail-open
# form to explain why it went. A check that fires on its own documentation is
# worse than no check.
CODE="$(printf '%s\n' "$STEP" | sed 's/#.*//')"

if [ -n "$(printf '%s' "$CODE" | tr -d '[:space:]')" ]; then
  ok "located the validation step ($((next-start)) lines) and it has a body"
else
  bad "the extracted step is empty after stripping comments -- assertions below would be vacuous"
fi

# 1. It must actually CALL GitHub. An emptiness test alone is the defect.
if printf '%s' "$CODE" | grep -q 'api\.github\.com/user'; then
  ok "the step makes a real capability call (GET /user), not just an emptiness test"
else
  bad "the step never calls api.github.com -- presence is not validity (ops #3202)"
fi

# 2. It must FAIL on a rejected credential. This is the discriminating one:
#    a step that calls the API and then exits 0 regardless is the same fail-open
#    with extra steps.
if printf '%s' "$CODE" | grep -qE 'StatusCode|\$code'; then
  ok "the step reads the HTTP status rather than discarding it"
else
  bad "the step does not read an HTTP status -- it cannot tell 200 from 401"
fi
if printf '%s' "$CODE" | grep -q 'exit 1'; then
  ok "the step has a non-zero exit path"
else
  bad "the step never exits non-zero -- a rejected PAT would pass green"
fi

# 3. It must name the cause where the failure happens, so the next reader is not
#    sent two steps downstream to a generic script error.
if printf '%s' "$CODE" | grep -qiE 'REJECTED|Bad credentials|\$msg'; then
  ok "the failure surfaces GitHub's own reason at the step that detected it"
else
  bad "the failure does not name the cause -- that is what made this invisible"
fi

# 4. The token's VALUE must never be printed. Match \$env:GH_REPO_PAT inside an
#    output call -- the NAME appearing in a human-readable message is correct
#    and expected, so matching the bare name would fire on the fix itself.
leaks="$(printf '%s\n' "$CODE" | grep -cE '(Write-Host|Write-Output|Write-Error|echo)[^#]*\$env:GH_REPO_PAT' || true)"
if [ "$leaks" = "0" ]; then
  ok "the PAT value is never written to the log"
else
  bad "the PAT value is interpolated into $leaks output statement(s)"
fi

# 5. NEGATIVE CONTROL for assertion 4: prove that matcher can fire at all.
#    An "assert absent" check passes trivially when its pattern is wrong, and a
#    wrong pattern looks identical to a clean file.
probe='          Write-Host "token is $env:GH_REPO_PAT"'
if printf '%s\n' "$probe" | grep -qE '(Write-Host|Write-Output|Write-Error|echo)[^#]*\$env:GH_REPO_PAT'; then
  ok "the leak matcher fires on a known-positive, so the zero above is real"
else
  bad "the leak matcher does NOT fire on a planted leak -- assertion 4 proves nothing"
fi

echo "----"
if [ "$fail" -eq 0 ]; then echo "ALL TESTS PASSED"; else echo "SOME TESTS FAILED"; fi
exit "$fail"
