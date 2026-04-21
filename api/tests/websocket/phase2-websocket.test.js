// Unit test for phase2-websocket wire format.
// Decision 5 (Vikunja #624 / #667): wire event type is `{channel}:{event}`,
// e.g. `compliance:updated`, not the old `phase2.event` bucket type.

const Phase2WebSocketExtension = require('../../phase2-websocket');

describe('Phase2WebSocketExtension.emit — wire format', () => {
  let sent;
  let ext;

  beforeEach(() => {
    sent = [];

    // Minimal wsManager stub. Phase2WebSocketExtension wraps a few methods on
    // the manager, but none of those are needed for emit() itself.
    const wsManager = {
      app: { _router: { stack: [] }, ws() {} },
      clients: new Set(),
      setupWebSocket() {},
      handleClientMessage() {},
    };

    ext = new Phase2WebSocketExtension(wsManager);

    // Stub the client lookup: return a fake open ws that captures messages.
    const fakeWs = {
      readyState: 1, // WebSocket.OPEN
      send: (msg) => sent.push(JSON.parse(msg)),
    };
    ext.findClientWebSocket = () => fakeWs;

    // Inject a subscriber on every channel we exercise.
    ['compliance', 'pipelines', 'orchestration', 'metrics'].forEach((name) => {
      const ch = ext.channels.get(name);
      if (ch) ch.subscribers.add('fake-client-id');
    });
  });

  it('emits compliance:updated with wire type `compliance:updated`', () => {
    // Pre-register the canonical event for the scope of this test. B4 moves
    // this registration into the default channel definition.
    ext.channels.get('compliance').events.push('updated');

    ext.emit('compliance', 'updated', { repository: 'repo-alpha', score: 95 });

    expect(sent).toHaveLength(1);
    expect(sent[0].type).toBe('compliance:updated');
    expect(sent[0].data).toMatchObject({ repository: 'repo-alpha', score: 95 });
  });

  it('emits pipeline.triggered with wire type `pipelines:pipeline.triggered`', () => {
    ext.emit('pipelines', 'pipeline.triggered', { runId: 999 });

    expect(sent).toHaveLength(1);
    expect(sent[0].type).toBe('pipelines:pipeline.triggered');
    expect(sent[0].data).toMatchObject({ runId: 999 });
  });

  it('still carries channel + event as discrete fields for debuggability', () => {
    ext.channels.get('compliance').events.push('job-started');
    ext.emit('compliance', 'job-started', { jobId: 'check_123' });

    expect(sent[0].channel).toBe('compliance');
    expect(sent[0].event).toBe('job-started');
  });

  it('drops unknown channels without sending', () => {
    ext.emit('nonexistent-channel', 'whatever', {});
    expect(sent).toHaveLength(0);
  });

  it('drops unknown events for a known channel without sending', () => {
    ext.emit('compliance', 'totally-bogus-event', {});
    expect(sent).toHaveLength(0);
  });
});
