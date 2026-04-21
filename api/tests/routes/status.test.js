// Tests for Vikunja #624 / #666 / B9: /api/v2/status shape split.
//
// Decision 4:
//   - The prior `GET /api/v2/status` handler (platform-health summary:
//     components, statistics, health, lastUpdated) moves to
//     `GET /api/v2/platform/health`.
//   - New `GET /api/v2/status` returns an aggregate `{pipelines, compliance,
//     metrics}` shape composed from the service DI tree.
//
// Verified zero dashboard callers of the old /status path (see plan Audit 1),
// so the rename is backwards-compatible.

const request = require('supertest');
const { createApp } = require('../../createApp');
const { createFakeConfig, createFakeGithubMCP } = require('../fakes');

describe('GET /api/v2/platform/health (renamed handler, B9)', () => {
  let app;

  beforeEach(() => {
    app = createApp({ config: createFakeConfig({}) });
  });

  it('returns the original platform summary body', async () => {
    const res = await request(app).get('/api/v2/platform/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('platformVersion');
    expect(res.body).toHaveProperty('components');
    expect(res.body.components).toHaveProperty('templateEngine');
    expect(res.body.components).toHaveProperty('pipelineEngine');
    expect(res.body).toHaveProperty('statistics');
    expect(res.body).toHaveProperty('health');
    expect(res.body.health).toHaveProperty('status');
  });
});

describe('GET /api/v2/status (new aggregate shape, B9)', () => {
  let app;
  let pipelineService;
  let complianceService;

  beforeEach(() => {
    pipelineService = {
      getPipelineStatus: jest.fn(async () => ({
        pipelines: [{ id: 1, status: 'success' }],
        metadata: { total: 1 },
      })),
      getPipelineMetrics: jest.fn(async () => ({
        metrics: { 'test-org/test-repo': { total: 10, successful: 9, successRate: 90 } },
        timeRange: '30d',
      })),
    };

    complianceService = {
      getComplianceStatus: jest.fn(async () => ({
        repositories: [
          { name: 'repo-a', score: 95, compliant: true },
          { name: 'repo-b', score: 40, compliant: false },
        ],
        summary: { totalRepos: 2, compliantRepos: 1, averageScore: 67.5 },
      })),
    };

    app = createApp({
      pipelineService,
      complianceService,
      githubMCP: createFakeGithubMCP(),
      config: createFakeConfig({}),
    });
  });

  it('returns aggregate { pipelines, compliance, metrics } shape', async () => {
    const res = await request(app).get('/api/v2/status');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('pipelines');
    expect(res.body).toHaveProperty('compliance');
    expect(res.body).toHaveProperty('metrics');
  });

  it('populates compliance summary + sample repositories', async () => {
    const res = await request(app).get('/api/v2/status').expect(200);
    expect(res.body.compliance).toHaveProperty('totalRepos');
    expect(res.body.compliance.totalRepos).toBe(2);
    expect(res.body.compliance).toHaveProperty('compliantRepos', 1);
  });

  it('populates pipelines block with total run count', async () => {
    const res = await request(app).get('/api/v2/status').expect(200);
    expect(res.body.pipelines).toHaveProperty('total');
  });

  it('populates metrics block', async () => {
    const res = await request(app).get('/api/v2/status').expect(200);
    expect(res.body.metrics).toBeDefined();
    expect(res.body.metrics).toHaveProperty('totalRuns');
  });
});
