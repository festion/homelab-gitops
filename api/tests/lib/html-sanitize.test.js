/**
 * Tests for the HTML-neutralizing helper (Vikunja #2162):
 *   js/bad-tag-filter, js/incomplete-multi-character-sanitization,
 *   js/incomplete-url-scheme-check.
 *
 * The prior hand-rolled sanitizers matched named tags (`<script>...</script>`)
 * with regexes that CodeQL (correctly) flags as bypassable. Removing angle
 * brackets outright makes any tag impossible to form — complete and free of the
 * partial-match / named-tag pitfalls — while preserving ordinary text such as
 * repo paths (slashes) and query strings (ampersands).
 */
const { stripHtml, containsHtml } = require('../../lib/html-sanitize');

describe('stripHtml', () => {
  test('output never contains angle brackets', () => {
    expect(stripHtml('<script>alert(1)</script>')).not.toMatch(/[<>]/);
    expect(stripHtml('<img src=x onerror=alert(1)>')).not.toMatch(/[<>]/);
  });

  test('a nested/obfuscated tag cannot survive (no bypass)', () => {
    // A single-pass named-tag filter would turn <scr<script>ipt> back into <script>.
    const out = stripHtml('<scr<script>ipt>alert(1)</script>');
    expect(out).not.toMatch(/[<>]/);
    expect(out.toLowerCase()).not.toContain('<script');
  });

  test('removes dangerous URL schemes', () => {
    expect(stripHtml('javascript:alert(1)')).not.toMatch(/javascript:/i);
    expect(stripHtml('VBScript:msgbox(1)')).not.toMatch(/vbscript:/i);
    expect(stripHtml('data:text/html,<x>')).not.toMatch(/data:/i);
  });

  test('neutralizes a tag carrying an inline event handler (no bracket survives)', () => {
    // The handler text may remain, but without angle brackets it cannot form an
    // executing element — that is the security property we guarantee.
    const out = stripHtml('<div onclick="steal()">x</div>');
    expect(out).not.toMatch(/[<>]/);
  });

  test('a removal cannot be reconstructed from residue (fixed point)', () => {
    // Single-pass removal would leave "javascript:"; the loop must fully clear it.
    expect(stripHtml('javascjavascript:ript:alert(1)')).not.toMatch(/javascript:/i);
  });

  test('preserves ordinary text (slashes, ampersands) — why we do not HTML-escape', () => {
    expect(stripHtml('owner/repo')).toBe('owner/repo');
    expect(stripHtml('a=1&b=2')).toBe('a=1&b=2');
    expect(stripHtml('plain text 123')).toBe('plain text 123');
  });

  test('non-string input is returned unchanged', () => {
    expect(stripHtml(42)).toBe(42);
    expect(stripHtml(null)).toBe(null);
  });
});

describe('containsHtml', () => {
  test('true when the value carries tags/handlers/schemes', () => {
    expect(containsHtml('<b>x</b>')).toBe(true);
    expect(containsHtml('click javascript:evil')).toBe(true);
  });
  test('false for clean text', () => {
    expect(containsHtml('just a normal string / with slashes')).toBe(false);
  });
});
