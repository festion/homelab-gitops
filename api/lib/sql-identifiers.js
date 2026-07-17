/**
 * SQL identifier allowlisting for the metrics store (js/sql-injection, Vikunja #2162).
 *
 * SQL identifiers (column names) and the ORDER BY direction keyword cannot be
 * passed as bound parameters, so any caller-supplied value must be resolved
 * against a fixed allowlist. Each helper returns a value taken FROM the constant
 * allowlist — never the caller's string — which both guarantees safety and
 * severs the taint flow CodeQL tracks.
 */

// Columns of the `metrics` table that are safe to ORDER BY.
const ORDERABLE_COLUMNS = Object.freeze([
  'timestamp',
  'metric_type',
  'entity_id',
  'value',
  'created_at',
  'id',
]);

const DEFAULT_ORDER_COLUMN = 'timestamp';

/**
 * Resolve a requested ORDER BY column to a known-safe column name.
 * @param {*} column caller-supplied column name
 * @returns {string} an allowlisted column (defaults to `timestamp`)
 */
function safeOrderColumn(column) {
  const idx = ORDERABLE_COLUMNS.indexOf(column);
  // Return the constant from the allowlist, not the (possibly tainted) input.
  return idx === -1 ? DEFAULT_ORDER_COLUMN : ORDERABLE_COLUMNS[idx];
}

/**
 * Resolve a requested ORDER BY direction to a SQL keyword.
 * @param {*} direction caller-supplied direction
 * @returns {'ASC'|'DESC'} normalized keyword (defaults to `DESC`)
 */
function safeOrderDirection(direction) {
  return typeof direction === 'string' && direction.trim().toUpperCase() === 'ASC'
    ? 'ASC'
    : 'DESC';
}

module.exports = {
  ORDERABLE_COLUMNS,
  safeOrderColumn,
  safeOrderDirection,
};
