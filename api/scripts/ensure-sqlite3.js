#!/usr/bin/env node
'use strict';

/**
 * postinstall guard for the sqlite3 native binary.
 *
 * sqlite3 v6 ships prebuilt N-API binaries linked against a newer glibc
 * (GLIBC_2.38) than Debian 12 provides (2.36). On such hosts — the dev-env
 * container (CT 128) and the production CT (gitopsdashboard) — the prebuilt
 * fails to load at require() time, which breaks every DB-touching test suite
 * locally and would break the service in production.
 *
 * CI runs on ubuntu-latest (glibc >= 2.38), where the prebuilt loads fine, so
 * this script is a no-op there and adds no build time.
 *
 * Strategy: try to load sqlite3. If it loads, do nothing. If it fails to load,
 * compile it from source with node-gyp against the host toolchain, which links
 * the local glibc. Idempotent and safe to run on every install.
 *
 * This makes a fresh `npm ci` self-healing on old-glibc hosts and supersedes
 * the manual `npm rebuild sqlite3 --build-from-source` step in deploy.yml (kept
 * there as belt-and-suspenders).
 *
 * See homelab-gitops task #2002 and the global env learning
 * "Native Node modules: try npm rebuild --build-from-source".
 */

const path = require('path');
const { execFileSync } = require('child_process');

function firstLine(msg) {
  return String(msg).split('\n')[0];
}

// 1. Does the installed sqlite3 binary load in this process?
try {
  require('sqlite3');
  // Prebuilt loads (CI / modern glibc / already compiled). Nothing to do.
  process.exit(0);
} catch (loadErr) {
  console.warn(
    '[ensure-sqlite3] prebuilt sqlite3 failed to load (' +
      firstLine(loadErr.message) +
      '); rebuilding from source...'
  );
}

// 2. Locate the sqlite3 module dir and a node-gyp to build it with.
//    Prefer npm's bundled node-gyp (always present during a lifecycle script,
//    even under --omit=dev); fall back to a resolved copy for manual runs.
let sqliteDir;
try {
  sqliteDir = path.dirname(require.resolve('sqlite3/package.json'));
} catch (err) {
  console.error('[ensure-sqlite3] cannot locate sqlite3 to rebuild: ' + err.message);
  process.exit(1);
}

let nodeGyp = process.env.npm_config_node_gyp;
if (!nodeGyp) {
  try {
    nodeGyp = require.resolve('node-gyp/bin/node-gyp.js', { paths: [sqliteDir] });
  } catch (err) {
    console.error(
      '[ensure-sqlite3] cannot locate node-gyp to rebuild sqlite3: ' + err.message
    );
    process.exit(1);
  }
}

// 3. Compile from source.
try {
  execFileSync(process.execPath, [nodeGyp, 'rebuild'], {
    cwd: sqliteDir,
    stdio: 'inherit',
  });
} catch (err) {
  console.error('[ensure-sqlite3] node-gyp rebuild failed: ' + firstLine(err.message));
  process.exit(1);
}

// 4. Verify the freshly built binary loads. require() cached the earlier
//    failure in THIS process, so re-check in a clean child process.
try {
  execFileSync(process.execPath, ['-e', "require('sqlite3')"], {
    cwd: __dirname,
    stdio: 'ignore',
  });
} catch (err) {
  console.error(
    '[ensure-sqlite3] sqlite3 still fails to load after rebuild: ' + firstLine(err.message)
  );
  process.exit(1);
}

console.warn('[ensure-sqlite3] sqlite3 rebuilt from source and loads OK.');
