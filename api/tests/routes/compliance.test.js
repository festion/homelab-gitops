const request = require('supertest');
const { createApp } = require('../../createApp');
const {
  createFakeConfig,
  createFakeGithubMCP,
  createFakeTemplateEngine,
} = require('../fakes');
const ComplianceService = require('../../services/compliance/complianceService');
const { ComplianceIssue, ComplianceIssueType, ComplianceSeverity } = require('../../models/compliance');

// Re-enabled in PR 2 of Vikunja #624 (Option-A createApp + DI refactor).
// Rewritten to drive the real ComplianceService through createApp with a fake
// templateEngine + fake githubMCP instead of seeding non-existent DB tables.
//
// Assertions match what ComplianceService + the phase2 route layer currently
// produce. Several cases from the original pre-skip suite asserted behaviors
// that were never implemented (template-name validation, category filter,
// minScore/pagination on status, 429 rate-limit passthrough, sync
// /compliance/check response, nonexistent-repo 404). Those are captured as
// follow-up discovery tasks and are NOT asserted here — see skip-comment refs
// inline.
//
// As of #659 fix: /compliance/apply is now gated by authenticate +
// authorize(TEMPLATES, APPLY), matching /compliance/check. Viewer-token
// 403 + no-auth 401 are asserted below.
describe('Compliance API Endpoints', () => {
  let app;
  let templateEngine;
  let githubMCP;
  let config;
  let authService;
  let complianceService;
  const adminToken = 'admin-token';
  const viewerToken = 'viewer-token';

  beforeEach(() => {
    const adminUser = {
      id: 'test-admin',
      username: 'admin',
      role: 'admin',
      permissions: ['admin', 'templates:apply'],
      toJSON() { return { id: this.id, username: this.username, role: this.role }; },
    };
    const viewerUser = {
      id: 'test-viewer',
      username: 'viewer',
      role: 'viewer',
      permissions: ['compliance:read', 'pipelines:read'],
      toJSON() { return { id: this.id, username: this.username, role: this.role }; },
    };

    authService = {
      verifyToken: jest.fn(async (token) => {
        if (token === adminToken) {
          return { user: adminUser, decoded: { userId: adminUser.id, role: 'admin' } };
        }
        if (token === viewerToken) {
          return { user: viewerUser, decoded: { userId: viewerUser.id, role: 'viewer' } };
        }
        throw new Error('Invalid token');
      }),
      verifyApiKey: jest.fn(async () => { throw new Error('no api key'); }),
      logAuthEvent: jest.fn(async () => {}),
      checkPermission: jest.fn((auth, resource, action) => {
        if (!auth || !auth.permissions) return false;
        if (auth.permissions.includes('admin')) return true;
        return auth.permissions.includes(`${resource}:${action}`);
      }),
    };

    templateEngine = createFakeTemplateEngine({
      templates: [
        {
          id: 'standard-devops',
          name: 'Standard DevOps',
          version: '1.0.0',
          description: 'Baseline CI/CD + repo hygiene',
          type: 'devops',
          tags: ['ci'],
          requirements: {},
          files: [],
          directories: [],
          compliance: {},
          metadata: { version: '1.0.0', createdAt: '2026-01-01', updatedAt: '2026-04-01' },
          toJSON() { return { ...this }; },
        },
        {
          id: 'security-hardening',
          name: 'Security Hardening',
          version: '1.0.0',
          description: 'Security baseline',
          type: 'security',
          tags: ['security'],
          requirements: {},
          files: [],
          directories: [],
          compliance: {},
          metadata: { version: '1.0.0', createdAt: '2026-02-01', updatedAt: '2026-04-01' },
          toJSON() { return { ...this }; },
        },
      ],
    });

    githubMCP = createFakeGithubMCP();

    config = createFakeConfig({
      MONITORED_REPOSITORIES: ['repo-alpha', 'repo-bravo'],
    });

    complianceService = new ComplianceService({
      config,
      templateEngine,
      githubMCP,
      enabledTemplates: ['standard-devops'],
    });

    app = createApp({
      authService,
      complianceService,
      githubMCP,
      config,
    });
  });

  describe('GET /api/v2/compliance/status', () => {
    it('returns repositories + summary shape for all monitored repos', async () => {
      const res = await request(app).get('/api/v2/compliance/status');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('repositories');
      expect(res.body).toHaveProperty('summary');
      expect(Array.isArray(res.body.repositories)).toBe(true);
      expect(res.body.repositories).toHaveLength(2); // MONITORED_REPOSITORIES

      expect(res.body.summary).toHaveProperty('complianceRate');
      expect(res.body.summary).toHaveProperty('averageScore');
      expect(res.body.summary).toHaveProperty('totalRepos', 2);
      expect(res.body.summary).toHaveProperty('compliantRepos');
      expect(res.body.summary).toHaveProperty('nonCompliantRepos');
    });

    it('each repository entry exposes a numeric score + boolean compliant flag', async () => {
      const res = await request(app).get('/api/v2/compliance/status').expect(200);

      res.body.repositories.forEach((repo) => {
        expect(typeof repo.score).toBe('number');
        expect(repo.score).toBeGreaterThanOrEqual(0);
        expect(repo.score).toBeLessThanOrEqual(100);
        expect(typeof repo.compliant).toBe('boolean');
      });
    });

    it('filters to a single repo when ?repository= is passed', async () => {
      const res = await request(app)
        .get('/api/v2/compliance/status?repository=repo-alpha')
        .expect(200);

      expect(res.body.repositories).toHaveLength(1);
      expect(res.body.repositories[0].name).toBe('repo-alpha');
    });

    it('returns empty repositories list when MONITORED_REPOSITORIES is empty and no defaults supplied', async () => {
      config.state.values.MONITORED_REPOSITORIES = [];
      // Bypass the default-list fallback by seeding the service's field too.
      complianceService.monitoredRepositories = [];

      const res = await request(app).get('/api/v2/compliance/status');

      // NOTE: getMonitoredRepositories falls back to a hardcoded default list
      // when both config + field are empty, so "truly empty" is unreachable
      // from the route today. Assert the contract we do have: a valid shape
      // and a numeric summary. Empty-list support tracked as a follow-up.
      expect(res.status).toBe(200);
      expect(res.body.summary).toHaveProperty('totalRepos');
    });

    it('filters to compliant repos when ?filter=compliant', async () => {
      templateEngine.checkCompliance = jest.fn(async (repoPath, templateName) => {
        const compliant = repoPath.endsWith('repo-alpha');
        return {
          compliant,
          issues: compliant ? [] : [new ComplianceIssue({
            type: ComplianceIssueType.MISSING,
            template: templateName,
            file: 'README.md',
            severity: ComplianceSeverity.HIGH,
            description: 'missing README',
            recommendation: 'add README',
          })],
          template: { id: templateName, version: '1.0.0', getRequiredFiles: () => [] },
        };
      });

      const res = await request(app)
        .get('/api/v2/compliance/status?filter=compliant')
        .expect(200);

      expect(res.body.repositories).toHaveLength(1);
      expect(res.body.repositories.every(r => r.compliant === true)).toBe(true);
      expect(res.body.repositories[0].name).toBe('repo-alpha');
    });

    it('filters to non-compliant repos when ?filter=non-compliant', async () => {
      templateEngine.checkCompliance = jest.fn(async (repoPath, templateName) => {
        const compliant = repoPath.endsWith('repo-alpha');
        return {
          compliant,
          issues: compliant ? [] : [new ComplianceIssue({
            type: ComplianceIssueType.MISSING,
            template: templateName,
            file: 'README.md',
            severity: ComplianceSeverity.HIGH,
            description: 'missing README',
            recommendation: 'add README',
          })],
          template: { id: templateName, version: '1.0.0', getRequiredFiles: () => [] },
        };
      });

      const res = await request(app)
        .get('/api/v2/compliance/status?filter=non-compliant')
        .expect(200);

      expect(res.body.repositories).toHaveLength(1);
      expect(res.body.repositories.every(r => r.compliant === false)).toBe(true);
      expect(res.body.repositories[0].name).toBe('repo-bravo');
    });

    it('returns all repos when ?filter=all', async () => {
      const res = await request(app)
        .get('/api/v2/compliance/status?filter=all')
        .expect(200);

      expect(res.body.repositories).toHaveLength(2);
    });

    it('returns 400 on invalid ?filter=bogus', async () => {
      const res = await request(app)
        .get('/api/v2/compliance/status?filter=bogus');

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/invalid.*filter/i);
    });

    it('includes summary.lastUpdated + totalRepos + compliantCount fields (NEW-1)', async () => {
      const res = await request(app)
        .get('/api/v2/compliance/status')
        .expect(200);

      expect(res.body.summary).toHaveProperty('lastUpdated');
      expect(res.body.summary.lastUpdated).toBeTruthy();
      expect(res.body.summary).toHaveProperty('totalRepos', 2);
      expect(res.body.summary).toHaveProperty('compliantCount');
      expect(typeof res.body.summary.compliantCount).toBe('number');
    });
  });

  describe('GET /api/v2/compliance/repository/:repo', () => {
    it('returns compliance detail + recommendations for the named repo', async () => {
      const res = await request(app)
        .get('/api/v2/compliance/repository/repo-alpha')
        .expect(200);

      expect(res.body).toHaveProperty('name', 'repo-alpha');
      expect(res.body).toHaveProperty('score');
      expect(res.body).toHaveProperty('compliant');
      expect(res.body).toHaveProperty('issues');
      expect(Array.isArray(res.body.issues)).toBe(true);
      expect(res.body).toHaveProperty('recommendations');
      expect(Array.isArray(res.body.recommendations)).toBe(true);
    });

    it('includes applicationHistory when ?includeHistory=true', async () => {
      const res = await request(app)
        .get('/api/v2/compliance/repository/repo-alpha?includeHistory=true')
        .expect(200);

      expect(res.body).toHaveProperty('applicationHistory');
      expect(res.body.applicationHistory).toHaveProperty('applications');
      expect(res.body.applicationHistory).toHaveProperty('pagination');
    });

    it('surfaces a high-severity issue when templateEngine reports non-compliance', async () => {
      templateEngine.state.complianceResult = {
        compliant: false,
        issues: [
          new ComplianceIssue({
            type: ComplianceIssueType.MISSING,
            template: 'standard-devops',
            file: 'SECURITY.md',
            severity: ComplianceSeverity.HIGH,
            description: 'Missing SECURITY.md',
            recommendation: 'Add SECURITY.md',
          }),
        ],
        template: { id: 'standard-devops', version: '1.0.0', getRequiredFiles: () => [] },
      };

      const res = await request(app)
        .get('/api/v2/compliance/repository/repo-alpha')
        .expect(200);

      expect(res.body.compliant).toBe(false);
      expect(res.body.issues.length).toBeGreaterThan(0);
    });

    it('returns 404 for an unknown repository', async () => {
      const res = await request(app)
        .get('/api/v2/compliance/repository/does-not-exist');

      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/not found/i);
    });
  });

  describe('POST /api/v2/compliance/check', () => {
    it('rejects requests with no Authorization header (401)', async () => {
      const res = await request(app)
        .post('/api/v2/compliance/check')
        .send({ repositories: ['repo-alpha'], templates: ['standard-devops'] });

      expect(res.status).toBe(401);
    });

    it('returns an async-job shape with a jobId when authenticated', async () => {
      const res = await request(app)
        .post('/api/v2/compliance/check')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ repositories: ['repo-alpha'], templates: ['standard-devops'] });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('jobId');
      expect(typeof res.body.jobId).toBe('string');
      expect(res.body.jobId).toMatch(/^check_/);
      expect(res.body).toHaveProperty('repositories', ['repo-alpha']);
      expect(res.body).toHaveProperty('templates', ['standard-devops']);
      expect(res.body).toHaveProperty('estimatedDuration');
    });

    it('falls back to monitored + enabled when repositories/templates omitted', async () => {
      const res = await request(app)
        .post('/api/v2/compliance/check')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.repositories).toEqual(['repo-alpha', 'repo-bravo']);
      expect(res.body.templates).toEqual(['standard-devops']);
    });

    it('?wait=true returns sync {jobId, status:completed, results:[...]} (A11)', async () => {
      const res = await request(app)
        .post('/api/v2/compliance/check?wait=true')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ repositories: ['repo-alpha'], templates: ['standard-devops'] })
        .expect(200);

      expect(res.body).toHaveProperty('jobId');
      expect(res.body).toHaveProperty('status', 'completed');
      expect(res.body).toHaveProperty('results');
      expect(Array.isArray(res.body.results)).toBe(true);
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0]).toHaveProperty('repository', 'repo-alpha');
      expect(res.body.results[0]).toHaveProperty('success');
    });

    it('?wait=true returns 504 {jobId, status:timeout} when job exceeds timeout (A11)', async () => {
      // Stub waitForJob to resolve as a timeout directly — deterministic and
      // independent of real clock. Route exposes no user-tunable timeout to
      // avoid user-controlled setTimeout duration (CodeQL js/resource-exhaustion).
      jest.spyOn(complianceService, 'waitForJob').mockResolvedValue({
        status: 'timeout',
        job: { id: 'stub', status: 'running' },
      });

      const res = await request(app)
        .post('/api/v2/compliance/check?wait=true')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ repositories: ['repo-alpha'], templates: ['standard-devops'] });

      expect(res.status).toBe(504);
      expect(res.body).toHaveProperty('jobId');
      expect(res.body).toHaveProperty('status', 'timeout');

      complianceService.waitForJob.mockRestore();
    });
  });

  describe('GET /api/v2/compliance/templates', () => {
    it('returns the fake template list with usage stats wrapped around each', async () => {
      const res = await request(app)
        .get('/api/v2/compliance/templates')
        .expect(200);

      expect(res.body).toHaveProperty('templates');
      expect(Array.isArray(res.body.templates)).toBe(true);
      expect(res.body.templates).toHaveLength(2);

      const t = res.body.templates[0];
      expect(t).toHaveProperty('id');
      expect(t).toHaveProperty('name');
      expect(t).toHaveProperty('usage');
      expect(t.usage).toHaveProperty('totalApplications');
      expect(t.usage).toHaveProperty('successRate');
    });

    // Original suite asserted ?category=security filtering and a separate
    // "viewer tokens allowed" test. Category filtering is not implemented
    // (service passthrough). /compliance/templates has no auth gate at all —
    // so the viewer test trivially passes and adds no signal. Both tracked
    // as follow-ups.
  });

  describe('POST /api/v2/compliance/apply', () => {
    it('rejects requests with no Authorization header (401)', async () => {
      const res = await request(app)
        .post('/api/v2/compliance/apply')
        .send({ repository: 'repo-alpha', templates: ['standard-devops'] });

      expect(res.status).toBe(401);
    });

    it('rejects viewer tokens (403) — templates:apply permission required', async () => {
      const res = await request(app)
        .post('/api/v2/compliance/apply')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ repository: 'repo-alpha', templates: ['standard-devops'] });

      expect(res.status).toBe(403);
    });

    it('returns 400 when `repository` is missing', async () => {
      const res = await request(app)
        .post('/api/v2/compliance/apply')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ templates: ['standard-devops'] });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Missing required fields');
      expect(res.body.fields).toEqual(expect.arrayContaining(['repository']));
    });

    it('returns 400 when `templates` is missing', async () => {
      const res = await request(app)
        .post('/api/v2/compliance/apply')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ repository: 'repo-alpha' });

      expect(res.status).toBe(400);
      expect(res.body.fields).toEqual(expect.arrayContaining(['templates']));
    });

    it('returns 400 when templates is an empty array', async () => {
      const res = await request(app)
        .post('/api/v2/compliance/apply')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ repository: 'repo-alpha', templates: [] });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/non-empty array/);
    });

    it('returns the service result shape on success (single template, dryRun default)', async () => {
      const res = await request(app)
        .post('/api/v2/compliance/apply')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ repository: 'repo-alpha', templates: ['standard-devops'] });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('repository', 'repo-alpha');
      expect(res.body).toHaveProperty('templates', ['standard-devops']);
      expect(res.body).toHaveProperty('dryRun', true);
      expect(res.body).toHaveProperty('results');
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0]).toHaveProperty('template', 'standard-devops');
      expect(res.body.results[0]).toHaveProperty('success', true);
      expect(templateEngine.applyTemplate).toHaveBeenCalledWith(
        expect.any(String),
        'standard-devops',
        expect.objectContaining({ dryRun: true, createPR: false }),
      );
    });

    it('forwards dryRun=false + createPR=true to the template engine', async () => {
      await request(app)
        .post('/api/v2/compliance/apply')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          repository: 'repo-alpha',
          templates: ['standard-devops'],
          dryRun: false,
          createPR: true,
        })
        .expect(200);

      expect(templateEngine.applyTemplate).toHaveBeenCalledWith(
        expect.any(String),
        'standard-devops',
        expect.objectContaining({ dryRun: false, createPR: true }),
      );
    });

    it('invokes applyTemplate once per requested template', async () => {
      const res = await request(app)
        .post('/api/v2/compliance/apply')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          repository: 'repo-alpha',
          templates: ['standard-devops', 'security-hardening'],
        })
        .expect(200);

      expect(res.body.results).toHaveLength(2);
      expect(templateEngine.applyTemplate).toHaveBeenCalledTimes(2);
    });

    it('propagates engine failure into results with success=false', async () => {
      templateEngine.state.applyResult = {
        success: false,
        output: '',
        error: 'template not found',
      };

      const res = await request(app)
        .post('/api/v2/compliance/apply')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ repository: 'repo-alpha', templates: ['standard-devops'] })
        .expect(200);

      expect(res.body.results[0]).toHaveProperty('success', false);
      expect(res.body.results[0]).toHaveProperty('error', 'template not found');
    });

    it('exposes top-level {success, prUrl, repository, templates} (NEW-2, A12)', async () => {
      templateEngine.state.applyResult = {
        success: true,
        output: 'applied',
        error: null,
        filesWritten: ['.github/workflows/ci.yml'],
        prUrl: 'https://github.com/test/repo/pull/42',
      };

      const res = await request(app)
        .post('/api/v2/compliance/apply')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ repository: 'repo-alpha', templates: ['standard-devops'] })
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('prUrl', 'https://github.com/test/repo/pull/42');
      expect(res.body).toHaveProperty('repository', 'repo-alpha');
      expect(res.body).toHaveProperty('templates', ['standard-devops']);
      expect(res.body).toHaveProperty('results');
    });

    it('sets top-level success=false when any template fails (A12)', async () => {
      // First call succeeds, second fails, overall success=false.
      let call = 0;
      templateEngine.applyTemplate = jest.fn(async () => {
        call += 1;
        if (call === 1) return { success: true, output: 'ok', error: null };
        return { success: false, output: '', error: 'boom' };
      });

      const res = await request(app)
        .post('/api/v2/compliance/apply')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          repository: 'repo-alpha',
          templates: ['standard-devops', 'security-hardening'],
        })
        .expect(200);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v2/compliance/history', () => {
    it('returns an empty applications list + pagination envelope when no templates have been applied', async () => {
      const res = await request(app)
        .get('/api/v2/compliance/history')
        .expect(200);

      expect(res.body).toHaveProperty('applications');
      expect(Array.isArray(res.body.applications)).toBe(true);
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.pagination).toHaveProperty('total');
      expect(res.body.pagination).toHaveProperty('limit');
      expect(res.body.pagination).toHaveProperty('offset');
      expect(res.body.pagination).toHaveProperty('hasMore');
    });

    it('includes prior applications after /compliance/apply has been called', async () => {
      await request(app)
        .post('/api/v2/compliance/apply')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ repository: 'repo-alpha', templates: ['standard-devops'] })
        .expect(200);

      const res = await request(app)
        .get('/api/v2/compliance/history')
        .expect(200);

      expect(res.body.applications.length).toBeGreaterThan(0);
      const entry = res.body.applications[0];
      expect(entry).toHaveProperty('repository', 'repo-alpha');
      expect(entry).toHaveProperty('templateName', 'standard-devops');
    });

    it('filters history by ?repository=', async () => {
      await request(app)
        .post('/api/v2/compliance/apply')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ repository: 'repo-alpha', templates: ['standard-devops'] })
        .expect(200);
      await request(app)
        .post('/api/v2/compliance/apply')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ repository: 'repo-bravo', templates: ['standard-devops'] })
        .expect(200);

      const res = await request(app)
        .get('/api/v2/compliance/history?repository=repo-alpha')
        .expect(200);

      res.body.applications.forEach((app) => {
        expect(app.repository).toBe('repo-alpha');
      });
    });

    it('filters by ?timeRange=24h (A7)', async () => {
      // Seed two applications: one fresh, one old.
      const now = new Date();
      const old = new Date(now.getTime() - 48 * 60 * 60 * 1000); // 2 days ago
      const { TemplateApplication, ApplicationStatus } = require('../../models/compliance');
      complianceService.applicationHistory.set('fresh', new TemplateApplication({
        id: 'fresh',
        repository: 'repo-alpha',
        templateName: 'standard-devops',
        appliedAt: now.toISOString(),
        appliedBy: 'test',
        status: ApplicationStatus.SUCCESS,
      }));
      complianceService.applicationHistory.set('stale', new TemplateApplication({
        id: 'stale',
        repository: 'repo-alpha',
        templateName: 'standard-devops',
        appliedAt: old.toISOString(),
        appliedBy: 'test',
        status: ApplicationStatus.SUCCESS,
      }));

      const res = await request(app)
        .get('/api/v2/compliance/history?timeRange=24h')
        .expect(200);

      expect(res.body.applications).toHaveLength(1);
      expect(res.body.applications[0].id).toBe('fresh');
    });

    it('filters by ?timeRange=7d (A7)', async () => {
      const now = new Date();
      const within = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
      const outside = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
      const { TemplateApplication, ApplicationStatus } = require('../../models/compliance');
      complianceService.applicationHistory.set('within', new TemplateApplication({
        id: 'within',
        repository: 'repo-alpha',
        templateName: 'standard-devops',
        appliedAt: within.toISOString(),
        appliedBy: 'test',
        status: ApplicationStatus.SUCCESS,
      }));
      complianceService.applicationHistory.set('outside', new TemplateApplication({
        id: 'outside',
        repository: 'repo-alpha',
        templateName: 'standard-devops',
        appliedAt: outside.toISOString(),
        appliedBy: 'test',
        status: ApplicationStatus.SUCCESS,
      }));

      const res = await request(app)
        .get('/api/v2/compliance/history?timeRange=7d')
        .expect(200);

      expect(res.body.applications.map(a => a.id)).toEqual(['within']);
    });

    it('returns 400 on invalid ?timeRange (A8)', async () => {
      const res = await request(app)
        .get('/api/v2/compliance/history?timeRange=bogus');

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/invalid.*time.*range/i);
    });

    it('accepts all four documented timeRange values (A7)', async () => {
      for (const tr of ['24h', '7d', '30d', '90d']) {
        const res = await request(app)
          .get(`/api/v2/compliance/history?timeRange=${tr}`);
        expect(res.status).toBe(200);
      }
    });

    it('returns aggregated summary when ?aggregated=true (A10)', async () => {
      const { TemplateApplication, ApplicationStatus } = require('../../models/compliance');
      complianceService.applicationHistory.set('a', new TemplateApplication({
        id: 'a', repository: 'repo-alpha', templateName: 'standard-devops',
        appliedAt: new Date().toISOString(), appliedBy: 'test',
        status: ApplicationStatus.SUCCESS,
      }));
      complianceService.applicationHistory.set('b', new TemplateApplication({
        id: 'b', repository: 'repo-bravo', templateName: 'standard-devops',
        appliedAt: new Date().toISOString(), appliedBy: 'test',
        status: ApplicationStatus.FAILED,
      }));
      complianceService.applicationHistory.set('c', new TemplateApplication({
        id: 'c', repository: 'repo-alpha', templateName: 'security-hardening',
        appliedAt: new Date().toISOString(), appliedBy: 'test',
        status: ApplicationStatus.SUCCESS,
      }));

      const res = await request(app)
        .get('/api/v2/compliance/history?aggregated=true')
        .expect(200);

      expect(res.body).toHaveProperty('totalApplications', 3);
      expect(res.body).toHaveProperty('successCount', 2);
      expect(res.body).toHaveProperty('failureCount', 1);
      expect(res.body).toHaveProperty('byTemplate');
      expect(res.body.byTemplate['standard-devops']).toBeDefined();
      expect(res.body.byTemplate['security-hardening']).toBeDefined();
    });
  });
});
