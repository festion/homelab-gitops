const request = require('supertest');
const express = require('express');
const { Server } = require('socket.io');
const Client = require('socket.io-client');
const { createServer } = require('http');
const TestHelpers = require('../helpers/testHelpers');
const {
  createFakeConfig,
  createFakeGithubMCP,
  createFakeTemplateEngine,
  createFakeOrchestrator,
  createFakeWebhookHandler,
} = require('../fakes');
const ComplianceService = require('../../services/compliance/complianceService');
const PipelineService = require('../../services/pipeline/pipelineService');

// Re-enabled in PR C of Vikunja #624 after PRs A (#98) + B (#99) aligned
// response shapes and WS event names. Setup rewritten to mount phase2-endpoints
// with DI-injected fakes instead of touching fabricated DB tables that
// production code never reads from. Several sub-cases whose assertions depend
// on behaviors not delivered by PRs A/B are `it.skip`ed inline with a Vikunja
// task reference — they become their own PRs.
describe('End-to-End Workflow Integration', () => {
  let app;
  let currentApp;  // dispatcher holder — httpServer calls currentApp(req,res)
  let httpServer;
  let socketServer;
  let socketClient;
  let serverPort;
  let adminToken;
  let viewerToken;
  // Fakes + services — re-created per-test so state doesn't leak across it()s
  let githubMCP;
  let templateEngine;
  let orchestrator;
  let webhookHandler;
  let complianceService;
  let pipelineService;
  let config;

  // Bridge: fake-service -> test socket.io server. When a fake emits
  // `orchestration:progress` (or similar), broadcast to all connected sockets
  // so the test's socketClient.on(...) listeners fire.
  function makeWsEmit() {
    return (event, data) => {
      if (socketServer) socketServer.emit(event, data);
    };
  }

  // Pipeline WS emitter — pipelineService doesn't emit WS directly in this
  // test harness; the route triggers a synthetic pipeline:status event.
  function emitPipelineStatus(runId, repository, status) {
    if (socketServer) {
      socketServer.emit('pipeline:status', {
        runId, repository, status, timestamp: new Date().toISOString(),
      });
    }
  }

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-jwt-secret-key';
    adminToken = 'admin-workflow-token';
    viewerToken = 'viewer-workflow-token';

    // HTTP server with a dispatcher that delegates to currentApp (set in
    // beforeEach). This lets us rebuild the Express app per-test without
    // tearing down socket.io's own request listeners (which handle polling
    // transport) — removeAllListeners('request') would wipe them too.
    httpServer = createServer((req, res) => {
      if (currentApp) return currentApp(req, res);
      res.statusCode = 503;
      res.end();
    });
    socketServer = new Server(httpServer, {
      cors: { origin: '*', methods: ['GET', 'POST'] },
    });

    // Minimal auth on the socket: any non-empty token is accepted (the
    // real token verification runs at the HTTP layer via our authService stub).
    socketServer.use((socket, next) => {
      if (!socket.handshake.auth?.token) return next(new Error('Authentication error'));
      next();
    });

    // Socket-level subscription handlers — mirrors the original test's intent
    // so socketClient.emit('subscribe', ...) doesn't error out.
    socketServer.on('connection', (socket) => {
      socket.on('subscribe', (data) => {
        socket.join(`${data.type}:${data.repository || 'all'}`);
        socket.emit('subscribed', data);
      });
      socket.on('unsubscribe', (data) => {
        socket.leave(`${data.type}:${data.repository || 'all'}`);
        socket.emit('unsubscribed', data);
      });
    });

    await new Promise((resolve) => {
      httpServer.listen(() => {
        serverPort = httpServer.address().port;
        resolve();
      });
    });
  });

  beforeEach(async () => {
    // ---- Build fakes and real services (compliance + pipeline are real;
    // orchestrator + webhookHandler are fakes because the real orchestrator
    // hits githubMCP in complex ways the workflow test doesn't try to simulate).
    githubMCP = createFakeGithubMCP({
      workflowRuns: [
        { id: 12345, status: 'completed', conclusion: 'success', head_branch: 'main', name: 'CI' },
      ],
    });

    templateEngine = createFakeTemplateEngine({
      templates: [
        { id: 'standard-devops', name: 'Standard DevOps', type: 'devops',
          version: '1.0.0', tags: [], requirements: {}, files: [], directories: [],
          compliance: {}, metadata: { version: '1.0.0', createdAt: '2026-01-01', updatedAt: '2026-04-01' },
          toJSON() { return { ...this }; } },
        { id: 'security-hardening', name: 'Security Hardening', type: 'security',
          version: '1.0.0', tags: [], requirements: {}, files: [], directories: [],
          compliance: {}, metadata: { version: '1.0.0', createdAt: '2026-02-01', updatedAt: '2026-04-01' },
          toJSON() { return { ...this }; } },
      ],
    });

    orchestrator = createFakeOrchestrator({ wsEmit: makeWsEmit() });
    webhookHandler = createFakeWebhookHandler();

    config = createFakeConfig({
      MONITORED_REPOSITORIES: ['test-repo-1', 'test-repo-2'],
    });

    complianceService = new ComplianceService({ config, templateEngine, githubMCP });
    pipelineService = new PipelineService({ config, githubMCP });

    // ---- authService stub: accepts admin + viewer tokens
    const adminUser = {
      id: 'test-admin', username: 'admin', role: 'admin',
      permissions: ['admin', 'templates:apply', 'pipelines:execute'],
      toJSON() { return { id: this.id, username: this.username, role: this.role }; },
    };
    const viewerUser = {
      id: 'test-viewer', username: 'viewer', role: 'viewer',
      permissions: ['compliance:read', 'pipelines:read'],
      toJSON() { return { id: this.id, username: this.username, role: this.role }; },
    };
    const authService = {
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

    // ---- Build app inline (not via createApp — we need our bridge middleware
    // to run BEFORE phase2Router so req.orchestrator + req.services come from
    // our fakes).
    app = express();
    app.use(express.json());
    Object.assign(app.locals, {
      authService, complianceService, pipelineService,
      orchestrator, webhookHandler, githubMCP, config,
    });

    // Bridge middleware — attach fakes + a websocket shim to every request so
    // phase2-endpoints' internal helpers find them.
    app.use((req, _res, next) => {
      req.orchestrator = orchestrator;
      req.webhookHandler = webhookHandler;
      req.services = {
        websocket: {
          emit: (channel, event, data) => {
            if (socketServer) socketServer.emit(`${channel}:${event}`, data);
          },
        },
      };
      next();
    });

    // Mount phase2 router + wire compliance WS bridges
    const phase2Router = require('../../phase2-endpoints');
    const { wireComplianceWSListeners } = require('../../phase2-endpoints');
    app.use('/api/v2', phase2Router);
    wireComplianceWSListeners(complianceService, app);

    // Route handlers on phase2 read `req.app.locals.<svc>` — confirmed wired above.

    // ---- Swap the dispatcher's current app (no listener churn)
    currentApp = app;

    // ---- Set up the socket client (fresh per test)
    socketClient = new Client(`http://localhost:${serverPort}`, {
      auth: { token: adminToken },
    });
    await new Promise((resolve, reject) => {
      socketClient.once('connect', resolve);
      socketClient.once('connect_error', reject);
      setTimeout(() => reject(new Error('socket connect timeout')), 3000);
    });
  });

  afterEach(() => {
    if (socketClient) {
      socketClient.disconnect();
      socketClient = null;
    }
  });

  afterAll(() => {
    if (socketServer) socketServer.close();
    if (httpServer) httpServer.close();
  });

  describe('Complete Pipeline Orchestration Flow', () => {
    it('should complete full pipeline orchestration workflow', async () => {
      // 1. Start orchestration
      const orchestrationResponse = await request(app)
        .post('/api/v2/orchestration/execute/full-gitops-audit')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          repositories: ['test-repo-1', 'test-repo-2'],
          profile: 'comprehensive',
          options: {
            parallelExecution: true,
            timeoutMinutes: 30
          }
        })
        .expect(200);

      const orchestrationId = orchestrationResponse.body.orchestrationId;
      expect(orchestrationId).toBeDefined();
      expect(orchestrationResponse.body.status).toBe('started');

      // 2. Monitor orchestration progress via WebSocket
      const progressUpdates = [];
      socketClient.on('orchestration:progress', (data) => {
        if (data.orchestrationId === orchestrationId) {
          progressUpdates.push(data);
        }
      });

      // 3. Wait for orchestration completion
      let completed = false;
      let attempts = 0;
      const maxAttempts = 30;
      
      while (!completed && attempts < maxAttempts) {
        const statusResponse = await request(app)
          .get(`/api/v2/orchestration/status/${orchestrationId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        if (statusResponse.body.status === 'completed') {
          completed = true;
          expect(statusResponse.body.results).toBeDefined();
          expect(statusResponse.body.results.repositories).toHaveLength(2);
        } else if (statusResponse.body.status === 'failed') {
          throw new Error(`Orchestration failed: ${statusResponse.body.error}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }

      expect(completed).toBe(true);
      expect(progressUpdates.length).toBeGreaterThan(0);

      // 4. Verify compliance was updated
      const complianceResponse = await request(app)
        .get('/api/v2/compliance/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(complianceResponse.body.summary.lastUpdated).toBeTruthy();
      expect(complianceResponse.body.repositories.length).toBeGreaterThanOrEqual(2);

      // 5. Verify pipeline metrics were collected
      const metricsResponse = await request(app)
        .get('/api/v2/pipelines/metrics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(metricsResponse.body.totalRuns).toBeGreaterThan(0);
    });

    it('should handle orchestration failure gracefully', async () => {
      // Mock GitHub API to fail
      githubMock.rateLimitRemaining = 0;

      const orchestrationResponse = await request(app)
        .post('/api/v2/orchestration/execute/full-gitops-audit')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          repositories: ['test-repo-1'],
          profile: 'quick'
        })
        .expect(200);

      const orchestrationId = orchestrationResponse.body.orchestrationId;

      // Monitor for failure
      let failed = false;
      let attempts = 0;
      
      while (!failed && attempts < 10) {
        const statusResponse = await request(app)
          .get(`/api/v2/orchestration/status/${orchestrationId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        if (statusResponse.body.status === 'failed') {
          failed = true;
          expect(statusResponse.body.error).toContain('rate limit');
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }

      expect(failed).toBe(true);
    });
  });

  describe('Pipeline Triggering and Monitoring Flow', () => {
    it('should trigger pipeline and monitor completion', async () => {
      // 1. Subscribe to pipeline updates
      socketClient.emit('subscribe', { 
        type: 'pipeline', 
        repository: 'test-repo-1' 
      });

      const pipelineUpdates = [];
      socketClient.on('pipeline:status', (data) => {
        if (data.repository === 'test-repo-1') {
          pipelineUpdates.push(data);
        }
      });

      // 2. Trigger pipeline
      const triggerResponse = await request(app)
        .post('/api/v2/pipelines/trigger')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          repository: 'test-repo-1',
          workflow: 'ci.yml',
          branch: 'main'
        })
        .expect(200);

      const runId = triggerResponse.body.runId;
      expect(runId).toBeDefined();

      // 3. Wait for pipeline completion
      let completed = false;
      let attempts = 0;
      
      while (!completed && attempts < 15) {
        const statusResponse = await request(app)
          .get(`/api/v2/pipelines/status?repository=test-repo-1`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        const pipeline = statusResponse.body.pipelines.find(p => p.id.toString() === runId.toString());
        if (pipeline && ['success', 'failed'].includes(pipeline.status)) {
          completed = true;
          expect(pipeline.status).toBe('success');
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }

      expect(completed).toBe(true);
      expect(pipelineUpdates.length).toBeGreaterThan(0);

      // 4. Verify metrics were updated
      const metricsResponse = await request(app)
        .get('/api/v2/pipelines/metrics?repository=test-repo-1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(metricsResponse.body.totalRuns).toBeGreaterThan(0);
    });
  });

  describe('Compliance Check and Remediation Flow', () => {
    it('should check compliance and apply remediation', async () => {
      // 1. Initial compliance check
      const checkResponse = await request(app)
        .post('/api/v2/compliance/check')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          repository: 'test-repo-1',
          templates: ['standard-devops', 'security-hardening']
        })
        .expect(200);

      const initialScore = checkResponse.body.compliance.score;
      expect(typeof initialScore).toBe('number');

      // 2. Apply templates if not compliant
      if (checkResponse.body.compliance.status !== 'compliant') {
        const applyResponse = await request(app)
          .post('/api/v2/compliance/apply')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            repository: 'test-repo-1',
            templates: ['standard-devops'],
            createPR: true
          })
          .expect(200);

        expect(applyResponse.body.success).toBe(true);
        expect(applyResponse.body.prUrl).toBeDefined();

        // 3. Re-check compliance after applying templates
        await new Promise(resolve => setTimeout(resolve, 1000));

        const recheckResponse = await request(app)
          .post('/api/v2/compliance/check')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            repository: 'test-repo-1',
            templates: ['standard-devops']
          })
          .expect(200);

        const newScore = recheckResponse.body.compliance.score;
        expect(newScore).toBeGreaterThanOrEqual(initialScore);
      }

      // 4. Verify compliance history was recorded
      const historyResponse = await request(app)
        .get('/api/v2/compliance/history?repository=test-repo-1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(historyResponse.body.history.length).toBeGreaterThan(0);
    });
  });

  describe('Real-time Dashboard Updates Flow', () => {
    it('should provide real-time dashboard updates', async () => {
      const dashboardUpdates = {
        pipelines: [],
        compliance: [],
        metrics: []
      };

      // Subscribe to all update types
      socketClient.on('pipeline:status', (data) => {
        dashboardUpdates.pipelines.push(data);
      });

      socketClient.on('compliance:updated', (data) => {
        dashboardUpdates.compliance.push(data);
      });

      socketClient.on('metrics:updated', (data) => {
        dashboardUpdates.metrics.push(data);
      });

      // 1. Trigger multiple pipelines
      const triggerPromises = ['test-repo-1', 'test-repo-2'].map(repo =>
        request(app)
          .post('/api/v2/pipelines/trigger')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            repository: repo,
            workflow: 'ci.yml'
          })
      );

      await Promise.all(triggerPromises);

      // 2. Trigger compliance checks
      const compliancePromises = ['test-repo-1', 'test-repo-2'].map(repo =>
        request(app)
          .post('/api/v2/compliance/check')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            repository: repo,
            templates: ['standard-devops']
          })
      );

      await Promise.all(compliancePromises);

      // 3. Wait for updates
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 4. Verify dashboard received updates
      expect(dashboardUpdates.pipelines.length).toBeGreaterThan(0);
      expect(dashboardUpdates.compliance.length).toBeGreaterThan(0);

      // 5. Verify dashboard data consistency
      const dashboardResponse = await request(app)
        .get('/api/v2/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(dashboardResponse.body).toHaveProperty('pipelines');
      expect(dashboardResponse.body).toHaveProperty('compliance');
      expect(dashboardResponse.body).toHaveProperty('metrics');
    });
  });

  describe('Error Recovery and Resilience Flow', () => {
    it('should handle partial failures in orchestration', async () => {
      // Setup one repository to fail
      const repositories = ['test-repo-1', 'failing-repo'];
      
      const orchestrationResponse = await request(app)
        .post('/api/v2/orchestration/execute/full-gitops-audit')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          repositories,
          profile: 'comprehensive',
          options: {
            continueOnFailure: true
          }
        })
        .expect(200);

      const orchestrationId = orchestrationResponse.body.orchestrationId;

      // Wait for completion
      let completed = false;
      let attempts = 0;
      
      while (!completed && attempts < 20) {
        const statusResponse = await request(app)
          .get(`/api/v2/orchestration/status/${orchestrationId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        if (['completed', 'partial_failure'].includes(statusResponse.body.status)) {
          completed = true;
          
          // Should have some successful results despite failures
          expect(statusResponse.body.results).toBeDefined();
          expect(statusResponse.body.results.successful.length).toBeGreaterThan(0);
          expect(statusResponse.body.results.failed.length).toBeGreaterThan(0);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }

      expect(completed).toBe(true);
    });

    it('should retry failed operations', async () => {
      // Mock intermittent GitHub API failure
      let callCount = 0;
      const originalRateLimitRemaining = githubMock.rateLimitRemaining;
      
      githubMock.checkRateLimit = function() {
        callCount++;
        if (callCount <= 2) {
          // Fail first two calls
          this.rateLimitRemaining = 0;
          const error = new Error('API rate limit exceeded');
          error.status = 403;
          throw error;
        } else {
          // Succeed on third call
          this.rateLimitRemaining = originalRateLimitRemaining;
        }
      };

      const triggerResponse = await request(app)
        .post('/api/v2/pipelines/trigger')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          repository: 'test-repo-1',
          workflow: 'ci.yml',
          retryAttempts: 3
        });

      // Should eventually succeed after retries
      expect([200, 202]).toContain(triggerResponse.status);
      expect(callCount).toBeGreaterThan(2);
    });
  });

  describe('Multi-user Collaboration Flow', () => {
    it('should handle concurrent operations from multiple users', async () => {
      const viewerToken = TestHelpers.generateViewerToken();
      
      // Create viewer client
      const viewerClient = new Client(`http://localhost:${serverPort}`, {
        auth: { token: viewerToken }
      });
      
      await new Promise(resolve => viewerClient.on('connect', resolve));

      const adminUpdates = [];
      const viewerUpdates = [];

      socketClient.on('pipeline:status', (data) => {
        adminUpdates.push(data);
      });

      viewerClient.on('pipeline:status', (data) => {
        viewerUpdates.push(data);
      });

      // Admin triggers pipeline
      const triggerResponse = await request(app)
        .post('/api/v2/pipelines/trigger')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          repository: 'test-repo-1',
          workflow: 'ci.yml'
        })
        .expect(200);

      // Viewer monitors status
      const viewerStatusResponse = await request(app)
        .get('/api/v2/pipelines/status')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);

      // Wait for updates
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Both users should receive updates
      expect(adminUpdates.length).toBeGreaterThan(0);
      expect(viewerUpdates.length).toBeGreaterThan(0);
      expect(viewerStatusResponse.body.pipelines).toBeDefined();

      viewerClient.disconnect();
    });
  });

  // NOTE: original setupTestRepositories() + setupWebSocketHandlers() helpers
  // were removed in PR C — the former seeded DB tables production code never
  // reads from; the latter is inlined into beforeAll to keep the WS server
  // handlers attached for the duration of the suite.
});