/**
 * Escape a string so it matches literally inside a RegExp (js/regex-injection,
 * Vikunja #2162). Neutralizes user-supplied search terms before they are
 * interpolated into `new RegExp(...)`, preventing both syntax errors from
 * unbalanced metacharacters and ReDoS from attacker-crafted patterns.
 *
 * @param {*} value input to escape (non-strings are coerced to '')
 * @returns {string} regex-literal-safe string
 */
function escapeRegExp(value) {
  if (typeof value !== 'string') return '';
  // Escape all characters with special meaning in a RegExp.
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { escapeRegExp };
