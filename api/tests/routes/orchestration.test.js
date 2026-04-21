// Tests for Vikunja #624 / #665 / B6+B7: flatten /orchestration/* responses.
// Decision 3: drop the outer `{success, orchestration: {...}}` wrapper.

const request = require('supertest');
const { createApp } = require('../../createApp');
const { createFakeConfig } = require('../fakes');

describe('Orchestration routes — flattened response shape (Decision 3)', () => {
  let app;
  let authService;
  let orchestrator;
  const adminToken = 'admin-token';

  beforeEach(() => {
    const adminUser = {
      id: 'test-admin',
      username: 'admin',
      role: 'admin',
      permissions: ['admin', 'pipeline:execute'],
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

    // Fake orchestrator — matches the surface routes/orchestration.js calls.
    orchestrator = {
      orchestratePipeline: jest.fn(async (config) => ({
        id: 'orch-test-1',
        status: 'started',
        profile: config.profile,
        stages: [{ name: 'a' }, { name: 'b' }, { name: 'c' }],
      })),
      getOrchestrationStatus: jest.fn((id) => ({
        id,
        status: 'completed',
        startedAt: '2026-04-21T10:00:00Z',
        completedAt: '2026-04-21T10:01:00Z',
        results: {
          repositories: ['repo-a', 'repo-b'],
          successful: ['repo-a'],
          failed: ['repo-b'],
        },
      })),
      listActiveOrchestrations: jest.fn(() => []),
    };

    app = createApp({
      authService,
      orchestrator,
      config: createFakeConfig({}),
    });
  });

  describe('POST /orchestration/execute/:profile (B6)', () => {
    it('returns flat body { orchestrationId, status, profile, ... } with no `success` wrapper', async () => {
      const res = await request(app)
        .post('/api/v2/orchestration/execute/full-gitops-audit')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('orchestrationId');
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('profile', 'full-gitops-audit');
      expect(res.body).toHaveProperty('repositories');
      expect(res.body).toHaveProperty('stages');
      expect(res.body).toHaveProperty('estimatedDuration');
      expect(res.body).not.toHaveProperty('success');
    });

    it('returns 404 (flat body, no success wrapper) for unknown profile', async () => {
      const res = await request(app)
        .post('/api/v2/orchestration/execute/does-not-exist')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
      expect(res.body).not.toHaveProperty('success');
    });
  });

  describe('GET /orchestration/status/:id (B7)', () => {
    it('returns flat body { orchestrationId, status, results, ... } with no nested orchestration wrapper', async () => {
      const res = await request(app)
        .get('/api/v2/orchestration/status/orch-test-1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('orchestrationId', 'orch-test-1');
      expect(res.body).toHaveProperty('status', 'completed');
      expect(res.body).toHaveProperty('results');
      expect(res.body.results).toMatchObject({
        successful: ['repo-a'],
        failed: ['repo-b'],
      });
      expect(res.body).not.toHaveProperty('success');
      expect(res.body).not.toHaveProperty('orchestration');
    });
  });
});
