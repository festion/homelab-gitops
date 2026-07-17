/**
 * Shared rate-limiting middleware (js/missing-rate-limiting, Vikunja #2162).
 *
 * express-rate-limit is already a dependency. These limiters are applied at the
 * top of each router so every route handler sits behind a rate limiter, which
 * both mitigates abuse/DoS and is what CodeQL recognizes as a fix.
 *
 * Limits are deliberately generous so normal dashboard auto-refresh and health
 * polling are unaffected; auth endpoints get a stricter limiter for brute-force
 * resistance. Limiting is skipped in the test env and for loopback so it does
 * not perturb the integration suite or local development.
 */
const rateLimit = require('express-rate-limit');

const LOOPBACK = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);

function defaultSkip(req) {
  if (process.env.NODE_ENV === 'test') return true;
  return LOOPBACK.has(req.ip);
}

const RATE_LIMIT_MESSAGE = {
  status: 'error',
  error: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests, please try again later.',
  },
};

/**
 * Build an express-rate-limit middleware with project defaults.
 * @param {object} [options] overrides passed through to express-rate-limit
 */
function createRateLimiter(options = {}) {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 1000, // generous per-IP ceiling for general API use
    standardHeaders: true,
    legacyHeaders: false,
    skip: defaultSkip,
    message: RATE_LIMIT_MESSAGE,
    ...options,
  });
}

// General API limiter — protects all mounted routers from request floods.
const apiLimiter = createRateLimiter();

// Stricter limiter for authentication endpoints (login/token/refresh) to blunt
// credential brute-forcing while staying well above legitimate usage.
const authLimiter = createRateLimiter({ limit: 100 });

module.exports = { createRateLimiter, apiLimiter, authLimiter };
