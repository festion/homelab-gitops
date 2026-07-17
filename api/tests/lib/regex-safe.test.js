/**
 * Unit tests for escapeRegExp (js/regex-injection remediation, Vikunja #2162).
 *
 * User-supplied search terms are interpolated into `new RegExp(...)` for
 * highlighting. Without escaping, a term containing regex metacharacters either
 * throws (unbalanced group) or enables ReDoS. escapeRegExp turns any string into
 * a literal-match pattern.
 */
const { escapeRegExp } = require('../../lib/regex-safe');

describe('escapeRegExp', () => {
  test('escapes all regex metacharacters', () => {
    expect(escapeRegExp('a.b*c+d?')).toBe('a\\.b\\*c\\+d\\?');
    expect(escapeRegExp('(group)')).toBe('\\(group\\)');
    expect(escapeRegExp('[set]{n}')).toBe('\\[set\\]\\{n\\}');
    expect(escapeRegExp('^start|end$')).toBe('\\^start\\|end\\$');
    expect(escapeRegExp('back\\slash')).toBe('back\\\\slash');
  });

  test('leaves plain text unchanged', () => {
    expect(escapeRegExp('homelab-gitops')).toBe('homelab-gitops');
  });

  test('a term with an unbalanced group no longer throws when used in RegExp', () => {
    const term = '(unclosed';
    const build = () => new RegExp(`(${escapeRegExp(term)})`, 'gi');
    expect(build).not.toThrow();
    const re = build();
    expect('x(unclosed y'.replace(re, '<mark>$1</mark>')).toBe('x<mark>(unclosed</mark> y');
  });

  test('a metacharacter term matches literally, not as a pattern', () => {
    const re = new RegExp(`(${escapeRegExp('.')})`, 'gi');
    // Should highlight only literal dots, not every character.
    expect('a.b'.replace(re, '[$1]')).toBe('a[.]b');
  });
});
