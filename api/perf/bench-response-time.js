#!/usr/bin/env node
// api/perf/bench-response-time.js
//
// Response-time benchmark: 3 primary GET endpoints at 10 concurrent
// connections for 10 seconds each. Prints a tabular summary and writes
// the full result set to api/perf/results-<ISO>.json.
//
// Run: npm run bench
//
// Baseline reference: api/perf/baseline.json. Diff future runs against it.

const fs = require('fs');
const path = require('path');
const { startApp, runBench } = require('./harness');

const PORT = parseInt(process.env.PERF_PORT || '3099', 10);

const ENDPOINTS = [
  { path: '/api/v2/status',            title: 'platform-status' },
  { path: '/api/v2/compliance/status', title: 'compliance-status' },
  { path: '/api/v2/pipelines/status',  title: 'pipelines-status' },
];

const CONNECTIONS = 10;
const DURATION_SEC = 10;

function fmt(n, d = 2) {
  if (n === undefined || n === null || Number.isNaN(n)) return '-';
  return typeof n === 'number' ? n.toFixed(d) : String(n);
}

function printTable(results) {
  const rows = [
    ['endpoint', 'avg ms', 'p50 ms', 'p99 ms', 'max ms', 'req/s', 'total', 'errors', 'non2xx'],
    ...results.map((r) => [
      r.title,
      fmt(r.avgLatencyMs),
      fmt(r.p50LatencyMs),
      fmt(r.p99LatencyMs),
      fmt(r.maxLatencyMs),
      fmt(r.reqPerSec),
      r.totalRequests,
      r.errors,
      r.non2xx,
    ]),
  ];
  const widths = rows[0].map((_, colIdx) =>
    Math.max(...rows.map((row) => String(row[colIdx]).length)),
  );
  console.log();
  for (const row of rows) {
    console.log(row.map((c, i) => String(c).padEnd(widths[i])).join('  '));
  }
  console.log();
}

(async () => {
  console.log(`[bench] starting app on port ${PORT}`);
  const { close } = await startApp(PORT);

  const run = {
    startedAt: new Date().toISOString(),
    suite: 'response-time',
    connections: CONNECTIONS,
    durationSec: DURATION_SEC,
    results: [],
  };

  try {
    for (const ep of ENDPOINTS) {
      const url = `http://127.0.0.1:${PORT}${ep.path}`;
      console.log(`[bench] ${ep.title}: ${CONNECTIONS} conn x ${DURATION_SEC}s -> ${url}`);
      const r = await runBench({
        url,
        duration: DURATION_SEC,
        connections: CONNECTIONS,
        title: ep.title,
      });
      run.results.push(r);
    }
  } finally {
    await close();
  }

  run.completedAt = new Date().toISOString();

  // ISO filename: colons not allowed in CI artifacts — use dashes.
  const stamp = run.completedAt.replace(/:/g, '-').replace(/\..+/, '');
  const outPath = path.join(__dirname, `results-${stamp}.json`);
  fs.writeFileSync(outPath, JSON.stringify(run, null, 2));

  printTable(run.results);
  console.log(`[bench] results written: ${outPath}`);

  // Non-zero exit if any endpoint errored or returned non-2xx
  const failed = run.results.some((r) => r.errors > 0 || r.non2xx > 0);
  process.exit(failed ? 1 : 0);
})().catch((err) => {
  console.error('[bench] fatal:', err);
  process.exit(2);
});
