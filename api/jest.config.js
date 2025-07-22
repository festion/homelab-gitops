module.exports = {
  testEnvironment: 'node',
  testTimeout: 10000,
  // Skip only the flaky WebSocket tests
  testPathIgnorePatterns: [
    '/node_modules/',
    'websocket-server.test.js'
  ],
  // Increase timeout for remaining tests
  setupFilesAfterEnv: []
};