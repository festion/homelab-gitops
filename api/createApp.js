// api/createApp.js
// Factory that builds the Express app with services pre-wired to app.locals.
// server.js shrinks to a bootstrap that constructs services, wires them to
// app.locals via this factory, and listens. Tests call createApp({ ...fakes })
// instead of spinning up the full server.

const express = require('express');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const {
  execGit, execGitSeq, removeDir, isHttpGitUrl, resolveWithin,
} = require('./lib/safe-exec');

const SecurityMiddleware = require('./middleware/security');
const authRoutes = require('./routes/auth');
const phase2Router = require('./phase2-endpoints');
const { wireComplianceWSListeners } = require('./phase2-endpoints');
const { handleCSVExport } = require('./csv-export');
const { handleEmailSummary } = require('./email-notifications');
// NOTE: routes/wiki is NOT required at module top because it transitively pulls
// ../config/utils/config-manager.js which requires `ajv` resolved against the
// workspace root (where ajv is not installed). Prod passes it via DI below.

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
  wikiRoutes,
  config,
  rootDir = path.resolve(__dirname, '..'),
  historyDir,
  localDir = '/mnt/c/GIT',
  isDev = process.env.NODE_ENV !== 'production',
} = {}) {
  const app = express();
  const HISTORY_DIR = historyDir || path.join(rootDir, 'audit-history');
  const LOCAL_DIR = localDir;

  // Shared rate limiter for /audit/* handlers (Vikunja #669 — CodeQL
  // js/missing-rate-limiting). One instance so the counter is shared across
  // related sensitive ops; sensitiveRateLimit() already skips in NODE_ENV=test.
  const auditRateLimit = SecurityMiddleware.sensitiveRateLimit();

  // Security middleware (must come before body parsers + routes).
  const stack = isDev
    ? SecurityMiddleware.developmentSecurity()
    : SecurityMiddleware.productionSecurity();
  stack.forEach(mw => app.use(mw));

  // Pin collaborators to app.locals so routes/middleware resolve them per-request.
  Object.assign(app.locals, {
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
  });

  // Serve static dashboard files in development.
  if (isDev) {
    app.use(express.static(path.join(rootDir, 'dashboard/public')));
  }

  // The GitHub webhook needs the RAW request bytes to verify the HMAC that
  // GitHub computed over them, so its raw parser must be registered BEFORE the
  // global JSON parser below. Express matches middleware in registration order;
  // with the global parser first it consumed the stream, the route's own
  // express.raw() found nothing, and `JSON.parse(req.body)` then received the
  // already-parsed OBJECT and threw:
  //
  //     SyntaxError: "[object Object]" is not valid JSON
  //
  // which surfaced as a 400 on EVERY well-formed webhook. The endpoint had
  // never once succeeded, and WebhookHandler.verifySignature() -- the check
  // that actually guards this route, via webhookHandler.middleware() mounted
  // at server.js:113 -- was never reached (ops #2524). Note the repo also has
  // an unrelated validateWebhookSignature() in api/utils/security-validator.js
  // which is NOT on this path; don't go reading that one.
  app.use('/api/v2/webhooks/github', express.raw({ type: 'application/json' }));

  app.use(express.json());

  // Mount authentication routes.
  app.use('/api/v2/auth', authRoutes);

  // Mount Phase 2 routes.
  app.use('/api/v2', phase2Router);

  // Wire the WS bridge onto a DI-injected complianceService (if any) so
  // compliance lifecycle events reach phase2WS even when the service was not
  // built via the lazy initializer. Idempotent — safe to call multiple times.
  if (complianceService) {
    wireComplianceWSListeners(complianceService, app);
  }

  // Mount WikiJS Agent routes — reads wikiAgentManager from app.locals so the
  // bootstrap can finish its async init after createApp returns. The router is
  // DI-passed so tests (which don't pull the full workspace) can skip the heavy
  // require chain (see note near top).
  if (wikiRoutes) {
    app.use('/api/wiki', (req, res, next) => {
      req.wikiAgentManager = app.locals.wikiAgentManager;
      next();
    }, wikiRoutes);
  }

  // Liveness probe for upstream proxies (Traefik). Bypasses rate-limit and
  // any data-loading — must stay cheap, always-200, and never tied to a
  // rate-limited path. Vikunja #1309: previously Traefik probed /audit
  // every 30s, which tripped auditRateLimit and cascaded into 503 for real
  // user traffic. Keep this route ordered BEFORE /audit so it's not shadowed.
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Load latest audit report.
  app.get('/audit', auditRateLimit, (req, res) => {
    try {
      const latestJsonPath = path.join(HISTORY_DIR, 'latest.json');

      if (fs.existsSync(latestJsonPath)) {
        const data = fs.readFileSync(latestJsonPath);
        res.json(JSON.parse(data));
      } else {
        const staticFilePath = path.join(rootDir, 'dashboard/public/GitRepoReport.json');
        if (fs.existsSync(staticFilePath)) {
          const data = fs.readFileSync(staticFilePath);
          res.json(JSON.parse(data));
        } else {
          throw new Error('No JSON data found');
        }
      }
    } catch (err) {
      console.error('Error loading audit report:', err);
      res.status(500).json({ error: 'Failed to load latest audit report.' });
    }
  });

  // List historical audit reports.
  app.get('/audit/history', auditRateLimit, (req, res) => {
    try {
      if (!fs.existsSync(HISTORY_DIR)) {
        fs.mkdirSync(HISTORY_DIR, { recursive: true });
      }

      const files = fs
        .readdirSync(HISTORY_DIR)
        .filter((f) => f.endsWith('.json') && f !== 'latest.json')
        .sort()
        .reverse();

      res.json(files);
    } catch (err) {
      console.error('Error listing audit history:', err);
      res.status(500).json({ error: 'Failed to list audit history.' });
    }
  });

  // v1.1.0 - CSV Export endpoint.
  app.get('/audit/export/csv', auditRateLimit, (req, res) => {
    handleCSVExport(req, res, HISTORY_DIR);
  });

  // v1.1.0 - Email Summary endpoint.
  app.post('/audit/email-summary', auditRateLimit, (req, res) => {
    handleEmailSummary(req, res, HISTORY_DIR);
  });

  // Clone missing repository.
  app.post('/audit/clone', auditRateLimit, (req, res) => {
    const { repo, clone_url } = req.body;
    if (!repo || !clone_url)
      return res.status(400).json({ error: 'repo and clone_url required' });
    if (!isHttpGitUrl(clone_url))
      return res
        .status(400)
        .json({ error: 'clone_url must be an http(s)/ssh git URL' });
    const dest = resolveWithin(LOCAL_DIR, repo);
    if (!dest)
      return res.status(400).json({ error: 'Invalid repo name' });
    execGit(['clone', '--', clone_url, dest], (err) => {
      if (err) return res.status(500).json({ error: `Failed to clone ${repo}` });
      res.json({ status: `Cloned ${repo} to ${dest}` });
    });
  });

  // Delete extra repository.
  app.post('/audit/delete', auditRateLimit, (req, res) => {
    const { repo } = req.body;
    const target = resolveWithin(LOCAL_DIR, repo);
    if (!target)
      return res.status(400).json({ error: 'Invalid repo name' });
    if (!fs.existsSync(target))
      return res.status(404).json({ error: 'Repo not found locally' });
    removeDir(target, (err) => {
      if (err) return res.status(500).json({ error: `Failed to delete ${repo}` });
      res.json({ status: `Deleted ${repo}` });
    });
  });

  // Commit dirty repository.
  app.post('/audit/commit', auditRateLimit, (req, res) => {
    const { repo, message } = req.body;
    const repoPath = resolveWithin(LOCAL_DIR, repo);
    if (!repoPath)
      return res.status(400).json({ error: 'Invalid repo name' });
    if (!fs.existsSync(path.join(repoPath, '.git')))
      return res.status(404).json({ error: 'Not a git repo' });
    const commitMessage = message || 'Auto commit from GitOps audit';
    execGitSeq(
      [['add', '.'], ['commit', '-m', commitMessage]],
      { cwd: repoPath },
      (err, stdouts, stderr) => {
        if (err) return res.status(500).json({ error: 'Commit failed', stderr });
        res.json({ status: 'Committed changes', stdout: stdouts[stdouts.length - 1] });
      }
    );
  });

  // Fix remote URL mismatch.
  app.post('/audit/fix-remote', auditRateLimit, (req, res) => {
    const { repo, expected_url } = req.body;
    if (!repo || !expected_url)
      return res
        .status(400)
        .json({ error: 'repo and expected_url required' });
    if (!isHttpGitUrl(expected_url))
      return res
        .status(400)
        .json({ error: 'expected_url must be an http(s)/ssh git URL' });

    const repoPath = resolveWithin(LOCAL_DIR, repo);
    if (!repoPath)
      return res.status(400).json({ error: 'Invalid repo name' });
    if (!fs.existsSync(path.join(repoPath, '.git')))
      return res.status(404).json({ error: 'Not a git repo' });

    execGit(
      ['remote', 'set-url', 'origin', expected_url],
      { cwd: repoPath },
      (err, stdout, stderr) => {
        if (err)
          return res
            .status(500)
            .json({ error: 'Failed to fix remote URL', stderr });
        res.json({ status: `Fixed remote URL for ${repo}`, stdout });
      }
    );
  });

  // Run comprehensive audit script.
  app.post('/audit/run-comprehensive', auditRateLimit, (req, res) => {
    const scriptPath = isDev
      ? path.join(rootDir, 'scripts/comprehensive_audit.sh')
      : '/opt/gitops/scripts/comprehensive_audit.sh';

    const bashArgs = isDev ? [scriptPath, '--dev'] : [scriptPath];

    execFile('bash', bashArgs, { timeout: 60000 }, (err, stdout, stderr) => {
      if (err)
        return res
          .status(500)
          .json({ error: 'Comprehensive audit failed', stderr });
      res.json({ status: 'Comprehensive audit completed', stdout });
    });
  });

  // Get repository mismatch details.
  app.get('/audit/mismatch/:repo', auditRateLimit, (req, res) => {
    const repo = req.params.repo;
    const repoPath = resolveWithin(LOCAL_DIR, repo);
    if (!repoPath) {
      return res.status(400).json({ error: 'Invalid repo name' });
    }

    if (!fs.existsSync(path.join(repoPath, '.git'))) {
      return res.status(404).json({ error: 'Not a git repo' });
    }

    execGit(['remote', 'get-url', 'origin'], { cwd: repoPath }, (err, stdout) => {
      if (err)
        return res.status(500).json({ error: 'Failed to get remote URL' });

      const currentUrl = stdout.trim();
      const expectedUrl = `https://github.com/${config && config.get ? config.get('GITHUB_USER') : ''}/${repo}.git`;

      res.json({
        repo,
        currentUrl,
        expectedUrl,
        mismatch: currentUrl !== expectedUrl,
      });
    });
  });

  // Batch operation for multiple repositories.
  app.post('/audit/batch', auditRateLimit, (req, res) => {
    const { operation, repos } = req.body;
    if (!operation || !repos || !Array.isArray(repos)) {
      return res
        .status(400)
        .json({ error: 'operation and repos array required' });
    }

    const results = [];
    let completed = 0;

    repos.forEach((repo) => {
      let runner;
      const repoPath = resolveWithin(LOCAL_DIR, repo);
      const githubUser =
        config && config.get ? config.get('GITHUB_USER') : '';

      if (!repoPath) {
        results.push({ repo, success: false, error: 'Invalid repo name', output: null });
        completed++;
        if (completed === repos.length) res.json({ operation, results });
        return;
      }

      switch (operation) {
        case 'clone':
          runner = (cb) =>
            execGit(
              ['clone', '--', `https://github.com/${githubUser}/${repo}.git`, repoPath],
              cb
            );
          break;
        case 'fix-remote':
          runner = (cb) =>
            execGit(
              [
                'remote',
                'set-url',
                'origin',
                `https://github.com/${githubUser}/${repo}.git`,
              ],
              { cwd: repoPath },
              cb
            );
          break;
        case 'delete':
          runner = (cb) => removeDir(repoPath, cb);
          break;
        default:
          return res.status(400).json({ error: 'Invalid operation' });
      }

      runner((err, stdout) => {
        results.push({
          repo,
          success: !err,
          error: err ? err.message : null,
          output: stdout,
        });

        completed++;
        if (completed === repos.length) {
          res.json({ operation, results });
        }
      });
    });
  });

  // Discard changes in dirty repo.
  app.post('/audit/discard', auditRateLimit, (req, res) => {
    const { repo } = req.body;
    const repoPath = resolveWithin(LOCAL_DIR, repo);
    if (!repoPath)
      return res.status(400).json({ error: 'Invalid repo name' });
    if (!fs.existsSync(path.join(repoPath, '.git')))
      return res.status(404).json({ error: 'Not a git repo' });
    execGitSeq(
      [['reset', '--hard'], ['clean', '-fd']],
      { cwd: repoPath },
      (err) => {
        if (err) return res.status(500).json({ error: 'Discard failed' });
        res.json({ status: 'Discarded changes' });
      }
    );
  });

  // Return status and diff for dirty repository.
  app.get('/audit/diff/:repo', auditRateLimit, (req, res) => {
    const repo = req.params.repo;
    const repoPath = resolveWithin(LOCAL_DIR, repo);
    if (!repoPath)
      return res.status(400).json({ error: 'Invalid repo name' });
    if (!fs.existsSync(path.join(repoPath, '.git')))
      return res.status(404).json({ error: 'Not a git repo' });

    execGitSeq(
      [['status', '--short'], ['diff']],
      { cwd: repoPath },
      (err, stdouts) => {
        if (err) return res.status(500).json({ error: 'Diff failed' });
        res.json({ repo, diff: `${stdouts[0]}---\n${stdouts[1]}` });
      }
    );
  });

  // GitHub Webhook endpoint raw-body pre-middleware.
  // The actual handler is attached after construction via app.locals.webhookHandler.
  app.post('/api/v2/webhooks/github', (req, res, next) => {
    try {
      // Keep the raw bytes for signature verification BEFORE replacing
      // req.body with the parsed object — the HMAC must be computed over
      // exactly what GitHub signed, and parsing is lossy (key order,
      // whitespace, unicode escapes).
      req.rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from('');
      req.body = JSON.parse(req.rawBody.toString('utf8'));
      next();
    } catch (error) {
      console.error('Invalid JSON in webhook payload:', error);
      res.status(400).json({ error: 'Invalid JSON payload' });
    }
  });

  return app;
}

module.exports = { createApp };
