// Vikunja #669: CodeQL "Missing rate limiting" on auth-gated routes.
// This suite asserts that sensitive /audit/* handlers and /compliance/check
// carry an express-rate-limit middleware in their Express route stack.
//
// Two classes of routes can't be verified at app-boot time:
//   1. Routes registered inside the /audit/history catch block (orphan bug,
//      Vikunja #699): /audit/export/csv, /audit/email-summary.
//   2. Routes registered inside the /audit/commit success callback (nested
//      re-registration, called out in the source comment): /audit/fix-remote,
//      /audit/run-comprehensive, /audit/mismatch/:repo, /audit/batch.
// For those, a source-level assertion confirms each `app.METHOD(...)` call
// passes `auditRateLimit` as the first middleware — equivalent to what
// CodeQL's static analysis sees.

const fs = require('fs');
const path = require('path');
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
    const ROUTES = [
      { method: 'get',  path: '/audit' },
      { method: 'get',  path: '/audit/history' },
      { method: 'post', path: '/audit/clone' },
      { method: 'post', path: '/audit/delete' },
      { method: 'post', path: '/audit/commit' },
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

  // Source-level check: routes registered conditionally (inside catch/success
  // callbacks) aren't reachable at app boot. These regexes mirror what CodeQL
  // sees statically — that `auditRateLimit` is the first middleware argument.
  describe('createApp source-level rate-limit wiring (conditional routes)', () => {
    const SRC = fs.readFileSync(
      path.join(__dirname, '..', '..', 'createApp.js'),
      'utf8'
    );

    const CONDITIONAL_ROUTES = [
      { method: 'get',  path: '/audit/export/csv' },         // orphan-catch (#699)
      { method: 'post', path: '/audit/email-summary' },      // orphan-catch (#699)
      { method: 'post', path: '/audit/fix-remote' },         // nested in /audit/commit
      { method: 'post', path: '/audit/run-comprehensive' },  // nested in /audit/commit
      { method: 'get',  path: '/audit/mismatch/:repo' },     // nested in /audit/commit
      { method: 'post', path: '/audit/batch' },              // nested in /audit/commit
    ];

    test.each(CONDITIONAL_ROUTES)(
      '$method $path source includes auditRateLimit middleware',
      ({ method, path }) => {
        const escaped = path.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        const pattern = new RegExp(
          `app\\.${method}\\(\\s*['"\`]${escaped}['"\`]\\s*,\\s*auditRateLimit\\s*,`
        );
        expect(SRC).toMatch(pattern);
      }
    );
  });
});
