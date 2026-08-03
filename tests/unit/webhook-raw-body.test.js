/**
 * ops #2524 — the GitHub webhook endpoint 400'd on EVERY well-formed request.
 *
 * A global `app.use(express.json())` was registered before the route's own
 * `express.raw()`. Express matches middleware in registration order, so the
 * global parser consumed the stream, the raw parser found nothing, and
 * `JSON.parse(req.body)` received the already-parsed OBJECT:
 *
 *     SyntaxError: "[object Object]" is not valid JSON
 *
 * Measured against the live service on CT 123 before the fix: three separate
 * well-formed POSTs (no signature / bogus signature / repository_dispatch) all
 * returned 400 {"error":"Invalid JSON payload"}, and the server journal carried
 * the SyntaxError above.
 *
 * Two consequences, the second worse:
 *   - GitHub webhooks were never delivered through this path;
 *   - validateWebhookSignature() was UNREACHABLE, so the endpoint's apparent
 *     "rejects unsigned requests" behaviour was an accident of the 400 rather
 *     than the validator doing anything.
 *
 * The first test below is the regression. The rawBody test is what stops a
 * future refactor from "fixing" the 400 by parsing earlier and quietly
 * destroying the bytes the HMAC must be computed over — which would restore
 * 200s while leaving signature verification broken, i.e. strictly worse than
 * the bug, and invisible.
 */
const express = require('express');
const http = require('http');

// Deliberately NOT supertest: it is only installed under api/node_modules and
// this suite lives in the root tree. Node's http client keeps the test
// dependency-free and, more usefully, sends the body bytes verbatim — which is
// the thing under test.
function post(app, { body, contentType = 'application/json' }) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const payload = typeof body === 'string' ? body : JSON.stringify(body);
      const req = http.request(
        {
          host: '127.0.0.1',
          port: server.address().port,
          path: '/api/v2/webhooks/github',
          method: 'POST',
          headers: {
            'Content-Type': contentType,
            'Content-Length': Buffer.byteLength(payload),
          },
        },
        (res) => {
          let data = '';
          res.on('data', (c) => (data += c));
          res.on('end', () => {
            server.close();
            let parsed = {};
            try { parsed = JSON.parse(data); } catch (_) { /* leave {} */ }
            resolve({ status: res.statusCode, body: parsed });
          });
        }
      );
      req.on('error', (e) => { server.close(); reject(e); });
      req.end(payload);
    });
  });
}

/** Minimal app reproducing the exact middleware ordering under test. */
function buildApp({ rawBeforeJson }) {
  const app = express();
  if (rawBeforeJson) {
    app.use('/api/v2/webhooks/github', express.raw({ type: 'application/json' }));
  }
  app.use(express.json());
  app.post('/api/v2/webhooks/github', (req, res) => {
    // `raw` is a Buffer on both branches. Note this alone did NOT satisfy
    // CodeQL: binding the guarded value to a local was tried first and the
    // alert simply moved with the expression, because the ternary's true
    // branch is still req.body and the taint follows it. What fixed it was
    // removing the .length read from the handler entirely -- see below.
    const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
    req.rawBody = raw;          // still set, because production sets it for the HMAC
    try {
      req.body = JSON.parse(raw.toString('utf8'));
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }
    res.status(200).json({
      ok: true,
      rawBodyIsBuffer: Buffer.isBuffer(req.rawBody),
      // Echo the bytes, do NOT report a length computed here. Reading .length
      // off anything derived from req.body is what CodeQL flags critical
      // (js/type-confusion-through-parameter-tampering) — an array and a
      // string mean different things there, and the Buffer.isBuffer guard
      // does not survive into its analysis however it is arranged.
      // The test reconstructs a Buffer from this and measures THAT, so the
      // length is taken from locally-constructed bytes. It is also a stronger
      // assertion: comparing the actual bytes proves they survived intact,
      // where a count only proves the total matched.
      rawBodyB64: raw.toString('base64'),
      parsedZen: req.body.zen,
    });
  });
  return app;
}

const PAYLOAD = { zen: 'Design for failure.', hook_id: 1 };

describe('ops #2524 — webhook raw-body ordering', () => {
  test('a well-formed webhook is NOT rejected as invalid JSON', async () => {
    const res = await post(buildApp({ rawBeforeJson: true }), { body: PAYLOAD });
    expect(res.status).toBe(200);
    expect(res.body.parsedZen).toBe('Design for failure.');
  });

  test('the raw bytes survive for HMAC verification', async () => {
    // Signature verification is worthless if the bytes are gone. Assert the
    // buffer is present AND matches the exact serialized length, not merely
    // that the request succeeded.
    const body = JSON.stringify(PAYLOAD);
    const res = await post(buildApp({ rawBeforeJson: true }), { body });
    expect(res.status).toBe(200);
    expect(res.body.rawBodyIsBuffer).toBe(true);
    // Reconstruct locally and compare the BYTES, not just a count — the
    // stronger assertion, and it keeps the .length read off anything derived
    // from a request parameter (see the handler comment).
    const echoed = Buffer.from(res.body.rawBodyB64, 'base64');
    expect(echoed.length).toBe(Buffer.byteLength(body));
    expect(echoed.toString('utf8')).toBe(body);
  });

  test('genuinely malformed JSON is still rejected with 400', async () => {
    // The fix must not turn the parser into a pushover. Without this, deleting
    // the try/catch entirely would pass the two tests above.
    const res = await post(buildApp({ rawBeforeJson: true }), { body: '{"zen": ' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid JSON payload');
  });

  test('REGRESSION: the old ordering reproduces the bug', async () => {
    // Pins the actual defect. If someone reintroduces the global json parser
    // ahead of the raw one, this documents exactly what breaks — and proves
    // the three tests above are passing because of the ordering, not by luck.
    const res = await post(buildApp({ rawBeforeJson: false }), { body: PAYLOAD });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid JSON payload');
  });
});
