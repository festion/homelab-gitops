// ops #2716: the "Apply Templates" path had NEVER executed the applicator.
//
// templateEngine built the spawn args as
//   [script, '--template', name, '--repository', path]
// but the CLI declares `action` as a REQUIRED positional with choices
// {list,validate,apply,analyze}. argparse therefore exited 2 before the
// applicator was reached -- on apply AND on dry-run, since argparse rejects
// before --dry-run is ever consulted. Reproduced verbatim:
//   $ python3 .mcp/template-applicator.py --template standard-devops --repository /tmp/tgt
//   error: the following arguments are required: action        exit=2
//
// The second half is subtler and is why this test asserts on ARGV rather than
// on a boolean. The CLI computes `dry_run = not args.apply`, so `--dry-run` is
// decorative and only `--apply` makes a run real. Adding the action positional
// ALONE would have made dryRun=false silently PLAN and exit 0 -- reported to
// the operator as "Successfully applied N template(s)" for a run that wrote
// nothing. That is a worse failure than the exit-2 it replaced, and a test that
// only checked "does it succeed now" would have certified it.

const TemplateEngine = require('../../services/compliance/templateEngine');

describe('TemplateEngine.applyTemplate spawn args (#2716)', () => {
  let engine;
  let seenArgs;

  beforeEach(() => {
    engine = new TemplateEngine();
    seenArgs = null;
    // Capture argv instead of asserting only on the returned verdict: the
    // defect lived entirely in the arguments, and a stub that answers success
    // to every argv pins nothing.
    engine.runPythonScript = async (args) => {
      seenArgs = args;
      return { exitCode: 0, stdout: '{}', stderr: '' };
    };
  });

  it('passes the required `action` positional', async () => {
    await engine.applyTemplate('/tmp/repo', 'standard-devops', { dryRun: true });
    expect(seenArgs).not.toBeNull();
    // Must be the positional, immediately after the script path -- not a flag.
    expect(seenArgs[1]).toBe('apply');
  });

  it('does not reintroduce the argparse-rejected invocation', async () => {
    await engine.applyTemplate('/tmp/repo', 'standard-devops', { dryRun: true });
    // The exact shape that exited 2: first arg after the script is an option.
    expect(seenArgs[1].startsWith('--')).toBe(false);
    expect(['list', 'validate', 'apply', 'analyze']).toContain(seenArgs[1]);
  });

  it('sends --apply for a real run, so the plan-only refusal can surface', async () => {
    await engine.applyTemplate('/tmp/repo', 'standard-devops', { dryRun: false });
    expect(seenArgs).toContain('--apply');
    // Sending both would be ambiguous about intent even though the CLI ignores
    // --dry-run; keep the two mutually exclusive.
    expect(seenArgs).not.toContain('--dry-run');
  });

  it('sends --dry-run and never --apply for a dry run', async () => {
    await engine.applyTemplate('/tmp/repo', 'standard-devops', { dryRun: true });
    expect(seenArgs).toContain('--dry-run');
    // The positive control for the pair above: a dry run must never be able to
    // reach the writing path. If this ever passes --apply, a "preview" mutates
    // the repository.
    expect(seenArgs).not.toContain('--apply');
  });

  it('defaults to a dry run when the caller says nothing', async () => {
    await engine.applyTemplate('/tmp/repo', 'standard-devops');
    expect(seenArgs).toContain('--dry-run');
    expect(seenArgs).not.toContain('--apply');
  });

  it('still carries the template and repository it was given', async () => {
    await engine.applyTemplate('/tmp/some-repo', 'my-template', { dryRun: true });
    expect(seenArgs[seenArgs.indexOf('--template') + 1]).toBe('my-template');
    expect(seenArgs[seenArgs.indexOf('--repository') + 1]).toBe('/tmp/some-repo');
  });

  it('reports failure when the applicator exits non-zero', async () => {
    engine.runPythonScript = async (args) => {
      seenArgs = args;
      return { exitCode: 1, stdout: '', stderr: 'plan-only tool' };
    };
    const result = await engine.applyTemplate('/tmp/repo', 'standard-devops', { dryRun: false });
    expect(result.success).toBe(false);
  });
});
