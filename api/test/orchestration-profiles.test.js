/**
 * ops #3202 — every orchestration profile must name a workflow that EXISTS.
 *
 * WHY THIS EXISTS
 *
 * Four of eight profiles named workflows that had never existed:
 *
 *     compliance-check         -> compliance.yml
 *     dependency-update        -> dependency-update.yml
 *     disaster-recovery-test   -> disaster-recovery.yml
 *     performance-optimization -> performance-optimization.yml
 *
 * A fifth, full-gitops-audit, named audit.yml -- which was real until it was
 * deleted for auditing an empty directory, and would have joined them.
 *
 * This is not decorative config. pipelineOrchestrator.js reads
 * `config.workflow` and passes it to triggerPipeline(), which calls
 * github.actions.createWorkflowDispatch(). A profile naming a phantom workflow
 * therefore 404s against the GitHub API deep inside an orchestration run,
 * rather than failing at config load where it would be obvious.
 *
 * Nothing validated the field, so the profiles and the workflow directory
 * drifted apart silently and stayed apart. A workflow can be deleted -- as two
 * were on 2026-08-31 -- without anything noticing a profile still points at it.
 *
 * THE FALLBACK MAKES A NULL WORSE THAN A WRONG NAME, which is why this asserts
 * existence rather than merely presence:
 *
 *     pipelineOrchestrator.js:151   workflow: config.workflow || 'ci.yml'
 *
 * A profile with no workflow silently becomes ci.yml -- so a disaster-recovery
 * profile would run the CI suite and report success. A wrong name at least
 * fails. "Set it to null until we build it" is the one repair that must not be
 * made, and this test would not catch it, so it is called out here instead.
 */

// jest, not node:test -- `npm test` in api/ runs jest, and api/test/ is
// collected by its 'Legacy API Tests' project. A node:test file registers with
// node's runner, so jest sees a suite with no tests and fails it. Caught by
// running `npm test` rather than assuming the file would be picked up.
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..', '..');
const WORKFLOW_DIR = path.join(REPO, '.github', 'workflows');

const mod = require('../config/orchestrationProfiles');
const profiles = mod.orchestrationProfiles || mod;

describe('orchestration profiles (ops #3202)', () => {
  it('the profile config loads and is non-empty (control)', () => {
  // Without this, every assertion below iterates an empty object and passes
  // vacuously -- the reassuring direction, and exactly how a config that
  // stopped exporting anything would look.
  assert.ok(profiles && typeof profiles === 'object', 'profiles did not load');
  assert.ok(Object.keys(profiles).length > 0, 'no profiles found — the checks below would be vacuous');
  });

  it('the workflow directory is readable and non-empty (control)', () => {
  // Same reasoning from the other side: if the directory cannot be read, every
  // "workflow exists" check fails for the wrong reason, and if it silently
  // returned [] every check would fail loudly rather than pass -- but the
  // failure would name the wrong cause.
  assert.ok(fs.existsSync(WORKFLOW_DIR), `no workflow directory at ${WORKFLOW_DIR}`);
  const files = fs.readdirSync(WORKFLOW_DIR).filter((f) => f.endsWith('.yml'));
  assert.ok(files.length > 0, 'workflow directory holds no .yml files');
  });

  it('every profile names a workflow that exists', () => {
  const missing = [];
  for (const [key, profile] of Object.entries(profiles)) {
    if (!profile || typeof profile !== 'object') continue;
    const wf = profile.workflow;
    if (!wf) {
      // Deliberately an error, not a skip. `config.workflow || 'ci.yml'` turns
      // an absent workflow into the CI suite, so a profile with no workflow
      // runs something and reports success for work it never did.
      missing.push(`${key}: no workflow field (would silently fall back to ci.yml)`);
      continue;
    }
    if (!fs.existsSync(path.join(WORKFLOW_DIR, wf))) {
      missing.push(`${key} -> ${wf}`);
    }
  }
  assert.deepStrictEqual(
    missing,
    [],
    'profiles naming workflows that do not exist — triggerPipeline() will 404 '
      + 'on dispatch:\n  ' + missing.join('\n  ')
  );
  });

  it('the check can actually fail (fire test)', () => {
  // The assertion above is an absence check over a loop. If the loop stopped
  // iterating, or the existence test always returned true, it would pass
  // exactly as it does now. Prove the detector fires on a known-bad value
  // rather than trusting that it would.
  const bogus = { 'synthetic-profile': { workflow: 'this-workflow-does-not-exist.yml' } };
  const missing = [];
  for (const [key, profile] of Object.entries(bogus)) {
    if (!fs.existsSync(path.join(WORKFLOW_DIR, profile.workflow))) {
      missing.push(`${key} -> ${profile.workflow}`);
    }
  }
  assert.strictEqual(missing.length, 1, 'the detector did not flag a known-missing workflow');
  });

  it('a real workflow is found by the same lookup (negative control)', () => {
  // The mirror of the fire test. If the existence check returned false for
  // everything, the arm above would pass and "every profile names a workflow
  // that exists" would fail -- but a future edit could invert that. Pin both
  // directions.
  assert.ok(
    fs.existsSync(path.join(WORKFLOW_DIR, 'ci.yml')),
    'ci.yml not found by the same lookup the assertions use — the check is broken, not the config'
  );
  });
});
