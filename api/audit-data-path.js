// Where the WebSocket feed reads audit data from (ops #4355).
//
// Prod: the live report written by scripts/sync_github_repos.sh, which
// symlinks audit-history/latest.json at the newest timestamped report. The
// old path (/opt/gitops/dashboard/GitRepoReport.json) was a stale 2025
// fixture shipped inside the dashboard build, which is no longer deployed.
// Dev keeps the checked-in fixture so a fresh clone has something to serve.
const path = require('path');

const PROD_AUDIT_DATA_PATH = '/opt/gitops/audit-history/latest.json';

function resolveAuditDataPath(isDev, rootDir) {
  return isDev
    ? path.join(rootDir, 'dashboard/public/GitRepoReport.json')
    : PROD_AUDIT_DATA_PATH;
}

module.exports = { resolveAuditDataPath, PROD_AUDIT_DATA_PATH };
