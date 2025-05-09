// File: server.js

const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Parse command line arguments for port
const args = process.argv.slice(2);
let portArg = args.find(arg => arg.startsWith('--port='));
let portFromArg = portArg ? parseInt(portArg.split('=')[1], 10) : null;

// Determine if we're in development or production mode
const isDev = process.env.NODE_ENV !== 'production';
const rootDir = isDev
  ? path.resolve(__dirname, '..') // Development: /mnt/c/GIT/homelab-gitops-auditor
  : '/opt/gitops';                // Production: /opt/gitops

const app = express();
const PORT = portFromArg || process.env.PORT || 3070;
const HISTORY_DIR = path.join(rootDir, 'audit-history');
const LOCAL_DIR = isDev ? '/mnt/c/GIT' : '/mnt/c/GIT';

// Enable CORS for development
if (isDev) {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
  });
}

// Serve static dashboard files in development
if (isDev) {
  app.use(express.static(path.join(rootDir, 'dashboard/public')));
}

app.use(express.json());

// Load latest audit report
app.get('/audit', (req, res) => {
  try {
    // Try loading latest.json from audit-history
    const latestJsonPath = path.join(HISTORY_DIR, 'latest.json');
    
    if (fs.existsSync(latestJsonPath)) {
      const data = fs.readFileSync(latestJsonPath);
      res.json(JSON.parse(data));
    } else {
      // Fallback to reading the static file from dashboard/public in development
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

// List historical audit reports
app.get('/audit/history', (req, res) => {
  try {
    // Create history directory if it doesn't exist
    if (!fs.existsSync(HISTORY_DIR)) {
      fs.mkdirSync(HISTORY_DIR, { recursive: true });
    }
    
    const files = fs.readdirSync(HISTORY_DIR)
      .filter(f => f.endsWith('.json') && f !== 'latest.json')
      .sort()
      .reverse();
    
    // In development mode with no history, return empty array instead of error
    res.json(files);
  } catch (err) {
    console.error('Error listing audit history:', err);
    res.status(500).json({ error: 'Failed to list audit history.' });
  }
});

// Clone missing repository
app.post('/audit/clone', (req, res) => {
  const { repo, clone_url } = req.body;
  if (!repo || !clone_url) return res.status(400).json({ error: 'repo and clone_url required' });
  const dest = path.join(LOCAL_DIR, repo);
  exec(`git clone ${clone_url} ${dest}`, (err) => {
    if (err) return res.status(500).json({ error: `Failed to clone ${repo}` });
    res.json({ status: `Cloned ${repo}` });
  });
});

// Delete extra repository
app.post('/audit/delete', (req, res) => {
  const { repo } = req.body;
  const target = path.join(LOCAL_DIR, repo);
  if (!fs.existsSync(target)) return res.status(404).json({ error: 'Repo not found locally' });
  exec(`rm -rf ${target}`, (err) => {
    if (err) return res.status(500).json({ error: `Failed to delete ${repo}` });
    res.json({ status: `Deleted ${repo}` });
  });
});

// Commit dirty repository
app.post('/audit/commit', (req, res) => {
  const { repo, message } = req.body;
  const repoPath = path.join(LOCAL_DIR, repo);
  if (!fs.existsSync(path.join(repoPath, '.git'))) return res.status(404).json({ error: 'Not a git repo' });
  const commitMessage = message || 'Auto commit from GitOps audit';
  const cmd = `cd ${repoPath} && git add . && git commit -m "${commitMessage}"`;
  exec(cmd, (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: 'Commit failed', stderr });
    res.json({ status: 'Committed changes', stdout });
  });
});

// Discard changes in dirty repo
app.post('/audit/discard', (req, res) => {
  const { repo } = req.body;
  const repoPath = path.join(LOCAL_DIR, repo);
  if (!fs.existsSync(path.join(repoPath, '.git'))) return res.status(404).json({ error: 'Not a git repo' });
  const cmd = `cd ${repoPath} && git reset --hard && git clean -fd`;
  exec(cmd, (err) => {
    if (err) return res.status(500).json({ error: 'Discard failed' });
    res.json({ status: 'Discarded changes' });
  });
});

// Return status and diff for dirty repository
app.get('/audit/diff/:repo', (req, res) => {
  const repo = req.params.repo;
  const repoPath = path.join(LOCAL_DIR, repo);
  if (!fs.existsSync(path.join(repoPath, '.git'))) return res.status(404).json({ error: 'Not a git repo' });

  const cmd = `cd ${repoPath} && git status --short && echo '---' && git diff`;
  exec(cmd, (err, stdout) => {
    if (err) return res.status(500).json({ error: 'Diff failed' });
    res.json({ repo, diff: stdout });
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔧 GitOps Audit API running on port ${PORT}`);
});
