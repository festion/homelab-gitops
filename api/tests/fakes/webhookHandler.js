// api/tests/fakes/webhookHandler.js
// Minimal fake for the webhook handler — records received events; tests inspect
// state.received.

function createFakeWebhookHandler() {
  const state = { received: [] };
  return {
    state,
    async handle(event, payload) {
      state.received.push({ event, payload, at: new Date().toISOString() });
      return { accepted: true };
    },
  };
}

module.exports = { createFakeWebhookHandler };
