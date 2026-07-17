/**
 * Tests for the shared rate-limiting middleware (js/missing-rate-limiting, Vikunja #2162).
 *
 * Exercises real 429 behavior via supertest, and verifies the default skip
 * (test env + localhost) so applying these limiters to the routers does not
 * break the existing integration suite.
 */
const express = require('express');
const request = require('supertest');
const {
  createRateLimiter,
  apiLimiter,
  authLimiter,
} = require('../../middleware/rateLimit');

function appWith(limiter) {
  const app = express();
  app.set('trust proxy', false);
  app.use(limiter);
  app.get('/', (req, res) => res.json({ ok: true }));
  return app;
}

describe('createRateLimiter', () => {
  test('returns 429 once the configured limit is exceeded', async () => {
    // Force skip off so the limiter is active under NODE_ENV=test.
    const app = appWith(createRateLimiter({ windowMs: 60000, limit: 2, skip: () => false }));
    await request(app).get('/').expect(200);
    await request(app).get('/').expect(200);
    const res = await request(app).get('/');
    expect(res.status).toBe(429);
  });

  test('emits standard RateLimit headers', async () => {
    const app = appWith(createRateLimiter({ windowMs: 60000, limit: 5, skip: () => false }));
    const res = await request(app).get('/');
    expect(res.headers).toHaveProperty('ratelimit-limit');
  });

  test('default skip disables limiting under NODE_ENV=test (protects the suite)', async () => {
    // jest sets NODE_ENV=test → default skip returns true → never 429.
    const app = appWith(createRateLimiter({ windowMs: 60000, limit: 1 }));
    await request(app).get('/').expect(200);
    await request(app).get('/').expect(200);
    await request(app).get('/').expect(200);
  });
});

describe('presets', () => {
  test('apiLimiter and authLimiter are express middleware', () => {
    expect(typeof apiLimiter).toBe('function');
    expect(apiLimiter.length).toBeGreaterThanOrEqual(3); // (req, res, next)
    expect(typeof authLimiter).toBe('function');
  });
});
