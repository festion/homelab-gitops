// api/tests/fakes/index.js
module.exports = {
  ...require('./config'),
  ...require('./githubMCP'),
  ...require('./templateEngine'),
  ...require('./orchestrator'),
  ...require('./webhookHandler'),
};
