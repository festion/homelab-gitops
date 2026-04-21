# Option A — `createApp` Factory + Hybrid DI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Un-skip the four test suites that B-auth (PR #91) marked `describe.skip`, by extracting a testable `createApp(services)` factory, converting three service classes to constructor-injected dependencies, and replacing dead `TestHelpers.insertTestData(...)` seeding with fake-service-state setup.

**Architecture:** Express app construction moves into `api/createApp.js`. Services are constructed outside the factory and passed in; the factory pins them to `app.locals` (consistent with the current `phase2-endpoints.js` pattern). `server.js` shrinks to a ~80-line bootstrap. Tests call `createApp({ service: fakeSvc, ... })` with plain-object fakes from `api/tests/fakes/`. No new tables in the shared `Database` — production persistence stays exactly as it is today (config + GitHub API + in-memory + `metricsStorage.js`'s separate sqlite). See recon findings in Section 1.

**Tech Stack:** Node 20+, Express, Jest, supertest, sqlite3 (auth only), GitHub Actions API (pipelines — via mock `githubMCP`).

---

## Scope Across 5 PRs

This plan covers **PR 1** in bite-sized detail. PRs 2–5 are sketched; each gets its own Vikunja bead at epic granularity.

| PR | Scope | Vikunja |
|----|-------|---------|
| **1** | Foundation (`createApp.js` + 3 service constructors) + un-skip `pipelines.test.js` | covered here |
| **2** | Un-skip `compliance.test.js`; add `templateEngine` fake | separate bead |
| **3** | Un-skip `workflow.test.js` (integration); add `webhookHandler`/`orchestrator` fakes | separate bead |
| **4** | Un-skip `performance/load.test.js` | separate bead |
| **5** | Restore `coverageThreshold` in `jest.config.js` (closes #635) | separate bead |

---

## Section 0 — Recon (completed 2026-04-20)

**The persistence decision is moot:** four of five entities have zero production persistence today, and the fifth (`metrics`) has its own sqlite that doesn't touch the auth `Database`. Tests that previously seeded `repositories` / `pipelines` / `compliance` / `orchestrations` tables were writing to a database production code never read from.

| Entity | Real storage today |
|--------|--------------------|
| `repositories` | Config list (`MONITORED_REPOSITORIES`) + GitHub API live |
| `pipelines` | GitHub Actions API, 60s in-memory cache |
| `compliance` | Recomputed per call (template engine + in-memory Map) |
| `metrics` | SQLite at `api/data/metrics.db`, schema at `api/schemas/metrics.sql`, own connection |
| `orchestrations` | In-memory Maps only |

**Design consequence:** Option A is a DI / testability refactor, not a persistence refactor. We do **not** add tables to `Database.initializeSchema()`. We do **not** migrate `metricsStorage.js` into the shared `Database`.

---

## Section 1 — PR 1 Task Overview

PR 1 = foundation + first un-skip (pipelines). 13 bite-sized tasks, TDD-ordered so each commit leaves the tree green.

### Prerequisites

Before Task 1, set up the worktree:

```bash
git worktree add ~/.config/superpowers/worktrees/homelab-gitops/option-a-pr1 \
  -b fix/624-option-a-createapp-pr1 main
cd ~/.config/superpowers/worktrees/homelab-gitops/option-a-pr1/api
npm install
npm rebuild sqlite3 --build-from-source   # per learnings: dev-env GLIBC mismatch
```

---

## Task 1: Capture baseline

**Files:** none (scratch only).

**Step 1: Run full test suite and capture output**

Run: `cd api && npm test 2>&1 | tee /tmp/option-a-pr1-baseline.txt | tail -8`

Expected: 1 PASS (`realtime.test.js`), 4 SKIPPED (`compliance`, `pipelines`, `workflow`, `load`). Exit code `0`. Capture this state — later tasks must not regress realtime or re-introduce failures in the other suites.

**Step 2: Confirm exit code**

Run: `cd api && npm test >/dev/null 2>&1; echo "exit=$?"`

Expected: `exit=0`.

**Step 3: Do NOT commit.** This is recon.

---

## Task 2: Create fake scaffolding

**Files:**
- Create: `api/tests/fakes/config.js`
- Create: `api/tests/fakes/githubMCP.js`
- Create: `api/tests/fakes/index.js`

**Step 1: Write `api/tests/fakes/config.js`**

```js
// api/tests/fakes/config.js
// Plain-object-backed fake for the ConfigLoader interface.
// Tests mutate `state.values` to change what config.get(key) returns.

function createFakeConfig(initial = {}) {
  const state = { values: { ...initial } };
  return {
    state,
    get: jest.fn((key, fallback) => {
      return Object.prototype.hasOwnProperty.call(state.values, key)
        ? state.values[key]
        : fallback;
    }),
  };
}

module.exports = { createFakeConfig };
```

**Step 2: Write `api/tests/fakes/githubMCP.js`**

```js
// api/tests/fakes/githubMCP.js
// Fake of the githubMCP collaborator used by pipelineService + complianceService.
// state.workflowRuns / state.repos are mutable — tests set them before exercising routes.

function createFakeGithubMCP({ workflowRuns = [], repos = [] } = {}) {
  const state = { workflowRuns, repos };
  return {
    state,
    getWorkflowRuns: jest.fn(async (_owner, _repo, _opts) => state.workflowRuns),
    listRepos: jest.fn(async () => state.repos),
  };
}

module.exports = { createFakeGithubMCP };
```

**Step 3: Write `api/tests/fakes/index.js`**

```js
// api/tests/fakes/index.js
module.exports = {
  ...require('./config'),
  ...require('./githubMCP'),
};
```

**Step 4: Verify the fakes load in isolation**

Run: `cd api && node -e "const f = require('./tests/fakes'); const c = f.createFakeConfig({FOO:'bar'}); console.log(c.get('FOO'), c.get('BAZ', 'def'));"`

Expected output: `bar def`.

**Step 5: Commit**

```bash
cd ~/.config/superpowers/worktrees/homelab-gitops/option-a-pr1
git add api/tests/fakes/
git commit -m "test(api): add plain-object fake factories for Option-A DI (#624)

New api/tests/fakes/ directory with config + githubMCP fakes used by
the forthcoming createApp() factory and the pipelines test un-skip.
Shape: plain factory returning an object with jest.fn() methods and a
.state handle tests mutate. Chosen over jest.mock() because jest.mock
is module-scope magic; explicit constructor injection pairs better
with explicit fakes.

Ref: docs/plans/2026-04-20-option-a-createapp-di.md"
```

---

## Task 3: Write a failing test for `createApp`

**Files:**
- Test: `api/tests/routes/pipelines.test.js` (partial — just the healthz check)

**Step 1: Read current pipelines.test.js header + describe.skip block**

Run: `head -30 api/tests/routes/pipelines.test.js`

**Step 2: Insert a NEW describe block ABOVE the existing `describe.skip`**

The existing skipped describe stays until Task 11. For now, append a small running describe that tests `createApp` directly:

At the top of the file (after imports), add:

```js
const { createApp } = require('../../createApp');

describe('createApp — smoke', () => {
  it('returns an Express app that 404s on unknown routes', async () => {
    const app = createApp({});
    const request = require('supertest');
    const res = await request(app).get('/does-not-exist');
    expect(res.status).toBe(404);
  });
});
```

**Step 3: Run just the new test to confirm it fails**

Run: `cd api && npx jest tests/routes/pipelines.test.js -t "createApp — smoke" 2>&1 | tail -15`

Expected: FAIL with `Cannot find module '../../createApp'`.

**Step 4: Do NOT commit yet.** Committing a known-failing test leaves the tree red. Proceed to Task 4.

---

## Task 4: Minimal `createApp` stub (make Task 3 test pass)

**Files:**
- Create: `api/createApp.js`

**Step 1: Write `api/createApp.js` — minimal stub**

```js
// api/createApp.js
// Factory that builds the Express app with services pre-wired to app.locals.
// Full signature will grow across subsequent tasks; this is the minimal
// shell needed to make the first smoke test pass.

const express = require('express');

function createApp(services = {}) {
  const app = express();
  app.use(express.json());

  // Pin collaborators to app.locals (empty in this stub — grows later).
  Object.assign(app.locals, services);

  return app;
}

module.exports = { createApp };
```

**Step 2: Run the smoke test — confirm it now passes**

Run: `cd api && npx jest tests/routes/pipelines.test.js -t "createApp — smoke" 2>&1 | tail -10`

Expected: PASS.

**Step 3: Run full test suite — confirm no regressions**

Run: `cd api && npm test 2>&1 | tail -8`

Expected: same 5 suites, same results as baseline. `realtime.test.js` still PASS. Exit 0.

**Step 4: Commit**

```bash
git add api/createApp.js api/tests/routes/pipelines.test.js
git commit -m "feat(api): introduce createApp() factory stub + smoke test (#624)

Starts the Option-A scaffolding: a bare Express factory that accepts
services and pins them to app.locals. Future tasks add security
middleware, router mounts, and real service wiring. A healthz-style
smoke test in pipelines.test.js (outside the existing describe.skip)
verifies the factory exists and returns an app.

Ref: docs/plans/2026-04-20-option-a-createapp-di.md"
```

---

## Task 5: Refactor `AuthService` constructor

**Files:**
- Modify: `api/services/auth/authService.js:12-24`
- Modify: `api/middleware/auth.js:9`
- Modify: `api/middleware/enhanced-auth.js:10`
- Modify: `api/server.js` (locate all `new AuthService()` construction paths)

**Step 1: Grep for AuthService call sites**

Run: `cd api && grep -rn "new AuthService" --include='*.js' | grep -v node_modules`

Expected: 3–5 call sites. Record them.

**Step 2: Rewrite the constructor**

Change `api/services/auth/authService.js:12-24` from:

```js
constructor() {
  this.jwtSecret = process.env.JWT_SECRET || this.generateSecret();
  this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
  this.db = Database.getInstance();
  ...
}
```

to:

```js
constructor({ db, jwtSecret, jwtExpiresIn } = {}) {
  if (!db) throw new Error('AuthService requires { db }');
  this.db = db;
  this.jwtSecret = jwtSecret || process.env.JWT_SECRET || this.generateSecret();
  this.jwtExpiresIn = jwtExpiresIn || process.env.JWT_EXPIRES_IN || '24h';
  this.apiKeys = new Map();
  this.sessions = new Map();
  if (!this.jwtSecret) {
    console.warn('⚠️  Using generated JWT secret. Set JWT_SECRET environment variable for production!');
  }
}
```

**Step 3: Update every call site**

For each `new AuthService()` found in Step 1, replace with `new AuthService({ db: <source> })` where `<source>` is:
- In `server.js`'s `initializeAuth()`: `Database.getInstance()` (this is the real construction site).
- In middleware: middleware runs with `req` available; replace the per-middleware AuthService construction with `const authService = req.app.locals.authService;`. The middleware no longer owns its own AuthService — the factory does.

**Step 4: Run tests**

Run: `cd api && npm test 2>&1 | tail -8`

Expected: realtime still PASS. Smoke test still PASS. 3 other skipped suites unchanged.

**Step 5: If any tests fail with `AuthService requires { db }`**

This means a call site was missed. Repeat Step 1, find the missed site, fix, re-run.

**Step 6: Commit**

```bash
git add api/services/auth/authService.js \
        api/middleware/auth.js \
        api/middleware/enhanced-auth.js \
        api/server.js
git commit -m "refactor(api): inject db into AuthService via constructor (#624)

Removes the implicit Database.getInstance() call from AuthService's
constructor. Callers must now pass { db } explicitly. Middleware call
sites migrate to reading req.app.locals.authService (single instance
owned by the future createApp factory). server.js's initializeAuth()
constructs the real AuthService with the singleton db.

Part of the Option-A DI refactor. Next tasks refactor ComplianceService
and PipelineService in the same shape.

Ref: docs/plans/2026-04-20-option-a-createapp-di.md"
```

---

## Task 6: Refactor `ComplianceService` constructor

**Files:**
- Modify: `api/services/compliance/complianceService.js` (constructor + any method that constructs a `new TemplateEngine(...)`)
- Grep for: `new ComplianceService` call sites

**Step 1: Grep for ComplianceService call sites**

Run: `cd api && grep -rn "new ComplianceService" --include='*.js' | grep -v node_modules`

**Step 2: Rewrite the constructor**

Change to:

```js
constructor({ config, templateEngine, githubMCP } = {}) {
  if (!config) throw new Error('ComplianceService requires { config }');
  if (!templateEngine) throw new Error('ComplianceService requires { templateEngine }');
  this.config = config;
  this.templateEngine = templateEngine;
  this.githubMCP = githubMCP || null;
  this.complianceData = new Map();
  this.applicationHistory = [];
}
```

Remove any internal `new TemplateEngine(...)` calls — they move to the caller.

**Step 3: Update call sites**

Every call site becomes:
```js
const templateEngine = new TemplateEngine({ projectRoot: rootDir });
const complianceService = new ComplianceService({ config, templateEngine, githubMCP });
```

**Step 4: Run tests**

Run: `cd api && npm test 2>&1 | tail -8`

Expected: no regressions.

**Step 5: Commit**

```bash
git add api/services/compliance/complianceService.js api/server.js
git commit -m "refactor(api): inject deps into ComplianceService constructor (#624)

Constructor now takes { config, templateEngine, githubMCP }. Removes the
internal new TemplateEngine() call — callers (prod server.js and tests)
own the TemplateEngine lifecycle. githubMCP is optional (some code paths
don't need it). Mandatory deps throw on missing — loud failure beats
silent null deref.

Ref: docs/plans/2026-04-20-option-a-createapp-di.md"
```

---

## Task 7: Refactor `PipelineService` constructor

**Files:**
- Modify: `api/services/pipeline/pipelineService.js` — constructor + remove `setGithubMCP()` method
- Grep for: `new PipelineService`, `.setGithubMCP(` call sites

**Step 1: Grep for call sites**

Run: `cd api && grep -rn "new PipelineService\|setGithubMCP" --include='*.js' | grep -v node_modules`

**Step 2: Rewrite constructor**

```js
constructor({ config, githubMCP } = {}) {
  if (!config) throw new Error('PipelineService requires { config }');
  this.config = config;
  this.githubMCP = githubMCP || null;
  this.cache = new Map();
  this.CACHE_TTL_MS = 60 * 1000;
}
```

Remove `setGithubMCP(mcp) { this.githubMCP = mcp; }` method entirely.

**Step 3: Update call sites**

Every `pipelineService.setGithubMCP(mcp)` becomes pre-construction: `new PipelineService({ config, githubMCP: mcp })`.

**Step 4: Run tests + commit (same pattern as Task 6).**

---

## Task 8: Move security middleware + router mounts into `createApp`

**Files:**
- Modify: `api/createApp.js` — grow from stub to full factory per Section 2 of brainstorming
- Modify: `api/server.js` — remove the moved lines; `server.js` keeps service construction, `initializeAuth`, `initializeWikiAgent`, signal handlers, and `.listen(...)`

**Step 1: Read `server.js` lines 50–420 (the middleware + router setup block)**

Identify the lines that become `createApp`'s body.

**Step 2: Update `api/createApp.js`**

Expand from the stub to the full factory:

```js
const express = require('express');

function createApp({
  authService,
  complianceService,
  pipelineService,
  webhookHandler,
  orchestrator,
  phase2WS,
  wsManager,
  githubMCP,
  wikiAgentManager,
  config,
  rootDir,
  isDev = process.env.NODE_ENV !== 'production',
} = {}) {
  const app = express();

  // Security middleware
  const SecurityMiddleware = require('./middleware/security');
  const stack = isDev ? SecurityMiddleware.developmentSecurity()
                      : SecurityMiddleware.productionSecurity();
  stack.forEach(mw => app.use(mw));

  app.use(express.json());

  // Pin services to app.locals
  Object.assign(app.locals, {
    authService, complianceService, pipelineService,
    webhookHandler, orchestrator, phase2WS, wsManager,
    githubMCP, wikiAgentManager, config, rootDir,
  });

  // Router mounts — same paths/order as current server.js
  app.use('/api/v2/auth', require('./routes/auth'));
  app.use('/api/v2',      require('./phase2-endpoints'));
  app.use('/api/wiki',    require('./routes/wiki'));
  // ...copy the remaining mount lines from server.js verbatim

  return app;
}

module.exports = { createApp };
```

**Step 3: Refactor `server.js`**

It becomes a thin bootstrap: argv parsing, service construction (`new AuthService(...)`, `new ComplianceService(...)`, etc.), `const app = createApp(services); app.listen(PORT)`. Keep `initializeAuth()` / `initializeWikiAgent()` as pre-createApp async setup.

**Step 4: Run tests**

Run: `cd api && npm test 2>&1 | tail -8`

Expected: realtime still PASS. Smoke test still PASS.

**Step 5: Start the server in dev to smoke-test**

Run: `cd api && node server.js --port=3077 & sleep 3 && curl -sf http://localhost:3077/api/v2/health && kill %1 2>/dev/null`

Expected: health-endpoint response (non-empty). If this fails, inspect what was missed when moving code from `server.js` to `createApp`. Do not proceed to Task 9.

**Step 6: Commit**

```bash
git add api/createApp.js api/server.js
git commit -m "refactor(api): move app construction into createApp factory (#624)

Security middleware + router mounts move from server.js into
api/createApp.js. server.js shrinks to service construction + listen().
Smoke-tested via supertest healthz probe + live curl against
/api/v2/health.

Ref: docs/plans/2026-04-20-option-a-createapp-di.md"
```

---

## Task 9: Un-skip `pipelines.test.js` (PR 1's payoff)

**Files:**
- Modify: `api/tests/routes/pipelines.test.js` — remove `describe.skip` + skip comment; rewrite test body to use `createApp({ pipelineService: real, githubMCP: fake })` instead of `TestHelpers.insertTestData('pipelines', ...)`.

**Step 1: Read the current pipelines.test.js body**

Run: `cd api && wc -l tests/routes/pipelines.test.js && head -60 tests/routes/pipelines.test.js`

Understand: which routes are hit, which assertions are made, which data is seeded.

**Step 2: Identify each `TestHelpers.insertTestData(...)` call**

Run: `grep -n "insertTestData" tests/routes/pipelines.test.js`

Each call is a clue about what state the test expects. Map each to: "this is really setting `fakeGithubMCP.state.workflowRuns` to include entry X."

**Step 3: Rewrite the test suite**

Sketch (not verbatim — the final shape depends on what assertions are made):

```js
const request = require('supertest');
const { createApp } = require('../../createApp');
const { createFakeConfig, createFakeGithubMCP } = require('../fakes');
const PipelineService = require('../../services/pipeline/pipelineService');
const TestHelpers = require('../helpers/testHelpers');

describe('Pipelines API', () => {
  let app;
  let githubMCP;
  let pipelineService;
  let adminToken;

  beforeEach(() => {
    githubMCP = createFakeGithubMCP({
      workflowRuns: [/* canned run data matching old test expectations */],
    });
    const config = createFakeConfig({
      MONITORED_REPOSITORIES: ['test-repo-1', 'test-repo-2'],
    });
    pipelineService = new PipelineService({ config, githubMCP });
    adminToken = TestHelpers.generateAdminToken();

    app = createApp({
      pipelineService,
      githubMCP,
      config,
      // Other services stubbed as undefined — pipelines routes don't need them.
    });
  });

  it('GET /api/v2/pipelines/status — returns workflow runs', async () => {
    const res = await request(app)
      .get('/api/v2/pipelines/status')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(githubMCP.getWorkflowRuns).toHaveBeenCalled();
  });

  // ...more tests, one-for-one with the existing suite
});
```

**Step 4: Run the suite iteratively**

Run: `cd api && npx jest tests/routes/pipelines.test.js 2>&1 | tail -30`

Fix each failing assertion. Commit after each green sub-block if the suite is large (PR discipline — don't let "one big commit" swallow this work). Typical sub-commits:
- `test(api): un-skip pipelines basic GET /status`
- `test(api): un-skip pipelines POST /pipelines/run`
- `test(api): un-skip pipelines error cases`

Each sub-commit ensures the file at that commit has some tests passing (not all — that's fine as long as `describe.skip` is not used).

Alternative: keep the suite skipped until fully rewritten, then single commit. Pick based on suite size. For pipelines (~500 lines), sub-commits are recommended.

**Step 5: Verify no regression**

Run: `cd api && npm test 2>&1 | tail -10 && echo "---" && cd api && npm test >/dev/null 2>&1; echo "exit=$?"`

Expected:
- `realtime.test.js`: PASS (unchanged)
- `pipelines.test.js`: PASS (newly re-enabled)
- `compliance.test.js`, `workflow.test.js`, `load.test.js`: still skipped
- Exit code 0.

**Step 6: Update the skip comment in the OTHER 3 suites**

The skip comment in `compliance.test.js`, `workflow.test.js`, `load.test.js` references `docs/plans/2026-04-20-api-test-restoration-b-auth.md`. After this PR, also reference the Option-A plan doc. One-line edit per file:

```js
// Design: docs/plans/2026-04-20-api-test-restoration-b-auth.md
//         docs/plans/2026-04-20-option-a-createapp-di.md (this un-skip's design)
```

**Step 7: Final commit for the un-skip**

```bash
git add api/tests/routes/pipelines.test.js \
        api/tests/routes/compliance.test.js \
        api/tests/integration/workflow.test.js \
        api/tests/performance/load.test.js
git commit -m "test(api): un-skip pipelines.test.js via createApp + fakes (#624)

First PR in the Option-A un-skip sequence. Removes describe.skip and
rewrites test body to construct PipelineService with a fake githubMCP
instead of seeding a table production code never reads from. The three
remaining skip comments are updated to reference this plan doc too.

Ref: docs/plans/2026-04-20-option-a-createapp-di.md"
```

---

## Task 10: Grep for any leftover references

**Files:** none (recon).

**Step 1: Ensure no `Database.getInstance()` calls outside explicit bootstrap/test paths**

Run: `cd api && grep -rn "Database.getInstance" --include='*.js' | grep -v node_modules`

Expected: only `server.js`, `createApp.js` (if any), `tests/setup/database.setup.js`, and anywhere explicitly tied to the singleton bootstrap. No occurrences inside service/middleware code (those should be constructor-injected).

**Step 2: Ensure no `setGithubMCP` remnants**

Run: `cd api && grep -rn "setGithubMCP" --include='*.js' | grep -v node_modules`

Expected: zero hits.

**Step 3: Ensure no `new AuthService()` (no-arg) remnants**

Run: `cd api && grep -rn "new AuthService()" --include='*.js' | grep -v node_modules`

Expected: zero hits.

**Step 4: If any hits, return to the relevant task and fix.** Do not proceed.

---

## Task 11: Open PR

**Step 1: Push branch**

```bash
cd ~/.config/superpowers/worktrees/homelab-gitops/option-a-pr1
git push -u origin fix/624-option-a-createapp-pr1
```

**Step 2: Open PR**

```bash
gh pr create --title "feat(api): createApp factory + DI + un-skip pipelines.test.js (#624)" --body "$(cat <<'EOF'
## Summary

Foundation PR for Option A. Extracts \`api/createApp.js\` (Express factory), refactors AuthService / ComplianceService / PipelineService constructors to accept their deps, and un-skips the first of four deferred test suites (\`pipelines.test.js\`).

## What changed

- **New:** \`api/createApp.js\` — pure factory, no side effects, pins services to \`app.locals\` per the Q3 hybrid-DI decision in the design doc.
- **New:** \`api/tests/fakes/{config,githubMCP,index}.js\` — plain-object fake factories with \`jest.fn()\` methods. Pairs better with constructor injection than \`jest.mock()\`.
- **Refactor:** \`AuthService\`, \`ComplianceService\`, \`PipelineService\` constructors require \`{ db }\` / \`{ config, templateEngine, githubMCP }\` / \`{ config, githubMCP }\` respectively. Loud throws on missing deps.
- **Thin:** \`server.js\` shrinks to ~80 lines — service construction + \`createApp(services).listen(port)\`.
- **Un-skip:** \`pipelines.test.js\` rewrites \`TestHelpers.insertTestData('pipelines', ...)\` to \`fakeGithubMCP.state.workflowRuns = [...]\` + \`createApp({ pipelineService: new PipelineService(...) })\`.

## Design doc

\`docs/plans/2026-04-20-option-a-createapp-di.md\` — includes recon findings showing 4 of 5 entity types have zero production persistence today, so no new tables in \`Database\`.

## Test plan

- [x] \`cd api && npm test\` → exit 0
- [x] realtime.test.js unchanged: 22/22 pass
- [x] pipelines.test.js re-enabled and passing
- [x] compliance / workflow / load still skipped (their PRs follow)

## Follow-ups (each a separate Vikunja bead under #624)

- PR 2 — un-skip compliance.test.js + add templateEngine fake
- PR 3 — un-skip workflow.test.js + add webhookHandler/orchestrator fakes
- PR 4 — un-skip load.test.js
- PR 5 — restore coverageThreshold (#635)

Part of #624. Completes first of five PRs.
EOF
)"
```

**Step 3: Watch CI**

Use \`gh pr checks <PR> --watch\`, but wrap with a hard timeout at the shell level (learned the hard way 2026-04-20):

```bash
timeout 1800 gh pr checks <PR-num> --watch --fail-fast=false
```

Allow Code Quality Check to run its full 20-24 min. Do NOT conclude a job is hung based on \`0s\` duration in \`gh pr checks\` — cross-check with \`gh run list --workflow "<name>"\`.

**Step 4: If CI fails on a pre-existing issue, file as a discovered task (per global CLAUDE.md rule).** Do not carry unrelated fixes into this PR beyond the \`npm rebuild sqlite3\` pattern already established in B-auth.

---

## Task 12: Close out

**Step 1: Merge**

\`gh pr merge <PR-num> --squash --delete-branch\`

Worktree cleanup:
\`git worktree remove ~/.config/superpowers/worktrees/homelab-gitops/option-a-pr1 --force\`

**Step 2: Vikunja bead updates**

- Close the PR-1 implementation bead.
- Leave the umbrella Option-A bead (#624) open — it closes only after PR 5.
- Confirm PR 2–5 beads exist (created during plan-writing).

**Step 3: Run \`git shipit\` from main worktree** to monitor deploy.

---

## Section 2 — PR 2 Sketch: un-skip `compliance.test.js`

**New file:** \`api/tests/fakes/templateEngine.js\`:

```js
function createFakeTemplateEngine({ templates = [], applyResult = null } = {}) {
  const state = { templates, applyResult, applyCalls: [] };
  return {
    state,
    listTemplates: jest.fn(async () => state.templates),
    applyTemplate: jest.fn(async (repoPath, templateName, opts) => {
      state.applyCalls.push({ repoPath, templateName, opts });
      return state.applyResult || { success: true, templateName, filesWritten: [] };
    }),
    checkTemplateCompliance: jest.fn(async () => ({ compliant: true, issues: [] })),
  };
}
```

**Test rewrite pattern:** \`new ComplianceService({ config, templateEngine: fakeTE, githubMCP: fakeGH })\`. Mutate \`fakeTE.state.applyResult\` per test case instead of seeding the non-existent \`compliance\` table.

**Assertions preserved:** \`expect(response.body.templatesApplied).toEqual([...])\` works by having the fake's \`applyTemplate\` return the expected shape; the route handler passes it through.

**Scope:** one PR. Remove the \`describe.skip\`, remove all \`TestHelpers.insertTestData\` calls in this file, update skip-comment refs in the remaining two files.

---

## Section 3 — PR 3 Sketch: un-skip `workflow.test.js`

**New fakes:** \`webhookHandler.js\`, \`orchestrator.js\` (shapes TBD — read the actual integration test first to see what they need).

**This suite is the most complex** because it exercises end-to-end flows. All PR 1–2 fakes are reused. Scope: depending on what the integration test asserts, this PR might need to tighten or clarify service contracts between compliance/pipelines/orchestrator — flag those issues as discoveries and address them in this PR if small, separate PRs if not.

**Scope:** one PR. Un-skip + any minor contract adjustments.

---

## Section 4 — PR 4 Sketch: un-skip `performance/load.test.js`

**Smallest un-skip.** Performance suite benchmarks route response times; it doesn't care about service state beyond "the app responds." All fakes are reused. Expect this PR to be mostly \`describe.skip\` → \`describe\` + updating the \`beforeEach\` to call \`createApp\` with fake services.

**Potential surprise:** benchmarks may have been flaky in the first place; if thresholds are unrealistic for the fake-service path (which returns canned data instantly), adjust thresholds to match the new reality in this PR.

---

## Section 5 — PR 5 Sketch: restore \`coverageThreshold\` (#635)

**File:** \`api/jest.config.js\`.

Restore the original block:

```js
coverageThreshold: {
  global: { branches: 80, functions: 80, lines: 80, statements: 80 },
  './services/pipeline/pipelineService.js':     { branches: 90, functions: 90, lines: 90, statements: 90 },
  './services/compliance/complianceService.js': { branches: 90, functions: 90, lines: 90, statements: 90 },
  './phase2-endpoints.js':                      { branches: 85, functions: 85, lines: 85, statements: 85 },
},
```

Also delete the \"coverageThreshold removed\" comment block.

**Verification:** run \`cd api && npm test\`. If any threshold fails:
- Raise coverage in follow-up commits on this PR (if close), OR
- Adjust the threshold with a short comment explaining the reduction (if genuinely unachievable).

Do NOT merge this PR with thresholds that don't hold.

**Close #635 on merge. Close #624 after this merges.**

---

## Epic-level Verification Checklist

- [ ] PR 1 merged — pipelines un-skipped
- [ ] PR 2 merged — compliance un-skipped
- [ ] PR 3 merged — workflow un-skipped
- [ ] PR 4 merged — load un-skipped
- [ ] PR 5 merged — coverageThreshold restored
- [ ] \`grep -rn "describe.skip" api/tests/\` returns zero hits in the four target files
- [ ] \`grep -rn "Vikunja #624" api/tests/\` returns zero hits (all skip comments removed)
- [ ] #635 closed
- [ ] #624 closed

---

## DRY / YAGNI / TDD Notes

**DRY:** fakes live in one directory, one file per collaborator. Each test file imports the fakes it needs. No duplicated seed data.

**YAGNI:**
- No new tables in \`Database\` — recon proved persistence is already correct.
- No migration of \`metricsStorage.js\` into \`Database\` — defensible follow-up but not today's problem.
- No rewrite of \`templateEngine\` in JS — prod stays on python; tests fake it.
- No replacement of hand-signed JWTs in \`TestHelpers.generateTestToken\` — real login-flow coverage is extra churn.
- No factory mount-function refactor (Q3 option B) — hybrid app.locals pattern is enough.

**TDD:** each task in PR 1 writes a test first, confirms red, implements, confirms green, commits. The factory exists at every commit. \`realtime.test.js\` passes at every commit. \`pipelines.test.js\` un-skip happens in Task 9 after the foundation is in place.

**Commit cadence:** 12 commits in PR 1. For PR 2+, aim for similar granularity — one commit per test-block-rewrite. No single "big bang" commit.
