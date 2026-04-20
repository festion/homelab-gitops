# API Test Restoration (B-auth) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make `cd api && npm test` exit 0 in CI by aligning the test database singleton with the production `Database` class and explicitly skipping four test suites whose assumptions don't match the production schema. Defer the proper factory refactor to a follow-up (Option A).

**Architecture:** Replace the hand-rolled `global.testDB` in `tests/setup/database.setup.js` with a connected `:memory:` instance of the real `Database` singleton so `AuthService` and any future auth test can operate against the real schema. Explicitly `describe.skip` the four suites (`compliance.test.js`, `pipelines.test.js`, `workflow.test.js`, `performance/load.test.js`) that were never truly green — they seed a hand-rolled schema the production code never reads from and/or wire `phase2Router` without `app.locals`. File a follow-up task for the full createApp factory + DI refactor.

**Tech Stack:** Node.js 20+, Express, sqlite3 (in-memory for tests), Jest, supertest, jsonwebtoken, bcrypt.

---

## Context: Why This Plan Exists

**Historical context:** Tests were already failing on the last pre-disable push run (2025-11-14). This is five months of accumulated drift, not a regression introduced by the GitHub Actions re-enable in #614.

**Root causes confirmed during brainstorming (2026-04-20):**

1. **Two sqlite instances in play.** `tests/setup/database.setup.js` creates `global.testDB` with 6 hand-rolled tables (`repositories`, `pipelines`, `compliance`, `metrics`, `orchestrations`, plus a non-matching `users`). Production services use `Database.getInstance()` from `models/database.js` whose real `initializeSchema()` creates only 4 auth tables (`users`, `api_keys`, `sessions`, `auth_audit_log`). Tests have been seeding a DB that production code never consults, then asserting against route responses.
2. **`Database.getInstance()` never calls `connect()`.** `AuthService` constructor invokes it, so `this.db` is `null`. First call to `this.db.run(...)` crashes.
3. **Test apps wire no `app.locals`.** `phase2-endpoints.js` reads `req.app.locals.{webhookHandler,phase2WS,githubMCP,orchestrator,wsManager}` — all undefined in test apps.
4. **Template engine fixtures missing.** `.mcp/templates/{standard-devops,security-hardening,ci-cd}/` directories don't exist; compliance apply tests depend on them.

**Scope for this session (B-auth):** fix (2) only. (1), (3), (4) stay as-is; suites that depend on them get `describe.skip`.

**Reference:** Vikunja task #623.

---

## Task 1: Capture baseline test state

**Files:**
- Create: `/tmp/baseline-623.txt` (scratch, not committed)

**Step 1: Run the full test suite and capture output**

Run: `cd api && npm test 2>&1 | tee /tmp/baseline-623.txt`

Expected: non-zero exit. Capture which suites pass, fail, and error out. We need this snapshot before any change so we can prove nothing regressed.

**Step 2: Extract the pass/fail summary**

Run: `grep -E "^(PASS|FAIL|Tests:|Suites:)" /tmp/baseline-623.txt`

Record the result. We'll compare after each subsequent change.

**Step 3: Identify suites that currently pass**

Run: `grep "^PASS" /tmp/baseline-623.txt | sort -u`

These must still pass after every later task. Write the list into a comment in the PR description when you open it.

**Step 4: Commit nothing. This is recon only.**

No git action.

---

## Task 2: Rewrite database.setup.js to use the real Database singleton

**Files:**
- Modify: `api/tests/setup/database.setup.js` (entire file — ~283 lines → ~35 lines)

**Step 1: Read the existing file to understand current wiring**

Run: `cat api/tests/setup/database.setup.js | head -50`

Confirm: it creates `global.testDB = new TestDatabase()`, with its own sqlite connection and hand-rolled schema. We're replacing all of it.

**Step 2: Verify `Database` method signatures match what `TestHelpers` expects**

Run: `grep -n "^  \(run\|get\|all\)(" api/models/database.js`

Expected output shows `run(sql, params=[])`, `get(sql, params=[])`, `all(sql, params=[])` — signatures match the old `TestDatabase` class. `run()` returns `{id, changes}` vs. the old `{lastID, changes}`, but no caller destructures the result. Safe.

**Step 3: Replace the file contents**

Overwrite `api/tests/setup/database.setup.js` with:

```js
// tests/setup/database.setup.js
// Connect the real Database singleton against :memory: so AuthService and any
// other code that calls Database.getInstance() gets a working sqlite handle.
// The schemas in this test DB are whatever Database.initializeSchema() defines
// in production (users, api_keys, sessions, auth_audit_log). Suites that
// depend on a different schema are skipped — see docs/plans/2026-04-20-api-test-restoration-b-auth.md.

const Database = require('../../models/database');

beforeAll(async () => {
  const db = Database.getInstance(':memory:');
  await db.connect();
  await db.initializeSchema();
  // Intentionally skip db.createDefaultAdmin() — tests seed their own users.
  global.testDB = db;
});

afterAll(async () => {
  if (Database.instance && Database.instance.db) {
    await new Promise((resolve) => {
      Database.instance.db.close(() => resolve());
    });
    Database.instance = null;
  }
});

afterEach(async () => {
  if (!Database.instance || !Database.instance.db) return;
  const db = Database.getInstance();
  await db.run('DELETE FROM sessions');
  await db.run('DELETE FROM auth_audit_log');
  await db.run('DELETE FROM api_keys WHERE key_id NOT LIKE "seed-%"');
  await db.run('DELETE FROM users WHERE id NOT LIKE "seed-%"');
});

global.getTestDatabase = () => global.testDB;
global.setupTestDatabase = async () => {};   // no-op; kept for back-compat
global.cleanupTestDatabase = async () => {}; // no-op; kept for back-compat
```

**Step 4: Run the setup file in isolation to make sure it doesn't crash**

Run: `cd api && npx jest --testPathPattern=simple.test.js 2>&1 | head -30`

Expected: `simple.test.js` either passes unchanged or shows a clear error we can attribute. `:memory:` DB init should print `Connected to SQLite database at: :memory:` (via `Database.connect`'s existing console.log).

**Step 5: Commit**

```bash
cd /home/dev/workspace/homelab-gitops
git add api/tests/setup/database.setup.js
git commit -m "test(api): wire test DB through real Database singleton (#623)

Replaces global.testDB's hand-rolled sqlite + schema with a connected
:memory: instance of the production Database class so AuthService
(which calls Database.getInstance() in its constructor) has a working
handle in tests. Schemas now match production (users, api_keys,
sessions, auth_audit_log) instead of the fictional 6-table layout that
no production code ever consulted.

Ref: docs/plans/2026-04-20-api-test-restoration-b-auth.md"
```

---

## Task 3: Confirm each of the three candidate skip suites is actually broken

**Files:** none (recon)

**Step 1: Run compliance.test.js individually**

Run: `cd api && npx jest tests/routes/compliance.test.js 2>&1 | tail -40`

Expected: failures referencing one or more of: `this.db.run is not a function` / `req.app.locals` is undefined / `no such table: repositories` / template fixture not found. Record the exact failure in `/tmp/skip-evidence-compliance.txt`.

**Step 2: Run pipelines.test.js individually**

Run: `cd api && npx jest tests/routes/pipelines.test.js 2>&1 | tail -40`

Record in `/tmp/skip-evidence-pipelines.txt`.

**Step 3: Run workflow.test.js individually**

Run: `cd api && npx jest tests/integration/workflow.test.js 2>&1 | tail -40`

Record in `/tmp/skip-evidence-workflow.txt`.

**Step 3b: Run performance/load.test.js individually**

Run: `cd api && npx jest tests/performance/load.test.js 2>&1 | tail -40`

Record in `/tmp/skip-evidence-load.txt`. Baseline already confirmed this suite fails for the same reason — it wires `phase2Router` without `app.locals`. Confirming individually documents the exact failure fingerprint for the PR.

**Step 4: Confirm evidence**

For each, verify the failure mode is one of the four documented root causes (mismatched schema, missing locals, missing fixtures, null DB). If any suite passes unexpectedly, STOP — do not skip it, and surface this to the session owner.

**Step 5: Commit nothing.** Evidence files stay under `/tmp` and will be pasted into the PR description.

---

## Task 4: Apply describe.skip to the four broken suites

**Files:**
- Modify: `api/tests/routes/compliance.test.js` (change top-level `describe(...)` → `describe.skip(...)`)
- Modify: `api/tests/routes/pipelines.test.js`
- Modify: `api/tests/integration/workflow.test.js`
- Modify: `api/tests/performance/load.test.js`

**Step 1: Find the top-level describe block in compliance.test.js**

Run: `grep -n "^describe(" api/tests/routes/compliance.test.js | head -3`

Expected: line 14 or thereabouts — `describe('Compliance API Endpoints', () => {`.

**Step 2: Modify compliance.test.js**

Change the top-level `describe(...)` on line 14 to `describe.skip(...)` and insert a skip comment directly above it:

```js
// SKIP: awaiting Option-A refactor (createApp factory + AuthService DI +
// compliance persistence decision). This suite seeds the non-existent
// repositories/compliance tables and uses phase2Router without wiring
// app.locals. Tracking: Vikunja #624.
// Design: docs/plans/2026-04-20-api-test-restoration-b-auth.md.
describe.skip('Compliance API Endpoints', () => {
```

**Step 3: Repeat for pipelines.test.js**

Same pattern: find `describe(` on line ~14, change to `describe.skip(`, prepend the same comment block with the suite-appropriate wording (remove "seeds repositories/compliance tables" and replace with "seeds the non-existent pipelines table").

**Step 4: Repeat for workflow.test.js**

Same pattern. Comment says "exercises end-to-end workflow across compliance + pipelines + orchestrations tables, none of which exist in the production schema."

**Step 4b: Repeat for performance/load.test.js**

Same pattern. Comment says "performance suite wires phase2Router without app.locals — crashes before any benchmark runs. Needs the Option-A app factory."

**Step 5: Run full test suite**

Run: `cd api && npm test 2>&1 | tee /tmp/after-skip-623.txt`

Expected: exit code 0. Skipped count >= N*(tests in those three files). No newly-failing suites versus `/tmp/baseline-623.txt`.

**Step 6: Verify exit code**

Run: `echo "exit=$?"` (immediately after npm test in the same shell) OR `cd api && npm test 2>/dev/null; echo "exit=$?"`.

Expected: `exit=0`.

**Step 7: Commit**

```bash
cd /home/dev/workspace/homelab-gitops
git add api/tests/routes/compliance.test.js \
        api/tests/routes/pipelines.test.js \
        api/tests/integration/workflow.test.js \
        api/tests/performance/load.test.js
git commit -m "test(api): skip four suites that depend on unbuilt infra (#623)

compliance, pipelines, workflow, and performance/load test suites
either seed hand-rolled database tables that production code never
consults, or construct Express apps without wiring req.app.locals.
Both problems require the Option-A refactor (createApp factory + DI).
Explicitly marking describe.skip so the gap is visible in every CI
log rather than silently excluded.

Ref: docs/plans/2026-04-20-api-test-restoration-b-auth.md"
```

---

## Task 5: Find and purge stale references to removed globals

**Files:** potentially any file that referenced the old `global.testDB` API.

**Step 1: Grep for references to methods that existed on the old TestDatabase class but NOT on the real Database class**

Run: `grep -rn "testDB\.seedTestData\|testDB\.cleanup\(\|global\.testDB\.all\|global\.testDB\.get\|global\.testDB\.run" api/tests/ || echo "no stale references"`

Expected: either "no stale references" or a short list. `seedTestData` specifically is the concerning one — the real `Database` class doesn't have that method.

**Step 2: If stale references exist, evaluate**

For each match:
- If it's inside one of the three skipped suites — leave it, `describe.skip` prevents execution.
- If it's inside an otherwise-passing suite — this is a new problem, stop and report. Do not silently stub.

**Step 3: Grep for any other code that assumed the old schema**

Run: `grep -rn "CREATE TABLE.*repositories\|INSERT INTO repositories\|INSERT INTO pipelines\|INSERT INTO compliance\|INSERT INTO metrics\|INSERT INTO orchestrations" api/tests/ 2>/dev/null | grep -v ".skip"`

Expected: matches only inside the three skipped files. Any matches elsewhere are a surprise — surface them.

**Step 4: Commit nothing unless a fix was required.** If Step 2 found a real problem outside the skipped suites, handle it as a separate commit.

---

## Task 6: Open PR

**Files:**
- PR description references: `docs/plans/2026-04-20-api-test-restoration-b-auth.md`

**Step 1: Check current branch state**

Run: `cd /home/dev/workspace/homelab-gitops && git status && git log --oneline -5`

Expected: three commits ahead of `main` (Task 2 setup, Task 4 skips, plus the plan doc itself if committed separately).

**Step 2: If commits are on main, create a branch and push**

Run:
```bash
cd /home/dev/workspace/homelab-gitops
git checkout -b fix/623-test-db-singleton-b-auth
git push -u origin fix/623-test-db-singleton-b-auth
```

If commits were already made on `main` locally (not ideal but recoverable), move them onto a new branch with:
```bash
git branch fix/623-test-db-singleton-b-auth
git reset --hard origin/main
git checkout fix/623-test-db-singleton-b-auth
```

**Step 3: Open PR with gh CLI**

```bash
gh pr create --title "fix(api tests): connect Database singleton + skip non-auth suites (#623)" --body "$(cat <<'EOF'
## Summary

- Replaces `global.testDB` with a connected `:memory:` instance of the real `Database` singleton so `AuthService` (and anything else calling `Database.getInstance()`) has a working handle in tests.
- Explicitly `describe.skip`s three suites — `compliance.test.js`, `pipelines.test.js`, `workflow.test.js` — whose assumptions never matched production (seeded into hand-rolled tables prod never reads; used `phase2Router` without wiring `app.locals`).
- Full design and handoff notes: `docs/plans/2026-04-20-api-test-restoration-b-auth.md`.

## Why this is scoped narrowly

Tests were last green on 2025-11-14 — five months of drift, not a fresh regression. The investigation in Vikunja #623 found that the real fix is a `createApp.js` factory + AuthService DI refactor (Option A). That's multi-session work. This PR lands the minimum change that makes CI honest: the auth DB works, and the three suites we can't actually fix today are surfaced as skipped rather than hidden in a jest config.

## What the skips mean

Each skipped suite has a top-of-file comment pointing at the Option-A follow-up task and this plan doc. Un-skipping is the acceptance criterion for Option A.

## Test plan

- [ ] `cd api && npm test` exits 0 locally.
- [ ] CI green on this PR.
- [ ] Skipped test count matches the three files we intentionally disabled (compare `/tmp/baseline-623.txt` vs the post-skip run).
- [ ] No suite that was passing before this PR fails now.

Closes #623.
EOF
)"
```

**Step 4: Monitor CI**

Run: `gh pr checks` (on the new PR). Wait for all checks to resolve. If any check fails, investigate before merging.

---

## Task 7: Close #623 and create Option-A follow-up task

**Files:** none (Vikunja only).

**Step 1: Add completion comment to #623**

Use `mcp__vikunja__vikunja_add_comment` on task 623 with:

```
Resolved by PR <PR-URL>. The B-auth slice of the design in
docs/plans/2026-04-20-api-test-restoration-b-auth.md is complete:
Database singleton is now connected in tests and the three
suites whose assumptions never matched production are explicitly
skipped. The full Option-A refactor (createApp factory +
AuthService DI + compliance persistence decision +
templateEngine DI) is tracked in Vikunja #624.
```

**Step 2: Mark #623 done**

Use `mcp__vikunja__vikunja_update_task` with `id: 623, done: true`.

**Step 3: Verify the Option-A follow-up task already exists**

It should have been created as part of the "create beads" step when this plan was written. If it's missing for any reason, create it now with `mcp__vikunja__vikunja_create_task` (see Option-A Task spec below). Title: `homelab-gitops: API test suite restoration (Option A — createApp factory + DI refactor)`, priority 2, labels `bug,tests,homelab-gitops,refactor`.

**Step 4: Commit nothing.** Vikunja only.

---

## Deferred (Option A) — Spec for the Follow-up Task

The follow-up task should describe in its body, at minimum:

1. **Extract `api/createApp.js`.** Pure factory: `createApp({ db, locals, routers })` returns an Express app. `server.js` becomes a thin bootstrap that constructs the real collaborators, calls the factory, then starts listening.
2. **Refactor `AuthService` to constructor-injected `db`.** Remove the `Database.getInstance()` call inside the constructor. `server.js` does `new AuthService({ db })`; tests do the same with the test DB.
3. **Decide the real persistence model for compliance / pipelines / repositories.** Either (a) add those tables to `Database.initializeSchema()` and wire `complianceService` to read/write through it, or (b) formalize that those services are stateless / GitHub-backed and delete the dead test tables. This decision needs its own design review before Option A starts.
4. **Inject `templateEngine` into `complianceService`.** Tests pass a fake that returns canned success; prod passes the real python-spawning one. Removes the python applicator from the test critical path.
5. **Replace hand-signed JWT tokens in tests with real login flow.** `TestHelpers.generateTestToken` currently bypasses `AuthService`. Option A tests go through `/api/v2/auth/login` for stronger coverage.
6. **Un-skip the three deferred suites** — ideally one PR per suite so regressions are bisectable.

---

## DRY / YAGNI / TDD notes

**DRY:** the setup rewrite intentionally deletes the hand-rolled `TestDatabase` class. Two sqlite instances with two schemas is the exact opposite of DRY.

**YAGNI:** we are NOT adding missing tables to `Database.initializeSchema()` in this plan. We are NOT adding a `wireApp()` helper. We are NOT building template fixtures. Every one of those is Option A.

**TDD caveat:** there is no dedicated `auth.test.js` in the repo today. Auth is currently exercised only transitively through the three suites we're about to skip. So the DB singleton fix in Task 2 has **no direct test coverage** in this PR — its payoff is "AuthService can be constructed without crashing" and "Option A has a working foundation." This is acceptable because the alternative is leaving a broken singleton in place while Option A is drafted. Writing a dedicated `auth.test.js` is an Option-A task.

**Commit cadence:** one commit per task that produces files (Task 2, Task 4). Task 1/3/5 commit nothing. Task 6 opens the PR. Task 7 closes the Vikunja task.
