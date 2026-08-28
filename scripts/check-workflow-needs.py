#!/usr/bin/env python3
"""Assert every `needs.<job>` expression in a workflow names a job it depends on.

WHY THIS EXISTS
---------------
ops #3347. PR #273 removed release.yml's `deploy-release` job (ops #3307) and
left two expressions behind that still referenced it:

    - **Staging:**    ${{ needs.deploy-release.result == 'success' && ... }}
    - **Production:** ${{ needs.deploy-release.result == 'success' && ... }}

GitHub does not reject this. A `needs.<job>` lookup for a job that is not in
the referencing job's `needs:` yields an EMPTY context, so the comparison is
simply falsy and the expression quietly settles to its `||` branch. The result
was a release report that would have stated "Production: Manual" on every
release, while deploy.yml -- which triggers on the same `v*` tag -- was in fact
deploying production. The artifact that exists to record what happened would
have asserted the opposite of what happened.

Nothing caught it because release.yml has never run (total_runs = 0, against a
control of 209 for deploy.yml). Its first execution would be a real release.
That is the same property that made ops #3307 dangerous in the first place, so
the check has to be static -- waiting for a run is waiting for the incident.

WHAT IT REPORTS, AND WHY THE THREE KINDS ARE SEPARATE
-----------------------------------------------------
  UNDECLARED_JOB      needs.X, and X is not a job in this file at all
                      -> the job was deleted; the expression can never be true
  NOT_IN_NEEDS        needs.X, X IS a job here, but the referencing job does
                      not list it in its own `needs:`
                      -> empty context at runtime, silently falsy
  NEEDS_MISSING_JOB   a `needs:` entry naming a job that does not exist
                      -> this one GitHub does reject, at parse time

They are reported separately because they want different repairs, and because
two branches collapsing into one verdict is worse than no check at all.

CONTROLS
--------
`--self-test` builds three fixtures and asserts each arm fires for its own
cause and only its own, plus a clean file that must produce zero. Run it if you
change anything here: an arm that cannot fire is indistinguishable from a
codebase that is clean, and this whole class hides in exactly that gap.
"""
import re
import sys
import pathlib
import tempfile

import yaml


def check(path):
    """Return a list of (kind, job, ref) findings for one workflow file."""
    try:
        doc = yaml.safe_load(pathlib.Path(path).read_text())
    except Exception as exc:  # a workflow we cannot parse is a finding, not a skip
        return [("PARSE_ERROR", "-", str(exc)[:100])]

    if not isinstance(doc, dict):
        return []
    jobs = doc.get("jobs")
    if not isinstance(jobs, dict):
        return []

    findings = []
    for jname, jbody in jobs.items():
        if not isinstance(jbody, dict):
            continue

        needs = jbody.get("needs", [])
        if isinstance(needs, str):
            needs = [needs]
        needs = set(needs or [])

        # Re-serialise the job so `needs.X` is found wherever it appears --
        # in `if:`, in a step's `run:` heredoc, in `with:`. Grepping only the
        # keys we thought of is how the two release.yml references survived
        # review: they were inside a heredoc, not in an `if:`.
        body = yaml.safe_dump(jbody)
        # Only look INSIDE ${{ ... }}. `needs.` is not a rare byte sequence in
        # free text -- this check's own filename, check-workflow-needs.py,
        # contains it, and a naive scan of the whole body flagged the very step
        # that runs it. A false positive in a required gate is worse than the
        # defect: it trains people to bypass the check.
        refs = set()
        for expr in re.findall(r"\$\{\{(.*?)\}\}", body, re.S):
            refs.update(re.findall(r"\bneeds\.([A-Za-z0-9_-]+)", expr))
        for ref in sorted(refs):
            if ref not in jobs:
                findings.append(("UNDECLARED_JOB", jname, ref))
            elif ref not in needs:
                findings.append(("NOT_IN_NEEDS", jname, ref))

        for n in sorted(needs):
            if n not in jobs:
                findings.append(("NEEDS_MISSING_JOB", jname, n))

    return findings


ARM0 = """
on: push
jobs:
  alpha:
    runs-on: ubuntu-latest
    steps: [{run: echo a}]
  gamma:
    runs-on: ubuntu-latest
    needs: [alpha]
    steps:
      - run: echo "${{ needs.deleted-job.result }}"
"""

ARM1 = """
on: push
jobs:
  alpha:
    runs-on: ubuntu-latest
    steps: [{run: echo a}]
  beta:
    runs-on: ubuntu-latest
    steps: [{run: echo b}]
  gamma:
    runs-on: ubuntu-latest
    needs: [alpha]
    steps:
      - run: echo "${{ needs.beta.result }}"
"""

ARM2 = """
on: push
jobs:
  alpha:
    runs-on: ubuntu-latest
    steps: [{run: echo a}]
  gamma:
    runs-on: ubuntu-latest
    needs: [alpha, ghost]
    steps: [{run: echo g}]
"""

# The false positive this check produced against its own PR: `needs.` appears
# in the SCRIPT NAME inside a `run:` block, outside any ${{ }} expression.
FALSE_POSITIVE = """
on: push
jobs:
  alpha:
    runs-on: ubuntu-latest
    steps:
      - run: python3 scripts/check-workflow-needs.py
"""

CLEAN = """
on: push
jobs:
  alpha:
    runs-on: ubuntu-latest
    steps: [{run: echo a}]
  gamma:
    runs-on: ubuntu-latest
    needs: [alpha]
    steps:
      - run: echo "${{ needs.alpha.result }}"
"""


def self_test():
    """Each arm must fire for its own cause and ONLY its own."""
    cases = [
        # ARM0 is the shape that actually happened (ops #3347): the referenced
        # job was DELETED. It is first because it is the real case; the others
        # are neighbours it must not be confused with.
        ("UNDECLARED_JOB", ARM0, {("UNDECLARED_JOB", "gamma", "deleted-job")}),
        ("NOT_IN_NEEDS", ARM1, {("NOT_IN_NEEDS", "gamma", "beta")}),
        ("NEEDS_MISSING_JOB", ARM2, {("NEEDS_MISSING_JOB", "gamma", "ghost")}),
        ("clean file yields zero", CLEAN, set()),
        ("`needs.` outside ${{ }} is NOT a finding", FALSE_POSITIVE, set()),
    ]
    ok = True
    with tempfile.TemporaryDirectory() as td:
        for name, text, expected in cases:
            p = pathlib.Path(td) / "wf.yml"
            p.write_text(text)
            got = set(check(p))
            if got == expected:
                print(f"  PASS  {name}")
            else:
                ok = False
                print(f"  FAIL  {name}\n        expected {expected}\n        got      {got}")
    print("self-test:", "ALL CONTROLS PASS" if ok else "FAILED")
    return 0 if ok else 1


def main(argv):
    if "--self-test" in argv:
        return self_test()

    paths = [a for a in argv if not a.startswith("-")]
    if not paths:
        wf = pathlib.Path(".github/workflows")
        paths = sorted(str(p) for p in wf.glob("*.yml")) + sorted(str(p) for p in wf.glob("*.yaml"))
    if not paths:
        print("no workflow files found -- refusing to report a clean result", file=sys.stderr)
        return 2

    total = 0
    for path in paths:
        res = check(path)
        if res:
            print(f"\n{path}")
            for kind, job, ref in res:
                print(f"  {kind:18} job={job:24} ref={ref}")
                total += 1

    print(f"\nworkflows scanned: {len(paths)}    findings: {total}")
    return 1 if total else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
