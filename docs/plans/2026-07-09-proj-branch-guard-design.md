# Session-Start Branch Guard — Design

**Date:** 2026-07-09
**Status:** Design (approved via brainstorming)
**Problem owner:** dev (CT 128)

## Problem

Resuming or starting work, I frequently land in a repo with **HEAD on `main`**
and then make my own edits there. The changes are good — they're just on the
wrong branch. At commit time (often when `git-guard` blocks a commit on `main`)
I have to stash/branch/relocate the work before I can commit. This recurs across
projects and is pure toil.

## Goal

**Prevention at session start, non-blocking.** When I begin work on a project,
if HEAD is on the default branch, automatically move me onto a properly-named
feature branch — carrying any changes I've already made along with me — and
tell me the name (with an easy override) rather than forcing a choice.

## Decisions (from brainstorming)

| Decision | Choice |
|---|---|
| Dirty-state shape being solved | My own changes, on the wrong branch |
| Intervention point | At session start (prevention, not cure) |
| Branch selection | Smart default + override (auto-name, announced, non-blocking) |
| Trigger surface | The `/proj` activation flow (explicit "starting work" signal that knows the repo) |
| Name format (task known) | `<proj>/<id>-<slug>` (e.g. `homelab-gitops/1847-learnings-extractor`) |
| Name format (generic fallback) | `<proj>/<YYYY-MM-DD>` (same namespace, sorts together) |
| Timing | **Eager-generic, then rename-on-context** |

### Why `/proj`, not a SessionStart hook

`/proj` is the explicit "I'm starting work on project X" signal and it already
knows the repo path. A blanket SessionStart hook was rejected: it can't reliably
tell which repo (cwd defaults to the `mcp-servers`/workspace container), it fires
on pure ops/monitor sessions where a branch is unwanted, and mutating the shared
`/home/dev/workspace` checkout from a hook is itself the collision-prone action
that has caused wrong-branch incidents.

### Eager-generic, then rename-on-context

At activation we usually don't yet know the task (`/proj homelab-gitops` with no
intent = no task picked). If we waited for the task before branching, work could
re-accumulate on `main` — the exact problem we're killing. So:

1. **Eager:** on activation, if HEAD is on the default branch, immediately cut a
   generic `<proj>/<date>` branch. Prevention is unconditional — never on `main`.
2. **Rename-on-context:** when a task becomes known this session (INTENT that
   resolves to a task, or the first task started from the queue), `git branch -m`
   to the task-derived name.

Compounding benefit: a task-ID-encoded branch makes commits/PRs linkable back to
Vikunja (auto-close, `shipit`, "close beads as you go"). The naming is not merely
cosmetic.

Known limitation: multiple tasks in one session keep the branch named after the
*first* task; switching tasks is a manual re-branch. Acceptable — one-task-per-
session is the norm per the beads workflow.

## Mechanism

Two small **deterministic helper scripts** in `~/dotfiles/bin/`, invoked by the
`/proj` command. A guardrail should be deterministic and allowlistable, not
dependent on the model remembering to run git commands.

### `proj-branch-guard <repo-path> <project>` — the prevention step

Runs during `/proj` activation, right after Serena/Vikunja setup.

1. Resolve the default branch: `git symbolic-ref refs/remotes/origin/HEAD`
   → fallback local `main` → local `master`.
2. Get current branch: `git -C <repo> rev-parse --abbrev-ref HEAD`.
3. **If current == default:** list existing `<project>/*` branches (for the
   "resume instead" override), then `git checkout -b <project>/<YYYY-MM-DD>`
   (append `-2`, `-3` on collision). `checkout -b` preserves the working tree, so
   staged + unstaged changes ride onto the new branch — no stash dance.
4. **If current != default:** no-op; print the current branch. (Optionally warn
   if it is already merged into default.)
5. Print the branch name, count of carried-over changed files, and the override
   hints.

### `proj-branch-rename <repo-path> <project> <task-id> <task-title>` — rename-on-context

Slugify the title (lowercase, `[^a-z0-9]+`→`-`, collapse/trim, cap ~40 chars;
empty → `<id>` alone) and `git branch -m` to `<project>/<id>-<slug>`. Idempotent.

The `/proj` command gets **one new step** ("run `proj-branch-guard`") plus a note:
when INTENT resolves to a task, call `proj-branch-rename`.

## Edge cases & safety rails

### `proj-branch-guard` must NOT branch (no-op + print why)

- **Not a git repo / detached HEAD** — bail cleanly, print state.
- **Already on a non-default branch** — resuming real work; leave it. Optional
  warning if that branch is already merged into `main`.
- **Repo path == `/home/dev/workspace`** (the container repo with nested clones)
  — refuse hard. Projects always resolve to a subdir clone; this only trips on
  misuse.
- **Default branch unresolvable** — after the `origin/HEAD → main → master` chain,
  if none resolves and current isn't a main/master-named branch, no-op (can't
  define "wrong branch").

### `proj-branch-guard` happy path

- Current == default → list existing `<project>/*` branches **first**, then
  `checkout -b <project>/<date>` with `-2/-3` collision suffix. Working tree
  carried along; a `.claude/PROJECT_INDEX.md` left dirty by the SessionStart hook
  simply rides forward, harmless.
- Tiny race (operator moves HEAD between check and checkout) → checkout errors,
  just re-run. Not worth engineering against.

### `proj-branch-rename` safety

- **Never rename `main`/`master`.** Only act if the current branch matches the
  generic `<project>/<date>` pattern — the critical guard against `branch -m main`.
- **Slugify** as above; require both id + title, else skip.
- **Target already exists** (task branched before) → don't clobber; warn, let me
  switch.
- **Upstream already set** (branch pushed) → skip rename to avoid orphaning the
  remote branch; warn.
- **Idempotent** — already on `<project>/<digits>-…` → no-op.

### Cross-cutting

- Allowlist both helpers in settings (`Bash(proj-branch-guard:*)`,
  `Bash(proj-branch-rename:*)`) so they never prompt.
- A per-repo `.no-auto-branch` marker file opts a repo out entirely (for repos I
  only ever read, e.g. ops/monitor).
- `git-guard` (PreToolUse) blocks *commits* on `main`, not *checkouts*, so it does
  not interfere with the guard. Using `git -C <repo>` (not `cd <repo> &&`) avoids
  the guard's `cd`-anchored repo resolution — irrelevant here since we don't commit.

## Override / non-blocking UX

After the guard runs, `/proj` announces, e.g.:

```
Branched to homelab-gitops/2026-07-09 (was on main, carried 3 changed files).
  Rename:          git branch -m <name>
  Resume instead:  git checkout <existing>
  Existing homelab-gitops/* branches: homelab-gitops/1830-x, homelab-gitops/2026-07-08
```

Nothing blocks; the default is applied and the escape hatches are printed.

## Future escalation (out of scope for v1)

For specific repos where concurrent-operator HEAD moves actually recur, escalate
from in-place branching to a **per-session git worktree** (the only *structural*
guarantee against HEAD being yanked back to `main`). Gate behind a small
per-repo allowlist. Deferred until the in-place guard proves insufficient.

## Implementation checklist

- [ ] `~/dotfiles/bin/proj-branch-guard` (+ unit-ish smoke test in a scratch repo)
- [ ] `~/dotfiles/bin/proj-branch-rename` (+ slugify + safety-rail tests)
- [ ] Wire both into the `/proj` command markdown (one guard step; rename note)
- [ ] Allowlist entries in settings; document the `.no-auto-branch` opt-out
- [ ] Manual verification: clean-on-main, dirty-on-main, on-feature-branch,
      detached, container-repo, collision-suffix, rename-idempotency,
      never-rename-main
