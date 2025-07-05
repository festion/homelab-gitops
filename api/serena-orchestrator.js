// SerenaOrchestrator - Central coordinator for all MCP operations
// Manages complex multi-server workflows using Serena as the primary orchestrator

/**
 * SerenaOrchestrator coordinates MCP operations across multiple servers
 * Following the MCP integration guidelines where Serena marshalls all other MCP servers
 */
class SerenaOrchestrator {
    constructor(mcpServers) {
        this.githubMCP = mcpServers.github || null;
        this.codeLinterMCP = mcpServers.codeLinter || null;
        this.serenaMCP = mcpServers.serena || null;
        this.filesystemMCP = mcpServers.filesystem || null;
        
        this.isAvailable = this.serenaMCP !== null;
        this.codeLinterAvailable = this.codeLinterMCP !== null;
        this.githubAvailable = this.githubMCP !== null;
        this.filesystemAvailable = this.filesystemMCP !== null;
    }

    /**
     * Orchestrate repository cloning with quality validation
     * @param {string} repoName - Repository name
     * @param {string} cloneUrl - Repository clone URL
     * @param {string} destPath - Destination path for cloning
     */
    async orchestrateRepositoryClone(repoName, cloneUrl, destPath) {
        if (!this.isAvailable) {
            throw new Error('Serena MCP orchestrator not available');
        }

        try {
            console.log(`🎭 Serena orchestrating clone operation for ${repoName}...`);

            // Step 1: Use GitHub MCP to clone repository
            const cloneResult = await this.githubMCP.cloneRepository({
                url: cloneUrl,
                destination: destPath,
                name: repoName
            });

            // Step 2: Validate repository structure with code-linter
            if (this.codeLinterMCP) {
                console.log(`🔍 Validating repository structure for ${repoName}...`);
                await this.validateRepositoryStructure(destPath);
            }

            // Step 3: Log success through Serena
            await this.serenaMCP.logOperation({
                operation: 'repository_clone',
                repository: repoName,
                status: 'success',
                details: cloneResult
            });

            return {
                status: 'success',
                repository: repoName,
                path: destPath,
                mcpOrchestrated: true,
                details: cloneResult
            };

        } catch (error) {
            console.error(`❌ Serena orchestration failed for clone ${repoName}:`, error);
            
            // Log failure through Serena if available
            if (this.serenaMCP) {
                await this.serenaMCP.logOperation({
                    operation: 'repository_clone',
                    repository: repoName,
                    status: 'error',
                    error: error.message
                });
            }
            
            throw error;
        }
    }

    /**
     * Orchestrate commit operations with mandatory quality validation
     * @param {string} repoName - Repository name
     * @param {string} repoPath - Path to repository
     * @param {string} message - Commit message
     * @param {Array} filePaths - Files to commit (optional, commits all if not specified)
     */
    async orchestrateCommitWithValidation(repoName, repoPath, message, filePaths = null) {
        if (!this.isAvailable) {
            throw new Error('Serena MCP orchestrator not available');
        }

        try {
            console.log(`🎭 Serena orchestrating commit operation for ${repoName}...`);

            // Step 1: Mandatory code-linter validation before commit
            if (this.codeLinterAvailable) {
                console.log(`🔍 Running pre-commit validation for ${repoName}...`);
                const validationResult = await this.runPreCommitValidation(repoPath, filePaths);
                
                if (!validationResult.passed) {
                    throw new Error(`Pre-commit validation failed: ${validationResult.errors.join(', ')}`);
                }
                console.log(`✅ Pre-commit validation passed for ${repoName}`);
            } else {
                console.log(`⚠️  Code-linter not available, skipping validation for ${repoName}`);
            }

            // Step 2: Use GitHub MCP to commit changes
            let commitResult;
            if (filePaths) {
                // Commit specific files
                commitResult = await this.commitSpecificFiles(repoName, repoPath, message, filePaths);
            } else {
                // Commit all changes
                commitResult = await this.commitAllChanges(repoName, repoPath, message);
            }

            // Step 3: Log success through Serena
            await this.serenaMCP.logOperation({
                operation: 'repository_commit',
                repository: repoName,
                status: 'success',
                message: message,
                validated: this.codeLinterAvailable,
                details: commitResult
            });

            return {
                status: 'success',
                repository: repoName,
                message: message,
                mcpOrchestrated: true,
                validated: this.codeLinterAvailable,
                details: commitResult
            };

        } catch (error) {
            console.error(`❌ Serena orchestration failed for commit ${repoName}:`, error);
            
            // Log failure through Serena if available
            if (this.serenaMCP) {
                await this.serenaMCP.logOperation({
                    operation: 'repository_commit',
                    repository: repoName,
                    status: 'error',
                    message: message,
                    error: error.message
                });
            }
            
            throw error;
        }
    }

    /**
     * Orchestrate issue creation for audit findings
     * @param {string} title - Issue title
     * @param {string} body - Issue body
     * @param {Array} labels - Issue labels
     * @param {string} repository - Repository name (optional)
     */
    async orchestrateIssueCreation(title, body, labels = ['audit', 'automated'], repository = null) {
        if (!this.isAvailable || !this.githubMCP) {
            throw new Error('Serena or GitHub MCP not available for issue creation');
        }

        try {
            console.log(`🎭 Serena orchestrating issue creation: ${title}`);

            // Step 1: Create issue through GitHub MCP
            const issueResult = await this.githubMCP.createIssue({
                title: title,
                body: body,
                labels: labels,
                repository: repository
            });

            // Step 2: Log through Serena
            await this.serenaMCP.logOperation({
                operation: 'issue_creation',
                title: title,
                repository: repository,
                status: 'success',
                issue_id: issueResult.id,
                details: issueResult
            });

            return {
                status: 'success',
                issue: issueResult,
                mcpOrchestrated: true
            };

        } catch (error) {
            console.error(`❌ Serena orchestration failed for issue creation:`, error);
            
            // Log failure through Serena if available
            if (this.serenaMCP) {
                await this.serenaMCP.logOperation({
                    operation: 'issue_creation',
                    title: title,
                    repository: repository,
                    status: 'error',
                    error: error.message
                });
            }
            
            throw error;
        }
    }

    /**
     * Run pre-commit validation using code-linter MCP
     * @param {string} repoPath - Path to repository
     * @param {Array} filePaths - Specific files to validate (optional)
     */
    async runPreCommitValidation(repoPath, filePaths = null) {
        if (!this.codeLinterMCP) {
            return { passed: false, errors: ['Code-linter MCP not available'] };
        }

        try {
            const validationResult = await this.codeLinterMCP.validateFiles({
                repositoryPath: repoPath,
                files: filePaths,
                rules: ['eslint:recommended', 'prettier/recommended'],
                failOnWarnings: false
            });

            return {
                passed: validationResult.success,
                errors: validationResult.errors || [],
                warnings: validationResult.warnings || []
            };

        } catch (error) {
            return {
                passed: false,
                errors: [`Validation failed: ${error.message}`]
            };
        }
    }

    /**
     * Commit specific files using GitHub MCP
     */
    async commitSpecificFiles(repoName, repoPath, message, filePaths) {
        const fileContents = [];
        
        for (const filePath of filePaths) {
            const content = await this.filesystemMCP.readFile(`${repoPath}/${filePath}`);
            fileContents.push({
                path: filePath,
                content: content
            });
        }

        return await this.githubMCP.pushFiles({
            repository: repoName,
            files: fileContents,
            message: message,
            branch: 'main'
        });
    }

    /**
     * Commit all changes using GitHub MCP
     */
    async commitAllChanges(repoName, repoPath, message) {
        // Get all modified files from git status
        const changedFiles = await this.getChangedFiles(repoPath);
        
        if (changedFiles.length === 0) {
            throw new Error('No changes to commit');
        }

        return await this.commitSpecificFiles(repoName, repoPath, message, changedFiles);
    }

    /**
     * Get list of changed files in repository
     */
    async getChangedFiles(repoPath) {
        // This would typically use git status, but for MCP integration
        // we might use filesystem MCP to detect changes
        // For now, return empty array as placeholder
        return [];
    }

    /**
     * Validate repository structure using code-linter
     */
    async validateRepositoryStructure(repoPath) {
        if (!this.codeLinterMCP) {
            console.log('⚠️  Code-linter not available, skipping structure validation');
            return true;
        }

        try {
            const structureResult = await this.codeLinterMCP.validateStructure({
                repositoryPath: repoPath,
                requiredFiles: ['.gitignore', 'README.md'],
                recommendedFiles: ['CLAUDE.md', 'package.json']
            });

            if (!structureResult.passed) {
                console.log(`⚠️  Repository structure validation warnings: ${structureResult.warnings.join(', ')}`);
            }

            return structureResult.passed;

        } catch (error) {
            console.error('❌ Repository structure validation failed:', error);
            return false;
        }
    }
}

module.exports = SerenaOrchestrator;