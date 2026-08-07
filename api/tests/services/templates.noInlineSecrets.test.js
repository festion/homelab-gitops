// ops #2628: a shipped template must never carry a literal default for an
// environment reference.
//
// `.mcp/templates/standard-devops/mcp-config.json` shipped
//
//     "GITHUB_PERSONAL_ACCESS_TOKEN=${GITHUB_PERSONAL_ACCESS_TOKEN:-<literal>}"
//
// which READS as env indirection but is an inline value wearing a `${}`. The
// shell substitutes the literal whenever the variable is unset, so the config
// is credential-bearing by default and only accidentally safe when the
// environment happens to be populated. This is the same defect as ops #2310
// (`SPOTIFY_CLIENT_SECRET` committed as a hardcoded `:-` fallback in dotfiles).
//
// PR #217 changed where the template lands (`.mcp.json.example`, gitignoring
// `.mcp.json`). It did not change what the template TEACHES: whoever fills the
// example in replaces a placeholder default with a real one, in a file whose
// whole shape says defaults belong here.
//
// The ban is deliberately BLANKET rather than keyed on credential-shaped
// variable names. A name list only catches the secrets someone thought of --
// `access_token`, `network_key` and `tunnel_secret` all sail past a
// TOKEN|SECRET|KEY pattern in the wild. Default to rejecting every literal
// default; add to ALLOWED_DEFAULTS, with a reason, if a genuinely non-secret
// one is ever needed.

const path = require('path');
const fs = require('fs');

const TEMPLATES_DIR = path.resolve(__dirname, '../../../.mcp/templates');

// `${NAME:-default}` and `${NAME:=default}` -- both substitute the literal.
const LITERAL_DEFAULT = /\$\{([A-Za-z_][A-Za-z0-9_]*):[-=]([^}]*)\}/g;

// Deliberately empty. An entry is `${NAME:-value}` verbatim plus a comment
// explaining why that value can never be a credential.
const ALLOWED_DEFAULTS = [];

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? walk(full) : [full];
  });

describe('shipped templates carry no inline secret defaults (#2628)', () => {
  // If the templates directory ever moves, this suite would silently pass by
  // scanning nothing -- the reassuring direction. Pin it.
  it('finds the templates directory and at least one template file', () => {
    expect(fs.existsSync(TEMPLATES_DIR)).toBe(true);
    expect(walk(TEMPLATES_DIR).length).toBeGreaterThan(0);
  });

  it('no template file uses a literal default for an env reference', () => {
    const offenders = [];

    for (const file of walk(TEMPLATES_DIR)) {
      const rel = path.relative(TEMPLATES_DIR, file);
      const text = fs.readFileSync(file, 'utf8');

      for (const m of text.matchAll(LITERAL_DEFAULT)) {
        if (ALLOWED_DEFAULTS.includes(m[0])) continue;
        // Report the variable NAME and the default's length only. The whole
        // point of the finding is that the default may be a live credential,
        // so a failure message must not print it.
        offenders.push(
          `${rel}: \${${m[1]}:-...} (default length ${m[2].length})`
        );
      }
    }

    expect(offenders).toEqual([]);
  });
});
