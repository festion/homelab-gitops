# deploy.yml heredoc variable audit

> **This document is preparation for a human edit. Nothing has changed in
> `.github/workflows/deploy.yml`.**
>
> The edit it prepares — converting the heredoc at `deploy.yml:195` from an
> unquoted `<< EOF` to a quoted `<<'EOF'` — must be made by a person, because
> the agent lane that produced this audit holds `contents`, `metadata` and
> `pull_requests` on this repo but deliberately **not** `workflows` (ops #2294:
> an agent that can rewrite CI can rewrite its own gates). Two dispatches have
> already failed on exactly that boundary, leaving nothing behind.
>
> Ownership of the full task stays with **ops #3382**. This file is the half
> that can be prepared in advance: the analysis. The edit itself is minutes
> once this table exists.

## Why the conversion is wanted

With an **unquoted** delimiter the GitHub runner expands the heredoc body
*before* sending it, so every variable that should be resolved on the
production host has to be written `\$VAR`. A single dropped backslash is
silent: the runner expands the name to nothing, the YAML stays valid, every
linter passes, and

```sh
cp -a "\$INSTALL_DIR" "\$BACKUP"      # intended
cp -a "" ""                          # what arrives if a backslash is lost
```

parses perfectly and runs as root on production.

**`deploy.yml`'s escaping is correct today** — the ops #3312 heredoc linter
reports zero errors against it. This is not a bug fix. It removes the
conditions under which that bug becomes possible.

The in-repo reference for the target form is `rollback.yml`, two files away:

```
.github/workflows/rollback.yml:136
    "$PROD_USER@$PROD_HOST" "REQUESTED='${REQUESTED}' bash -s" <<'EOF'
.github/workflows/rollback.yml:165
    "$PROD_USER@$PROD_HOST" "BACKUP='${BACKUP}' bash -s" <<'EOF'
```

## How this list was enumerated

Re-runnable against `origin/main`. The heredoc opens at `deploy.yml:195` and
closes at `deploy.yml:319`, so the body is lines **196–318** (123 lines):

```sh
git show origin/main:.github/workflows/deploy.yml | sed -n '196,318p' > body.txt

# host-side: escaped
grep -oE '\\\$\{?[A-Za-z_][A-Za-z0-9_]*\}?' body.txt | sort | uniq -c

# runner-side: unescaped
grep -nE '(^|[^\\])\$' body.txt
```

**Completeness check — the arithmetic closes exactly.** The body contains
**55** `$` characters. **54** are preceded by a backslash. **1** is not.

```sh
grep -o '\$'   body.txt | wc -l   # 55
grep -o '\\\$' body.txt | wc -l   # 54
grep -cE '(^|[^\\])\$' body.txt   # 1
```

That is the check a reviewer should re-run: if `54 + 1 ≠ 55`, this table is
missing a row.

## The table

Line numbers are absolute in `deploy.yml`. "Uses" counts references in the
body, not the assignment.

### Host-side — 12 names, resolved on the production host

These need nothing but the removal of their backslashes. Under `<<'EOF'` the
runner does not touch the body, so `$VAR` arrives literally and the host
expands it. **Leaving a `\$VAR` in place after the conversion would be the new
defect** — it would arrive on the host as the literal string `\$VAR`.

| Variable | Uses | Lines | Assigned at | Notes |
|---|---|---|---|---|
| `INSTALL_DIR` | 7 | 213–299 | 198 | `/opt/gitops` |
| `STAGING_DIR` | 8 | 206–299 | 199 | `/opt/gitops-new` |
| `OLD_DIR` | 3 | 297–306 | 200 | `/opt/gitops-old` |
| `BACKUP_DIR` | 7 | 224–318 | 201 | `/opt/gitops-backups` |
| `UNIT` | 3 | 281–286 | 202 | systemd unit path |
| `TARBALL` | 2 | 208, 305 | 203 | **see the crossing variable below** |
| `NEED_KB` | 3 | 229–231 | 227 | computed on host |
| `FREE_KB` | 3 | 229–231 | 228 | computed on host |
| `BACKUP` | 4 | 273–275 | 267 | computed on host |
| `rel` | 3 | 255–261 | — | `for rel in ...` loop variable, line 254 |
| `src` | 2 | 257–260 | 255 | derived from `rel` |
| `dst` | 3 | 258–260 | 256 | derived from `rel` |

`rel` is the one name with no `NAME=` assignment. It is **not** ambiguous: it
is bound by the `for rel in audit-history api/data wiki-agent.db logs;` loop at
line 254, entirely host-side. Recorded here because a mechanical
"assigned-before-use" check will flag it and a reviewer should not stop on it.

### Runner-side — 1 name

| Variable | Uses | Line | Origin |
|---|---|---|---|
| `TARBALL` | 1 | 203 | job-level `env:` at `deploy.yml:169` — `homelab-gitops-auditor-${{ github.sha }}.tar.gz` |

## ⚠ The crossing variable, and why this conversion is not purely mechanical

**`TARBALL` is the only value that crosses from runner to host, and it is the
only name that appears on *both* sides of the table.** Line 203 is:

```sh
TARBALL=/tmp/$TARBALL
#       ^^^^^ host-side assignment    ^^^^^^^^ runner-side expansion
```

Today the runner substitutes the filename and the host receives a finished
literal. Under `<<'EOF'` the runner stops touching the body, so `$TARBALL` on
the right-hand side becomes a *host-side* reference to a variable that is
undefined at that point — and the body runs under `set -euo pipefail`, so
**`set -u` aborts the deploy on line 203**, before anything is unpacked.

This is the failure mode to expect if the conversion is done by only changing
the delimiter and stripping backslashes. It fails loudly and early rather than
silently, which is fortunate, but it does fail.

## The replacement invocation

Pass the one crossing value explicitly in the ssh command string, matching
`rollback.yml`, and **delete body line 203**, which the passed value replaces:

```yaml
      - name: Atomic-swap install on prod
        run: |
          ssh $SSH_OPTS -o StrictHostKeyChecking=accept-new \
            "$PROD_USER@$PROD_HOST" "TARBALL='/tmp/${TARBALL}' bash -se" <<'EOF'
          set -euo pipefail

          INSTALL_DIR=/opt/gitops
          STAGING_DIR=/opt/gitops-new
          OLD_DIR=/opt/gitops-old
          BACKUP_DIR=/opt/gitops-backups
          UNIT=/etc/systemd/system/gitops-audit-api.service
          # TARBALL now arrives from the ssh command string above.
```

Notes on the exact form:

- `bash -se` is kept, not reduced to `bash -s`. `rollback.yml` uses `-s`, but
  `deploy.yml` uses `-se` today and dropping the `-e` would be an unrelated
  behavioural change in the same edit. (`set -euo pipefail` on the first body
  line makes it redundant, not wrong.)
- The single quotes around `'/tmp/${TARBALL}'` are what make the value safe on
  the remote command line; this matches `REQUESTED='${REQUESTED}'`.
- The full path is passed, rather than the bare filename with `/tmp/` prefixed
  host-side. The alternative — pass `TARBALL_NAME` and keep
  `TARBALL=/tmp/$TARBALL_NAME` in the body — also works and keeps the body
  self-describing. Either is defensible; the first is fewer moving parts and is
  what the snippet above shows.

## Counts

| | |
|---|---|
| `$` characters in body | 55 |
| escaped (`\$`) | 54 |
| unescaped | 1 |
| distinct variable names | 12 |
| host-side | 12 |
| runner-side | 1 |
| appearing on both sides | 1 (`TARBALL`) |

`12 + 1 = 13` exceeds the 12 distinct names precisely because `TARBALL` is
counted on both sides. That is not a bookkeeping error; it is the finding.

## Not covered by this audit

- **Nothing here has been executed.** The classification is read from the
  source, from the `env:` block at `deploy.yml:169`, and from shell semantics.
  No deploy was run and no conversion was tested. Whoever makes the edit should
  expect to be the first person to observe the result.
- The proposed ssh line is written to be valid shell but has **not** been run
  against the production host.
- **`--strict` on the ops #3312 heredoc linter is deliberately out of scope.**
  It is a separate behavioural change and belongs in its own review after the
  quoting lands.
- Lines *outside* the heredoc that reference `$PROD_HOST` and friends
  (`deploy.yml:185`, `189–191`, `325`, `328`) are ordinary runner-side shell in
  other steps and are unaffected by this change. They are excluded from the
  table on purpose; the table is scoped to the body at 196–318.
