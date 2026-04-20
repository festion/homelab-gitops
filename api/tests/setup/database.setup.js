// tests/setup/database.setup.js
// Connect the real Database singleton against :memory: so AuthService and any
// other code that calls Database.getInstance() gets a working sqlite handle.
// The schemas in this test DB are whatever Database.initializeSchema() defines
// in production (users, api_keys, sessions, auth_audit_log). Suites that
// depend on a different schema are skipped — see docs/plans/2026-04-20-api-test-restoration-b-auth.md.

const Database = require('../../models/database');

beforeAll(async () => {
  try {
    const db = Database.getInstance(':memory:');
    await db.connect();
    await db.initializeSchema();
    // Intentionally skip db.createDefaultAdmin() — tests seed their own users.
    global.testDB = db;
  } catch (err) {
    Database.instance = null;
    throw err;
  }
});

afterAll(async () => {
  if (Database.instance) {
    await Database.instance.close();
    Database.instance = null;
  }
});

afterEach(async () => {
  if (!Database.instance || !Database.instance.db) {
    throw new Error('Test DB not initialized — beforeAll did not run');
  }
  const db = Database.getInstance();
  await db.run('DELETE FROM sessions');
  await db.run('DELETE FROM auth_audit_log');
  await db.run("DELETE FROM api_keys WHERE id NOT LIKE 'seed-%'");
  await db.run("DELETE FROM users WHERE id NOT LIKE 'seed-%'");
});

global.getTestDatabase = () => global.testDB;
