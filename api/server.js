// File: /opt/gitops/api/server.js

const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3070;
const HISTORY_DIR = '/opt/gitops/audit-history';
const LOCAL_DIR = '/mnt/c/GIT';

app.use(express.json());

// Load latest audit report
app.get('/audit', (req, res) => {
  try {
    const data = fs.readFileSync(path.join(HISTORY_DIR, 'latest.json'));
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: 'Failed to load latest audit report.' });
  }
});

// List historical audit reports
app.get('/audit/history', (req, res) => {
  try {
    const files = fs.readdirSync(HISTORY_DIR)
      .filter(f => f.endsWith('.json') && f !== 'latest.json')
      .sort()
      .reverse();
    res.json(files);
  } catch (err) {
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
