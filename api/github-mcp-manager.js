/**
 * GitHub MCP Integration Module
 * 
 * This module provides a wrapper around GitHub MCP server operations
 * to replace direct git commands with MCP-coordinated operations.
 * 
 * All operations are orchestrated through Serena for optimal workflow coordination.
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const SerenaOrchestrator = require('./serena-orchestrator');

class GitHubMCPManager {
    constructor(config) {
        this.config = config;
        this.githubUser = config.get('GITHUB_USER');
        this.mcpAvailable = false;
        this.codeLinterAvailable = false;
        this.serenaAvailable = false;
        
        // Store MCP server references (will be injected from app context)
        this.githubMCP = null;
        this.codeLinterMCP = null;
        this.serenaMCP = null;
        
        // Initialize MCP availability check
        this.initializeMCP();
    }

    /**
     * Initialize and check MCP server availability
     */
    async initializeMCP() {
        try {
            console.log('🔄 Initializing GitHub MCP integration...');
            
            // Check GitHub MCP server availability
            await this.checkGitHubMCPAvailability();
            
            // Check code-linter MCP server availability
            await this.checkCodeLinterMCPAvailability();
            
            // Check Serena MCP orchestrator availability
            await this.checkSerenaMCPAvailability();
            
            if (this.mcpAvailable) {
                console.log('✅ GitHub MCP server is available');
            } else {
                console.log('⚠️  GitHub MCP not available, using fallback git commands');
            }
            
            if (this.codeLinterAvailable) {
                console.log('✅ Code-linter MCP server is available');
            } else {
                console.log('⚠️  Code-linter MCP not available, quality gates disabled');
            }
            
            if (this.serenaAvailable) {
                console.log('✅ Serena MCP orchestrator is available');
            } else {
                console.log('⚠️  Serena MCP not available, using direct MCP calls');
            }
            
        } catch (error) {
            console.error('❌ Failed to initialize MCP servers:', error);
            this.mcpAvailable = false;
            this.codeLinterAvailable = false;
            this.serenaAvailable = false;
        }
    }

    /**
     * Check GitHub MCP server availability
     */
    async checkGitHubMCPAvailability() {
        try {
            // Test GitHub MCP connectivity by checking authenticated user
            if (this.githubMCP && typeof this.githubMCP.get_me === 'function') {
                await this.githubMCP.get_me();
                this.mcpAvailable = true;
                return true;
            }
            
            // Fallback: try to access GitHub MCP tools directly
            // In a real implementation, this would be injected from the app context
            console.log('🔍 GitHub MCP server reference not found, checking global availability...');
            this.mcpAvailable = false;
            return false;
            
        } catch (error) {
            console.error('❌ GitHub MCP availability check failed:', error);
            this.mcpAvailable = false;
            return false;
        }
    }

    /**
     * Check code-linter MCP server availability
     */
    async checkCodeLinterMCPAvailability() {
        try {
            // Test code-linter MCP connectivity
            if (this.codeLinterMCP && typeof this.codeLinterMCP.lint === 'function') {
                this.codeLinterAvailable = true;
                return true;
            }
            
            // Fallback: check if code-linter tools are available
            console.log('🔍 Code-linter MCP server reference not found, checking global availability...');
            this.codeLinterAvailable = false;
            return false;
            
        } catch (error) {
            console.error('❌ Code-linter MCP availability check failed:', error);
            this.codeLinterAvailable = false;
            return false;
        }
    }

    /**
     * Check Serena MCP orchestrator availability
     */
    async checkSerenaMCPAvailability() {
        try {
            // Test Serena MCP connectivity
            if (this.serenaMCP && typeof this.serenaMCP.orchestrate === 'function') {
                this.serenaAvailable = true;
                return true;
            }
            
            // Fallback: check if Serena tools are available
            console.log('🔍 Serena MCP orchestrator reference not found, checking global availability...');
            this.serenaAvailable = false;
            return false;
            
        } catch (error) {
            console.error('❌ Serena MCP availability check failed:', error);
            this.serenaAvailable = false;
            return false;
        }
    }

    /**
     * Set MCP server references (called from app initialization)
     * @param {Object} mcpServers - Object containing MCP server references
     */
    setMCPServers(mcpServers) {
        this.githubMCP = mcpServers.github || null;
        this.codeLinterMCP = mcpServers.codeLinter || null;
        this.serenaMCP = mcpServers.serena || null;
        
        // Re-initialize availability after setting references
        this.initializeMCP();
    }

    /**
     * Clone a repository using GitHub MCP or fallback to git
     * @param {string} repoName - Repository name
     * @param {string} cloneUrl - Repository clone URL
     * @param {string} destPath - Destination path for cloning
     */
    async cloneRepository(repoName, cloneUrl, destPath) {
        if (this.mcpAvailable) {
            return this.cloneRepositoryMCP(repoName, cloneUrl, destPath);
        } else {
            return this.cloneRepositoryFallback(repoName, cloneUrl, destPath);
        }
    }

    /**
     * Clone repository using GitHub MCP server (future implementation)
     */
    async cloneRepositoryMCP(repoName, cloneUrl, destPath) {
        try {
            console.log(`🔄 Cloning ${repoName} via GitHub MCP...`);
            
            // Use Serena orchestrator if available
            if (this.serenaAvailable && this.orchestrator) {
                const result = await this.orchestrator.orchestrateRepositoryClone(
                    repoName, 
                    cloneUrl, 
                    destPath
                );
                return result;
            }
            
            // Direct GitHub MCP operation if Serena not available
            if (this.githubMCP) {
                const result = await this.githubMCP.create_or_update_file({
                    owner: this.githubUser,
                    repo: repoName,
                    path: '.gitkeep',
                    content: '',
                    message: 'Initialize repository',
                    branch: 'main'
                });
                
                console.log(`✅ Repository ${repoName} initialized via GitHub MCP`);
                return { 
                    status: `Initialized ${repoName} via GitHub MCP`, 
                    mcpUsed: true,
                    details: result 
                };
            }
            
            throw new Error('No MCP servers available');
            
        } catch (error) {
            console.error(`❌ GitHub MCP clone failed for ${repoName}:`, error);
            return this.cloneRepositoryFallback(repoName, cloneUrl, destPath);
        }
    }

    /**
     * Clone repository using direct git command (fallback)
     */
    async cloneRepositoryFallback(repoName, cloneUrl, destPath) {
        return new Promise((resolve, reject) => {
            console.log(`📥 Cloning ${repoName} via git fallback...`);
            
            const cmd = `git clone ${cloneUrl} ${destPath}`;
            exec(cmd, (err, stdout, stderr) => {
                if (err) {
                    console.error(`❌ Git clone failed for ${repoName}:`, stderr);
                    reject(new Error(`Failed to clone ${repoName}: ${stderr}`));
                } else {
                    console.log(`✅ Successfully cloned ${repoName}`);
                    resolve({ status: `Cloned ${repoName} to ${destPath}`, stdout });
                }
            });
        });
    }

    /**
     * Commit changes in a repository using GitHub MCP or fallback
     * @param {string} repoName - Repository name
     * @param {string} repoPath - Path to repository
     * @param {string} message - Commit message
     */
    async commitChanges(repoName, repoPath, message) {
        if (this.mcpAvailable) {
            return this.commitChangesMCP(repoName, repoPath, message);
        } else {
            return this.commitChangesFallback(repoName, repoPath, message);
        }
    }

    /**
     * Commit changes using GitHub MCP server (future implementation)
     */
    async commitChangesMCP(repoName, repoPath, message) {
        try {
            console.log(`🔄 Committing changes in ${repoName} via GitHub MCP...`);
            
            // Use Serena orchestrator for commit with validation
            if (this.serenaAvailable && this.orchestrator) {
                const result = await this.orchestrator.orchestrateCommitWithValidation(
                    repoName, 
                    repoPath, 
                    message
                );
                return result;
            }
            
            // Direct GitHub MCP operation if Serena not available
            if (this.githubMCP) {
                // Get repository files that need to be committed
                const files = await this.getModifiedFiles(repoPath);
                
                if (files.length === 0) {
                    return { 
                        status: 'No changes to commit', 
                        mcpUsed: true 
                    };
                }
                
                const result = await this.githubMCP.push_files({
                    owner: this.githubUser,
                    repo: repoName,
                    branch: 'main',
                    files: files,
                    message: message
                });
                
                console.log(`✅ Successfully committed changes in ${repoName} via GitHub MCP`);
                return { 
                    status: `Committed changes in ${repoName} via GitHub MCP`, 
                    mcpUsed: true,
                    details: result 
                };
            }
            
            throw new Error('No MCP servers available');
            
        } catch (error) {
            console.error(`❌ GitHub MCP commit failed for ${repoName}:`, error);
            return this.commitChangesFallback(repoName, repoPath, message);
        }
    }

    /**
     * Commit changes using direct git commands (fallback)
     */
    async commitChangesFallback(repoName, repoPath, message) {
        return new Promise((resolve, reject) => {
            console.log(`💾 Committing changes in ${repoName} via git fallback...`);
            
            const cmd = `cd ${repoPath} && git add . && git commit -m "${message}"`;
            exec(cmd, (err, stdout, stderr) => {
                if (err) {
                    console.error(`❌ Git commit failed for ${repoName}:`, stderr);
                    reject(new Error(`Commit failed: ${stderr}`));
                } else {
                    console.log(`✅ Successfully committed changes in ${repoName}`);
                    resolve({ status: `Committed changes in ${repoName}`, stdout });
                }
            });
        });
    }

    /**
     * Update remote URL using GitHub MCP or fallback
     * @param {string} repoName - Repository name
     * @param {string} repoPath - Path to repository
     * @param {string} newUrl - New remote URL
     */
    async updateRemoteUrl(repoName, repoPath, newUrl) {
        if (this.mcpAvailable) {
            return this.updateRemoteUrlMCP(repoName, repoPath, newUrl);
        } else {
            return this.updateRemoteUrlFallback(repoName, repoPath, newUrl);
        }
    }

    /**
     * Update remote URL using GitHub MCP server (future implementation)
     */
    async updateRemoteUrlMCP(repoName, repoPath, newUrl) {
        try {
            console.log(`🔄 Updating remote URL for ${repoName} via GitHub MCP...`);
            
            // TODO: Use Serena to orchestrate GitHub MCP operations
            throw new Error('GitHub MCP not yet implemented - using fallback');
        } catch (error) {
            console.error(`❌ GitHub MCP remote update failed for ${repoName}:`, error);
            return this.updateRemoteUrlFallback(repoName, repoPath, newUrl);
        }
    }

    /**
     * Update remote URL using direct git command (fallback)
     */
    async updateRemoteUrlFallback(repoName, repoPath, newUrl) {
        return new Promise((resolve, reject) => {
            console.log(`🔗 Updating remote URL for ${repoName} via git fallback...`);
            
            const cmd = `cd ${repoPath} && git remote set-url origin ${newUrl}`;
            exec(cmd, (err, stdout, stderr) => {
                if (err) {
                    console.error(`❌ Git remote update failed for ${repoName}:`, stderr);
                    reject(new Error(`Failed to fix remote URL: ${stderr}`));
                } else {
                    console.log(`✅ Successfully updated remote URL for ${repoName}`);
                    resolve({ status: `Fixed remote URL for ${repoName}`, stdout });
                }
            });
        });
    }

    /**
     * Get remote URL using GitHub MCP or fallback
     * @param {string} repoName - Repository name
     * @param {string} repoPath - Path to repository
     */
    async getRemoteUrl(repoName, repoPath) {
        if (this.mcpAvailable) {
            return this.getRemoteUrlMCP(repoName, repoPath);
        } else {
            return this.getRemoteUrlFallback(repoName, repoPath);
        }
    }

    /**
     * Get remote URL using GitHub MCP server (future implementation)
     */
    async getRemoteUrlMCP(repoName, repoPath) {
        try {
            console.log(`🔄 Getting remote URL for ${repoName} via GitHub MCP...`);
            
            // TODO: Use Serena to orchestrate GitHub MCP operations
            throw new Error('GitHub MCP not yet implemented - using fallback');
        } catch (error) {
            console.error(`❌ GitHub MCP get remote failed for ${repoName}:`, error);
            return this.getRemoteUrlFallback(repoName, repoPath);
        }
    }

    /**
     * Get remote URL using direct git command (fallback)
     */
    async getRemoteUrlFallback(repoName, repoPath) {
        return new Promise((resolve, reject) => {
            console.log(`🔍 Getting remote URL for ${repoName} via git fallback...`);
            
            const cmd = `cd ${repoPath} && git remote get-url origin`;
            exec(cmd, (err, stdout, stderr) => {
                if (err) {
                    console.error(`❌ Git get remote failed for ${repoName}:`, stderr);
                    reject(new Error('Failed to get remote URL'));
                } else {
                    console.log(`✅ Successfully retrieved remote URL for ${repoName}`);
                    resolve({ url: stdout.trim(), stdout });
                }
            });
        });
    }

    /**
     * Discard changes using GitHub MCP or fallback
     * @param {string} repoName - Repository name
     * @param {string} repoPath - Path to repository
     */
    async discardChanges(repoName, repoPath) {
        if (this.mcpAvailable) {
            return this.discardChangesMCP(repoName, repoPath);
        } else {
            return this.discardChangesFallback(repoName, repoPath);
        }
    }

    /**
     * Discard changes using GitHub MCP server (future implementation)
     */
    async discardChangesMCP(repoName, repoPath) {
        try {
            console.log(`🔄 Discarding changes in ${repoName} via GitHub MCP...`);
            
            // TODO: Use Serena to orchestrate GitHub MCP operations
            throw new Error('GitHub MCP not yet implemented - using fallback');
        } catch (error) {
            console.error(`❌ GitHub MCP discard failed for ${repoName}:`, error);
            return this.discardChangesFallback(repoName, repoPath);
        }
    }

    /**
     * Discard changes using direct git command (fallback)
     */
    async discardChangesFallback(repoName, repoPath) {
        return new Promise((resolve, reject) => {
            console.log(`🗑️  Discarding changes in ${repoName} via git fallback...`);
            
            const cmd = `cd ${repoPath} && git reset --hard && git clean -fd`;
            exec(cmd, (err, stdout, stderr) => {
                if (err) {
                    console.error(`❌ Git discard failed for ${repoName}:`, stderr);
                    reject(new Error('Discard failed'));
                } else {
                    console.log(`✅ Successfully discarded changes in ${repoName}`);
                    resolve({ status: 'Discarded changes', stdout });
                }
            });
        });
    }

    /**
     * Get repository status and diff using GitHub MCP or fallback
     * @param {string} repoName - Repository name
     * @param {string} repoPath - Path to repository
     */
    async getRepositoryDiff(repoName, repoPath) {
        if (this.mcpAvailable) {
            return this.getRepositoryDiffMCP(repoName, repoPath);
        } else {
            return this.getRepositoryDiffFallback(repoName, repoPath);
        }
    }

    /**
     * Get repository diff using GitHub MCP server (future implementation)
     */
    async getRepositoryDiffMCP(repoName, repoPath) {
        try {
            console.log(`🔄 Getting repository diff for ${repoName} via GitHub MCP...`);
            
            // TODO: Use Serena to orchestrate GitHub MCP operations
            throw new Error('GitHub MCP not yet implemented - using fallback');
        } catch (error) {
            console.error(`❌ GitHub MCP diff failed for ${repoName}:`, error);
            return this.getRepositoryDiffFallback(repoName, repoPath);
        }
    }

    /**
     * Get repository diff using direct git command (fallback)
     */
    async getRepositoryDiffFallback(repoName, repoPath) {
        return new Promise((resolve, reject) => {
            console.log(`📊 Getting repository diff for ${repoName} via git fallback...`);
            
            const cmd = `cd ${repoPath} && git status --short && echo '---' && git diff`;
            exec(cmd, (err, stdout, stderr) => {
                if (err) {
                    console.error(`❌ Git diff failed for ${repoName}:`, stderr);
                    reject(new Error('Diff failed'));
                } else {
                    console.log(`✅ Successfully retrieved diff for ${repoName}`);
                    resolve({ diff: stdout, stdout });
                }
            });
        });
    }

    /**
     * Create GitHub issue for audit findings using GitHub MCP
     * @param {string} title - Issue title
     * @param {string} body - Issue body
     * @param {Array} labels - Issue labels
     */
    async createIssueForAuditFinding(title, body, labels = ['audit', 'automated'], repository = null) {
        try {
            console.log(`🔄 Creating GitHub issue: ${title}`);
            
            // Use Serena orchestrator for issue creation
            if (this.serenaAvailable && this.orchestrator) {
                const result = await this.orchestrator.orchestrateIssueCreation(
                    title, 
                    body, 
                    labels, 
                    repository
                );
                return result;
            }
            
            // Direct GitHub MCP operation if Serena not available
            if (this.mcpAvailable && this.githubMCP) {
                const issueResult = await this.githubMCP.create_issue({
                    owner: this.githubUser,
                    repo: repository || 'homelab-gitops-auditor',
                    title: title,
                    body: body,
                    labels: labels
                });
                
                console.log(`✅ Created GitHub issue via MCP: ${issueResult.html_url}`);
                return { 
                    status: 'Issue created via GitHub MCP', 
                    issue: issueResult,
                    mcpUsed: true 
                };
            }
            
            console.log('⚠️  No MCP servers available - issue creation skipped');
            return { status: 'Issue creation skipped - MCP not available' };
            
        } catch (error) {
            console.error('❌ Failed to create GitHub issue:', error);
            throw error;
        }
    }

    /**
     * Check if repository exists locally and has .git directory
     * @param {string} repoPath - Path to repository
     */
    isGitRepository(repoPath) {
        return fs.existsSync(path.join(repoPath, '.git'));
    }

    /**
     * Generate expected GitHub URL for repository
     * @param {string} repoName - Repository name
     */
    getExpectedGitHubUrl(repoName) {
        return `https://github.com/${this.githubUser}/${repoName}.git`;
    }

    /**
     * Set orchestrator reference (called from app initialization)
     * @param {SerenaOrchestrator} orchestrator - Serena orchestrator instance
     */
    setOrchestrator(orchestrator) {
        this.orchestrator = orchestrator;
        console.log('🎭 Serena orchestrator connected to GitHubMCPManager');
    }

    /**
     * Get modified files in repository for MCP commit operations
     * @param {string} repoPath - Path to repository
     */
    async getModifiedFiles(repoPath) {
        try {
            // In a real implementation, this would scan the filesystem
            // and detect changed files. For now, return placeholder
            // This would typically integrate with filesystem MCP server
            console.log(`🔍 Scanning for modified files in ${repoPath}...`);
            
            // Placeholder implementation - in reality would use:
            // - Filesystem MCP to read directory
            // - Git status equivalent through GitHub MCP
            // - File comparison logic
            
            return [];
            
        } catch (error) {
            console.error(`❌ Failed to get modified files in ${repoPath}:`, error);
            return [];
        }
    }

    /**
     * Update createIssueForAuditFinding to use Serena orchestration
     */
}

module.exports = GitHubMCPManager;
