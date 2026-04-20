// api/createApp.js
// Factory that builds the Express app with services pre-wired to app.locals.
// Full signature will grow across subsequent tasks; this is the minimal
// shell needed to make the first smoke test pass.

const express = require('express');

function createApp(services = {}) {
  const app = express();
  app.use(express.json());

  // Pin collaborators to app.locals (empty in this stub — grows later).
  Object.assign(app.locals, services);

  return app;
}

module.exports = { createApp };
