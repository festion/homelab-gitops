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

class GitHubMCPManager {
    constructor(config) {
        this.config = config;
        this.githubUser = config.get('GITHUB_USER');
        this.mcpAvailable = false;
        
        // Initialize MCP availability check
        this.initializeMCP();
    }

    /**
     * Initialize and check MCP server availability
     */
    async initializeMCP() {
        try {
            // TODO: Integrate with Serena to check GitHub MCP server availability
            // For now, fallback to direct git commands with logging
            console.log('🔄 Initializing GitHub MCP integration...');
            this.mcpAvailable = false; // Will be updated when MCP is integrated
            console.log('⚠️  GitHub MCP not yet available, using fallback git commands');
        } catch (error) {
            console.error('❌ Failed to initialize GitHub MCP:', error);
            this.mcpAvailable = false;
        }
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
            
            // TODO: Use Serena to orchestrate GitHub MCP operations
            // Example MCP operation would be:
            // await serena.github.cloneRepository({
            //     url: cloneUrl,
            //     destination: destPath,
            //     branch: 'main'
            // });
            
            throw new Error('GitHub MCP not yet implemented - using fallback');
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
            
            // TODO: Use Serena to orchestrate GitHub MCP operations
            // Example MCP operation would be:
            // await serena.github.commitChanges({
            //     repository: repoPath,
            //     message: message,
            //     addAll: true
            // });
            
            throw new Error('GitHub MCP not yet implemented - using fallback');
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
    async createIssueForAuditFinding(title, body, labels = ['audit', 'automated']) {
        try {
            console.log(`🔄 Creating GitHub issue: ${title}`);
            
            if (this.mcpAvailable) {
                // TODO: Use Serena to orchestrate GitHub MCP operations
                // await serena.github.createIssue({
                //     title: title,
                //     body: body,
                //     labels: labels
                // });
                console.log('⚠️  GitHub MCP issue creation not yet implemented');
                return { status: 'Issue creation deferred - MCP not available' };
            } else {
                console.log('⚠️  GitHub MCP not available - issue creation skipped');
                return { status: 'Issue creation skipped - MCP not available' };
            }
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
}

module.exports = GitHubMCPManager;
