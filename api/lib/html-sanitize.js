/**
 * HTML-neutralizing helpers (Vikunja #2162): remediation for
 *   js/bad-tag-filter, js/incomplete-multi-character-sanitization,
 *   js/incomplete-url-scheme-check.
 *
 * The previous sanitizers matched named tags (`<script>...</script>`) with
 * regexes that are bypassable (nested tags, malformed markup, quoted `>`),
 * which CodeQL flags. Instead we remove the angle-bracket characters outright:
 * with no `<` or `>` in the output no tag can form. This is complete (there is
 * no partial match to reconstruct) and is not a named-tag filter, so it avoids
 * the bad-tag-filter / incomplete-sanitization classes entirely — while leaving
 * ordinary text (repo paths with `/`, query strings with `&`) intact, unlike
 * HTML-entity escaping.
 */

// URL schemes that can execute script when navigated.
const DANGEROUS_SCHEMES = /(?:javascript|vbscript|data|about|file)\s*:/gi;

// Inline event-handler attributes (onclick=, onerror=, ...).
const EVENT_HANDLERS = /\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;

/**
 * Neutralize HTML/script content in a string. Non-strings are returned as-is.
 * @param {*} input
 * @returns {*} sanitized string (or the original value if not a string)
 */
function stripHtml(input) {
  if (typeof input !== 'string') return input;
  // Apply removals to a fixed point so a match cannot be reconstructed from the
  // residue of an earlier removal (e.g. "oonn..." -> "on..."). Each pass only
  // deletes characters, so the loop is monotonic and terminates.
  let out = input;
  let prev;
  do {
    prev = out;
    out = out
      .replace(EVENT_HANDLERS, '')    // drop on*="..." handlers
      .replace(DANGEROUS_SCHEMES, '') // drop javascript:/data:/... schemes
      .replace(/[<>]/g, '');          // remove angle brackets -> no tag can form
  } while (out !== prev);
  return out;
}

/**
 * Whether a string contains HTML/script/scheme content that stripHtml removes.
 * @param {*} input
 * @returns {boolean}
 */
function containsHtml(input) {
  return typeof input === 'string' && stripHtml(input) !== input;
}

module.exports = { stripHtml, containsHtml };
