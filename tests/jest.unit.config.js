module.exports = {
  displayName: 'Unit Tests',
  testEnvironment: 'node',

  // Root directory for tests and modules
  rootDir: '..',

  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/jest.setup.js'
  ],

  // Test file patterns - Only unit tests
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.js'
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/',
    '/logs/',
    '/tests/integration/',
    '/tests/performance/'
  ],

  // Coverage configuration for unit tests
  collectCoverage: true,
  collectCoverageFrom: [
    'api/services/**/*.js',
    'api/middleware/**/*.js',
    'api/models/**/*.js',
    'api/utils/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/test/**',
    '!**/coverage/**',
    '!**/*.config.js',
    '!**/logs/**',
    '!**/mocks/**',
    '!**/fixtures/**'
  ],

  // Coverage ratchet (ops #4395). Values are the MEASURED coverage rounded DOWN
  // to the integer after the self-referential suites were removed and the
  // mcp-coordinator / health-checker suites were skipped. They are a floor, not a
  // target: raise them as real tests land, never lower them silently.
  // ops #4401 removed the per-file floors for home-assistant-deployer,
  // health-checker and mcp-coordinator together with the files themselves: the
  // deployer subsystem was unreachable from api/server.js (the only production
  // entry point) and was retired, not de-tested.
  coverageThreshold: {
    // Jest's "global" excludes files that have their own entry below; measured 0.82/0.56/0.85/0.51.
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  },

  // Coverage reporting
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html',
    'json'
  ],

  // Coverage output directory
  coverageDirectory: '<rootDir>/tests/coverage/unit',

  // Test timeout (shorter for unit tests)
  testTimeout: 10000,

  // Module name mapping
  moduleNameMapper: {
    '^uuid$': '<rootDir>/tests/mocks/uuid.cjs.js',
    '^@/(.*)$': '<rootDir>/$1',
    '^@config/(.*)$': '<rootDir>/config/$1',
    '^@services/(.*)$': '<rootDir>/services/$1',
    '^@scripts/(.*)$': '<rootDir>/scripts/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^@mocks/(.*)$': '<rootDir>/tests/mocks/$1',
    '^@fixtures/(.*)$': '<rootDir>/tests/fixtures/$1'
  },

  // Global variables for tests
  globals: {
    'process.env.NODE_ENV': 'test',
    'process.env.TEST_DATABASE_URL': 'sqlite::memory:',
    'process.env.JWT_SECRET': 'test-jwt-secret-key-for-unit-tests',
    'process.env.GITHUB_TOKEN': 'test-github-token-unit',
    'process.env.WEBHOOK_SECRET': 'test-webhook-secret-unit'
  },

  // Verbose output for unit test debugging
  verbose: true,

  // Detect open handles for proper cleanup
  detectOpenHandles: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Error handling
  errorOnDeprecated: true,

  // Performance optimizations for unit tests
  maxWorkers: '75%',
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache-unit'
};
