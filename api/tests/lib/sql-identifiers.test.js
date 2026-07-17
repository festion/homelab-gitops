/**
 * Unit tests for SQL identifier allowlisting (js/sql-injection remediation, Vikunja #2162).
 *
 * ORDER BY column and direction cannot be bound as SQL parameters, so they must
 * be resolved against a fixed allowlist. Returning a constant from the allowlist
 * (never the caller's string) both enforces safety and breaks CodeQL taint flow.
 */
const {
  safeOrderColumn,
  safeOrderDirection,
} = require('../../lib/sql-identifiers');

describe('safeOrderColumn', () => {
  test('returns an allowlisted column', () => {
    expect(safeOrderColumn('metric_type')).toBe('metric_type');
    expect(safeOrderColumn('timestamp')).toBe('timestamp');
    expect(safeOrderColumn('value')).toBe('value');
  });

  test('falls back to timestamp for an unknown column', () => {
    expect(safeOrderColumn('not_a_column')).toBe('timestamp');
  });

  test('falls back to timestamp for an injection attempt', () => {
    expect(safeOrderColumn('timestamp; DROP TABLE metrics;--')).toBe('timestamp');
    expect(safeOrderColumn('(SELECT 1)')).toBe('timestamp');
  });

  test('falls back to timestamp for non-string input', () => {
    expect(safeOrderColumn(undefined)).toBe('timestamp');
    expect(safeOrderColumn(null)).toBe('timestamp');
    expect(safeOrderColumn(42)).toBe('timestamp');
  });
});

describe('safeOrderDirection', () => {
  test('normalizes ASC in any case', () => {
    expect(safeOrderDirection('asc')).toBe('ASC');
    expect(safeOrderDirection('ASC')).toBe('ASC');
    expect(safeOrderDirection('Asc')).toBe('ASC');
  });

  test('everything else resolves to DESC', () => {
    expect(safeOrderDirection('desc')).toBe('DESC');
    expect(safeOrderDirection('DESC')).toBe('DESC');
    expect(safeOrderDirection('ASC; DROP TABLE metrics')).toBe('DESC');
    expect(safeOrderDirection(undefined)).toBe('DESC');
    expect(safeOrderDirection(null)).toBe('DESC');
  });
});
