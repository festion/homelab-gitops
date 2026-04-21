const request = require('supertest');
const { createApp } = require('../../createApp');
const { createFakeConfig, createFakeGithubMCP } = require('../fakes');
const PipelineService = require('../../services/pipeline/pipelineService');

describe('createApp — smoke', () => {
  it('returns an Express app that 404s on unknown routes', async () => {
    const factoryApp = createApp({});
    const res = await request(factoryApp).get('/does-not-exist');
    expect(res.status).toBe(404);
  });
});

// Re-enabled in PR 1 of Vikunja #624 (Option-A createApp + DI refactor).
// Rewritten to exercise the pipeline routes through createApp with a fake
// githubMCP and a stub authService instead of seeding a non-existent DB table.
// Shapes asserted match what pipelineService + phase2-endpoints actually return.
describe('Pipeline API Endpoints', () => {
  let app;
  let githubMCP;
  let authService;
  let pipelineService;
  const adminToken = 'admin-token';
  const viewerToken = 'viewer-token';

  beforeEach(() => {
    const adminUser = {
      id: 'test-admin',
      username: 'admin',
      role: 'admin',
      permissions: ['admin', 'pipelines:trigger', 'pipelines:read'],
      toJSON() { return { id: this.id, username: this.username, role: this.role }; },
    };
    const viewerUser = {
      id: 'test-viewer',
      username: 'viewer',
      role: 'viewer',
      permissions: ['pipelines:read'],
      toJSON() { return { id: this.id, username: this.username, role: this.role }; },
    };

    authService = {
      verifyToken: jest.fn(async (token) => {
        if (token === adminToken) return { user: adminUser, decoded: { userId: adminUser.id, role: 'admin' } };
        if (token === viewerToken) return { user: viewerUser, decoded: { userId: viewerUser.id, role: 'viewer' } };
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

    githubMCP = createFakeGithubMCP({
      workflowRuns: [
        {
          id: 101,
          name: 'CI',
          status: 'completed',
          conclusion: 'success',
          head_branch: 'main',
          head_sha: 'abc123',
          created_at: '2026-04-20T10:00:00Z',
          updated_at: '2026-04-20T10:05:00Z',
          actor: { login: 'testuser' },
        },
      ],
    });
    // Round out the githubMCP surface pipelineService expects.
    githubMCP.getWorkflowSteps = jest.fn(async () => []);
    githubMCP.getWorkflowRun = jest.fn(async () => ({ artifacts: [] }));
    githubMCP.getWorkflowRunDetails = jest.fn(async () => ({ artifacts: [] }));
    githubMCP.getWorkflowJobs = jest.fn(async () => []);
    githubMCP.triggerWorkflow = jest.fn(async () => ({ success: true, runId: 999 }));
    githubMCP.listWorkflows = jest.fn(async () => []);

    const config = createFakeConfig({
      MONITORED_REPOSITORIES: ['test-org/test-repo'],
    });

    pipelineService = new PipelineService({ config, githubMCP });
    // Stub methods whose real implementations depend on GitHub-shaped data the
    // fake doesn't provide. The test cares about call wiring, not the output.
    pipelineService.getPipelineMetrics = jest.fn(async (opts) => ({
      metrics: {},
      metadata: { timeRange: opts.timeRange, repository: opts.repository },
    }));
    pipelineService.triggerPipeline = jest.fn(async (r) => ({
      success: true,
      runId: 999,
      repository: r.repository,
      workflow: r.workflow,
    }));
    pipelineService.getPipelineHistory = jest.fn(async (repository) => ({
      repository,
      runs: [],
      metadata: { page: 1, per_page: 30, total: 0, timestamp: new Date().toISOString() },
    }));

    app = createApp({
      authService,
      pipelineService,
      githubMCP,
      config,
    });
  });

  describe('GET /api/v2/pipelines/status', () => {
    it('returns a pipelines array and metadata', async () => {
      const res = await request(app).get('/api/v2/pipelines/status');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('pipelines');
      expect(Array.isArray(res.body.pipelines)).toBe(true);
      expect(res.body).toHaveProperty('metadata');
    });

    it('calls githubMCP.getWorkflowRuns via the injected pipelineService', async () => {
      await request(app).get('/api/v2/pipelines/status');
      expect(githubMCP.getWorkflowRuns).toHaveBeenCalled();
    });

    it('returns an empty pipelines array when the fake has no runs', async () => {
      githubMCP.state.workflowRuns = [];
      const res = await request(app).get('/api/v2/pipelines/status');
      expect(res.status).toBe(200);
      expect(res.body.pipelines).toEqual([]);
    });
  });

  describe('POST /api/v2/pipelines/trigger', () => {
    it('rejects unauthenticated requests with 401', async () => {
      const res = await request(app)
        .post('/api/v2/pipelines/trigger')
        .send({ repository: 'test-org/test-repo', workflow: 'ci.yml' });
      expect(res.status).toBe(401);
    });

    it('rejects an invalid bearer token with 401', async () => {
      const res = await request(app)
        .post('/api/v2/pipelines/trigger')
        .set('Authorization', 'Bearer garbage')
        .send({ repository: 'test-org/test-repo', workflow: 'ci.yml' });
      expect(res.status).toBe(401);
    });

    it('rejects a viewer token with 403 (lacks pipelines:trigger permission)', async () => {
      const res = await request(app)
        .post('/api/v2/pipelines/trigger')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ repository: 'test-org/test-repo', workflow: 'ci.yml' });
      expect(res.status).toBe(403);
    });

    it('validates required fields (400 when repository or workflow missing)', async () => {
      const res = await request(app)
        .post('/api/v2/pipelines/trigger')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      expect(res.status).toBe(400);
    });

    it('triggers a pipeline with admin creds and returns the injected runId', async () => {
      const res = await request(app)
        .post('/api/v2/pipelines/trigger')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ repository: 'test-org/test-repo', workflow: 'ci.yml', branch: 'main' });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ success: true, runId: 999 });
      expect(pipelineService.triggerPipeline).toHaveBeenCalledWith(
        expect.objectContaining({
          repository: 'test-org/test-repo',
          workflow: 'ci.yml',
          branch: 'main',
        }),
      );
    });
  });

  describe('GET /api/v2/pipelines/metrics', () => {
    it('returns the injected metrics payload', async () => {
      const res = await request(app).get('/api/v2/pipelines/metrics?timeRange=7d');
      expect(res.status).toBe(200);
      expect(res.body.metadata).toMatchObject({ timeRange: '7d' });
      expect(pipelineService.getPipelineMetrics).toHaveBeenCalledWith(
        expect.objectContaining({ timeRange: '7d' }),
      );
    });
  });

  describe('GET /api/v2/pipelines/history/:repo', () => {
    it('returns a runs array + repository identifier', async () => {
      const res = await request(app).get('/api/v2/pipelines/history/test-org%2Ftest-repo');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('repository');
      expect(res.body).toHaveProperty('runs');
      expect(Array.isArray(res.body.runs)).toBe(true);
    });
  });
});
