// ⚠ NON-FUNCTIONAL — this suite has never run. Do not trust a green pipeline
// as evidence that it does. Tracked in ops #2271.
//
// Four independent reasons, all still present below:
//
//   1. rootDir defaults to this config's OWN directory, so every
//      '<rootDir>/tests/integration/...' path resolves to
//      tests/integration/tests/integration/... and matches nothing.
//      `jest --listTests` returns zero files. The sibling that works,
//      tests/jest.unit.config.js, sets `rootDir: '..'` -- copy that.
//   2. `moduleNameMapping` (below) is a typo for `moduleNameMapper`; jest
//      reports it as an unknown option and ignores it.
//   3. setupFilesAfterEnv / globalSetup / globalTeardown point at paths that
//      do not resolve for reason 1, so jest aborts with a Validation Error
//      before running anything. The target files DO exist -- only the paths
//      are wrong.
//   4. babel-jest, jest-html-reporters, jest-junit and supertest are all
//      referenced here but are absent from every manifest in this repo.
//
// And once it does run, tests/integration/database/deployment-repository.test.js
// imports ../../../api/repositories/deployment-repository, which does not
// exist. So reviving this needs a decision about that test, not just config
// repair.
//
// CI does not invoke this suite at all -- the "Integration Tests" job runs the
// api/ and dashboard/ suites only.

module.exports = {
  displayName: 'Integration Tests',
  testMatch: [
    '<rootDir>/tests/integration/**/*.test.js'
  ],
  testEnvironment: 'node',
  collectCoverageFrom: [
    'api/**/*.js',
    '!api/**/node_modules/**',
    '!api/**/*.test.js',
    '!api/**/*.spec.js',
    '!api/coverage/**'
  ],
  coverageDirectory: '<rootDir>/coverage/integration',
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json'
  ],
  setupFilesAfterEnv: [
    '<rootDir>/tests/integration/setup/jest-setup.js'
  ],
  testTimeout: 60000, // 60 seconds for integration tests
  maxWorkers: 1, // Run tests serially to avoid conflicts
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
  globalSetup: '<rootDir>/tests/integration/setup/global-setup.js',
  globalTeardown: '<rootDir>/tests/integration/setup/global-teardown.js',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/api/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/'
  ],
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(supertest)/)'
  ],
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './coverage/integration/html-report',
        filename: 'integration-test-report.html',
        expand: true,
        hideIcon: false,
        pageTitle: 'Integration Test Report'
      }
    ],
    [
      'jest-junit',
      {
        outputDirectory: './coverage/integration',
        outputName: 'integration-junit.xml',
        suiteName: 'Integration Tests',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true
      }
    ]
  ]
};