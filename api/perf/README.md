# API Performance Harness

Autocannon-based performance harness for the GitOps Audit API. Replaces
the previous `api/tests/performance/load.test.js` jest suite, which was
retired in Vikunja #657 / #668 (PR D of the #624 close-out plan).

## Why jest was the wrong tool

The retired suite used jest's `testTimeout` + `performance.now()` to
assert wall-time perf thresholds inside the same process as the
application under test. That's flaky for three reasons:

1. **Jest's worker isolation adds overhead.** Each `describe` block
   runs in a forked worker with its own V8 heap. Startup + GC noise
   dominates the measurement for anything under ~100 ms.
2. **Supertest goes in-process.** It short-circuits the HTTP stack,
   so the numbers don't reflect real socket accept + parse costs.
3. **Thresholds baked into test code flap with host load.** Runs on a
   busy dev box or noisy CI runner would fail the suite with no
   actionable signal.

Autocannon is the right tool: a real HTTP client hammering a real
listening socket, producing percentile distributions instead of single
wall-time samples. We run on-demand, compare against a checked-in
baseline, and keep the numbers out of the jest signal/noise budget.

## Layout

| File | Purpose |
|---|---|
| `harness.js` | Wires real services (via `createApp`) and exposes `startApp(port)` + `runBench(opts)`. |
| `bench-response-time.js` | Primary bench: 3 endpoints @ 10 conn × 10 s each. |
| `bench-concurrent.js` | Higher-load bench: 3 endpoints @ 50 conn × 15 s each. |
| `baseline.json` | Checked-in reference numbers. Diff future runs against this. |
| `results-*.json` | Gitignored. Each run writes a timestamped results file locally. |

## Running

```bash
cd api
npm run bench              # 10 conn x 10 s — fast feedback
npm run bench:concurrent   # 50 conn x 15 s — contention probe
```

Both scripts:
- Start the app on port 3099 (override with `PERF_PORT`)
- Hit `/api/v2/status`, `/api/v2/compliance/status`, `/api/v2/pipelines/status`
- Print a table + write a timestamped JSON result file
- Exit non-zero if any endpoint returned errors or non-2xx

The harness sets `githubMCP = null` so benches never hit the real
GitHub API — results come from the services' cached / in-memory
response paths, which is the realistic local-measurement baseline.

## What the endpoints measure

- `/api/v2/status` — platform aggregate, pure in-memory compute
- `/api/v2/compliance/status` — ComplianceService + templateEngine, no github fetch when `githubMCP` is null
- `/api/v2/pipelines/status` — PipelineService, same caveat

## When to refresh `baseline.json`

Refresh intentionally, not reactively:

1. **You landed a perf-relevant change** (new middleware, query change,
   service refactor). Run `npm run bench` on a quiet box, visually
   compare against `baseline.json`, commit the new baseline alongside
   the change.
2. **Host class changes** (e.g., CI runner tier, dev-env CPU). Record
   the new host in the commit message so reviewers can interpret the
   delta.

Do **not** refresh the baseline because "numbers moved a little" on a
noisy run — re-run on a quiet box first. Autocannon's percentiles are
stable on dedicated hardware; sub-1 ms p99 drift is almost always host
load, not a real regression.

## Nightly CI

Deferred (per Decision 6 of the #624 close-out plan). When we add it:

- Run `npm run bench` on a dedicated runner (not shared with build jobs)
- Compare p99 + req/s against `baseline.json` with a threshold like
  "p99 within 2× baseline, req/s within 0.5× baseline"
- Publish the timestamped `results-*.json` as an artifact

## Environment notes

Run from a quiet host. If the bench shares CPU with a noisy neighbor
(a concurrent `npm test`, a build, an unrelated service) the numbers
will look worse than they are. On the dev-env CT 128, expect
`~2-4 ms avg`, `~2000-3500 req/s` on the three current endpoints at
10 connections. See `baseline.json` for the exact reference.
