#!/usr/bin/env python3
"""Lint the shell that workflows send to a REMOTE host inside a heredoc.

WHY THIS EXISTS
---------------
ops #3312. deploy.yml's production install step is a heredoc piped to a shell
on CT 123:

    ssh $SSH_OPTS "$PROD_USER@$PROD_HOST" bash -se << EOF
      INSTALL_DIR=/opt/gitops
      cp -a "\\$INSTALL_DIR" "\\$BACKUP.partial"
    EOF

The delimiter is UNQUOTED, so the GitHub runner's shell expands the body before
sending it. `\\$FOO` reaches the host as `$FOO`; a bare `$FOO` is expanded by the
RUNNER, where it is almost always empty.

Lose one backslash and the failure is silent and destructive-shaped.
`rm -rf "\\$STAGING"` collapsing to `rm -rf ""` is a harmless no-op -- but
`cp -a "\\$INSTALL_DIR" "\\$BACKUP"` collapsing to `cp -a "" ""` is not, and it
PARSES PERFECTLY. The YAML stays valid, every linter passes, and the error
appears at deploy time, as root, on production.

WHY NO EXISTING CHECK COVERS IT
-------------------------------
    code-quality.yml         shellcheck -> scripts/*.sh
    gitops-audit.yml         shellcheck -> find scripts -name "*.sh"
    security-enhanced.yml    shellcheck -> scripts
    lint-and-test.yml        bash test-installer.sh; npm test

    .github/workflows/*.yml heredoc bodies    COVERED BY NOTHING

The one file whose shell runs as root on the production host is the one file no
shell linter reads.

TWO DEFECT CLASSES, AND THE SECOND IS THE REASON `bash -n` ALONE IS NOT ENOUGH
-----------------------------------------------------------------------------
    SYNTAX          a dropped backslash that breaks the shell grammar.
                    Caught by `bash -n` on the reconstruction.
    EMPTY_OPERAND   a dropped backslash on a variable the HOST should expand.
                    The runner expands it to nothing, and the result is still
                    valid shell -- `cp -a "" ""`. `bash -n` says PASS.

The second is the dangerous one and it needs a different probe: reconstruct a
SECOND time substituting the empty string (what the runner actually produces
for an undefined name) and report any command whose operand became empty.

THE SAFE FORM ALREADY EXISTS IN THIS REPO, ONE FILE OVER
--------------------------------------------------------
rollback.yml sends its remote script with a QUOTED delimiter and passes the
values it needs explicitly:

    ssh ... "$PROD_USER@$PROD_HOST" "BACKUP='${BACKUP}' bash -s" <<'EOF'

A quoted delimiter means the runner does not touch the body at all, so the
whole escaping class disappears -- there is nothing to get wrong. This checker
therefore does not merely validate escaping inside the unquoted form; it
REPORTS the unquoted form itself as UNQUOTED_DELIMITER, because eliminating the
class beats detecting instances of it.

CONTROL DISCIPLINE -- without this the check is decoration
----------------------------------------------------------
`bash -n` on an empty string SUCCEEDS. A parser that silently reconstructs
nothing prints a clean pass, which is the reassuring direction. So:

  * an extracted body that is empty, or whose reconstruction loses lines, is a
    FAILURE (EMPTY_BODY / LINE_COUNT_DRIFT), never a quiet skip;
  * finding NO remote heredocs at all is a FAILURE (NO_TARGETS), not a pass --
    this repo is known to contain at least one, so a zero means the matcher
    broke, not that the hazard is gone. Refuse rather than report a clean zero;
  * `--self-test` fire-tests the checker against fixtures whose verdicts are
    known, including a dropped-backslash case that MUST go red. Run it in CI
    before the real check, so a checker that cannot fail is caught before its
    silence is trusted.

Usage:
    python3 scripts/check-workflow-heredocs.py --self-test
    python3 scripts/check-workflow-heredocs.py [--root .] [--json]

Exit: 0 clean, 1 findings, 2 the checker could not run (refuses to report).
"""

import argparse
import json
import os
import re
import subprocess
import sys
import tempfile

# A remote shell invocation feeding a heredoc. The command must reach a shell
# reading its PROGRAM from stdin -- `bash -s`, `sh -se`, `bash -lse`. A plain
# `cat > file << EOF` is a LOCAL redirect and is deliberately out of scope: its
# body is data, not a program, and linting it would produce noise that teaches
# people to ignore this check.
_REMOTE_HEREDOC = re.compile(
    r"""(?P<pre>\bssh\b[^\n]*?)          # an ssh invocation ...
        \b(?:ba|z|k)?sh\b[^\n]*?         # ... reaching a shell
        -[a-z]*s[a-z]*\b                 # ... with -s (program on stdin)
        [^\n]*?
        <<-?\s*(?P<q>['"]?)(?P<delim>[A-Za-z_][A-Za-z0-9_]*)(?P=q)\s*$""",
    re.X,
)

# $VAR / ${VAR} NOT preceded by a backslash -- i.e. what the RUNNER expands.
_UNESCAPED_VAR = re.compile(r"(?<!\\)\$(\{[A-Za-z_][A-Za-z0-9_]*\}|[A-Za-z_][A-Za-z0-9_]*)")
_MARKER = "__RUNNER_WOULD_EXPAND_THIS__"


# ADVISORY vs ERROR, and the distinction is deliberate rather than a softening.
#
# ERROR kinds are DEFECTS: the reconstruction does not parse, the body is empty,
# the terminator is missing, or a runner-expanded variable leaves an empty
# operand on a destructive command. Each is a thing that is wrong right now.
#
# UNQUOTED_DELIMITER is not a defect -- deploy.yml's escaping is currently
# CORRECT. It is the FORM that makes the defects possible, and converting it is
# a change to the production deploy path that deserves its own review. Wiring
# this check into CI as a hard failure would red every PR until that unrelated
# change lands, and a check people must disable to merge is a check people
# disable. So it reports, loudly, and `--strict` promotes it the day the
# conversion happens.
#
# ⚠ A non-gating warning IS decoration if nothing ever acts on it. The thing
# that stops that here is that --strict exists and is one flag away, and the
# conversion is filed as its own card -- not that the warning is worded firmly.
_ADVISORY = frozenset({"UNQUOTED_DELIMITER"})


class Finding:
    def __init__(self, kind, path, line, detail):
        self.kind, self.path, self.line, self.detail = kind, path, line, detail

    def __str__(self):
        return f"{self.kind:<20} {self.path}:{self.line}  {self.detail}"

    def as_dict(self):
        return {"kind": self.kind, "file": self.path,
                "line": self.line, "detail": self.detail}


def _logical_lines(lines):
    """Join backslash-continued lines, keeping each join's FIRST line number.

    ops #3312, found while building this checker: rollback.yml writes

        ssh $SSH_OPTS -o StrictHostKeyChecking=accept-new \\
          "$PROD_USER@$PROD_HOST" "BACKUP='${BACKUP}' bash -s" <<'EOF'

    -- the `ssh` and the `<<` are on DIFFERENT physical lines. A single-line
    matcher finds deploy.yml and reports "1 remote heredoc", missing both of
    rollback.yml's, and the count looks entirely reasonable. That is the same
    shape as the bug being linted: a bounded read producing a confident wrong
    answer, and the only tell was arithmetic -- 1 found where 3 were known.

    Returns [(first_physical_line_number, joined_text, index_of_last_physical)].
    """
    out, i = [], 0
    while i < len(lines):
        start, buf = i, lines[i]
        while buf.rstrip().endswith("\\") and i + 1 < len(lines):
            buf = buf.rstrip()[:-1].rstrip() + " " + lines[i + 1].strip()
            i += 1
        out.append((start + 1, buf, i))
        i += 1
    return out


def find_heredocs(path, text):
    """Yield (start_line, delim, quoted, body_lines, closed) per remote heredoc."""
    lines = text.splitlines()
    joined = _logical_lines(lines)
    k = 0
    while k < len(joined):
        lineno, logical, last_phys = joined[k]
        m = _REMOTE_HEREDOC.search(logical)
        if not m:
            k += 1
            continue
        delim, quoted = m.group("delim"), bool(m.group("q"))
        body, j = [], last_phys + 1
        while j < len(lines) and lines[j].strip() != delim:
            body.append(lines[j])
            j += 1
        # j == len(lines) means the terminator was never found. Report it rather
        # than silently treating the rest of the file as the body.
        yield (lineno, delim, quoted, body, j < len(lines))
        while k < len(joined) and joined[k][2] < j:
            k += 1
        k += 1


def reconstruct(body, substitute):
    """The bytes the REMOTE host receives, given how the runner expands.

    substitute is what an unescaped $VAR becomes on the runner: a marker (to
    check syntax) or "" (to check the empty-operand class).
    """
    out = []
    for ln in body:
        ln = _UNESCAPED_VAR.sub(substitute, ln)
        ln = ln.replace("\\$", "$")          # \$FOO reaches the host as $FOO
        out.append(ln)
    return "\n".join(out)


def bash_n(script):
    with tempfile.NamedTemporaryFile("w", suffix=".sh", delete=False) as fh:
        fh.write(script)
        tmp = fh.name
    try:
        p = subprocess.run(["bash", "-n", tmp], capture_output=True, text=True)
        return p.returncode, (p.stderr or "").strip()
    finally:
        os.unlink(tmp)


# Commands where an empty operand is destructive or corrupting, as opposed to a
# harmless no-op. `rm -rf ""` fails safely; `cp -a "" ""` does not.
_DANGEROUS_WITH_EMPTY = ("cp", "mv", "rsync", "install", "ln", "tar", "chown",
                         "chmod", "systemctl", "rm")
_EMPTY_OPERAND = re.compile(r"""(?:^|\s)(['"])\1(?=\s|$)""")


def check_file(path, text):
    findings, seen = [], 0
    for start, delim, quoted, body, closed in find_heredocs(path, text):
        seen += 1
        if not closed:
            findings.append(Finding("UNTERMINATED", path, start,
                                    f"heredoc <<{delim} has no closing {delim}"))
            continue
        if not [b for b in body if b.strip()]:
            findings.append(Finding("EMPTY_BODY", path, start,
                                    f"<<{delim} body is empty -- bash -n would "
                                    f"pass on nothing"))
            continue
        if quoted:
            # Quoted delimiter: the runner does not touch it. Lint verbatim.
            rc, err = bash_n("\n".join(body))
            if rc != 0:
                findings.append(Finding("SYNTAX", path, start,
                                        f"<<'{delim}' body: {err.splitlines()[0]}"
                                        if err else f"<<'{delim}' body: bash -n rc={rc}"))
            continue

        findings.append(Finding(
            "UNQUOTED_DELIMITER", path, start,
            f"<<{delim} is expanded by the RUNNER before sending. Use <<'{delim}' "
            f"and pass values explicitly (rollback.yml does this) -- that removes "
            f"the escaping class instead of relying on every \\$ being right."))

        recon = reconstruct(body, _MARKER)
        if len(recon.splitlines()) != len(body):
            findings.append(Finding("LINE_COUNT_DRIFT", path, start,
                                    f"reconstructed {len(recon.splitlines())} lines "
                                    f"from {len(body)} -- the extractor is wrong, "
                                    f"so any pass below is meaningless"))
            continue
        rc, err = bash_n(recon)
        if rc != 0:
            findings.append(Finding("SYNTAX", path, start,
                                    f"reconstruction fails bash -n: "
                                    f"{err.splitlines()[0] if err else 'rc=' + str(rc)}"))

        # EMPTY_OPERAND: the class bash -n cannot see.
        empty = reconstruct(body, "")
        for off, ln in enumerate(empty.splitlines()):
            s = ln.strip()
            if not s or s.startswith("#"):
                continue
            if not _EMPTY_OPERAND.search(ln):
                continue
            head = s.split()[0].lstrip("$(").strip("\"'")
            if head in _DANGEROUS_WITH_EMPTY or any(
                    f" {c} " in f" {s} " for c in _DANGEROUS_WITH_EMPTY):
                findings.append(Finding(
                    "EMPTY_OPERAND", path, start + 1 + off,
                    f"a runner-expanded var leaves an empty operand and this "
                    f"still PARSES: {s[:90]}"))
    return findings, seen


def run(root):
    wf_dir = os.path.join(root, ".github", "workflows")
    if not os.path.isdir(wf_dir):
        return None, None, f"no .github/workflows under {root!r}"
    findings, targets, files = [], 0, 0
    for name in sorted(os.listdir(wf_dir)):
        if not name.endswith((".yml", ".yaml")):
            continue
        path = os.path.join(".github", "workflows", name)
        with open(os.path.join(wf_dir, name), encoding="utf-8") as fh:
            text = fh.read()
        files += 1
        f, seen = check_file(path, text)
        findings.extend(f)
        targets += seen
    return findings, (files, targets), None


# --------------------------------------------------------------------------
# SELF-TEST -- the fire test, built in and run in CI before the real check.
# Each fixture's verdict is known, and the dropped-backslash arm MUST go red.
# --------------------------------------------------------------------------
_GOOD = r"""jobs:
  deploy:
    steps:
      - run: |
          ssh $SSH_OPTS "$PROD_USER@$PROD_HOST" bash -se << EOF
            INSTALL_DIR=/opt/gitops
            BACKUP=/opt/gitops-backups/x
            cp -a "\$INSTALL_DIR" "\$BACKUP.partial"
            mv "\$BACKUP.partial" "\$BACKUP"
          EOF
"""
_DROPPED_BACKSLASH = _GOOD.replace(r'cp -a "\$INSTALL_DIR" "\$BACKUP.partial"',
                                   r'cp -a "$INSTALL_DIR" "\$BACKUP.partial"')
_BROKEN_SYNTAX = _GOOD.replace(r'mv "\$BACKUP.partial" "\$BACKUP"',
                               r'if [ -d "\$BACKUP" ]; then')
_EMPTY = """jobs:
  deploy:
    steps:
      - run: |
          ssh $SSH_OPTS "$H" bash -se << EOF
          EOF
"""
_QUOTED_SAFE = r"""jobs:
  rollback:
    steps:
      - run: |
          ssh $SSH_OPTS "$PROD_USER@$PROD_HOST" "BACKUP='${BACKUP}' bash -s" <<'EOF'
            set -euo pipefail
            cp -a "$BACKUP" /opt/gitops
          EOF
"""
_LOCAL_CAT = """jobs:
  report:
    steps:
      - run: |
          cat > report.json << EOF
          { "v": "$VERSION" }
          EOF
"""

_CONTINUED_UNQUOTED = """jobs:
  deploy:
    steps:
      - run: |
          ssh $SSH_OPTS -o StrictHostKeyChecking=accept-new \\
            "$PROD_USER@$PROD_HOST" bash -se << EOF
            echo hi
          EOF
"""
_CONTINUED_QUOTED = """jobs:
  rollback:
    steps:
      - run: |
          ssh $SSH_OPTS -o StrictHostKeyChecking=accept-new \\
            "$PROD_USER@$PROD_HOST" "BACKUP='${BACKUP}' bash -s" <<'EOF'
            set -euo pipefail
            cp -a "$BACKUP" /opt/gitops
          EOF
"""

_CASES = [
    ("good_escaping",      _GOOD,               {"UNQUOTED_DELIMITER"}),
    ("dropped_backslash",  _DROPPED_BACKSLASH,  {"UNQUOTED_DELIMITER", "EMPTY_OPERAND"}),
    ("broken_syntax",      _BROKEN_SYNTAX,      {"UNQUOTED_DELIMITER", "SYNTAX"}),
    ("empty_body",         _EMPTY,              {"EMPTY_BODY"}),
    ("quoted_is_safe",     _QUOTED_SAFE,        set()),
    ("local_cat_ignored",  _LOCAL_CAT,          set()),
    # ops #3312: the continuation form. Without _logical_lines this fixture
    # reports NOTHING and looks identical to "quoted, therefore safe" -- a miss
    # wearing the marks of a pass. Its EXPECTATION is a finding, so the fixture
    # fails loudly if the joiner regresses.
    ("continued_unquoted", _CONTINUED_UNQUOTED, {"UNQUOTED_DELIMITER"}),
    ("continued_quoted",   _CONTINUED_QUOTED,   set()),
]


def self_test():
    ok = True
    ran = 0
    print("self-test: each fixture's expected verdict is known in advance")
    for name, text, expect in _CASES:
        findings, seen = check_file(f"<fixture:{name}>", text)
        got = {f.kind for f in findings}
        ran += 1
        status = "PASS" if got == expect else "FAIL"
        if got != expect:
            ok = False
        print(f"  {status}  {name:<20} heredocs={seen}  "
              f"expected={sorted(expect) or ['(clean)']}  got={sorted(got) or ['(clean)']}")
    # Coverage arithmetic: a self-test that silently skipped cases proves nothing.
    print(f"  CONTROL: {ran} of {len(_CASES)} fixtures ran")
    if ran != len(_CASES):
        print("  ⛔ not every fixture ran -- the result above is bounded, not clean")
        ok = False
    # The load-bearing arm, stated separately so a reader can see it was checked:
    # the checker must DISCRIMINATE, not just report something for everything.
    clean = {n for n, _, e in _CASES if not e}
    noisy = {n for n, _, e in _CASES if e}
    print(f"  CONTROL: {len(noisy)} fixtures must report, {len(clean)} must stay "
          f"clean ({', '.join(sorted(clean))}) -- a checker that flags everything "
          f"would fail the second group")
    print("self-test:", "OK" if ok else "FAILED")
    return 0 if ok else 1


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--root", default=".")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--self-test", action="store_true")
    ap.add_argument("--strict", action="store_true",
                    help="also FAIL on ADVISORY findings (UNQUOTED_DELIMITER). "
                         "Turn this on once deploy.yml is converted to <<'EOF'; "
                         "it is off by default only so wiring this check into CI "
                         "does not red the build on a pre-existing condition.")
    args = ap.parse_args(argv)

    if args.self_test:
        return self_test()

    findings, counts, err = run(args.root)
    if err:
        print(f"⛔ CANNOT CHECK: {err}", file=sys.stderr)
        return 2
    files, targets = counts
    if targets == 0:
        print(f"⛔ NO_TARGETS: scanned {files} workflow file(s) and matched ZERO "
              f"remote heredocs. This repo is known to contain at least one, so a "
              f"zero here means the MATCHER broke, not that the hazard is gone. "
              f"Refusing to report a clean result.", file=sys.stderr)
        return 2

    errors = [f for f in findings if f.kind not in _ADVISORY]
    advisories = [f for f in findings if f.kind in _ADVISORY]

    if args.json:
        print(json.dumps({"files": files, "heredocs": targets,
                          "errors": [f.as_dict() for f in errors],
                          "advisories": [f.as_dict() for f in advisories]}, indent=2))
    else:
        print(f"scanned {files} workflow file(s); {targets} remote heredoc(s) found")
        for f in findings:
            sev = "ADVISORY" if f.kind in _ADVISORY else "ERROR"
            print(f"  [{sev}] {f}")
        print(f"{len(errors)} error(s), {len(findings) - len(errors)} advisory")
        if errors:
            print("FAIL: a remote heredoc is broken in a way that only shows up "
                  "at deploy time, as root, on production.")
        elif advisories and not args.strict:
            print("PASS with advisories. These are not escaping BUGS -- they are "
                  "the unquoted-delimiter FORM, which is what makes the bugs "
                  "possible. Run with --strict once they are converted.")
    return 1 if (errors or (advisories and args.strict)) else 0


if __name__ == "__main__":
    sys.exit(main())
