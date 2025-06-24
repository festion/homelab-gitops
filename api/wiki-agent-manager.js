/**
 * WikiJS AI Agent Manager
 *
 * Manages the intelligent document discovery, processing, and upload pipeline
 * for converting Markdown documentation to WikiJS entries.
 *
 * Features:
 * - Document lifecycle management (DISCOVERED → UPLOADED)
 * - Repository-first processing strategy
 * - SQLite database for state tracking
 * - Integration with WikiJS MCP server
 *
 * Version: 1.0.0 (Phase 1A - Foundation)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();

class WikiAgentManager {
  constructor(config, rootDir) {
    this.config = config;
    this.rootDir = rootDir;
    this.dbPath = path.join(rootDir, 'wiki-agent.db');
    this.db = null;

    // Processing status constants
    this.STATUS = {
      DISCOVERED: 'DISCOVERED',
      ANALYZING: 'ANALYZING',
      READY: 'READY',
      UPLOADING: 'UPLOADING',
      UPLOADED: 'UPLOADED',
      OUTDATED: 'OUTDATED',
      CONFLICTED: 'CONFLICTED',
      FAILED: 'FAILED',
      ARCHIVED: 'ARCHIVED'
    };

    // Document type classifications
    this.DOC_TYPES = {
      README: 'readme',
      DOCS: 'docs',
      API: 'api',
      CONFIG: 'config',
      GUIDE: 'guide',
      REFERENCE: 'reference',
      CHANGELOG: 'changelog',
      UNKNOWN: 'unknown'
    };

    // Source location classifications
    this.SOURCES = {
      REPOS: 'repos',           // /repos/ directory
      GIT_ROOT: 'git-root',     // /mnt/c/GIT/ directory
      EXTERNAL: 'external'      // Other configured paths
    };
  }

  /**
   * Initialize the wiki agent database and create tables
   */
  async initialize() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Failed to open wiki agent database:', err);
          reject(err);
          return;
        }

        console.log('✅ Connected to wiki agent database');
        this.createTables()
          .then(() => resolve())
          .catch(reject);
      });
    });
  }

  /**
   * Create database tables for document lifecycle tracking
   */
  async createTables() {
    const tables = [
      // Document lifecycle tracking
      `CREATE TABLE IF NOT EXISTS wiki_documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_path TEXT UNIQUE NOT NULL,
        wiki_path TEXT,
        repository_name TEXT NOT NULL,
        source_location TEXT NOT NULL,
        document_type TEXT,
        content_hash TEXT,
        last_modified TIMESTAMP,
        sync_status TEXT NOT NULL DEFAULT 'DISCOVERED',
        priority_score INTEGER DEFAULT 50,
        error_message TEXT,
        metadata TEXT,  -- JSON string for additional metadata
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Processing batches for efficiency tracking
      `CREATE TABLE IF NOT EXISTS processing_batches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        batch_type TEXT NOT NULL,
        batch_name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING',
        documents_total INTEGER DEFAULT 0,
        documents_processed INTEGER DEFAULT 0,
        documents_uploaded INTEGER DEFAULT 0,
        documents_failed INTEGER DEFAULT 0,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        error_summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Wiki agent configuration and settings
      `CREATE TABLE IF NOT EXISTS agent_config (
        key TEXT PRIMARY KEY,
        value TEXT,
        description TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Processing statistics for dashboard
      `CREATE TABLE IF NOT EXISTS agent_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stat_date DATE,
        documents_discovered INTEGER DEFAULT 0,
        documents_processed INTEGER DEFAULT 0,
        documents_uploaded INTEGER DEFAULT 0,
        documents_failed INTEGER DEFAULT 0,
        processing_time_ms INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_wiki_docs_repo ON wiki_documents(repository_name)',
      'CREATE INDEX IF NOT EXISTS idx_wiki_docs_status ON wiki_documents(sync_status)',
      'CREATE INDEX IF NOT EXISTS idx_wiki_docs_source ON wiki_documents(source_location)',
      'CREATE INDEX IF NOT EXISTS idx_wiki_docs_priority ON wiki_documents(priority_score DESC)',
      'CREATE INDEX IF NOT EXISTS idx_processing_batches_status ON processing_batches(status)',
      'CREATE INDEX IF NOT EXISTS idx_agent_stats_date ON agent_stats(stat_date)'
    ];

    try {
      // Create tables
      for (const table of tables) {
        await this.runQuery(table);
      }

      // Create indexes
      for (const index of indexes) {
        await this.runQuery(index);
      }

      // Insert default configuration
      await this.initializeDefaultConfig();

      console.log('✅ Wiki agent database tables created successfully');
    } catch (error) {
      console.error('❌ Failed to create wiki agent tables:', error);
      throw error;
    }
  }

  /**
   * Initialize default configuration values
   */
  async initializeDefaultConfig() {
    const defaultConfig = [
      ['auto_discovery_enabled', 'true', 'Enable automatic document discovery'],
      ['discovery_interval_hours', '24', 'Hours between automatic discovery runs'],
      ['batch_size', '10', 'Number of documents to process in each batch'],
      ['priority_threshold', '70', 'Minimum priority score for automatic processing'],
      ['homelab_repo_priority', '100', 'Priority boost for homelab-gitops-auditor docs'],
      ['wikijs_base_path', '/projects', 'Base path in WikiJS for uploaded documents'],
      ['enable_content_enhancement', 'true', 'Enable AI-powered content improvement'],
      ['enable_link_resolution', 'true', 'Enable automatic link resolution'],
      ['max_retries', '3', 'Maximum retry attempts for failed uploads']
    ];

    for (const [key, value, description] of defaultConfig) {
      await this.runQuery(
        'INSERT OR IGNORE INTO agent_config (key, value, description) VALUES (?, ?, ?)',
        [key, value, description]
      );
    }
  }

  /**
   * Helper method to run database queries with Promise wrapper
   */
  runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  /**
   * Helper method to get query results with Promise wrapper
   */
  getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  /**
   * Helper method to get all query results with Promise wrapper
   */
  allQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  /**
   * Calculate SHA-256 hash of file content for change detection
   */
  calculateContentHash(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return crypto.createHash('sha256').update(content).digest('hex');
    } catch (error) {
      console.error(`Failed to calculate hash for ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Determine document type based on file path and content
   */
  classifyDocumentType(filePath) {
    const fileName = path.basename(filePath).toLowerCase();
    const dirName = path.dirname(filePath).toLowerCase();

    if (fileName === 'readme.md' || fileName === 'readme.txt') {
      return this.DOC_TYPES.README;
    }

    if (dirName.includes('docs') || dirName.includes('documentation')) {
      return this.DOC_TYPES.DOCS;
    }

    if (fileName.includes('api') || dirName.includes('api')) {
      return this.DOC_TYPES.API;
    }

    if (fileName.includes('config') || fileName.includes('setup')) {
      return this.DOC_TYPES.CONFIG;
    }

    if (fileName.includes('guide') || fileName.includes('tutorial')) {
      return this.DOC_TYPES.GUIDE;
    }

    if (fileName.includes('changelog') || fileName.includes('changes')) {
      return this.DOC_TYPES.CHANGELOG;
    }

    return this.DOC_TYPES.UNKNOWN;
  }

  /**
   * Determine source location category
   */
  classifySourceLocation(filePath) {
    if (filePath.includes('/repos/')) {
      return this.SOURCES.REPOS;
    }

    if (filePath.includes('/mnt/c/GIT/')) {
      return this.SOURCES.GIT_ROOT;
    }

    return this.SOURCES.EXTERNAL;
  }

  /**
   * Extract repository name from file path
   */
  extractRepositoryName(filePath) {
    // For /repos/ paths: /repos/myproject/... → myproject
    if (filePath.includes('/repos/')) {
      const repoMatch = filePath.match(/\/repos\/([^\/]+)/);
      return repoMatch ? repoMatch[1] : 'unknown';
    }

    // For /mnt/c/GIT/ paths: /mnt/c/GIT/homelab-gitops-auditor/... → homelab-gitops-auditor
    if (filePath.includes('/mnt/c/GIT/')) {
      const repoMatch = filePath.match(/\/mnt\/c\/GIT\/([^\/]+)/);
      return repoMatch ? repoMatch[1] : 'unknown';
    }

    return 'external';
  }

  /**
   * Calculate priority score for document processing
   */
  calculatePriorityScore(filePath, documentType, repositoryName) {
    let score = 50; // Base score

    // Repository-based priority
    if (repositoryName === 'homelab-gitops-auditor') {
      score += 50; // High priority for current project
    }

    // Document type priority
    switch (documentType) {
      case this.DOC_TYPES.README:
        score += 30;
        break;
      case this.DOC_TYPES.DOCS:
        score += 20;
        break;
      case this.DOC_TYPES.API:
        score += 15;
        break;
      case this.DOC_TYPES.GUIDE:
        score += 10;
        break;
      default:
        score += 5;
    }

    // File age penalty (newer files get higher priority)
    try {
      const stats = fs.statSync(filePath);
      const ageInDays = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
      if (ageInDays < 7) score += 10;
      else if (ageInDays < 30) score += 5;
      else if (ageInDays > 365) score -= 10;
    } catch (error) {
      // Ignore file stat errors
    }

    return Math.max(0, Math.min(100, score)); // Clamp to 0-100
  }

  /**
   * Get agent statistics for dashboard
   */
  async getAgentStats() {
    try {
      const totalDocs = await this.getQuery(
        'SELECT COUNT(*) as count FROM wiki_documents'
      );

      const statusCounts = await this.allQuery(`
        SELECT sync_status, COUNT(*) as count
        FROM wiki_documents
        GROUP BY sync_status
      `);

      const recentBatches = await this.allQuery(`
        SELECT * FROM processing_batches
        ORDER BY created_at DESC
        LIMIT 5
      `);

      const todayStats = await this.getQuery(`
        SELECT * FROM agent_stats
        WHERE stat_date = DATE('now')
        ORDER BY created_at DESC
        LIMIT 1
      `);

      return {
        totalDocuments: totalDocs?.count || 0,
        statusBreakdown: statusCounts.reduce((acc, row) => {
          acc[row.sync_status] = row.count;
          return acc;
        }, {}),
        recentBatches,
        todayStats,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get agent stats:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  async close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing wiki agent database:', err);
          } else {
            console.log('✅ Wiki agent database connection closed');
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = WikiAgentManager;
