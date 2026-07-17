/**
 * Integration tests for MetricsStorage.buildSQL SQL-injection remediation
 * (js/sql-injection, Vikunja #2162).
 *
 * buildSQL is pure (no DB handle needed) — it turns a MetricsQuery into a
 * parameterized { sql, params }. These tests assert that attacker-controlled
 * ORDER BY / tag-key values cannot alter the SQL structure.
 */
const MetricsStorage = require('../../services/metrics/metricsStorage');
const { MetricsQuery } = require('../../models/metrics');

function makeQuery(overrides = {}) {
  const q = new MetricsQuery();
  Object.assign(q, overrides);
  return q;
}

describe('MetricsStorage.buildSQL — ORDER BY injection', () => {
  const storage = new MetricsStorage();

  test('a valid orderBy column is emitted', () => {
    const { sql } = storage.buildSQL(makeQuery({ orderBy: 'metric_type', orderDirection: 'ASC' }));
    expect(sql).toContain('ORDER BY metric_type ASC');
  });

  test('an injected orderBy column is neutralized to timestamp', () => {
    const { sql } = storage.buildSQL(
      makeQuery({ orderBy: 'timestamp; DROP TABLE metrics;--', orderDirection: 'DESC' })
    );
    expect(sql).not.toContain('DROP TABLE');
    expect(sql).toContain('ORDER BY timestamp DESC');
  });

  test('an injected orderDirection is neutralized to a keyword', () => {
    const { sql } = storage.buildSQL(
      makeQuery({ orderBy: 'timestamp', orderDirection: 'ASC; DELETE FROM metrics' })
    );
    expect(sql).not.toContain('DELETE');
    expect(sql).toMatch(/ORDER BY timestamp (ASC|DESC)\b/);
  });
});

describe('MetricsStorage.buildSQL — tag-key injection', () => {
  const storage = new MetricsStorage();

  test('a tag filter binds the JSON path as a parameter, not string-interpolated', () => {
    const q = makeQuery();
    q.filters = { "tags.env') = 1 OR JSON_EXTRACT(tags, '$.x": 'prod' };
    const { sql, params } = storage.buildSQL(q);
    // The malicious key must not appear inline in the SQL text.
    expect(sql).not.toContain('OR JSON_EXTRACT');
    // Path is a bound parameter of the form $.<key>.
    expect(sql).toContain('JSON_EXTRACT(tags, ?)');
    expect(params).toContain("$.env') = 1 OR JSON_EXTRACT(tags, '$.x");
  });

  test('a normal tag filter still works', () => {
    const q = makeQuery();
    q.filters = { 'tags.environment': 'prod' };
    const { sql, params } = storage.buildSQL(q);
    expect(sql).toContain('JSON_EXTRACT(tags, ?) = ?');
    expect(params).toContain('$.environment');
    expect(params).toContain('prod');
  });
});
