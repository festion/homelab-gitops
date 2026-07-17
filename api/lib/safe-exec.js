'use strict';
// Shell-free helpers for running git / filesystem operations from request
// handlers. They exist to remove the js/command-line-injection class: the old
// code built a shell string like `git commit -m "${message}"` and passed it to
// child_process.exec (which spawns /bin/sh), so any metacharacter in a
// user-supplied value (repo name, commit message, URL, path) could inject
// arbitrary commands. execFile / fs.rm take the command and its arguments
// separately and never involve a shell, so values are always literal data.
const { execFile, execFileSync } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const execFileP = promisify(execFile);

// Run `git <args>` with no shell. Signature mirrors child_process.execFile's
// (args, [options], callback); options accepts e.g. { cwd }.
function execGit(args, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  return execFile('git', args, options || {}, callback);
}

// Run several git invocations sequentially in the same options (e.g. cwd),
// aborting on the first error — the safe equivalent of shell `git a && git b`.
// `steps` is an array of arg-arrays. Calls back (err, stdouts, stderr): on
// success `stdouts` holds each step's stdout in order; on error it holds the
// stdout collected so far and `stderr` is the failing step's stderr.
function execGitSeq(steps, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  const stdouts = [];
  const run = (i) => {
    if (i >= steps.length) return callback(null, stdouts);
    execGit(steps[i], options, (err, stdout, stderr) => {
      if (err) return callback(err, stdouts, stderr);
      stdouts.push(stdout);
      run(i + 1);
    });
  };
  run(0);
}

// Synchronous shell-free git (replaces `execSync(`git ... ${x}`)`). Returns
// stdout as a utf8 string by default; throws like execFileSync on non-zero exit.
function execGitSync(args, options) {
  return execFileSync('git', args, { encoding: 'utf8', ...(options || {}) });
}

// Promise form of shell-free git (replaces an `await`ed shell `exec`). Resolves
// with stdout, rejects on non-zero exit.
async function execGitP(args, options) {
  const { stdout } = await execFileP('git', args, options || {});
  return stdout;
}

// Recursively remove a directory with no shell — replaces `rm -rf ${path}`.
// force:true so a missing path is not an error (matches `rm -rf`).
function removeDir(target, callback) {
  fs.rm(target, { recursive: true, force: true }, callback);
}

// True only for git remote URLs that use an expected transport scheme. Passing
// a raw request value as a positional git argument is unsafe even without a
// shell: a value beginning with '-' is parsed as an OPTION (argument injection,
// e.g. `--upload-pack=…` → command execution), and transports like `ext::` /
// `file::` let git run arbitrary programs. Reject anything that is not plain
// http(s)/ssh/scp-style before it reaches `git clone` / `git remote set-url`.
function isHttpGitUrl(url) {
  return typeof url === 'string'
    && /^(https?:\/\/|ssh:\/\/|git@[\w.-]+:)/.test(url);
}

module.exports = {
  execGit, execGitSeq, execGitSync, execGitP, removeDir, isHttpGitUrl,
};
