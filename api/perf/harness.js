// api/perf/harness.js
//
// Wires the real Express app (via createApp) with real services for
// performance benchmarking. Mirrors the server.js bootstrap but:
//
//  1. Passes `githubMCP = null` so benches never hit GitHub. The
//     services' in-memory / cached default paths respond — this is the
//     realistic local-measurement baseline and insulates numbers from
//     external network variance.
//  2. Skips WebSocket / webhook / wiki init — benches only hit HTTP
//     endpoints. Keeps the harness side-effect-light and fast to spin up.
//  3. Returns { server, port, close } so the bench script can tear it
//     down cleanly.
//
// See api/perf/README.md for rationale (why jest wasn't the right tool
// for wall-time performance assertions).

const path = require('path');
const autocannon = require('autocannon');

const ConfigLoader = require('../config-loader');
const Database = require('../models/database');
const AuthService = require('../services/auth/authService');
const ComplianceService = require('../services/compliance/complianceService');
const PipelineService = require('../services/pipeline/pipelineService');
const TemplateEngine = require('../services/compliance/templateEngine');
const { createApp } = require('../createApp');

/**
 * Build the Express app with real services and listen on `port`.
 * Resolves to { server, port, close } where `close` is an async
 * teardown that stops listening and closes the DB.
 */
async function startApp(port = 3099) {
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  const rootDir = path.resolve(__dirname, '..');

  // Real config (defaults + config/settings.conf if present).
  const config = new ConfigLoader();

  // Auth wiring (mirrors server.js:initializeAuth).
  const db = Database.getInstance();
  await db.connect();
  await db.initializeSchema();
  await db.createDefaultAdmin();
  const authService = new AuthService({ db });

  // Template engine + compliance + pipeline services.
  const templateEngine = new TemplateEngine({ projectRoot: rootDir });
  const githubMCP = null; // perf harness: no GitHub calls — in-memory paths only
  const complianceService = new ComplianceService({
    config,
    templateEngine,
    githubMCP,
  });
  const pipelineService = new PipelineService({
    config,
    githubMCP,
  });

  const app = createApp({
    authService,
    complianceService,
    pipelineService,
    config,
    rootDir,
  });

  const server = await new Promise((resolve, reject) => {
    const s = app.listen(port, (err) => (err ? reject(err) : resolve(s)));
  });

  async function close() {
    await new Promise((resolve) => server.close(() => resolve()));
    try {
      await db.close();
    } catch (_) {
      // db may already be closed — ignore
    }
  }

  return { server, port, close };
}

/**
 * Run a single autocannon benchmark against `url` for `duration` seconds
 * at `connections` concurrency. Returns a flattened result object.
 */
async function runBench({ url, duration = 10, connections = 10, title = null }) {
  const result = await autocannon({
    url,
    duration,
    connections,
    title: title || url,
  });
  return {
    url,
    title: title || url,
    connections,
    durationSec: duration,
    avgLatencyMs: result.latency.mean,
    p50LatencyMs: result.latency.p50,
    p99LatencyMs: result.latency.p99,
    maxLatencyMs: result.latency.max,
    reqPerSec: result.requests.mean,
    totalRequests: result.requests.total,
    bytesPerSec: result.throughput.mean,
    errors: result.errors,
    timeouts: result.timeouts,
    non2xx: result.non2xx,
  };
}

module.exports = { startApp, runBench };
