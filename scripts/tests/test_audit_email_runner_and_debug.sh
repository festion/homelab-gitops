#!/usr/bin/env bash
# The weekly audit must not pay 2x to enumerate the runner (ops #3202, items 3-4).
#
# Two defects, both cheap, both surviving eleven months of Sunday failures
# because nobody reads a log nobody expects to be useful:
#
#   item 3  a leftover debug step ran `Get-ChildItem -Recurse` from the runner
#           root EVERY run, emitting ~1,441 lines that were overwhelmingly file
#           paths. It is what made the real 401 hard to find -- measured again
#           on 2026-08-31, where reading the failure returned eight lines of
#           D:\a\homelab-gitops\... and no error text until the filter was
#           narrowed. A debug step that obstructs the diagnosis is worse than
#           no debug step.
#
#   item 4  `runs-on: windows-latest`, billed by GitHub at 2x the Linux rate,
#           for a job with no Windows dependency. pwsh 7 ships on the ubuntu
#           images and scripts/gitaudit.ps1 uses only portable constructs.
#
# WHAT THIS SUITE CAN AND CANNOT ESTABLISH.
# It asserts on the workflow's text, which is the surface a regression changes.
# It CANNOT establish that the audit runs correctly on Linux: the job has failed
# at the PAT step every Sunday since 2025-10-05, so steps 5-8 have not executed
# in ~11 months on EITHER runner. That is a real gap and it is not closed here;
# it closes when GH_REPO_PAT is rotated and the job gets past step 4.
#
# Run: bash scripts/tests/test_audit_email_runner_and_debug.sh
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
WF="$HERE/../../.github/workflows/weekly_audit_email.yml"
PS="$HERE/../gitaudit.ps1"

fail=0
ok()  { printf 'ok   - %s\n' "$1"; }
bad() { printf 'FAIL - %s\n' "$1"; fail=1; }

if [ ! -f "$WF" ]; then
  bad "weekly_audit_email.yml not found at $WF -- this suite silently checks nothing"
  echo "----"; echo "SOME TESTS FAILED"; exit 1
fi

# POSITIVE CONTROL. Every assertion below is an absence check, and an absence
# check against an unreadable or empty file passes for the wrong reason -- the
# reassuring direction. Refuse to report unless the file is real and has the
# shape we expect to be asserting about.
runs_on_line="$(grep -E '^\s*runs-on:' "$WF" || true)"
if [ -z "$runs_on_line" ]; then
  bad "no runs-on: line found -- cannot tell an ubuntu runner from a windows one, so reporting nothing"
  echo "----"; echo "SOME TESTS FAILED"; exit 1
fi
ok "located runs-on (control: the file is readable and has the asserted shape)"

# --- item 4: the runner ------------------------------------------------------

if printf '%s' "$runs_on_line" | grep -qi 'windows'; then
  bad "runs-on is a WINDOWS runner ($runs_on_line) -- billed at 2x for a job with no Windows dependency"
else
  ok "runs-on is not a windows runner ($(printf '%s' "$runs_on_line" | tr -s ' '))"
fi

# The steps still declare `shell: pwsh`, and that is correct on ubuntu: pwsh 7
# is preinstalled. Assert it is still pwsh, so a future edit does not quietly
# swap the shell and change the language the steps are written in.
if grep -qE '^\s*shell:\s*pwsh\s*$' "$WF"; then
  ok "steps still declare shell: pwsh (pwsh 7 ships on the ubuntu images)"
else
  bad "no 'shell: pwsh' step remains -- the PowerShell steps need it on a non-Windows runner"
fi

# --- item 3: the debug step --------------------------------------------------

if grep -qE 'Get-ChildItem\s+-Recurse' "$WF"; then
  bad "a recursive filesystem enumeration survives in the workflow -- this is the step that buried the 401"
else
  ok "no recursive filesystem enumeration in the workflow"
fi

if grep -qiE 'name:.*(full file tree|root level debug)' "$WF"; then
  bad "the root-level debug step is still present"
else
  ok "the root-level debug step is gone"
fi

# NEGATIVE CONTROL for the two absence checks above. `Get-ChildItem` on its own
# is legitimate -- "Confirm report files exist" uses it against output/ -- so a
# rule that banned the cmdlet outright would be wrong, and a rule that matched
# nothing at all would pass identically. Prove the file still contains the
# benign form, which is what makes the -Recurse assertion specific rather than
# vacuous.
if grep -qE 'Get-ChildItem\s+output' "$WF"; then
  ok "the benign Get-ChildItem output/ remains, so the -Recurse check is specific, not a blanket ban"
else
  bad "expected 'Get-ChildItem output' to remain -- if it is gone, the absence checks above prove nothing"
fi

# --- portability of the script the runner change depends on ------------------

if [ ! -f "$PS" ]; then
  bad "gitaudit.ps1 not found at $PS -- the runner change rests on its portability and it cannot be checked"
else
  # Windows-only constructs that would break on ubuntu. Checked before the
  # runner moved; pinned here so a future edit to the script cannot silently
  # reintroduce a Windows dependency while the workflow says ubuntu.
  if grep -qE 'Get-WmiObject|Get-CimInstance|New-Object -ComObject|[A-Za-z]:\\|\.exe\b' "$PS"; then
    bad "gitaudit.ps1 contains a Windows-only construct but the workflow runs on a non-Windows runner"
  else
    ok "gitaudit.ps1 has no Windows-only construct (no WMI/CIM/COM, no drive letter, no .exe)"
  fi

  # Case sensitivity: ubuntu is case-sensitive and Windows is not, so a report
  # path spelled two ways works on windows-latest and breaks on ubuntu.
  #
  # Match `Output` only where it begins a PATH COMPONENT -- after a quote or a
  # slash. The variable $OutputFlagPath is legitimately capitalised and must not
  # trip this.
  #
  # ⚠ The first version of this check listed three literal spellings
  # ("Output" | /Output/ | Output/GitRepoReport) and MISSED the realistic case:
  # fire-testing it with `$OutputFlagPath = "Output/skipEmail.flag"` left the
  # suite GREEN, because that string matches none of the three. An absence
  # check built from an enumeration of remembered spellings tests the
  # enumeration, not the property.
  if grep -qE '["'"'"'/]Output' "$PS" "$WF"; then
    bad "'Output' appears capitalised somewhere -- a case mismatch breaks on a case-sensitive filesystem"
  else
    ok "the report directory is spelled 'output' consistently (case-sensitive filesystems are fine)"
  fi
fi

echo "----"
if [ "$fail" -eq 0 ]; then echo "ALL TESTS PASSED"; else echo "SOME TESTS FAILED"; fi
exit "$fail"
