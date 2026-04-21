// Tests for Vikunja #624 / #667 / B5: canonical pipeline WS events.
//
// Wire format per Decision 5: `{channel}:{event}`.
//
// On `POST /api/v2/pipelines/trigger`, the endpoint MUST emit
//   phase2WS.emit('pipelines', 'pipeline.triggered', ...)  (wire: pipelines:pipeline.triggered)
//   phase2WS.emit('pipelines', 'pipeline:status', ...)     (wire: pipelines:pipeline:status)
// The second is the lifecycle status event workflow.test.js listens for.

const request = require('supertest');
const { createApp } = require('../../createApp');
const { createFakeConfig, createFakeGithubMCP } = require('../fakes');
const PipelineService = require('../../services/pipeline/pipelineService');

describe('Pipeline WebSocket events (B5)', () => {
  let app;
  let phase2WS;
  let authService;
  let pipelineService;
  const adminToken = 'admin-token';

  beforeEach(() => {
    const adminUser = {
      id: 'test-admin',
      username: 'admin',
      role: 'admin',
      permissions: ['admin', 'pipelines:trigger', 'pipelines:read'],
      toJSON() { return { id: this.id, username: this.username, role: this.role }; },
    };

    authService = {
      verifyToken: jest.fn(async (token) => {
        if (token === adminToken) return { user: adminUser, decoded: { userId: adminUser.id, role: 'admin' } };
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

    const githubMCP = createFakeGithubMCP({ workflowRuns: [] });
    githubMCP.getWorkflowSteps = jest.fn(async () => []);
    githubMCP.getWorkflowRun = jest.fn(async () => ({ artifacts: [] }));
    githubMCP.getWorkflowRunDetails = jest.fn(async () => ({ artifacts: [] }));
    githubMCP.getWorkflowJobs = jest.fn(async () => []);
    githubMCP.triggerWorkflow = jest.fn(async () => ({ success: true, runId: 999 }));
    githubMCP.listWorkflows = jest.fn(async () => []);

    const config = createFakeConfig({ MONITORED_REPOSITORIES: ['test-org/test-repo'] });

    pipelineService = new PipelineService({ config, githubMCP });
    pipelineService.triggerPipeline = jest.fn(async (r) => ({
      success: true,
      runId: 999,
      repository: r.repository,
      workflow: r.workflow,
      status: 'pending',
    }));

    const calls = [];
    phase2WS = {
      calls,
      emit: jest.fn((channel, event, data) => calls.push({ channel, event, data })),
    };

    app = createApp({
      authService,
      pipelineService,
      githubMCP,
      config,
      phase2WS,
    });
  });

  it('POST /pipelines/trigger emits pipelines/pipeline.triggered', async () => {
    await request(app)
      .post('/api/v2/pipelines/trigger')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ repository: 'test-org/test-repo', workflow: 'ci.yml', branch: 'main' })
      .expect(200);

    const m = phase2WS.calls.find(
      (c) => c.channel === 'pipelines' && c.event === 'pipeline.triggered',
    );
    expect(m).toBeDefined();
    expect(m.data).toMatchObject({ repository: 'test-org/test-repo', workflow: 'ci.yml' });
  });

  it('POST /pipelines/trigger also emits pipelines/pipeline:status (lifecycle)', async () => {
    await request(app)
      .post('/api/v2/pipelines/trigger')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ repository: 'test-org/test-repo', workflow: 'ci.yml', branch: 'main' })
      .expect(200);

    const m = phase2WS.calls.find(
      (c) => c.channel === 'pipelines' && c.event === 'pipeline:status',
    );
    expect(m).toBeDefined();
    expect(m.data).toMatchObject({
      runId: 999,
      repository: 'test-org/test-repo',
      workflow: 'ci.yml',
    });
    expect(m.data.status).toBeDefined();
    expect(m.data.timestamp).toBeDefined();
  });
});
