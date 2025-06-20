/**
 * GitOps Auditor API Server with GitHub MCP Integration
 * 
 * Enhanced with GitHub MCP server integration for repository operations.
 * All git operations are coordinated through Serena MCP orchestration.
 * 
 * Version: 1.1.0 (Phase 1 MCP Integration)
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Load configuration and GitHub MCP manager
const ConfigLoader = require('./config-loader');
const GitHubMCPManager = require('./github-mcp-manager');

const config = ConfigLoader;
const githubMCP = new GitHubMCPManager(config);

// Parse command line arguments
const args = process.argv.slice(2);
const portArg = args.find(arg => arg.startsWith('--port='));
const portFromArg = portArg ? parseInt(portArg.split('=')[1]) : null;

// Environment detection
const isDev = process.env.NODE_ENV === 'development';
const rootDir = isDev ? process.cwd() : '/opt/gitops';

// Configuration
const PORT = portFromArg || process.env.PORT || 3070;
const HISTORY_DIR = path.join(rootDir, 'audit-history');
const LOCAL_DIR = path.join(rootDir, 'repos');

const app = express();

// CORS configuration with GitHub MCP integration awareness
const allowedOrigins = isDev ? ['http://localhost:5173', 'http://localhost:5174'] : [];

app.use(express.json());
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (isDev && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  }
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Middleware to log MCP integration status
app.use((req, res, next) => {
  if (req.path.startsWith('/audit')) {
    console.log(`🔄 API Request: ${req.method} ${req.path} (GitHub MCP: ${githubMCP.mcpAvailable ? 'Active' : 'Fallback'})`);
  }
  next();
});

// Load latest audit report
app.get('/audit', (req, res) => {
  try {
    console.log('📊 Loading latest audit report...');
    
    // Try loading latest.json from audit-history
    const latestPath = path.join(HISTORY_DIR, 'latest.json');
    let auditData;
    
    if (fs.existsSync(latestPath)) {
      auditData = JSON.parse(fs.readFileSync(latestPath, 'utf8'));
      console.log('✅ Loaded latest audit report from history');
    } else {
      // Fallback to dashboard/public/audit.json for development
      const fallbackPath = path.join(rootDir, 'dashboard', 'public', 'audit.json');
      if (fs.existsSync(fallbackPath)) {
        auditData = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
        console.log('✅ Loaded audit report from fallback location');
      } else {
        console.log('⚠️  No audit report found');
        return res.status(404).json({ error: 'No audit report available' });
      }
    }
    
    res.json(auditData);
  } catch (err) {
    console.error('❌ Error loading audit report:', err);
    res.status(500).json({ error: 'Failed to load latest audit report.' });
  }
});

// List historical audit reports
app.get('/audit/history', (req, res) => {
  try {
    console.log('📚 Loading audit history...');
    
    // Create history directory if it doesn't exist
    if (!fs.existsSync(HISTORY_DIR)) {
      fs.mkdirSync(HISTORY_DIR, { recursive: true });
    }
    
    const files = fs.readdirSync(HISTORY_DIR)
      .filter(file => file.endsWith('.json') && file !== 'latest.json')
      .sort((a, b) => b.localeCompare(a)) // Most recent first
      .slice(0, 50); // Limit to 50 most recent
    
    const history = files.map(file => ({
      filename: file,
      timestamp: file.replace('.json', ''),
      path: `/audit/history/${file}`
    }));
    
    console.log(`✅ Loaded ${history.length} historical reports`);
    res.json(history);
  } catch (err) {
    console.error('❌ Error loading audit history:', err);
    res.status(500).json({ error: 'Failed to load audit history' });
  }
});

// Clone missing repository using GitHub MCP
app.post('/audit/clone', async (req, res) => {
  const { repo, clone_url } = req.body;
  
  if (!repo || !clone_url) {
    return res.status(400).json({ error: 'repo and clone_url required' });
  }
  
  try {
    console.log(`🔄 Cloning repository: ${repo}`);
    const dest = path.join(LOCAL_DIR, repo);
    
    // Use GitHub MCP manager for cloning
    const result = await githubMCP.cloneRepository(repo, clone_url, dest);
    
    // Create issue for audit finding if MCP is available
    if (githubMCP.mcpAvailable) {
      await githubMCP.createIssueForAuditFinding(
        `Repository ${repo} was missing locally`,
        `Repository ${repo} was found missing from local audit environment and has been cloned.\n\nClone URL: ${clone_url}\nDestination: ${dest}`,
        ['audit', 'missing-repo', 'automated-fix']
      );
    }
    
    res.json(result);
  } catch (error) {
    console.error(`❌ Clone failed for ${repo}:`, error);
    res.status(500).json({ error: `Failed to clone ${repo}: ${error.message}` });
  }
});

// Delete extra repository
app.post('/audit/delete', (req, res) => {
  const { repo } = req.body;
  const target = path.join(LOCAL_DIR, repo);
  
  if (!fs.existsSync(target)) {
    return res.status(404).json({ error: 'Repo not found locally' });
  }
  
  console.log(`🗑️  Deleting extra repository: ${repo}`);
  exec(`rm -rf ${target}`, async (err) => {
    if (err) {
      console.error(`❌ Delete failed for ${repo}:`, err);
      return res.status(500).json({ error: `Failed to delete ${repo}` });
    }
    
    console.log(`✅ Successfully deleted ${repo}`);
    
    // Create issue for audit finding if MCP is available
    if (githubMCP.mcpAvailable) {
      try {
        await githubMCP.createIssueForAuditFinding(
          `Extra repository ${repo} was deleted`,
          `Repository ${repo} was found as an extra local repository (not in GitHub) and has been deleted.\n\nPath: ${target}`,
          ['audit', 'extra-repo', 'automated-cleanup']
        );
      } catch (issueError) {
        console.error('⚠️  Failed to create issue for deletion:', issueError);
      }
    }
    
    res.json({ status: `Deleted ${repo}` });
  });
});

// Commit dirty repository using GitHub MCP
app.post('/audit/commit', async (req, res) => {
  const { repo, message } = req.body;
  const repoPath = path.join(LOCAL_DIR, repo);
  
  if (!githubMCP.isGitRepository(repoPath)) {
    return res.status(404).json({ error: 'Not a git repo' });
  }
  
  try {
    console.log(`💾 Committing changes in repository: ${repo}`);
    const commitMessage = message || 'Auto commit from GitOps audit';
    
    // Use GitHub MCP manager for committing
    const result = await githubMCP.commitChanges(repo, repoPath, commitMessage);
    
    // Create issue for audit finding if MCP is available
    if (githubMCP.mcpAvailable) {
      await githubMCP.createIssueForAuditFinding(
        `Uncommitted changes in ${repo} were committed`,
        `Repository ${repo} had uncommitted changes that have been committed automatically.\n\nCommit message: ${commitMessage}\nPath: ${repoPath}`,
        ['audit', 'dirty-repo', 'automated-commit']
      );
    }
    
    res.json(result);
  } catch (error) {
    console.error(`❌ Commit failed for ${repo}:`, error);
    res.status(500).json({ error: 'Commit failed', details: error.message });
  }
});

// Fix remote URL using GitHub MCP
if (isDev) {
  app.post('/audit/fix-remote', async (req, res) => {
    const { repo, expected_url } = req.body;
    
    if (!repo || !expected_url) {
      return res.status(400).json({ error: 'repo and expected_url required' });
    }
    
    const repoPath = path.join(LOCAL_DIR, repo);
    
    if (!githubMCP.isGitRepository(repoPath)) {
      return res.status(404).json({ error: 'Not a git repo' });
    }
    
    try {
      console.log(`🔗 Fixing remote URL for repository: ${repo}`);
      
      // Use GitHub MCP manager for updating remote URL
      const result = await githubMCP.updateRemoteUrl(repo, repoPath, expected_url);
      
      // Create issue for audit finding if MCP is available
      if (githubMCP.mcpAvailable) {
        await githubMCP.createIssueForAuditFinding(
          `Remote URL mismatch fixed for ${repo}`,
          `Repository ${repo} had incorrect remote URL that has been fixed.\n\nNew URL: ${expected_url}\nPath: ${repoPath}`,
          ['audit', 'remote-mismatch', 'automated-fix']
        );
      }
      
      res.json(result);
    } catch (error) {
      console.error(`❌ Remote URL fix failed for ${repo}:`, error);
      res.status(500).json({ error: 'Failed to fix remote URL', details: error.message });
    }
  });

  // Get repository mismatch details using GitHub MCP
  app.get('/audit/mismatch/:repo', async (req, res) => {
    const repo = req.params.repo;
    const repoPath = path.join(LOCAL_DIR, repo);

    if (!githubMCP.isGitRepository(repoPath)) {
      return res.status(404).json({ error: 'Not a git repo' });
    }

    try {
      console.log(`🔍 Checking remote URL mismatch for: ${repo}`);
      
      // Use GitHub MCP manager for getting remote URL
      const result = await githubMCP.getRemoteUrl(repo, repoPath);
      const currentUrl = result.url;
      const expectedUrl = githubMCP.getExpectedGitHubUrl(repo);

      res.json({
        repo,
        currentUrl,
        expectedUrl,
        mismatch: currentUrl !== expectedUrl,
      });
    } catch (error) {
      console.error(`❌ Mismatch check failed for ${repo}:`, error);
      res.status(500).json({ error: 'Failed to get remote URL' });
    }
  });

  // Batch operation for multiple repositories using GitHub MCP
  app.post('/audit/batch', async (req, res) => {
    const { operation, repos } = req.body;
    
    if (!operation || !repos || !Array.isArray(repos)) {
      return res.status(400).json({ error: 'operation and repos array required' });
    }

    console.log(`🔄 Executing batch operation: ${operation} on ${repos.length} repositories`);
    
    const results = [];
    let completed = 0;

    for (const repo of repos) {
      const repoPath = path.join(LOCAL_DIR, repo);
      
      try {
        let result;
        
        switch (operation) {
          case 'clone':
            const cloneUrl = githubMCP.getExpectedGitHubUrl(repo);
            result = await githubMCP.cloneRepository(repo, cloneUrl, repoPath);
            break;
            
          case 'fix-remote':
            const expectedUrl = githubMCP.getExpectedGitHubUrl(repo);
            result = await githubMCP.updateRemoteUrl(repo, repoPath, expectedUrl);
            break;
            
          case 'delete':
            // Delete operation doesn't use MCP (file system operation)
            await new Promise((resolve, reject) => {
              exec(`rm -rf ${repoPath}`, (err) => {
                if (err) reject(err);
                else resolve();
              });
            });
            result = { status: `Deleted ${repo}` };
            break;
            
          default:
            throw new Error('Invalid operation');
        }
        
        results.push({
          repo,
          success: true,
          error: null,
          result: result,
        });
        
        console.log(`✅ Batch ${operation} completed for ${repo}`);
      } catch (error) {
        console.error(`❌ Batch ${operation} failed for ${repo}:`, error);
        results.push({
          repo,
          success: false,
          error: error.message,
          result: null,
        });
      }
      
      completed++;
    }
    
    console.log(`🎯 Batch operation completed: ${completed}/${repos.length} repositories processed`);
    res.json({ operation, results });
  });
}

// Discard changes in dirty repo using GitHub MCP
app.post('/audit/discard', async (req, res) => {
  const { repo } = req.body;
  const repoPath = path.join(LOCAL_DIR, repo);
  
  if (!githubMCP.isGitRepository(repoPath)) {
    return res.status(404).json({ error: 'Not a git repo' });
  }
  
  try {
    console.log(`🗑️  Discarding changes in repository: ${repo}`);
    
    // Use GitHub MCP manager for discarding changes
    const result = await githubMCP.discardChanges(repo, repoPath);
    
    // Create issue for audit finding if MCP is available
    if (githubMCP.mcpAvailable) {
      await githubMCP.createIssueForAuditFinding(
        `Changes discarded in ${repo}`,
        `Repository ${repo} had uncommitted changes that have been discarded.\n\nPath: ${repoPath}`,
        ['audit', 'changes-discarded', 'automated-cleanup']
      );
    }
    
    res.json(result);
  } catch (error) {
    console.error(`❌ Discard failed for ${repo}:`, error);
    res.status(500).json({ error: 'Discard failed', details: error.message });
  }
});

// Return status and diff for dirty repository using GitHub MCP
app.get('/audit/diff/:repo', async (req, res) => {
  const repo = req.params.repo;
  const repoPath = path.join(LOCAL_DIR, repo);
  
  if (!githubMCP.isGitRepository(repoPath)) {
    return res.status(404).json({ error: 'Not a git repo' });
  }

  try {
    console.log(`📊 Getting diff for repository: ${repo}`);
    
    // Use GitHub MCP manager for getting repository diff
    const result = await githubMCP.getRepositoryDiff(repo, repoPath);
    
    res.json({ repo, diff: result.diff });
  } catch (error) {
    console.error(`❌ Diff failed for ${repo}:`, error);
    res.status(500).json({ error: 'Diff failed', details: error.message });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 GitOps Auditor API Server started!');
  console.log(`📡 Server running on http://0.0.0.0:${PORT}`);
  console.log(`🔧 Environment: ${isDev ? 'Development' : 'Production'}`);
  console.log(`📂 Root directory: ${rootDir}`);
  console.log(`🔗 GitHub MCP: ${githubMCP.mcpAvailable ? 'Active' : 'Fallback mode'}`);
  console.log(`🎯 Ready to serve GitOps audit operations!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM signal, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT signal, shutting down gracefully...');
  process.exit(0);
});
