const path = require('path');

// NOTE: this used to execSync('npm run db:reset') and 'npm run test:env:start'
// followed by a curl health check against http://localhost:3000/health.
// Neither script exists in the root or api/ package.json (confirmed by grep),
// so this crashed before a single test ran. Writing those scripts would mean
// deciding these suites own a real ephemeral DB + managed server lifecycle --
// a bigger design/infra decision than a test-blocker fix warrants. Removed
// the calls instead (lower risk): the suite now runs its load/stress tests
// against whatever target the test files themselves already point at, and
// failures show up as real per-test results rather than a crashed globalSetup.
// See ops #2279.
module.exports = async () => {
  console.log('🚀 Setting up performance test environment...');

  try {
    // Set up performance monitoring infrastructure
    console.log('📈 Setting up performance monitoring...');
    
    // Create performance results directory
    const fs = require('fs');
    const resultsDir = path.join(__dirname, '../results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    // Create performance logs directory
    const logsDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // Create performance reports directory
    const reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    console.log('🎯 Performance test environment setup complete');
    
  } catch (error) {
    console.error('❌ Performance test environment setup failed:', error.message);
    throw error;
  }
};