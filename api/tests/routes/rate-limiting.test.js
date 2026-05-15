// Vikunja #669: CodeQL "Missing rate limiting" on auth-gated routes.
// Vikunja #699: de-nest /audit/* routes from catch/callback blocks; every
// handler is now registered at module scope and reachable at app boot.

const { createApp } = require('../../createApp');
const { createFakeConfig, createFakeGithubMCP } = require('../fakes');

function isRateLimitMiddleware(fn) {
  // express-rate-limit v6+ attaches `resetKey` to its middleware function.
  return typeof fn === 'function' && typeof fn.resetKey === 'function';
}

function walkLayers(stack, method, routePath, out) {
  for (const layer of stack) {
    if (layer.route && layer.route.path === routePath) {
      const verbs = layer.route.methods || {};
      if (verbs[method]) {
        for (const sub of layer.route.stack || []) {
          out.push(sub.handle);
        }
      }
    }
    if (layer.name === 'router' && layer.handle && layer.handle.stack) {
      walkLayers(layer.handle.stack, method, routePath, out);
    }
  }
}

function getRouteHandlers(app, method, routePath) {
  const stack = (app._router && app._router.stack) || [];
  const out = [];
  walkLayers(stack, method.toLowerCase(), routePath, out);
  return out;
}

describe('Rate limiting on auth-gated routes (#669)', () => {
  let app;

  beforeEach(() => {
    app = createApp({
      config: createFakeConfig({}),
      githubMCP: createFakeGithubMCP(),
    });
  });

  describe('createApp /audit/* routes (runtime-reachable)', () => {
    // After #699 de-nesting, every /audit/* handler is registered at module
    // scope and reachable at app boot — no longer split between happy-path
    // and conditional-callback registrations.
    const ROUTES = [
      { method: 'get',  path: '/audit' },
      { method: 'get',  path: '/audit/history' },
      { method: 'get',  path: '/audit/export/csv' },
      { method: 'post', path: '/audit/email-summary' },
      { method: 'post', path: '/audit/clone' },
      { method: 'post', path: '/audit/delete' },
      { method: 'post', path: '/audit/commit' },
      { method: 'post', path: '/audit/fix-remote' },
      { method: 'post', path: '/audit/run-comprehensive' },
      { method: 'get',  path: '/audit/mismatch/:repo' },
      { method: 'post', path: '/audit/batch' },
      { method: 'post', path: '/audit/discard' },
      { method: 'get',  path: '/audit/diff/:repo' },
    ];

    test.each(ROUTES)('$method $path carries rate-limit middleware', ({ method, path }) => {
      const handlers = getRouteHandlers(app, method, path);
      expect(handlers.length).toBeGreaterThan(0);
      expect(handlers.some(isRateLimitMiddleware)).toBe(true);
    });
  });

  describe('phase2 /compliance/check', () => {
    it('POST /api/v2/compliance/check carries rate-limit middleware', () => {
      const handlers = getRouteHandlers(app, 'post', '/compliance/check');
      expect(handlers.length).toBeGreaterThan(0);
      expect(handlers.some(isRateLimitMiddleware)).toBe(true);
    });
  });

  // Vikunja #1309: /health must NOT carry rate-limit middleware. Traefik
  // probes this endpoint every 30s from multiple upstreams; if it were
  // rate-limited, the resulting 429s would cascade Traefik into marking the
  // backend unhealthy and returning 503 to real users.
  describe('/health (liveness probe for upstream proxies)', () => {
    it('GET /health exists and is NOT rate-limited', () => {
      const handlers = getRouteHandlers(app, 'get', '/health');
      expect(handlers.length).toBeGreaterThan(0);
      expect(handlers.some(isRateLimitMiddleware)).toBe(false);
    });
  });

});
