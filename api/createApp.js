// api/createApp.js
// Factory that builds the Express app with services pre-wired to app.locals.
// server.js shrinks to a bootstrap that constructs services, wires them to
// app.locals via this factory, and listens. Tests call createApp({ ...fakes })
// instead of spinning up the full server.

const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

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
    const dest = path.join(LOCAL_DIR, repo);
    exec(`git clone ${clone_url} ${dest}`, (err) => {
      if (err) return res.status(500).json({ error: `Failed to clone ${repo}` });
      res.json({ status: `Cloned ${repo} to ${dest}` });
    });
  });

  // Delete extra repository.
  app.post('/audit/delete', auditRateLimit, (req, res) => {
    const { repo } = req.body;
    const target = path.join(LOCAL_DIR, repo);
    if (!fs.existsSync(target))
      return res.status(404).json({ error: 'Repo not found locally' });
    exec(`rm -rf ${target}`, (err) => {
      if (err) return res.status(500).json({ error: `Failed to delete ${repo}` });
      res.json({ status: `Deleted ${repo}` });
    });
  });

  // Commit dirty repository.
  app.post('/audit/commit', auditRateLimit, (req, res) => {
    const { repo, message } = req.body;
    const repoPath = path.join(LOCAL_DIR, repo);
    if (!fs.existsSync(path.join(repoPath, '.git')))
      return res.status(404).json({ error: 'Not a git repo' });
    const commitMessage = message || 'Auto commit from GitOps audit';
    const cmd = `cd ${repoPath} && git add . && git commit -m "${commitMessage}"`;
    exec(cmd, (err, stdout, stderr) => {
      if (err) return res.status(500).json({ error: 'Commit failed', stderr });
      res.json({ status: 'Committed changes', stdout });
    });
  });

  // Fix remote URL mismatch.
  app.post('/audit/fix-remote', auditRateLimit, (req, res) => {
    const { repo, expected_url } = req.body;
    if (!repo || !expected_url)
      return res
        .status(400)
        .json({ error: 'repo and expected_url required' });

    const repoPath = path.join(LOCAL_DIR, repo);
    if (!fs.existsSync(path.join(repoPath, '.git')))
      return res.status(404).json({ error: 'Not a git repo' });

    const cmd = `cd ${repoPath} && git remote set-url origin ${expected_url}`;
    exec(cmd, (err, stdout, stderr) => {
      if (err)
        return res
          .status(500)
          .json({ error: 'Failed to fix remote URL', stderr });
      res.json({ status: `Fixed remote URL for ${repo}`, stdout });
    });
  });

  // Run comprehensive audit script.
  app.post('/audit/run-comprehensive', auditRateLimit, (req, res) => {
    const scriptPath = isDev
      ? path.join(rootDir, 'scripts/comprehensive_audit.sh')
      : '/opt/gitops/scripts/comprehensive_audit.sh';

    const devFlag = isDev ? '--dev' : '';
    const cmd = `bash ${scriptPath} ${devFlag}`;

    exec(cmd, { timeout: 60000 }, (err, stdout, stderr) => {
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
    const repoPath = path.join(LOCAL_DIR, repo);

    if (!fs.existsSync(path.join(repoPath, '.git'))) {
      return res.status(404).json({ error: 'Not a git repo' });
    }

    const cmd = `cd ${repoPath} && git remote get-url origin`;
    exec(cmd, (err, stdout) => {
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
      let cmd;
      const repoPath = path.join(LOCAL_DIR, repo);

      switch (operation) {
        case 'clone':
          cmd = `git clone https://github.com/${config && config.get ? config.get('GITHUB_USER') : ''}/${repo}.git ${repoPath}`;
          break;
        case 'fix-remote':
          cmd = `cd ${repoPath} && git remote set-url origin https://github.com/${config && config.get ? config.get('GITHUB_USER') : ''}/${repo}.git`;
          break;
        case 'delete':
          cmd = `rm -rf ${repoPath}`;
          break;
        default:
          return res.status(400).json({ error: 'Invalid operation' });
      }

      exec(cmd, (err, stdout, stderr) => {
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
    const repoPath = path.join(LOCAL_DIR, repo);
    if (!fs.existsSync(path.join(repoPath, '.git')))
      return res.status(404).json({ error: 'Not a git repo' });
    const cmd = `cd ${repoPath} && git reset --hard && git clean -fd`;
    exec(cmd, (err) => {
      if (err) return res.status(500).json({ error: 'Discard failed' });
      res.json({ status: 'Discarded changes' });
    });
  });

  // Return status and diff for dirty repository.
  app.get('/audit/diff/:repo', auditRateLimit, (req, res) => {
    const repo = req.params.repo;
    const repoPath = path.join(LOCAL_DIR, repo);
    if (!fs.existsSync(path.join(repoPath, '.git')))
      return res.status(404).json({ error: 'Not a git repo' });

    const cmd = `cd ${repoPath} && git status --short && echo '---' && git diff`;
    exec(cmd, (err, stdout) => {
      if (err) return res.status(500).json({ error: 'Diff failed' });
      res.json({ repo, diff: stdout });
    });
  });

  // GitHub Webhook endpoint raw-body pre-middleware.
  // The actual handler is attached after construction via app.locals.webhookHandler.
  app.post('/api/v2/webhooks/github', express.raw({ type: 'application/json' }), (req, res, next) => {
    try {
      req.body = JSON.parse(req.body);
      next();
    } catch (error) {
      console.error('Invalid JSON in webhook payload:', error);
      res.status(400).json({ error: 'Invalid JSON payload' });
    }
  });

  return app;
}

module.exports = { createApp };
