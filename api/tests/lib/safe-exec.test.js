// Security regression tests for lib/safe-exec.js (CodeQL js/command-line-injection).
//
// The 18 critical command-injection alerts on this API all came from building a
// shell string like `git commit -m "${message}"` and passing it to
// child_process.exec (which spawns /bin/sh). These helpers run the same git /
// filesystem operations with NO shell, so an attacker-controlled value can never
// be interpreted as a command. These tests prove that property directly.
const os = require('os');
const path = require('path');
const fs = require('fs');

const {
  execGit, execGitSeq, execGitSync, execGitP, removeDir, isHttpGitUrl,
} = require('../../lib/safe-exec');

function mkTmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'safeexec-'));
}

function initRepo(dir, cb) {
  execGit(['init', '-q'], { cwd: dir }, () =>
    execGit(['config', 'user.email', 't@example.com'], { cwd: dir }, () =>
      execGit(['config', 'user.name', 'Test'], { cwd: dir }, () => cb())));
}

describe('safe-exec execGit / execGitSeq (no shell)', () => {
  test('a shell-metacharacter commit message is stored LITERALLY and does not execute', (done) => {
    const dir = mkTmp();
    initRepo(dir, () => {
      fs.writeFileSync(path.join(dir, 'file.txt'), 'content');
      // In a shell this closes the -m quote and runs `touch INJECTED`.
      const payload = '"; touch INJECTED; echo "pwned';
      execGitSeq([['add', '.'], ['commit', '-m', payload]], { cwd: dir }, (err) => {
        expect(err).toBeNull();
        // The injection side effect must NOT have happened, in the repo or cwd.
        expect(fs.existsSync(path.join(dir, 'INJECTED'))).toBe(false);
        expect(fs.existsSync(path.join(process.cwd(), 'INJECTED'))).toBe(false);
        // And the commit subject is the exact literal payload.
        execGit(['log', '-1', '--pretty=%s'], { cwd: dir }, (e2, stdout) => {
          expect(e2).toBeNull();
          expect(stdout.trim()).toBe(payload);
          fs.rmSync(dir, { recursive: true, force: true });
          done();
        });
      });
    });
  });

  test('execGitSeq runs steps in order and returns each stdout', (done) => {
    const dir = mkTmp();
    initRepo(dir, () => {
      fs.writeFileSync(path.join(dir, 'a.txt'), 'a');
      execGitSeq([['add', '.'], ['status', '--short']], { cwd: dir }, (err, outs) => {
        expect(err).toBeNull();
        expect(Array.isArray(outs)).toBe(true);
        expect(outs).toHaveLength(2);
        expect(outs[1]).toMatch(/a\.txt/); // status shows the staged file
        fs.rmSync(dir, { recursive: true, force: true });
        done();
      });
    });
  });

  test('execGitSeq aborts on the first failing step (mirrors shell &&)', (done) => {
    const dir = mkTmp();
    initRepo(dir, () => {
      // `git commit` with nothing staged fails; the second step must not run.
      execGitSeq([['commit', '-m', 'x'], ['tag', 'SHOULD_NOT_EXIST']], { cwd: dir }, (err) => {
        expect(err).not.toBeNull();
        execGit(['tag', '--list'], { cwd: dir }, (e2, stdout) => {
          expect(stdout).not.toMatch(/SHOULD_NOT_EXIST/);
          fs.rmSync(dir, { recursive: true, force: true });
          done();
        });
      });
    });
  });

  test('execGit passes a path argument literally (no glob/again no shell)', (done) => {
    const dir = mkTmp();
    initRepo(dir, () => {
      // A filename containing shell metacharacters is added verbatim.
      const weird = 'a b;$(touch NOPE).txt';
      fs.writeFileSync(path.join(dir, weird), 'x');
      execGit(['add', weird], { cwd: dir }, (err) => {
        expect(err).toBeNull();
        expect(fs.existsSync(path.join(dir, 'NOPE'))).toBe(false);
        fs.rmSync(dir, { recursive: true, force: true });
        done();
      });
    });
  });

  test('the (args, callback) overload works (options omitted)', (done) => {
    execGit(['--version'], (err, stdout) => {
      expect(err).toBeNull();
      expect(stdout).toMatch(/git version/);
      done();
    });
  });

  test('execGitSeq (steps, callback) overload works (options omitted)', (done) => {
    execGitSeq([['--version']], (err, outs) => {
      expect(err).toBeNull();
      expect(outs[0]).toMatch(/git version/);
      done();
    });
  });

  // Argument-injection guard (the residual class after de-shelling): a value
  // beginning with '-' must be a positional, not a git option. `clone --`
  // enforces that, so a `--upload-pack=` payload is treated as a repo name
  // (clone fails) and never executed.
  test('git clone -- treats a leading-dash argument as a repo, not an option', (done) => {
    const dir = mkTmp();
    const marker = path.join(dir, 'PWNED_CLONE');
    execGit(['clone', '--', `--upload-pack=touch ${marker}`, path.join(dir, 'dest')], (err) => {
      expect(err).not.toBeNull(); // no such repo -> clone fails
      expect(fs.existsSync(marker)).toBe(false); // and nothing was executed
      fs.rmSync(dir, { recursive: true, force: true });
      done();
    });
  });

  test('execGitSync returns stdout as a string', () => {
    expect(execGitSync(['--version'])).toMatch(/git version/);
  });

  test('execGitP resolves with stdout', async () => {
    await expect(execGitP(['--version'])).resolves.toMatch(/git version/);
  });
});

describe('isHttpGitUrl (remote-URL argument guard)', () => {
  test('accepts http(s) / ssh / scp-style git URLs', () => {
    for (const u of [
      'https://github.com/festion/homelab-gitops.git',
      'http://internal/x/y.git',
      'ssh://git@host:22/x/y.git',
      'git@github.com:festion/x.git',
    ]) {
      expect(isHttpGitUrl(u)).toBe(true);
    }
  });

  test('rejects option-injection, dangerous transports, and non-strings', () => {
    for (const u of [
      '--upload-pack=touch /tmp/x', // leading '-' → option injection
      '-c',
      'ext::sh -c "id"', // arbitrary-command transport
      'file:///etc/passwd',
      '', ' ', null, undefined, 42, {},
    ]) {
      expect(isHttpGitUrl(u)).toBe(false);
    }
  });
});

describe('safe-exec removeDir (no shell, replaces `rm -rf ${x}`)', () => {
  test('recursively removes a directory tree', (done) => {
    const dir = mkTmp();
    fs.mkdirSync(path.join(dir, 'nested'));
    fs.writeFileSync(path.join(dir, 'nested', 'f.txt'), 'x');
    removeDir(dir, (err) => {
      expect(err == null).toBe(true);
      expect(fs.existsSync(dir)).toBe(false);
      done();
    });
  });

  test('does not throw on a missing path (force semantics)', (done) => {
    removeDir(path.join(os.tmpdir(), 'safeexec-does-not-exist-12345'), (err) => {
      expect(err == null).toBe(true);
      done();
    });
  });
});
