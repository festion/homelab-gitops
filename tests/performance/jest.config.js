module.exports = {
  // NOTE: this config deliberately does NOT set rootDir. Unlike its siblings it
  // uses SUITE-relative paths ('<rootDir>/setup/...', '<rootDir>/**/*.test.js'),
  // so jest's default (this file's directory) is already correct. Adding
  // rootDir: '../..' here breaks it. Its zero-collection was caused solely by
  // the missing reporter packages, now declared. See ops #2271.
  displayName: 'Performance Tests',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/**/*.test.js'],
  testTimeout: 300000, // 5 minutes for performance tests
  setupFilesAfterEnv: ['<rootDir>/setup/jest-setup.js'],
  globalSetup: '<rootDir>/setup/global-setup.js',
  globalTeardown: '<rootDir>/setup/global-teardown.js',
  collectCoverageFrom: [
    'utils/**/*.js',
    '!utils/**/*.test.js',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  coverageDirectory: '<rootDir>/../../coverage/performance',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  maxWorkers: 1, // Run performance tests sequentially
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './coverage/performance/html-report',
      filename: 'performance-report.html',
      expand: true,
      hideIcon: false,
      pageTitle: 'Performance Test Report'
    }]
  ]
};