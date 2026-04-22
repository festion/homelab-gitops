// Tests for Vikunja #624 / NEW-3 / B10: /pipelines/metrics totalRuns + metrics:updated emit.
//
// Acceptance:
//   1. GET /api/v2/pipelines/metrics response includes `totalRuns` at the top level.
//   2. The handler emits a `metrics:updated` WS event (channel=metrics, event=updated)
//      on each successful refresh, so subscribers can invalidate cache without polling.

const request = require('supertest');
const { createApp } = require('../../createApp');
const { createFakeConfig, createFakeGithubMCP } = require('../fakes');

describe('GET /api/v2/pipelines/metrics (B10 / NEW-3)', () => {
  let app;
  let phase2WS;
  let pipelineService;

  beforeEach(() => {
    pipelineService = {
      // Per-repo shape must match the canonical RepoMetrics typedef in
      // services/pipeline/pipelineService.js (Vikunja #682).
      getPipelineMetrics: jest.fn(async () => ({
        metrics: {
          'org/repo-a': {
            total: 10, successful: 9, failed: 1, cancelled: 0,
            successRate: 90, failureRate: 10,
            averageDuration: 120, medianDuration: 115,
          },
          'org/repo-b': {
            total: 5, successful: 3, failed: 2, cancelled: 0,
            successRate: 60, failureRate: 40,
            averageDuration: 200, medianDuration: 195,
          },
        },
        timeRange: '7d',
        timestamp: '2026-04-21T12:00:00Z',
      })),
    };

    const calls = [];
    phase2WS = {
      calls,
      emit: jest.fn((channel, event, data) => calls.push({ channel, event, data })),
    };

    app = createApp({
      pipelineService,
      githubMCP: createFakeGithubMCP(),
      phase2WS,
      config: createFakeConfig({}),
    });
  });

  it('response includes totalRuns at top level (summed across repos)', async () => {
    const res = await request(app).get('/api/v2/pipelines/metrics?timeRange=7d');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalRuns', 15);  // 10 + 5
  });

  it('response keeps per-repo metrics map under .metrics', async () => {
    const res = await request(app).get('/api/v2/pipelines/metrics');
    expect(res.body).toHaveProperty('metrics');
    expect(res.body.metrics).toHaveProperty('org/repo-a');
  });

  it('response includes aggregate successRate + averageDuration', async () => {
    const res = await request(app).get('/api/v2/pipelines/metrics');
    // 9+3 = 12 successes / 15 total = 80%
    expect(res.body).toHaveProperty('successRate');
    expect(res.body.successRate).toBe(80);
    expect(res.body).toHaveProperty('averageDuration');
  });

  it('emits metrics:updated WS event after a successful refresh', async () => {
    await request(app).get('/api/v2/pipelines/metrics');

    const m = phase2WS.calls.find(
      (c) => c.channel === 'metrics' && c.event === 'updated',
    );
    expect(m).toBeDefined();
    expect(m.data).toHaveProperty('totalRuns', 15);
    expect(m.data).toHaveProperty('successRate');
    expect(m.data).toHaveProperty('timestamp');
  });
});
