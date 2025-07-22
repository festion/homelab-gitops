/**
 * WikiJS Agent Integration Tests
 *
 * Tests for the WikiJS document upload and connection functionality
 */

const WikiAgentManager = require('../wiki-agent-manager');
const fs = require('fs');
const path = require('path');

describe('WikiJS Agent Integration', () => {
  let wikiAgent;
  const testRootDir = path.join(__dirname, 'test-data');

  beforeAll(async () => {
    // Create test directory if it doesn't exist
    if (!fs.existsSync(testRootDir)) {
      fs.mkdirSync(testRootDir, { recursive: true });
    }

    // Initialize wiki agent with test configuration
    const testConfig = {
      get: (key) => {
        const configs = {
          WIKIJS_URL: 'http://test-wiki.example.com',
          WIKIJS_TOKEN: 'test-wikijs-token-for-diagnostic'
        };
        return configs[key];
      }
    };

    wikiAgent = new WikiAgentManager(testConfig, testRootDir);
    await wikiAgent.initialize();
  });

  afterAll(async () => {
    if (wikiAgent) {
      await wikiAgent.close();
    }

    // Clean up test database
    const dbPath = path.join(testRootDir, 'wiki-agent.db');
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  });

  describe('Database Initialization', () => {
    test('should initialize database tables successfully', async () => {
      // Database should be initialized in beforeAll
      expect(wikiAgent.db).toBeDefined();

      // Check if tables exist by running a simple query
      const result = await wikiAgent.getQuery(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='wiki_documents'"
      );
      expect(result).toBeDefined();
      expect(result.name).toBe('wiki_documents');
    });

    test('should have default configuration values', async () => {
      const config = await wikiAgent.allQuery('SELECT * FROM agent_config LIMIT 5');
      expect(config).toBeDefined();
      expect(config.length).toBeGreaterThan(0);
      
      // Check for specific config keys
      const autoDiscovery = config.find(c => c.key === 'auto_discovery_enabled');
      expect(autoDiscovery).toBeDefined();
      expect(autoDiscovery.value).toBe('true');
    });
  });

  describe('WikiJS Connection Testing', () => {
    test('should simulate WikiJS connection test with test configuration', async () => {
      const result = await wikiAgent.testWikiJSConnection();
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.status).toBe('simulated');
      expect(result.message).toContain('simulated');
      expect(result.note).toContain('Set WIKIJS_URL and WIKIJS_TOKEN environment variables for real connection');
    });

    test('should handle connection test errors gracefully', async () => {
      // Temporarily break the configuration
      const originalUrl = wikiAgent.productionConfig.wikijsUrl;
      wikiAgent.productionConfig.wikijsUrl = 'invalid-url';

      const result = await wikiAgent.testWikiJSConnectionMCP();
      
      expect(result).toBeDefined();
      expect(result.status).toBe('simulated');
      
      // Restore original configuration
      wikiAgent.productionConfig.wikijsUrl = originalUrl;
    });
  });

  describe('Document Discovery', () => {
    test('should classify document types correctly', () => {
      expect(wikiAgent.classifyDocumentType('README.md')).toBe('readme');
      expect(wikiAgent.classifyDocumentType('docs/API.md')).toBe('docs');
      expect(wikiAgent.classifyDocumentType('api/endpoints.md')).toBe('api');
      expect(wikiAgent.classifyDocumentType('guide/setup.md')).toBe('config'); // 'setup' in filename makes it config type
      expect(wikiAgent.classifyDocumentType('CHANGELOG.md')).toBe('changelog');
      expect(wikiAgent.classifyDocumentType('random.md')).toBe('unknown');
    });

    test('should generate valid wiki paths', () => {
      const wikiPath = wikiAgent.generateWikiPath('docs/API.md', 'test-repo');
      expect(wikiPath).toBe('/test-repo/docs/API');
      
      const readmePath = wikiAgent.generateWikiPath('README.md', 'my-project');
      expect(readmePath).toBe('/my-project/README');
    });

    test('should calculate priority scores', () => {
      // Create test file paths that exist to avoid fs.statSync errors
      const testFilePath1 = path.join(__dirname, '../package.json'); // This file exists
      const testFilePath2 = path.join(__dirname, '../package.json'); // This file exists
      
      const highPriority = wikiAgent.calculatePriorityScore(testFilePath1, 'readme', 'homelab-gitops-auditor');
      const normalPriority = wikiAgent.calculatePriorityScore(testFilePath2, 'unknown', 'other-repo');
      
      expect(highPriority).toBeGreaterThan(normalPriority);
      expect(highPriority).toBeGreaterThanOrEqual(50);
      expect(normalPriority).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Document Upload Simulation', () => {
    test('should simulate document upload successfully', async () => {
      const testParams = {
        file_path: '/test/path/doc.md',
        wiki_path: '/test-repo/doc',
        title: 'Test Document',
        description: 'Test description',
        tags: ['test', 'documentation']
      };

      const result = await wikiAgent.simulateWikiJSUpload(testParams);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.simulation).toBe(true);
      expect(result.pageId).toMatch(/^wiki_\d+_[a-z0-9]+$/);
      expect(result.title).toBe('Test Document');
      expect(result.wikiPath).toBe('/test-repo/doc');
    });

    test('should handle upload simulation with error message', () => {
      const testParams = {
        file_path: '/test/path/doc.md',
        wiki_path: '/test-repo/doc',
        title: 'Test Document'
      };

      const errorMessage = 'Test error for simulation';
      const result = wikiAgent.simulateWikiJSUpload(testParams, errorMessage);
      
      expect(result.note).toBe(errorMessage);
      expect(result.simulation).toBe(true);
    });
  });

  describe('Content Processing', () => {
    test('should extract titles from markdown content', () => {
      const contentWithTitle = '# My Document Title\n\nSome content here.';
      const title = wikiAgent.extractTitleFromContent(contentWithTitle);
      expect(title).toBe('My Document Title');

      const contentWithFrontMatter = `---
title: "YAML Title"
---
Some content without markdown title`;
      const yamlTitle = wikiAgent.extractTitleFromContent(contentWithFrontMatter);
      expect(yamlTitle).toBe('YAML Title');

      const contentWithoutTitle = 'Just some content without a title.';
      const noTitle = wikiAgent.extractTitleFromContent(contentWithoutTitle);
      expect(noTitle).toBeNull();
    });

    test('should generate appropriate tags', () => {
      const testDoc = {
        documentType: 'docs',
        repository_name: 'test-repo',
        source_location: 'repos',
        sourcePath: 'docs/guide.md'
      };

      const content = 'Some content here';
      const tags = wikiAgent.generateTagsFromDocument(testDoc, content);
      
      expect(tags).toContain('docs');
      expect(tags).toContain('test-repo');
      expect(tags).toContain('repos');
      expect(tags).toContain('format-md');
      expect(tags).toContain('auto-generated');
    });
  });

  describe('Agent Statistics', () => {
    test('should retrieve agent statistics', async () => {
      const stats = await wikiAgent.getAgentStats();
      
      expect(stats).toBeDefined();
      expect(stats.totalDocuments).toBeDefined();
      expect(stats.statusBreakdown).toBeDefined();
      expect(stats.lastUpdated).toBeDefined();
      expect(typeof stats.totalDocuments).toBe('number');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid file paths gracefully', () => {
      const hash = wikiAgent.calculateContentHash('/nonexistent/file.md');
      expect(hash).toBeNull();
    });

    test('should handle retry operations', async () => {
      let attempts = 0;
      const operation = () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Test error');
        }
        return 'success';
      };

      const result = await wikiAgent.retryOperation(operation, 5, 10);
      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    test('should fail after max retries', async () => {
      const operation = () => {
        throw new Error('Persistent error');
      };

      await expect(wikiAgent.retryOperation(operation, 2, 10))
        .rejects.toThrow('Persistent error');
    });
  });
});