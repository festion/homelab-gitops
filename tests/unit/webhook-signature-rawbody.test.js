/**
 * ops #2524 follow-up — the HMAC must be computed over the RAW bytes.
 *
 * createApp.js preserves the exact bytes GitHub signed on `req.rawBody`, and
 * its comment says they exist "for signature verification". They were not
 * used: WebhookHandler.middleware() computed the HMAC over
 * `JSON.stringify(req.body)` instead, i.e. over a RE-SERIALISED copy.
 *
 * That is only equal to the original by luck. JSON.parse -> JSON.stringify is
 * lossy for anything where more than one byte sequence denotes the same value:
 * \uXXXX escapes, non-ASCII, "1e3" vs 1000, whitespace, key order. GitHub
 * signs the bytes on the wire, so whenever the round-trip is not byte-exact
 * the HMAC differs and a legitimate delivery is rejected 401.
 *
 * The escaped-unicode case below is not exotic — GitHub emits \uXXXX escapes
 * in commit messages, issue titles and author names routinely.
 */

const crypto = require('crypto');

// @octokit/webhooks ships ESM only and the root jest config cannot transform
// it, so requiring the real one fails to even load this suite. It takes no
// part in signature verification -- WebhookHandler.verifySignature() uses
// node crypto directly -- and middleware() only calls `.receive()` on it, so
// stubbing it leaves the code under test intact.
jest.mock('@octokit/webhooks', () => ({
  Webhooks: class {
    constructor() { this.receive = jest.fn().mockResolvedValue(undefined); }
    on() {}
    onAny() {}
    onError() {}
  },
}), { virtual: true });

const WebhookHandler = require('../../api/services/webhook-handler');

const SECRET = 'test-webhook-secret';

function sign(buf) {
  return `sha256=${crypto.createHmac('sha256', SECRET).update(buf).digest('hex')}`;
}

/** Drive middleware() the way createApp + server.js compose it in production. */
function invoke(handler, { rawBody, signature }) {
  const headers = {
    'x-hub-signature-256': signature,
    'x-github-event': 'push',
    'x-github-delivery': 'deadbeef',
  };
  const req = {
    // createApp.js sets BOTH of these before the handler runs.
    rawBody,
    body: JSON.parse(rawBody.toString('utf8')),
    get: (h) => headers[h.toLowerCase()],
  };
  // Default 0, not 200: a handler that never calls res.status() must not read
  // as a success.
  let statusCode = 0;
  let payload = null;
  const res = {
    status(c) { statusCode = c; return this; },
    json(b) { payload = b; return this; },
  };
  return Promise.resolve(handler.middleware()(req, res, () => {}))
    .then(() => ({ statusCode, payload }));
}

describe('ops #2524 follow-up — webhook HMAC uses the raw bytes', () => {
  let handler;

  beforeEach(() => {
    handler = new WebhookHandler({ secret: SECRET });
    // The queue would otherwise retain events and keep timers alive.
    jest.spyOn(handler.webhooks, 'receive').mockResolvedValue(undefined);
  });

  afterEach(() => {
    if (handler?.eventQueue?.pause) handler.eventQueue.pause();
    jest.restoreAllMocks();
  });

  test('a payload whose re-serialisation differs byte-wise still verifies', async () => {
    // é survives JSON.parse as "é". JSON.stringify emits the literal
    // character, so the re-serialised bytes differ from what was signed.
    const raw = Buffer.from('{"zen":"caf\\u00e9","hook_id":1}', 'utf8');
    const restringified = Buffer.from(JSON.stringify(JSON.parse(raw.toString('utf8'))), 'utf8');

    // Guard: if these ever became byte-equal the test would prove nothing.
    expect(restringified.equals(raw)).toBe(false);

    const { statusCode, payload } = await invoke(handler, {
      rawBody: raw,
      signature: sign(raw),
    });

    // Assert the SUCCESS payload, not merely "not 401" -- a 500 from the
    // catch-all would satisfy a negative assertion and look like a pass.
    expect(statusCode).toBe(200);
    expect(payload).toEqual({ status: 'ok', event: 'push', delivery: 'deadbeef' });
  });

  test('a byte-identical payload still verifies (no regression)', async () => {
    const raw = Buffer.from('{"zen":"Design for failure.","hook_id":1}', 'utf8');
    const { statusCode, payload } = await invoke(handler, { rawBody: raw, signature: sign(raw) });
    expect(statusCode).toBe(200);
    expect(payload).toEqual({ status: 'ok', event: 'push', delivery: 'deadbeef' });
  });

  test('a MISSING signature is rejected 401, not 500', async () => {
    // Buffer.from(undefined) throws inside timingSafeEqual, which the
    // catch-all turned into a 500. A 500 reads as "server broke", not
    // "you are not authorised", and ops #2524 acceptance item 3 wants a 401.
    const raw = Buffer.from('{"zen":"Design for failure.","hook_id":1}', 'utf8');
    const { statusCode, payload } = await invoke(handler, { rawBody: raw, signature: undefined });
    expect(statusCode).toBe(401);
    expect(payload).toEqual({ error: 'Invalid signature' });
  });

  test('a genuinely wrong signature is still rejected 401', async () => {
    const raw = Buffer.from('{"zen":"Design for failure.","hook_id":1}', 'utf8');
    const { statusCode, payload } = await invoke(handler, {
      rawBody: raw,
      signature: sign(Buffer.from('{"zen":"tampered"}', 'utf8')),
    });
    expect(statusCode).toBe(401);
    expect(payload).toEqual({ error: 'Invalid signature' });
  });

  test('falls back to the parsed body when rawBody is absent', async () => {
    // Not every mount point guarantees the createApp pre-middleware ran.
    const body = { zen: 'Design for failure.', hook_id: 1 };
    const asSent = Buffer.from(JSON.stringify(body), 'utf8');
    const headers = {
      'x-hub-signature-256': sign(asSent),
      'x-github-event': 'push',
      'x-github-delivery': 'deadbeef',
    };
    const req = { body, get: (h) => headers[h.toLowerCase()] };
    let statusCode = 0;
    let payload = null;
    const res = {
      status(c) { statusCode = c; return this; },
      json(b) { payload = b; return this; },
    };
    await handler.middleware()(req, res, () => {});
    expect(statusCode).toBe(200);
    expect(payload).toEqual({ status: 'ok', event: 'push', delivery: 'deadbeef' });
  });
});

/**
 * Measured on CT 123 immediately after ops #2524 deployed, 2026-08-04:
 * GITHUB_WEBHOOK_SECRET is absent from the running process, so an
 * unsigned POST to /api/v2/webhooks/github returned 200 {"status":"ok"}
 * and the event was accepted for processing.
 *
 * Root cause: verifySignature() returned TRUE when no secret was set, and
 * the caller's `this.secret && !verifySignature(...)` short-circuited, so
 * the 401 branch was unreachable. A missing secret is a misconfiguration,
 * and the safe response to "I cannot verify this" is to refuse it.
 */
describe('ops #2524 follow-up — no secret configured must FAIL CLOSED', () => {
  let handler;

  beforeEach(() => {
    delete process.env.GITHUB_WEBHOOK_SECRET;
    handler = new WebhookHandler({});          // no secret, as on CT 123
    jest.spyOn(handler.webhooks, 'receive').mockResolvedValue(undefined);
  });

  afterEach(() => {
    if (handler?.eventQueue?.pause) handler.eventQueue.pause();
    jest.restoreAllMocks();
  });

  test('an UNSIGNED request is refused, not accepted', async () => {
    const raw = Buffer.from('{"zen":"Design for failure."}', 'utf8');
    const { statusCode, payload } = await invoke(handler, { rawBody: raw, signature: undefined });
    expect(statusCode).toBe(401);
    expect(payload).not.toEqual({ status: 'ok', event: 'push', delivery: 'deadbeef' });
  });

  test('a request with ANY signature is refused when no secret is configured', async () => {
    // Nothing can be verified against a secret that does not exist, so a
    // well-formed-looking signature must not buy anything either.
    const raw = Buffer.from('{"zen":"Design for failure."}', 'utf8');
    const { statusCode } = await invoke(handler, {
      rawBody: raw,
      signature: `sha256=${'0'.repeat(64)}`,
    });
    expect(statusCode).toBe(401);
  });

  test('the webhook is never handed to the processor without a secret', async () => {
    const raw = Buffer.from('{"zen":"Design for failure."}', 'utf8');
    await invoke(handler, { rawBody: raw, signature: undefined });
    // The status code alone would not prove the event was not enqueued.
    expect(handler.webhooks.receive).not.toHaveBeenCalled();
  });
});
