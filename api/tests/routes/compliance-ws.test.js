// Tests for Vikunja #624 / #667 / B4: compliance WS events rename.
// `compliance.checked` on the WS wire becomes `compliance:updated`. Other
// compliance lifecycle events keep their names (wire format: `compliance:job-started`,
// `compliance:job-completed`, `compliance:application-completed`).

const request = require('supertest');
const { createApp } = require('../../createApp');
const {
  createFakeConfig,
  createFakeGithubMCP,
  createFakeTemplateEngine,
} = require('../fakes');
const ComplianceService = require('../../services/compliance/complianceService');

describe('Compliance WebSocket event names (Decision 5)', () => {
  let app;
  let complianceService;
  let phase2WS;
  let authService;
  const adminToken = 'admin-token';

  beforeEach(() => {
    const adminUser = {
      id: 'test-admin',
      username: 'admin',
      role: 'admin',
      permissions: ['admin', 'templates:apply'],
      toJSON() { return { id: this.id, username: this.username, role: this.role }; },
    };

    authService = {
      verifyToken: jest.fn(async (token) => {
        if (token === adminToken) {
          return { user: adminUser, decoded: { userId: adminUser.id, role: 'admin' } };
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

    // Fake phase2WS captures every emit() call so we can assert on channel+event.
    const calls = [];
    phase2WS = {
      calls,
      emit: jest.fn((channel, event, data) => calls.push({ channel, event, data })),
    };

    complianceService = new ComplianceService({
      config: createFakeConfig({ MONITORED_REPOSITORIES: ['repo-alpha'] }),
      templateEngine: createFakeTemplateEngine({
        templates: [{
          id: 'standard-devops',
          name: 'Standard DevOps',
          version: '1.0.0',
          description: 'baseline',
          type: 'devops',
          tags: [],
          requirements: {},
          files: [],
          directories: [],
          compliance: {},
          metadata: { version: '1.0.0', createdAt: '2026-01-01', updatedAt: '2026-04-01' },
          toJSON() { return { ...this }; },
        }],
      }),
      githubMCP: createFakeGithubMCP(),
      enabledTemplates: ['standard-devops'],
    });

    app = createApp({
      authService,
      complianceService,
      githubMCP: createFakeGithubMCP(),
      config: createFakeConfig({ MONITORED_REPOSITORIES: ['repo-alpha'] }),
      phase2WS,
    });
  });

  it('emits WS event with `updated` (not `compliance.checked`) when a repo check finishes', () => {
    // Trigger the service's internal EventEmitter directly — this is what
    // processComplianceJob fires after each per-repo check.
    complianceService.emit('compliance:checked', {
      repository: 'repo-alpha',
      compliant: true,
      score: 95,
      issueCount: 0,
    });

    const match = phase2WS.calls.find(
      (c) => c.channel === 'compliance' && c.event === 'updated',
    );
    expect(match).toBeDefined();
    expect(match.data).toMatchObject({ repository: 'repo-alpha', score: 95 });

    const oldName = phase2WS.calls.find((c) => c.event === 'compliance.checked');
    expect(oldName).toBeUndefined();
  });

  it('emits `job-started` (not `compliance.job-started`) when a check job is accepted', () => {
    complianceService.emit('compliance:job-started', {
      jobId: 'check_123',
      job: { id: 'check_123', repositories: ['repo-alpha'], templates: ['standard-devops'] },
    });

    const match = phase2WS.calls.find(
      (c) => c.channel === 'compliance' && c.event === 'job-started',
    );
    expect(match).toBeDefined();
    expect(match.data.jobId).toBe('check_123');

    const oldName = phase2WS.calls.find((c) => c.event === 'compliance.job-started');
    expect(oldName).toBeUndefined();
  });

  it('emits `job-completed` (not `compliance.job-completed`)', () => {
    complianceService.emit('compliance:job-completed', {
      jobId: 'check_123',
      job: { id: 'check_123', status: 'completed' },
    });

    const match = phase2WS.calls.find(
      (c) => c.channel === 'compliance' && c.event === 'job-completed',
    );
    expect(match).toBeDefined();

    const oldName = phase2WS.calls.find((c) => c.event === 'compliance.job-completed');
    expect(oldName).toBeUndefined();
  });

  it('emits `application-completed` (not `compliance.application-completed`)', () => {
    complianceService.emit('compliance:application-completed', {
      repository: 'repo-alpha',
      template: 'standard-devops',
      result: { success: true },
    });

    const match = phase2WS.calls.find(
      (c) => c.channel === 'compliance' && c.event === 'application-completed',
    );
    expect(match).toBeDefined();

    const oldName = phase2WS.calls.find((c) => c.event === 'compliance.application-completed');
    expect(oldName).toBeUndefined();
  });
});
