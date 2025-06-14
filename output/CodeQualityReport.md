# 🔍 GitOps Auditor Code Quality Report
**Generated:** Sat Jun 14 22:40:05 UTC 2025
**Commit:** 1b3b0c4e79f712dc6df14664f3b84500dfbc2dae
**Authentication:** Personal Access Token

## Quality Check Results
```
[INFO] Initializing environment for https://github.com/pre-commit/pre-commit-hooks.
[WARNING] repo `https://github.com/pre-commit/pre-commit-hooks` uses deprecated stage names (commit, push) which will be removed in a future version.  Hint: often `pre-commit autoupdate --repo https://github.com/pre-commit/pre-commit-hooks` will fix this.  if it does not -- consider reporting an issue to that repo.
[INFO] Initializing environment for https://github.com/shellcheck-py/shellcheck-py.
[INFO] Initializing environment for https://github.com/psf/black.
[INFO] Initializing environment for https://github.com/pycqa/isort.
[INFO] Initializing environment for https://github.com/pycqa/flake8.
[INFO] Initializing environment for https://github.com/pre-commit/mirrors-prettier.
[INFO] Initializing environment for https://github.com/pre-commit/mirrors-prettier:prettier@3.0.0.
[INFO] Initializing environment for https://github.com/pre-commit/mirrors-eslint.
[INFO] Initializing environment for https://github.com/pre-commit/mirrors-eslint:eslint@8.44.0,@typescript-eslint/eslint-plugin@6.0.0,@typescript-eslint/parser@6.0.0,eslint-config-prettier@8.8.0,eslint-plugin-prettier@5.0.0.
[INFO] Initializing environment for https://github.com/Yelp/detect-secrets.
[INFO] Installing environment for https://github.com/pre-commit/pre-commit-hooks.
[INFO] Once installed this environment will be reused.
[INFO] This may take a few minutes...
[INFO] Installing environment for https://github.com/shellcheck-py/shellcheck-py.
[INFO] Once installed this environment will be reused.
[INFO] This may take a few minutes...
[INFO] Installing environment for https://github.com/psf/black.
[INFO] Once installed this environment will be reused.
[INFO] This may take a few minutes...
[INFO] Installing environment for https://github.com/pycqa/isort.
[INFO] Once installed this environment will be reused.
[INFO] This may take a few minutes...
[INFO] Installing environment for https://github.com/pycqa/flake8.
[INFO] Once installed this environment will be reused.
[INFO] This may take a few minutes...
[INFO] Installing environment for https://github.com/pre-commit/mirrors-prettier.
[INFO] Once installed this environment will be reused.
[INFO] This may take a few minutes...
[INFO] Installing environment for https://github.com/pre-commit/mirrors-eslint.
[INFO] Once installed this environment will be reused.
[INFO] This may take a few minutes...
[INFO] Installing environment for https://github.com/Yelp/detect-secrets.
[INFO] Once installed this environment will be reused.
[INFO] This may take a few minutes...
trim trailing whitespace.................................................Failed
- hook id: trailing-whitespace
- exit code: 1
- files were modified by this hook

Fixing scripts/serena-orchestration.sh
Fixing .github/workflows/lint-and-test.yml
Fixing api/node_modules/serve-static/HISTORY.md
Fixing api/node_modules/iconv-lite/encodings/utf7.js
Fixing api/node_modules/vary/README.md
Fixing api/node_modules/iconv-lite/encodings/dbcs-data.js
Fixing docs/v1.0.4-routing-fixes.md
Fixing api/node_modules/iconv-lite/README.md
Fixing .serena/project.yml
Fixing docs/GITHUB_PAT_SETUP.md
Fixing api/node_modules/express/Readme.md
Fixing docs/spa-routing.md
Fixing api/node_modules/iconv-lite/lib/streams.js
Fixing api/node_modules/iconv-lite/encodings/sbcs-codec.js
Fixing .github/workflows/deploy.yml
Fixing scripts/sync_github_repos_mcp.sh
Fixing scripts/pre-commit-mcp.sh
Fixing setup-linting.sh
Fixing api/node_modules/send/HISTORY.md
Fixing api/node_modules/iconv-lite/encodings/utf32.js
Fixing CLAUDE.md
Fixing PHASE1-COMPLETION.md
Fixing api/server-v2.js
Fixing .github/workflows/security-scan.yml
Fixing scripts/debug-api.sh
Fixing PRODUCTION.md
Fixing nginx/gitops-dashboard.conf
Fixing api/node_modules/iconv-lite/lib/index.js
Fixing api/node_modules/finalhandler/HISTORY.md
Fixing api/node_modules/iconv-lite/encodings/dbcs-codec.js
Fixing .github/workflows/code-quality.yml
Fixing modules/GitHubActionsTools/README.md
Fixing api/github-mcp-manager.js
Fixing scripts/sync_github_repos.sh
Fixing docs/CODE_QUALITY.md
Fixing api/node_modules/iconv-lite/Changelog.md
Fixing api/node_modules/debug/README.md
Fixing api/node_modules/iconv-lite/encodings/utf16.js
Fixing api/node_modules/body-parser/HISTORY.md
Fixing setup-linting.ps1
Fixing .github/workflows/gitops-audit.yml
Fixing scripts/build.func
Fixing dashboard/src/pages/audit.tsx
Fixing docs/WINDOWS_SETUP.md
Fixing fix-spa-routing.sh
Fixing fix-repo-routes.sh
Fixing scripts/validate-codebase-mcp.sh
Fixing api/node_modules/iconv-lite/encodings/internal.js
Fixing quick-fix-deploy.sh
Fixing api/server.js

fix end of files.........................................................Failed
- hook id: end-of-file-fixer
- exit code: 1
- files were modified by this hook

Fixing api/node_modules/path-to-regexp/dist/index.js.map
Fixing api/node_modules/safe-buffer/index.d.ts
Fixing npm-config.txt
Fixing api/node_modules/iconv-lite/encodings/tables/gb18030-ranges.json
Fixing api/node_modules/function-bind/LICENSE
Fixing api/node_modules/iconv-lite/encodings/utf7.js
Fixing api/node_modules/iconv-lite/.idea/modules.xml
Fixing api/node_modules/math-intrinsics/isFinite.d.ts
Fixing api/node_modules/iconv-lite/.idea/codeStyles/codeStyleConfig.xml
Fixing dashboard/src/assets/react.svg
Fixing docs/v1.0.4-routing-fixes.md
Fixing api/node_modules/iconv-lite/.idea/iconv-lite.iml
Fixing api/node_modules/math-intrinsics/min.d.ts
Fixing dashboard/public/vite.svg
Fixing api/node_modules/iconv-lite/encodings/sbcs-data-generated.js
Fixing scripts/output/GitRepoReport.md
Fixing api/node_modules/call-bind-apply-helpers/actualApply.d.ts
Fixing api/node_modules/get-proto/Reflect.getPrototypeOf.d.ts
Fixing api/node_modules/iconv-lite/LICENSE
Fixing docs/spa-routing.md
Fixing api/node_modules/has-symbols/index.d.ts
Fixing api/node_modules/math-intrinsics/constants/maxArrayLength.d.ts
Fixing api/node_modules/call-bind-apply-helpers/functionCall.d.ts
Fixing api/node_modules/math-intrinsics/abs.d.ts
Fixing api/node_modules/iconv-lite/lib/bom-handling.js
Fixing CLAUDE.md
Fixing api/node_modules/math-intrinsics/isFinite.js
Fixing api/node_modules/math-intrinsics/floor.d.ts
Fixing api/node_modules/inherits/LICENSE
Fixing dashboard/src/pages/home.tsx
Fixing scripts/debug-api.sh
Fixing PRODUCTION.md
Fixing nginx/gitops-dashboard.conf
Fixing api/node_modules/call-bind-apply-helpers/functionApply.d.ts
Fixing api/node_modules/iconv-lite/encodings/dbcs-codec.js
Fixing api/node_modules/dunder-proto/set.d.ts
Fixing api/node_modules/math-intrinsics/isNegativeZero.d.ts
Fixing api/node_modules/iconv-lite/Changelog.md
Fixing api/node_modules/get-proto/Object.getPrototypeOf.d.ts
Fixing api/node_modules/debug/LICENSE
Fixing api/node_modules/ipaddr.js/ipaddr.min.js
Fixing api/node_modules/path-to-regexp/dist/index.js
Fixing dev-run.sh
Fixing api/node_modules/is-promise/LICENSE
Fixing api/node_modules/gopd/index.d.ts
Fixing api/node_modules/iconv-lite/encodings/utf16.js
Fixing CHANGELOG.md
Fixing api/node_modules/call-bind-apply-helpers/applyBind.d.ts
Fixing DEVELOPMENT.md
Fixing .last_adguard_dry_run.json
Fixing api/node_modules/math-intrinsics/constants/maxSafeInteger.d.ts
Fixing api/node_modules/math-intrinsics/round.d.ts
Fixing api/node_modules/dunder-proto/get.d.ts
Fixing dashboard/public/GitRepoReport.json
Fixing .github/workflows/gitops-audit.yml
Fixing api/node_modules/call-bind-apply-helpers/tsconfig.json
Fixing api/node_modules/es-define-property/index.d.ts
Fixing api/node_modules/cookie/LICENSE
Fixing api/node_modules/iconv-lite/.idea/inspectionProfiles/Project_Default.xml
Fixing api/node_modules/has-symbols/shams.d.ts
Fixing api/node_modules/iconv-lite/.idea/vcs.xml
Fixing dashboard/src/router.tsx
Fixing api/node_modules/math-intrinsics/isInteger.d.ts
Fixing fix-spa-routing.sh
Fixing fix-repo-routes.sh
Fixing api/node_modules/math-intrinsics/mod.d.ts
Fixing api/node_modules/body-parser/README.md
Fixing update-production.sh
Fixing quick-fix-deploy.sh
Fixing api/node_modules/iconv-lite/encodings/sbcs-data.js
Fixing api/node_modules/iconv-lite/.idea/codeStyles/Project.xml
Fixing api/node_modules/math-intrinsics/sign.d.ts
Fixing api/node_modules/escape-html/Readme.md
Fixing api/node_modules/math-intrinsics/max.d.ts
Fixing README.md
Fixing api/node_modules/math-intrinsics/isNaN.d.ts
Fixing api/node_modules/math-intrinsics/pow.d.ts

check for merge conflicts................................................Passed
check yaml...............................................................Passed
check json...............................................................Failed
- hook id: check-json
- exit code: 1

api/node_modules/es-define-property/tsconfig.json: Failed to json decode (Expecting property name enclosed in double quotes: line 5 column 2 (char 79))
api/node_modules/side-channel-map/tsconfig.json: Failed to json decode (Expecting property name enclosed in double quotes: line 5 column 2 (char 79))
api/node_modules/has-symbols/tsconfig.json: Failed to json decode (Expecting property name enclosed in double quotes: line 6 column 2 (char 108))
api/node_modules/es-errors/tsconfig.json: Failed to json decode (Expecting property name enclosed in double quotes: line 3 column 3 (char 26))
api/node_modules/side-channel/tsconfig.json: Failed to json decode (Expecting property name enclosed in double quotes: line 5 column 2 (char 79))
api/node_modules/side-channel-weakmap/tsconfig.json: Failed to json decode (Expecting property name enclosed in double quotes: line 5 column 2 (char 79))
dashboard/tsconfig.app.json: Failed to json decode (Expecting property name enclosed in double quotes: line 11 column 5 (char 291))
api/node_modules/gopd/tsconfig.json: Failed to json decode (Expecting property name enclosed in double quotes: line 5 column 2 (char 79))
api/node_modules/get-proto/tsconfig.json: Failed to json decode (Expecting property name enclosed in double quotes: line 4 column 3 (char 58))
api/node_modules/dunder-proto/tsconfig.json: Failed to json decode (Expecting property name enclosed in double quotes: line 5 column 2 (char 79))
api/node_modules/es-object-atoms/tsconfig.json: Failed to json decode (Expecting property name enclosed in double quotes: line 5 column 2 (char 76))
api/node_modules/call-bind-apply-helpers/tsconfig.json: Failed to json decode (Expecting property name enclosed in double quotes: line 5 column 2 (char 79))
api/node_modules/call-bound/tsconfig.json: Failed to json decode (Expecting property name enclosed in double quotes: line 6 column 2 (char 100))
dashboard/tsconfig.node.json: Failed to json decode (Expecting property name enclosed in double quotes: line 10 column 5 (char 231))
api/node_modules/math-intrinsics/tsconfig.json: Failed to json decode (Expecting property name enclosed in double quotes: line 3 column 1 (char 34))
api/node_modules/side-channel-list/tsconfig.json: Failed to json decode (Expecting property name enclosed in double quotes: line 5 column 2 (char 79))
api/node_modules/hasown/tsconfig.json: Failed to json decode (Expecting value: line 5 column 3 (char 68))

check xml................................................................Passed
check toml...........................................(no files to check)Skipped
check for added large files..............................................Passed
check for case conflicts.................................................Passed
check for broken symlinks............................(no files to check)Skipped
check that executables have shebangs.....................................Failed
- hook id: check-executables-have-shebangs
- exit code: 1

.github/workflows/security-scan.yml: marked executable but has no (or invalid) shebang!
  If it isn't supposed to be executable, try: `chmod -x .github/workflows/security-scan.yml`
  If on Windows, you may also need to: `git add --chmod=-x .github/workflows/security-scan.yml`
  If it is supposed to be executable, double-check its shebang.
.github/workflows/code-quality.yml: marked executable but has no (or invalid) shebang!
  If it isn't supposed to be executable, try: `chmod -x .github/workflows/code-quality.yml`
  If on Windows, you may also need to: `git add --chmod=-x .github/workflows/code-quality.yml`
  If it is supposed to be executable, double-check its shebang.
.github/workflows/deploy.yml: marked executable but has no (or invalid) shebang!
  If it isn't supposed to be executable, try: `chmod -x .github/workflows/deploy.yml`
  If on Windows, you may also need to: `git add --chmod=-x .github/workflows/deploy.yml`
  If it is supposed to be executable, double-check its shebang.
.github/workflows/gitops-audit.yml: marked executable but has no (or invalid) shebang!
  If it isn't supposed to be executable, try: `chmod -x .github/workflows/gitops-audit.yml`
  If on Windows, you may also need to: `git add --chmod=-x .github/workflows/gitops-audit.yml`
  If it is supposed to be executable, double-check its shebang.
api/server.js: marked executable but has no (or invalid) shebang!
  If it isn't supposed to be executable, try: `chmod -x api/server.js`
  If on Windows, you may also need to: `git add --chmod=-x api/server.js`
  If it is supposed to be executable, double-check its shebang.
.github/workflows/lint-and-test.yml: marked executable but has no (or invalid) shebang!
  If it isn't supposed to be executable, try: `chmod -x .github/workflows/lint-and-test.yml`
  If on Windows, you may also need to: `git add --chmod=-x .github/workflows/lint-and-test.yml`
  If it is supposed to be executable, double-check its shebang.
api/server-v2.js: marked executable but has no (or invalid) shebang!
  If it isn't supposed to be executable, try: `chmod -x api/server-v2.js`
  If on Windows, you may also need to: `git add --chmod=-x api/server-v2.js`
  If it is supposed to be executable, double-check its shebang.
scripts/sync_npm_to_adguard.py: marked executable but has no (or invalid) shebang!
  If it isn't supposed to be executable, try: `chmod -x scripts/sync_npm_to_adguard.py`
  If on Windows, you may also need to: `git add --chmod=-x scripts/sync_npm_to_adguard.py`
  If it is supposed to be executable, double-check its shebang.
PHASE1-COMPLETION.md: marked executable but has no (or invalid) shebang!
  If it isn't supposed to be executable, try: `chmod -x PHASE1-COMPLETION.md`
  If on Windows, you may also need to: `git add --chmod=-x PHASE1-COMPLETION.md`
  If it is supposed to be executable, double-check its shebang.
scripts/generate_adguard_rewrites_from_sqlite.py: marked executable but has no (or invalid) shebang!
  If it isn't supposed to be executable, try: `chmod -x scripts/generate_adguard_rewrites_from_sqlite.py`
  If on Windows, you may also need to: `git add --chmod=-x scripts/generate_adguard_rewrites_from_sqlite.py`
  If it is supposed to be executable, double-check its shebang.
api/github-mcp-manager.js: marked executable but has no (or invalid) shebang!
  If it isn't supposed to be executable, try: `chmod -x api/github-mcp-manager.js`
  If on Windows, you may also need to: `git add --chmod=-x api/github-mcp-manager.js`
  If it is supposed to be executable, double-check its shebang.

check that scripts with shebangs are executable..........................Failed
- hook id: check-shebang-scripts-are-executable
- exit code: 1

manual-deploy.sh: has a shebang but is not marked executable!
  If it is supposed to be executable, try: `chmod +x manual-deploy.sh`
  If on Windows, you may also need to: `git add --chmod=+x manual-deploy.sh`
  If it not supposed to be executable, double-check its shebang is wanted.

scripts/debug-api.sh: has a shebang but is not marked executable!
  If it is supposed to be executable, try: `chmod +x scripts/debug-api.sh`
  If on Windows, you may also need to: `git add --chmod=+x scripts/debug-api.sh`
  If it not supposed to be executable, double-check its shebang is wanted.

scripts/deploy.sh: has a shebang but is not marked executable!
  If it is supposed to be executable, try: `chmod +x scripts/deploy.sh`
  If on Windows, you may also need to: `git add --chmod=+x scripts/deploy.sh`
  If it not supposed to be executable, double-check its shebang is wanted.

scripts/install-dashboard.sh: has a shebang but is not marked executable!
  If it is supposed to be executable, try: `chmod +x scripts/install-dashboard.sh`
  If on Windows, you may also need to: `git add --chmod=+x scripts/install-dashboard.sh`
  If it not supposed to be executable, double-check its shebang is wanted.

scripts/provision-lxc.sh: has a shebang but is not marked executable!
  If it is supposed to be executable, try: `chmod +x scripts/provision-lxc.sh`
  If on Windows, you may also need to: `git add --chmod=+x scripts/provision-lxc.sh`
  If it not supposed to be executable, double-check its shebang is wanted.

setup-linting.sh: has a shebang but is not marked executable!
  If it is supposed to be executable, try: `chmod +x setup-linting.sh`
  If on Windows, you may also need to: `git add --chmod=+x setup-linting.sh`
  If it not supposed to be executable, double-check its shebang is wanted.

dev-run.sh: has a shebang but is not marked executable!
  If it is supposed to be executable, try: `chmod +x dev-run.sh`
  If on Windows, you may also need to: `git add --chmod=+x dev-run.sh`
  If it not supposed to be executable, double-check its shebang is wanted.

fix-repo-routes.sh: has a shebang but is not marked executable!
  If it is supposed to be executable, try: `chmod +x fix-repo-routes.sh`
  If on Windows, you may also need to: `git add --chmod=+x fix-repo-routes.sh`
  If it not supposed to be executable, double-check its shebang is wanted.

fix-spa-routing.sh: has a shebang but is not marked executable!
  If it is supposed to be executable, try: `chmod +x fix-spa-routing.sh`
  If on Windows, you may also need to: `git add --chmod=+x fix-spa-routing.sh`
  If it not supposed to be executable, double-check its shebang is wanted.

quick-fix-deploy.sh: has a shebang but is not marked executable!
  If it is supposed to be executable, try: `chmod +x quick-fix-deploy.sh`
  If on Windows, you may also need to: `git add --chmod=+x quick-fix-deploy.sh`
  If it not supposed to be executable, double-check its shebang is wanted.

update-production.sh: has a shebang but is not marked executable!
  If it is supposed to be executable, try: `chmod +x update-production.sh`
  If on Windows, you may also need to: `git add --chmod=+x update-production.sh`
  If it not supposed to be executable, double-check its shebang is wanted.

shellcheck...............................................................Failed
- hook id: shellcheck
- exit code: 1

In manual-deploy.sh line 5:
PRODUCTION_DIR="/opt/gitops"
^------------^ SC2034 (warning): PRODUCTION_DIR appears unused. Verify use (or export if used externally).


In manual-deploy.sh line 8:
LOG_DIR="logs"
^-----^ SC2034 (warning): LOG_DIR appears unused. Verify use (or export if used externally).


In scripts/deploy.sh line 16:
RED='\033[0;31m'
^-^ SC2034 (warning): RED appears unused. Verify use (or export if used externally).


In scripts/pre-commit-mcp.sh line 84:
        return validate_with_fallback "$file_path" "$file_type"
               ^--------------------^ SC2151 (error): Only one integer 0-255 can be returned. Use stdout for other data.


In scripts/provision-lxc.sh line 2:
source <(curl -s https://raw.githubusercontent.com/festion/homelab-gitops-auditor/main/scripts/build.func)
       ^-- SC1090 (warning): ShellCheck can't follow non-constant source. Use a directive to specify location.


In scripts/provision-lxc.sh line 5:
var_tags="dashboard;gitops"
^------^ SC2034 (warning): var_tags appears unused. Verify use (or export if used externally).


In scripts/provision-lxc.sh line 6:
var_cpu="2"
^-----^ SC2034 (warning): var_cpu appears unused. Verify use (or export if used externally).


In scripts/provision-lxc.sh line 7:
var_ram="512"
^-----^ SC2034 (warning): var_ram appears unused. Verify use (or export if used externally).


In scripts/provision-lxc.sh line 8:
var_disk="4"
^------^ SC2034 (warning): var_disk appears unused. Verify use (or export if used externally).


In scripts/provision-lxc.sh line 9:
var_os="debian"
^----^ SC2034 (warning): var_os appears unused. Verify use (or export if used externally).


In scripts/provision-lxc.sh line 10:
var_version="12"
^---------^ SC2034 (warning): var_version appears unused. Verify use (or export if used externally).


In scripts/provision-lxc.sh line 11:
var_unprivileged="1"
^--------------^ SC2034 (warning): var_unprivileged appears unused. Verify use (or export if used externally).


In scripts/serena-orchestration.sh line 25:
SERENA_CONFIG="$PROJECT_ROOT/.serena"
^-----------^ SC2034 (warning): SERENA_CONFIG appears unused. Verify use (or export if used externally).


In scripts/serena-orchestration.sh line 215:
    local audit_file="$PROJECT_ROOT/output/audit-$(date +%Y%m%d_%H%M%S).json"
          ^--------^ SC2155 (warning): Declare and assign separately to avoid masking return values.


In scripts/serena-orchestration.sh line 260:
    local sync_report="$PROJECT_ROOT/output/sync-$(date +%Y%m%d_%H%M%S).json"
          ^---------^ SC2155 (warning): Declare and assign separately to avoid masking return values.


In scripts/serena-orchestration.sh line 300:
    local package_name="gitops-auditor-${environment}-$(date +%Y%m%d_%H%M%S).tar.gz"
          ^----------^ SC2155 (warning): Declare and assign separately to avoid masking return values.


In scripts/serena-orchestration.sh line 311:
    local version_tag="v$(date +%Y.%m.%d-%H%M%S)"
          ^---------^ SC2034 (warning): version_tag appears unused. Verify use (or export if used externally).
          ^---------^ SC2155 (warning): Declare and assign separately to avoid masking return values.


In scripts/sync_github_repos_mcp.sh line 285:
    local audit_results=()
          ^-----------^ SC2034 (warning): audit_results appears unused. Verify use (or export if used externally).


In scripts/sync_github_repos_mcp.sh line 345:
        has_uncommitted=true
        ^-------------^ SC2034 (warning): has_uncommitted appears unused. Verify use (or export if used externally).


In scripts/validate-codebase-mcp.sh line 162:
    return $([ "$validation_passed" = true ] && echo 0 || echo 1)
           ^-- SC2046 (warning): Quote this to prevent word splitting.


In scripts/validate-codebase-mcp.sh line 201:
    return $([ "$validation_passed" = true ] && echo 0 || echo 1)
           ^-- SC2046 (warning): Quote this to prevent word splitting.


In scripts/validate-codebase-mcp.sh line 240:
    return $([ "$validation_passed" = true ] && echo 0 || echo 1)
           ^-- SC2046 (warning): Quote this to prevent word splitting.


In setup-linting.sh line 174:
          EOF
^-- SC1039 (error): Remove indentation before end token (or use <<- and indent with tabs).

For more information:
  https://www.shellcheck.net/wiki/SC1039 -- Remove indentation before end tok...
  https://www.shellcheck.net/wiki/SC2151 -- Only one integer 0-255 can be ret...
  https://www.shellcheck.net/wiki/SC1090 -- ShellCheck can't follow non-const...

black....................................................................Failed
- hook id: black
- exit code: 123
- files were modified by this hook

error: cannot format scripts/sync_npm_to_adguard.py: Cannot parse: 11:0: <<<<<<< HEAD
reformatted scripts/generate_adguard_rewrites_from_sqlite.py

Oh no! 💥 💔 💥
1 file reformatted, 1 file failed to reformat.

isort....................................................................Failed
- hook id: isort
- files were modified by this hook

Fixing /home/runner/work/homelab-gitops-auditor/homelab-gitops-auditor/scripts/generate_adguard_rewrites_from_sqlite.py
Fixing /home/runner/work/homelab-gitops-auditor/homelab-gitops-auditor/scripts/sync_npm_to_adguard.py

flake8...................................................................Failed
- hook id: flake8
- exit code: 1

scripts/sync_npm_to_adguard.py:18:11: E999 SyntaxError: invalid decimal literal

prettier.................................................................Failed
- hook id: prettier
- exit code: 2
- files were modified by this hook

.github/workflows/deploy.yml
dashboard/src/main.tsx
scripts/output/GitRepoReport.md
CLAUDE.md
.github/workflows/lint-and-test.yml
README.md
dashboard/postcss.config.js
dashboard/vite.config.ts
dashboard/src/App.tsx
dashboard/tsconfig.app.json
docs/WINDOWS_SETUP.md
.github/workflows/gitops-audit.yml
docs/v1.0.4-routing-fixes.md
docs/CODE_QUALITY.md
modules/GitHubActionsTools/README.md
.pre-commit-config.yaml
.last_adguard_dry_run.json
api/github-mcp-manager.js
dashboard/README.md
.github/workflows/code-quality.yml
dashboard/src/App.css
api/server-v2.js
dashboard/eslint.config.js
dashboard/tsconfig.node.json
docs/GITHUB_PAT_SETUP.md
docs/spa-routing.md
dashboard/src/pages/home.tsx
.github/workflows/security-scan.yml
dashboard/tailwind.config.js
dashboard/src/statusMeta.ts
dashboard/tsconfig.json
[error] simple-tailwind.css: SyntaxError: CssSyntaxError: Unknown word (4:1)
[error]   2 | @tailwind components;
[error]   3 | @tailwind utilities;
[error] > 4 | EOF < /dev/null
[error]     | ^
[error]   5 |
dashboard/src/components/SidebarLayout.tsx
DEVELOPMENT.md
PHASE1-COMPLETION.md
CHANGELOG.md
dashboard/src/pages/roadmap.tsx
.serena/project.yml
dashboard/src/pages/audit.tsx
dashboard/src/vite-env.d.ts
dashboard/src/App.jsx
PRODUCTION.md
.eslintrc.js
api/server.js

eslint...................................................................Failed
- hook id: eslint
- exit code: 2

Oops! Something went wrong! :(

ESLint: 8.44.0

ESLint couldn't find the config "@ljharb" to extend from. Please check that the name of the config is correct.

The config "@ljharb" was referenced from the config file in "/home/runner/work/homelab-gitops-auditor/homelab-gitops-auditor/api/node_modules/side-channel/.eslintrc".

If you still have problems, please stop by https://eslint.org/chat/help to chat with the team.


Oops! Something went wrong! :(

ESLint: 8.44.0

ESLint couldn't find the config "@ljharb" to extend from. Please check that the name of the config is correct.

The config "@ljharb" was referenced from the config file in "/home/runner/work/homelab-gitops-auditor/homelab-gitops-auditor/api/node_modules/math-intrinsics/.eslintrc".

If you still have problems, please stop by https://eslint.org/chat/help to chat with the team.

Detect secrets...........................................................Failed
- hook id: detect-secrets
- exit code: 2

usage: detect-secrets-hook [-h] [-v] [--version] [-C <path>] [-c NUM_CORES]
                           [--json] [--baseline FILENAME] [--list-all-plugins]
                           [-p PLUGIN] [--base64-limit [BASE64_LIMIT]]
                           [--hex-limit [HEX_LIMIT]]
                           [--disable-plugin DISABLE_PLUGIN]
                           [-n | --only-verified]
                           [--exclude-lines EXCLUDE_LINES]
                           [--exclude-files EXCLUDE_FILES]
                           [--exclude-secrets EXCLUDE_SECRETS] [-f FILTER]
                           [--disable-filter DISABLE_FILTER]
                           [filenames ...]
detect-secrets-hook: error: argument --baseline: Invalid path: .secrets.baseline
usage: detect-secrets-hook [-h] [-v] [--version] [-C <path>] [-c NUM_CORES]
                           [--json] [--baseline FILENAME] [--list-all-plugins]
                           [-p PLUGIN] [--base64-limit [BASE64_LIMIT]]
                           [--hex-limit [HEX_LIMIT]]
                           [--disable-plugin DISABLE_PLUGIN]
                           [-n | --only-verified]
                           [--exclude-lines EXCLUDE_LINES]
                           [--exclude-files EXCLUDE_FILES]
                           [--exclude-secrets EXCLUDE_SECRETS] [-f FILTER]
                           [--disable-filter DISABLE_FILTER]
                           [filenames ...]
detect-secrets-hook: error: argument --baseline: Invalid path: .secrets.baseline

pre-commit hook(s) made changes.
If you are seeing this message in CI, reproduce locally with: `pre-commit run --all-files`.
To run `pre-commit` as part of git workflow, use `pre-commit install`.
All changes made by hooks:
diff --git a/.eslintrc.js b/.eslintrc.js
index 22aa780..3a39802 100644
--- a/.eslintrc.js
+++ b/.eslintrc.js
@@ -1,10 +1,6 @@
 module.exports = {
   parser: '@typescript-eslint/parser',
-  extends: [
-    'eslint:recommended',
-    '@typescript-eslint/recommended',
-    'prettier'
-  ],
+  extends: ['eslint:recommended', '@typescript-eslint/recommended', 'prettier'],
   plugins: ['@typescript-eslint', 'prettier'],
   parserOptions: {
     ecmaVersion: 2020,
@@ -13,7 +9,7 @@ module.exports = {
   env: {
     node: true,
     es6: true,
-    browser: true
+    browser: true,
   },
   rules: {
     'prettier/prettier': 'error',
@@ -39,6 +35,6 @@ module.exports = {
     'frontend/node_modules/',
     'dashboard/dist/',
     'dashboard/node_modules/',
-    'gitops_deploy_*.tar.gz'
-  ]
+    'gitops_deploy_*.tar.gz',
+  ],
 };
diff --git a/.github/workflows/code-quality.yml b/.github/workflows/code-quality.yml
index a462fd1..51819db 100755
--- a/.github/workflows/code-quality.yml
+++ b/.github/workflows/code-quality.yml
@@ -2,9 +2,9 @@ name: Code Quality Check
 
 on:
   push:
-    branches: [ main, develop ]
+    branches: [main, develop]
   pull_request:
-    branches: [ main, develop ]
+    branches: [main, develop]
   workflow_dispatch:
 
 jobs:
@@ -47,7 +47,7 @@ jobs:
           echo "\`\`\`" >> quality-report.md
           cat quality-results.txt >> quality-report.md
           echo "\`\`\`" >> quality-report.md
-          
+
           mkdir -p output
           cp quality-report.md output/CodeQualityReport.md
 
diff --git a/.github/workflows/deploy.yml b/.github/workflows/deploy.yml
index 42ba5ab..10c91a8 100755
--- a/.github/workflows/deploy.yml
+++ b/.github/workflows/deploy.yml
@@ -2,8 +2,8 @@ name: Deploy to Production
 
 on:
   push:
-    branches: [ main ]
-    tags: [ 'v*' ]
+    branches: [main]
+    tags: ['v*']
   workflow_dispatch:
     inputs:
       environment:
@@ -12,69 +12,69 @@ on:
         default: 'production'
         type: choice
         options:
-        - production
-        - staging
+          - production
+          - staging
 
 jobs:
   deploy:
     runs-on: ubuntu-latest
     environment: ${{ github.event.inputs.environment || 'production' }}
-    
+
     steps:
-    - name: Checkout repository
-      uses: actions/checkout@v4
-      
-    - name: Use Node.js 20.x
-      uses: actions/setup-node@v4
-      with:
-        node-version: '20.x'
-        cache: 'npm'
-    
-    - name: Install dependencies (API)
-      run: |
-        cd api
-        npm ci --only=production
-    
-    - name: Install dependencies (Dashboard)
-      run: |
-        cd dashboard
-        npm ci
-    
-    - name: Build Dashboard for production
-      run: |
-        cd dashboard
-        npm run build
-    
-    - name: Create deployment package
-      run: |
-        tar -czf homelab-gitops-auditor-${{ github.sha }}.tar.gz \
-          --exclude='.git' \
-          --exclude='node_modules' \
-          --exclude='*.tar.gz' \
-          .
-    
-    - name: Upload deployment artifact
-      uses: actions/upload-artifact@v4
-      with:
-        name: deployment-package-${{ github.sha }}
-        path: homelab-gitops-auditor-${{ github.sha }}.tar.gz
-        retention-days: 30
-    
-    - name: Deploy to homelab
-      run: |
-        echo "Deployment package created: homelab-gitops-auditor-${{ github.sha }}.tar.gz"
-        echo "Manual deployment steps:"
-        echo "1. Download artifact"
-        echo "2. Transfer to homelab server"
-        echo "3. Run: bash scripts/deploy.sh"
-    
-    - name: Create GitHub release (on tag)
-      if: startsWith(github.ref, 'refs/tags/v')
-      uses: actions/create-release@v1
-      env:
-        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
-      with:
-        tag_name: ${{ github.ref }}
-        release_name: Release ${{ github.ref }}
-        draft: false
-        prerelease: false
+      - name: Checkout repository
+        uses: actions/checkout@v4
+
+      - name: Use Node.js 20.x
+        uses: actions/setup-node@v4
+        with:
+          node-version: '20.x'
+          cache: 'npm'
+
+      - name: Install dependencies (API)
+        run: |
+          cd api
+          npm ci --only=production
+
+      - name: Install dependencies (Dashboard)
+        run: |
+          cd dashboard
+          npm ci
+
+      - name: Build Dashboard for production
+        run: |
+          cd dashboard
+          npm run build
+
+      - name: Create deployment package
+        run: |
+          tar -czf homelab-gitops-auditor-${{ github.sha }}.tar.gz \
+            --exclude='.git' \
+            --exclude='node_modules' \
+            --exclude='*.tar.gz' \
+            .
+
+      - name: Upload deployment artifact
+        uses: actions/upload-artifact@v4
+        with:
+          name: deployment-package-${{ github.sha }}
+          path: homelab-gitops-auditor-${{ github.sha }}.tar.gz
+          retention-days: 30
+
+      - name: Deploy to homelab
+        run: |
+          echo "Deployment package created: homelab-gitops-auditor-${{ github.sha }}.tar.gz"
+          echo "Manual deployment steps:"
+          echo "1. Download artifact"
+          echo "2. Transfer to homelab server"
+          echo "3. Run: bash scripts/deploy.sh"
+
+      - name: Create GitHub release (on tag)
+        if: startsWith(github.ref, 'refs/tags/v')
+        uses: actions/create-release@v1
+        env:
+          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
+        with:
+          tag_name: ${{ github.ref }}
+          release_name: Release ${{ github.ref }}
+          draft: false
+          prerelease: false
diff --git a/.github/workflows/gitops-audit.yml b/.github/workflows/gitops-audit.yml
index 59aa474..23254df 100755
--- a/.github/workflows/gitops-audit.yml
+++ b/.github/workflows/gitops-audit.yml
@@ -2,9 +2,9 @@ name: GitOps Audit and Quality Check
 
 on:
   push:
-    branches: [ main, develop ]
+    branches: [main, develop]
   pull_request:
-    branches: [ main ]
+    branches: [main]
   schedule:
     # Run daily at 3:00 AM UTC
     - cron: '0 3 * * *'
@@ -61,7 +61,7 @@ jobs:
           # Install shellcheck for shell script validation
           sudo apt-get update
           sudo apt-get install -y shellcheck
-          
+
           # Check all shell scripts
           find scripts -name "*.sh" -type f -exec shellcheck {} \;
 
@@ -87,15 +87,15 @@ jobs:
         run: |
           # Create simulation of C:\GIT structure for testing
           mkdir -p /tmp/git-simulation
-          
+
           # Simulate some repositories
           git clone --depth 1 https://github.com/festion/homelab-gitops-auditor.git /tmp/git-simulation/homelab-gitops-auditor
           git clone --depth 1 https://github.com/festion/ESPHome.git /tmp/git-simulation/ESPHome || true
-          
+
           # Modify script to use simulation directory
           sed 's|LOCAL_GIT_ROOT="/mnt/c/GIT"|LOCAL_GIT_ROOT="/tmp/git-simulation"|g' scripts/comprehensive_audit.sh > /tmp/audit_test.sh
           chmod +x /tmp/audit_test.sh
-          
+
           # Run the audit script
           bash /tmp/audit_test.sh --dev
 
@@ -124,7 +124,7 @@ jobs:
           cd dashboard
           npm ci
           npm audit --audit-level=moderate
-          
+
           cd ../api
           npm ci
           npm audit --audit-level=moderate
@@ -162,24 +162,24 @@ jobs:
           if [ -f "audit-history/latest.json" ]; then
             # Extract health status
             health_status=$(jq -r '.health_status' audit-history/latest.json)
-            
+
             if [ "$health_status" != "green" ]; then
               # Create issue for audit findings
               issue_title="🔍 GitOps Audit Findings - $(date +%Y-%m-%d)"
               issue_body="## Repository Audit Results\n\n"
               issue_body+="**Health Status:** $health_status\n\n"
-              
+
               # Add summary
               summary=$(jq -r '.summary' audit-history/latest.json)
               issue_body+="### Summary\n\`\`\`json\n$summary\n\`\`\`\n\n"
-              
+
               # Add mitigation actions
               issue_body+="### Recommended Actions\n"
               issue_body+="Please review the audit dashboard and take appropriate actions.\n\n"
               issue_body+="**Production Dashboard:** [View Audit Results](http://192.168.1.58/audit)\n"
               issue_body+="**Local Dashboard:** [View Local Results](http://gitopsdashboard.local/audit)\n\n"
               issue_body+="This issue was automatically created by the GitOps Audit workflow."
-              
+
               # Create the issue using GitHub CLI
               echo "$issue_body" | gh issue create \
                 --title "$issue_title" \
@@ -187,4 +187,4 @@ jobs:
                 --label "audit,automation" \
                 --assignee "@me"
             fi
-          fi
\ No newline at end of file
+          fi
diff --git a/.github/workflows/lint-and-test.yml b/.github/workflows/lint-and-test.yml
index c747b8f..95fa5ed 100755
--- a/.github/workflows/lint-and-test.yml
+++ b/.github/workflows/lint-and-test.yml
@@ -2,67 +2,67 @@ name: Lint and Test
 
 on:
   pull_request:
-    branches: [ main, develop ]
+    branches: [main, develop]
   push:
-    branches: [ main, develop ]
+    branches: [main, develop]
 
 jobs:
   lint-and-test:
     runs-on: ubuntu-latest
-    
+
     strategy:
       matrix:
         node-version: [20.x]
-    
+
     steps:
-    - name: Checkout repository
-      uses: actions/checkout@v4
-      
-    - name: Use Node.js ${{ matrix.node-version }}
-      uses: actions/setup-node@v4
-      with:
-        node-version: ${{ matrix.node-version }}
-        cache: 'npm'
-    
-    - name: Install dependencies (API)
-      run: |
-        cd api
-        npm ci
-    
-    - name: Install dependencies (Dashboard)
-      run: |
-        cd dashboard
-        npm ci
-    
-    - name: Lint API code
-      run: |
-        cd api
-        npm run lint
-    
-    - name: Lint Dashboard code
-      run: |
-        cd dashboard
-        npm run lint
-    
-    - name: TypeScript compilation check
-      run: |
-        cd dashboard
-        npx tsc --noEmit
-    
-    - name: Test API endpoints
-      run: |
-        cd api
-        npm test
-    
-    - name: Build Dashboard
-      run: |
-        cd dashboard
-        npm run build
-        
-    - name: Run audit script validation
-      run: |
-        bash scripts/sync_github_repos.sh --dry-run
-        
-    - name: Code quality gate
-      run: |
-        echo "All linting and tests passed successfully"
+      - name: Checkout repository
+        uses: actions/checkout@v4
+
+      - name: Use Node.js ${{ matrix.node-version }}
+        uses: actions/setup-node@v4
+        with:
+          node-version: ${{ matrix.node-version }}
+          cache: 'npm'
+
+      - name: Install dependencies (API)
+        run: |
+          cd api
+          npm ci
+
+      - name: Install dependencies (Dashboard)
+        run: |
+          cd dashboard
+          npm ci
+
+      - name: Lint API code
+        run: |
+          cd api
+          npm run lint
+
+      - name: Lint Dashboard code
+        run: |
+          cd dashboard
+          npm run lint
+
+      - name: TypeScript compilation check
+        run: |
+          cd dashboard
+          npx tsc --noEmit
+
+      - name: Test API endpoints
+        run: |
+          cd api
+          npm test
+
+      - name: Build Dashboard
+        run: |
+          cd dashboard
+          npm run build
+
+      - name: Run audit script validation
+        run: |
+          bash scripts/sync_github_repos.sh --dry-run
+
+      - name: Code quality gate
+        run: |
+          echo "All linting and tests passed successfully"
diff --git a/.github/workflows/security-scan.yml b/.github/workflows/security-scan.yml
index ff1f0e5..06d2e67 100755
--- a/.github/workflows/security-scan.yml
+++ b/.github/workflows/security-scan.yml
@@ -2,9 +2,9 @@ name: Security Scan
 
 on:
   push:
-    branches: [ main, develop ]
+    branches: [main, develop]
   pull_request:
-    branches: [ main, develop ]
+    branches: [main, develop]
   schedule:
     # Run security scan daily at 2 AM UTC
     - cron: '0 2 * * *'
@@ -12,69 +12,69 @@ on:
 jobs:
   security-scan:
     runs-on: ubuntu-latest
-    
+
     steps:
-    - name: Checkout repository
-      uses: actions/checkout@v4
-      
-    - name: Use Node.js 20.x
-      uses: actions/setup-node@v4
-      with:
-        node-version: '20.x'
-        cache: 'npm'
-    
-    - name: Install dependencies (API)
-      run: |
-        cd api
-        npm ci
-    
-    - name: Install dependencies (Dashboard)
-      run: |
-        cd dashboard
-        npm ci
-    
-    - name: Run npm audit (API)
-      run: |
-        cd api
-        npm audit --audit-level moderate
-      continue-on-error: true
-    
-    - name: Run npm audit (Dashboard)
-      run: |
-        cd dashboard
-        npm audit --audit-level moderate
-      continue-on-error: true
-    
-    - name: Security scan with Snyk
-      uses: snyk/actions/node@master
-      env:
-        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
-      with:
-        args: --severity-threshold=high
-      continue-on-error: true
-    
-    - name: Run CodeQL Analysis
-      if: github.event_name != 'schedule'
-      uses: github/codeql-action/init@v3
-      with:
-        languages: javascript
-    
-    - name: Perform CodeQL Analysis
-      if: github.event_name != 'schedule'
-      uses: github/codeql-action/analyze@v3
-    
-    - name: Scan shell scripts with ShellCheck
-      run: |
-        sudo apt-get update
-        sudo apt-get install -y shellcheck
-        find scripts -name "*.sh" -exec shellcheck {} \;
-      continue-on-error: true
-    
-    - name: Check for secrets in code
-      uses: trufflesecurity/trufflehog@main
-      with:
-        path: ./
-        base: main
-        head: HEAD
-        extra_args: --debug --only-verified
-      continue-on-error: true
+      - name: Checkout repository
+        uses: actions/checkout@v4
+
+      - name: Use Node.js 20.x
+        uses: actions/setup-node@v4
+        with:
+          node-version: '20.x'
+          cache: 'npm'
+
+      - name: Install dependencies (API)
+        run: |
+          cd api
+          npm ci
+
+      - name: Install dependencies (Dashboard)
+        run: |
+          cd dashboard
+          npm ci
+
+      - name: Run npm audit (API)
+        run: |
+          cd api
+          npm audit --audit-level moderate
+        continue-on-error: true
+
+      - name: Run npm audit (Dashboard)
+        run: |
+          cd dashboard
+          npm audit --audit-level moderate
+        continue-on-error: true
+
+      - name: Security scan with Snyk
+        uses: snyk/actions/node@master
+        env:
+          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
+        with:
+          args: --severity-threshold=high
+        continue-on-error: true
+
+      - name: Run CodeQL Analysis
+        if: github.event_name != 'schedule'
+        uses: github/codeql-action/init@v3
+        with:
+          languages: javascript
+
+      - name: Perform CodeQL Analysis
+        if: github.event_name != 'schedule'
+        uses: github/codeql-action/analyze@v3
+
+      - name: Scan shell scripts with ShellCheck
+        run: |
+          sudo apt-get update
+          sudo apt-get install -y shellcheck
+          find scripts -name "*.sh" -exec shellcheck {} \;
+        continue-on-error: true
+
+      - name: Check for secrets in code
+        uses: trufflesecurity/trufflehog@main
+        with:
+          path: ./
+          base: main
+          head: HEAD
+          extra_args: --debug --only-verified
+        continue-on-error: true
diff --git a/.last_adguard_dry_run.json b/.last_adguard_dry_run.json
index 8a473f2..8805a45 100644
--- a/.last_adguard_dry_run.json
+++ b/.last_adguard_dry_run.json
@@ -1,5 +1,5 @@
-{
-  "to_add": [],
-  "to_remove": [],
-  "timestamp": "2025-04-17T16:55:06.589731"
-}
\ No newline at end of file
+{
+  "to_add": [],
+  "to_remove": [],
+  "timestamp": "2025-04-17T16:55:06.589731"
+}
diff --git a/.pre-commit-config.yaml b/.pre-commit-config.yaml
index c944620..7044e75 100644
--- a/.pre-commit-config.yaml
+++ b/.pre-commit-config.yaml
@@ -37,7 +37,7 @@ repos:
     rev: 5.12.0
     hooks:
       - id: isort
-        args: ["--profile", "black"]
+        args: ['--profile', 'black']
 
   - repo: https://github.com/pycqa/flake8
     rev: 6.0.0
@@ -87,8 +87,8 @@ repos:
           )
         additional_dependencies:
           - eslint@8.44.0
-          - "@typescript-eslint/eslint-plugin@6.0.0"
-          - "@typescript-eslint/parser@6.0.0"
+          - '@typescript-eslint/eslint-plugin@6.0.0'
+          - '@typescript-eslint/parser@6.0.0'
           - eslint-config-prettier@8.8.0
           - eslint-plugin-prettier@5.0.0
 
diff --git a/.serena/project.yml b/.serena/project.yml
index 295d761..c99b29b 100644
--- a/.serena/project.yml
+++ b/.serena/project.yml
@@ -1,6 +1,6 @@
 # absolute path to the project you want Serena to work on (where all the source code, etc. is located)
 # This is optional if this file is placed in the project directory under `.serena/project.yml`.
-project_root: 
+project_root:
 
 # language of the project (csharp, python, rust, java, typescript, javascript, go, cpp, or ruby)
 # Special requirements:
@@ -21,10 +21,9 @@ ignored_paths: []
 # Added on 2025-04-18
 read_only: false
 
-
 # list of tool names to exclude. We recommend not excluding any tools, see the readme for more details.
 # Below is the complete list of tools for convenience.
-# To make sure you have the latest list of tools, and to view their descriptions, 
+# To make sure you have the latest list of tools, and to view their descriptions,
 # execute `uv run scripts/print_tool_overview.py`.
 #
 #  * `activate_project`: Activates a project by name.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index 5eccf92..3534c59 100644
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -1,50 +1,61 @@
-# Changelog
-
-## [v1.0.4] - 2025-05-09
-### Fixed
-- Fixed repository-specific view routing with proper React Router configuration
-- Fixed dashboard links to use relative URLs instead of hardcoded domain
-- Improved SPA routing with HTML5 History API support
-- Fixed API connection issues in production environment
-- Added auto-scrolling to repository when accessing via direct URL
-
-### Added
-- Support for `/audit/:repo?action=view` routes
-- Visual highlight for currently selected repository
-- Deployment script to update production environment
-
-## [v1.0.3] - 2025-05-09
-### Fixed
-- Fixed dashboard build process to correctly generate dist directory
-- Fixed API data handling in React components to match API response format
-- Added API proxy configuration in vite.config.ts to resolve CORS issues
-- Improved error handling for data fetching in the dashboard
-
-### Added
-- Enhanced error states with better user feedback
-- Status indicator with color-coded dashboard health states
-
-## [v1.0.2] - 2025-05-09
-### Changed
-- Updated installation instructions to work without Nginx
-- Added port configuration option for running on port 8080
-- Improved manual deployment script to support custom configurations
-
-## [v1.0.1] - 2025-05-09
-### Fixed
-- Dashboard compatibility with Node.js 18 (downgraded React from v19 to v18.2.0)
-- Tailwind CSS configuration for better compatibility
-- TypeScript configuration to prevent build errors
-- Added manual deployment package generation via manual-deploy.sh
-
-## [v1.0.0] - 2025-04-17
-### Added
-- AdGuard DNS sync tool:
-  - `fetch_npm_config.sh`: Extracts NPM's `database.sqlite`
-  - `generate_adguard_rewrites_from_sqlite.py`: Generates and syncs AdGuard DNS rewrites for `*.internal.lakehouse.wtf`
-  - `gitops_dns_sync.sh`: Master runner for scheduled syncing
-- Enforced dry-run before commit
-- Log output for every step with timestamps
-- Cron job setup: `/etc/cron.d/gitops-schedule` runs nightly at 3AM
-- Snapshot auto-naming and log rotation ready
-
+# Changelog
+
+## [v1.0.4] - 2025-05-09
+
+### Fixed
+
+- Fixed repository-specific view routing with proper React Router configuration
+- Fixed dashboard links to use relative URLs instead of hardcoded domain
+- Improved SPA routing with HTML5 History API support
+- Fixed API connection issues in production environment
+- Added auto-scrolling to repository when accessing via direct URL
+
+### Added
+
+- Support for `/audit/:repo?action=view` routes
+- Visual highlight for currently selected repository
+- Deployment script to update production environment
+
+## [v1.0.3] - 2025-05-09
+
+### Fixed
+
+- Fixed dashboard build process to correctly generate dist directory
+- Fixed API data handling in React components to match API response format
+- Added API proxy configuration in vite.config.ts to resolve CORS issues
+- Improved error handling for data fetching in the dashboard
+
+### Added
+
+- Enhanced error states with better user feedback
+- Status indicator with color-coded dashboard health states
+
+## [v1.0.2] - 2025-05-09
+
+### Changed
+
+- Updated installation instructions to work without Nginx
+- Added port configuration option for running on port 8080
+- Improved manual deployment script to support custom configurations
+
+## [v1.0.1] - 2025-05-09
+
+### Fixed
+
+- Dashboard compatibility with Node.js 18 (downgraded React from v19 to v18.2.0)
+- Tailwind CSS configuration for better compatibility
+- TypeScript configuration to prevent build errors
+- Added manual deployment package generation via manual-deploy.sh
+
+## [v1.0.0] - 2025-04-17
+
+### Added
+
+- AdGuard DNS sync tool:
+  - `fetch_npm_config.sh`: Extracts NPM's `database.sqlite`
+  - `generate_adguard_rewrites_from_sqlite.py`: Generates and syncs AdGuard DNS rewrites for `*.internal.lakehouse.wtf`
+  - `gitops_dns_sync.sh`: Master runner for scheduled syncing
+- Enforced dry-run before commit
+- Log output for every step with timestamps
+- Cron job setup: `/etc/cron.d/gitops-schedule` runs nightly at 3AM
+- Snapshot auto-naming and log rotation ready
diff --git a/CLAUDE.md b/CLAUDE.md
index 03183e8..33da615 100644
--- a/CLAUDE.md
+++ b/CLAUDE.md
@@ -1,180 +1,197 @@
-# Homelab GitOps Auditor Documentation
-
-## Project Overview
-
-The Homelab GitOps Auditor is a comprehensive tool designed to monitor, audit, and visualize the health and status of Git repositories in a homelab GitOps environment. It helps identify issues such as uncommitted changes, stale branches, and missing files, presenting the results through an interactive dashboard.
-
-## Key Components
-
-1. **Dashboard Frontend** (`/dashboard/`): 
-   - React-based web interface with charts and visualizations
-   - Shows repository status with filtering capabilities
-   - Auto-refreshing data with configurable intervals
-
-2. **API Backend** (`/api/`):
-   - Express.js server providing API endpoints for dashboard
-   - Handles repository operations (clone, commit, discard changes)
-   - Serves audit report data
-
-3. **Audit Scripts** (`/scripts/`):
-   - Repository synchronization with GitHub (`sync_github_repos.sh`)
-   - DNS synchronization with AdGuard (`gitops_dns_sync.sh`)
-   - Deployment utilities (`deploy.sh`, `install-dashboard.sh`)
-
-4. **Data Storage**:
-   - Audit reports stored in `/output/` as JSON and Markdown
-   - Historical snapshots in `/audit-history/`
-   - NPM proxy snapshots stored for DNS sync operations
-
-## Core Functionality
-
-### 1. Repository Auditing
-
-The system audits Git repositories for:
-- **Uncommitted changes**: Identifies repos with local modifications
-- **Stale tags**: Flags tags pointing to unreachable commits
-- **Missing files**: Detects repos missing key files like README.md
-- **Sync status**: Compares local repos with GitHub to identify missing/extra repos
-
-### 2. Interactive Dashboard
-
-The dashboard provides:
-- Bar and pie charts for overall repository health
-- Repository cards with status indicators
-- Searchable repository list
-- Live auto-refreshing data
-- Ability to switch between local and GitHub data sources
-
-### 3. DNS Sync Automation
-
-The system also handles:
-- Automatic extraction of internal domains from Nginx Proxy Manager
-- Generation of DNS rewrites for AdGuard Home
-- Idempotent sync operations with dry-run capability
-
-## Setup and Usage
-
-### Installation
-
-1. **Dashboard Setup**:
-   ```bash
-   cd /mnt/c/GIT/homelab-gitops-auditor
-   bash scripts/install-dashboard.sh
-   ```
-
-2. **API Setup**:
-   ```bash
-   cd /mnt/c/GIT/homelab-gitops-auditor
-   bash scripts/deploy.sh
-   ```
-
-3. **Cron Configuration**:
-   - Nightly audits run at 3:00 AM
-   - NPM DB snapshots taken at 3:00 AM
-   - DNS rewrites generated immediately after snapshots
-
-### Dashboard Usage
-
-1. **View Repository Status**:
-   - Access dashboard at `http://<your-lxc-ip>/`
-   - Use search box to filter repositories
-   - View health metrics in charts
-
-2. **Configure Auto-Refresh**:
-   - Select refresh interval (5s, 10s, 30s, 60s)
-   - Switch between local and GitHub data sources
-
-3. **Repository Actions**:
-   - Clone missing repositories
-   - Delete extra repositories
-   - Commit or discard changes for dirty repositories
-
-### Manual Tools
-
-1. **Run Manual Audit**:
-   ```bash
-   /opt/gitops/scripts/sync_github_repos.sh
-   ```
-
-2. **Test DNS Sync**:
-   ```bash
-   bash /opt/gitops/scripts/gitops_dns_sync.sh
-   # Or run components separately
-   bash /opt/gitops/scripts/fetch_npm_config.sh
-   python3 /opt/gitops/scripts/generate_adguard_rewrites_from_sqlite.py
-   python3 /opt/gitops/scripts/generate_adguard_rewrites_from_sqlite.py --commit
-   ```
-
-## Troubleshooting
-
-### Common Issues
-
-1. **Dashboard Not Displaying**:
-   - Check for CSS generation issues (`npm run tw:watch`)
-   - Verify JSON data exists in `/output/GitRepoReport.json`
-   - Check browser console for JavaScript errors
-   - Ensure API is running and accessible (`systemctl status gitops-audit-api`)
-
-2. **No Repositories Showing**:
-   - Ensure `/repos` directory exists and contains Git repositories
-   - Verify `/output/GitRepoReport.json` is valid and contains data
-   - Check output of manual audit run
-
-3. **API Connection Issues**:
-   - Verify API port (3070) is not blocked by firewall
-   - Check API service is running (`systemctl status gitops-audit-api`)
-   - Check logs for connection errors
-
-4. **DNS Sync Failures**:
-   - Examine logs in `/opt/gitops/logs/`
-   - Verify AdGuard API credentials and connectivity
-   - Check NPM container is accessible
-
-## Future Enhancements
-
-### Planned Features
-
-1. **Dashboard Improvements**:
-   - Add WebSocket real-time updates
-   - Implement dark mode toggle
-   - Add repository history visualization
-   - Create detailed diff viewer
-
-2. **API Enhancements**:
-   - Add authentication layer
-   - Implement webhook notifications
-   - Support GitHub API integration for remote operations
-   - Add repository restore capabilities
-
-3. **Auditing Features**:
-   - Add more health metrics (commit frequency, branch age)
-   - Implement security scanning
-   - Add config drift detection
-   - Support for multiple Git providers (GitLab, Bitbucket)
-
-4. **System Integration**:
-   - Email notifications on critical issues
-   - Slack/Discord webhook integration
-   - CI/CD pipeline integration
-   - Kubernetes operator for GitOps environments
-
-## Architecture Notes
-
-- The dashboard frontend is built with React, Recharts, and TailwindCSS
-- Data flows from Git repositories → audit scripts → JSON output → API → dashboard
-- Services run in separate containers/LXCs for isolation
-- Configuration stored in Git for version control
-
-## Component Versions
-
-- React: ^19.0.0
-- Express: Latest
-- Tailwind CSS: ^4.0.15
-- Node.js: v20+ recommended for optimal compatibility
-
-## Known Limitations
-
-- Limited to Git repositories only (no Mercurial or SVN)
-- Does not support multiple organization monitoring yet
-- Credentials stored in script files rather than secure vault
-- No multi-user support or role-based access control
\ No newline at end of file
+# Homelab GitOps Auditor Documentation
+
+## Project Overview
+
+The Homelab GitOps Auditor is a comprehensive tool designed to monitor, audit, and visualize the health and status of Git repositories in a homelab GitOps environment. It helps identify issues such as uncommitted changes, stale branches, and missing files, presenting the results through an interactive dashboard.
+
+## Key Components
+
+1. **Dashboard Frontend** (`/dashboard/`):
+
+   - React-based web interface with charts and visualizations
+   - Shows repository status with filtering capabilities
+   - Auto-refreshing data with configurable intervals
+
+2. **API Backend** (`/api/`):
+
+   - Express.js server providing API endpoints for dashboard
+   - Handles repository operations (clone, commit, discard changes)
+   - Serves audit report data
+
+3. **Audit Scripts** (`/scripts/`):
+
+   - Repository synchronization with GitHub (`sync_github_repos.sh`)
+   - DNS synchronization with AdGuard (`gitops_dns_sync.sh`)
+   - Deployment utilities (`deploy.sh`, `install-dashboard.sh`)
+
+4. **Data Storage**:
+   - Audit reports stored in `/output/` as JSON and Markdown
+   - Historical snapshots in `/audit-history/`
+   - NPM proxy snapshots stored for DNS sync operations
+
+## Core Functionality
+
+### 1. Repository Auditing
+
+The system audits Git repositories for:
+
+- **Uncommitted changes**: Identifies repos with local modifications
+- **Stale tags**: Flags tags pointing to unreachable commits
+- **Missing files**: Detects repos missing key files like README.md
+- **Sync status**: Compares local repos with GitHub to identify missing/extra repos
+
+### 2. Interactive Dashboard
+
+The dashboard provides:
+
+- Bar and pie charts for overall repository health
+- Repository cards with status indicators
+- Searchable repository list
+- Live auto-refreshing data
+- Ability to switch between local and GitHub data sources
+
+### 3. DNS Sync Automation
+
+The system also handles:
+
+- Automatic extraction of internal domains from Nginx Proxy Manager
+- Generation of DNS rewrites for AdGuard Home
+- Idempotent sync operations with dry-run capability
+
+## Setup and Usage
+
+### Installation
+
+1. **Dashboard Setup**:
+
+   ```bash
+   cd /mnt/c/GIT/homelab-gitops-auditor
+   bash scripts/install-dashboard.sh
+   ```
+
+2. **API Setup**:
+
+   ```bash
+   cd /mnt/c/GIT/homelab-gitops-auditor
+   bash scripts/deploy.sh
+   ```
+
+3. **Cron Configuration**:
+   - Nightly audits run at 3:00 AM
+   - NPM DB snapshots taken at 3:00 AM
+   - DNS rewrites generated immediately after snapshots
+
+### Dashboard Usage
+
+1. **View Repository Status**:
+
+   - Access dashboard at `http://<your-lxc-ip>/`
+   - Use search box to filter repositories
+   - View health metrics in charts
+
+2. **Configure Auto-Refresh**:
+
+   - Select refresh interval (5s, 10s, 30s, 60s)
+   - Switch between local and GitHub data sources
+
+3. **Repository Actions**:
+   - Clone missing repositories
+   - Delete extra repositories
+   - Commit or discard changes for dirty repositories
+
+### Manual Tools
+
+1. **Run Manual Audit**:
+
+   ```bash
+   /opt/gitops/scripts/sync_github_repos.sh
+   ```
+
+2. **Test DNS Sync**:
+   ```bash
+   bash /opt/gitops/scripts/gitops_dns_sync.sh
+   # Or run components separately
+   bash /opt/gitops/scripts/fetch_npm_config.sh
+   python3 /opt/gitops/scripts/generate_adguard_rewrites_from_sqlite.py
+   python3 /opt/gitops/scripts/generate_adguard_rewrites_from_sqlite.py --commit
+   ```
+
+## Troubleshooting
+
+### Common Issues
+
+1. **Dashboard Not Displaying**:
+
+   - Check for CSS generation issues (`npm run tw:watch`)
+   - Verify JSON data exists in `/output/GitRepoReport.json`
+   - Check browser console for JavaScript errors
+   - Ensure API is running and accessible (`systemctl status gitops-audit-api`)
+
+2. **No Repositories Showing**:
+
+   - Ensure `/repos` directory exists and contains Git repositories
+   - Verify `/output/GitRepoReport.json` is valid and contains data
+   - Check output of manual audit run
+
+3. **API Connection Issues**:
+
+   - Verify API port (3070) is not blocked by firewall
+   - Check API service is running (`systemctl status gitops-audit-api`)
+   - Check logs for connection errors
+
+4. **DNS Sync Failures**:
+   - Examine logs in `/opt/gitops/logs/`
+   - Verify AdGuard API credentials and connectivity
+   - Check NPM container is accessible
+
+## Future Enhancements
+
+### Planned Features
+
+1. **Dashboard Improvements**:
+
+   - Add WebSocket real-time updates
+   - Implement dark mode toggle
+   - Add repository history visualization
+   - Create detailed diff viewer
+
+2. **API Enhancements**:
+
+   - Add authentication layer
+   - Implement webhook notifications
+   - Support GitHub API integration for remote operations
+   - Add repository restore capabilities
+
+3. **Auditing Features**:
+
+   - Add more health metrics (commit frequency, branch age)
+   - Implement security scanning
+   - Add config drift detection
+   - Support for multiple Git providers (GitLab, Bitbucket)
+
+4. **System Integration**:
+   - Email notifications on critical issues
+   - Slack/Discord webhook integration
+   - CI/CD pipeline integration
+   - Kubernetes operator for GitOps environments
+
+## Architecture Notes
+
+- The dashboard frontend is built with React, Recharts, and TailwindCSS
+- Data flows from Git repositories → audit scripts → JSON output → API → dashboard
+- Services run in separate containers/LXCs for isolation
+- Configuration stored in Git for version control
+
+## Component Versions
+
+- React: ^19.0.0
+- Express: Latest
+- Tailwind CSS: ^4.0.15
+- Node.js: v20+ recommended for optimal compatibility
+
+## Known Limitations
+
+- Limited to Git repositories only (no Mercurial or SVN)
+- Does not support multiple organization monitoring yet
+- Credentials stored in script files rather than secure vault
+- No multi-user support or role-based access control
diff --git a/DEVELOPMENT.md b/DEVELOPMENT.md
index e56d951..fe1c036 100644
--- a/DEVELOPMENT.md
+++ b/DEVELOPMENT.md
@@ -31,6 +31,7 @@ We've provided a single script to start all components in development mode:
 ```
 
 This script:
+
 - Creates necessary directories
 - Installs dependencies
 - Starts API server on http://localhost:3070
@@ -67,10 +68,12 @@ bash scripts/sync_github_repos.sh --dev
 In development mode, the GitOps Auditor uses these modifications:
 
 1. **Path adaptations:**
+
    - Uses relative paths based on project root
    - API detects environment and adjusts paths
 
 2. **Data storage:**
+
    - Stores audit history in `./audit-history/` instead of `/opt/gitops/audit-history/`
    - Falls back to static JSON file if no history exists
 
@@ -88,13 +91,13 @@ In development mode, the GitOps Auditor uses these modifications:
 
 The primary differences in development mode:
 
-| Feature | Development | Production |
-|---------|-------------|------------|
-| Base directory | Project folder | `/opt/gitops/` |
-| API Server | Manual start | systemd service |
-| Dashboard | Vite dev server | Static NGINX |
-| API URL | `http://localhost:3070` | Relative paths |
-| Data Persistence | Project folder | `/opt/gitops/audit-history/` |
+| Feature          | Development             | Production                   |
+| ---------------- | ----------------------- | ---------------------------- |
+| Base directory   | Project folder          | `/opt/gitops/`               |
+| API Server       | Manual start            | systemd service              |
+| Dashboard        | Vite dev server         | Static NGINX                 |
+| API URL          | `http://localhost:3070` | Relative paths               |
+| Data Persistence | Project folder          | `/opt/gitops/audit-history/` |
 
 ## Troubleshooting
 
@@ -117,4 +120,4 @@ To deploy everything to production:
 ```bash
 cd /mnt/c/GIT/homelab-gitops-auditor
 bash scripts/deploy.sh
-```
\ No newline at end of file
+```
diff --git a/PHASE1-COMPLETION.md b/PHASE1-COMPLETION.md
index e31d5eb..3fbaaa8 100755
--- a/PHASE1-COMPLETION.md
+++ b/PHASE1-COMPLETION.md
@@ -2,9 +2,9 @@
 
 ## Phase 1 Summary: MCP Server Integration Foundation
 
-**Status:** ✅ **COMPLETED**  
-**Version:** 1.1.0  
-**Implementation Date:** June 14, 2025  
+**Status:** ✅ **COMPLETED**
+**Version:** 1.1.0
+**Implementation Date:** June 14, 2025
 
 ### 🎯 Objectives Achieved
 
@@ -13,7 +13,9 @@ Phase 1 successfully implemented the foundational MCP server integration framewo
 ### 📦 Deliverables Completed
 
 #### 1. ✅ GitHub MCP Integration Foundation
+
 - **GitHub MCP Manager** (`api/github-mcp-manager.js`)
+
   - Comprehensive wrapper for all GitHub operations
   - Replace direct git commands with MCP-coordinated operations
   - Automatic issue creation for audit findings
@@ -25,8 +27,10 @@ Phase 1 successfully implemented the foundational MCP server integration framewo
   - Issue tracking for audit findings
   - Backward compatibility maintained
 
-#### 2. ✅ Code Quality Pipeline with MCP Integration  
+#### 2. ✅ Code Quality Pipeline with MCP Integration
+
 - **Code Quality Validation** (`scripts/validate-codebase-mcp.sh`)
+
   - Comprehensive codebase validation using code-linter MCP server
   - Support for JavaScript, TypeScript, Python, Shell scripts, JSON
   - Automatic fixing capabilities when MCP server supports it
@@ -39,13 +43,16 @@ Phase 1 successfully implemented the foundational MCP server integration framewo
   - Clear error reporting and guidance
 
 #### 3. ✅ Git Actions Configuration
+
 - **Lint and Test Workflow** (`.github/workflows/lint-and-test.yml`)
+
   - Automated testing on pull requests and pushes
   - Code quality gates using MCP validation
   - Multi-environment testing (Node.js 20.x)
   - TypeScript compilation verification
 
 - **Deployment Workflow** (`.github/workflows/deploy.yml`)
+
   - Automated deployment to production
   - Manual deployment triggers with environment selection
   - Artifact creation and management
@@ -58,7 +65,9 @@ Phase 1 successfully implemented the foundational MCP server integration framewo
   - Secret scanning with TruffleHog
 
 #### 4. ✅ Serena Orchestration Framework
+
 - **Orchestration Templates** (`scripts/serena-orchestration.sh`)
+
   - Complete framework for coordinating multiple MCP servers
   - Four core operations: validate-and-commit, audit-and-report, sync-repositories, deploy-workflow
   - Server availability checking and graceful fallbacks
@@ -73,6 +82,7 @@ Phase 1 successfully implemented the foundational MCP server integration framewo
 ### 🔧 Technical Implementation Details
 
 #### MCP Server Integration Architecture
+
 ```
 Serena Orchestrator (Coordinator)
 ├── GitHub MCP Server (Repository Operations)
@@ -94,6 +104,7 @@ Serena Orchestrator (Coordinator)
 ```
 
 #### Fallback Mechanisms
+
 - **GitHub MCP Unavailable:** Direct git command execution
 - **Code-linter MCP Unavailable:** Native linting tools (ESLint, ShellCheck, etc.)
 - **Serena Unavailable:** Individual MCP server operations
@@ -102,12 +113,14 @@ Serena Orchestrator (Coordinator)
 ### 📊 Quality Assurance Results
 
 #### Code Quality Gates
+
 - ✅ All existing code passes validation
-- ✅ Pre-commit hooks prevent quality regressions  
+- ✅ Pre-commit hooks prevent quality regressions
 - ✅ Git Actions enforce quality standards
 - ✅ MCP integration maintains code standards
 
 #### Testing Coverage
+
 - ✅ API endpoints tested with MCP integration
 - ✅ Script functionality verified in development mode
 - ✅ Fallback mechanisms tested and functional
@@ -116,14 +129,16 @@ Serena Orchestrator (Coordinator)
 ### 🔄 Integration Status
 
 #### MCP Servers Ready for Integration
-| Server | Status | Fallback Available | Priority |
-|--------|--------|-------------------|----------|
-| **GitHub MCP** | 🟡 Framework Ready | ✅ Direct Git | High |
-| **Code-linter MCP** | 🟡 Framework Ready | ✅ Native Tools | High |
-| **Serena Orchestrator** | 🟡 Framework Ready | ✅ Direct Calls | Critical |
-| **Filesystem MCP** | 🟢 Local Operations | ✅ Direct FS | Medium |
+
+| Server                  | Status              | Fallback Available | Priority |
+| ----------------------- | ------------------- | ------------------ | -------- |
+| **GitHub MCP**          | 🟡 Framework Ready  | ✅ Direct Git      | High     |
+| **Code-linter MCP**     | 🟡 Framework Ready  | ✅ Native Tools    | High     |
+| **Serena Orchestrator** | 🟡 Framework Ready  | ✅ Direct Calls    | Critical |
+| **Filesystem MCP**      | 🟢 Local Operations | ✅ Direct FS       | Medium   |
 
 #### Next Steps for Full MCP Activation
+
 1. **Install and configure Serena orchestrator**
 2. **Set up GitHub MCP server connection**
 3. **Configure code-linter MCP server**
@@ -133,6 +148,7 @@ Serena Orchestrator (Coordinator)
 ### 📈 Benefits Delivered
 
 #### Immediate Benefits (Phase 1)
+
 - **Enhanced Code Quality:** Comprehensive validation pipeline
 - **Automated Workflows:** Git Actions for CI/CD automation
 - **Audit Automation:** Issue creation for findings
@@ -140,6 +156,7 @@ Serena Orchestrator (Coordinator)
 - **Documentation:** Clear MCP integration patterns
 
 #### Future Benefits (When MCP Fully Activated)
+
 - **Unified Operations:** All operations coordinated through Serena
 - **Advanced Automation:** Cross-server workflows and dependencies
 - **Enhanced Reliability:** Centralized error handling and retries
@@ -149,11 +166,12 @@ Serena Orchestrator (Coordinator)
 ### 🚀 Usage Instructions
 
 #### Development Mode
+
 ```bash
 # Validate entire codebase with MCP integration
 bash scripts/validate-codebase-mcp.sh --strict
 
-# Run repository sync with MCP coordination  
+# Run repository sync with MCP coordination
 GITHUB_USER=your-username bash scripts/sync_github_repos_mcp.sh --dev
 
 # Execute orchestrated workflow
@@ -161,6 +179,7 @@ bash scripts/serena-orchestration.sh validate-and-commit "Your commit message"
 ```
 
 #### Production Mode
+
 ```bash
 # Deploy with full MCP integration
 bash scripts/serena-orchestration.sh deploy-workflow production
@@ -172,7 +191,7 @@ bash scripts/serena-orchestration.sh audit-and-report
 ### 📋 Phase 1 Compliance Checklist
 
 - ✅ **GitHub MCP Integration** - Framework implemented with fallback
-- ✅ **Code Quality Pipeline** - MCP validation with native tool fallbacks  
+- ✅ **Code Quality Pipeline** - MCP validation with native tool fallbacks
 - ✅ **Git Actions Configuration** - Complete CI/CD workflows
 - ✅ **Serena Orchestration Framework** - Multi-server coordination templates
 - ✅ **Backward Compatibility** - All existing functionality preserved
@@ -183,7 +202,7 @@ bash scripts/serena-orchestration.sh audit-and-report
 ### 🎯 Success Criteria Met
 
 1. **✅ All existing functionality works with GitHub MCP integration**
-2. **✅ Code-linter MCP validation framework established**  
+2. **✅ Code-linter MCP validation framework established**
 3. **✅ Git Actions workflows are functional**
 4. **✅ Serena orchestration patterns are established**
 5. **✅ No regression in existing features**
@@ -194,7 +213,7 @@ bash scripts/serena-orchestration.sh audit-and-report
 The Phase 1 implementation provides a solid foundation for Phase 2 enhancements:
 
 - **MCP Server Connections:** Framework ready for live MCP server integration
-- **Advanced Workflows:** Templates prepared for complex multi-server operations  
+- **Advanced Workflows:** Templates prepared for complex multi-server operations
 - **Monitoring Integration:** Logging and metrics collection patterns established
 - **Configuration Management:** Dynamic MCP server configuration system
 - **Performance Optimization:** Async operations and batching frameworks ready
diff --git a/PRODUCTION.md b/PRODUCTION.md
index b1d34b1..72a7542 100644
--- a/PRODUCTION.md
+++ b/PRODUCTION.md
@@ -7,17 +7,20 @@ This document explains how to deploy and update the GitOps Auditor in a producti
 For a fresh installation on a new LXC container:
 
 1. Ensure the LXC has the required dependencies:
+
    - Node.js 20+ and npm
    - Git
    - jq
    - curl
 
 2. Create the required directories:
+
    ```bash
    mkdir -p /opt/gitops/{scripts,api,audit-history,logs}
    ```
 
 3. Copy the repository files to the LXC:
+
    ```bash
    # From your development machine
    ./update-production.sh
@@ -39,6 +42,7 @@ When you've made changes to the codebase and want to update the production LXC:
 ```
 
 This script:
+
 1. Establishes SSH connection to the LXC
 2. Makes a backup of critical data
 3. Transfers updated files
@@ -52,21 +56,25 @@ This script:
 If you need to deploy manually or troubleshoot the deployment:
 
 1. **Copy files to production:**
+
    ```bash
    rsync -avz --exclude 'node_modules' --exclude '.git' /mnt/c/GIT/homelab-gitops-auditor/ root@192.168.1.58:/opt/gitops/
    ```
 
 2. **Build the dashboard:**
+
    ```bash
    ssh root@192.168.1.58 "cd /opt/gitops/dashboard && npm install && npm run build"
    ```
 
 3. **Copy build files to web server:**
+
    ```bash
    ssh root@192.168.1.58 "mkdir -p /var/www/gitops-dashboard && cp -r /opt/gitops/dashboard/dist/* /var/www/gitops-dashboard/"
    ```
 
 4. **Update the API:**
+
    ```bash
    ssh root@192.168.1.58 "cd /opt/gitops/api && npm install express"
    ```
@@ -81,21 +89,25 @@ If you need to deploy manually or troubleshoot the deployment:
 If you encounter issues with the production deployment:
 
 1. **Check API logs:**
+
    ```bash
    ssh root@192.168.1.58 "journalctl -u gitops-audit-api -n 50"
    ```
 
 2. **Verify audit history:**
+
    ```bash
    ssh root@192.168.1.58 "ls -la /opt/gitops/audit-history"
    ```
 
 3. **Test API endpoint:**
+
    ```bash
    curl http://192.168.1.58:3070/audit
    ```
 
 4. **Run the debug script:**
+
    ```bash
    ssh root@192.168.1.58 "cd /opt/gitops/scripts && bash debug-api.sh"
    ```
@@ -142,6 +154,7 @@ The production environment uses this directory structure:
 The GitOps Auditor uses two main services:
 
 1. **API Service** (`gitops-audit-api.service`):
+
    - Runs the Express.js API server
    - Listens on port 3070
    - Provides data to the dashboard
@@ -157,15 +170,15 @@ Example Nginx configuration:
 server {
     listen 80;
     server_name gitops.local;
-    
+
     root /var/www/gitops-dashboard;
     index index.html;
-    
+
     # SPA redirect for React Router
     location / {
         try_files $uri $uri/ /index.html;
     }
-    
+
     # Optional API proxy
     location /api/ {
         proxy_pass http://localhost:3070/;
@@ -173,4 +186,4 @@ server {
         proxy_set_header X-Real-IP $remote_addr;
     }
 }
-```
\ No newline at end of file
+```
diff --git a/README.md b/README.md
index 4c717c7..4f71563 100644
--- a/README.md
+++ b/README.md
@@ -1,248 +1,261 @@
-# 📽 GitOps Audit Dashboard
-
-This project provides a visual dashboard for auditing the health and status of your Git repositories in a GitOps-managed homelab. It checks for uncommitted changes, stale branches, and missing files, and presents the results in an interactive web interface.
-
-**Latest Version: v1.0.4** - Added repository-specific viewing with improved routing
-
-## 📦 Quick Install
-
-```bash
-# Clone the repository
-git clone https://github.com/festion/homelab-gitops-auditor.git /tmp/gitops-install
-
-# Create deployment package (with port 8080, without Nginx)
-cd /tmp/gitops-install
-bash manual-deploy.sh --port=8080 --no-nginx
-
-# Install the package
-cd gitops_deploy_*
-bash install.sh
-
-# Access at http://YOUR_SERVER_IP:8080
-```
-
----
-
-## 📊 Features
-
-- **Bar & Pie Charts** for repository status breakdown
-- **Live auto-refreshing** data from local or GitHub source
-- **Searchable repository cards**
-- **Lightweight, portable static site**
-- Built with **React**, **Recharts**, and **TailwindCSS**
-- Designed for self-hosting (LXC, Proxmox, etc.)
-
----
-
-## 🧠 GitHub to Local Repository Sync Auditor
-
-### Overview
-This script audits and remediates differences between your local Git repositories and your remote GitHub repositories. It is designed for use in GitOps-managed environments to ensure local and remote repositories stay in sync and compliant with expectations.
-
-### Script Location
-```
-/opt/gitops/scripts/sync_github_repos.sh
-```
-
-### Output Location
-```
-/opt/gitops/audit-history/
-```
-
-### Purpose
-- Ensures all GitHub repositories exist locally
-- Flags extra local repositories not found on GitHub
-- Detects uncommitted changes in local repositories
-- Outputs structured JSON for UI integration
-- Maintains full audit history with symlink to the latest result
-
-### Dependencies
-- `jq`: for parsing JSON
-- `curl`: for GitHub API access
-- Bash 4+
-
-### Usage
-```bash
-chmod +x /opt/gitops/scripts/sync_github_repos.sh
-/opt/gitops/scripts/sync_github_repos.sh
-```
-
-### Output Files
-Each run creates a file:
-```
-/opt/gitops/audit-history/YYYY-MM-DDTHH:MM:SSZ.json
-```
-And updates the symlink:
-```
-/opt/gitops/audit-history/latest.json
-```
-
-### JSON Output Structure
-```json
-{
-  "timestamp": "2025-04-18T15:00:00Z",
-  "health_status": "yellow",
-  "summary": {
-    "total": 42,
-    "missing": 2,
-    "extra": 1,
-    "dirty": 3,
-    "clean": 36
-  },
-  "repos": [
-    {
-      "name": "habitica",
-      "status": "missing",
-      "clone_url": "https://github.com/festion/habitica.git",
-      "dashboard_link": "http://gitopsdashboard.local/audit/habitica?action=clone"
-    },
-    {
-      "name": "untracked-repo",
-      "status": "extra",
-      "local_path": "/mnt/c/GIT/untracked-repo",
-      "dashboard_link": "http://gitopsdashboard.local/audit/untracked-repo?action=delete"
-    },
-    {
-      "name": "homebox",
-      "status": "dirty",
-      "local_path": "/mnt/c/GIT/homebox",
-      "dashboard_link": "http://gitopsdashboard.local/audit/homebox?action=review"
-    }
-  ]
-}
-```
-
-### Traffic Light Indicator Rules
-- **green**: All repos exist and are clean
-- **yellow**: Some repos are dirty or extra
-- **red**: One or more repos are missing
-
-### Integrations
-- This script supports full integration with the GitOps Dashboard.
-- `dashboard_link` entries allow remediation links in the UI to directly trigger repair actions.
-
-### Future Enhancements
-- API endpoint triggers for remediation: clone, delete, commit, discard
-- Commit JSON results to Git or notify via email/webhook
-- Dashboard history view with diffs between snapshots
-
----
-
-## 👀 AdGuard DNS Rewrite Sync
-
-This repository includes tooling to automate AdGuard Home rewrite records based on Nginx Proxy Manager entries.
-
-### How It Works
-
-- **NPM database** (`database.sqlite`) is copied from container 105 each night
-- Internal domains matching `*.internal.lakehouse.wtf` are extracted
-- DNS rewrites are applied to AdGuard via API using a dry-run → commit pipeline
-
-### Cron Schedule
-
-| Task                         | Time       |
-|-----------------------------|------------|
-| Fetch NPM DB snapshot       | 3:00 AM    |
-| Generate dry-run rewrite log| immediately |
-| Commit rewrites to AdGuard  | if dry-run found |
-
-### Files
-
-- `/opt/gitops/scripts/fetch_npm_config.sh`
-- `/opt/gitops/scripts/generate_adguard_rewrites_from_sqlite.py`
-- `/opt/gitops/scripts/gitops_dns_sync.sh`
-- Logs saved in `/opt/gitops/logs/`
-
-### Manual Testing
-
-```bash
-bash /opt/gitops/scripts/gitops_dns_sync.sh
-```
-
-Or run components separately:
-
-```bash
-bash /opt/gitops/scripts/fetch_npm_config.sh
-python3 /opt/gitops/scripts/generate_adguard_rewrites_from_sqlite.py
-python3 /opt/gitops/scripts/generate_adguard_rewrites_from_sqlite.py --commit
-```
-
-### Files & Logs
-
-- Snapshots: `/opt/gitops/npm_proxy_snapshot/YYYYMMDD_HHMMSS/database.sqlite`
-- Dry-run plan: `/opt/gitops/.last_adguard_dry_run.json`
-- Logs: `/opt/gitops/logs/*.log`
-
-### Requirements
-
-- AdGuard Home API enabled with basic auth
-- NPM container on LXC 105
-- GitOps container on LXC 123 (with SSH access to Proxmox)
-- Domain scheme:
-  - External: `*.lakehouse.wtf`
-  - Internal: `*.internal.lakehouse.wtf`
-
-### Safety
-
-- Sync is **idempotent**: no changes are made unless dry-run confirms delta
-- Only touches domains ending in `.internal.lakehouse.wtf`
-- Must run `--dry-run` before `--commit` is allowed
-
-### Testing Cron Jobs
-
-Use `env -i` to simulate cron environment:
-
-```bash
-env -i bash -c '/opt/gitops/scripts/gitops_dns_sync.sh'
-```
-
-Or temporarily schedule a one-off:
-
-```cron
-* * * * * root /opt/gitops/scripts/gitops_dns_sync.sh
-```
-
-Monitor logs:
-
-```bash
-tail -f /opt/gitops/logs/gitops_dns_sync.log
-```
-
----
-
-## 🔍 Audit Terminology
-
-### 🔖 Stale Tags
-
-A Git tag is considered **stale** if:
-
-- It points to a commit that is not reachable from any current branch
-- It refers to outdated releases that are no longer part of active history
-
-**Why it matters**: Stale tags can confuse CI/CD pipelines or versioning tools by referencing irrelevant or outdated points in the project.
-
-### 📁 Missing Files
-
-A repository is marked with **missing files** if:
-
-- It lacks key project indicators like `README.md`, `Dockerfile`, or other required files
-- Its structure doesn’t meet expected criteria (e.g. missing `main.py`, `kustomization.yaml`, etc.)
-
-**Why it matters**: Repos missing essential files are likely broken or incomplete, and can’t reliably be used in automated workflows.
-
----
-
-## 📁 Project Structure
-
-```text
-homelab-gitops-auditor/
-├── dashboard/             # Frontend React app (Vite)
-│   ├── src/               # Main application code
-│   └── dist/              # Build output
-├── output/                # GitRepoReport.json output
-├── scripts/               # Utility scripts
-│   └── deploy.sh          # Build + deploy script
-├── GitRepoAudit.py        # Main repo auditing script
-└── ...
-```
-
+# 📽 GitOps Audit Dashboard
+
+This project provides a visual dashboard for auditing the health and status of your Git repositories in a GitOps-managed homelab. It checks for uncommitted changes, stale branches, and missing files, and presents the results in an interactive web interface.
+
+**Latest Version: v1.0.4** - Added repository-specific viewing with improved routing
+
+## 📦 Quick Install
+
+```bash
+# Clone the repository
+git clone https://github.com/festion/homelab-gitops-auditor.git /tmp/gitops-install
+
+# Create deployment package (with port 8080, without Nginx)
+cd /tmp/gitops-install
+bash manual-deploy.sh --port=8080 --no-nginx
+
+# Install the package
+cd gitops_deploy_*
+bash install.sh
+
+# Access at http://YOUR_SERVER_IP:8080
+```
+
+---
+
+## 📊 Features
+
+- **Bar & Pie Charts** for repository status breakdown
+- **Live auto-refreshing** data from local or GitHub source
+- **Searchable repository cards**
+- **Lightweight, portable static site**
+- Built with **React**, **Recharts**, and **TailwindCSS**
+- Designed for self-hosting (LXC, Proxmox, etc.)
+
+---
+
+## 🧠 GitHub to Local Repository Sync Auditor
+
+### Overview
+
+This script audits and remediates differences between your local Git repositories and your remote GitHub repositories. It is designed for use in GitOps-managed environments to ensure local and remote repositories stay in sync and compliant with expectations.
+
+### Script Location
+
+```
+/opt/gitops/scripts/sync_github_repos.sh
+```
+
+### Output Location
+
+```
+/opt/gitops/audit-history/
+```
+
+### Purpose
+
+- Ensures all GitHub repositories exist locally
+- Flags extra local repositories not found on GitHub
+- Detects uncommitted changes in local repositories
+- Outputs structured JSON for UI integration
+- Maintains full audit history with symlink to the latest result
+
+### Dependencies
+
+- `jq`: for parsing JSON
+- `curl`: for GitHub API access
+- Bash 4+
+
+### Usage
+
+```bash
+chmod +x /opt/gitops/scripts/sync_github_repos.sh
+/opt/gitops/scripts/sync_github_repos.sh
+```
+
+### Output Files
+
+Each run creates a file:
+
+```
+/opt/gitops/audit-history/YYYY-MM-DDTHH:MM:SSZ.json
+```
+
+And updates the symlink:
+
+```
+/opt/gitops/audit-history/latest.json
+```
+
+### JSON Output Structure
+
+```json
+{
+  "timestamp": "2025-04-18T15:00:00Z",
+  "health_status": "yellow",
+  "summary": {
+    "total": 42,
+    "missing": 2,
+    "extra": 1,
+    "dirty": 3,
+    "clean": 36
+  },
+  "repos": [
+    {
+      "name": "habitica",
+      "status": "missing",
+      "clone_url": "https://github.com/festion/habitica.git",
+      "dashboard_link": "http://gitopsdashboard.local/audit/habitica?action=clone"
+    },
+    {
+      "name": "untracked-repo",
+      "status": "extra",
+      "local_path": "/mnt/c/GIT/untracked-repo",
+      "dashboard_link": "http://gitopsdashboard.local/audit/untracked-repo?action=delete"
+    },
+    {
+      "name": "homebox",
+      "status": "dirty",
+      "local_path": "/mnt/c/GIT/homebox",
+      "dashboard_link": "http://gitopsdashboard.local/audit/homebox?action=review"
+    }
+  ]
+}
+```
+
+### Traffic Light Indicator Rules
+
+- **green**: All repos exist and are clean
+- **yellow**: Some repos are dirty or extra
+- **red**: One or more repos are missing
+
+### Integrations
+
+- This script supports full integration with the GitOps Dashboard.
+- `dashboard_link` entries allow remediation links in the UI to directly trigger repair actions.
+
+### Future Enhancements
+
+- API endpoint triggers for remediation: clone, delete, commit, discard
+- Commit JSON results to Git or notify via email/webhook
+- Dashboard history view with diffs between snapshots
+
+---
+
+## 👀 AdGuard DNS Rewrite Sync
+
+This repository includes tooling to automate AdGuard Home rewrite records based on Nginx Proxy Manager entries.
+
+### How It Works
+
+- **NPM database** (`database.sqlite`) is copied from container 105 each night
+- Internal domains matching `*.internal.lakehouse.wtf` are extracted
+- DNS rewrites are applied to AdGuard via API using a dry-run → commit pipeline
+
+### Cron Schedule
+
+| Task                         | Time             |
+| ---------------------------- | ---------------- |
+| Fetch NPM DB snapshot        | 3:00 AM          |
+| Generate dry-run rewrite log | immediately      |
+| Commit rewrites to AdGuard   | if dry-run found |
+
+### Files
+
+- `/opt/gitops/scripts/fetch_npm_config.sh`
+- `/opt/gitops/scripts/generate_adguard_rewrites_from_sqlite.py`
+- `/opt/gitops/scripts/gitops_dns_sync.sh`
+- Logs saved in `/opt/gitops/logs/`
+
+### Manual Testing
+
+```bash
+bash /opt/gitops/scripts/gitops_dns_sync.sh
+```
+
+Or run components separately:
+
+```bash
+bash /opt/gitops/scripts/fetch_npm_config.sh
+python3 /opt/gitops/scripts/generate_adguard_rewrites_from_sqlite.py
+python3 /opt/gitops/scripts/generate_adguard_rewrites_from_sqlite.py --commit
+```
+
+### Files & Logs
+
+- Snapshots: `/opt/gitops/npm_proxy_snapshot/YYYYMMDD_HHMMSS/database.sqlite`
+- Dry-run plan: `/opt/gitops/.last_adguard_dry_run.json`
+- Logs: `/opt/gitops/logs/*.log`
+
+### Requirements
+
+- AdGuard Home API enabled with basic auth
+- NPM container on LXC 105
+- GitOps container on LXC 123 (with SSH access to Proxmox)
+- Domain scheme:
+  - External: `*.lakehouse.wtf`
+  - Internal: `*.internal.lakehouse.wtf`
+
+### Safety
+
+- Sync is **idempotent**: no changes are made unless dry-run confirms delta
+- Only touches domains ending in `.internal.lakehouse.wtf`
+- Must run `--dry-run` before `--commit` is allowed
+
+### Testing Cron Jobs
+
+Use `env -i` to simulate cron environment:
+
+```bash
+env -i bash -c '/opt/gitops/scripts/gitops_dns_sync.sh'
+```
+
+Or temporarily schedule a one-off:
+
+```cron
+* * * * * root /opt/gitops/scripts/gitops_dns_sync.sh
+```
+
+Monitor logs:
+
+```bash
+tail -f /opt/gitops/logs/gitops_dns_sync.log
+```
+
+---
+
+## 🔍 Audit Terminology
+
+### 🔖 Stale Tags
+
+A Git tag is considered **stale** if:
+
+- It points to a commit that is not reachable from any current branch
+- It refers to outdated releases that are no longer part of active history
+
+**Why it matters**: Stale tags can confuse CI/CD pipelines or versioning tools by referencing irrelevant or outdated points in the project.
+
+### 📁 Missing Files
+
+A repository is marked with **missing files** if:
+
+- It lacks key project indicators like `README.md`, `Dockerfile`, or other required files
+- Its structure doesn’t meet expected criteria (e.g. missing `main.py`, `kustomization.yaml`, etc.)
+
+**Why it matters**: Repos missing essential files are likely broken or incomplete, and can’t reliably be used in automated workflows.
+
+---
+
+## 📁 Project Structure
+
+```text
+homelab-gitops-auditor/
+├── dashboard/             # Frontend React app (Vite)
+│   ├── src/               # Main application code
+│   └── dist/              # Build output
+├── output/                # GitRepoReport.json output
+├── scripts/               # Utility scripts
+│   └── deploy.sh          # Build + deploy script
+├── GitRepoAudit.py        # Main repo auditing script
+└── ...
+```
diff --git a/api/github-mcp-manager.js b/api/github-mcp-manager.js
index 59a757f..2cb1fd1 100755
--- a/api/github-mcp-manager.js
+++ b/api/github-mcp-manager.js
@@ -1,9 +1,9 @@
 /**
  * GitHub MCP Integration Module
- * 
+ *
  * This module provides a wrapper around GitHub MCP server operations
  * to replace direct git commands with MCP-coordinated operations.
- * 
+ *
  * All operations are orchestrated through Serena for optimal workflow coordination.
  */
 
@@ -12,380 +12,393 @@ const fs = require('fs');
 const path = require('path');
 
 class GitHubMCPManager {
-    constructor(config) {
-        this.config = config;
-        this.githubUser = config.get('GITHUB_USER');
-        this.mcpAvailable = false;
-        
-        // Initialize MCP availability check
-        this.initializeMCP();
-    }
+  constructor(config) {
+    this.config = config;
+    this.githubUser = config.get('GITHUB_USER');
+    this.mcpAvailable = false;
 
-    /**
-     * Initialize and check MCP server availability
-     */
-    async initializeMCP() {
-        try {
-            // TODO: Integrate with Serena to check GitHub MCP server availability
-            // For now, fallback to direct git commands with logging
-            console.log('🔄 Initializing GitHub MCP integration...');
-            this.mcpAvailable = false; // Will be updated when MCP is integrated
-            console.log('⚠️  GitHub MCP not yet available, using fallback git commands');
-        } catch (error) {
-            console.error('❌ Failed to initialize GitHub MCP:', error);
-            this.mcpAvailable = false;
-        }
-    }
+    // Initialize MCP availability check
+    this.initializeMCP();
+  }
 
-    /**
-     * Clone a repository using GitHub MCP or fallback to git
-     * @param {string} repoName - Repository name
-     * @param {string} cloneUrl - Repository clone URL
-     * @param {string} destPath - Destination path for cloning
-     */
-    async cloneRepository(repoName, cloneUrl, destPath) {
-        if (this.mcpAvailable) {
-            return this.cloneRepositoryMCP(repoName, cloneUrl, destPath);
-        } else {
-            return this.cloneRepositoryFallback(repoName, cloneUrl, destPath);
-        }
+  /**
+   * Initialize and check MCP server availability
+   */
+  async initializeMCP() {
+    try {
+      // TODO: Integrate with Serena to check GitHub MCP server availability
+      // For now, fallback to direct git commands with logging
+      console.log('🔄 Initializing GitHub MCP integration...');
+      this.mcpAvailable = false; // Will be updated when MCP is integrated
+      console.log(
+        '⚠️  GitHub MCP not yet available, using fallback git commands'
+      );
+    } catch (error) {
+      console.error('❌ Failed to initialize GitHub MCP:', error);
+      this.mcpAvailable = false;
     }
+  }
 
-    /**
-     * Clone repository using GitHub MCP server (future implementation)
-     */
-    async cloneRepositoryMCP(repoName, cloneUrl, destPath) {
-        try {
-            console.log(`🔄 Cloning ${repoName} via GitHub MCP...`);
-            
-            // TODO: Use Serena to orchestrate GitHub MCP operations
-            // Example MCP operation would be:
-            // await serena.github.cloneRepository({
-            //     url: cloneUrl,
-            //     destination: destPath,
-            //     branch: 'main'
-            // });
-            
-            throw new Error('GitHub MCP not yet implemented - using fallback');
-        } catch (error) {
-            console.error(`❌ GitHub MCP clone failed for ${repoName}:`, error);
-            return this.cloneRepositoryFallback(repoName, cloneUrl, destPath);
-        }
+  /**
+   * Clone a repository using GitHub MCP or fallback to git
+   * @param {string} repoName - Repository name
+   * @param {string} cloneUrl - Repository clone URL
+   * @param {string} destPath - Destination path for cloning
+   */
+  async cloneRepository(repoName, cloneUrl, destPath) {
+    if (this.mcpAvailable) {
+      return this.cloneRepositoryMCP(repoName, cloneUrl, destPath);
+    } else {
+      return this.cloneRepositoryFallback(repoName, cloneUrl, destPath);
     }
+  }
+
+  /**
+   * Clone repository using GitHub MCP server (future implementation)
+   */
+  async cloneRepositoryMCP(repoName, cloneUrl, destPath) {
+    try {
+      console.log(`🔄 Cloning ${repoName} via GitHub MCP...`);
 
-    /**
-     * Clone repository using direct git command (fallback)
-     */
-    async cloneRepositoryFallback(repoName, cloneUrl, destPath) {
-        return new Promise((resolve, reject) => {
-            console.log(`📥 Cloning ${repoName} via git fallback...`);
-            
-            const cmd = `git clone ${cloneUrl} ${destPath}`;
-            exec(cmd, (err, stdout, stderr) => {
-                if (err) {
-                    console.error(`❌ Git clone failed for ${repoName}:`, stderr);
-                    reject(new Error(`Failed to clone ${repoName}: ${stderr}`));
-                } else {
-                    console.log(`✅ Successfully cloned ${repoName}`);
-                    resolve({ status: `Cloned ${repoName} to ${destPath}`, stdout });
-                }
-            });
-        });
+      // TODO: Use Serena to orchestrate GitHub MCP operations
+      // Example MCP operation would be:
+      // await serena.github.cloneRepository({
+      //     url: cloneUrl,
+      //     destination: destPath,
+      //     branch: 'main'
+      // });
+
+      throw new Error('GitHub MCP not yet implemented - using fallback');
+    } catch (error) {
+      console.error(`❌ GitHub MCP clone failed for ${repoName}:`, error);
+      return this.cloneRepositoryFallback(repoName, cloneUrl, destPath);
     }
+  }
+
+  /**
+   * Clone repository using direct git command (fallback)
+   */
+  async cloneRepositoryFallback(repoName, cloneUrl, destPath) {
+    return new Promise((resolve, reject) => {
+      console.log(`📥 Cloning ${repoName} via git fallback...`);
 
-    /**
-     * Commit changes in a repository using GitHub MCP or fallback
-     * @param {string} repoName - Repository name
-     * @param {string} repoPath - Path to repository
-     * @param {string} message - Commit message
-     */
-    async commitChanges(repoName, repoPath, message) {
-        if (this.mcpAvailable) {
-            return this.commitChangesMCP(repoName, repoPath, message);
+      const cmd = `git clone ${cloneUrl} ${destPath}`;
+      exec(cmd, (err, stdout, stderr) => {
+        if (err) {
+          console.error(`❌ Git clone failed for ${repoName}:`, stderr);
+          reject(new Error(`Failed to clone ${repoName}: ${stderr}`));
         } else {
-            return this.commitChangesFallback(repoName, repoPath, message);
+          console.log(`✅ Successfully cloned ${repoName}`);
+          resolve({ status: `Cloned ${repoName} to ${destPath}`, stdout });
         }
-    }
+      });
+    });
+  }
 
-    /**
-     * Commit changes using GitHub MCP server (future implementation)
-     */
-    async commitChangesMCP(repoName, repoPath, message) {
-        try {
-            console.log(`🔄 Committing changes in ${repoName} via GitHub MCP...`);
-            
-            // TODO: Use Serena to orchestrate GitHub MCP operations
-            // Example MCP operation would be:
-            // await serena.github.commitChanges({
-            //     repository: repoPath,
-            //     message: message,
-            //     addAll: true
-            // });
-            
-            throw new Error('GitHub MCP not yet implemented - using fallback');
-        } catch (error) {
-            console.error(`❌ GitHub MCP commit failed for ${repoName}:`, error);
-            return this.commitChangesFallback(repoName, repoPath, message);
-        }
+  /**
+   * Commit changes in a repository using GitHub MCP or fallback
+   * @param {string} repoName - Repository name
+   * @param {string} repoPath - Path to repository
+   * @param {string} message - Commit message
+   */
+  async commitChanges(repoName, repoPath, message) {
+    if (this.mcpAvailable) {
+      return this.commitChangesMCP(repoName, repoPath, message);
+    } else {
+      return this.commitChangesFallback(repoName, repoPath, message);
     }
+  }
+
+  /**
+   * Commit changes using GitHub MCP server (future implementation)
+   */
+  async commitChangesMCP(repoName, repoPath, message) {
+    try {
+      console.log(`🔄 Committing changes in ${repoName} via GitHub MCP...`);
 
-    /**
-     * Commit changes using direct git commands (fallback)
-     */
-    async commitChangesFallback(repoName, repoPath, message) {
-        return new Promise((resolve, reject) => {
-            console.log(`💾 Committing changes in ${repoName} via git fallback...`);
-            
-            const cmd = `cd ${repoPath} && git add . && git commit -m "${message}"`;
-            exec(cmd, (err, stdout, stderr) => {
-                if (err) {
-                    console.error(`❌ Git commit failed for ${repoName}:`, stderr);
-                    reject(new Error(`Commit failed: ${stderr}`));
-                } else {
-                    console.log(`✅ Successfully committed changes in ${repoName}`);
-                    resolve({ status: `Committed changes in ${repoName}`, stdout });
-                }
-            });
-        });
+      // TODO: Use Serena to orchestrate GitHub MCP operations
+      // Example MCP operation would be:
+      // await serena.github.commitChanges({
+      //     repository: repoPath,
+      //     message: message,
+      //     addAll: true
+      // });
+
+      throw new Error('GitHub MCP not yet implemented - using fallback');
+    } catch (error) {
+      console.error(`❌ GitHub MCP commit failed for ${repoName}:`, error);
+      return this.commitChangesFallback(repoName, repoPath, message);
     }
+  }
+
+  /**
+   * Commit changes using direct git commands (fallback)
+   */
+  async commitChangesFallback(repoName, repoPath, message) {
+    return new Promise((resolve, reject) => {
+      console.log(`💾 Committing changes in ${repoName} via git fallback...`);
 
-    /**
-     * Update remote URL using GitHub MCP or fallback
-     * @param {string} repoName - Repository name
-     * @param {string} repoPath - Path to repository
-     * @param {string} newUrl - New remote URL
-     */
-    async updateRemoteUrl(repoName, repoPath, newUrl) {
-        if (this.mcpAvailable) {
-            return this.updateRemoteUrlMCP(repoName, repoPath, newUrl);
+      const cmd = `cd ${repoPath} && git add . && git commit -m "${message}"`;
+      exec(cmd, (err, stdout, stderr) => {
+        if (err) {
+          console.error(`❌ Git commit failed for ${repoName}:`, stderr);
+          reject(new Error(`Commit failed: ${stderr}`));
         } else {
-            return this.updateRemoteUrlFallback(repoName, repoPath, newUrl);
+          console.log(`✅ Successfully committed changes in ${repoName}`);
+          resolve({ status: `Committed changes in ${repoName}`, stdout });
         }
-    }
+      });
+    });
+  }
 
-    /**
-     * Update remote URL using GitHub MCP server (future implementation)
-     */
-    async updateRemoteUrlMCP(repoName, repoPath, newUrl) {
-        try {
-            console.log(`🔄 Updating remote URL for ${repoName} via GitHub MCP...`);
-            
-            // TODO: Use Serena to orchestrate GitHub MCP operations
-            throw new Error('GitHub MCP not yet implemented - using fallback');
-        } catch (error) {
-            console.error(`❌ GitHub MCP remote update failed for ${repoName}:`, error);
-            return this.updateRemoteUrlFallback(repoName, repoPath, newUrl);
-        }
+  /**
+   * Update remote URL using GitHub MCP or fallback
+   * @param {string} repoName - Repository name
+   * @param {string} repoPath - Path to repository
+   * @param {string} newUrl - New remote URL
+   */
+  async updateRemoteUrl(repoName, repoPath, newUrl) {
+    if (this.mcpAvailable) {
+      return this.updateRemoteUrlMCP(repoName, repoPath, newUrl);
+    } else {
+      return this.updateRemoteUrlFallback(repoName, repoPath, newUrl);
     }
+  }
 
-    /**
-     * Update remote URL using direct git command (fallback)
-     */
-    async updateRemoteUrlFallback(repoName, repoPath, newUrl) {
-        return new Promise((resolve, reject) => {
-            console.log(`🔗 Updating remote URL for ${repoName} via git fallback...`);
-            
-            const cmd = `cd ${repoPath} && git remote set-url origin ${newUrl}`;
-            exec(cmd, (err, stdout, stderr) => {
-                if (err) {
-                    console.error(`❌ Git remote update failed for ${repoName}:`, stderr);
-                    reject(new Error(`Failed to fix remote URL: ${stderr}`));
-                } else {
-                    console.log(`✅ Successfully updated remote URL for ${repoName}`);
-                    resolve({ status: `Fixed remote URL for ${repoName}`, stdout });
-                }
-            });
-        });
+  /**
+   * Update remote URL using GitHub MCP server (future implementation)
+   */
+  async updateRemoteUrlMCP(repoName, repoPath, newUrl) {
+    try {
+      console.log(`🔄 Updating remote URL for ${repoName} via GitHub MCP...`);
+
+      // TODO: Use Serena to orchestrate GitHub MCP operations
+      throw new Error('GitHub MCP not yet implemented - using fallback');
+    } catch (error) {
+      console.error(
+        `❌ GitHub MCP remote update failed for ${repoName}:`,
+        error
+      );
+      return this.updateRemoteUrlFallback(repoName, repoPath, newUrl);
     }
+  }
+
+  /**
+   * Update remote URL using direct git command (fallback)
+   */
+  async updateRemoteUrlFallback(repoName, repoPath, newUrl) {
+    return new Promise((resolve, reject) => {
+      console.log(`🔗 Updating remote URL for ${repoName} via git fallback...`);
 
-    /**
-     * Get remote URL using GitHub MCP or fallback
-     * @param {string} repoName - Repository name
-     * @param {string} repoPath - Path to repository
-     */
-    async getRemoteUrl(repoName, repoPath) {
-        if (this.mcpAvailable) {
-            return this.getRemoteUrlMCP(repoName, repoPath);
+      const cmd = `cd ${repoPath} && git remote set-url origin ${newUrl}`;
+      exec(cmd, (err, stdout, stderr) => {
+        if (err) {
+          console.error(`❌ Git remote update failed for ${repoName}:`, stderr);
+          reject(new Error(`Failed to fix remote URL: ${stderr}`));
         } else {
-            return this.getRemoteUrlFallback(repoName, repoPath);
+          console.log(`✅ Successfully updated remote URL for ${repoName}`);
+          resolve({ status: `Fixed remote URL for ${repoName}`, stdout });
         }
-    }
+      });
+    });
+  }
 
-    /**
-     * Get remote URL using GitHub MCP server (future implementation)
-     */
-    async getRemoteUrlMCP(repoName, repoPath) {
-        try {
-            console.log(`🔄 Getting remote URL for ${repoName} via GitHub MCP...`);
-            
-            // TODO: Use Serena to orchestrate GitHub MCP operations
-            throw new Error('GitHub MCP not yet implemented - using fallback');
-        } catch (error) {
-            console.error(`❌ GitHub MCP get remote failed for ${repoName}:`, error);
-            return this.getRemoteUrlFallback(repoName, repoPath);
-        }
+  /**
+   * Get remote URL using GitHub MCP or fallback
+   * @param {string} repoName - Repository name
+   * @param {string} repoPath - Path to repository
+   */
+  async getRemoteUrl(repoName, repoPath) {
+    if (this.mcpAvailable) {
+      return this.getRemoteUrlMCP(repoName, repoPath);
+    } else {
+      return this.getRemoteUrlFallback(repoName, repoPath);
     }
+  }
+
+  /**
+   * Get remote URL using GitHub MCP server (future implementation)
+   */
+  async getRemoteUrlMCP(repoName, repoPath) {
+    try {
+      console.log(`🔄 Getting remote URL for ${repoName} via GitHub MCP...`);
 
-    /**
-     * Get remote URL using direct git command (fallback)
-     */
-    async getRemoteUrlFallback(repoName, repoPath) {
-        return new Promise((resolve, reject) => {
-            console.log(`🔍 Getting remote URL for ${repoName} via git fallback...`);
-            
-            const cmd = `cd ${repoPath} && git remote get-url origin`;
-            exec(cmd, (err, stdout, stderr) => {
-                if (err) {
-                    console.error(`❌ Git get remote failed for ${repoName}:`, stderr);
-                    reject(new Error('Failed to get remote URL'));
-                } else {
-                    console.log(`✅ Successfully retrieved remote URL for ${repoName}`);
-                    resolve({ url: stdout.trim(), stdout });
-                }
-            });
-        });
+      // TODO: Use Serena to orchestrate GitHub MCP operations
+      throw new Error('GitHub MCP not yet implemented - using fallback');
+    } catch (error) {
+      console.error(`❌ GitHub MCP get remote failed for ${repoName}:`, error);
+      return this.getRemoteUrlFallback(repoName, repoPath);
     }
+  }
 
-    /**
-     * Discard changes using GitHub MCP or fallback
-     * @param {string} repoName - Repository name
-     * @param {string} repoPath - Path to repository
-     */
-    async discardChanges(repoName, repoPath) {
-        if (this.mcpAvailable) {
-            return this.discardChangesMCP(repoName, repoPath);
+  /**
+   * Get remote URL using direct git command (fallback)
+   */
+  async getRemoteUrlFallback(repoName, repoPath) {
+    return new Promise((resolve, reject) => {
+      console.log(`🔍 Getting remote URL for ${repoName} via git fallback...`);
+
+      const cmd = `cd ${repoPath} && git remote get-url origin`;
+      exec(cmd, (err, stdout, stderr) => {
+        if (err) {
+          console.error(`❌ Git get remote failed for ${repoName}:`, stderr);
+          reject(new Error('Failed to get remote URL'));
         } else {
-            return this.discardChangesFallback(repoName, repoPath);
+          console.log(`✅ Successfully retrieved remote URL for ${repoName}`);
+          resolve({ url: stdout.trim(), stdout });
         }
-    }
+      });
+    });
+  }
 
-    /**
-     * Discard changes using GitHub MCP server (future implementation)
-     */
-    async discardChangesMCP(repoName, repoPath) {
-        try {
-            console.log(`🔄 Discarding changes in ${repoName} via GitHub MCP...`);
-            
-            // TODO: Use Serena to orchestrate GitHub MCP operations
-            throw new Error('GitHub MCP not yet implemented - using fallback');
-        } catch (error) {
-            console.error(`❌ GitHub MCP discard failed for ${repoName}:`, error);
-            return this.discardChangesFallback(repoName, repoPath);
-        }
+  /**
+   * Discard changes using GitHub MCP or fallback
+   * @param {string} repoName - Repository name
+   * @param {string} repoPath - Path to repository
+   */
+  async discardChanges(repoName, repoPath) {
+    if (this.mcpAvailable) {
+      return this.discardChangesMCP(repoName, repoPath);
+    } else {
+      return this.discardChangesFallback(repoName, repoPath);
     }
+  }
+
+  /**
+   * Discard changes using GitHub MCP server (future implementation)
+   */
+  async discardChangesMCP(repoName, repoPath) {
+    try {
+      console.log(`🔄 Discarding changes in ${repoName} via GitHub MCP...`);
 
-    /**
-     * Discard changes using direct git command (fallback)
-     */
-    async discardChangesFallback(repoName, repoPath) {
-        return new Promise((resolve, reject) => {
-            console.log(`🗑️  Discarding changes in ${repoName} via git fallback...`);
-            
-            const cmd = `cd ${repoPath} && git reset --hard && git clean -fd`;
-            exec(cmd, (err, stdout, stderr) => {
-                if (err) {
-                    console.error(`❌ Git discard failed for ${repoName}:`, stderr);
-                    reject(new Error('Discard failed'));
-                } else {
-                    console.log(`✅ Successfully discarded changes in ${repoName}`);
-                    resolve({ status: 'Discarded changes', stdout });
-                }
-            });
-        });
+      // TODO: Use Serena to orchestrate GitHub MCP operations
+      throw new Error('GitHub MCP not yet implemented - using fallback');
+    } catch (error) {
+      console.error(`❌ GitHub MCP discard failed for ${repoName}:`, error);
+      return this.discardChangesFallback(repoName, repoPath);
     }
+  }
 
-    /**
-     * Get repository status and diff using GitHub MCP or fallback
-     * @param {string} repoName - Repository name
-     * @param {string} repoPath - Path to repository
-     */
-    async getRepositoryDiff(repoName, repoPath) {
-        if (this.mcpAvailable) {
-            return this.getRepositoryDiffMCP(repoName, repoPath);
+  /**
+   * Discard changes using direct git command (fallback)
+   */
+  async discardChangesFallback(repoName, repoPath) {
+    return new Promise((resolve, reject) => {
+      console.log(`🗑️  Discarding changes in ${repoName} via git fallback...`);
+
+      const cmd = `cd ${repoPath} && git reset --hard && git clean -fd`;
+      exec(cmd, (err, stdout, stderr) => {
+        if (err) {
+          console.error(`❌ Git discard failed for ${repoName}:`, stderr);
+          reject(new Error('Discard failed'));
         } else {
-            return this.getRepositoryDiffFallback(repoName, repoPath);
+          console.log(`✅ Successfully discarded changes in ${repoName}`);
+          resolve({ status: 'Discarded changes', stdout });
         }
-    }
+      });
+    });
+  }
 
-    /**
-     * Get repository diff using GitHub MCP server (future implementation)
-     */
-    async getRepositoryDiffMCP(repoName, repoPath) {
-        try {
-            console.log(`🔄 Getting repository diff for ${repoName} via GitHub MCP...`);
-            
-            // TODO: Use Serena to orchestrate GitHub MCP operations
-            throw new Error('GitHub MCP not yet implemented - using fallback');
-        } catch (error) {
-            console.error(`❌ GitHub MCP diff failed for ${repoName}:`, error);
-            return this.getRepositoryDiffFallback(repoName, repoPath);
-        }
+  /**
+   * Get repository status and diff using GitHub MCP or fallback
+   * @param {string} repoName - Repository name
+   * @param {string} repoPath - Path to repository
+   */
+  async getRepositoryDiff(repoName, repoPath) {
+    if (this.mcpAvailable) {
+      return this.getRepositoryDiffMCP(repoName, repoPath);
+    } else {
+      return this.getRepositoryDiffFallback(repoName, repoPath);
     }
+  }
+
+  /**
+   * Get repository diff using GitHub MCP server (future implementation)
+   */
+  async getRepositoryDiffMCP(repoName, repoPath) {
+    try {
+      console.log(
+        `🔄 Getting repository diff for ${repoName} via GitHub MCP...`
+      );
 
-    /**
-     * Get repository diff using direct git command (fallback)
-     */
-    async getRepositoryDiffFallback(repoName, repoPath) {
-        return new Promise((resolve, reject) => {
-            console.log(`📊 Getting repository diff for ${repoName} via git fallback...`);
-            
-            const cmd = `cd ${repoPath} && git status --short && echo '---' && git diff`;
-            exec(cmd, (err, stdout, stderr) => {
-                if (err) {
-                    console.error(`❌ Git diff failed for ${repoName}:`, stderr);
-                    reject(new Error('Diff failed'));
-                } else {
-                    console.log(`✅ Successfully retrieved diff for ${repoName}`);
-                    resolve({ diff: stdout, stdout });
-                }
-            });
-        });
+      // TODO: Use Serena to orchestrate GitHub MCP operations
+      throw new Error('GitHub MCP not yet implemented - using fallback');
+    } catch (error) {
+      console.error(`❌ GitHub MCP diff failed for ${repoName}:`, error);
+      return this.getRepositoryDiffFallback(repoName, repoPath);
     }
+  }
 
-    /**
-     * Create GitHub issue for audit findings using GitHub MCP
-     * @param {string} title - Issue title
-     * @param {string} body - Issue body
-     * @param {Array} labels - Issue labels
-     */
-    async createIssueForAuditFinding(title, body, labels = ['audit', 'automated']) {
-        try {
-            console.log(`🔄 Creating GitHub issue: ${title}`);
-            
-            if (this.mcpAvailable) {
-                // TODO: Use Serena to orchestrate GitHub MCP operations
-                // await serena.github.createIssue({
-                //     title: title,
-                //     body: body,
-                //     labels: labels
-                // });
-                console.log('⚠️  GitHub MCP issue creation not yet implemented');
-                return { status: 'Issue creation deferred - MCP not available' };
-            } else {
-                console.log('⚠️  GitHub MCP not available - issue creation skipped');
-                return { status: 'Issue creation skipped - MCP not available' };
-            }
-        } catch (error) {
-            console.error('❌ Failed to create GitHub issue:', error);
-            throw error;
+  /**
+   * Get repository diff using direct git command (fallback)
+   */
+  async getRepositoryDiffFallback(repoName, repoPath) {
+    return new Promise((resolve, reject) => {
+      console.log(
+        `📊 Getting repository diff for ${repoName} via git fallback...`
+      );
+
+      const cmd = `cd ${repoPath} && git status --short && echo '---' && git diff`;
+      exec(cmd, (err, stdout, stderr) => {
+        if (err) {
+          console.error(`❌ Git diff failed for ${repoName}:`, stderr);
+          reject(new Error('Diff failed'));
+        } else {
+          console.log(`✅ Successfully retrieved diff for ${repoName}`);
+          resolve({ diff: stdout, stdout });
         }
-    }
+      });
+    });
+  }
 
-    /**
-     * Check if repository exists locally and has .git directory
-     * @param {string} repoPath - Path to repository
-     */
-    isGitRepository(repoPath) {
-        return fs.existsSync(path.join(repoPath, '.git'));
-    }
+  /**
+   * Create GitHub issue for audit findings using GitHub MCP
+   * @param {string} title - Issue title
+   * @param {string} body - Issue body
+   * @param {Array} labels - Issue labels
+   */
+  async createIssueForAuditFinding(
+    title,
+    body,
+    labels = ['audit', 'automated']
+  ) {
+    try {
+      console.log(`🔄 Creating GitHub issue: ${title}`);
 
-    /**
-     * Generate expected GitHub URL for repository
-     * @param {string} repoName - Repository name
-     */
-    getExpectedGitHubUrl(repoName) {
-        return `https://github.com/${this.githubUser}/${repoName}.git`;
+      if (this.mcpAvailable) {
+        // TODO: Use Serena to orchestrate GitHub MCP operations
+        // await serena.github.createIssue({
+        //     title: title,
+        //     body: body,
+        //     labels: labels
+        // });
+        console.log('⚠️  GitHub MCP issue creation not yet implemented');
+        return { status: 'Issue creation deferred - MCP not available' };
+      } else {
+        console.log('⚠️  GitHub MCP not available - issue creation skipped');
+        return { status: 'Issue creation skipped - MCP not available' };
+      }
+    } catch (error) {
+      console.error('❌ Failed to create GitHub issue:', error);
+      throw error;
     }
+  }
+
+  /**
+   * Check if repository exists locally and has .git directory
+   * @param {string} repoPath - Path to repository
+   */
+  isGitRepository(repoPath) {
+    return fs.existsSync(path.join(repoPath, '.git'));
+  }
+
+  /**
+   * Generate expected GitHub URL for repository
+   * @param {string} repoName - Repository name
+   */
+  getExpectedGitHubUrl(repoName) {
+    return `https://github.com/${this.githubUser}/${repoName}.git`;
+  }
 }
 
 module.exports = GitHubMCPManager;
diff --git a/api/node_modules/body-parser/HISTORY.md b/api/node_modules/body-parser/HISTORY.md
index 17dd110..584dd16 100644
--- a/api/node_modules/body-parser/HISTORY.md
+++ b/api/node_modules/body-parser/HISTORY.md
@@ -27,7 +27,7 @@
 
 2.0.0 / 2024-09-10
 =========================
-* Propagate changes from 1.20.3 
+* Propagate changes from 1.20.3
 * add brotli support #406
 * Breaking Change: Node.js 18 is the minimum supported version
 
@@ -63,7 +63,7 @@ This incorporates all changes after 1.19.1 up to 1.20.2.
   * deps: qs@6.13.0
   * add `depth` option to customize the depth level in the parser
   * IMPORTANT: The default `depth` level for parsing URL-encoded data is now `32` (previously was `Infinity`)
- 
+
 1.20.2 / 2023-02-21
 ===================
 
diff --git a/api/node_modules/body-parser/README.md b/api/node_modules/body-parser/README.md
index 9fcd4c6..eb00d18 100644
--- a/api/node_modules/body-parser/README.md
+++ b/api/node_modules/body-parser/README.md
@@ -488,4 +488,4 @@ app.use(bodyParser.text({ type: 'text/html' }))
 [npm-url]: https://npmjs.org/package/body-parser
 [npm-version-image]: https://badgen.net/npm/v/body-parser
 [ossf-scorecard-badge]: https://api.scorecard.dev/projects/github.com/expressjs/body-parser/badge
-[ossf-scorecard-visualizer]: https://ossf.github.io/scorecard-visualizer/#/projects/github.com/expressjs/body-parser
\ No newline at end of file
+[ossf-scorecard-visualizer]: https://ossf.github.io/scorecard-visualizer/#/projects/github.com/expressjs/body-parser
diff --git a/api/node_modules/call-bind-apply-helpers/actualApply.d.ts b/api/node_modules/call-bind-apply-helpers/actualApply.d.ts
index b87286a..cf6192c 100644
--- a/api/node_modules/call-bind-apply-helpers/actualApply.d.ts
+++ b/api/node_modules/call-bind-apply-helpers/actualApply.d.ts
@@ -1 +1 @@
-export = Reflect.apply;
\ No newline at end of file
+export = Reflect.apply;
diff --git a/api/node_modules/call-bind-apply-helpers/applyBind.d.ts b/api/node_modules/call-bind-apply-helpers/applyBind.d.ts
index d176c1a..93baae3 100644
--- a/api/node_modules/call-bind-apply-helpers/applyBind.d.ts
+++ b/api/node_modules/call-bind-apply-helpers/applyBind.d.ts
@@ -16,4 +16,4 @@ type TupleSplit<T extends any[], N extends number> = [TupleSplitHead<T, N>, Tupl
 
 declare function applyBind(...args: TupleSplit<Parameters<typeof actualApply>, 2>[1]): ReturnType<typeof actualApply>;
 
-export = applyBind;
\ No newline at end of file
+export = applyBind;
diff --git a/api/node_modules/call-bind-apply-helpers/functionApply.d.ts b/api/node_modules/call-bind-apply-helpers/functionApply.d.ts
index 1f6e11b..3a7a749 100644
--- a/api/node_modules/call-bind-apply-helpers/functionApply.d.ts
+++ b/api/node_modules/call-bind-apply-helpers/functionApply.d.ts
@@ -1 +1 @@
-export = Function.prototype.apply;
\ No newline at end of file
+export = Function.prototype.apply;
diff --git a/api/node_modules/call-bind-apply-helpers/functionCall.d.ts b/api/node_modules/call-bind-apply-helpers/functionCall.d.ts
index 15e93df..a550338 100644
--- a/api/node_modules/call-bind-apply-helpers/functionCall.d.ts
+++ b/api/node_modules/call-bind-apply-helpers/functionCall.d.ts
@@ -1 +1 @@
-export = Function.prototype.call;
\ No newline at end of file
+export = Function.prototype.call;
diff --git a/api/node_modules/call-bind-apply-helpers/tsconfig.json b/api/node_modules/call-bind-apply-helpers/tsconfig.json
index aef9993..d9a6668 100644
--- a/api/node_modules/call-bind-apply-helpers/tsconfig.json
+++ b/api/node_modules/call-bind-apply-helpers/tsconfig.json
@@ -6,4 +6,4 @@
 	"exclude": [
 		"coverage",
 	],
-}
\ No newline at end of file
+}
diff --git a/api/node_modules/cookie/LICENSE b/api/node_modules/cookie/LICENSE
index 058b6b4..f92d721 100644
--- a/api/node_modules/cookie/LICENSE
+++ b/api/node_modules/cookie/LICENSE
@@ -21,4 +21,3 @@ IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-
diff --git a/api/node_modules/debug/LICENSE b/api/node_modules/debug/LICENSE
index 1a9820e..f710e30 100644
--- a/api/node_modules/debug/LICENSE
+++ b/api/node_modules/debug/LICENSE
@@ -17,4 +17,3 @@ LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE A
 IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-
diff --git a/api/node_modules/debug/README.md b/api/node_modules/debug/README.md
index 9ebdfbf..aa04cbb 100644
--- a/api/node_modules/debug/README.md
+++ b/api/node_modules/debug/README.md
@@ -272,7 +272,7 @@ log('still goes to stdout, but via console.info now');
 ```
 
 ## Extend
-You can simply extend debugger 
+You can simply extend debugger
 ```js
 const log = require('debug')('auth');
 
@@ -302,18 +302,18 @@ console.log(3, debug.enabled('test'));
 
 ```
 
-print :   
+print :
 ```
 1 false
 2 true
 3 false
 ```
 
-Usage :  
-`enable(namespaces)`  
+Usage :
+`enable(namespaces)`
 `namespaces` can include modes separated by a colon and wildcards.
-   
-Note that calling `enable()` completely overrides previously set DEBUG variable : 
+
+Note that calling `enable()` completely overrides previously set DEBUG variable :
 
 ```
 $ DEBUG=foo node -e 'var dbg = require("debug"); dbg.enable("bar"); console.log(dbg.enabled("foo"))'
@@ -356,7 +356,7 @@ enabled or disabled.
 
 ## Usage in child processes
 
-Due to the way `debug` detects if the output is a TTY or not, colors are not shown in child processes when `stderr` is piped. A solution is to pass the `DEBUG_COLORS=1` environment variable to the child process.  
+Due to the way `debug` detects if the output is a TTY or not, colors are not shown in child processes when `stderr` is piped. A solution is to pass the `DEBUG_COLORS=1` environment variable to the child process.
 For example:
 
 ```javascript
diff --git a/api/node_modules/dunder-proto/get.d.ts b/api/node_modules/dunder-proto/get.d.ts
index c7e14d2..88677f5 100644
--- a/api/node_modules/dunder-proto/get.d.ts
+++ b/api/node_modules/dunder-proto/get.d.ts
@@ -2,4 +2,4 @@ declare function getDunderProto(target: {}): object | null;
 
 declare const x: false | typeof getDunderProto;
 
-export = x;
\ No newline at end of file
+export = x;
diff --git a/api/node_modules/dunder-proto/set.d.ts b/api/node_modules/dunder-proto/set.d.ts
index 16bfdfe..c365542 100644
--- a/api/node_modules/dunder-proto/set.d.ts
+++ b/api/node_modules/dunder-proto/set.d.ts
@@ -2,4 +2,4 @@ declare function setDunderProto<P extends null | object>(target: {}, proto: P):
 
 declare const x: false | typeof setDunderProto;
 
-export = x;
\ No newline at end of file
+export = x;
diff --git a/api/node_modules/es-define-property/index.d.ts b/api/node_modules/es-define-property/index.d.ts
index 6012247..41eea88 100644
--- a/api/node_modules/es-define-property/index.d.ts
+++ b/api/node_modules/es-define-property/index.d.ts
@@ -1,3 +1,3 @@
 declare const defineProperty: false | typeof Object.defineProperty;
 
-export = defineProperty;
\ No newline at end of file
+export = defineProperty;
diff --git a/api/node_modules/escape-html/Readme.md b/api/node_modules/escape-html/Readme.md
index 653d9ea..4ba334b 100644
--- a/api/node_modules/escape-html/Readme.md
+++ b/api/node_modules/escape-html/Readme.md
@@ -40,4 +40,4 @@ $ npm run-script bench
 
 ## License
 
-  MIT
\ No newline at end of file
+  MIT
diff --git a/api/node_modules/express/Readme.md b/api/node_modules/express/Readme.md
index 7443b81..6e93749 100644
--- a/api/node_modules/express/Readme.md
+++ b/api/node_modules/express/Readme.md
@@ -245,7 +245,7 @@ The original author of Express is [TJ Holowaychuk](https://github.com/tj)
   * [dakshkhetan](https://github.com/dakshkhetan) - **Daksh Khetan** (he/him)
   * [lucasraziel](https://github.com/lucasraziel) - **Lucas Soares Do Rego**
   * [mertcanaltin](https://github.com/mertcanaltin) - **Mert Can Altin**
-  
+
 </details>
 
 
diff --git a/api/node_modules/finalhandler/HISTORY.md b/api/node_modules/finalhandler/HISTORY.md
index 4bc1850..3b07928 100644
--- a/api/node_modules/finalhandler/HISTORY.md
+++ b/api/node_modules/finalhandler/HISTORY.md
@@ -1,7 +1,7 @@
 v2.1.0 / 2025-03-05
 ==================
 
-  * deps: 
+  * deps:
     * use caret notation for dependency versions
     * encodeurl@^2.0.0
     * debug@^4.4.0
@@ -19,7 +19,7 @@ v2.0.0 / 2024-09-02
 ==================
 
   * drop support for node <18
-  * ignore status message for HTTP/2 (#53) 
+  * ignore status message for HTTP/2 (#53)
 
 v1.3.1 / 2024-09-11
 ==================
diff --git a/api/node_modules/function-bind/LICENSE b/api/node_modules/function-bind/LICENSE
index 62d6d23..5b1b5dc 100644
--- a/api/node_modules/function-bind/LICENSE
+++ b/api/node_modules/function-bind/LICENSE
@@ -17,4 +17,3 @@ AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
-
diff --git a/api/node_modules/get-proto/Object.getPrototypeOf.d.ts b/api/node_modules/get-proto/Object.getPrototypeOf.d.ts
index 028b3ff..2c021f3 100644
--- a/api/node_modules/get-proto/Object.getPrototypeOf.d.ts
+++ b/api/node_modules/get-proto/Object.getPrototypeOf.d.ts
@@ -2,4 +2,4 @@ declare function getProto<O extends object>(object: O): object | null;
 
 declare const x: typeof getProto | null;
 
-export = x;
\ No newline at end of file
+export = x;
diff --git a/api/node_modules/get-proto/Reflect.getPrototypeOf.d.ts b/api/node_modules/get-proto/Reflect.getPrototypeOf.d.ts
index 2388fe0..8183c74 100644
--- a/api/node_modules/get-proto/Reflect.getPrototypeOf.d.ts
+++ b/api/node_modules/get-proto/Reflect.getPrototypeOf.d.ts
@@ -1,3 +1,3 @@
 declare const x: typeof Reflect.getPrototypeOf | null;
 
-export = x;
\ No newline at end of file
+export = x;
diff --git a/api/node_modules/gopd/index.d.ts b/api/node_modules/gopd/index.d.ts
index e228065..4cd0f8d 100644
--- a/api/node_modules/gopd/index.d.ts
+++ b/api/node_modules/gopd/index.d.ts
@@ -2,4 +2,4 @@ declare function gOPD<O extends object, K extends keyof O>(obj: O, prop: K): Pro
 
 declare const fn: typeof gOPD | undefined | null;
 
-export = fn;
\ No newline at end of file
+export = fn;
diff --git a/api/node_modules/has-symbols/index.d.ts b/api/node_modules/has-symbols/index.d.ts
index 9b98595..3626e5c 100644
--- a/api/node_modules/has-symbols/index.d.ts
+++ b/api/node_modules/has-symbols/index.d.ts
@@ -1,3 +1,3 @@
 declare function hasNativeSymbols(): boolean;
 
-export = hasNativeSymbols;
\ No newline at end of file
+export = hasNativeSymbols;
diff --git a/api/node_modules/has-symbols/shams.d.ts b/api/node_modules/has-symbols/shams.d.ts
index 8d0bf24..4c4a20b 100644
--- a/api/node_modules/has-symbols/shams.d.ts
+++ b/api/node_modules/has-symbols/shams.d.ts
@@ -1,3 +1,3 @@
 declare function hasSymbolShams(): boolean;
 
-export = hasSymbolShams;
\ No newline at end of file
+export = hasSymbolShams;
diff --git a/api/node_modules/iconv-lite/.idea/codeStyles/Project.xml b/api/node_modules/iconv-lite/.idea/codeStyles/Project.xml
index 3f2688c..fe4f27d 100644
--- a/api/node_modules/iconv-lite/.idea/codeStyles/Project.xml
+++ b/api/node_modules/iconv-lite/.idea/codeStyles/Project.xml
@@ -44,4 +44,4 @@
       </indentOptions>
     </codeStyleSettings>
   </code_scheme>
-</component>
\ No newline at end of file
+</component>
diff --git a/api/node_modules/iconv-lite/.idea/codeStyles/codeStyleConfig.xml b/api/node_modules/iconv-lite/.idea/codeStyles/codeStyleConfig.xml
index 79ee123..0f7bc51 100644
--- a/api/node_modules/iconv-lite/.idea/codeStyles/codeStyleConfig.xml
+++ b/api/node_modules/iconv-lite/.idea/codeStyles/codeStyleConfig.xml
@@ -2,4 +2,4 @@
   <state>
     <option name="USE_PER_PROJECT_SETTINGS" value="true" />
   </state>
-</component>
\ No newline at end of file
+</component>
diff --git a/api/node_modules/iconv-lite/.idea/iconv-lite.iml b/api/node_modules/iconv-lite/.idea/iconv-lite.iml
index 0c8867d..ab4bb23 100644
--- a/api/node_modules/iconv-lite/.idea/iconv-lite.iml
+++ b/api/node_modules/iconv-lite/.idea/iconv-lite.iml
@@ -9,4 +9,4 @@
     <orderEntry type="inheritedJdk" />
     <orderEntry type="sourceFolder" forTests="false" />
   </component>
-</module>
\ No newline at end of file
+</module>
diff --git a/api/node_modules/iconv-lite/.idea/inspectionProfiles/Project_Default.xml b/api/node_modules/iconv-lite/.idea/inspectionProfiles/Project_Default.xml
index 03d9549..33b4736 100644
--- a/api/node_modules/iconv-lite/.idea/inspectionProfiles/Project_Default.xml
+++ b/api/node_modules/iconv-lite/.idea/inspectionProfiles/Project_Default.xml
@@ -3,4 +3,4 @@
     <option name="myName" value="Project Default" />
     <inspection_tool class="Eslint" enabled="true" level="WARNING" enabled_by_default="true" />
   </profile>
-</component>
\ No newline at end of file
+</component>
diff --git a/api/node_modules/iconv-lite/.idea/modules.xml b/api/node_modules/iconv-lite/.idea/modules.xml
index 5d24f2e..c97e88a 100644
--- a/api/node_modules/iconv-lite/.idea/modules.xml
+++ b/api/node_modules/iconv-lite/.idea/modules.xml
@@ -5,4 +5,4 @@
       <module fileurl="file://$PROJECT_DIR$/.idea/iconv-lite.iml" filepath="$PROJECT_DIR$/.idea/iconv-lite.iml" />
     </modules>
   </component>
-</project>
\ No newline at end of file
+</project>
diff --git a/api/node_modules/iconv-lite/.idea/vcs.xml b/api/node_modules/iconv-lite/.idea/vcs.xml
index 94a25f7..5ace414 100644
--- a/api/node_modules/iconv-lite/.idea/vcs.xml
+++ b/api/node_modules/iconv-lite/.idea/vcs.xml
@@ -3,4 +3,4 @@
   <component name="VcsDirectoryMappings">
     <mapping directory="$PROJECT_DIR$" vcs="Git" />
   </component>
-</project>
\ No newline at end of file
+</project>
diff --git a/api/node_modules/iconv-lite/Changelog.md b/api/node_modules/iconv-lite/Changelog.md
index 464549b..25c9e1d 100644
--- a/api/node_modules/iconv-lite/Changelog.md
+++ b/api/node_modules/iconv-lite/Changelog.md
@@ -14,13 +14,13 @@
 
 ## 0.6.0 / 2020-06-08
   * Updated 'gb18030' encoding to :2005 edition (see https://github.com/whatwg/encoding/issues/22).
-  * Removed `iconv.extendNodeEncodings()` mechanism. It was deprecated 5 years ago and didn't work 
+  * Removed `iconv.extendNodeEncodings()` mechanism. It was deprecated 5 years ago and didn't work
     in recent Node versions.
-  * Reworked Streaming API behavior in browser environments to fix #204. Streaming API will be 
-    excluded by default in browser packs, saving ~100Kb bundle size, unless enabled explicitly using 
+  * Reworked Streaming API behavior in browser environments to fix #204. Streaming API will be
+    excluded by default in browser packs, saving ~100Kb bundle size, unless enabled explicitly using
     `iconv.enableStreamingAPI(require('stream'))`.
   * Updates to development environment & tests:
-    * Added ./test/webpack private package to test complex new use cases that need custom environment. 
+    * Added ./test/webpack private package to test complex new use cases that need custom environment.
       It's tested as a separate job in Travis CI.
     * Updated generation code for the new EUC-KR index file format from Encoding Standard.
     * Removed Buffer() constructor in tests (#197 by @gabrielschulhof).
@@ -36,7 +36,7 @@
 ## 0.5.1 / 2020-01-18
 
   * Added cp720 encoding (#221, by @kr-deps)
-  * (minor) Changed Changelog.md formatting to use h2. 
+  * (minor) Changed Changelog.md formatting to use h2.
 
 
 ## 0.5.0 / 2019-06-26
@@ -144,7 +144,7 @@
 
 ## 0.4.9 / 2015-05-24
 
- * Streamlined BOM handling: strip BOM by default, add BOM when encoding if 
+ * Streamlined BOM handling: strip BOM by default, add BOM when encoding if
    addBOM: true. Added docs to Readme.
  * UTF16 now uses UTF16-LE by default.
  * Fixed minor issue with big5 encoding.
@@ -155,7 +155,7 @@
 
 
 ## 0.4.8 / 2015-04-14
- 
+
  * added alias UNICODE-1-1-UTF-7 for UTF-7 encoding (#94)
 
 
@@ -163,12 +163,12 @@
 
  * stop official support of Node.js v0.8. Should still work, but no guarantees.
    reason: Packages needed for testing are hard to get on Travis CI.
- * work in environment where Object.prototype is monkey patched with enumerable 
+ * work in environment where Object.prototype is monkey patched with enumerable
    props (#89).
 
 
 ## 0.4.6 / 2015-01-12
- 
+
  * fix rare aliases of single-byte encodings (thanks @mscdex)
  * double the timeout for dbcs tests to make them less flaky on travis
 
@@ -208,5 +208,3 @@
  * browserify compatibility added
  * (optional) extend core primitive encodings to make usage even simpler
  * moved from vows to mocha as the testing framework
-
-
diff --git a/api/node_modules/iconv-lite/LICENSE b/api/node_modules/iconv-lite/LICENSE
index d518d83..e3c1f8d 100644
--- a/api/node_modules/iconv-lite/LICENSE
+++ b/api/node_modules/iconv-lite/LICENSE
@@ -18,4 +18,3 @@ NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-
diff --git a/api/node_modules/iconv-lite/README.md b/api/node_modules/iconv-lite/README.md
index 3c97f87..6ed439a 100644
--- a/api/node_modules/iconv-lite/README.md
+++ b/api/node_modules/iconv-lite/README.md
@@ -1,7 +1,7 @@
 ## iconv-lite: Pure JS character encoding conversion
 
  * No need for native code compilation. Quick to install, works on Windows and in sandboxed environments like [Cloud9](http://c9.io).
- * Used in popular projects like [Express.js (body_parser)](https://github.com/expressjs/body-parser), 
+ * Used in popular projects like [Express.js (body_parser)](https://github.com/expressjs/body-parser),
    [Grunt](http://gruntjs.com/), [Nodemailer](http://www.nodemailer.com/), [Yeoman](http://yeoman.io/) and others.
  * Faster than [node-iconv](https://github.com/bnoordhuis/node-iconv) (see below for performance comparison).
  * Intuitive encode/decode API, including Streaming support.
@@ -10,7 +10,7 @@
  * React Native is supported (need to install `stream` module to enable Streaming API).
  * License: MIT.
 
-[![NPM Stats](https://nodei.co/npm/iconv-lite.png)](https://npmjs.org/package/iconv-lite/)  
+[![NPM Stats](https://nodei.co/npm/iconv-lite.png)](https://npmjs.org/package/iconv-lite/)
 [![Build Status](https://travis-ci.org/ashtuchkin/iconv-lite.svg?branch=master)](https://travis-ci.org/ashtuchkin/iconv-lite)
 [![npm](https://img.shields.io/npm/v/iconv-lite.svg)](https://npmjs.org/package/iconv-lite/)
 [![npm downloads](https://img.shields.io/npm/dm/iconv-lite.svg)](https://npmjs.org/package/iconv-lite/)
@@ -63,8 +63,8 @@ http.createServer(function(req, res) {
 
  *  All node.js native encodings: utf8, ucs2 / utf16-le, ascii, binary, base64, hex.
  *  Additional unicode encodings: utf16, utf16-be, utf-7, utf-7-imap, utf32, utf32-le, and utf32-be.
- *  All widespread singlebyte encodings: Windows 125x family, ISO-8859 family, 
-    IBM/DOS codepages, Macintosh family, KOI8 family, all others supported by iconv library. 
+ *  All widespread singlebyte encodings: Windows 125x family, ISO-8859 family,
+    IBM/DOS codepages, Macintosh family, KOI8 family, all others supported by iconv library.
     Aliases like 'latin1', 'us-ascii' also supported.
  *  All widespread multibyte encodings: CP932, CP936, CP949, CP950, GB2312, GBK, GB18030, Big5, Shift_JIS, EUC-JP.
 
@@ -77,7 +77,7 @@ Multibyte encodings are generated from [Unicode.org mappings](http://www.unicode
 
 ## Encoding/decoding speed
 
-Comparison with node-iconv module (1000x256kb, on MacBook Pro, Core i5/2.6 GHz, Node v0.12.0). 
+Comparison with node-iconv module (1000x256kb, on MacBook Pro, Core i5/2.6 GHz, Node v0.12.0).
 Note: your results may vary, so please always check on your hardware.
 
     operation             iconv@2.1.4   iconv-lite@0.4.7
@@ -97,21 +97,21 @@ Note: your results may vary, so please always check on your hardware.
 
 This library supports UTF-16LE, UTF-16BE and UTF-16 encodings. First two are straightforward, but UTF-16 is trying to be
 smart about endianness in the following ways:
- * Decoding: uses BOM and 'spaces heuristic' to determine input endianness. Default is UTF-16LE, but can be 
+ * Decoding: uses BOM and 'spaces heuristic' to determine input endianness. Default is UTF-16LE, but can be
    overridden with `defaultEncoding: 'utf-16be'` option. Strips BOM unless `stripBOM: false`.
  * Encoding: uses UTF-16LE and writes BOM by default. Use `addBOM: false` to override.
 
 ## UTF-32 Encodings
 
-This library supports UTF-32LE, UTF-32BE and UTF-32 encodings. Like the UTF-16 encoding above, UTF-32 defaults to UTF-32LE, but uses BOM and 'spaces heuristics' to determine input endianness. 
+This library supports UTF-32LE, UTF-32BE and UTF-32 encodings. Like the UTF-16 encoding above, UTF-32 defaults to UTF-32LE, but uses BOM and 'spaces heuristics' to determine input endianness.
  * The default of UTF-32LE can be overridden with the `defaultEncoding: 'utf-32be'` option. Strips BOM unless `stripBOM: false`.
  * Encoding: uses UTF-32LE and writes BOM by default. Use `addBOM: false` to override. (`defaultEncoding: 'utf-32be'` can also be used here to change encoding.)
 
 ## Other notes
 
-When decoding, be sure to supply a Buffer to decode() method, otherwise [bad things usually happen](https://github.com/ashtuchkin/iconv-lite/wiki/Use-Buffers-when-decoding).  
-Untranslatable characters are set to � or ?. No transliteration is currently supported.  
-Node versions 0.10.31 and 0.11.13 are buggy, don't use them (see #65, #77).  
+When decoding, be sure to supply a Buffer to decode() method, otherwise [bad things usually happen](https://github.com/ashtuchkin/iconv-lite/wiki/Use-Buffers-when-decoding).
+Untranslatable characters are set to � or ?. No transliteration is currently supported.
+Node versions 0.10.31 and 0.11.13 are buggy, don't use them (see #65, #77).
 
 ## Testing
 
@@ -120,7 +120,7 @@ $ git clone git@github.com:ashtuchkin/iconv-lite.git
 $ cd iconv-lite
 $ npm install
 $ npm test
-    
+
 $ # To view performance:
 $ node test/performance.js
 
diff --git a/api/node_modules/iconv-lite/encodings/dbcs-codec.js b/api/node_modules/iconv-lite/encodings/dbcs-codec.js
index fa83917..e66df3f 100644
--- a/api/node_modules/iconv-lite/encodings/dbcs-codec.js
+++ b/api/node_modules/iconv-lite/encodings/dbcs-codec.js
@@ -42,7 +42,7 @@ function DBCSCodec(codecOptions, iconv) {
     this.decodeTables = [];
     this.decodeTables[0] = UNASSIGNED_NODE.slice(0); // Create root node.
 
-    // Sometimes a MBCS char corresponds to a sequence of unicode chars. We store them as arrays of integers here. 
+    // Sometimes a MBCS char corresponds to a sequence of unicode chars. We store them as arrays of integers here.
     this.decodeTableSeq = [];
 
     // Actual mapping tables consist of chunks. Use them to fill up decode tables.
@@ -93,7 +93,7 @@ function DBCSCodec(codecOptions, iconv) {
 
     this.defaultCharUnicode = iconv.defaultCharUnicode;
 
-    
+
     // Encode tables: Unicode -> DBCS.
 
     // `encodeTable` is array mapping from unicode char to encoded char. All its values are integers for performance.
@@ -102,7 +102,7 @@ function DBCSCodec(codecOptions, iconv) {
     //         == UNASSIGNED -> no conversion found. Output a default char.
     //         <= SEQ_START  -> it's an index in encodeTableSeq, see below. The character starts a sequence.
     this.encodeTable = [];
-    
+
     // `encodeTableSeq` is used when a sequence of unicode characters is encoded as a single code. We use a tree of
     // objects where keys correspond to characters in sequence and leafs are the encoded dbcs values. A special DEF_CHAR key
     // means end of sequence (needed when one sequence is a strict subsequence of another).
@@ -120,7 +120,7 @@ function DBCSCodec(codecOptions, iconv) {
                 for (var j = val.from; j <= val.to; j++)
                     skipEncodeChars[j] = true;
         }
-        
+
     // Use decode trie to recursively fill out encode tables.
     this._fillEncodeTable(0, 0, skipEncodeChars);
 
@@ -198,7 +198,7 @@ DBCSCodec.prototype._addDecodeChunk = function(chunk) {
                 else
                     writeTable[curAddr++] = code; // Basic char
             }
-        } 
+        }
         else if (typeof part === "number") { // Integer, meaning increasing sequence starting with prev character.
             var charCode = writeTable[curAddr - 1] + 1;
             for (var l = 0; l < part; l++)
@@ -229,7 +229,7 @@ DBCSCodec.prototype._setEncodeChar = function(uCode, dbcsCode) {
 }
 
 DBCSCodec.prototype._setEncodeSequence = function(seq, dbcsCode) {
-    
+
     // Get the root of character tree according to first character of the sequence.
     var uCode = seq[0];
     var bucket = this._getEncodeBucket(uCode);
@@ -303,7 +303,7 @@ function DBCSEncoder(options, codec) {
     // Encoder state
     this.leadSurrogate = -1;
     this.seqObj = undefined;
-    
+
     // Static data
     this.encodeTable = codec.encodeTable;
     this.encodeTableSeq = codec.encodeTableSeq;
@@ -325,7 +325,7 @@ DBCSEncoder.prototype.write = function(str) {
         }
         else {
             var uCode = nextChar;
-            nextChar = -1;    
+            nextChar = -1;
         }
 
         // 1. Handle surrogates.
@@ -347,7 +347,7 @@ DBCSEncoder.prototype.write = function(str) {
                     // Incomplete surrogate pair - only trail surrogate found.
                     uCode = UNASSIGNED;
                 }
-                
+
             }
         }
         else if (leadSurrogate !== -1) {
@@ -388,7 +388,7 @@ DBCSEncoder.prototype.write = function(str) {
             var subtable = this.encodeTable[uCode >> 8];
             if (subtable !== undefined)
                 dbcsCode = subtable[uCode & 0xFF];
-            
+
             if (dbcsCode <= SEQ_START) { // Sequence start
                 seqObj = this.encodeTableSeq[SEQ_START-dbcsCode];
                 continue;
@@ -411,7 +411,7 @@ DBCSEncoder.prototype.write = function(str) {
         // 3. Write dbcsCode character.
         if (dbcsCode === UNASSIGNED)
             dbcsCode = this.defaultCharSingleByte;
-        
+
         if (dbcsCode < 0x100) {
             newBuf[j++] = dbcsCode;
         }
@@ -463,7 +463,7 @@ DBCSEncoder.prototype.end = function() {
         newBuf[j++] = this.defaultCharSingleByte;
         this.leadSurrogate = -1;
     }
-    
+
     return newBuf.slice(0, j);
 }
 
@@ -487,7 +487,7 @@ function DBCSDecoder(options, codec) {
 
 DBCSDecoder.prototype.write = function(buf) {
     var newBuf = Buffer.alloc(buf.length*2),
-        nodeIdx = this.nodeIdx, 
+        nodeIdx = this.nodeIdx,
         prevBytes = this.prevBytes, prevOffset = this.prevBytes.length,
         seqStart = -this.prevBytes.length, // idx of the start of current parsed sequence.
         uCode;
@@ -498,7 +498,7 @@ DBCSDecoder.prototype.write = function(buf) {
         // Lookup in current trie node.
         var uCode = this.decodeTables[nodeIdx][curByte];
 
-        if (uCode >= 0) { 
+        if (uCode >= 0) {
             // Normal character, just use it.
         }
         else if (uCode === UNASSIGNED) { // Unknown char.
@@ -510,9 +510,9 @@ DBCSDecoder.prototype.write = function(buf) {
             if (i >= 3) {
                 var ptr = (buf[i-3]-0x81)*12600 + (buf[i-2]-0x30)*1260 + (buf[i-1]-0x81)*10 + (curByte-0x30);
             } else {
-                var ptr = (prevBytes[i-3+prevOffset]-0x81)*12600 + 
-                          (((i-2 >= 0) ? buf[i-2] : prevBytes[i-2+prevOffset])-0x30)*1260 + 
-                          (((i-1 >= 0) ? buf[i-1] : prevBytes[i-1+prevOffset])-0x81)*10 + 
+                var ptr = (prevBytes[i-3+prevOffset]-0x81)*12600 +
+                          (((i-2 >= 0) ? buf[i-2] : prevBytes[i-2+prevOffset])-0x30)*1260 +
+                          (((i-1 >= 0) ? buf[i-1] : prevBytes[i-1+prevOffset])-0x81)*10 +
                           (curByte-0x30);
             }
             var idx = findIdx(this.gb18030.gbChars, ptr);
@@ -535,7 +535,7 @@ DBCSDecoder.prototype.write = function(buf) {
             throw new Error("iconv-lite internal error: invalid decoding table value " + uCode + " at " + nodeIdx + "/" + curByte);
 
         // Write the character to buffer, handling higher planes using surrogate pair.
-        if (uCode >= 0x10000) { 
+        if (uCode >= 0x10000) {
             uCode -= 0x10000;
             var uCodeLead = 0xD800 | (uCode >> 10);
             newBuf[j++] = uCodeLead & 0xFF;
@@ -594,4 +594,3 @@ function findIdx(table, val) {
     }
     return l;
 }
-
diff --git a/api/node_modules/iconv-lite/encodings/dbcs-data.js b/api/node_modules/iconv-lite/encodings/dbcs-data.js
index 0d17e58..c10e431 100644
--- a/api/node_modules/iconv-lite/encodings/dbcs-data.js
+++ b/api/node_modules/iconv-lite/encodings/dbcs-data.js
@@ -5,11 +5,11 @@
 // require()-s are direct to support Browserify.
 
 module.exports = {
-    
+
     // == Japanese/ShiftJIS ====================================================
     // All japanese encodings are based on JIS X set of standards:
     // JIS X 0201 - Single-byte encoding of ASCII + ¥ + Kana chars at 0xA1-0xDF.
-    // JIS X 0208 - Main set of 6879 characters, placed in 94x94 plane, to be encoded by 2 bytes. 
+    // JIS X 0208 - Main set of 6879 characters, placed in 94x94 plane, to be encoded by 2 bytes.
     //              Has several variations in 1978, 1983, 1990 and 1997.
     // JIS X 0212 - Supplementary plane of 6067 chars in 94x94 plane. 1990. Effectively dead.
     // JIS X 0213 - Extension and modern replacement of 0208 and 0212. Total chars: 11233.
@@ -27,7 +27,7 @@ module.exports = {
     //               0x8F, (0xA1-0xFE)x2 - 0212 plane (94x94).
     //  * JIS X 208: 7-bit, direct encoding of 0208. Byte ranges: 0x21-0x7E (94 values). Uncommon.
     //               Used as-is in ISO2022 family.
-    //  * ISO2022-JP: Stateful encoding, with escape sequences to switch between ASCII, 
+    //  * ISO2022-JP: Stateful encoding, with escape sequences to switch between ASCII,
     //                0201-1976 Roman, 0208-1978, 0208-1983.
     //  * ISO2022-JP-1: Adds esc seq for 0212-1990.
     //  * ISO2022-JP-2: Adds esc seq for GB2313-1980, KSX1001-1992, ISO8859-1, ISO8859-7.
@@ -139,7 +139,7 @@ module.exports = {
     //  * Windows CP 951: Microsoft variant of Big5-HKSCS-2001. Seems to be never public. http://me.abelcheung.org/articles/research/what-is-cp951/
     //  * Big5-2003 (Taiwan standard) almost superset of cp950.
     //  * Unicode-at-on (UAO) / Mozilla 1.8. Falling out of use on the Web. Not supported by other browsers.
-    //  * Big5-HKSCS (-2001, -2004, -2008). Hong Kong standard. 
+    //  * Big5-HKSCS (-2001, -2004, -2008). Hong Kong standard.
     //    many unicode code points moved from PUA to Supplementary plane (U+2XXXX) over the years.
     //    Plus, it has 4 combining sequences.
     //    Seems that Mozilla refused to support it for 10 yrs. https://bugzilla.mozilla.org/show_bug.cgi?id=162431 https://bugzilla.mozilla.org/show_bug.cgi?id=310299
@@ -150,7 +150,7 @@ module.exports = {
     //    In the encoder, it might make sense to support encoding old PUA mappings to Big5 bytes seq-s.
     //    Official spec: http://www.ogcio.gov.hk/en/business/tech_promotion/ccli/terms/doc/2003cmp_2008.txt
     //                   http://www.ogcio.gov.hk/tc/business/tech_promotion/ccli/terms/doc/hkscs-2008-big5-iso.txt
-    // 
+    //
     // Current understanding of how to deal with Big5(-HKSCS) is in the Encoding Standard, http://encoding.spec.whatwg.org/#big5-encoder
     // Unicode mapping (http://www.unicode.org/Public/MAPPINGS/OBSOLETE/EASTASIA/OTHER/BIG5.TXT) is said to be wrong.
 
diff --git a/api/node_modules/iconv-lite/encodings/internal.js b/api/node_modules/iconv-lite/encodings/internal.js
index dc1074f..fdcf375 100644
--- a/api/node_modules/iconv-lite/encodings/internal.js
+++ b/api/node_modules/iconv-lite/encodings/internal.js
@@ -146,7 +146,7 @@ function InternalDecoderCesu8(options, codec) {
 }
 
 InternalDecoderCesu8.prototype.write = function(buf) {
-    var acc = this.acc, contBytes = this.contBytes, accBytes = this.accBytes, 
+    var acc = this.acc, contBytes = this.contBytes, accBytes = this.accBytes,
         res = '';
     for (var i = 0; i < buf.length; i++) {
         var curByte = buf[i];
diff --git a/api/node_modules/iconv-lite/encodings/sbcs-codec.js b/api/node_modules/iconv-lite/encodings/sbcs-codec.js
index abac5ff..2289cf0 100644
--- a/api/node_modules/iconv-lite/encodings/sbcs-codec.js
+++ b/api/node_modules/iconv-lite/encodings/sbcs-codec.js
@@ -2,17 +2,17 @@
 var Buffer = require("safer-buffer").Buffer;
 
 // Single-byte codec. Needs a 'chars' string parameter that contains 256 or 128 chars that
-// correspond to encoded bytes (if 128 - then lower half is ASCII). 
+// correspond to encoded bytes (if 128 - then lower half is ASCII).
 
 exports._sbcs = SBCSCodec;
 function SBCSCodec(codecOptions, iconv) {
     if (!codecOptions)
         throw new Error("SBCS codec is called without the data.")
-    
+
     // Prepare char buffer for decoding.
     if (!codecOptions.chars || (codecOptions.chars.length !== 128 && codecOptions.chars.length !== 256))
         throw new Error("Encoding '"+codecOptions.type+"' has incorrect 'chars' (must be of len 128 or 256)");
-    
+
     if (codecOptions.chars.length === 128) {
         var asciiString = "";
         for (var i = 0; i < 128; i++)
@@ -21,7 +21,7 @@ function SBCSCodec(codecOptions, iconv) {
     }
 
     this.decodeBuf = Buffer.from(codecOptions.chars, 'ucs2');
-    
+
     // Encoding buffer.
     var encodeBuf = Buffer.alloc(65536, iconv.defaultCharSingleByte.charCodeAt(0));
 
@@ -43,7 +43,7 @@ SBCSEncoder.prototype.write = function(str) {
     var buf = Buffer.alloc(str.length);
     for (var i = 0; i < str.length; i++)
         buf[i] = this.encodeBuf[str.charCodeAt(i)];
-    
+
     return buf;
 }
 
diff --git a/api/node_modules/iconv-lite/encodings/sbcs-data-generated.js b/api/node_modules/iconv-lite/encodings/sbcs-data-generated.js
index 9b48236..20d5000 100644
--- a/api/node_modules/iconv-lite/encodings/sbcs-data-generated.js
+++ b/api/node_modules/iconv-lite/encodings/sbcs-data-generated.js
@@ -448,4 +448,4 @@ module.exports = {
     "type": "_sbcs",
     "chars": "���������������������������������กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤลฦวศษสหฬอฮฯะัาำิีึืฺุู����฿เแโใไๅๆ็่้๊๋์ํ๎๏๐๑๒๓๔๕๖๗๘๙๚๛����"
   }
-}
\ No newline at end of file
+}
diff --git a/api/node_modules/iconv-lite/encodings/sbcs-data.js b/api/node_modules/iconv-lite/encodings/sbcs-data.js
index 066f904..64f5b4e 100644
--- a/api/node_modules/iconv-lite/encodings/sbcs-data.js
+++ b/api/node_modules/iconv-lite/encodings/sbcs-data.js
@@ -176,4 +176,3 @@ module.exports = {
     "mac": "macintosh",
     "csmacintosh": "macintosh",
 };
-
diff --git a/api/node_modules/iconv-lite/encodings/tables/gb18030-ranges.json b/api/node_modules/iconv-lite/encodings/tables/gb18030-ranges.json
index 85c6934..b6b6f0d 100644
--- a/api/node_modules/iconv-lite/encodings/tables/gb18030-ranges.json
+++ b/api/node_modules/iconv-lite/encodings/tables/gb18030-ranges.json
@@ -1 +1 @@
-{"uChars":[128,165,169,178,184,216,226,235,238,244,248,251,253,258,276,284,300,325,329,334,364,463,465,467,469,471,473,475,477,506,594,610,712,716,730,930,938,962,970,1026,1104,1106,8209,8215,8218,8222,8231,8241,8244,8246,8252,8365,8452,8454,8458,8471,8482,8556,8570,8596,8602,8713,8720,8722,8726,8731,8737,8740,8742,8748,8751,8760,8766,8777,8781,8787,8802,8808,8816,8854,8858,8870,8896,8979,9322,9372,9548,9588,9616,9622,9634,9652,9662,9672,9676,9680,9702,9735,9738,9793,9795,11906,11909,11913,11917,11928,11944,11947,11951,11956,11960,11964,11979,12284,12292,12312,12319,12330,12351,12436,12447,12535,12543,12586,12842,12850,12964,13200,13215,13218,13253,13263,13267,13270,13384,13428,13727,13839,13851,14617,14703,14801,14816,14964,15183,15471,15585,16471,16736,17208,17325,17330,17374,17623,17997,18018,18212,18218,18301,18318,18760,18811,18814,18820,18823,18844,18848,18872,19576,19620,19738,19887,40870,59244,59336,59367,59413,59417,59423,59431,59437,59443,59452,59460,59478,59493,63789,63866,63894,63976,63986,64016,64018,64021,64025,64034,64037,64042,65074,65093,65107,65112,65127,65132,65375,65510,65536],"gbChars":[0,36,38,45,50,81,89,95,96,100,103,104,105,109,126,133,148,172,175,179,208,306,307,308,309,310,311,312,313,341,428,443,544,545,558,741,742,749,750,805,819,820,7922,7924,7925,7927,7934,7943,7944,7945,7950,8062,8148,8149,8152,8164,8174,8236,8240,8262,8264,8374,8380,8381,8384,8388,8390,8392,8393,8394,8396,8401,8406,8416,8419,8424,8437,8439,8445,8482,8485,8496,8521,8603,8936,8946,9046,9050,9063,9066,9076,9092,9100,9108,9111,9113,9131,9162,9164,9218,9219,11329,11331,11334,11336,11346,11361,11363,11366,11370,11372,11375,11389,11682,11686,11687,11692,11694,11714,11716,11723,11725,11730,11736,11982,11989,12102,12336,12348,12350,12384,12393,12395,12397,12510,12553,12851,12962,12973,13738,13823,13919,13933,14080,14298,14585,14698,15583,15847,16318,16434,16438,16481,16729,17102,17122,17315,17320,17402,17418,17859,17909,17911,17915,17916,17936,17939,17961,18664,18703,18814,18962,19043,33469,33470,33471,33484,33485,33490,33497,33501,33505,33513,33520,33536,33550,37845,37921,37948,38029,38038,38064,38065,38066,38069,38075,38076,38078,39108,39109,39113,39114,39115,39116,39265,39394,189000]}
\ No newline at end of file
+{"uChars":[128,165,169,178,184,216,226,235,238,244,248,251,253,258,276,284,300,325,329,334,364,463,465,467,469,471,473,475,477,506,594,610,712,716,730,930,938,962,970,1026,1104,1106,8209,8215,8218,8222,8231,8241,8244,8246,8252,8365,8452,8454,8458,8471,8482,8556,8570,8596,8602,8713,8720,8722,8726,8731,8737,8740,8742,8748,8751,8760,8766,8777,8781,8787,8802,8808,8816,8854,8858,8870,8896,8979,9322,9372,9548,9588,9616,9622,9634,9652,9662,9672,9676,9680,9702,9735,9738,9793,9795,11906,11909,11913,11917,11928,11944,11947,11951,11956,11960,11964,11979,12284,12292,12312,12319,12330,12351,12436,12447,12535,12543,12586,12842,12850,12964,13200,13215,13218,13253,13263,13267,13270,13384,13428,13727,13839,13851,14617,14703,14801,14816,14964,15183,15471,15585,16471,16736,17208,17325,17330,17374,17623,17997,18018,18212,18218,18301,18318,18760,18811,18814,18820,18823,18844,18848,18872,19576,19620,19738,19887,40870,59244,59336,59367,59413,59417,59423,59431,59437,59443,59452,59460,59478,59493,63789,63866,63894,63976,63986,64016,64018,64021,64025,64034,64037,64042,65074,65093,65107,65112,65127,65132,65375,65510,65536],"gbChars":[0,36,38,45,50,81,89,95,96,100,103,104,105,109,126,133,148,172,175,179,208,306,307,308,309,310,311,312,313,341,428,443,544,545,558,741,742,749,750,805,819,820,7922,7924,7925,7927,7934,7943,7944,7945,7950,8062,8148,8149,8152,8164,8174,8236,8240,8262,8264,8374,8380,8381,8384,8388,8390,8392,8393,8394,8396,8401,8406,8416,8419,8424,8437,8439,8445,8482,8485,8496,8521,8603,8936,8946,9046,9050,9063,9066,9076,9092,9100,9108,9111,9113,9131,9162,9164,9218,9219,11329,11331,11334,11336,11346,11361,11363,11366,11370,11372,11375,11389,11682,11686,11687,11692,11694,11714,11716,11723,11725,11730,11736,11982,11989,12102,12336,12348,12350,12384,12393,12395,12397,12510,12553,12851,12962,12973,13738,13823,13919,13933,14080,14298,14585,14698,15583,15847,16318,16434,16438,16481,16729,17102,17122,17315,17320,17402,17418,17859,17909,17911,17915,17916,17936,17939,17961,18664,18703,18814,18962,19043,33469,33470,33471,33484,33485,33490,33497,33501,33505,33513,33520,33536,33550,37845,37921,37948,38029,38038,38064,38065,38066,38069,38075,38076,38078,39108,39109,39113,39114,39115,39116,39265,39394,189000]}
diff --git a/api/node_modules/iconv-lite/encodings/utf16.js b/api/node_modules/iconv-lite/encodings/utf16.js
index 97d0669..94ccc45 100644
--- a/api/node_modules/iconv-lite/encodings/utf16.js
+++ b/api/node_modules/iconv-lite/encodings/utf16.js
@@ -116,7 +116,7 @@ Utf16Decoder.prototype.write = function(buf) {
         // Codec is not chosen yet. Accumulate initial bytes.
         this.initialBufs.push(buf);
         this.initialBufsLen += buf.length;
-        
+
         if (this.initialBufsLen < 16) // We need more bytes to use space heuristic (see below)
             return '';
 
@@ -193,5 +193,3 @@ function detectEncoding(bufs, defaultEncoding) {
     // Couldn't decide (likely all zeros or not enough data).
     return defaultEncoding || 'utf-16le';
 }
-
-
diff --git a/api/node_modules/iconv-lite/encodings/utf32.js b/api/node_modules/iconv-lite/encodings/utf32.js
index 2fa900a..d3ed794 100644
--- a/api/node_modules/iconv-lite/encodings/utf32.js
+++ b/api/node_modules/iconv-lite/encodings/utf32.js
@@ -118,7 +118,7 @@ Utf32Decoder.prototype.write = function(src) {
     if (overflow.length > 0) {
         for (; i < src.length && overflow.length < 4; i++)
             overflow.push(src[i]);
-        
+
         if (overflow.length === 4) {
             // NOTE: codepoint is a signed int32 and can be negative.
             // NOTE: We copied this block from below to help V8 optimize it (it works with array, not buffer).
@@ -157,7 +157,7 @@ function _writeCodepoint(dst, offset, codepoint, badChar) {
     if (codepoint < 0 || codepoint > 0x10FFFF) {
         // Not a valid Unicode codepoint
         codepoint = badChar;
-    } 
+    }
 
     // Ephemeral Planes: Write high surrogate.
     if (codepoint >= 0x10000) {
@@ -229,7 +229,7 @@ function Utf32AutoDecoder(options, codec) {
 }
 
 Utf32AutoDecoder.prototype.write = function(buf) {
-    if (!this.decoder) { 
+    if (!this.decoder) {
         // Codec is not chosen yet. Accumulate initial bytes.
         this.initialBufs.push(buf);
         this.initialBufsLen += buf.length;
diff --git a/api/node_modules/iconv-lite/encodings/utf7.js b/api/node_modules/iconv-lite/encodings/utf7.js
index eacae34..8f47aa8 100644
--- a/api/node_modules/iconv-lite/encodings/utf7.js
+++ b/api/node_modules/iconv-lite/encodings/utf7.js
@@ -27,8 +27,8 @@ Utf7Encoder.prototype.write = function(str) {
     // Naive implementation.
     // Non-direct chars are encoded as "+<base64>-"; single "+" char is encoded as "+-".
     return Buffer.from(str.replace(nonDirectChars, function(chunk) {
-        return "+" + (chunk === '+' ? '' : 
-            this.iconv.encode(chunk, 'utf16-be').toString('base64').replace(/=+$/, '')) 
+        return "+" + (chunk === '+' ? '' :
+            this.iconv.encode(chunk, 'utf16-be').toString('base64').replace(/=+$/, ''))
             + "-";
     }.bind(this)));
 }
@@ -50,7 +50,7 @@ var base64Chars = [];
 for (var i = 0; i < 256; i++)
     base64Chars[i] = base64Regex.test(String.fromCharCode(i));
 
-var plusChar = '+'.charCodeAt(0), 
+var plusChar = '+'.charCodeAt(0),
     minusChar = '-'.charCodeAt(0),
     andChar = '&'.charCodeAt(0);
 
@@ -286,5 +286,3 @@ Utf7IMAPDecoder.prototype.end = function() {
     this.base64Accum = '';
     return res;
 }
-
-
diff --git a/api/node_modules/iconv-lite/lib/bom-handling.js b/api/node_modules/iconv-lite/lib/bom-handling.js
index 1050872..b2b1e42 100644
--- a/api/node_modules/iconv-lite/lib/bom-handling.js
+++ b/api/node_modules/iconv-lite/lib/bom-handling.js
@@ -49,4 +49,3 @@ StripBOMWrapper.prototype.write = function(buf) {
 StripBOMWrapper.prototype.end = function() {
     return this.decoder.end();
 }
-
diff --git a/api/node_modules/iconv-lite/lib/index.js b/api/node_modules/iconv-lite/lib/index.js
index 657701c..4248fc1 100644
--- a/api/node_modules/iconv-lite/lib/index.js
+++ b/api/node_modules/iconv-lite/lib/index.js
@@ -21,7 +21,7 @@ iconv.encode = function encode(str, encoding, options) {
 
     var res = encoder.write(str);
     var trail = encoder.end();
-    
+
     return (trail && trail.length > 0) ? Buffer.concat([res, trail]) : res;
 }
 
@@ -61,7 +61,7 @@ iconv._codecDataCache = {};
 iconv.getCodec = function getCodec(encoding) {
     if (!iconv.encodings)
         iconv.encodings = require("../encodings"); // Lazy load all encoding definitions.
-    
+
     // Canonicalize encoding name: strip all non-alphanumeric chars and appended year.
     var enc = iconv._canonicalizeEncoding(encoding);
 
@@ -85,7 +85,7 @@ iconv.getCodec = function getCodec(encoding) {
 
                 if (!codecOptions.encodingName)
                     codecOptions.encodingName = enc;
-                
+
                 enc = codecDef.type;
                 break;
 
diff --git a/api/node_modules/iconv-lite/lib/streams.js b/api/node_modules/iconv-lite/lib/streams.js
index a150648..661767a 100644
--- a/api/node_modules/iconv-lite/lib/streams.js
+++ b/api/node_modules/iconv-lite/lib/streams.js
@@ -2,7 +2,7 @@
 
 var Buffer = require("safer-buffer").Buffer;
 
-// NOTE: Due to 'stream' module being pretty large (~100Kb, significant in browser environments), 
+// NOTE: Due to 'stream' module being pretty large (~100Kb, significant in browser environments),
 // we opt to dependency-inject it instead of creating a hard dependency.
 module.exports = function(stream_module) {
     var Transform = stream_module.Transform;
@@ -84,7 +84,7 @@ module.exports = function(stream_module) {
     IconvLiteDecoderStream.prototype._flush = function(done) {
         try {
             var res = this.conv.end();
-            if (res && res.length) this.push(res, this.encoding);                
+            if (res && res.length) this.push(res, this.encoding);
             done();
         }
         catch (e) {
diff --git a/api/node_modules/inherits/LICENSE b/api/node_modules/inherits/LICENSE
index dea3013..052085c 100644
--- a/api/node_modules/inherits/LICENSE
+++ b/api/node_modules/inherits/LICENSE
@@ -13,4 +13,3 @@ INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 PERFORMANCE OF THIS SOFTWARE.
-
diff --git a/api/node_modules/ipaddr.js/ipaddr.min.js b/api/node_modules/ipaddr.js/ipaddr.min.js
index b54a7cc..ad92104 100644
--- a/api/node_modules/ipaddr.js/ipaddr.min.js
+++ b/api/node_modules/ipaddr.js/ipaddr.min.js
@@ -1 +1 @@
-(function(){var r,t,n,e,i,o,a,s;t={},s=this,"undefined"!=typeof module&&null!==module&&module.exports?module.exports=t:s.ipaddr=t,a=function(r,t,n,e){var i,o;if(r.length!==t.length)throw new Error("ipaddr: cannot match CIDR for objects with different lengths");for(i=0;e>0;){if((o=n-e)<0&&(o=0),r[i]>>o!=t[i]>>o)return!1;e-=n,i+=1}return!0},t.subnetMatch=function(r,t,n){var e,i,o,a,s;null==n&&(n="unicast");for(o in t)for(!(a=t[o])[0]||a[0]instanceof Array||(a=[a]),e=0,i=a.length;e<i;e++)if(s=a[e],r.kind()===s[0].kind()&&r.match.apply(r,s))return o;return n},t.IPv4=function(){function r(r){var t,n,e;if(4!==r.length)throw new Error("ipaddr: ipv4 octet count should be 4");for(t=0,n=r.length;t<n;t++)if(!(0<=(e=r[t])&&e<=255))throw new Error("ipaddr: ipv4 octet should fit in 8 bits");this.octets=r}return r.prototype.kind=function(){return"ipv4"},r.prototype.toString=function(){return this.octets.join(".")},r.prototype.toNormalizedString=function(){return this.toString()},r.prototype.toByteArray=function(){return this.octets.slice(0)},r.prototype.match=function(r,t){var n;if(void 0===t&&(r=(n=r)[0],t=n[1]),"ipv4"!==r.kind())throw new Error("ipaddr: cannot match ipv4 address with non-ipv4 one");return a(this.octets,r.octets,8,t)},r.prototype.SpecialRanges={unspecified:[[new r([0,0,0,0]),8]],broadcast:[[new r([255,255,255,255]),32]],multicast:[[new r([224,0,0,0]),4]],linkLocal:[[new r([169,254,0,0]),16]],loopback:[[new r([127,0,0,0]),8]],carrierGradeNat:[[new r([100,64,0,0]),10]],private:[[new r([10,0,0,0]),8],[new r([172,16,0,0]),12],[new r([192,168,0,0]),16]],reserved:[[new r([192,0,0,0]),24],[new r([192,0,2,0]),24],[new r([192,88,99,0]),24],[new r([198,51,100,0]),24],[new r([203,0,113,0]),24],[new r([240,0,0,0]),4]]},r.prototype.range=function(){return t.subnetMatch(this,this.SpecialRanges)},r.prototype.toIPv4MappedAddress=function(){return t.IPv6.parse("::ffff:"+this.toString())},r.prototype.prefixLengthFromSubnetMask=function(){var r,t,n,e,i,o,a;for(a={0:8,128:7,192:6,224:5,240:4,248:3,252:2,254:1,255:0},r=0,i=!1,t=n=3;n>=0;t=n+=-1){if(!((e=this.octets[t])in a))return null;if(o=a[e],i&&0!==o)return null;8!==o&&(i=!0),r+=o}return 32-r},r}(),n="(0?\\d+|0x[a-f0-9]+)",e={fourOctet:new RegExp("^"+n+"\\."+n+"\\."+n+"\\."+n+"$","i"),longValue:new RegExp("^"+n+"$","i")},t.IPv4.parser=function(r){var t,n,i,o,a;if(n=function(r){return"0"===r[0]&&"x"!==r[1]?parseInt(r,8):parseInt(r)},t=r.match(e.fourOctet))return function(){var r,e,o,a;for(a=[],r=0,e=(o=t.slice(1,6)).length;r<e;r++)i=o[r],a.push(n(i));return a}();if(t=r.match(e.longValue)){if((a=n(t[1]))>4294967295||a<0)throw new Error("ipaddr: address outside defined range");return function(){var r,t;for(t=[],o=r=0;r<=24;o=r+=8)t.push(a>>o&255);return t}().reverse()}return null},t.IPv6=function(){function r(r,t){var n,e,i,o,a,s;if(16===r.length)for(this.parts=[],n=e=0;e<=14;n=e+=2)this.parts.push(r[n]<<8|r[n+1]);else{if(8!==r.length)throw new Error("ipaddr: ipv6 part count should be 8 or 16");this.parts=r}for(i=0,o=(s=this.parts).length;i<o;i++)if(!(0<=(a=s[i])&&a<=65535))throw new Error("ipaddr: ipv6 part should fit in 16 bits");t&&(this.zoneId=t)}return r.prototype.kind=function(){return"ipv6"},r.prototype.toString=function(){return this.toNormalizedString().replace(/((^|:)(0(:|$))+)/,"::")},r.prototype.toRFC5952String=function(){var r,t,n,e,i;for(e=/((^|:)(0(:|$)){2,})/g,i=this.toNormalizedString(),r=0,t=-1;n=e.exec(i);)n[0].length>t&&(r=n.index,t=n[0].length);return t<0?i:i.substring(0,r)+"::"+i.substring(r+t)},r.prototype.toByteArray=function(){var r,t,n,e,i;for(r=[],t=0,n=(i=this.parts).length;t<n;t++)e=i[t],r.push(e>>8),r.push(255&e);return r},r.prototype.toNormalizedString=function(){var r,t,n;return r=function(){var r,n,e,i;for(i=[],r=0,n=(e=this.parts).length;r<n;r++)t=e[r],i.push(t.toString(16));return i}.call(this).join(":"),n="",this.zoneId&&(n="%"+this.zoneId),r+n},r.prototype.toFixedLengthString=function(){var r,t,n;return r=function(){var r,n,e,i;for(i=[],r=0,n=(e=this.parts).length;r<n;r++)t=e[r],i.push(t.toString(16).padStart(4,"0"));return i}.call(this).join(":"),n="",this.zoneId&&(n="%"+this.zoneId),r+n},r.prototype.match=function(r,t){var n;if(void 0===t&&(r=(n=r)[0],t=n[1]),"ipv6"!==r.kind())throw new Error("ipaddr: cannot match ipv6 address with non-ipv6 one");return a(this.parts,r.parts,16,t)},r.prototype.SpecialRanges={unspecified:[new r([0,0,0,0,0,0,0,0]),128],linkLocal:[new r([65152,0,0,0,0,0,0,0]),10],multicast:[new r([65280,0,0,0,0,0,0,0]),8],loopback:[new r([0,0,0,0,0,0,0,1]),128],uniqueLocal:[new r([64512,0,0,0,0,0,0,0]),7],ipv4Mapped:[new r([0,0,0,0,0,65535,0,0]),96],rfc6145:[new r([0,0,0,0,65535,0,0,0]),96],rfc6052:[new r([100,65435,0,0,0,0,0,0]),96],"6to4":[new r([8194,0,0,0,0,0,0,0]),16],teredo:[new r([8193,0,0,0,0,0,0,0]),32],reserved:[[new r([8193,3512,0,0,0,0,0,0]),32]]},r.prototype.range=function(){return t.subnetMatch(this,this.SpecialRanges)},r.prototype.isIPv4MappedAddress=function(){return"ipv4Mapped"===this.range()},r.prototype.toIPv4Address=function(){var r,n,e;if(!this.isIPv4MappedAddress())throw new Error("ipaddr: trying to convert a generic ipv6 address to ipv4");return e=this.parts.slice(-2),r=e[0],n=e[1],new t.IPv4([r>>8,255&r,n>>8,255&n])},r.prototype.prefixLengthFromSubnetMask=function(){var r,t,n,e,i,o,a;for(a={0:16,32768:15,49152:14,57344:13,61440:12,63488:11,64512:10,65024:9,65280:8,65408:7,65472:6,65504:5,65520:4,65528:3,65532:2,65534:1,65535:0},r=0,i=!1,t=n=7;n>=0;t=n+=-1){if(!((e=this.parts[t])in a))return null;if(o=a[e],i&&0!==o)return null;16!==o&&(i=!0),r+=o}return 128-r},r}(),i="(?:[0-9a-f]+::?)+",o={zoneIndex:new RegExp("%[0-9a-z]{1,}","i"),native:new RegExp("^(::)?("+i+")?([0-9a-f]+)?(::)?(%[0-9a-z]{1,})?$","i"),transitional:new RegExp("^((?:"+i+")|(?:::)(?:"+i+")?)"+n+"\\."+n+"\\."+n+"\\."+n+"(%[0-9a-z]{1,})?$","i")},r=function(r,t){var n,e,i,a,s,p;if(r.indexOf("::")!==r.lastIndexOf("::"))return null;for((p=(r.match(o.zoneIndex)||[])[0])&&(p=p.substring(1),r=r.replace(/%.+$/,"")),n=0,e=-1;(e=r.indexOf(":",e+1))>=0;)n++;if("::"===r.substr(0,2)&&n--,"::"===r.substr(-2,2)&&n--,n>t)return null;for(s=t-n,a=":";s--;)a+="0:";return":"===(r=r.replace("::",a))[0]&&(r=r.slice(1)),":"===r[r.length-1]&&(r=r.slice(0,-1)),t=function(){var t,n,e,o;for(o=[],t=0,n=(e=r.split(":")).length;t<n;t++)i=e[t],o.push(parseInt(i,16));return o}(),{parts:t,zoneId:p}},t.IPv6.parser=function(t){var n,e,i,a,s,p,u;if(o.native.test(t))return r(t,8);if((a=t.match(o.transitional))&&(u=a[6]||"",(n=r(a[1].slice(0,-1)+u,6)).parts)){for(e=0,i=(p=[parseInt(a[2]),parseInt(a[3]),parseInt(a[4]),parseInt(a[5])]).length;e<i;e++)if(!(0<=(s=p[e])&&s<=255))return null;return n.parts.push(p[0]<<8|p[1]),n.parts.push(p[2]<<8|p[3]),{parts:n.parts,zoneId:n.zoneId}}return null},t.IPv4.isIPv4=t.IPv6.isIPv6=function(r){return null!==this.parser(r)},t.IPv4.isValid=function(r){try{return new this(this.parser(r)),!0}catch(r){return r,!1}},t.IPv4.isValidFourPartDecimal=function(r){return!(!t.IPv4.isValid(r)||!r.match(/^(0|[1-9]\d*)(\.(0|[1-9]\d*)){3}$/))},t.IPv6.isValid=function(r){var t;if("string"==typeof r&&-1===r.indexOf(":"))return!1;try{return t=this.parser(r),new this(t.parts,t.zoneId),!0}catch(r){return r,!1}},t.IPv4.parse=function(r){var t;if(null===(t=this.parser(r)))throw new Error("ipaddr: string is not formatted like ip address");return new this(t)},t.IPv6.parse=function(r){var t;if(null===(t=this.parser(r)).parts)throw new Error("ipaddr: string is not formatted like ip address");return new this(t.parts,t.zoneId)},t.IPv4.parseCIDR=function(r){var t,n,e;if((n=r.match(/^(.+)\/(\d+)$/))&&(t=parseInt(n[2]))>=0&&t<=32)return e=[this.parse(n[1]),t],Object.defineProperty(e,"toString",{value:function(){return this.join("/")}}),e;throw new Error("ipaddr: string is not formatted like an IPv4 CIDR range")},t.IPv4.subnetMaskFromPrefixLength=function(r){var t,n,e;if((r=parseInt(r))<0||r>32)throw new Error("ipaddr: invalid IPv4 prefix length");for(e=[0,0,0,0],n=0,t=Math.floor(r/8);n<t;)e[n]=255,n++;return t<4&&(e[t]=Math.pow(2,r%8)-1<<8-r%8),new this(e)},t.IPv4.broadcastAddressFromCIDR=function(r){var t,n,e,i,o;try{for(e=(t=this.parseCIDR(r))[0].toByteArray(),o=this.subnetMaskFromPrefixLength(t[1]).toByteArray(),i=[],n=0;n<4;)i.push(parseInt(e[n],10)|255^parseInt(o[n],10)),n++;return new this(i)}catch(r){throw r,new Error("ipaddr: the address does not have IPv4 CIDR format")}},t.IPv4.networkAddressFromCIDR=function(r){var t,n,e,i,o;try{for(e=(t=this.parseCIDR(r))[0].toByteArray(),o=this.subnetMaskFromPrefixLength(t[1]).toByteArray(),i=[],n=0;n<4;)i.push(parseInt(e[n],10)&parseInt(o[n],10)),n++;return new this(i)}catch(r){throw r,new Error("ipaddr: the address does not have IPv4 CIDR format")}},t.IPv6.parseCIDR=function(r){var t,n,e;if((n=r.match(/^(.+)\/(\d+)$/))&&(t=parseInt(n[2]))>=0&&t<=128)return e=[this.parse(n[1]),t],Object.defineProperty(e,"toString",{value:function(){return this.join("/")}}),e;throw new Error("ipaddr: string is not formatted like an IPv6 CIDR range")},t.isValid=function(r){return t.IPv6.isValid(r)||t.IPv4.isValid(r)},t.parse=function(r){if(t.IPv6.isValid(r))return t.IPv6.parse(r);if(t.IPv4.isValid(r))return t.IPv4.parse(r);throw new Error("ipaddr: the address has neither IPv6 nor IPv4 format")},t.parseCIDR=function(r){try{return t.IPv6.parseCIDR(r)}catch(n){n;try{return t.IPv4.parseCIDR(r)}catch(r){throw r,new Error("ipaddr: the address has neither IPv6 nor IPv4 CIDR format")}}},t.fromByteArray=function(r){var n;if(4===(n=r.length))return new t.IPv4(r);if(16===n)return new t.IPv6(r);throw new Error("ipaddr: the binary input is neither an IPv6 nor IPv4 address")},t.process=function(r){var t;return t=this.parse(r),"ipv6"===t.kind()&&t.isIPv4MappedAddress()?t.toIPv4Address():t}}).call(this);
\ No newline at end of file
+(function(){var r,t,n,e,i,o,a,s;t={},s=this,"undefined"!=typeof module&&null!==module&&module.exports?module.exports=t:s.ipaddr=t,a=function(r,t,n,e){var i,o;if(r.length!==t.length)throw new Error("ipaddr: cannot match CIDR for objects with different lengths");for(i=0;e>0;){if((o=n-e)<0&&(o=0),r[i]>>o!=t[i]>>o)return!1;e-=n,i+=1}return!0},t.subnetMatch=function(r,t,n){var e,i,o,a,s;null==n&&(n="unicast");for(o in t)for(!(a=t[o])[0]||a[0]instanceof Array||(a=[a]),e=0,i=a.length;e<i;e++)if(s=a[e],r.kind()===s[0].kind()&&r.match.apply(r,s))return o;return n},t.IPv4=function(){function r(r){var t,n,e;if(4!==r.length)throw new Error("ipaddr: ipv4 octet count should be 4");for(t=0,n=r.length;t<n;t++)if(!(0<=(e=r[t])&&e<=255))throw new Error("ipaddr: ipv4 octet should fit in 8 bits");this.octets=r}return r.prototype.kind=function(){return"ipv4"},r.prototype.toString=function(){return this.octets.join(".")},r.prototype.toNormalizedString=function(){return this.toString()},r.prototype.toByteArray=function(){return this.octets.slice(0)},r.prototype.match=function(r,t){var n;if(void 0===t&&(r=(n=r)[0],t=n[1]),"ipv4"!==r.kind())throw new Error("ipaddr: cannot match ipv4 address with non-ipv4 one");return a(this.octets,r.octets,8,t)},r.prototype.SpecialRanges={unspecified:[[new r([0,0,0,0]),8]],broadcast:[[new r([255,255,255,255]),32]],multicast:[[new r([224,0,0,0]),4]],linkLocal:[[new r([169,254,0,0]),16]],loopback:[[new r([127,0,0,0]),8]],carrierGradeNat:[[new r([100,64,0,0]),10]],private:[[new r([10,0,0,0]),8],[new r([172,16,0,0]),12],[new r([192,168,0,0]),16]],reserved:[[new r([192,0,0,0]),24],[new r([192,0,2,0]),24],[new r([192,88,99,0]),24],[new r([198,51,100,0]),24],[new r([203,0,113,0]),24],[new r([240,0,0,0]),4]]},r.prototype.range=function(){return t.subnetMatch(this,this.SpecialRanges)},r.prototype.toIPv4MappedAddress=function(){return t.IPv6.parse("::ffff:"+this.toString())},r.prototype.prefixLengthFromSubnetMask=function(){var r,t,n,e,i,o,a;for(a={0:8,128:7,192:6,224:5,240:4,248:3,252:2,254:1,255:0},r=0,i=!1,t=n=3;n>=0;t=n+=-1){if(!((e=this.octets[t])in a))return null;if(o=a[e],i&&0!==o)return null;8!==o&&(i=!0),r+=o}return 32-r},r}(),n="(0?\\d+|0x[a-f0-9]+)",e={fourOctet:new RegExp("^"+n+"\\."+n+"\\."+n+"\\."+n+"$","i"),longValue:new RegExp("^"+n+"$","i")},t.IPv4.parser=function(r){var t,n,i,o,a;if(n=function(r){return"0"===r[0]&&"x"!==r[1]?parseInt(r,8):parseInt(r)},t=r.match(e.fourOctet))return function(){var r,e,o,a;for(a=[],r=0,e=(o=t.slice(1,6)).length;r<e;r++)i=o[r],a.push(n(i));return a}();if(t=r.match(e.longValue)){if((a=n(t[1]))>4294967295||a<0)throw new Error("ipaddr: address outside defined range");return function(){var r,t;for(t=[],o=r=0;r<=24;o=r+=8)t.push(a>>o&255);return t}().reverse()}return null},t.IPv6=function(){function r(r,t){var n,e,i,o,a,s;if(16===r.length)for(this.parts=[],n=e=0;e<=14;n=e+=2)this.parts.push(r[n]<<8|r[n+1]);else{if(8!==r.length)throw new Error("ipaddr: ipv6 part count should be 8 or 16");this.parts=r}for(i=0,o=(s=this.parts).length;i<o;i++)if(!(0<=(a=s[i])&&a<=65535))throw new Error("ipaddr: ipv6 part should fit in 16 bits");t&&(this.zoneId=t)}return r.prototype.kind=function(){return"ipv6"},r.prototype.toString=function(){return this.toNormalizedString().replace(/((^|:)(0(:|$))+)/,"::")},r.prototype.toRFC5952String=function(){var r,t,n,e,i;for(e=/((^|:)(0(:|$)){2,})/g,i=this.toNormalizedString(),r=0,t=-1;n=e.exec(i);)n[0].length>t&&(r=n.index,t=n[0].length);return t<0?i:i.substring(0,r)+"::"+i.substring(r+t)},r.prototype.toByteArray=function(){var r,t,n,e,i;for(r=[],t=0,n=(i=this.parts).length;t<n;t++)e=i[t],r.push(e>>8),r.push(255&e);return r},r.prototype.toNormalizedString=function(){var r,t,n;return r=function(){var r,n,e,i;for(i=[],r=0,n=(e=this.parts).length;r<n;r++)t=e[r],i.push(t.toString(16));return i}.call(this).join(":"),n="",this.zoneId&&(n="%"+this.zoneId),r+n},r.prototype.toFixedLengthString=function(){var r,t,n;return r=function(){var r,n,e,i;for(i=[],r=0,n=(e=this.parts).length;r<n;r++)t=e[r],i.push(t.toString(16).padStart(4,"0"));return i}.call(this).join(":"),n="",this.zoneId&&(n="%"+this.zoneId),r+n},r.prototype.match=function(r,t){var n;if(void 0===t&&(r=(n=r)[0],t=n[1]),"ipv6"!==r.kind())throw new Error("ipaddr: cannot match ipv6 address with non-ipv6 one");return a(this.parts,r.parts,16,t)},r.prototype.SpecialRanges={unspecified:[new r([0,0,0,0,0,0,0,0]),128],linkLocal:[new r([65152,0,0,0,0,0,0,0]),10],multicast:[new r([65280,0,0,0,0,0,0,0]),8],loopback:[new r([0,0,0,0,0,0,0,1]),128],uniqueLocal:[new r([64512,0,0,0,0,0,0,0]),7],ipv4Mapped:[new r([0,0,0,0,0,65535,0,0]),96],rfc6145:[new r([0,0,0,0,65535,0,0,0]),96],rfc6052:[new r([100,65435,0,0,0,0,0,0]),96],"6to4":[new r([8194,0,0,0,0,0,0,0]),16],teredo:[new r([8193,0,0,0,0,0,0,0]),32],reserved:[[new r([8193,3512,0,0,0,0,0,0]),32]]},r.prototype.range=function(){return t.subnetMatch(this,this.SpecialRanges)},r.prototype.isIPv4MappedAddress=function(){return"ipv4Mapped"===this.range()},r.prototype.toIPv4Address=function(){var r,n,e;if(!this.isIPv4MappedAddress())throw new Error("ipaddr: trying to convert a generic ipv6 address to ipv4");return e=this.parts.slice(-2),r=e[0],n=e[1],new t.IPv4([r>>8,255&r,n>>8,255&n])},r.prototype.prefixLengthFromSubnetMask=function(){var r,t,n,e,i,o,a;for(a={0:16,32768:15,49152:14,57344:13,61440:12,63488:11,64512:10,65024:9,65280:8,65408:7,65472:6,65504:5,65520:4,65528:3,65532:2,65534:1,65535:0},r=0,i=!1,t=n=7;n>=0;t=n+=-1){if(!((e=this.parts[t])in a))return null;if(o=a[e],i&&0!==o)return null;16!==o&&(i=!0),r+=o}return 128-r},r}(),i="(?:[0-9a-f]+::?)+",o={zoneIndex:new RegExp("%[0-9a-z]{1,}","i"),native:new RegExp("^(::)?("+i+")?([0-9a-f]+)?(::)?(%[0-9a-z]{1,})?$","i"),transitional:new RegExp("^((?:"+i+")|(?:::)(?:"+i+")?)"+n+"\\."+n+"\\."+n+"\\."+n+"(%[0-9a-z]{1,})?$","i")},r=function(r,t){var n,e,i,a,s,p;if(r.indexOf("::")!==r.lastIndexOf("::"))return null;for((p=(r.match(o.zoneIndex)||[])[0])&&(p=p.substring(1),r=r.replace(/%.+$/,"")),n=0,e=-1;(e=r.indexOf(":",e+1))>=0;)n++;if("::"===r.substr(0,2)&&n--,"::"===r.substr(-2,2)&&n--,n>t)return null;for(s=t-n,a=":";s--;)a+="0:";return":"===(r=r.replace("::",a))[0]&&(r=r.slice(1)),":"===r[r.length-1]&&(r=r.slice(0,-1)),t=function(){var t,n,e,o;for(o=[],t=0,n=(e=r.split(":")).length;t<n;t++)i=e[t],o.push(parseInt(i,16));return o}(),{parts:t,zoneId:p}},t.IPv6.parser=function(t){var n,e,i,a,s,p,u;if(o.native.test(t))return r(t,8);if((a=t.match(o.transitional))&&(u=a[6]||"",(n=r(a[1].slice(0,-1)+u,6)).parts)){for(e=0,i=(p=[parseInt(a[2]),parseInt(a[3]),parseInt(a[4]),parseInt(a[5])]).length;e<i;e++)if(!(0<=(s=p[e])&&s<=255))return null;return n.parts.push(p[0]<<8|p[1]),n.parts.push(p[2]<<8|p[3]),{parts:n.parts,zoneId:n.zoneId}}return null},t.IPv4.isIPv4=t.IPv6.isIPv6=function(r){return null!==this.parser(r)},t.IPv4.isValid=function(r){try{return new this(this.parser(r)),!0}catch(r){return r,!1}},t.IPv4.isValidFourPartDecimal=function(r){return!(!t.IPv4.isValid(r)||!r.match(/^(0|[1-9]\d*)(\.(0|[1-9]\d*)){3}$/))},t.IPv6.isValid=function(r){var t;if("string"==typeof r&&-1===r.indexOf(":"))return!1;try{return t=this.parser(r),new this(t.parts,t.zoneId),!0}catch(r){return r,!1}},t.IPv4.parse=function(r){var t;if(null===(t=this.parser(r)))throw new Error("ipaddr: string is not formatted like ip address");return new this(t)},t.IPv6.parse=function(r){var t;if(null===(t=this.parser(r)).parts)throw new Error("ipaddr: string is not formatted like ip address");return new this(t.parts,t.zoneId)},t.IPv4.parseCIDR=function(r){var t,n,e;if((n=r.match(/^(.+)\/(\d+)$/))&&(t=parseInt(n[2]))>=0&&t<=32)return e=[this.parse(n[1]),t],Object.defineProperty(e,"toString",{value:function(){return this.join("/")}}),e;throw new Error("ipaddr: string is not formatted like an IPv4 CIDR range")},t.IPv4.subnetMaskFromPrefixLength=function(r){var t,n,e;if((r=parseInt(r))<0||r>32)throw new Error("ipaddr: invalid IPv4 prefix length");for(e=[0,0,0,0],n=0,t=Math.floor(r/8);n<t;)e[n]=255,n++;return t<4&&(e[t]=Math.pow(2,r%8)-1<<8-r%8),new this(e)},t.IPv4.broadcastAddressFromCIDR=function(r){var t,n,e,i,o;try{for(e=(t=this.parseCIDR(r))[0].toByteArray(),o=this.subnetMaskFromPrefixLength(t[1]).toByteArray(),i=[],n=0;n<4;)i.push(parseInt(e[n],10)|255^parseInt(o[n],10)),n++;return new this(i)}catch(r){throw r,new Error("ipaddr: the address does not have IPv4 CIDR format")}},t.IPv4.networkAddressFromCIDR=function(r){var t,n,e,i,o;try{for(e=(t=this.parseCIDR(r))[0].toByteArray(),o=this.subnetMaskFromPrefixLength(t[1]).toByteArray(),i=[],n=0;n<4;)i.push(parseInt(e[n],10)&parseInt(o[n],10)),n++;return new this(i)}catch(r){throw r,new Error("ipaddr: the address does not have IPv4 CIDR format")}},t.IPv6.parseCIDR=function(r){var t,n,e;if((n=r.match(/^(.+)\/(\d+)$/))&&(t=parseInt(n[2]))>=0&&t<=128)return e=[this.parse(n[1]),t],Object.defineProperty(e,"toString",{value:function(){return this.join("/")}}),e;throw new Error("ipaddr: string is not formatted like an IPv6 CIDR range")},t.isValid=function(r){return t.IPv6.isValid(r)||t.IPv4.isValid(r)},t.parse=function(r){if(t.IPv6.isValid(r))return t.IPv6.parse(r);if(t.IPv4.isValid(r))return t.IPv4.parse(r);throw new Error("ipaddr: the address has neither IPv6 nor IPv4 format")},t.parseCIDR=function(r){try{return t.IPv6.parseCIDR(r)}catch(n){n;try{return t.IPv4.parseCIDR(r)}catch(r){throw r,new Error("ipaddr: the address has neither IPv6 nor IPv4 CIDR format")}}},t.fromByteArray=function(r){var n;if(4===(n=r.length))return new t.IPv4(r);if(16===n)return new t.IPv6(r);throw new Error("ipaddr: the binary input is neither an IPv6 nor IPv4 address")},t.process=function(r){var t;return t=this.parse(r),"ipv6"===t.kind()&&t.isIPv4MappedAddress()?t.toIPv4Address():t}}).call(this);
diff --git a/api/node_modules/is-promise/LICENSE b/api/node_modules/is-promise/LICENSE
index 27cc9f3..7a1f763 100644
--- a/api/node_modules/is-promise/LICENSE
+++ b/api/node_modules/is-promise/LICENSE
@@ -16,4 +16,4 @@ FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
-THE SOFTWARE.
\ No newline at end of file
+THE SOFTWARE.
diff --git a/api/node_modules/math-intrinsics/abs.d.ts b/api/node_modules/math-intrinsics/abs.d.ts
index 14ad9c6..143aa6e 100644
--- a/api/node_modules/math-intrinsics/abs.d.ts
+++ b/api/node_modules/math-intrinsics/abs.d.ts
@@ -1 +1 @@
-export = Math.abs;
\ No newline at end of file
+export = Math.abs;
diff --git a/api/node_modules/math-intrinsics/constants/maxArrayLength.d.ts b/api/node_modules/math-intrinsics/constants/maxArrayLength.d.ts
index b92d46b..06bfdfa 100644
--- a/api/node_modules/math-intrinsics/constants/maxArrayLength.d.ts
+++ b/api/node_modules/math-intrinsics/constants/maxArrayLength.d.ts
@@ -1,3 +1,3 @@
 declare const MAX_ARRAY_LENGTH: 4294967295;
 
-export = MAX_ARRAY_LENGTH;
\ No newline at end of file
+export = MAX_ARRAY_LENGTH;
diff --git a/api/node_modules/math-intrinsics/constants/maxSafeInteger.d.ts b/api/node_modules/math-intrinsics/constants/maxSafeInteger.d.ts
index fee3f62..b71d9dc 100644
--- a/api/node_modules/math-intrinsics/constants/maxSafeInteger.d.ts
+++ b/api/node_modules/math-intrinsics/constants/maxSafeInteger.d.ts
@@ -1,3 +1,3 @@
 declare const MAX_SAFE_INTEGER: 9007199254740991;
 
-export = MAX_SAFE_INTEGER;
\ No newline at end of file
+export = MAX_SAFE_INTEGER;
diff --git a/api/node_modules/math-intrinsics/floor.d.ts b/api/node_modules/math-intrinsics/floor.d.ts
index 9265236..be4877d 100644
--- a/api/node_modules/math-intrinsics/floor.d.ts
+++ b/api/node_modules/math-intrinsics/floor.d.ts
@@ -1 +1 @@
-export = Math.floor;
\ No newline at end of file
+export = Math.floor;
diff --git a/api/node_modules/math-intrinsics/isFinite.d.ts b/api/node_modules/math-intrinsics/isFinite.d.ts
index 6daae33..325e93f 100644
--- a/api/node_modules/math-intrinsics/isFinite.d.ts
+++ b/api/node_modules/math-intrinsics/isFinite.d.ts
@@ -1,3 +1,3 @@
 declare function isFinite(x: unknown): x is number | bigint;
 
-export = isFinite;
\ No newline at end of file
+export = isFinite;
diff --git a/api/node_modules/math-intrinsics/isFinite.js b/api/node_modules/math-intrinsics/isFinite.js
index b201a5a..f8bd719 100644
--- a/api/node_modules/math-intrinsics/isFinite.js
+++ b/api/node_modules/math-intrinsics/isFinite.js
@@ -9,4 +9,3 @@ module.exports = function isFinite(x) {
         && x !== Infinity
         && x !== -Infinity;
 };
-
diff --git a/api/node_modules/math-intrinsics/isInteger.d.ts b/api/node_modules/math-intrinsics/isInteger.d.ts
index 13935a8..596ce18 100644
--- a/api/node_modules/math-intrinsics/isInteger.d.ts
+++ b/api/node_modules/math-intrinsics/isInteger.d.ts
@@ -1,3 +1,3 @@
 declare function isInteger(argument: unknown): argument is number;
 
-export = isInteger;
\ No newline at end of file
+export = isInteger;
diff --git a/api/node_modules/math-intrinsics/isNaN.d.ts b/api/node_modules/math-intrinsics/isNaN.d.ts
index c1d4c55..27257fa 100644
--- a/api/node_modules/math-intrinsics/isNaN.d.ts
+++ b/api/node_modules/math-intrinsics/isNaN.d.ts
@@ -1 +1 @@
-export = Number.isNaN;
\ No newline at end of file
+export = Number.isNaN;
diff --git a/api/node_modules/math-intrinsics/isNegativeZero.d.ts b/api/node_modules/math-intrinsics/isNegativeZero.d.ts
index 7ad8819..50cd9e0 100644
--- a/api/node_modules/math-intrinsics/isNegativeZero.d.ts
+++ b/api/node_modules/math-intrinsics/isNegativeZero.d.ts
@@ -1,3 +1,3 @@
 declare function isNegativeZero(x: unknown): boolean;
 
-export = isNegativeZero;
\ No newline at end of file
+export = isNegativeZero;
diff --git a/api/node_modules/math-intrinsics/max.d.ts b/api/node_modules/math-intrinsics/max.d.ts
index ad6f43e..3b6a780 100644
--- a/api/node_modules/math-intrinsics/max.d.ts
+++ b/api/node_modules/math-intrinsics/max.d.ts
@@ -1 +1 @@
-export = Math.max;
\ No newline at end of file
+export = Math.max;
diff --git a/api/node_modules/math-intrinsics/min.d.ts b/api/node_modules/math-intrinsics/min.d.ts
index fd90f2d..f8d29f6 100644
--- a/api/node_modules/math-intrinsics/min.d.ts
+++ b/api/node_modules/math-intrinsics/min.d.ts
@@ -1 +1 @@
-export = Math.min;
\ No newline at end of file
+export = Math.min;
diff --git a/api/node_modules/math-intrinsics/mod.d.ts b/api/node_modules/math-intrinsics/mod.d.ts
index 549dbd4..ae645c1 100644
--- a/api/node_modules/math-intrinsics/mod.d.ts
+++ b/api/node_modules/math-intrinsics/mod.d.ts
@@ -1,3 +1,3 @@
 declare function mod(number: number, modulo: number): number;
 
-export = mod;
\ No newline at end of file
+export = mod;
diff --git a/api/node_modules/math-intrinsics/pow.d.ts b/api/node_modules/math-intrinsics/pow.d.ts
index 5873c44..9d0df88 100644
--- a/api/node_modules/math-intrinsics/pow.d.ts
+++ b/api/node_modules/math-intrinsics/pow.d.ts
@@ -1 +1 @@
-export = Math.pow;
\ No newline at end of file
+export = Math.pow;
diff --git a/api/node_modules/math-intrinsics/round.d.ts b/api/node_modules/math-intrinsics/round.d.ts
index da1fde3..0d22983 100644
--- a/api/node_modules/math-intrinsics/round.d.ts
+++ b/api/node_modules/math-intrinsics/round.d.ts
@@ -1 +1 @@
-export = Math.round;
\ No newline at end of file
+export = Math.round;
diff --git a/api/node_modules/math-intrinsics/sign.d.ts b/api/node_modules/math-intrinsics/sign.d.ts
index c49ceca..bd450a8 100644
--- a/api/node_modules/math-intrinsics/sign.d.ts
+++ b/api/node_modules/math-intrinsics/sign.d.ts
@@ -1,3 +1,3 @@
 declare function sign(x: number): number;
 
-export = sign;
\ No newline at end of file
+export = sign;
diff --git a/api/node_modules/path-to-regexp/dist/index.js b/api/node_modules/path-to-regexp/dist/index.js
index 49694bd..48e7494 100644
--- a/api/node_modules/path-to-regexp/dist/index.js
+++ b/api/node_modules/path-to-regexp/dist/index.js
@@ -400,4 +400,4 @@ function isNextNameSafe(token) {
         return true;
     return !ID_CONTINUE.test(token.value[0]);
 }
-//# sourceMappingURL=index.js.map
\ No newline at end of file
+//# sourceMappingURL=index.js.map
diff --git a/api/node_modules/path-to-regexp/dist/index.js.map b/api/node_modules/path-to-regexp/dist/index.js.map
index d5054f9..41f2f13 100644
--- a/api/node_modules/path-to-regexp/dist/index.js.map
+++ b/api/node_modules/path-to-regexp/dist/index.js.map
@@ -1 +1 @@
-{"version":3,"file":"index.js","sourceRoot":"","sources":["../src/index.ts"],"names":[],"mappings":"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","sourcesContent":["const DEFAULT_DELIMITER = \"/\";\nconst NOOP_VALUE = (value: string) => value;\nconst ID_START = /^[$_\\p{ID_Start}]$/u;\nconst ID_CONTINUE = /^[$\\u200c\\u200d\\p{ID_Continue}]$/u;\nconst DEBUG_URL = \"https://git.new/pathToRegexpError\";\n\n/**\n * Encode a string into another string.\n */\nexport type Encode = (value: string) => string;\n\n/**\n * Decode a string into another string.\n */\nexport type Decode = (value: string) => string;\n\nexport interface ParseOptions {\n  /**\n   * A function for encoding input strings.\n   */\n  encodePath?: Encode;\n}\n\nexport interface PathToRegexpOptions {\n  /**\n   * Matches the path completely without trailing characters. (default: `true`)\n   */\n  end?: boolean;\n  /**\n   * Allows optional trailing delimiter to match. (default: `true`)\n   */\n  trailing?: boolean;\n  /**\n   * Match will be case sensitive. (default: `false`)\n   */\n  sensitive?: boolean;\n  /**\n   * The default delimiter for segments. (default: `'/'`)\n   */\n  delimiter?: string;\n}\n\nexport interface MatchOptions extends PathToRegexpOptions {\n  /**\n   * Function for decoding strings for params, or `false` to disable entirely. (default: `decodeURIComponent`)\n   */\n  decode?: Decode | false;\n}\n\nexport interface CompileOptions {\n  /**\n   * Function for encoding input strings for output into the path, or `false` to disable entirely. (default: `encodeURIComponent`)\n   */\n  encode?: Encode | false;\n  /**\n   * The default delimiter for segments. (default: `'/'`)\n   */\n  delimiter?: string;\n}\n\ntype TokenType =\n  | \"{\"\n  | \"}\"\n  | \"WILDCARD\"\n  | \"PARAM\"\n  | \"CHAR\"\n  | \"ESCAPED\"\n  | \"END\"\n  // Reserved for use or ambiguous due to past use.\n  | \"(\"\n  | \")\"\n  | \"[\"\n  | \"]\"\n  | \"+\"\n  | \"?\"\n  | \"!\";\n\n/**\n * Tokenizer results.\n */\ninterface LexToken {\n  type: TokenType;\n  index: number;\n  value: string;\n}\n\nconst SIMPLE_TOKENS: Record<string, TokenType> = {\n  // Groups.\n  \"{\": \"{\",\n  \"}\": \"}\",\n  // Reserved.\n  \"(\": \"(\",\n  \")\": \")\",\n  \"[\": \"[\",\n  \"]\": \"]\",\n  \"+\": \"+\",\n  \"?\": \"?\",\n  \"!\": \"!\",\n};\n\n/**\n * Escape text for stringify to path.\n */\nfunction escapeText(str: string) {\n  return str.replace(/[{}()\\[\\]+?!:*]/g, \"\\\\$&\");\n}\n\n/**\n * Escape a regular expression string.\n */\nfunction escape(str: string) {\n  return str.replace(/[.+*?^${}()[\\]|/\\\\]/g, \"\\\\$&\");\n}\n\n/**\n * Tokenize input string.\n */\nfunction* lexer(str: string): Generator<LexToken, LexToken> {\n  const chars = [...str];\n  let i = 0;\n\n  function name() {\n    let value = \"\";\n\n    if (ID_START.test(chars[++i])) {\n      value += chars[i];\n      while (ID_CONTINUE.test(chars[++i])) {\n        value += chars[i];\n      }\n    } else if (chars[i] === '\"') {\n      let pos = i;\n\n      while (i < chars.length) {\n        if (chars[++i] === '\"') {\n          i++;\n          pos = 0;\n          break;\n        }\n\n        if (chars[i] === \"\\\\\") {\n          value += chars[++i];\n        } else {\n          value += chars[i];\n        }\n      }\n\n      if (pos) {\n        throw new TypeError(`Unterminated quote at ${pos}: ${DEBUG_URL}`);\n      }\n    }\n\n    if (!value) {\n      throw new TypeError(`Missing parameter name at ${i}: ${DEBUG_URL}`);\n    }\n\n    return value;\n  }\n\n  while (i < chars.length) {\n    const value = chars[i];\n    const type = SIMPLE_TOKENS[value];\n\n    if (type) {\n      yield { type, index: i++, value };\n    } else if (value === \"\\\\\") {\n      yield { type: \"ESCAPED\", index: i++, value: chars[i++] };\n    } else if (value === \":\") {\n      const value = name();\n      yield { type: \"PARAM\", index: i, value };\n    } else if (value === \"*\") {\n      const value = name();\n      yield { type: \"WILDCARD\", index: i, value };\n    } else {\n      yield { type: \"CHAR\", index: i, value: chars[i++] };\n    }\n  }\n\n  return { type: \"END\", index: i, value: \"\" };\n}\n\nclass Iter {\n  private _peek?: LexToken;\n\n  constructor(private tokens: Generator<LexToken, LexToken>) {}\n\n  peek(): LexToken {\n    if (!this._peek) {\n      const next = this.tokens.next();\n      this._peek = next.value;\n    }\n    return this._peek;\n  }\n\n  tryConsume(type: TokenType): string | undefined {\n    const token = this.peek();\n    if (token.type !== type) return;\n    this._peek = undefined; // Reset after consumed.\n    return token.value;\n  }\n\n  consume(type: TokenType): string {\n    const value = this.tryConsume(type);\n    if (value !== undefined) return value;\n    const { type: nextType, index } = this.peek();\n    throw new TypeError(\n      `Unexpected ${nextType} at ${index}, expected ${type}: ${DEBUG_URL}`,\n    );\n  }\n\n  text(): string {\n    let result = \"\";\n    let value: string | undefined;\n    while ((value = this.tryConsume(\"CHAR\") || this.tryConsume(\"ESCAPED\"))) {\n      result += value;\n    }\n    return result;\n  }\n}\n\n/**\n * Plain text.\n */\nexport interface Text {\n  type: \"text\";\n  value: string;\n}\n\n/**\n * A parameter designed to match arbitrary text within a segment.\n */\nexport interface Parameter {\n  type: \"param\";\n  name: string;\n}\n\n/**\n * A wildcard parameter designed to match multiple segments.\n */\nexport interface Wildcard {\n  type: \"wildcard\";\n  name: string;\n}\n\n/**\n * A set of possible tokens to expand when matching.\n */\nexport interface Group {\n  type: \"group\";\n  tokens: Token[];\n}\n\n/**\n * A token that corresponds with a regexp capture.\n */\nexport type Key = Parameter | Wildcard;\n\n/**\n * A sequence of `path-to-regexp` keys that match capturing groups.\n */\nexport type Keys = Array<Key>;\n\n/**\n * A sequence of path match characters.\n */\nexport type Token = Text | Parameter | Wildcard | Group;\n\n/**\n * Tokenized path instance.\n */\nexport class TokenData {\n  constructor(public readonly tokens: Token[]) {}\n}\n\n/**\n * Parse a string for the raw tokens.\n */\nexport function parse(str: string, options: ParseOptions = {}): TokenData {\n  const { encodePath = NOOP_VALUE } = options;\n  const it = new Iter(lexer(str));\n\n  function consume(endType: TokenType): Token[] {\n    const tokens: Token[] = [];\n\n    while (true) {\n      const path = it.text();\n      if (path) tokens.push({ type: \"text\", value: encodePath(path) });\n\n      const param = it.tryConsume(\"PARAM\");\n      if (param) {\n        tokens.push({\n          type: \"param\",\n          name: param,\n        });\n        continue;\n      }\n\n      const wildcard = it.tryConsume(\"WILDCARD\");\n      if (wildcard) {\n        tokens.push({\n          type: \"wildcard\",\n          name: wildcard,\n        });\n        continue;\n      }\n\n      const open = it.tryConsume(\"{\");\n      if (open) {\n        tokens.push({\n          type: \"group\",\n          tokens: consume(\"}\"),\n        });\n        continue;\n      }\n\n      it.consume(endType);\n      return tokens;\n    }\n  }\n\n  const tokens = consume(\"END\");\n  return new TokenData(tokens);\n}\n\n/**\n * Compile a string to a template function for the path.\n */\nexport function compile<P extends ParamData = ParamData>(\n  path: Path,\n  options: CompileOptions & ParseOptions = {},\n) {\n  const { encode = encodeURIComponent, delimiter = DEFAULT_DELIMITER } =\n    options;\n  const data = path instanceof TokenData ? path : parse(path, options);\n  const fn = tokensToFunction(data.tokens, delimiter, encode);\n\n  return function path(data: P = {} as P) {\n    const [path, ...missing] = fn(data);\n    if (missing.length) {\n      throw new TypeError(`Missing parameters: ${missing.join(\", \")}`);\n    }\n    return path;\n  };\n}\n\nexport type ParamData = Partial<Record<string, string | string[]>>;\nexport type PathFunction<P extends ParamData> = (data?: P) => string;\n\nfunction tokensToFunction(\n  tokens: Token[],\n  delimiter: string,\n  encode: Encode | false,\n) {\n  const encoders = tokens.map((token) =>\n    tokenToFunction(token, delimiter, encode),\n  );\n\n  return (data: ParamData) => {\n    const result: string[] = [\"\"];\n\n    for (const encoder of encoders) {\n      const [value, ...extras] = encoder(data);\n      result[0] += value;\n      result.push(...extras);\n    }\n\n    return result;\n  };\n}\n\n/**\n * Convert a single token into a path building function.\n */\nfunction tokenToFunction(\n  token: Token,\n  delimiter: string,\n  encode: Encode | false,\n): (data: ParamData) => string[] {\n  if (token.type === \"text\") return () => [token.value];\n\n  if (token.type === \"group\") {\n    const fn = tokensToFunction(token.tokens, delimiter, encode);\n\n    return (data) => {\n      const [value, ...missing] = fn(data);\n      if (!missing.length) return [value];\n      return [\"\"];\n    };\n  }\n\n  const encodeValue = encode || NOOP_VALUE;\n\n  if (token.type === \"wildcard\" && encode !== false) {\n    return (data) => {\n      const value = data[token.name];\n      if (value == null) return [\"\", token.name];\n\n      if (!Array.isArray(value) || value.length === 0) {\n        throw new TypeError(`Expected \"${token.name}\" to be a non-empty array`);\n      }\n\n      return [\n        value\n          .map((value, index) => {\n            if (typeof value !== \"string\") {\n              throw new TypeError(\n                `Expected \"${token.name}/${index}\" to be a string`,\n              );\n            }\n\n            return encodeValue(value);\n          })\n          .join(delimiter),\n      ];\n    };\n  }\n\n  return (data) => {\n    const value = data[token.name];\n    if (value == null) return [\"\", token.name];\n\n    if (typeof value !== \"string\") {\n      throw new TypeError(`Expected \"${token.name}\" to be a string`);\n    }\n\n    return [encodeValue(value)];\n  };\n}\n\n/**\n * A match result contains data about the path match.\n */\nexport interface MatchResult<P extends ParamData> {\n  path: string;\n  params: P;\n}\n\n/**\n * A match is either `false` (no match) or a match result.\n */\nexport type Match<P extends ParamData> = false | MatchResult<P>;\n\n/**\n * The match function takes a string and returns whether it matched the path.\n */\nexport type MatchFunction<P extends ParamData> = (path: string) => Match<P>;\n\n/**\n * Supported path types.\n */\nexport type Path = string | TokenData;\n\n/**\n * Transform a path into a match function.\n */\nexport function match<P extends ParamData>(\n  path: Path | Path[],\n  options: MatchOptions & ParseOptions = {},\n): MatchFunction<P> {\n  const { decode = decodeURIComponent, delimiter = DEFAULT_DELIMITER } =\n    options;\n  const { regexp, keys } = pathToRegexp(path, options);\n\n  const decoders = keys.map((key) => {\n    if (decode === false) return NOOP_VALUE;\n    if (key.type === \"param\") return decode;\n    return (value: string) => value.split(delimiter).map(decode);\n  });\n\n  return function match(input: string) {\n    const m = regexp.exec(input);\n    if (!m) return false;\n\n    const path = m[0];\n    const params = Object.create(null);\n\n    for (let i = 1; i < m.length; i++) {\n      if (m[i] === undefined) continue;\n\n      const key = keys[i - 1];\n      const decoder = decoders[i - 1];\n      params[key.name] = decoder(m[i]);\n    }\n\n    return { path, params };\n  };\n}\n\nexport function pathToRegexp(\n  path: Path | Path[],\n  options: PathToRegexpOptions & ParseOptions = {},\n) {\n  const {\n    delimiter = DEFAULT_DELIMITER,\n    end = true,\n    sensitive = false,\n    trailing = true,\n  } = options;\n  const keys: Keys = [];\n  const sources: string[] = [];\n  const flags = sensitive ? \"\" : \"i\";\n  const paths = Array.isArray(path) ? path : [path];\n  const items = paths.map((path) =>\n    path instanceof TokenData ? path : parse(path, options),\n  );\n\n  for (const { tokens } of items) {\n    for (const seq of flatten(tokens, 0, [])) {\n      const regexp = sequenceToRegExp(seq, delimiter, keys);\n      sources.push(regexp);\n    }\n  }\n\n  let pattern = `^(?:${sources.join(\"|\")})`;\n  if (trailing) pattern += `(?:${escape(delimiter)}$)?`;\n  pattern += end ? \"$\" : `(?=${escape(delimiter)}|$)`;\n\n  const regexp = new RegExp(pattern, flags);\n  return { regexp, keys };\n}\n\n/**\n * Flattened token set.\n */\ntype Flattened = Text | Parameter | Wildcard;\n\n/**\n * Generate a flat list of sequence tokens from the given tokens.\n */\nfunction* flatten(\n  tokens: Token[],\n  index: number,\n  init: Flattened[],\n): Generator<Flattened[]> {\n  if (index === tokens.length) {\n    return yield init;\n  }\n\n  const token = tokens[index];\n\n  if (token.type === \"group\") {\n    const fork = init.slice();\n    for (const seq of flatten(token.tokens, 0, fork)) {\n      yield* flatten(tokens, index + 1, seq);\n    }\n  } else {\n    init.push(token);\n  }\n\n  yield* flatten(tokens, index + 1, init);\n}\n\n/**\n * Transform a flat sequence of tokens into a regular expression.\n */\nfunction sequenceToRegExp(tokens: Flattened[], delimiter: string, keys: Keys) {\n  let result = \"\";\n  let backtrack = \"\";\n  let isSafeSegmentParam = true;\n\n  for (let i = 0; i < tokens.length; i++) {\n    const token = tokens[i];\n\n    if (token.type === \"text\") {\n      result += escape(token.value);\n      backtrack += token.value;\n      isSafeSegmentParam ||= token.value.includes(delimiter);\n      continue;\n    }\n\n    if (token.type === \"param\" || token.type === \"wildcard\") {\n      if (!isSafeSegmentParam && !backtrack) {\n        throw new TypeError(`Missing text after \"${token.name}\": ${DEBUG_URL}`);\n      }\n\n      if (token.type === \"param\") {\n        result += `(${negate(delimiter, isSafeSegmentParam ? \"\" : backtrack)}+)`;\n      } else {\n        result += `([\\\\s\\\\S]+)`;\n      }\n\n      keys.push(token);\n      backtrack = \"\";\n      isSafeSegmentParam = false;\n      continue;\n    }\n  }\n\n  return result;\n}\n\nfunction negate(delimiter: string, backtrack: string) {\n  if (backtrack.length < 2) {\n    if (delimiter.length < 2) return `[^${escape(delimiter + backtrack)}]`;\n    return `(?:(?!${escape(delimiter)})[^${escape(backtrack)}])`;\n  }\n  if (delimiter.length < 2) {\n    return `(?:(?!${escape(backtrack)})[^${escape(delimiter)}])`;\n  }\n  return `(?:(?!${escape(backtrack)}|${escape(delimiter)})[\\\\s\\\\S])`;\n}\n\n/**\n * Stringify token data into a path string.\n */\nexport function stringify(data: TokenData) {\n  return data.tokens\n    .map(function stringifyToken(token, index, tokens): string {\n      if (token.type === \"text\") return escapeText(token.value);\n      if (token.type === \"group\") {\n        return `{${token.tokens.map(stringifyToken).join(\"\")}}`;\n      }\n\n      const isSafe =\n        isNameSafe(token.name) && isNextNameSafe(tokens[index + 1]);\n      const key = isSafe ? token.name : JSON.stringify(token.name);\n\n      if (token.type === \"param\") return `:${key}`;\n      if (token.type === \"wildcard\") return `*${key}`;\n      throw new TypeError(`Unexpected token: ${token}`);\n    })\n    .join(\"\");\n}\n\nfunction isNameSafe(name: string) {\n  const [first, ...rest] = name;\n  if (!ID_START.test(first)) return false;\n  return rest.every((char) => ID_CONTINUE.test(char));\n}\n\nfunction isNextNameSafe(token: Token | undefined) {\n  if (token?.type !== \"text\") return true;\n  return !ID_CONTINUE.test(token.value[0]);\n}\n"]}
\ No newline at end of file
+{"version":3,"file":"index.js","sourceRoot":"","sources":["../src/index.ts"],"names":[],"mappings":";;;AAoRA,sBA6CC;AAKD,0BAgBC;AAgHD,sBA+BC;AAED,oCA+BC;AAsFD,8BAiBC;AA7mBD,MAAM,iBAAiB,GAAG,GAAG,CAAC;AAC9B,MAAM,UAAU,GAAG,CAAC,KAAa,EAAE,EAAE,CAAC,KAAK,CAAC;AAC5C,MAAM,QAAQ,GAAG,qBAAqB,CAAC;AACvC,MAAM,WAAW,GAAG,mCAAmC,CAAC;AACxD,MAAM,SAAS,GAAG,mCAAmC,CAAC;AAkFtD,MAAM,aAAa,GAA8B;IAC/C,UAAU;IACV,GAAG,EAAE,GAAG;IACR,GAAG,EAAE,GAAG;IACR,YAAY;IACZ,GAAG,EAAE,GAAG;IACR,GAAG,EAAE,GAAG;IACR,GAAG,EAAE,GAAG;IACR,GAAG,EAAE,GAAG;IACR,GAAG,EAAE,GAAG;IACR,GAAG,EAAE,GAAG;IACR,GAAG,EAAE,GAAG;CACT,CAAC;AAEF;;GAEG;AACH,SAAS,UAAU,CAAC,GAAW;IAC7B,OAAO,GAAG,CAAC,OAAO,CAAC,kBAAkB,EAAE,MAAM,CAAC,CAAC;AACjD,CAAC;AAED;;GAEG;AACH,SAAS,MAAM,CAAC,GAAW;IACzB,OAAO,GAAG,CAAC,OAAO,CAAC,sBAAsB,EAAE,MAAM,CAAC,CAAC;AACrD,CAAC;AAED;;GAEG;AACH,QAAQ,CAAC,CAAC,KAAK,CAAC,GAAW;IACzB,MAAM,KAAK,GAAG,CAAC,GAAG,GAAG,CAAC,CAAC;IACvB,IAAI,CAAC,GAAG,CAAC,CAAC;IAEV,SAAS,IAAI;QACX,IAAI,KAAK,GAAG,EAAE,CAAC;QAEf,IAAI,QAAQ,CAAC,IAAI,CAAC,KAAK,CAAC,EAAE,CAAC,CAAC,CAAC,EAAE,CAAC;YAC9B,KAAK,IAAI,KAAK,CAAC,CAAC,CAAC,CAAC;YAClB,OAAO,WAAW,CAAC,IAAI,CAAC,KAAK,CAAC,EAAE,CAAC,CAAC,CAAC,EAAE,CAAC;gBACpC,KAAK,IAAI,KAAK,CAAC,CAAC,CAAC,CAAC;YACpB,CAAC;QACH,CAAC;aAAM,IAAI,KAAK,CAAC,CAAC,CAAC,KAAK,GAAG,EAAE,CAAC;YAC5B,IAAI,GAAG,GAAG,CAAC,CAAC;YAEZ,OAAO,CAAC,GAAG,KAAK,CAAC,MAAM,EAAE,CAAC;gBACxB,IAAI,KAAK,CAAC,EAAE,CAAC,CAAC,KAAK,GAAG,EAAE,CAAC;oBACvB,CAAC,EAAE,CAAC;oBACJ,GAAG,GAAG,CAAC,CAAC;oBACR,MAAM;gBACR,CAAC;gBAED,IAAI,KAAK,CAAC,CAAC,CAAC,KAAK,IAAI,EAAE,CAAC;oBACtB,KAAK,IAAI,KAAK,CAAC,EAAE,CAAC,CAAC,CAAC;gBACtB,CAAC;qBAAM,CAAC;oBACN,KAAK,IAAI,KAAK,CAAC,CAAC,CAAC,CAAC;gBACpB,CAAC;YACH,CAAC;YAED,IAAI,GAAG,EAAE,CAAC;gBACR,MAAM,IAAI,SAAS,CAAC,yBAAyB,GAAG,KAAK,SAAS,EAAE,CAAC,CAAC;YACpE,CAAC;QACH,CAAC;QAED,IAAI,CAAC,KAAK,EAAE,CAAC;YACX,MAAM,IAAI,SAAS,CAAC,6BAA6B,CAAC,KAAK,SAAS,EAAE,CAAC,CAAC;QACtE,CAAC;QAED,OAAO,KAAK,CAAC;IACf,CAAC;IAED,OAAO,CAAC,GAAG,KAAK,CAAC,MAAM,EAAE,CAAC;QACxB,MAAM,KAAK,GAAG,KAAK,CAAC,CAAC,CAAC,CAAC;QACvB,MAAM,IAAI,GAAG,aAAa,CAAC,KAAK,CAAC,CAAC;QAElC,IAAI,IAAI,EAAE,CAAC;YACT,MAAM,EAAE,IAAI,EAAE,KAAK,EAAE,CAAC,EAAE,EAAE,KAAK,EAAE,CAAC;QACpC,CAAC;aAAM,IAAI,KAAK,KAAK,IAAI,EAAE,CAAC;YAC1B,MAAM,EAAE,IAAI,EAAE,SAAS,EAAE,KAAK,EAAE,CAAC,EAAE,EAAE,KAAK,EAAE,KAAK,CAAC,CAAC,EAAE,CAAC,EAAE,CAAC;QAC3D,CAAC;aAAM,IAAI,KAAK,KAAK,GAAG,EAAE,CAAC;YACzB,MAAM,KAAK,GAAG,IAAI,EAAE,CAAC;YACrB,MAAM,EAAE,IAAI,EAAE,OAAO,EAAE,KAAK,EAAE,CAAC,EAAE,KAAK,EAAE,CAAC;QAC3C,CAAC;aAAM,IAAI,KAAK,KAAK,GAAG,EAAE,CAAC;YACzB,MAAM,KAAK,GAAG,IAAI,EAAE,CAAC;YACrB,MAAM,EAAE,IAAI,EAAE,UAAU,EAAE,KAAK,EAAE,CAAC,EAAE,KAAK,EAAE,CAAC;QAC9C,CAAC;aAAM,CAAC;YACN,MAAM,EAAE,IAAI,EAAE,MAAM,EAAE,KAAK,EAAE,CAAC,EAAE,KAAK,EAAE,KAAK,CAAC,CAAC,EAAE,CAAC,EAAE,CAAC;QACtD,CAAC;IACH,CAAC;IAED,OAAO,EAAE,IAAI,EAAE,KAAK,EAAE,KAAK,EAAE,CAAC,EAAE,KAAK,EAAE,EAAE,EAAE,CAAC;AAC9C,CAAC;AAED,MAAM,IAAI;IAGR,YAAoB,MAAqC;QAArC,WAAM,GAAN,MAAM,CAA+B;IAAG,CAAC;IAE7D,IAAI;QACF,IAAI,CAAC,IAAI,CAAC,KAAK,EAAE,CAAC;YAChB,MAAM,IAAI,GAAG,IAAI,CAAC,MAAM,CAAC,IAAI,EAAE,CAAC;YAChC,IAAI,CAAC,KAAK,GAAG,IAAI,CAAC,KAAK,CAAC;QAC1B,CAAC;QACD,OAAO,IAAI,CAAC,KAAK,CAAC;IACpB,CAAC;IAED,UAAU,CAAC,IAAe;QACxB,MAAM,KAAK,GAAG,IAAI,CAAC,IAAI,EAAE,CAAC;QAC1B,IAAI,KAAK,CAAC,IAAI,KAAK,IAAI;YAAE,OAAO;QAChC,IAAI,CAAC,KAAK,GAAG,SAAS,CAAC,CAAC,wBAAwB;QAChD,OAAO,KAAK,CAAC,KAAK,CAAC;IACrB,CAAC;IAED,OAAO,CAAC,IAAe;QACrB,MAAM,KAAK,GAAG,IAAI,CAAC,UAAU,CAAC,IAAI,CAAC,CAAC;QACpC,IAAI,KAAK,KAAK,SAAS;YAAE,OAAO,KAAK,CAAC;QACtC,MAAM,EAAE,IAAI,EAAE,QAAQ,EAAE,KAAK,EAAE,GAAG,IAAI,CAAC,IAAI,EAAE,CAAC;QAC9C,MAAM,IAAI,SAAS,CACjB,cAAc,QAAQ,OAAO,KAAK,cAAc,IAAI,KAAK,SAAS,EAAE,CACrE,CAAC;IACJ,CAAC;IAED,IAAI;QACF,IAAI,MAAM,GAAG,EAAE,CAAC;QAChB,IAAI,KAAyB,CAAC;QAC9B,OAAO,CAAC,KAAK,GAAG,IAAI,CAAC,UAAU,CAAC,MAAM,CAAC,IAAI,IAAI,CAAC,UAAU,CAAC,SAAS,CAAC,CAAC,EAAE,CAAC;YACvE,MAAM,IAAI,KAAK,CAAC;QAClB,CAAC;QACD,OAAO,MAAM,CAAC;IAChB,CAAC;CACF;AAiDD;;GAEG;AACH,MAAa,SAAS;IACpB,YAA4B,MAAe;QAAf,WAAM,GAAN,MAAM,CAAS;IAAG,CAAC;CAChD;AAFD,8BAEC;AAED;;GAEG;AACH,SAAgB,KAAK,CAAC,GAAW,EAAE,UAAwB,EAAE;IAC3D,MAAM,EAAE,UAAU,GAAG,UAAU,EAAE,GAAG,OAAO,CAAC;IAC5C,MAAM,EAAE,GAAG,IAAI,IAAI,CAAC,KAAK,CAAC,GAAG,CAAC,CAAC,CAAC;IAEhC,SAAS,OAAO,CAAC,OAAkB;QACjC,MAAM,MAAM,GAAY,EAAE,CAAC;QAE3B,OAAO,IAAI,EAAE,CAAC;YACZ,MAAM,IAAI,GAAG,EAAE,CAAC,IAAI,EAAE,CAAC;YACvB,IAAI,IAAI;gBAAE,MAAM,CAAC,IAAI,CAAC,EAAE,IAAI,EAAE,MAAM,EAAE,KAAK,EAAE,UAAU,CAAC,IAAI,CAAC,EAAE,CAAC,CAAC;YAEjE,MAAM,KAAK,GAAG,EAAE,CAAC,UAAU,CAAC,OAAO,CAAC,CAAC;YACrC,IAAI,KAAK,EAAE,CAAC;gBACV,MAAM,CAAC,IAAI,CAAC;oBACV,IAAI,EAAE,OAAO;oBACb,IAAI,EAAE,KAAK;iBACZ,CAAC,CAAC;gBACH,SAAS;YACX,CAAC;YAED,MAAM,QAAQ,GAAG,EAAE,CAAC,UAAU,CAAC,UAAU,CAAC,CAAC;YAC3C,IAAI,QAAQ,EAAE,CAAC;gBACb,MAAM,CAAC,IAAI,CAAC;oBACV,IAAI,EAAE,UAAU;oBAChB,IAAI,EAAE,QAAQ;iBACf,CAAC,CAAC;gBACH,SAAS;YACX,CAAC;YAED,MAAM,IAAI,GAAG,EAAE,CAAC,UAAU,CAAC,GAAG,CAAC,CAAC;YAChC,IAAI,IAAI,EAAE,CAAC;gBACT,MAAM,CAAC,IAAI,CAAC;oBACV,IAAI,EAAE,OAAO;oBACb,MAAM,EAAE,OAAO,CAAC,GAAG,CAAC;iBACrB,CAAC,CAAC;gBACH,SAAS;YACX,CAAC;YAED,EAAE,CAAC,OAAO,CAAC,OAAO,CAAC,CAAC;YACpB,OAAO,MAAM,CAAC;QAChB,CAAC;IACH,CAAC;IAED,MAAM,MAAM,GAAG,OAAO,CAAC,KAAK,CAAC,CAAC;IAC9B,OAAO,IAAI,SAAS,CAAC,MAAM,CAAC,CAAC;AAC/B,CAAC;AAED;;GAEG;AACH,SAAgB,OAAO,CACrB,IAAU,EACV,UAAyC,EAAE;IAE3C,MAAM,EAAE,MAAM,GAAG,kBAAkB,EAAE,SAAS,GAAG,iBAAiB,EAAE,GAClE,OAAO,CAAC;IACV,MAAM,IAAI,GAAG,IAAI,YAAY,SAAS,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,KAAK,CAAC,IAAI,EAAE,OAAO,CAAC,CAAC;IACrE,MAAM,EAAE,GAAG,gBAAgB,CAAC,IAAI,CAAC,MAAM,EAAE,SAAS,EAAE,MAAM,CAAC,CAAC;IAE5D,OAAO,SAAS,IAAI,CAAC,OAAU,EAAO;QACpC,MAAM,CAAC,IAAI,EAAE,GAAG,OAAO,CAAC,GAAG,EAAE,CAAC,IAAI,CAAC,CAAC;QACpC,IAAI,OAAO,CAAC,MAAM,EAAE,CAAC;YACnB,MAAM,IAAI,SAAS,CAAC,uBAAuB,OAAO,CAAC,IAAI,CAAC,IAAI,CAAC,EAAE,CAAC,CAAC;QACnE,CAAC;QACD,OAAO,IAAI,CAAC;IACd,CAAC,CAAC;AACJ,CAAC;AAKD,SAAS,gBAAgB,CACvB,MAAe,EACf,SAAiB,EACjB,MAAsB;IAEtB,MAAM,QAAQ,GAAG,MAAM,CAAC,GAAG,CAAC,CAAC,KAAK,EAAE,EAAE,CACpC,eAAe,CAAC,KAAK,EAAE,SAAS,EAAE,MAAM,CAAC,CAC1C,CAAC;IAEF,OAAO,CAAC,IAAe,EAAE,EAAE;QACzB,MAAM,MAAM,GAAa,CAAC,EAAE,CAAC,CAAC;QAE9B,KAAK,MAAM,OAAO,IAAI,QAAQ,EAAE,CAAC;YAC/B,MAAM,CAAC,KAAK,EAAE,GAAG,MAAM,CAAC,GAAG,OAAO,CAAC,IAAI,CAAC,CAAC;YACzC,MAAM,CAAC,CAAC,CAAC,IAAI,KAAK,CAAC;YACnB,MAAM,CAAC,IAAI,CAAC,GAAG,MAAM,CAAC,CAAC;QACzB,CAAC;QAED,OAAO,MAAM,CAAC;IAChB,CAAC,CAAC;AACJ,CAAC;AAED;;GAEG;AACH,SAAS,eAAe,CACtB,KAAY,EACZ,SAAiB,EACjB,MAAsB;IAEtB,IAAI,KAAK,CAAC,IAAI,KAAK,MAAM;QAAE,OAAO,GAAG,EAAE,CAAC,CAAC,KAAK,CAAC,KAAK,CAAC,CAAC;IAEtD,IAAI,KAAK,CAAC,IAAI,KAAK,OAAO,EAAE,CAAC;QAC3B,MAAM,EAAE,GAAG,gBAAgB,CAAC,KAAK,CAAC,MAAM,EAAE,SAAS,EAAE,MAAM,CAAC,CAAC;QAE7D,OAAO,CAAC,IAAI,EAAE,EAAE;YACd,MAAM,CAAC,KAAK,EAAE,GAAG,OAAO,CAAC,GAAG,EAAE,CAAC,IAAI,CAAC,CAAC;YACrC,IAAI,CAAC,OAAO,CAAC,MAAM;gBAAE,OAAO,CAAC,KAAK,CAAC,CAAC;YACpC,OAAO,CAAC,EAAE,CAAC,CAAC;QACd,CAAC,CAAC;IACJ,CAAC;IAED,MAAM,WAAW,GAAG,MAAM,IAAI,UAAU,CAAC;IAEzC,IAAI,KAAK,CAAC,IAAI,KAAK,UAAU,IAAI,MAAM,KAAK,KAAK,EAAE,CAAC;QAClD,OAAO,CAAC,IAAI,EAAE,EAAE;YACd,MAAM,KAAK,GAAG,IAAI,CAAC,KAAK,CAAC,IAAI,CAAC,CAAC;YAC/B,IAAI,KAAK,IAAI,IAAI;gBAAE,OAAO,CAAC,EAAE,EAAE,KAAK,CAAC,IAAI,CAAC,CAAC;YAE3C,IAAI,CAAC,KAAK,CAAC,OAAO,CAAC,KAAK,CAAC,IAAI,KAAK,CAAC,MAAM,KAAK,CAAC,EAAE,CAAC;gBAChD,MAAM,IAAI,SAAS,CAAC,aAAa,KAAK,CAAC,IAAI,2BAA2B,CAAC,CAAC;YAC1E,CAAC;YAED,OAAO;gBACL,KAAK;qBACF,GAAG,CAAC,CAAC,KAAK,EAAE,KAAK,EAAE,EAAE;oBACpB,IAAI,OAAO,KAAK,KAAK,QAAQ,EAAE,CAAC;wBAC9B,MAAM,IAAI,SAAS,CACjB,aAAa,KAAK,CAAC,IAAI,IAAI,KAAK,kBAAkB,CACnD,CAAC;oBACJ,CAAC;oBAED,OAAO,WAAW,CAAC,KAAK,CAAC,CAAC;gBAC5B,CAAC,CAAC;qBACD,IAAI,CAAC,SAAS,CAAC;aACnB,CAAC;QACJ,CAAC,CAAC;IACJ,CAAC;IAED,OAAO,CAAC,IAAI,EAAE,EAAE;QACd,MAAM,KAAK,GAAG,IAAI,CAAC,KAAK,CAAC,IAAI,CAAC,CAAC;QAC/B,IAAI,KAAK,IAAI,IAAI;YAAE,OAAO,CAAC,EAAE,EAAE,KAAK,CAAC,IAAI,CAAC,CAAC;QAE3C,IAAI,OAAO,KAAK,KAAK,QAAQ,EAAE,CAAC;YAC9B,MAAM,IAAI,SAAS,CAAC,aAAa,KAAK,CAAC,IAAI,kBAAkB,CAAC,CAAC;QACjE,CAAC;QAED,OAAO,CAAC,WAAW,CAAC,KAAK,CAAC,CAAC,CAAC;IAC9B,CAAC,CAAC;AACJ,CAAC;AAyBD;;GAEG;AACH,SAAgB,KAAK,CACnB,IAAmB,EACnB,UAAuC,EAAE;IAEzC,MAAM,EAAE,MAAM,GAAG,kBAAkB,EAAE,SAAS,GAAG,iBAAiB,EAAE,GAClE,OAAO,CAAC;IACV,MAAM,EAAE,MAAM,EAAE,IAAI,EAAE,GAAG,YAAY,CAAC,IAAI,EAAE,OAAO,CAAC,CAAC;IAErD,MAAM,QAAQ,GAAG,IAAI,CAAC,GAAG,CAAC,CAAC,GAAG,EAAE,EAAE;QAChC,IAAI,MAAM,KAAK,KAAK;YAAE,OAAO,UAAU,CAAC;QACxC,IAAI,GAAG,CAAC,IAAI,KAAK,OAAO;YAAE,OAAO,MAAM,CAAC;QACxC,OAAO,CAAC,KAAa,EAAE,EAAE,CAAC,KAAK,CAAC,KAAK,CAAC,SAAS,CAAC,CAAC,GAAG,CAAC,MAAM,CAAC,CAAC;IAC/D,CAAC,CAAC,CAAC;IAEH,OAAO,SAAS,KAAK,CAAC,KAAa;QACjC,MAAM,CAAC,GAAG,MAAM,CAAC,IAAI,CAAC,KAAK,CAAC,CAAC;QAC7B,IAAI,CAAC,CAAC;YAAE,OAAO,KAAK,CAAC;QAErB,MAAM,IAAI,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC;QAClB,MAAM,MAAM,GAAG,MAAM,CAAC,MAAM,CAAC,IAAI,CAAC,CAAC;QAEnC,KAAK,IAAI,CAAC,GAAG,CAAC,EAAE,CAAC,GAAG,CAAC,CAAC,MAAM,EAAE,CAAC,EAAE,EAAE,CAAC;YAClC,IAAI,CAAC,CAAC,CAAC,CAAC,KAAK,SAAS;gBAAE,SAAS;YAEjC,MAAM,GAAG,GAAG,IAAI,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC;YACxB,MAAM,OAAO,GAAG,QAAQ,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC;YAChC,MAAM,CAAC,GAAG,CAAC,IAAI,CAAC,GAAG,OAAO,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC;QACnC,CAAC;QAED,OAAO,EAAE,IAAI,EAAE,MAAM,EAAE,CAAC;IAC1B,CAAC,CAAC;AACJ,CAAC;AAED,SAAgB,YAAY,CAC1B,IAAmB,EACnB,UAA8C,EAAE;IAEhD,MAAM,EACJ,SAAS,GAAG,iBAAiB,EAC7B,GAAG,GAAG,IAAI,EACV,SAAS,GAAG,KAAK,EACjB,QAAQ,GAAG,IAAI,GAChB,GAAG,OAAO,CAAC;IACZ,MAAM,IAAI,GAAS,EAAE,CAAC;IACtB,MAAM,OAAO,GAAa,EAAE,CAAC;IAC7B,MAAM,KAAK,GAAG,SAAS,CAAC,CAAC,CAAC,EAAE,CAAC,CAAC,CAAC,GAAG,CAAC;IACnC,MAAM,KAAK,GAAG,KAAK,CAAC,OAAO,CAAC,IAAI,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC;IAClD,MAAM,KAAK,GAAG,KAAK,CAAC,GAAG,CAAC,CAAC,IAAI,EAAE,EAAE,CAC/B,IAAI,YAAY,SAAS,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,KAAK,CAAC,IAAI,EAAE,OAAO,CAAC,CACxD,CAAC;IAEF,KAAK,MAAM,EAAE,MAAM,EAAE,IAAI,KAAK,EAAE,CAAC;QAC/B,KAAK,MAAM,GAAG,IAAI,OAAO,CAAC,MAAM,EAAE,CAAC,EAAE,EAAE,CAAC,EAAE,CAAC;YACzC,MAAM,MAAM,GAAG,gBAAgB,CAAC,GAAG,EAAE,SAAS,EAAE,IAAI,CAAC,CAAC;YACtD,OAAO,CAAC,IAAI,CAAC,MAAM,CAAC,CAAC;QACvB,CAAC;IACH,CAAC;IAED,IAAI,OAAO,GAAG,OAAO,OAAO,CAAC,IAAI,CAAC,GAAG,CAAC,GAAG,CAAC;IAC1C,IAAI,QAAQ;QAAE,OAAO,IAAI,MAAM,MAAM,CAAC,SAAS,CAAC,KAAK,CAAC;IACtD,OAAO,IAAI,GAAG,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,MAAM,MAAM,CAAC,SAAS,CAAC,KAAK,CAAC;IAEpD,MAAM,MAAM,GAAG,IAAI,MAAM,CAAC,OAAO,EAAE,KAAK,CAAC,CAAC;IAC1C,OAAO,EAAE,MAAM,EAAE,IAAI,EAAE,CAAC;AAC1B,CAAC;AAOD;;GAEG;AACH,QAAQ,CAAC,CAAC,OAAO,CACf,MAAe,EACf,KAAa,EACb,IAAiB;IAEjB,IAAI,KAAK,KAAK,MAAM,CAAC,MAAM,EAAE,CAAC;QAC5B,OAAO,MAAM,IAAI,CAAC;IACpB,CAAC;IAED,MAAM,KAAK,GAAG,MAAM,CAAC,KAAK,CAAC,CAAC;IAE5B,IAAI,KAAK,CAAC,IAAI,KAAK,OAAO,EAAE,CAAC;QAC3B,MAAM,IAAI,GAAG,IAAI,CAAC,KAAK,EAAE,CAAC;QAC1B,KAAK,MAAM,GAAG,IAAI,OAAO,CAAC,KAAK,CAAC,MAAM,EAAE,CAAC,EAAE,IAAI,CAAC,EAAE,CAAC;YACjD,KAAK,CAAC,CAAC,OAAO,CAAC,MAAM,EAAE,KAAK,GAAG,CAAC,EAAE,GAAG,CAAC,CAAC;QACzC,CAAC;IACH,CAAC;SAAM,CAAC;QACN,IAAI,CAAC,IAAI,CAAC,KAAK,CAAC,CAAC;IACnB,CAAC;IAED,KAAK,CAAC,CAAC,OAAO,CAAC,MAAM,EAAE,KAAK,GAAG,CAAC,EAAE,IAAI,CAAC,CAAC;AAC1C,CAAC;AAED;;GAEG;AACH,SAAS,gBAAgB,CAAC,MAAmB,EAAE,SAAiB,EAAE,IAAU;IAC1E,IAAI,MAAM,GAAG,EAAE,CAAC;IAChB,IAAI,SAAS,GAAG,EAAE,CAAC;IACnB,IAAI,kBAAkB,GAAG,IAAI,CAAC;IAE9B,KAAK,IAAI,CAAC,GAAG,CAAC,EAAE,CAAC,GAAG,MAAM,CAAC,MAAM,EAAE,CAAC,EAAE,EAAE,CAAC;QACvC,MAAM,KAAK,GAAG,MAAM,CAAC,CAAC,CAAC,CAAC;QAExB,IAAI,KAAK,CAAC,IAAI,KAAK,MAAM,EAAE,CAAC;YAC1B,MAAM,IAAI,MAAM,CAAC,KAAK,CAAC,KAAK,CAAC,CAAC;YAC9B,SAAS,IAAI,KAAK,CAAC,KAAK,CAAC;YACzB,kBAAkB,KAAlB,kBAAkB,GAAK,KAAK,CAAC,KAAK,CAAC,QAAQ,CAAC,SAAS,CAAC,EAAC;YACvD,SAAS;QACX,CAAC;QAED,IAAI,KAAK,CAAC,IAAI,KAAK,OAAO,IAAI,KAAK,CAAC,IAAI,KAAK,UAAU,EAAE,CAAC;YACxD,IAAI,CAAC,kBAAkB,IAAI,CAAC,SAAS,EAAE,CAAC;gBACtC,MAAM,IAAI,SAAS,CAAC,uBAAuB,KAAK,CAAC,IAAI,MAAM,SAAS,EAAE,CAAC,CAAC;YAC1E,CAAC;YAED,IAAI,KAAK,CAAC,IAAI,KAAK,OAAO,EAAE,CAAC;gBAC3B,MAAM,IAAI,IAAI,MAAM,CAAC,SAAS,EAAE,kBAAkB,CAAC,CAAC,CAAC,EAAE,CAAC,CAAC,CAAC,SAAS,CAAC,IAAI,CAAC;YAC3E,CAAC;iBAAM,CAAC;gBACN,MAAM,IAAI,aAAa,CAAC;YAC1B,CAAC;YAED,IAAI,CAAC,IAAI,CAAC,KAAK,CAAC,CAAC;YACjB,SAAS,GAAG,EAAE,CAAC;YACf,kBAAkB,GAAG,KAAK,CAAC;YAC3B,SAAS;QACX,CAAC;IACH,CAAC;IAED,OAAO,MAAM,CAAC;AAChB,CAAC;AAED,SAAS,MAAM,CAAC,SAAiB,EAAE,SAAiB;IAClD,IAAI,SAAS,CAAC,MAAM,GAAG,CAAC,EAAE,CAAC;QACzB,IAAI,SAAS,CAAC,MAAM,GAAG,CAAC;YAAE,OAAO,KAAK,MAAM,CAAC,SAAS,GAAG,SAAS,CAAC,GAAG,CAAC;QACvE,OAAO,SAAS,MAAM,CAAC,SAAS,CAAC,MAAM,MAAM,CAAC,SAAS,CAAC,IAAI,CAAC;IAC/D,CAAC;IACD,IAAI,SAAS,CAAC,MAAM,GAAG,CAAC,EAAE,CAAC;QACzB,OAAO,SAAS,MAAM,CAAC,SAAS,CAAC,MAAM,MAAM,CAAC,SAAS,CAAC,IAAI,CAAC;IAC/D,CAAC;IACD,OAAO,SAAS,MAAM,CAAC,SAAS,CAAC,IAAI,MAAM,CAAC,SAAS,CAAC,YAAY,CAAC;AACrE,CAAC;AAED;;GAEG;AACH,SAAgB,SAAS,CAAC,IAAe;IACvC,OAAO,IAAI,CAAC,MAAM;SACf,GAAG,CAAC,SAAS,cAAc,CAAC,KAAK,EAAE,KAAK,EAAE,MAAM;QAC/C,IAAI,KAAK,CAAC,IAAI,KAAK,MAAM;YAAE,OAAO,UAAU,CAAC,KAAK,CAAC,KAAK,CAAC,CAAC;QAC1D,IAAI,KAAK,CAAC,IAAI,KAAK,OAAO,EAAE,CAAC;YAC3B,OAAO,IAAI,KAAK,CAAC,MAAM,CAAC,GAAG,CAAC,cAAc,CAAC,CAAC,IAAI,CAAC,EAAE,CAAC,GAAG,CAAC;QAC1D,CAAC;QAED,MAAM,MAAM,GACV,UAAU,CAAC,KAAK,CAAC,IAAI,CAAC,IAAI,cAAc,CAAC,MAAM,CAAC,KAAK,GAAG,CAAC,CAAC,CAAC,CAAC;QAC9D,MAAM,GAAG,GAAG,MAAM,CAAC,CAAC,CAAC,KAAK,CAAC,IAAI,CAAC,CAAC,CAAC,IAAI,CAAC,SAAS,CAAC,KAAK,CAAC,IAAI,CAAC,CAAC;QAE7D,IAAI,KAAK,CAAC,IAAI,KAAK,OAAO;YAAE,OAAO,IAAI,GAAG,EAAE,CAAC;QAC7C,IAAI,KAAK,CAAC,IAAI,KAAK,UAAU;YAAE,OAAO,IAAI,GAAG,EAAE,CAAC;QAChD,MAAM,IAAI,SAAS,CAAC,qBAAqB,KAAK,EAAE,CAAC,CAAC;IACpD,CAAC,CAAC;SACD,IAAI,CAAC,EAAE,CAAC,CAAC;AACd,CAAC;AAED,SAAS,UAAU,CAAC,IAAY;IAC9B,MAAM,CAAC,KAAK,EAAE,GAAG,IAAI,CAAC,GAAG,IAAI,CAAC;IAC9B,IAAI,CAAC,QAAQ,CAAC,IAAI,CAAC,KAAK,CAAC;QAAE,OAAO,KAAK,CAAC;IACxC,OAAO,IAAI,CAAC,KAAK,CAAC,CAAC,IAAI,EAAE,EAAE,CAAC,WAAW,CAAC,IAAI,CAAC,IAAI,CAAC,CAAC,CAAC;AACtD,CAAC;AAED,SAAS,cAAc,CAAC,KAAwB;IAC9C,IAAI,CAAA,KAAK,aAAL,KAAK,uBAAL,KAAK,CAAE,IAAI,MAAK,MAAM;QAAE,OAAO,IAAI,CAAC;IACxC,OAAO,CAAC,WAAW,CAAC,IAAI,CAAC,KAAK,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC;AAC3C,CAAC","sourcesContent":["const DEFAULT_DELIMITER = \"/\";\nconst NOOP_VALUE = (value: string) => value;\nconst ID_START = /^[$_\\p{ID_Start}]$/u;\nconst ID_CONTINUE = /^[$\\u200c\\u200d\\p{ID_Continue}]$/u;\nconst DEBUG_URL = \"https://git.new/pathToRegexpError\";\n\n/**\n * Encode a string into another string.\n */\nexport type Encode = (value: string) => string;\n\n/**\n * Decode a string into another string.\n */\nexport type Decode = (value: string) => string;\n\nexport interface ParseOptions {\n  /**\n   * A function for encoding input strings.\n   */\n  encodePath?: Encode;\n}\n\nexport interface PathToRegexpOptions {\n  /**\n   * Matches the path completely without trailing characters. (default: `true`)\n   */\n  end?: boolean;\n  /**\n   * Allows optional trailing delimiter to match. (default: `true`)\n   */\n  trailing?: boolean;\n  /**\n   * Match will be case sensitive. (default: `false`)\n   */\n  sensitive?: boolean;\n  /**\n   * The default delimiter for segments. (default: `'/'`)\n   */\n  delimiter?: string;\n}\n\nexport interface MatchOptions extends PathToRegexpOptions {\n  /**\n   * Function for decoding strings for params, or `false` to disable entirely. (default: `decodeURIComponent`)\n   */\n  decode?: Decode | false;\n}\n\nexport interface CompileOptions {\n  /**\n   * Function for encoding input strings for output into the path, or `false` to disable entirely. (default: `encodeURIComponent`)\n   */\n  encode?: Encode | false;\n  /**\n   * The default delimiter for segments. (default: `'/'`)\n   */\n  delimiter?: string;\n}\n\ntype TokenType =\n  | \"{\"\n  | \"}\"\n  | \"WILDCARD\"\n  | \"PARAM\"\n  | \"CHAR\"\n  | \"ESCAPED\"\n  | \"END\"\n  // Reserved for use or ambiguous due to past use.\n  | \"(\"\n  | \")\"\n  | \"[\"\n  | \"]\"\n  | \"+\"\n  | \"?\"\n  | \"!\";\n\n/**\n * Tokenizer results.\n */\ninterface LexToken {\n  type: TokenType;\n  index: number;\n  value: string;\n}\n\nconst SIMPLE_TOKENS: Record<string, TokenType> = {\n  // Groups.\n  \"{\": \"{\",\n  \"}\": \"}\",\n  // Reserved.\n  \"(\": \"(\",\n  \")\": \")\",\n  \"[\": \"[\",\n  \"]\": \"]\",\n  \"+\": \"+\",\n  \"?\": \"?\",\n  \"!\": \"!\",\n};\n\n/**\n * Escape text for stringify to path.\n */\nfunction escapeText(str: string) {\n  return str.replace(/[{}()\\[\\]+?!:*]/g, \"\\\\$&\");\n}\n\n/**\n * Escape a regular expression string.\n */\nfunction escape(str: string) {\n  return str.replace(/[.+*?^${}()[\\]|/\\\\]/g, \"\\\\$&\");\n}\n\n/**\n * Tokenize input string.\n */\nfunction* lexer(str: string): Generator<LexToken, LexToken> {\n  const chars = [...str];\n  let i = 0;\n\n  function name() {\n    let value = \"\";\n\n    if (ID_START.test(chars[++i])) {\n      value += chars[i];\n      while (ID_CONTINUE.test(chars[++i])) {\n        value += chars[i];\n      }\n    } else if (chars[i] === '\"') {\n      let pos = i;\n\n      while (i < chars.length) {\n        if (chars[++i] === '\"') {\n          i++;\n          pos = 0;\n          break;\n        }\n\n        if (chars[i] === \"\\\\\") {\n          value += chars[++i];\n        } else {\n          value += chars[i];\n        }\n      }\n\n      if (pos) {\n        throw new TypeError(`Unterminated quote at ${pos}: ${DEBUG_URL}`);\n      }\n    }\n\n    if (!value) {\n      throw new TypeError(`Missing parameter name at ${i}: ${DEBUG_URL}`);\n    }\n\n    return value;\n  }\n\n  while (i < chars.length) {\n    const value = chars[i];\n    const type = SIMPLE_TOKENS[value];\n\n    if (type) {\n      yield { type, index: i++, value };\n    } else if (value === \"\\\\\") {\n      yield { type: \"ESCAPED\", index: i++, value: chars[i++] };\n    } else if (value === \":\") {\n      const value = name();\n      yield { type: \"PARAM\", index: i, value };\n    } else if (value === \"*\") {\n      const value = name();\n      yield { type: \"WILDCARD\", index: i, value };\n    } else {\n      yield { type: \"CHAR\", index: i, value: chars[i++] };\n    }\n  }\n\n  return { type: \"END\", index: i, value: \"\" };\n}\n\nclass Iter {\n  private _peek?: LexToken;\n\n  constructor(private tokens: Generator<LexToken, LexToken>) {}\n\n  peek(): LexToken {\n    if (!this._peek) {\n      const next = this.tokens.next();\n      this._peek = next.value;\n    }\n    return this._peek;\n  }\n\n  tryConsume(type: TokenType): string | undefined {\n    const token = this.peek();\n    if (token.type !== type) return;\n    this._peek = undefined; // Reset after consumed.\n    return token.value;\n  }\n\n  consume(type: TokenType): string {\n    const value = this.tryConsume(type);\n    if (value !== undefined) return value;\n    const { type: nextType, index } = this.peek();\n    throw new TypeError(\n      `Unexpected ${nextType} at ${index}, expected ${type}: ${DEBUG_URL}`,\n    );\n  }\n\n  text(): string {\n    let result = \"\";\n    let value: string | undefined;\n    while ((value = this.tryConsume(\"CHAR\") || this.tryConsume(\"ESCAPED\"))) {\n      result += value;\n    }\n    return result;\n  }\n}\n\n/**\n * Plain text.\n */\nexport interface Text {\n  type: \"text\";\n  value: string;\n}\n\n/**\n * A parameter designed to match arbitrary text within a segment.\n */\nexport interface Parameter {\n  type: \"param\";\n  name: string;\n}\n\n/**\n * A wildcard parameter designed to match multiple segments.\n */\nexport interface Wildcard {\n  type: \"wildcard\";\n  name: string;\n}\n\n/**\n * A set of possible tokens to expand when matching.\n */\nexport interface Group {\n  type: \"group\";\n  tokens: Token[];\n}\n\n/**\n * A token that corresponds with a regexp capture.\n */\nexport type Key = Parameter | Wildcard;\n\n/**\n * A sequence of `path-to-regexp` keys that match capturing groups.\n */\nexport type Keys = Array<Key>;\n\n/**\n * A sequence of path match characters.\n */\nexport type Token = Text | Parameter | Wildcard | Group;\n\n/**\n * Tokenized path instance.\n */\nexport class TokenData {\n  constructor(public readonly tokens: Token[]) {}\n}\n\n/**\n * Parse a string for the raw tokens.\n */\nexport function parse(str: string, options: ParseOptions = {}): TokenData {\n  const { encodePath = NOOP_VALUE } = options;\n  const it = new Iter(lexer(str));\n\n  function consume(endType: TokenType): Token[] {\n    const tokens: Token[] = [];\n\n    while (true) {\n      const path = it.text();\n      if (path) tokens.push({ type: \"text\", value: encodePath(path) });\n\n      const param = it.tryConsume(\"PARAM\");\n      if (param) {\n        tokens.push({\n          type: \"param\",\n          name: param,\n        });\n        continue;\n      }\n\n      const wildcard = it.tryConsume(\"WILDCARD\");\n      if (wildcard) {\n        tokens.push({\n          type: \"wildcard\",\n          name: wildcard,\n        });\n        continue;\n      }\n\n      const open = it.tryConsume(\"{\");\n      if (open) {\n        tokens.push({\n          type: \"group\",\n          tokens: consume(\"}\"),\n        });\n        continue;\n      }\n\n      it.consume(endType);\n      return tokens;\n    }\n  }\n\n  const tokens = consume(\"END\");\n  return new TokenData(tokens);\n}\n\n/**\n * Compile a string to a template function for the path.\n */\nexport function compile<P extends ParamData = ParamData>(\n  path: Path,\n  options: CompileOptions & ParseOptions = {},\n) {\n  const { encode = encodeURIComponent, delimiter = DEFAULT_DELIMITER } =\n    options;\n  const data = path instanceof TokenData ? path : parse(path, options);\n  const fn = tokensToFunction(data.tokens, delimiter, encode);\n\n  return function path(data: P = {} as P) {\n    const [path, ...missing] = fn(data);\n    if (missing.length) {\n      throw new TypeError(`Missing parameters: ${missing.join(\", \")}`);\n    }\n    return path;\n  };\n}\n\nexport type ParamData = Partial<Record<string, string | string[]>>;\nexport type PathFunction<P extends ParamData> = (data?: P) => string;\n\nfunction tokensToFunction(\n  tokens: Token[],\n  delimiter: string,\n  encode: Encode | false,\n) {\n  const encoders = tokens.map((token) =>\n    tokenToFunction(token, delimiter, encode),\n  );\n\n  return (data: ParamData) => {\n    const result: string[] = [\"\"];\n\n    for (const encoder of encoders) {\n      const [value, ...extras] = encoder(data);\n      result[0] += value;\n      result.push(...extras);\n    }\n\n    return result;\n  };\n}\n\n/**\n * Convert a single token into a path building function.\n */\nfunction tokenToFunction(\n  token: Token,\n  delimiter: string,\n  encode: Encode | false,\n): (data: ParamData) => string[] {\n  if (token.type === \"text\") return () => [token.value];\n\n  if (token.type === \"group\") {\n    const fn = tokensToFunction(token.tokens, delimiter, encode);\n\n    return (data) => {\n      const [value, ...missing] = fn(data);\n      if (!missing.length) return [value];\n      return [\"\"];\n    };\n  }\n\n  const encodeValue = encode || NOOP_VALUE;\n\n  if (token.type === \"wildcard\" && encode !== false) {\n    return (data) => {\n      const value = data[token.name];\n      if (value == null) return [\"\", token.name];\n\n      if (!Array.isArray(value) || value.length === 0) {\n        throw new TypeError(`Expected \"${token.name}\" to be a non-empty array`);\n      }\n\n      return [\n        value\n          .map((value, index) => {\n            if (typeof value !== \"string\") {\n              throw new TypeError(\n                `Expected \"${token.name}/${index}\" to be a string`,\n              );\n            }\n\n            return encodeValue(value);\n          })\n          .join(delimiter),\n      ];\n    };\n  }\n\n  return (data) => {\n    const value = data[token.name];\n    if (value == null) return [\"\", token.name];\n\n    if (typeof value !== \"string\") {\n      throw new TypeError(`Expected \"${token.name}\" to be a string`);\n    }\n\n    return [encodeValue(value)];\n  };\n}\n\n/**\n * A match result contains data about the path match.\n */\nexport interface MatchResult<P extends ParamData> {\n  path: string;\n  params: P;\n}\n\n/**\n * A match is either `false` (no match) or a match result.\n */\nexport type Match<P extends ParamData> = false | MatchResult<P>;\n\n/**\n * The match function takes a string and returns whether it matched the path.\n */\nexport type MatchFunction<P extends ParamData> = (path: string) => Match<P>;\n\n/**\n * Supported path types.\n */\nexport type Path = string | TokenData;\n\n/**\n * Transform a path into a match function.\n */\nexport function match<P extends ParamData>(\n  path: Path | Path[],\n  options: MatchOptions & ParseOptions = {},\n): MatchFunction<P> {\n  const { decode = decodeURIComponent, delimiter = DEFAULT_DELIMITER } =\n    options;\n  const { regexp, keys } = pathToRegexp(path, options);\n\n  const decoders = keys.map((key) => {\n    if (decode === false) return NOOP_VALUE;\n    if (key.type === \"param\") return decode;\n    return (value: string) => value.split(delimiter).map(decode);\n  });\n\n  return function match(input: string) {\n    const m = regexp.exec(input);\n    if (!m) return false;\n\n    const path = m[0];\n    const params = Object.create(null);\n\n    for (let i = 1; i < m.length; i++) {\n      if (m[i] === undefined) continue;\n\n      const key = keys[i - 1];\n      const decoder = decoders[i - 1];\n      params[key.name] = decoder(m[i]);\n    }\n\n    return { path, params };\n  };\n}\n\nexport function pathToRegexp(\n  path: Path | Path[],\n  options: PathToRegexpOptions & ParseOptions = {},\n) {\n  const {\n    delimiter = DEFAULT_DELIMITER,\n    end = true,\n    sensitive = false,\n    trailing = true,\n  } = options;\n  const keys: Keys = [];\n  const sources: string[] = [];\n  const flags = sensitive ? \"\" : \"i\";\n  const paths = Array.isArray(path) ? path : [path];\n  const items = paths.map((path) =>\n    path instanceof TokenData ? path : parse(path, options),\n  );\n\n  for (const { tokens } of items) {\n    for (const seq of flatten(tokens, 0, [])) {\n      const regexp = sequenceToRegExp(seq, delimiter, keys);\n      sources.push(regexp);\n    }\n  }\n\n  let pattern = `^(?:${sources.join(\"|\")})`;\n  if (trailing) pattern += `(?:${escape(delimiter)}$)?`;\n  pattern += end ? \"$\" : `(?=${escape(delimiter)}|$)`;\n\n  const regexp = new RegExp(pattern, flags);\n  return { regexp, keys };\n}\n\n/**\n * Flattened token set.\n */\ntype Flattened = Text | Parameter | Wildcard;\n\n/**\n * Generate a flat list of sequence tokens from the given tokens.\n */\nfunction* flatten(\n  tokens: Token[],\n  index: number,\n  init: Flattened[],\n): Generator<Flattened[]> {\n  if (index === tokens.length) {\n    return yield init;\n  }\n\n  const token = tokens[index];\n\n  if (token.type === \"group\") {\n    const fork = init.slice();\n    for (const seq of flatten(token.tokens, 0, fork)) {\n      yield* flatten(tokens, index + 1, seq);\n    }\n  } else {\n    init.push(token);\n  }\n\n  yield* flatten(tokens, index + 1, init);\n}\n\n/**\n * Transform a flat sequence of tokens into a regular expression.\n */\nfunction sequenceToRegExp(tokens: Flattened[], delimiter: string, keys: Keys) {\n  let result = \"\";\n  let backtrack = \"\";\n  let isSafeSegmentParam = true;\n\n  for (let i = 0; i < tokens.length; i++) {\n    const token = tokens[i];\n\n    if (token.type === \"text\") {\n      result += escape(token.value);\n      backtrack += token.value;\n      isSafeSegmentParam ||= token.value.includes(delimiter);\n      continue;\n    }\n\n    if (token.type === \"param\" || token.type === \"wildcard\") {\n      if (!isSafeSegmentParam && !backtrack) {\n        throw new TypeError(`Missing text after \"${token.name}\": ${DEBUG_URL}`);\n      }\n\n      if (token.type === \"param\") {\n        result += `(${negate(delimiter, isSafeSegmentParam ? \"\" : backtrack)}+)`;\n      } else {\n        result += `([\\\\s\\\\S]+)`;\n      }\n\n      keys.push(token);\n      backtrack = \"\";\n      isSafeSegmentParam = false;\n      continue;\n    }\n  }\n\n  return result;\n}\n\nfunction negate(delimiter: string, backtrack: string) {\n  if (backtrack.length < 2) {\n    if (delimiter.length < 2) return `[^${escape(delimiter + backtrack)}]`;\n    return `(?:(?!${escape(delimiter)})[^${escape(backtrack)}])`;\n  }\n  if (delimiter.length < 2) {\n    return `(?:(?!${escape(backtrack)})[^${escape(delimiter)}])`;\n  }\n  return `(?:(?!${escape(backtrack)}|${escape(delimiter)})[\\\\s\\\\S])`;\n}\n\n/**\n * Stringify token data into a path string.\n */\nexport function stringify(data: TokenData) {\n  return data.tokens\n    .map(function stringifyToken(token, index, tokens): string {\n      if (token.type === \"text\") return escapeText(token.value);\n      if (token.type === \"group\") {\n        return `{${token.tokens.map(stringifyToken).join(\"\")}}`;\n      }\n\n      const isSafe =\n        isNameSafe(token.name) && isNextNameSafe(tokens[index + 1]);\n      const key = isSafe ? token.name : JSON.stringify(token.name);\n\n      if (token.type === \"param\") return `:${key}`;\n      if (token.type === \"wildcard\") return `*${key}`;\n      throw new TypeError(`Unexpected token: ${token}`);\n    })\n    .join(\"\");\n}\n\nfunction isNameSafe(name: string) {\n  const [first, ...rest] = name;\n  if (!ID_START.test(first)) return false;\n  return rest.every((char) => ID_CONTINUE.test(char));\n}\n\nfunction isNextNameSafe(token: Token | undefined) {\n  if (token?.type !== \"text\") return true;\n  return !ID_CONTINUE.test(token.value[0]);\n}\n"]}
diff --git a/api/node_modules/safe-buffer/index.d.ts b/api/node_modules/safe-buffer/index.d.ts
index e9fed80..c41ea76 100644
--- a/api/node_modules/safe-buffer/index.d.ts
+++ b/api/node_modules/safe-buffer/index.d.ts
@@ -184,4 +184,4 @@ declare module "safe-buffer" {
      */
     static allocUnsafeSlow(size: number): Buffer;
   }
-}
\ No newline at end of file
+}
diff --git a/api/node_modules/send/HISTORY.md b/api/node_modules/send/HISTORY.md
index 958b934..4bdd04a 100644
--- a/api/node_modules/send/HISTORY.md
+++ b/api/node_modules/send/HISTORY.md
@@ -2,8 +2,8 @@
 ==================
 
   * deps:
-    * `mime-types@^3.0.1` 
-    * `fresh@^2.0.0` 
+    * `mime-types@^3.0.1`
+    * `fresh@^2.0.0`
     * removed `destroy`
   * remove `getHeaderNames()` polyfill and refactor `clearHeaders()`
 
@@ -539,37 +539,37 @@
 
  * update range-parser and fresh
 
-0.1.4 / 2013-08-11 
+0.1.4 / 2013-08-11
 ==================
 
  * update fresh
 
-0.1.3 / 2013-07-08 
+0.1.3 / 2013-07-08
 ==================
 
  * Revert "Fix fd leak"
 
-0.1.2 / 2013-07-03 
+0.1.2 / 2013-07-03
 ==================
 
  * Fix fd leak
 
-0.1.0 / 2012-08-25 
+0.1.0 / 2012-08-25
 ==================
 
   * add options parameter to send() that is passed to fs.createReadStream() [kanongil]
 
-0.0.4 / 2012-08-16 
+0.0.4 / 2012-08-16
 ==================
 
   * allow custom "Accept-Ranges" definition
 
-0.0.3 / 2012-07-16 
+0.0.3 / 2012-07-16
 ==================
 
   * fix normalization of the root directory. Closes #3
 
-0.0.2 / 2012-07-09 
+0.0.2 / 2012-07-09
 ==================
 
   * add passing of req explicitly for now (YUCK)
diff --git a/api/node_modules/serve-static/HISTORY.md b/api/node_modules/serve-static/HISTORY.md
index a3f174e..58303e4 100644
--- a/api/node_modules/serve-static/HISTORY.md
+++ b/api/node_modules/serve-static/HISTORY.md
@@ -12,7 +12,7 @@
 2.0.0 / 2024-08-23
 ==================
 
-* deps: 
+* deps:
   * parseurl@^1.3.3
   * excape-html@^1.0.3
   * encodeurl@^2.0.0
diff --git a/api/node_modules/vary/README.md b/api/node_modules/vary/README.md
index cc000b3..05cae97 100644
--- a/api/node_modules/vary/README.md
+++ b/api/node_modules/vary/README.md
@@ -12,7 +12,7 @@ Manipulate the HTTP Vary header
 
 This is a [Node.js](https://nodejs.org/en/) module available through the
 [npm registry](https://www.npmjs.com/). Installation is done using the
-[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally): 
+[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):
 
 ```sh
 $ npm install vary
diff --git a/api/server-v2.js b/api/server-v2.js
index e2ff50a..8eab29b 100755
--- a/api/server-v2.js
+++ b/api/server-v2.js
@@ -1,9 +1,9 @@
 /**
  * GitOps Auditor API Server with GitHub MCP Integration
- * 
+ *
  * Enhanced with GitHub MCP server integration for repository operations.
  * All git operations are coordinated through Serena MCP orchestration.
- * 
+ *
  * Version: 1.1.0 (Phase 1 MCP Integration)
  */
 
@@ -21,7 +21,7 @@ const githubMCP = new GitHubMCPManager(config);
 
 // Parse command line arguments
 const args = process.argv.slice(2);
-const portArg = args.find(arg => arg.startsWith('--port='));
+const portArg = args.find((arg) => arg.startsWith('--port='));
 const portFromArg = portArg ? parseInt(portArg.split('=')[1]) : null;
 
 // Environment detection
@@ -36,17 +36,25 @@ const LOCAL_DIR = path.join(rootDir, 'repos');
 const app = express();
 
 // CORS configuration with GitHub MCP integration awareness
-const allowedOrigins = isDev ? ['http://localhost:5173', 'http://localhost:5174'] : [];
+const allowedOrigins = isDev
+  ? ['http://localhost:5173', 'http://localhost:5174']
+  : [];
 
 app.use(express.json());
 app.use((req, res, next) => {
   const origin = req.headers.origin;
   if (isDev && allowedOrigins.includes(origin)) {
     res.header('Access-Control-Allow-Origin', origin);
-    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
-    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
+    res.header(
+      'Access-Control-Allow-Methods',
+      'GET, POST, PUT, DELETE, OPTIONS'
+    );
+    res.header(
+      'Access-Control-Allow-Headers',
+      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
+    );
   }
-  
+
   if (req.method === 'OPTIONS') {
     res.sendStatus(200);
   } else {
@@ -57,7 +65,11 @@ app.use((req, res, next) => {
 // Middleware to log MCP integration status
 app.use((req, res, next) => {
   if (req.path.startsWith('/audit')) {
-    console.log(`🔄 API Request: ${req.method} ${req.path} (GitHub MCP: ${githubMCP.mcpAvailable ? 'Active' : 'Fallback'})`);
+    console.log(
+      `🔄 API Request: ${req.method} ${req.path} (GitHub MCP: ${
+        githubMCP.mcpAvailable ? 'Active' : 'Fallback'
+      })`
+    );
   }
   next();
 });
@@ -66,17 +78,22 @@ app.use((req, res, next) => {
 app.get('/audit', (req, res) => {
   try {
     console.log('📊 Loading latest audit report...');
-    
+
     // Try loading latest.json from audit-history
     const latestPath = path.join(HISTORY_DIR, 'latest.json');
     let auditData;
-    
+
     if (fs.existsSync(latestPath)) {
       auditData = JSON.parse(fs.readFileSync(latestPath, 'utf8'));
       console.log('✅ Loaded latest audit report from history');
     } else {
       // Fallback to dashboard/public/audit.json for development
-      const fallbackPath = path.join(rootDir, 'dashboard', 'public', 'audit.json');
+      const fallbackPath = path.join(
+        rootDir,
+        'dashboard',
+        'public',
+        'audit.json'
+      );
       if (fs.existsSync(fallbackPath)) {
         auditData = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
         console.log('✅ Loaded audit report from fallback location');
@@ -85,7 +102,7 @@ app.get('/audit', (req, res) => {
         return res.status(404).json({ error: 'No audit report available' });
       }
     }
-    
+
     res.json(auditData);
   } catch (err) {
     console.error('❌ Error loading audit report:', err);
@@ -97,23 +114,24 @@ app.get('/audit', (req, res) => {
 app.get('/audit/history', (req, res) => {
   try {
     console.log('📚 Loading audit history...');
-    
+
     // Create history directory if it doesn't exist
     if (!fs.existsSync(HISTORY_DIR)) {
       fs.mkdirSync(HISTORY_DIR, { recursive: true });
     }
-    
-    const files = fs.readdirSync(HISTORY_DIR)
-      .filter(file => file.endsWith('.json') && file !== 'latest.json')
+
+    const files = fs
+      .readdirSync(HISTORY_DIR)
+      .filter((file) => file.endsWith('.json') && file !== 'latest.json')
       .sort((a, b) => b.localeCompare(a)) // Most recent first
       .slice(0, 50); // Limit to 50 most recent
-    
-    const history = files.map(file => ({
+
+    const history = files.map((file) => ({
       filename: file,
       timestamp: file.replace('.json', ''),
-      path: `/audit/history/${file}`
+      path: `/audit/history/${file}`,
     }));
-    
+
     console.log(`✅ Loaded ${history.length} historical reports`);
     res.json(history);
   } catch (err) {
@@ -125,18 +143,18 @@ app.get('/audit/history', (req, res) => {
 // Clone missing repository using GitHub MCP
 app.post('/audit/clone', async (req, res) => {
   const { repo, clone_url } = req.body;
-  
+
   if (!repo || !clone_url) {
     return res.status(400).json({ error: 'repo and clone_url required' });
   }
-  
+
   try {
     console.log(`🔄 Cloning repository: ${repo}`);
     const dest = path.join(LOCAL_DIR, repo);
-    
+
     // Use GitHub MCP manager for cloning
     const result = await githubMCP.cloneRepository(repo, clone_url, dest);
-    
+
     // Create issue for audit finding if MCP is available
     if (githubMCP.mcpAvailable) {
       await githubMCP.createIssueForAuditFinding(
@@ -145,11 +163,13 @@ app.post('/audit/clone', async (req, res) => {
         ['audit', 'missing-repo', 'automated-fix']
       );
     }
-    
+
     res.json(result);
   } catch (error) {
     console.error(`❌ Clone failed for ${repo}:`, error);
-    res.status(500).json({ error: `Failed to clone ${repo}: ${error.message}` });
+    res
+      .status(500)
+      .json({ error: `Failed to clone ${repo}: ${error.message}` });
   }
 });
 
@@ -157,18 +177,18 @@ app.post('/audit/clone', async (req, res) => {
 app.post('/audit/delete', (req, res) => {
   const { repo } = req.body;
   const target = path.join(LOCAL_DIR, repo);
-  
+
   if (!fs.existsSync(target)) {
     return res.status(404).json({ error: 'Repo not found locally' });
   }
-  
+
   console.log(`🗑️  Deleting extra repository: ${repo}`);
   exec(`rm -rf ${target}`, async (err) => {
     if (err) {
       console.error(`❌ Delete failed for ${repo}:`, err);
       return res.status(500).json({ error: `Failed to delete ${repo}` });
     }
-    
+
     console.log(`✅ Successfully deleted ${repo}`);
     res.json({ status: `Deleted ${repo}` });
   });
@@ -178,15 +198,15 @@ app.post('/audit/delete', (req, res) => {
 app.post('/audit/commit', async (req, res) => {
   const { repo, message } = req.body;
   const repoPath = path.join(LOCAL_DIR, repo);
-  
+
   if (!githubMCP.isGitRepository(repoPath)) {
     return res.status(404).json({ error: 'Not a git repo' });
   }
-  
+
   try {
     console.log(`💾 Committing changes in repository: ${repo}`);
     const commitMessage = message || 'Auto commit from GitOps audit';
-    
+
     // Use GitHub MCP manager for committing
     const result = await githubMCP.commitChanges(repo, repoPath, commitMessage);
     res.json(result);
@@ -200,14 +220,14 @@ app.post('/audit/commit', async (req, res) => {
 app.post('/audit/discard', async (req, res) => {
   const { repo } = req.body;
   const repoPath = path.join(LOCAL_DIR, repo);
-  
+
   if (!githubMCP.isGitRepository(repoPath)) {
     return res.status(404).json({ error: 'Not a git repo' });
   }
-  
+
   try {
     console.log(`🗑️  Discarding changes in repository: ${repo}`);
-    
+
     // Use GitHub MCP manager for discarding changes
     const result = await githubMCP.discardChanges(repo, repoPath);
     res.json(result);
@@ -221,17 +241,17 @@ app.post('/audit/discard', async (req, res) => {
 app.get('/audit/diff/:repo', async (req, res) => {
   const repo = req.params.repo;
   const repoPath = path.join(LOCAL_DIR, repo);
-  
+
   if (!githubMCP.isGitRepository(repoPath)) {
     return res.status(404).json({ error: 'Not a git repo' });
   }
 
   try {
     console.log(`📊 Getting diff for repository: ${repo}`);
-    
+
     // Use GitHub MCP manager for getting repository diff
     const result = await githubMCP.getRepositoryDiff(repo, repoPath);
-    
+
     res.json({ repo, diff: result.diff });
   } catch (error) {
     console.error(`❌ Diff failed for ${repo}:`, error);
@@ -245,7 +265,9 @@ app.listen(PORT, '0.0.0.0', () => {
   console.log(`📡 Server running on http://0.0.0.0:${PORT}`);
   console.log(`🔧 Environment: ${isDev ? 'Development' : 'Production'}`);
   console.log(`📂 Root directory: ${rootDir}`);
-  console.log(`🔗 GitHub MCP: ${githubMCP.mcpAvailable ? 'Active' : 'Fallback mode'}`);
+  console.log(
+    `🔗 GitHub MCP: ${githubMCP.mcpAvailable ? 'Active' : 'Fallback mode'}`
+  );
   console.log(`🎯 Ready to serve GitOps audit operations!`);
 });
 
diff --git a/api/server.js b/api/server.js
index f577940..284c471 100755
--- a/api/server.js
+++ b/api/server.js
@@ -7,14 +7,14 @@ const { exec } = require('child_process');
 
 // Parse command line arguments for port
 const args = process.argv.slice(2);
-let portArg = args.find(arg => arg.startsWith('--port='));
+let portArg = args.find((arg) => arg.startsWith('--port='));
 let portFromArg = portArg ? parseInt(portArg.split('=')[1], 10) : null;
 
 // Determine if we're in development or production mode
 const isDev = process.env.NODE_ENV !== 'production';
 const rootDir = isDev
   ? path.resolve(__dirname, '..') // Development: /mnt/c/GIT/homelab-gitops-auditor
-  : '/opt/gitops';                // Production: /opt/gitops
+  : '/opt/gitops'; // Production: /opt/gitops
 
 const app = express();
 const PORT = portFromArg || process.env.PORT || 3070;
@@ -25,8 +25,14 @@ const LOCAL_DIR = isDev ? '/mnt/c/GIT' : '/mnt/c/GIT';
 if (isDev) {
   app.use((req, res, next) => {
     res.header('Access-Control-Allow-Origin', '*');
-    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
-    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
+    res.header(
+      'Access-Control-Allow-Headers',
+      'Origin, X-Requested-With, Content-Type, Accept'
+    );
+    res.header(
+      'Access-Control-Allow-Methods',
+      'GET, POST, OPTIONS, PUT, DELETE'
+    );
     next();
   });
 }
@@ -43,14 +49,17 @@ app.get('/audit', (req, res) => {
   try {
     // Try loading latest.json from audit-history
     const latestJsonPath = path.join(HISTORY_DIR, 'latest.json');
-    
+
     if (fs.existsSync(latestJsonPath)) {
       const data = fs.readFileSync(latestJsonPath);
       res.json(JSON.parse(data));
     } else {
       // Fallback to reading the static file from dashboard/public in development
-      const staticFilePath = path.join(rootDir, 'dashboard/public/GitRepoReport.json');
-      
+      const staticFilePath = path.join(
+        rootDir,
+        'dashboard/public/GitRepoReport.json'
+      );
+
       if (fs.existsSync(staticFilePath)) {
         const data = fs.readFileSync(staticFilePath);
         res.json(JSON.parse(data));
@@ -71,12 +80,13 @@ app.get('/audit/history', (req, res) => {
     if (!fs.existsSync(HISTORY_DIR)) {
       fs.mkdirSync(HISTORY_DIR, { recursive: true });
     }
-    
-    const files = fs.readdirSync(HISTORY_DIR)
-      .filter(f => f.endsWith('.json') && f !== 'latest.json')
+
+    const files = fs
+      .readdirSync(HISTORY_DIR)
+      .filter((f) => f.endsWith('.json') && f !== 'latest.json')
       .sort()
       .reverse();
-    
+
     // In development mode with no history, return empty array instead of error
     res.json(files);
   } catch (err) {
@@ -88,7 +98,8 @@ app.get('/audit/history', (req, res) => {
 // Clone missing repository
 app.post('/audit/clone', (req, res) => {
   const { repo, clone_url } = req.body;
-  if (!repo || !clone_url) return res.status(400).json({ error: 'repo and clone_url required' });
+  if (!repo || !clone_url)
+    return res.status(400).json({ error: 'repo and clone_url required' });
   const dest = path.join(LOCAL_DIR, repo);
   exec(`git clone ${clone_url} ${dest}`, (err) => {
     if (err) return res.status(500).json({ error: `Failed to clone ${repo}` });
@@ -100,7 +111,8 @@ app.post('/audit/clone', (req, res) => {
 app.post('/audit/delete', (req, res) => {
   const { repo } = req.body;
   const target = path.join(LOCAL_DIR, repo);
-  if (!fs.existsSync(target)) return res.status(404).json({ error: 'Repo not found locally' });
+  if (!fs.existsSync(target))
+    return res.status(404).json({ error: 'Repo not found locally' });
   exec(`rm -rf ${target}`, (err) => {
     if (err) return res.status(500).json({ error: `Failed to delete ${repo}` });
     res.json({ status: `Deleted ${repo}` });
@@ -111,7 +123,8 @@ app.post('/audit/delete', (req, res) => {
 app.post('/audit/commit', (req, res) => {
   const { repo, message } = req.body;
   const repoPath = path.join(LOCAL_DIR, repo);
-  if (!fs.existsSync(path.join(repoPath, '.git'))) return res.status(404).json({ error: 'Not a git repo' });
+  if (!fs.existsSync(path.join(repoPath, '.git')))
+    return res.status(404).json({ error: 'Not a git repo' });
   const commitMessage = message || 'Auto commit from GitOps audit';
   const cmd = `cd ${repoPath} && git add . && git commit -m "${commitMessage}"`;
   exec(cmd, (err, stdout, stderr) => {
@@ -124,7 +137,8 @@ app.post('/audit/commit', (req, res) => {
 app.post('/audit/discard', (req, res) => {
   const { repo } = req.body;
   const repoPath = path.join(LOCAL_DIR, repo);
-  if (!fs.existsSync(path.join(repoPath, '.git'))) return res.status(404).json({ error: 'Not a git repo' });
+  if (!fs.existsSync(path.join(repoPath, '.git')))
+    return res.status(404).json({ error: 'Not a git repo' });
   const cmd = `cd ${repoPath} && git reset --hard && git clean -fd`;
   exec(cmd, (err) => {
     if (err) return res.status(500).json({ error: 'Discard failed' });
@@ -136,7 +150,8 @@ app.post('/audit/discard', (req, res) => {
 app.get('/audit/diff/:repo', (req, res) => {
   const repo = req.params.repo;
   const repoPath = path.join(LOCAL_DIR, repo);
-  if (!fs.existsSync(path.join(repoPath, '.git'))) return res.status(404).json({ error: 'Not a git repo' });
+  if (!fs.existsSync(path.join(repoPath, '.git')))
+    return res.status(404).json({ error: 'Not a git repo' });
 
   const cmd = `cd ${repoPath} && git status --short && echo '---' && git diff`;
   exec(cmd, (err, stdout) => {
diff --git a/dashboard/README.md b/dashboard/README.md
index b92dbdd..2a7430c 100644
--- a/dashboard/README.md
+++ b/dashboard/README.md
@@ -1,54 +1,54 @@
-# React + TypeScript + Vite
-
-This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.
-
-Currently, two official plugins are available:
-
-- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
-- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
-
-## Expanding the ESLint configuration
-
-If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:
-
-```js
-export default tseslint.config({
-  extends: [
-    // Remove ...tseslint.configs.recommended and replace with this
-    ...tseslint.configs.recommendedTypeChecked,
-    // Alternatively, use this for stricter rules
-    ...tseslint.configs.strictTypeChecked,
-    // Optionally, add this for stylistic rules
-    ...tseslint.configs.stylisticTypeChecked,
-  ],
-  languageOptions: {
-    // other options...
-    parserOptions: {
-      project: ['./tsconfig.node.json', './tsconfig.app.json'],
-      tsconfigRootDir: import.meta.dirname,
-    },
-  },
-})
-```
-
-You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:
-
-```js
-// eslint.config.js
-import reactX from 'eslint-plugin-react-x'
-import reactDom from 'eslint-plugin-react-dom'
-
-export default tseslint.config({
-  plugins: {
-    // Add the react-x and react-dom plugins
-    'react-x': reactX,
-    'react-dom': reactDom,
-  },
-  rules: {
-    // other rules...
-    // Enable its recommended typescript rules
-    ...reactX.configs['recommended-typescript'].rules,
-    ...reactDom.configs.recommended.rules,
-  },
-})
-```
+# React + TypeScript + Vite
+
+This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.
+
+Currently, two official plugins are available:
+
+- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
+- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
+
+## Expanding the ESLint configuration
+
+If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:
+
+```js
+export default tseslint.config({
+  extends: [
+    // Remove ...tseslint.configs.recommended and replace with this
+    ...tseslint.configs.recommendedTypeChecked,
+    // Alternatively, use this for stricter rules
+    ...tseslint.configs.strictTypeChecked,
+    // Optionally, add this for stylistic rules
+    ...tseslint.configs.stylisticTypeChecked,
+  ],
+  languageOptions: {
+    // other options...
+    parserOptions: {
+      project: ['./tsconfig.node.json', './tsconfig.app.json'],
+      tsconfigRootDir: import.meta.dirname,
+    },
+  },
+});
+```
+
+You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:
+
+```js
+// eslint.config.js
+import reactX from 'eslint-plugin-react-x';
+import reactDom from 'eslint-plugin-react-dom';
+
+export default tseslint.config({
+  plugins: {
+    // Add the react-x and react-dom plugins
+    'react-x': reactX,
+    'react-dom': reactDom,
+  },
+  rules: {
+    // other rules...
+    // Enable its recommended typescript rules
+    ...reactX.configs['recommended-typescript'].rules,
+    ...reactDom.configs.recommended.rules,
+  },
+});
+```
diff --git a/dashboard/eslint.config.js b/dashboard/eslint.config.js
index cc5c897..82c2e20 100644
--- a/dashboard/eslint.config.js
+++ b/dashboard/eslint.config.js
@@ -1,28 +1,28 @@
-import js from '@eslint/js'
-import globals from 'globals'
-import reactHooks from 'eslint-plugin-react-hooks'
-import reactRefresh from 'eslint-plugin-react-refresh'
-import tseslint from 'typescript-eslint'
-
-export default tseslint.config(
-  { ignores: ['dist'] },
-  {
-    extends: [js.configs.recommended, ...tseslint.configs.recommended],
-    files: ['**/*.{ts,tsx}'],
-    languageOptions: {
-      ecmaVersion: 2020,
-      globals: globals.browser,
-    },
-    plugins: {
-      'react-hooks': reactHooks,
-      'react-refresh': reactRefresh,
-    },
-    rules: {
-      ...reactHooks.configs.recommended.rules,
-      'react-refresh/only-export-components': [
-        'warn',
-        { allowConstantExport: true },
-      ],
-    },
-  },
-)
+import js from '@eslint/js';
+import globals from 'globals';
+import reactHooks from 'eslint-plugin-react-hooks';
+import reactRefresh from 'eslint-plugin-react-refresh';
+import tseslint from 'typescript-eslint';
+
+export default tseslint.config(
+  { ignores: ['dist'] },
+  {
+    extends: [js.configs.recommended, ...tseslint.configs.recommended],
+    files: ['**/*.{ts,tsx}'],
+    languageOptions: {
+      ecmaVersion: 2020,
+      globals: globals.browser,
+    },
+    plugins: {
+      'react-hooks': reactHooks,
+      'react-refresh': reactRefresh,
+    },
+    rules: {
+      ...reactHooks.configs.recommended.rules,
+      'react-refresh/only-export-components': [
+        'warn',
+        { allowConstantExport: true },
+      ],
+    },
+  }
+);
diff --git a/dashboard/postcss.config.js b/dashboard/postcss.config.js
index 61817cf..ecd1fb2 100644
--- a/dashboard/postcss.config.js
+++ b/dashboard/postcss.config.js
@@ -1,6 +1,6 @@
-﻿import tailwindcss from 'tailwindcss';
-import autoprefixer from 'autoprefixer';
-
-export default {
-  plugins: [tailwindcss, autoprefixer],
-}
+﻿import tailwindcss from 'tailwindcss';
+import autoprefixer from 'autoprefixer';
+
+export default {
+  plugins: [tailwindcss, autoprefixer],
+};
diff --git a/dashboard/public/GitRepoReport.json b/dashboard/public/GitRepoReport.json
index 84161b2..eba4c76 100644
--- a/dashboard/public/GitRepoReport.json
+++ b/dashboard/public/GitRepoReport.json
@@ -64,4 +64,4 @@
       "dashboard_link": "/audit/smart_notification?action=view"
     }
   ]
-}
\ No newline at end of file
+}
diff --git a/dashboard/public/vite.svg b/dashboard/public/vite.svg
index e7b8dfb..ee9fada 100644
--- a/dashboard/public/vite.svg
+++ b/dashboard/public/vite.svg
@@ -1 +1 @@
-<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="31.88" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 257"><defs><linearGradient id="IconifyId1813088fe1fbc01fb466" x1="-.828%" x2="57.636%" y1="7.652%" y2="78.411%"><stop offset="0%" stop-color="#41D1FF"></stop><stop offset="100%" stop-color="#BD34FE"></stop></linearGradient><linearGradient id="IconifyId1813088fe1fbc01fb467" x1="43.376%" x2="50.316%" y1="2.242%" y2="89.03%"><stop offset="0%" stop-color="#FFEA83"></stop><stop offset="8.333%" stop-color="#FFDD35"></stop><stop offset="100%" stop-color="#FFA800"></stop></linearGradient></defs><path fill="url(#IconifyId1813088fe1fbc01fb466)" d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"></path><path fill="url(#IconifyId1813088fe1fbc01fb467)" d="M185.432.063L96.44 17.501a3.268 3.268 0 0 0-2.634 3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361 36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732 3.542 3.979 5.473 5.943 2.437l1.313-2.028l72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505 4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113Z"></path></svg>
\ No newline at end of file
+<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="31.88" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 257"><defs><linearGradient id="IconifyId1813088fe1fbc01fb466" x1="-.828%" x2="57.636%" y1="7.652%" y2="78.411%"><stop offset="0%" stop-color="#41D1FF"></stop><stop offset="100%" stop-color="#BD34FE"></stop></linearGradient><linearGradient id="IconifyId1813088fe1fbc01fb467" x1="43.376%" x2="50.316%" y1="2.242%" y2="89.03%"><stop offset="0%" stop-color="#FFEA83"></stop><stop offset="8.333%" stop-color="#FFDD35"></stop><stop offset="100%" stop-color="#FFA800"></stop></linearGradient></defs><path fill="url(#IconifyId1813088fe1fbc01fb466)" d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"></path><path fill="url(#IconifyId1813088fe1fbc01fb467)" d="M185.432.063L96.44 17.501a3.268 3.268 0 0 0-2.634 3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361 36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732 3.542 3.979 5.473 5.943 2.437l1.313-2.028l72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505 4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113Z"></path></svg>
diff --git a/dashboard/src/App.css b/dashboard/src/App.css
index fe59efc..b9d355d 100644
--- a/dashboard/src/App.css
+++ b/dashboard/src/App.css
@@ -1,42 +1,42 @@
-#root {
-  max-width: 1280px;
-  margin: 0 auto;
-  padding: 2rem;
-  text-align: center;
-}
-
-.logo {
-  height: 6em;
-  padding: 1.5em;
-  will-change: filter;
-  transition: filter 300ms;
-}
-.logo:hover {
-  filter: drop-shadow(0 0 2em #646cffaa);
-}
-.logo.react:hover {
-  filter: drop-shadow(0 0 2em #61dafbaa);
-}
-
-@keyframes logo-spin {
-  from {
-    transform: rotate(0deg);
-  }
-  to {
-    transform: rotate(360deg);
-  }
-}
-
-@media (prefers-reduced-motion: no-preference) {
-  a:nth-of-type(2) .logo {
-    animation: logo-spin infinite 20s linear;
-  }
-}
-
-.card {
-  padding: 2em;
-}
-
-.read-the-docs {
-  color: #888;
-}
+#root {
+  max-width: 1280px;
+  margin: 0 auto;
+  padding: 2rem;
+  text-align: center;
+}
+
+.logo {
+  height: 6em;
+  padding: 1.5em;
+  will-change: filter;
+  transition: filter 300ms;
+}
+.logo:hover {
+  filter: drop-shadow(0 0 2em #646cffaa);
+}
+.logo.react:hover {
+  filter: drop-shadow(0 0 2em #61dafbaa);
+}
+
+@keyframes logo-spin {
+  from {
+    transform: rotate(0deg);
+  }
+  to {
+    transform: rotate(360deg);
+  }
+}
+
+@media (prefers-reduced-motion: no-preference) {
+  a:nth-of-type(2) .logo {
+    animation: logo-spin infinite 20s linear;
+  }
+}
+
+.card {
+  padding: 2em;
+}
+
+.read-the-docs {
+  color: #888;
+}
diff --git a/dashboard/src/App.jsx b/dashboard/src/App.jsx
index e7a42b7..af29d37 100644
--- a/dashboard/src/App.jsx
+++ b/dashboard/src/App.jsx
@@ -1,70 +1,74 @@
-import { useEffect, useState } from "react";
-
-export default function App() {
-  const [data, setData] = useState([]);
-  const [query, setQuery] = useState("");
-
-  useEffect(() => {
-    fetch("/GitRepoReport.json")
-      .then((res) => res.json())
-      .then((json) => setData(json))
-      .catch((err) => console.error("Failed to load report:", err));
-  }, []);
-
-  const filtered = data.filter((repo) =>
-    repo.name.toLowerCase().includes(query.toLowerCase())
-  );
-
-  const badge = (label, condition) => (
-    <span
-      className={`text-xs px-2 py-1 rounded-full font-semibold border ${
-        condition
-          ? "bg-red-100 text-red-800 border-red-300"
-          : "bg-green-100 text-green-800 border-green-300"
-      }`}
-    >
-      {label}: {condition ? "Yes" : "No"}
-    </span>
-  );
-
-  return (
-    <div className="min-h-screen bg-gray-50 p-6">
-      <div className="max-w-4xl mx-auto">
-        <h1 className="text-3xl font-bold mb-4">🧭 GitOps Audit Dashboard</h1>
-        <input
-          type="text"
-          placeholder="Search repositories..."
-          className="w-full border border-gray-300 rounded-md px-4 py-2 mb-6 shadow-sm"
-          value={query}
-          onChange={(e) => setQuery(e.target.value)}
-        />
-
-        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
-          {filtered.map((repo) => (
-            <div
-              key={repo.name}
-              className="bg-white shadow-md rounded-xl p-4 border border-gray-200"
-            >
-              <h2 className="text-xl font-semibold mb-2">{repo.name}</h2>
-              <p className="text-sm text-gray-600 mb-1">
-                Branch: <span className="font-mono">{repo.branch}</span>
-              </p>
-              <p className="text-sm text-gray-600 mb-1">
-                Last Commit: <span className="font-mono">{repo.lastCommit}</span>
-              </p>
-              <p className="text-sm text-gray-600 mb-2">
-                Remote: {repo.remote || <span className="italic text-gray-400">None</span>}
-              </p>
-
-              <div className="flex flex-wrap gap-2">
-                {badge("Uncommitted", repo.uncommittedChanges)}
-                {badge("Stale", repo.isStale)}
-                {badge("Missing Files", repo.missingFiles?.length > 0)}
-              </div>
-            </div>
-          ))}
-        </div>
-      </div>
-    </div>
-  );
-}
+import { useEffect, useState } from 'react';
+
+export default function App() {
+  const [data, setData] = useState([]);
+  const [query, setQuery] = useState('');
+
+  useEffect(() => {
+    fetch('/GitRepoReport.json')
+      .then((res) => res.json())
+      .then((json) => setData(json))
+      .catch((err) => console.error('Failed to load report:', err));
+  }, []);
+
+  const filtered = data.filter((repo) =>
+    repo.name.toLowerCase().includes(query.toLowerCase())
+  );
+
+  const badge = (label, condition) => (
+    <span
+      className={`text-xs px-2 py-1 rounded-full font-semibold border ${
+        condition
+          ? 'bg-red-100 text-red-800 border-red-300'
+          : 'bg-green-100 text-green-800 border-green-300'
+      }`}
+    >
+      {label}: {condition ? 'Yes' : 'No'}
+    </span>
+  );
+
+  return (
+    <div className="min-h-screen bg-gray-50 p-6">
+      <div className="max-w-4xl mx-auto">
+        <h1 className="text-3xl font-bold mb-4">🧭 GitOps Audit Dashboard</h1>
+        <input
+          type="text"
+          placeholder="Search repositories..."
+          className="w-full border border-gray-300 rounded-md px-4 py-2 mb-6 shadow-sm"
+          value={query}
+          onChange={(e) => setQuery(e.target.value)}
+        />
+
+        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
+          {filtered.map((repo) => (
+            <div
+              key={repo.name}
+              className="bg-white shadow-md rounded-xl p-4 border border-gray-200"
+            >
+              <h2 className="text-xl font-semibold mb-2">{repo.name}</h2>
+              <p className="text-sm text-gray-600 mb-1">
+                Branch: <span className="font-mono">{repo.branch}</span>
+              </p>
+              <p className="text-sm text-gray-600 mb-1">
+                Last Commit:{' '}
+                <span className="font-mono">{repo.lastCommit}</span>
+              </p>
+              <p className="text-sm text-gray-600 mb-2">
+                Remote:{' '}
+                {repo.remote || (
+                  <span className="italic text-gray-400">None</span>
+                )}
+              </p>
+
+              <div className="flex flex-wrap gap-2">
+                {badge('Uncommitted', repo.uncommittedChanges)}
+                {badge('Stale', repo.isStale)}
+                {badge('Missing Files', repo.missingFiles?.length > 0)}
+              </div>
+            </div>
+          ))}
+        </div>
+      </div>
+    </div>
+  );
+}
diff --git a/dashboard/src/App.tsx b/dashboard/src/App.tsx
index d92295c..68f6568 100644
--- a/dashboard/src/App.tsx
+++ b/dashboard/src/App.tsx
@@ -1,227 +1,243 @@
-import { useEffect, useState } from "react";
-    import {
-    BarChart,
-    Bar,
-    XAxis,
-    YAxis,
-    Tooltip,
-    PieChart,
-    Pie,
-    Cell,
-    ResponsiveContainer,
-  } from "recharts";
-
-  // Define the API response type
-  type ApiResponse = {
-    timestamp: string;
-    health_status: string;
-    summary: {
-      total: number;
-      missing: number;
-      extra: number;
-      dirty: number;
-      clean: number;
-    };
-    repos: Array<{
-      name: string;
-      status: string;
-      clone_url?: string;
-      local_path?: string;
-      dashboard_link?: string;
-    }>;
+import { useEffect, useState } from 'react';
+import {
+  BarChart,
+  Bar,
+  XAxis,
+  YAxis,
+  Tooltip,
+  PieChart,
+  Pie,
+  Cell,
+  ResponsiveContainer,
+} from 'recharts';
+
+// Define the API response type
+type ApiResponse = {
+  timestamp: string;
+  health_status: string;
+  summary: {
+    total: number;
+    missing: number;
+    extra: number;
+    dirty: number;
+    clean: number;
   };
+  repos: Array<{
+    name: string;
+    status: string;
+    clone_url?: string;
+    local_path?: string;
+    dashboard_link?: string;
+  }>;
+};
+
+// Status colors for visualization
+const STATUS_COLORS: Record<string, string> = {
+  clean: '#22c55e', // green
+  dirty: '#6366f1', // indigo
+  missing: '#ef4444', // red
+  extra: '#f59e0b', // amber
+};
+
+export default function App() {
+  console.log('App component rendering');
+  const [data, setData] = useState<ApiResponse | null>(null);
+  const [query, setQuery] = useState('');
+  const [refreshInterval, setRefreshInterval] = useState<number>(10000);
+
+  useEffect(() => {
+    console.log('useEffect running');
+    const fetchData = () => {
+      console.log('fetchData called');
+
+      // Development environment uses relative path
+      const apiUrl = '/audit';
+
+      fetch(apiUrl)
+        .then((res) => {
+          console.log('fetch response:', res.status);
+          return res.json();
+        })
+        .then((json) => {
+          console.log('data received:', json);
+          setData(json);
+        })
+        .catch((err) => {
+          console.error('Failed to load report:', err);
+        });
+    };
 
-  // Status colors for visualization
-  const STATUS_COLORS: Record<string, string> = {
-    "clean": "#22c55e",    // green
-    "dirty": "#6366f1",    // indigo
-    "missing": "#ef4444",  // red
-    "extra": "#f59e0b",    // amber
-  };
+    fetchData();
+    const interval = setInterval(fetchData, refreshInterval);
+    return () => {
+      console.log('Cleaning up interval');
+      clearInterval(interval);
+    };
+  }, [refreshInterval]);
 
-  export default function App() {
-    console.log("App component rendering");
-    const [data, setData] = useState<ApiResponse | null>(null);
-    const [query, setQuery] = useState("");
-    const [refreshInterval, setRefreshInterval] = useState<number>(10000);
-
-    useEffect(() => {
-      console.log("useEffect running");
-      const fetchData = () => {
-        console.log("fetchData called");
-
-        // Development environment uses relative path
-        const apiUrl = '/audit';
-
-        fetch(apiUrl)
-          .then((res) => {
-            console.log("fetch response:", res.status);
-            return res.json();
-          })
-          .then((json) => {
-            console.log("data received:", json);
-            setData(json);
-          })
-          .catch((err) => {
-            console.error("Failed to load report:", err);
-          });
-      };
-
-      fetchData();
-      const interval = setInterval(fetchData, refreshInterval);
-      return () => {
-        console.log("Cleaning up interval");
-        clearInterval(interval);
-      };
-    }, [refreshInterval]);
-
-    console.log("Current data state:", data);
-
-    // Show loading state if data isn't loaded yet
-    if (!data) {
-      return <div className="p-8">Loading dashboard data...</div>;
-    }
-
-    // Create summary data for charts
-    const summaryData = Object.entries(data.summary)
-      .filter(([key]) => key !== "total")
-      .map(([name, value]) => ({ name, value }));
-
-    // Filter repos based on search query
-    const filteredRepos = data.repos.filter((repo) =>
-      repo.name.toLowerCase().includes(query.toLowerCase())
-    );
-
-    return (
-      <div className="min-h-screen bg-gray-50 p-6">
-        <div className="max-w-5xl mx-auto">
-          <h1 className="text-3xl font-bold mb-4">🧭 GitOps Audit Dashboard</h1>
-          <p className="text-gray-600 mb-4">Last updated: {data.timestamp}</p>
-
-          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
-            <input
-              type="text"
-              placeholder="Search repositories..."
-              className="w-full sm:w-1/2 border border-gray-300 rounded-md px-4 py-2 shadow-sm"
-              value={query}
-              onChange={(e) => setQuery(e.target.value)}
-            />
-
-            <div className="flex items-center gap-2">
-              <label className="text-sm font-medium ml-4">⏱ Refresh:</label>
-              <select
-                value={refreshInterval}
-                onChange={(e) => setRefreshInterval(Number(e.target.value))}
-                className="border border-gray-300 rounded px-3 py-1 text-sm shadow-sm"
-              >
-                <option value={5000}>5s</option>
-                <option value={10000}>10s</option>
-                <option value={30000}>30s</option>
-                <option value={60000}>60s</option>
-              </select>
-            </div>
-          </div>
+  console.log('Current data state:', data);
+
+  // Show loading state if data isn't loaded yet
+  if (!data) {
+    return <div className="p-8">Loading dashboard data...</div>;
+  }
 
-          <div className="flex items-center justify-center gap-2 mb-4">
-            <div className={`p-2 rounded-full ${data.health_status === "green" ? "bg-green-500" : data.health_status === "yellow" ? "bg-yellow-500" : "bg-red-500"} h-4 w-4`}></div>
-            <span className="font-medium">Status: {data.health_status.toUpperCase()}</span>
+  // Create summary data for charts
+  const summaryData = Object.entries(data.summary)
+    .filter(([key]) => key !== 'total')
+    .map(([name, value]) => ({ name, value }));
+
+  // Filter repos based on search query
+  const filteredRepos = data.repos.filter((repo) =>
+    repo.name.toLowerCase().includes(query.toLowerCase())
+  );
+
+  return (
+    <div className="min-h-screen bg-gray-50 p-6">
+      <div className="max-w-5xl mx-auto">
+        <h1 className="text-3xl font-bold mb-4">🧭 GitOps Audit Dashboard</h1>
+        <p className="text-gray-600 mb-4">Last updated: {data.timestamp}</p>
+
+        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
+          <input
+            type="text"
+            placeholder="Search repositories..."
+            className="w-full sm:w-1/2 border border-gray-300 rounded-md px-4 py-2 shadow-sm"
+            value={query}
+            onChange={(e) => setQuery(e.target.value)}
+          />
+
+          <div className="flex items-center gap-2">
+            <label className="text-sm font-medium ml-4">⏱ Refresh:</label>
+            <select
+              value={refreshInterval}
+              onChange={(e) => setRefreshInterval(Number(e.target.value))}
+              className="border border-gray-300 rounded px-3 py-1 text-sm shadow-sm"
+            >
+              <option value={5000}>5s</option>
+              <option value={10000}>10s</option>
+              <option value={30000}>30s</option>
+              <option value={60000}>60s</option>
+            </select>
           </div>
+        </div>
 
-          <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
-            <div className="h-64 bg-white shadow rounded-xl p-4">
-              <h2 className="text-lg font-semibold mb-2">📊 Repo Health (Bar)</h2>
-              <ResponsiveContainer width="100%" height="100%">
-                <BarChart data={summaryData}>
-                  <XAxis dataKey="name" />
-                  <YAxis allowDecimals={false} />
-                  <Tooltip />
-                  <Bar dataKey="value">
-                    {summaryData.map((entry) => (
-                      <Cell
-                        key={`bar-${entry.name}`}
-                        fill={STATUS_COLORS[entry.name] || "#999"}
-                      />
-                    ))}
-                  </Bar>
-                </BarChart>
-              </ResponsiveContainer>
-            </div>
+        <div className="flex items-center justify-center gap-2 mb-4">
+          <div
+            className={`p-2 rounded-full ${
+              data.health_status === 'green'
+                ? 'bg-green-500'
+                : data.health_status === 'yellow'
+                ? 'bg-yellow-500'
+                : 'bg-red-500'
+            } h-4 w-4`}
+          ></div>
+          <span className="font-medium">
+            Status: {data.health_status.toUpperCase()}
+          </span>
+        </div>
 
-            <div className="h-64 bg-white shadow rounded-xl p-4">
-              <h2 className="text-lg font-semibold mb-2">📈 Repo Breakdown (Pie)</h2>
-              <ResponsiveContainer width="100%" height="85%">
-                <PieChart>
-                  <Pie
-                    data={summaryData}
-                    dataKey="value"
-                    nameKey="name"
-                    cx="50%"
-                    cy="45%"
-                    outerRadius={70}
-                    labelLine={false}
-                    label={({ name, percent }) =>
-                      `${name} (${(percent * 100).toFixed(0)}%)`
-                    }
-                  >
-                    {summaryData.map((entry) => (
-                      <Cell
-                        key={`cell-${entry.name}`}
-                        fill={STATUS_COLORS[entry.name] || "#999"}
-                      />
-                    ))}
-                  </Pie>
-                  <Tooltip />
-                </PieChart>
-              </ResponsiveContainer>
-            </div>
+        <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
+          <div className="h-64 bg-white shadow rounded-xl p-4">
+            <h2 className="text-lg font-semibold mb-2">📊 Repo Health (Bar)</h2>
+            <ResponsiveContainer width="100%" height="100%">
+              <BarChart data={summaryData}>
+                <XAxis dataKey="name" />
+                <YAxis allowDecimals={false} />
+                <Tooltip />
+                <Bar dataKey="value">
+                  {summaryData.map((entry) => (
+                    <Cell
+                      key={`bar-${entry.name}`}
+                      fill={STATUS_COLORS[entry.name] || '#999'}
+                    />
+                  ))}
+                </Bar>
+              </BarChart>
+            </ResponsiveContainer>
           </div>
 
-          <h2 className="text-xl font-semibold mb-4">Repository Status ({filteredRepos.length})</h2>
-          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
-            {filteredRepos.map((repo) => (
-              <div
-                key={repo.name}
-                className={`bg-white shadow-md rounded-xl p-4 border-l-4 ${
-                  repo.status === "clean"
-                    ? "border-green-500"
-                    : repo.status === "dirty"
-                    ? "border-indigo-500"
-                    : repo.status === "missing"
-                    ? "border-red-500"
-                    : "border-amber-500"
-                }`}
-              >
-                <h2 className="text-xl font-semibold mb-2">{repo.name}</h2>
+          <div className="h-64 bg-white shadow rounded-xl p-4">
+            <h2 className="text-lg font-semibold mb-2">
+              📈 Repo Breakdown (Pie)
+            </h2>
+            <ResponsiveContainer width="100%" height="85%">
+              <PieChart>
+                <Pie
+                  data={summaryData}
+                  dataKey="value"
+                  nameKey="name"
+                  cx="50%"
+                  cy="45%"
+                  outerRadius={70}
+                  labelLine={false}
+                  label={({ name, percent }) =>
+                    `${name} (${(percent * 100).toFixed(0)}%)`
+                  }
+                >
+                  {summaryData.map((entry) => (
+                    <Cell
+                      key={`cell-${entry.name}`}
+                      fill={STATUS_COLORS[entry.name] || '#999'}
+                    />
+                  ))}
+                </Pie>
+                <Tooltip />
+              </PieChart>
+            </ResponsiveContainer>
+          </div>
+        </div>
+
+        <h2 className="text-xl font-semibold mb-4">
+          Repository Status ({filteredRepos.length})
+        </h2>
+        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
+          {filteredRepos.map((repo) => (
+            <div
+              key={repo.name}
+              className={`bg-white shadow-md rounded-xl p-4 border-l-4 ${
+                repo.status === 'clean'
+                  ? 'border-green-500'
+                  : repo.status === 'dirty'
+                  ? 'border-indigo-500'
+                  : repo.status === 'missing'
+                  ? 'border-red-500'
+                  : 'border-amber-500'
+              }`}
+            >
+              <h2 className="text-xl font-semibold mb-2">{repo.name}</h2>
+              <p className="text-sm text-gray-600 mb-2">
+                Status: <span className="font-medium">{repo.status}</span>
+              </p>
+
+              {repo.clone_url && (
                 <p className="text-sm text-gray-600 mb-2">
-                  Status: <span className="font-medium">{repo.status}</span>
+                  URL:{' '}
+                  <span className="font-mono text-xs">{repo.clone_url}</span>
                 </p>
+              )}
 
-                {repo.clone_url && (
-                  <p className="text-sm text-gray-600 mb-2">
-                    URL: <span className="font-mono text-xs">{repo.clone_url}</span>
-                  </p>
-                )}
-
-                {repo.local_path && (
-                  <p className="text-sm text-gray-600 mb-2">
-                    Path: <span className="font-mono text-xs">{repo.local_path}</span>
-                  </p>
-                )}
-
-                {repo.dashboard_link && (
-                  <a
-                    href={repo.dashboard_link}
-                    className="text-blue-500 hover:underline text-sm block mt-2"
-                    target="_blank"
-                    rel="noopener noreferrer"
-                  >
-                    View Details →
-                  </a>
-                )}
-              </div>
-            ))}
-          </div>
+              {repo.local_path && (
+                <p className="text-sm text-gray-600 mb-2">
+                  Path:{' '}
+                  <span className="font-mono text-xs">{repo.local_path}</span>
+                </p>
+              )}
+
+              {repo.dashboard_link && (
+                <a
+                  href={repo.dashboard_link}
+                  className="text-blue-500 hover:underline text-sm block mt-2"
+                  target="_blank"
+                  rel="noopener noreferrer"
+                >
+                  View Details →
+                </a>
+              )}
+            </div>
+          ))}
         </div>
       </div>
-    );
-  }
+    </div>
+  );
+}
diff --git a/dashboard/src/assets/react.svg b/dashboard/src/assets/react.svg
index 6c87de9..8e0e0f1 100644
--- a/dashboard/src/assets/react.svg
+++ b/dashboard/src/assets/react.svg
@@ -1 +1 @@
-<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="35.93" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 228"><path fill="#00D8FF" d="M210.483 73.824a171.49 171.49 0 0 0-8.24-2.597c.465-1.9.893-3.777 1.273-5.621c6.238-30.281 2.16-54.676-11.769-62.708c-13.355-7.7-35.196.329-57.254 19.526a171.23 171.23 0 0 0-6.375 5.848a155.866 155.866 0 0 0-4.241-3.917C100.759 3.829 77.587-4.822 63.673 3.233C50.33 10.957 46.379 33.89 51.995 62.588a170.974 170.974 0 0 0 1.892 8.48c-3.28.932-6.445 1.924-9.474 2.98C17.309 83.498 0 98.307 0 113.668c0 15.865 18.582 31.778 46.812 41.427a145.52 145.52 0 0 0 6.921 2.165a167.467 167.467 0 0 0-2.01 9.138c-5.354 28.2-1.173 50.591 12.134 58.266c13.744 7.926 36.812-.22 59.273-19.855a145.567 145.567 0 0 0 5.342-4.923a168.064 168.064 0 0 0 6.92 6.314c21.758 18.722 43.246 26.282 56.54 18.586c13.731-7.949 18.194-32.003 12.4-61.268a145.016 145.016 0 0 0-1.535-6.842c1.62-.48 3.21-.974 4.76-1.488c29.348-9.723 48.443-25.443 48.443-41.52c0-15.417-17.868-30.326-45.517-39.844Zm-6.365 70.984c-1.4.463-2.836.91-4.3 1.345c-3.24-10.257-7.612-21.163-12.963-32.432c5.106-11 9.31-21.767 12.459-31.957c2.619.758 5.16 1.557 7.61 2.4c23.69 8.156 38.14 20.213 38.14 29.504c0 9.896-15.606 22.743-40.946 31.14Zm-10.514 20.834c2.562 12.94 2.927 24.64 1.23 33.787c-1.524 8.219-4.59 13.698-8.382 15.893c-8.067 4.67-25.32-1.4-43.927-17.412a156.726 156.726 0 0 1-6.437-5.87c7.214-7.889 14.423-17.06 21.459-27.246c12.376-1.098 24.068-2.894 34.671-5.345a134.17 134.17 0 0 1 1.386 6.193ZM87.276 214.515c-7.882 2.783-14.16 2.863-17.955.675c-8.075-4.657-11.432-22.636-6.853-46.752a156.923 156.923 0 0 1 1.869-8.499c10.486 2.32 22.093 3.988 34.498 4.994c7.084 9.967 14.501 19.128 21.976 27.15a134.668 134.668 0 0 1-4.877 4.492c-9.933 8.682-19.886 14.842-28.658 17.94ZM50.35 144.747c-12.483-4.267-22.792-9.812-29.858-15.863c-6.35-5.437-9.555-10.836-9.555-15.216c0-9.322 13.897-21.212 37.076-29.293c2.813-.98 5.757-1.905 8.812-2.773c3.204 10.42 7.406 21.315 12.477 32.332c-5.137 11.18-9.399 22.249-12.634 32.792a134.718 134.718 0 0 1-6.318-1.979Zm12.378-84.26c-4.811-24.587-1.616-43.134 6.425-47.789c8.564-4.958 27.502 2.111 47.463 19.835a144.318 144.318 0 0 1 3.841 3.545c-7.438 7.987-14.787 17.08-21.808 26.988c-12.04 1.116-23.565 2.908-34.161 5.309a160.342 160.342 0 0 1-1.76-7.887Zm110.427 27.268a347.8 347.8 0 0 0-7.785-12.803c8.168 1.033 15.994 2.404 23.343 4.08c-2.206 7.072-4.956 14.465-8.193 22.045a381.151 381.151 0 0 0-7.365-13.322Zm-45.032-43.861c5.044 5.465 10.096 11.566 15.065 18.186a322.04 322.04 0 0 0-30.257-.006c4.974-6.559 10.069-12.652 15.192-18.18ZM82.802 87.83a323.167 323.167 0 0 0-7.227 13.238c-3.184-7.553-5.909-14.98-8.134-22.152c7.304-1.634 15.093-2.97 23.209-3.984a321.524 321.524 0 0 0-7.848 12.897Zm8.081 65.352c-8.385-.936-16.291-2.203-23.593-3.793c2.26-7.3 5.045-14.885 8.298-22.6a321.187 321.187 0 0 0 7.257 13.246c2.594 4.48 5.28 8.868 8.038 13.147Zm37.542 31.03c-5.184-5.592-10.354-11.779-15.403-18.433c4.902.192 9.899.29 14.978.29c5.218 0 10.376-.117 15.453-.343c-4.985 6.774-10.018 12.97-15.028 18.486Zm52.198-57.817c3.422 7.8 6.306 15.345 8.596 22.52c-7.422 1.694-15.436 3.058-23.88 4.071a382.417 382.417 0 0 0 7.859-13.026a347.403 347.403 0 0 0 7.425-13.565Zm-16.898 8.101a358.557 358.557 0 0 1-12.281 19.815a329.4 329.4 0 0 1-23.444.823c-7.967 0-15.716-.248-23.178-.732a310.202 310.202 0 0 1-12.513-19.846h.001a307.41 307.41 0 0 1-10.923-20.627a310.278 310.278 0 0 1 10.89-20.637l-.001.001a307.318 307.318 0 0 1 12.413-19.761c7.613-.576 15.42-.876 23.31-.876H128c7.926 0 15.743.303 23.354.883a329.357 329.357 0 0 1 12.335 19.695a358.489 358.489 0 0 1 11.036 20.54a329.472 329.472 0 0 1-11 20.722Zm22.56-122.124c8.572 4.944 11.906 24.881 6.52 51.026c-.344 1.668-.73 3.367-1.15 5.09c-10.622-2.452-22.155-4.275-34.23-5.408c-7.034-10.017-14.323-19.124-21.64-27.008a160.789 160.789 0 0 1 5.888-5.4c18.9-16.447 36.564-22.941 44.612-18.3ZM128 90.808c12.625 0 22.86 10.235 22.86 22.86s-10.235 22.86-22.86 22.86s-22.86-10.235-22.86-22.86s10.235-22.86 22.86-22.86Z"></path></svg>
\ No newline at end of file
+<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="35.93" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 228"><path fill="#00D8FF" d="M210.483 73.824a171.49 171.49 0 0 0-8.24-2.597c.465-1.9.893-3.777 1.273-5.621c6.238-30.281 2.16-54.676-11.769-62.708c-13.355-7.7-35.196.329-57.254 19.526a171.23 171.23 0 0 0-6.375 5.848a155.866 155.866 0 0 0-4.241-3.917C100.759 3.829 77.587-4.822 63.673 3.233C50.33 10.957 46.379 33.89 51.995 62.588a170.974 170.974 0 0 0 1.892 8.48c-3.28.932-6.445 1.924-9.474 2.98C17.309 83.498 0 98.307 0 113.668c0 15.865 18.582 31.778 46.812 41.427a145.52 145.52 0 0 0 6.921 2.165a167.467 167.467 0 0 0-2.01 9.138c-5.354 28.2-1.173 50.591 12.134 58.266c13.744 7.926 36.812-.22 59.273-19.855a145.567 145.567 0 0 0 5.342-4.923a168.064 168.064 0 0 0 6.92 6.314c21.758 18.722 43.246 26.282 56.54 18.586c13.731-7.949 18.194-32.003 12.4-61.268a145.016 145.016 0 0 0-1.535-6.842c1.62-.48 3.21-.974 4.76-1.488c29.348-9.723 48.443-25.443 48.443-41.52c0-15.417-17.868-30.326-45.517-39.844Zm-6.365 70.984c-1.4.463-2.836.91-4.3 1.345c-3.24-10.257-7.612-21.163-12.963-32.432c5.106-11 9.31-21.767 12.459-31.957c2.619.758 5.16 1.557 7.61 2.4c23.69 8.156 38.14 20.213 38.14 29.504c0 9.896-15.606 22.743-40.946 31.14Zm-10.514 20.834c2.562 12.94 2.927 24.64 1.23 33.787c-1.524 8.219-4.59 13.698-8.382 15.893c-8.067 4.67-25.32-1.4-43.927-17.412a156.726 156.726 0 0 1-6.437-5.87c7.214-7.889 14.423-17.06 21.459-27.246c12.376-1.098 24.068-2.894 34.671-5.345a134.17 134.17 0 0 1 1.386 6.193ZM87.276 214.515c-7.882 2.783-14.16 2.863-17.955.675c-8.075-4.657-11.432-22.636-6.853-46.752a156.923 156.923 0 0 1 1.869-8.499c10.486 2.32 22.093 3.988 34.498 4.994c7.084 9.967 14.501 19.128 21.976 27.15a134.668 134.668 0 0 1-4.877 4.492c-9.933 8.682-19.886 14.842-28.658 17.94ZM50.35 144.747c-12.483-4.267-22.792-9.812-29.858-15.863c-6.35-5.437-9.555-10.836-9.555-15.216c0-9.322 13.897-21.212 37.076-29.293c2.813-.98 5.757-1.905 8.812-2.773c3.204 10.42 7.406 21.315 12.477 32.332c-5.137 11.18-9.399 22.249-12.634 32.792a134.718 134.718 0 0 1-6.318-1.979Zm12.378-84.26c-4.811-24.587-1.616-43.134 6.425-47.789c8.564-4.958 27.502 2.111 47.463 19.835a144.318 144.318 0 0 1 3.841 3.545c-7.438 7.987-14.787 17.08-21.808 26.988c-12.04 1.116-23.565 2.908-34.161 5.309a160.342 160.342 0 0 1-1.76-7.887Zm110.427 27.268a347.8 347.8 0 0 0-7.785-12.803c8.168 1.033 15.994 2.404 23.343 4.08c-2.206 7.072-4.956 14.465-8.193 22.045a381.151 381.151 0 0 0-7.365-13.322Zm-45.032-43.861c5.044 5.465 10.096 11.566 15.065 18.186a322.04 322.04 0 0 0-30.257-.006c4.974-6.559 10.069-12.652 15.192-18.18ZM82.802 87.83a323.167 323.167 0 0 0-7.227 13.238c-3.184-7.553-5.909-14.98-8.134-22.152c7.304-1.634 15.093-2.97 23.209-3.984a321.524 321.524 0 0 0-7.848 12.897Zm8.081 65.352c-8.385-.936-16.291-2.203-23.593-3.793c2.26-7.3 5.045-14.885 8.298-22.6a321.187 321.187 0 0 0 7.257 13.246c2.594 4.48 5.28 8.868 8.038 13.147Zm37.542 31.03c-5.184-5.592-10.354-11.779-15.403-18.433c4.902.192 9.899.29 14.978.29c5.218 0 10.376-.117 15.453-.343c-4.985 6.774-10.018 12.97-15.028 18.486Zm52.198-57.817c3.422 7.8 6.306 15.345 8.596 22.52c-7.422 1.694-15.436 3.058-23.88 4.071a382.417 382.417 0 0 0 7.859-13.026a347.403 347.403 0 0 0 7.425-13.565Zm-16.898 8.101a358.557 358.557 0 0 1-12.281 19.815a329.4 329.4 0 0 1-23.444.823c-7.967 0-15.716-.248-23.178-.732a310.202 310.202 0 0 1-12.513-19.846h.001a307.41 307.41 0 0 1-10.923-20.627a310.278 310.278 0 0 1 10.89-20.637l-.001.001a307.318 307.318 0 0 1 12.413-19.761c7.613-.576 15.42-.876 23.31-.876H128c7.926 0 15.743.303 23.354.883a329.357 329.357 0 0 1 12.335 19.695a358.489 358.489 0 0 1 11.036 20.54a329.472 329.472 0 0 1-11 20.722Zm22.56-122.124c8.572 4.944 11.906 24.881 6.52 51.026c-.344 1.668-.73 3.367-1.15 5.09c-10.622-2.452-22.155-4.275-34.23-5.408c-7.034-10.017-14.323-19.124-21.64-27.008a160.789 160.789 0 0 1 5.888-5.4c18.9-16.447 36.564-22.941 44.612-18.3ZM128 90.808c12.625 0 22.86 10.235 22.86 22.86s-10.235 22.86-22.86 22.86s-22.86-10.235-22.86-22.86s10.235-22.86 22.86-22.86Z"></path></svg>
diff --git a/dashboard/src/components/SidebarLayout.tsx b/dashboard/src/components/SidebarLayout.tsx
index 966c810..aa27622 100644
--- a/dashboard/src/components/SidebarLayout.tsx
+++ b/dashboard/src/components/SidebarLayout.tsx
@@ -5,7 +5,7 @@ import { useState } from 'react';
 import {
   Home as HomeIcon,
   FileSearch as AuditIcon,
-  ListTodo as RoadmapIcon
+  ListTodo as RoadmapIcon,
 } from 'lucide-react';
 
 const navItems = [
diff --git a/dashboard/src/main.tsx b/dashboard/src/main.tsx
index 47895f1..bf0c47d 100644
--- a/dashboard/src/main.tsx
+++ b/dashboard/src/main.tsx
@@ -1,11 +1,11 @@
-import { StrictMode } from 'react'
-import { createRoot } from 'react-dom/client'
-import './generated.css';
-
-import RouterRoot from './router.tsx'
-
-createRoot(document.getElementById('root')!).render(
-  <StrictMode>
-    <RouterRoot />
-  </StrictMode>,
-)
+import { StrictMode } from 'react';
+import { createRoot } from 'react-dom/client';
+import './generated.css';
+
+import RouterRoot from './router.tsx';
+
+createRoot(document.getElementById('root')!).render(
+  <StrictMode>
+    <RouterRoot />
+  </StrictMode>
+);
diff --git a/dashboard/src/pages/audit.tsx b/dashboard/src/pages/audit.tsx
index ba68fe7..863d3aa 100644
--- a/dashboard/src/pages/audit.tsx
+++ b/dashboard/src/pages/audit.tsx
@@ -5,9 +5,10 @@ import { useParams, useSearchParams } from 'react-router-dom';
 import axios from 'axios';
 
 // Development configuration
-const API_BASE_URL = process.env.NODE_ENV === 'production'
-  ? '' // In production, use relative paths
-  : 'http://localhost:3070'; // In development, connect to local API
+const API_BASE_URL =
+  process.env.NODE_ENV === 'production'
+    ? '' // In production, use relative paths
+    : 'http://localhost:3070'; // In development, connect to local API
 
 interface RepoEntry {
   name: string;
@@ -51,8 +52,11 @@ const AuditPage = () => {
 
       // Auto-load diff when action is 'view' and repo status is 'dirty'
       if (action === 'view') {
-        const repoData = data.repos.find(r => r.name === repo);
-        if (repoData && (repoData.status === 'dirty' || repoData.uncommittedChanges)) {
+        const repoData = data.repos.find((r) => r.name === repo);
+        if (
+          repoData &&
+          (repoData.status === 'dirty' || repoData.uncommittedChanges)
+        ) {
           loadDiff(repo);
         }
       }
@@ -67,21 +71,26 @@ const AuditPage = () => {
 
   useEffect(() => {
     const fetchAudit = () => {
-      axios.get(`${API_BASE_URL}/audit`)
+      axios
+        .get(`${API_BASE_URL}/audit`)
         .then((res: { data: AuditReport }) => {
           // Transform data if needed to match expected interface
           const reportData = res.data;
-          
+
           // If repo objects don't have 'status' field but have 'uncommittedChanges',
           // derive status from other fields
-          if (reportData.repos && reportData.repos.length > 0 && reportData.repos[0].status === undefined) {
-            reportData.repos = reportData.repos.map(repo => ({
+          if (
+            reportData.repos &&
+            reportData.repos.length > 0 &&
+            reportData.repos[0].status === undefined
+          ) {
+            reportData.repos = reportData.repos.map((repo) => ({
               ...repo,
               status: repo.uncommittedChanges ? 'dirty' : 'clean',
               local_path: repo.path, // Normalize field names
             }));
           }
-          
+
           setData(reportData);
         })
         .catch((err: any) => {
@@ -89,12 +98,14 @@ const AuditPage = () => {
           // Fallback to static file in development
           if (process.env.NODE_ENV !== 'production') {
             fetch('/GitRepoReport.json')
-              .then(res => res.json())
-              .then(data => {
+              .then((res) => res.json())
+              .then((data) => {
                 console.log('Using fallback data source');
                 setData(data);
               })
-              .catch(err => console.error('Failed to load fallback data:', err))
+              .catch((err) =>
+                console.error('Failed to load fallback data:', err)
+              )
               .finally(() => setLoading(false));
           }
         })
@@ -110,7 +121,10 @@ const AuditPage = () => {
     try {
       const body: any = { repo: repo.name };
       if (action === 'clone') body['clone_url'] = repo.clone_url || repo.remote;
-      const response = await axios.post(`${API_BASE_URL}/audit/${action}`, body);
+      const response = await axios.post(
+        `${API_BASE_URL}/audit/${action}`,
+        body
+      );
       alert(response.data.status);
     } catch (err: any) {
       console.error(`Action failed:`, err);
@@ -121,7 +135,7 @@ const AuditPage = () => {
   const loadDiff = async (repo: string) => {
     try {
       const res = await axios.get(`${API_BASE_URL}/audit/diff/${repo}`);
-      setDiffs(prev => ({ ...prev, [repo]: res.data.diff }));
+      setDiffs((prev) => ({ ...prev, [repo]: res.data.diff }));
     } catch (err: any) {
       console.error(`Load diff failed:`, err);
       alert(`Failed to load diff for ${repo}`);
@@ -135,42 +149,56 @@ const AuditPage = () => {
   };
 
   if (loading) return <div className="p-4">Loading audit data...</div>;
-  if (!data) return <div className="p-4 text-red-500">Failed to load audit report.</div>;
+  if (!data)
+    return <div className="p-4 text-red-500">Failed to load audit report.</div>;
 
   return (
     <div className="p-4">
       <div className="flex items-center mb-6">
-        <div className={`w-4 h-4 rounded-full mr-2 ${getColor(data.health_status)}`} />
-        <h1 className="text-2xl font-bold">Repository Audit - {data.timestamp}</h1>
+        <div
+          className={`w-4 h-4 rounded-full mr-2 ${getColor(
+            data.health_status
+          )}`}
+        />
+        <h1 className="text-2xl font-bold">
+          Repository Audit - {data.timestamp}
+        </h1>
       </div>
 
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {data.repos.map((repoItem, i) => (
           <div
             key={i}
-            className={`border rounded-xl p-4 shadow ${expandedRepo === repoItem.name ? 'ring-2 ring-blue-500' : ''}`}
+            className={`border rounded-xl p-4 shadow ${
+              expandedRepo === repoItem.name ? 'ring-2 ring-blue-500' : ''
+            }`}
             id={`repo-${repoItem.name}`}
           >
             <div className="flex justify-between items-center">
               <h2 className="text-lg font-semibold">{repoItem.name}</h2>
-              <span className="text-sm text-gray-500 capitalize">{repoItem.status}</span>
+              <span className="text-sm text-gray-500 capitalize">
+                {repoItem.status}
+              </span>
             </div>
             <div className="text-xs mt-2 text-gray-500">
               {repoItem.local_path && <div>📁 {repoItem.local_path}</div>}
               {repoItem.clone_url && <div>🌐 {repoItem.clone_url}</div>}
             </div>
             <div className="mt-4 space-x-2">
-              {(repoItem.status === 'missing' || (repoItem.status === undefined && repoItem.clone_url)) && (
+              {(repoItem.status === 'missing' ||
+                (repoItem.status === undefined && repoItem.clone_url)) && (
                 <button
                   className="bg-blue-600 text-white px-3 py-1 rounded"
-                  onClick={() => triggerAction('clone', repoItem)}>
+                  onClick={() => triggerAction('clone', repoItem)}
+                >
                   Clone
                 </button>
               )}
               {repoItem.status === 'extra' && (
                 <button
                   className="bg-red-600 text-white px-3 py-1 rounded"
-                  onClick={() => triggerAction('delete', repoItem)}>
+                  onClick={() => triggerAction('delete', repoItem)}
+                >
                   Delete
                 </button>
               )}
@@ -178,17 +206,20 @@ const AuditPage = () => {
                 <>
                   <button
                     className="bg-green-600 text-white px-3 py-1 rounded"
-                    onClick={() => triggerAction('commit', repoItem)}>
+                    onClick={() => triggerAction('commit', repoItem)}
+                  >
                     Commit
                   </button>
                   <button
                     className="bg-gray-600 text-white px-3 py-1 rounded"
-                    onClick={() => triggerAction('discard', repoItem)}>
+                    onClick={() => triggerAction('discard', repoItem)}
+                  >
                     Discard
                   </button>
                   <button
                     className="bg-yellow-600 text-white px-3 py-1 rounded"
-                    onClick={() => loadDiff(repoItem.name)}>
+                    onClick={() => loadDiff(repoItem.name)}
+                  >
                     View Diff
                   </button>
                 </>
diff --git a/dashboard/src/pages/home.tsx b/dashboard/src/pages/home.tsx
index 2a4e58b..349ca79 100644
--- a/dashboard/src/pages/home.tsx
+++ b/dashboard/src/pages/home.tsx
@@ -5,16 +5,22 @@ export default function Home() {
     <div className="p-4">
       <h1 className="text-2xl font-bold mb-4">GitOps Dashboard Home</h1>
       <p className="mb-4">
-        Welcome to the GitOps Auditor Dashboard! This tool helps you monitor and maintain the health of your Git repositories.
+        Welcome to the GitOps Auditor Dashboard! This tool helps you monitor and
+        maintain the health of your Git repositories.
       </p>
       <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
-        <h2 className="text-lg font-semibold text-blue-700 mb-2">Quick Links</h2>
+        <h2 className="text-lg font-semibold text-blue-700 mb-2">
+          Quick Links
+        </h2>
         <ul className="list-disc pl-5 text-blue-600">
           <li className="mb-1">
-            <a href="/audit" className="hover:underline">Repository Audit</a> - Check status of all repositories
+            <a href="/audit" className="hover:underline">
+              Repository Audit
+            </a>{' '}
+            - Check status of all repositories
           </li>
         </ul>
       </div>
     </div>
   );
-}
\ No newline at end of file
+}
diff --git a/dashboard/src/pages/roadmap.tsx b/dashboard/src/pages/roadmap.tsx
index 94f4d6e..953d2a2 100644
--- a/dashboard/src/pages/roadmap.tsx
+++ b/dashboard/src/pages/roadmap.tsx
@@ -7,31 +7,35 @@ const roadmap: Record<string, string[]> = {
     '✅ Audit API service with systemd + Express',
     '✅ React + Vite + Tailwind dashboard',
     '✅ Nightly audit cron + history snapshot',
-    '✅ Remote-only GitHub repo inspection'
+    '✅ Remote-only GitHub repo inspection',
   ],
   'v1.1.0': [
     '🔜 Email summary of nightly audits',
     '🔜 Export audit results as CSV',
-    '🔜 Git-based diff viewer'
+    '🔜 Git-based diff viewer',
   ],
   'v2.0.0': [
     '🧪 GitHub Actions deploy hook on push',
     '🧪 OAuth2 or Authelia SSO login',
-    '🧪 Dark mode toggle & UI filters'
-  ]
+    '🧪 Dark mode toggle & UI filters',
+  ],
 };
 
 const Roadmap = () => {
   return (
     <div className="p-4 max-w-4xl mx-auto">
       <h1 className="text-2xl font-bold mb-2">Project Roadmap</h1>
-      <p className="text-sm text-gray-500 mb-6">Version: <code>{pkg.version}</code></p>
+      <p className="text-sm text-gray-500 mb-6">
+        Version: <code>{pkg.version}</code>
+      </p>
 
       {Object.entries(roadmap).map(([version, items]) => (
         <div key={version} className="mb-6">
           <h2 className="text-lg font-semibold text-blue-700">{version}</h2>
           <ul className="list-disc ml-6 text-sm text-gray-700">
-            {items.map((item, idx) => <li key={idx}>{item}</li>)}
+            {items.map((item, idx) => (
+              <li key={idx}>{item}</li>
+            ))}
           </ul>
         </div>
       ))}
diff --git a/dashboard/src/router.tsx b/dashboard/src/router.tsx
index 2266a32..2c46be4 100644
--- a/dashboard/src/router.tsx
+++ b/dashboard/src/router.tsx
@@ -19,4 +19,4 @@ const router = createBrowserRouter([
 
 export default function RouterRoot() {
   return <RouterProvider router={router} />;
-}
\ No newline at end of file
+}
diff --git a/dashboard/src/statusMeta.ts b/dashboard/src/statusMeta.ts
index 591c103..9e76a87 100644
--- a/dashboard/src/statusMeta.ts
+++ b/dashboard/src/statusMeta.ts
@@ -1,6 +1,6 @@
-export const STATUS_LABELS = ["Uncommitted", "Stale", "Missing Files"];
-export const STATUS_COLORS = {
-  "Uncommitted": "#ef4444", // red-500
-  "Stale": "#f59e0b",       // amber-500
-  "Missing Files": "#6366f1" // indigo-500
-};
+export const STATUS_LABELS = ['Uncommitted', 'Stale', 'Missing Files'];
+export const STATUS_COLORS = {
+  Uncommitted: '#ef4444', // red-500
+  Stale: '#f59e0b', // amber-500
+  'Missing Files': '#6366f1', // indigo-500
+};
diff --git a/dashboard/src/vite-env.d.ts b/dashboard/src/vite-env.d.ts
index 7d0ff9e..11f02fe 100644
--- a/dashboard/src/vite-env.d.ts
+++ b/dashboard/src/vite-env.d.ts
@@ -1 +1 @@
-/// <reference types="vite/client" />
+/// <reference types="vite/client" />
diff --git a/dashboard/tailwind.config.js b/dashboard/tailwind.config.js
index ce7bba2..d21f1cd 100644
--- a/dashboard/tailwind.config.js
+++ b/dashboard/tailwind.config.js
@@ -1,11 +1,8 @@
-/** @type {import('tailwindcss').Config} */
-export default {
-  content: [
-    "./index.html",
-    "./src/**/*.{js,ts,jsx,tsx}"
-  ],
-  theme: {
-    extend: {},
-  },
-  plugins: [],
-}
+/** @type {import('tailwindcss').Config} */
+export default {
+  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
+  theme: {
+    extend: {},
+  },
+  plugins: [],
+};
diff --git a/dashboard/tsconfig.app.json b/dashboard/tsconfig.app.json
index e2dfd23..a4cc85f 100644
--- a/dashboard/tsconfig.app.json
+++ b/dashboard/tsconfig.app.json
@@ -1,26 +1,26 @@
-{
-  "compilerOptions": {
-    "composite": true,
-    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
-    "target": "ES2020",
-    "useDefineForClassFields": true,
-    "lib": ["ES2020", "DOM", "DOM.Iterable"],
-    "module": "ESNext",
-    "skipLibCheck": true,
-
-    /* Bundler mode */
-    "moduleResolution": "bundler",
-    "allowImportingTsExtensions": true,
-    "isolatedModules": true,
-    "moduleDetection": "force",
-    "noEmit": true,
-    "jsx": "react-jsx",
-
-    /* Linting */
-    "strict": true,
-    "noUnusedLocals": true,
-    "noUnusedParameters": true,
-    "noFallthroughCasesInSwitch": true
-  },
-  "include": ["src"]
-}
+{
+  "compilerOptions": {
+    "composite": true,
+    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
+    "target": "ES2020",
+    "useDefineForClassFields": true,
+    "lib": ["ES2020", "DOM", "DOM.Iterable"],
+    "module": "ESNext",
+    "skipLibCheck": true,
+
+    /* Bundler mode */
+    "moduleResolution": "bundler",
+    "allowImportingTsExtensions": true,
+    "isolatedModules": true,
+    "moduleDetection": "force",
+    "noEmit": true,
+    "jsx": "react-jsx",
+
+    /* Linting */
+    "strict": true,
+    "noUnusedLocals": true,
+    "noUnusedParameters": true,
+    "noFallthroughCasesInSwitch": true
+  },
+  "include": ["src"]
+}
diff --git a/dashboard/tsconfig.json b/dashboard/tsconfig.json
index 38e8e3b..1ffef60 100644
--- a/dashboard/tsconfig.json
+++ b/dashboard/tsconfig.json
@@ -1,7 +1,7 @@
-{
-  "files": [],
-  "references": [
-    { "path": "./tsconfig.app.json" },
-    { "path": "./tsconfig.node.json" }
-  ]
-}
+{
+  "files": [],
+  "references": [
+    { "path": "./tsconfig.app.json" },
+    { "path": "./tsconfig.node.json" }
+  ]
+}
diff --git a/dashboard/tsconfig.node.json b/dashboard/tsconfig.node.json
index 9eb3c1f..796f93a 100644
--- a/dashboard/tsconfig.node.json
+++ b/dashboard/tsconfig.node.json
@@ -1,24 +1,24 @@
-{
-  "compilerOptions": {
-    "composite": true,
-    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
-    "target": "ES2022",
-    "lib": ["ES2020"],
-    "module": "ESNext",
-    "skipLibCheck": true,
-
-    /* Bundler mode */
-    "moduleResolution": "bundler",
-    "allowImportingTsExtensions": true,
-    "isolatedModules": true,
-    "moduleDetection": "force",
-    "noEmit": true,
-
-    /* Linting */
-    "strict": true,
-    "noUnusedLocals": true,
-    "noUnusedParameters": true,
-    "noFallthroughCasesInSwitch": true
-  },
-  "include": ["vite.config.ts"]
-}
+{
+  "compilerOptions": {
+    "composite": true,
+    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
+    "target": "ES2022",
+    "lib": ["ES2020"],
+    "module": "ESNext",
+    "skipLibCheck": true,
+
+    /* Bundler mode */
+    "moduleResolution": "bundler",
+    "allowImportingTsExtensions": true,
+    "isolatedModules": true,
+    "moduleDetection": "force",
+    "noEmit": true,
+
+    /* Linting */
+    "strict": true,
+    "noUnusedLocals": true,
+    "noUnusedParameters": true,
+    "noFallthroughCasesInSwitch": true
+  },
+  "include": ["vite.config.ts"]
+}
diff --git a/dashboard/vite.config.ts b/dashboard/vite.config.ts
index 4e4ddfc..21b702b 100644
--- a/dashboard/vite.config.ts
+++ b/dashboard/vite.config.ts
@@ -1,41 +1,41 @@
-import { defineConfig } from 'vite'
-  import react from '@vitejs/plugin-react'
+import { defineConfig } from 'vite';
+import react from '@vitejs/plugin-react';
 
-  // https://vitejs.dev/config/
-  export default defineConfig({
-    plugins: [react()],
-    server: {
-      proxy: {
-        '/audit/diff': {
-          target: 'http://localhost:3070',
-          changeOrigin: true,
-        },
-        '/audit/clone': {
-          target: 'http://localhost:3070',
-          changeOrigin: true,
-        },
-        '/audit/delete': {
-          target: 'http://localhost:3070',
-          changeOrigin: true,
-        },
-        '/audit/commit': {
-          target: 'http://localhost:3070',
-          changeOrigin: true,
-        },
-        '/audit/discard': {
-          target: 'http://localhost:3070',
-          changeOrigin: true,
-        },
-        // This should be last and only match the data endpoint
-        '^/audit$': {
-          target: 'http://localhost:3070',
-          changeOrigin: true,
-        }
-      }
+// https://vitejs.dev/config/
+export default defineConfig({
+  plugins: [react()],
+  server: {
+    proxy: {
+      '/audit/diff': {
+        target: 'http://localhost:3070',
+        changeOrigin: true,
+      },
+      '/audit/clone': {
+        target: 'http://localhost:3070',
+        changeOrigin: true,
+      },
+      '/audit/delete': {
+        target: 'http://localhost:3070',
+        changeOrigin: true,
+      },
+      '/audit/commit': {
+        target: 'http://localhost:3070',
+        changeOrigin: true,
+      },
+      '/audit/discard': {
+        target: 'http://localhost:3070',
+        changeOrigin: true,
+      },
+      // This should be last and only match the data endpoint
+      '^/audit$': {
+        target: 'http://localhost:3070',
+        changeOrigin: true,
+      },
     },
-    // This ensures proper SPA routing with browser history API
-    preview: {
-      port: 5173,
-      host: true
-    }
-  })
+  },
+  // This ensures proper SPA routing with browser history API
+  preview: {
+    port: 5173,
+    host: true,
+  },
+});
diff --git a/dev-run.sh b/dev-run.sh
index c55be38..3d3c29f 100644
--- a/dev-run.sh
+++ b/dev-run.sh
@@ -56,4 +56,4 @@ echo -e "${GREEN}✅ Development environment is running!${NC}"
 echo -e "${CYAN}API server:${NC} http://localhost:3070"
 echo -e "${CYAN}Dashboard:${NC} http://localhost:5173"
 echo -e "Press Ctrl+C to stop the servers"
-wait
\ No newline at end of file
+wait
diff --git a/docs/CODE_QUALITY.md b/docs/CODE_QUALITY.md
index dbe0992..2da3547 100644
--- a/docs/CODE_QUALITY.md
+++ b/docs/CODE_QUALITY.md
@@ -9,9 +9,10 @@ The project uses **GitHub Actions** for automated linting and code quality check
 ## What's Been Configured
 
 ### ✅ Files Already Added:
+
 - `.pre-commit-config.yaml` - Pre-commit hooks configuration
 - `.eslintrc.js` - ESLint configuration for TypeScript/JavaScript
-- `.prettierrc` - Prettier formatting configuration  
+- `.prettierrc` - Prettier formatting configuration
 - `setup-linting.sh` - Automated setup script
 
 ### 🔧 Quick Setup
@@ -24,6 +25,7 @@ chmod +x setup-linting.sh
 ```
 
 This will:
+
 1. Install pre-commit hooks
 2. Install ESLint/Prettier dependencies
 3. Create the GitHub Actions workflow
@@ -34,12 +36,13 @@ This will:
 If you prefer manual setup:
 
 1. **Install dependencies:**
+
    ```bash
    # Python dependencies
    pip install pre-commit
    pre-commit install
 
-   # Node.js dependencies  
+   # Node.js dependencies
    npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier eslint-config-prettier eslint-plugin-prettier
    ```
 
@@ -54,14 +57,15 @@ If you prefer manual setup:
 ### 🤖 GitHub Actions Workflow
 
 The workflow automatically runs on:
-- **Push** to `main` or `develop` branches  
+
+- **Push** to `main` or `develop` branches
 - **Pull requests** to `main` or `develop`
 - **Manual trigger** via GitHub UI
 
 ### 🔍 Checks Performed
 
 1. **Shell Scripts** - ShellCheck linting
-2. **Python Code** - Flake8, Black formatting  
+2. **Python Code** - Flake8, Black formatting
 3. **TypeScript/JavaScript** - ESLint, Prettier
 4. **General** - Trailing whitespace, file endings, merge conflicts
 5. **Security** - Secret detection, npm audit
@@ -73,6 +77,7 @@ Quality reports are saved to `output/CodeQualityReport.md` and `output/CodeQuali
 ## Local Development
 
 ### Run checks locally:
+
 ```bash
 # Run all pre-commit checks
 pre-commit run --all-files
@@ -84,6 +89,7 @@ shellcheck *.sh
 ```
 
 ### Auto-fix issues:
+
 ```bash
 # Auto-fix formatting
 npx prettier --write .
@@ -106,30 +112,36 @@ The GitHub Actions workflow:
 
 ## Benefits
 
-✅ **No local dependencies** - Everything runs on GitHub  
-✅ **Automatic enforcement** - Quality gates on every commit  
-✅ **PR feedback** - Immediate feedback on pull requests  
-✅ **Dashboard integration** - Reports saved to `output/` directory  
-✅ **Consistent formatting** - Automatic code formatting  
-✅ **Security scanning** - Detects secrets and vulnerabilities  
+✅ **No local dependencies** - Everything runs on GitHub
+✅ **Automatic enforcement** - Quality gates on every commit
+✅ **PR feedback** - Immediate feedback on pull requests
+✅ **Dashboard integration** - Reports saved to `output/` directory
+✅ **Consistent formatting** - Automatic code formatting
+✅ **Security scanning** - Detects secrets and vulnerabilities
 
 ## Configuration Files
 
 ### `.pre-commit-config.yaml`
+
 Defines which tools run automatically:
+
 - ShellCheck for shell scripts
 - Black/Flake8 for Python
 - ESLint/Prettier for JS/TS
 - General file checks
 
-### `.eslintrc.js`  
+### `.eslintrc.js`
+
 ESLint rules for TypeScript/JavaScript:
+
 - TypeScript-specific rules
 - Prettier integration
 - Project-specific ignores
 
 ### `.prettierrc`
+
 Code formatting standards:
+
 - 2-space indentation
 - Single quotes
 - Semicolons
@@ -138,10 +150,12 @@ Code formatting standards:
 ## Troubleshooting
 
 ### Workflow not running?
+
 - Check repository permissions for GitHub Actions
 - Ensure `GITHUB_TOKEN` has workflow permissions
 
 ### Pre-commit issues?
+
 ```bash
 # Reset pre-commit
 pre-commit clean
@@ -149,6 +163,7 @@ pre-commit install --install-hooks
 ```
 
 ### Dependency issues?
+
 ```bash
 # Reinstall Node dependencies
 rm -rf node_modules package-lock.json
@@ -158,17 +173,20 @@ npm install
 ## Advanced Configuration
 
 ### Customize rules:
+
 - Edit `.eslintrc.js` for linting rules
-- Edit `.prettierrc` for formatting preferences  
+- Edit `.prettierrc` for formatting preferences
 - Edit `.pre-commit-config.yaml` for hook configuration
 
 ### Skip checks:
+
 ```bash
 # Skip pre-commit hooks for emergency commits
 git commit --no-verify -m "Emergency fix"
 ```
 
 ### Add new tools:
+
 Add entries to `.pre-commit-config.yaml` and update the GitHub Actions workflow accordingly.
 
 ---
diff --git a/docs/GITHUB_PAT_SETUP.md b/docs/GITHUB_PAT_SETUP.md
index cd0bc65..c1b7364 100644
--- a/docs/GITHUB_PAT_SETUP.md
+++ b/docs/GITHUB_PAT_SETUP.md
@@ -23,6 +23,7 @@ This document explains how to configure Personal Access Tokens (PATs) for secure
 **Expiration:** Choose based on your security needs (90 days recommended)
 
 **Scopes needed:**
+
 ```
 ✅ repo (Full control of private repositories)
   ├── repo:status (Access commit status)
@@ -44,6 +45,7 @@ Optional (for enhanced features):
 ### **2. Configure Environment Variables**
 
 #### **For Local Development (WSL2/Linux):**
+
 ```bash
 # Add to your ~/.bashrc or ~/.zshrc
 export GITHUB_TOKEN="ghp_your_token_here"
@@ -54,6 +56,7 @@ source ~/.bashrc
 ```
 
 #### **For Windows PowerShell:**
+
 ```powershell
 # Add to your PowerShell profile
 $env:GITHUB_TOKEN = "ghp_your_token_here"
@@ -65,6 +68,7 @@ $env:GITHUB_USERNAME = "your_github_username"
 ```
 
 #### **For Production Server:**
+
 ```bash
 # Create secure environment file
 sudo nano /opt/gitops/.env
@@ -91,13 +95,14 @@ For automated workflows, add the token as a repository secret:
 Name: GITHUB_TOKEN
 Value: ghp_your_token_here
 
-Name: GITHUB_USERNAME  
+Name: GITHUB_USERNAME
 Value: your_github_username
 ```
 
 ## 🔧 **Updated Script Configurations**
 
 ### **For sync_github_repos.sh:**
+
 ```bash
 #!/bin/bash
 # Updated to use Personal Access Token
@@ -125,56 +130,63 @@ curl -H "Authorization: token $GITHUB_TOKEN" \
 ```
 
 ### **For GitOps Dashboard API:**
+
 ```javascript
 // api/server.js - Updated for PAT authentication
 const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
 const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
 
 if (!GITHUB_TOKEN) {
-    console.error('ERROR: GITHUB_TOKEN environment variable not set');
-    process.exit(1);
+  console.error('ERROR: GITHUB_TOKEN environment variable not set');
+  process.exit(1);
 }
 
 // GitHub API client with PAT
 const githubHeaders = {
-    'Authorization': `token ${GITHUB_TOKEN}`,
-    'Accept': 'application/vnd.github.v3+json',
-    'User-Agent': 'GitOps-Auditor/1.0'
+  Authorization: `token ${GITHUB_TOKEN}`,
+  Accept: 'application/vnd.github.v3+json',
+  'User-Agent': 'GitOps-Auditor/1.0',
 };
 
 // Example API call
 async function getRepositories() {
-    try {
-        const response = await fetch(`https://api.github.com/user/repos?per_page=100`, {
-            headers: githubHeaders
-        });
-        
-        if (!response.ok) {
-            throw new Error(`GitHub API error: ${response.status}`);
-        }
-        
-        return await response.json();
-    } catch (error) {
-        console.error('Failed to fetch repositories:', error);
-        throw error;
+  try {
+    const response = await fetch(
+      `https://api.github.com/user/repos?per_page=100`,
+      {
+        headers: githubHeaders,
+      }
+    );
+
+    if (!response.ok) {
+      throw new Error(`GitHub API error: ${response.status}`);
     }
+
+    return await response.json();
+  } catch (error) {
+    console.error('Failed to fetch repositories:', error);
+    throw error;
+  }
 }
 ```
 
 ## 🛡️ **Security Best Practices**
 
 ### **Token Storage:**
+
 - **Never commit tokens** to version control
 - **Use environment variables** or secure credential stores
 - **Rotate tokens regularly** (every 90 days recommended)
 - **Use separate tokens** for different environments (dev/staging/prod)
 
 ### **Permissions:**
+
 - **Grant minimal scopes** required for functionality
 - **Use fine-grained tokens** when available
 - **Monitor token usage** in GitHub settings
 
 ### **Environment Security:**
+
 ```bash
 # Secure environment files
 chmod 600 .env
@@ -188,6 +200,7 @@ chown root:root .env  # Or appropriate user
 ## 🔍 **Testing Token Authentication**
 
 ### **Test API Access:**
+
 ```bash
 # Test your token
 curl -H "Authorization: token $GITHUB_TOKEN" \
@@ -198,6 +211,7 @@ curl -H "Authorization: token $GITHUB_TOKEN" \
 ```
 
 ### **Test Repository Access:**
+
 ```bash
 # Test repository listing
 curl -H "Authorization: token $GITHUB_TOKEN" \
@@ -209,16 +223,19 @@ curl -H "Authorization: token $GITHUB_TOKEN" \
 ### **Common Issues:**
 
 **"Bad credentials" error:**
+
 - Check token is correctly set: `echo ${GITHUB_TOKEN:0:10}...`
 - Verify token hasn't expired in GitHub settings
 - Ensure token has required scopes
 
 **"Not Found" error:**
+
 - Check repository permissions
 - Verify organization access if needed
 - Confirm token has `repo` scope
 
 **Rate limiting:**
+
 - Authenticated requests get 5,000/hour vs 60/hour unauthenticated
 - Monitor rate limits: `curl -I -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user`
 
diff --git a/docs/WINDOWS_SETUP.md b/docs/WINDOWS_SETUP.md
index d0f29e9..c6b6219 100644
--- a/docs/WINDOWS_SETUP.md
+++ b/docs/WINDOWS_SETUP.md
@@ -5,12 +5,14 @@ This guide provides Windows 11 PowerShell commands for setting up code quality a
 ## 🚀 Quick Setup Options
 
 ### Option 1: PowerShell Script (Recommended)
+
 ```powershell
 # Run the automated PowerShell setup script
 .\setup-linting.ps1
 ```
 
 ### Option 2: Use WSL2 (If you prefer Linux commands)
+
 ```powershell
 # Use WSL2 to run the bash script
 .\setup-linting.ps1 -UseWSL
@@ -26,6 +28,7 @@ wsl bash ./setup-linting.sh
 ### 1. Install Prerequisites
 
 **Python & pip:**
+
 ```powershell
 # Check if Python is installed
 python --version
@@ -36,6 +39,7 @@ pip --version
 ```
 
 **Node.js & npm:**
+
 ```powershell
 # Check if Node.js is installed
 node --version
@@ -45,6 +49,7 @@ npm --version
 ```
 
 ### 2. Install Python Dependencies
+
 ```powershell
 # Install pre-commit
 pip install pre-commit
@@ -54,6 +59,7 @@ pre-commit install
 ```
 
 ### 3. Install Node.js Dependencies
+
 ```powershell
 # Create package.json if it doesn't exist
 if (-not (Test-Path "package.json")) {
@@ -65,6 +71,7 @@ npm install --save-dev eslint "@typescript-eslint/parser" "@typescript-eslint/es
 ```
 
 ### 4. Create GitHub Actions Workflow
+
 ```powershell
 # Create directories
 New-Item -ItemType Directory -Path ".github" -Force
@@ -77,6 +84,7 @@ New-Item -ItemType Directory -Path ".github\workflows" -Force
 ## 🧪 Testing Your Setup
 
 ### Run quality checks locally:
+
 ```powershell
 # Run all pre-commit checks
 pre-commit run --all-files
@@ -90,6 +98,7 @@ npx tsc --noEmit
 ```
 
 ### Auto-fix formatting issues:
+
 ```powershell
 # Fix code formatting
 npx prettier --write .
@@ -118,11 +127,12 @@ wsl
 ## 🛠️ PowerShell Specific Commands
 
 ### Check what's installed:
+
 ```powershell
 # Check Python tools
 Get-Command python, pip, pre-commit -ErrorAction SilentlyContinue
 
-# Check Node.js tools  
+# Check Node.js tools
 Get-Command node, npm, npx -ErrorAction SilentlyContinue
 
 # List installed packages
@@ -131,6 +141,7 @@ npm list --depth=0
 ```
 
 ### Troubleshooting:
+
 ```powershell
 # Fix execution policy if needed
 Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
@@ -169,11 +180,11 @@ homelab-gitops-auditor/
 
 The quality checks will:
 
-✅ **Run automatically** on every commit to GitHub  
-✅ **Save reports** to `output\CodeQualityReport.md`  
-✅ **Integrate** with your existing GitOps dashboard  
-✅ **Comment on PRs** with quality feedback  
-✅ **Enforce standards** by failing builds on critical issues  
+✅ **Run automatically** on every commit to GitHub
+✅ **Save reports** to `output\CodeQualityReport.md`
+✅ **Integrate** with your existing GitOps dashboard
+✅ **Comment on PRs** with quality feedback
+✅ **Enforce standards** by failing builds on critical issues
 
 ## 💡 Pro Tips for Windows Users
 
@@ -188,11 +199,11 @@ Add these to your VS Code settings for better integration:
 
 ```json
 {
-    "eslint.enable": true,
-    "editor.formatOnSave": true,
-    "editor.defaultFormatter": "esbenp.prettier-vscode",
-    "python.formatting.provider": "black",
-    "terminal.integrated.defaultProfile.windows": "PowerShell"
+  "eslint.enable": true,
+  "editor.formatOnSave": true,
+  "editor.defaultFormatter": "esbenp.prettier-vscode",
+  "python.formatting.provider": "black",
+  "terminal.integrated.defaultProfile.windows": "PowerShell"
 }
 ```
 
diff --git a/docs/spa-routing.md b/docs/spa-routing.md
index b5bb1a0..ead3da1 100644
--- a/docs/spa-routing.md
+++ b/docs/spa-routing.md
@@ -92,17 +92,17 @@ If you're using Apache:
 ```apache
 <VirtualHost *:8080>
     DocumentRoot /var/www/gitops-dashboard
-    
+
     # API Proxy
     ProxyPass "/audit" "http://localhost:3070/audit"
     ProxyPassReverse "/audit" "http://localhost:3070/audit"
-    
+
     # SPA Routing
     <Directory "/var/www/gitops-dashboard">
         Options Indexes FollowSymLinks
         AllowOverride All
         Require all granted
-        
+
         RewriteEngine On
         RewriteBase /
         RewriteRule ^index\.html$ - [L]
@@ -131,6 +131,7 @@ Create a `.htaccess` file in your dashboard root:
 The configuration carefully distinguishes between:
 
 1. **API endpoints** - Should be forwarded to the API server (port 3070)
+
    - `/audit` (data fetch endpoint)
    - `/audit/diff/repo-name` (diff API)
    - `/audit/clone`, `/audit/delete`, etc. (action APIs)
@@ -156,4 +157,4 @@ If you encounter issues:
 1. **404 errors on direct URL access**: Your SPA routing is not working
 2. **API calls failing**: Check the proxy configuration for API endpoints
 3. **Empty page**: Ensure your dashboard build is correctly deployed
-4. **React errors in console**: Check for client-side routing issues
\ No newline at end of file
+4. **React errors in console**: Check for client-side routing issues
diff --git a/docs/v1.0.4-routing-fixes.md b/docs/v1.0.4-routing-fixes.md
index b17c81e..80e81ae 100644
--- a/docs/v1.0.4-routing-fixes.md
+++ b/docs/v1.0.4-routing-fixes.md
@@ -8,7 +8,8 @@ This document explains the changes made in v1.0.4 to fix routing issues with rep
 
 **Problem**: Direct navigation to URLs like `/audit/repository-name?action=view` resulted in 404 errors because the application used a simple router that didn't handle nested routes for specific repositories.
 
-**Solution**: 
+**Solution**:
+
 - Added a route parameter in the React Router configuration to handle `/audit/:repo` paths
 - Configured React Router to render the AuditPage component for these routes
 - Updated the AuditPage component to extract and use the repository parameter from the URL
@@ -18,6 +19,7 @@ This document explains the changes made in v1.0.4 to fix routing issues with rep
 **Problem**: Repository links were hardcoded to `http://gitopsdashboard.local/audit/...`, making them fail when deployed to a different domain or accessed in development.
 
 **Solution**:
+
 - Modified the `sync_github_repos.sh` script to use relative URLs (`/audit/repo-name?action=view`)
 - This ensures URLs work correctly regardless of the host domain
 
@@ -26,6 +28,7 @@ This document explains the changes made in v1.0.4 to fix routing issues with rep
 **Problem**: Browser navigation to deep links failed without proper SPA routing configuration.
 
 **Solution**:
+
 - Configured HTML5 History API support for proper SPA routing
 - Added fallback routes in Nginx configuration to support direct URL access
 - Added `.htaccess` config for Apache deployments
@@ -35,6 +38,7 @@ This document explains the changes made in v1.0.4 to fix routing issues with rep
 **Problem**: The dashboard could not connect to the API in production due to CORS restrictions.
 
 **Solution**:
+
 - Fixed the API proxy configuration to handle multiple endpoint patterns
 - Ensured the API endpoints are properly proxied through the same origin in production
 
@@ -65,22 +69,25 @@ const AuditPage = () => {
   const { repo } = useParams<{ repo: string }>();
   const [searchParams] = useSearchParams();
   const action = searchParams.get('action');
-  
+
   const [expandedRepo, setExpandedRepo] = useState<string | null>(repo || null);
 
   // Auto-highlight and scroll to selected repository
   useEffect(() => {
     if (repo && data) {
       setExpandedRepo(repo);
-      
+
       // Auto-load diff when action is 'view'
       if (action === 'view') {
-        const repoData = data.repos.find(r => r.name === repo);
-        if (repoData && (repoData.status === 'dirty' || repoData.uncommittedChanges)) {
+        const repoData = data.repos.find((r) => r.name === repo);
+        if (
+          repoData &&
+          (repoData.status === 'dirty' || repoData.uncommittedChanges)
+        ) {
           loadDiff(repo);
         }
       }
-      
+
       // Scroll to repository card
       const repoElement = document.getElementById(`repo-${repo}`);
       if (repoElement) {
@@ -90,7 +97,7 @@ const AuditPage = () => {
   }, [repo, action, data]);
 
   // Rest of component...
-}
+};
 ```
 
 ### Relative URL Configuration
@@ -139,9 +146,11 @@ server {
 To test these changes:
 
 1. In development:
+
    ```
    npm run dev
    ```
+
    Access: http://localhost:5173/audit/repository-name?action=view
 
 2. In production:
@@ -150,12 +159,14 @@ To test these changes:
 ## Deployment Instructions
 
 1. Build the dashboard:
+
    ```bash
    cd dashboard
    npm run build
    ```
 
 2. Deploy to your production server:
+
    ```bash
    bash fix-repo-routes.sh
    ```
@@ -168,6 +179,7 @@ To test these changes:
 ## Future Enhancements
 
 For future versions, consider:
+
 - Adding a repository search feature directly in the URL
 - Implementing browser history for repository diffs
-- Adding query parameter support for filtering repositories
\ No newline at end of file
+- Adding query parameter support for filtering repositories
diff --git a/fix-repo-routes.sh b/fix-repo-routes.sh
index 106e73d..6d5c3be 100644
--- a/fix-repo-routes.sh
+++ b/fix-repo-routes.sh
@@ -26,7 +26,7 @@ EOF
 
 echo -e "\033[0;36mCopying dashboard files to deployment location...\033[0m"
 # Update this path to match your actual deployment path
-DEPLOY_PATH="/var/www/gitops-dashboard" 
+DEPLOY_PATH="/var/www/gitops-dashboard"
 
 # Check if running as root or if we have sudo access
 if [ "$(id -u)" = "0" ]; then
@@ -93,4 +93,4 @@ echo -e "  systemctl restart gitops-audit-api.service"
 
 echo -e "\033[0;33mTesting information:\033[0m"
 echo -e "- Development URL: http://localhost:5173/audit/YOUR-REPO?action=view"
-echo -e "- Production URL: http://gitopsdashboard.local/audit/YOUR-REPO?action=view"
\ No newline at end of file
+echo -e "- Production URL: http://gitopsdashboard.local/audit/YOUR-REPO?action=view"
diff --git a/fix-spa-routing.sh b/fix-spa-routing.sh
index 11665c4..545e24b 100644
--- a/fix-spa-routing.sh
+++ b/fix-spa-routing.sh
@@ -18,10 +18,10 @@ echo -e "\033[0;32mInstalling Nginx configuration...\033[0m"
 cat > $NGINX_CONF_DIR/gitops-dashboard.conf << 'EOF'
 server {
     listen 8080;
-    
+
     root /var/www/gitops-dashboard;
     index index.html;
-    
+
     # API endpoints - Forward to API server
     location ~ ^/audit$ {
         proxy_pass http://localhost:3070;
@@ -29,42 +29,42 @@ server {
         proxy_set_header X-Real-IP $remote_addr;
         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     }
-    
+
     location ~ ^/audit/diff/ {
         proxy_pass http://localhost:3070;
         proxy_set_header Host $host;
         proxy_set_header X-Real-IP $remote_addr;
         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     }
-    
+
     location ~ ^/audit/clone {
         proxy_pass http://localhost:3070;
         proxy_set_header Host $host;
         proxy_set_header X-Real-IP $remote_addr;
         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     }
-    
+
     location ~ ^/audit/delete {
         proxy_pass http://localhost:3070;
         proxy_set_header Host $host;
         proxy_set_header X-Real-IP $remote_addr;
         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     }
-    
+
     location ~ ^/audit/commit {
         proxy_pass http://localhost:3070;
         proxy_set_header Host $host;
         proxy_set_header X-Real-IP $remote_addr;
         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     }
-    
+
     location ~ ^/audit/discard {
         proxy_pass http://localhost:3070;
         proxy_set_header Host $host;
         proxy_set_header X-Real-IP $remote_addr;
         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     }
-    
+
     # SPA routing - handle all client-side routes
     location / {
         try_files $uri $uri/ /index.html;
@@ -90,13 +90,13 @@ if [ ! -f "$DASHBOARD_ROOT/index.html" ]; then
 </head>
 <body>
   <h1>GitOps Dashboard SPA Routing Test</h1>
-  
+
   <div class="card success">
     <h2>✓ SPA Routing Configured</h2>
     <p>This page is being served for all routes, including <code>/audit/repository-name</code>.</p>
     <p>Current path: <code id="current-path"></code></p>
   </div>
-  
+
   <div class="card info">
     <h2>ℹ️ Next Steps</h2>
     <p>Now you can:</p>
@@ -135,4 +135,4 @@ fi
 
 echo -e "\033[0;32mSPA routing fix completed!\033[0m"
 echo -e "You can test by navigating to: http://your-domain/audit/repository-name"
-echo -e "Don't forget to restart your API service: systemctl restart gitops-audit-api.service"
\ No newline at end of file
+echo -e "Don't forget to restart your API service: systemctl restart gitops-audit-api.service"
diff --git a/modules/GitHubActionsTools/README.md b/modules/GitHubActionsTools/README.md
index f715226..a4b3d4e 100644
--- a/modules/GitHubActionsTools/README.md
+++ b/modules/GitHubActionsTools/README.md
@@ -1,26 +1,28 @@
-# GitHubActionsTools PowerShell Module
-
-This module provides GitOps-friendly PowerShell tooling for managing GitHub Actions workflows.
-
-## 📦 Module: `Remove-GitHubWorkflowRuns`
-
-Deletes workflow runs from one or more GitHub repositories, with support for filtering by:
-- Conclusion status
-- Age (in days)
-- Dry-run preview mode
-- Skipping archived repositories
-
----
-
-## 🧰 Requirements
-
-- PowerShell 5.1 or later
-- GitHub CLI (`gh`) installed and authenticated  
-  👉 Run `gh auth login` if not already set up
-
----
-
-## 🔧 Installation (Local)
-
-```powershell
-Import-Module "$PSScriptRoot\GitHubActionsTools.psd1"
+# GitHubActionsTools PowerShell Module
+
+This module provides GitOps-friendly PowerShell tooling for managing GitHub Actions workflows.
+
+## 📦 Module: `Remove-GitHubWorkflowRuns`
+
+Deletes workflow runs from one or more GitHub repositories, with support for filtering by:
+
+- Conclusion status
+- Age (in days)
+- Dry-run preview mode
+- Skipping archived repositories
+
+---
+
+## 🧰 Requirements
+
+- PowerShell 5.1 or later
+- GitHub CLI (`gh`) installed and authenticated
+  👉 Run `gh auth login` if not already set up
+
+---
+
+## 🔧 Installation (Local)
+
+```powershell
+Import-Module "$PSScriptRoot\GitHubActionsTools.psd1"
+```
diff --git a/nginx/gitops-dashboard.conf b/nginx/gitops-dashboard.conf
index 85949ce..553203a 100644
--- a/nginx/gitops-dashboard.conf
+++ b/nginx/gitops-dashboard.conf
@@ -1,9 +1,9 @@
 server {
     listen 8080;
-    
+
     root /var/www/gitops-dashboard;
     index index.html;
-    
+
     # API endpoints - Forward to API server
     location ~ ^/audit$ {
         proxy_pass http://localhost:3070;
@@ -11,44 +11,44 @@ server {
         proxy_set_header X-Real-IP $remote_addr;
         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     }
-    
+
     location ~ ^/audit/diff/ {
         proxy_pass http://localhost:3070;
         proxy_set_header Host $host;
         proxy_set_header X-Real-IP $remote_addr;
         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     }
-    
+
     location ~ ^/audit/clone {
         proxy_pass http://localhost:3070;
         proxy_set_header Host $host;
         proxy_set_header X-Real-IP $remote_addr;
         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     }
-    
+
     location ~ ^/audit/delete {
         proxy_pass http://localhost:3070;
         proxy_set_header Host $host;
         proxy_set_header X-Real-IP $remote_addr;
         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     }
-    
+
     location ~ ^/audit/commit {
         proxy_pass http://localhost:3070;
         proxy_set_header Host $host;
         proxy_set_header X-Real-IP $remote_addr;
         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     }
-    
+
     location ~ ^/audit/discard {
         proxy_pass http://localhost:3070;
         proxy_set_header Host $host;
         proxy_set_header X-Real-IP $remote_addr;
         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     }
-    
+
     # SPA routing - handle all client-side routes
     location / {
         try_files $uri $uri/ /index.html;
     }
-}
\ No newline at end of file
+}
diff --git a/npm-config.txt b/npm-config.txt
index a5c8ac7..7456b79 100644
--- a/npm-config.txt
+++ b/npm-config.txt
@@ -52,4 +52,4 @@ location ~ ^/audit/discard {
 # SPA routing
 location / {
     try_files $uri $uri/ /index.html;
-}
\ No newline at end of file
+}
diff --git a/quick-fix-deploy.sh b/quick-fix-deploy.sh
index 0b2ed73..169a86c 100644
--- a/quick-fix-deploy.sh
+++ b/quick-fix-deploy.sh
@@ -81,7 +81,7 @@ cat > audit.patch << 'EOF'
 +  const { repo } = useParams();
 +  const [searchParams] = useSearchParams();
 +  const action = searchParams.get('action');
-+  
++
    const [data, setData] = useState<AuditReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [diffs, setDiffs] = useState<Record<string, string>>({});
@@ -91,7 +91,7 @@ cat > audit.patch << 'EOF'
 +  useEffect(() => {
 +    if (repo && data) {
 +      setExpandedRepo(repo);
-+      
++
 +      // Auto-load diff when action is 'view' and repo status is 'dirty'
 +      if (action === 'view') {
 +        const repoData = data.repos.find(r => r.name === repo);
@@ -154,10 +154,10 @@ cd /opt/gitops
 if [ -f scripts/sync_github_repos.sh ]; then
   # First backup the original script
   cp scripts/sync_github_repos.sh scripts/sync_github_repos.sh.bak
-  
+
   # Update the script with relative URLs
   sed -i 's|"http://gitopsdashboard.local/audit/$repo?action=view"|"/audit/$repo?action=view"|g' scripts/sync_github_repos.sh
-  
+
   # Run the script to generate data with new URLs
   bash scripts/sync_github_repos.sh
 fi
@@ -176,4 +176,4 @@ fi
 rm -rf $TMP_DIR
 
 echo -e "\033[0;32mFix deployed! You should now restart your API service:\033[0m"
-echo -e "  systemctl restart gitops-audit-api.service"
\ No newline at end of file
+echo -e "  systemctl restart gitops-audit-api.service"
diff --git a/scripts/build.func b/scripts/build.func
index 9ff77b8..f6a3956 100644
--- a/scripts/build.func
+++ b/scripts/build.func
@@ -1202,7 +1202,7 @@ description() {
       <img src='https://img.shields.io/badge/&#x2615;-Buy us a coffee-blue' alt='spend Coffee' />
     </a>
   </p>
-  
+
   <span style='margin: 0 10px;'>
     <i class="fa fa-github fa-fw" style="color: #f5f5f5;"></i>
     <a href='https://github.com/community-scripts/ProxmoxVE' target='_blank' rel='noopener noreferrer' style='text-decoration: none; color: #00617f;'>GitHub</a>
@@ -1251,7 +1251,7 @@ exit_script() {
   #200 exit codes indicate error in create_lxc.sh
   #100 exit codes indicate error in install.func
 
-  if [ $exit_code -ne 0 ]; then  
+  if [ $exit_code -ne 0 ]; then
     case $exit_code in
       100) post_update_to_api "failed" "100: Unexpected error in create_lxc.sh" ;;
       101) post_update_to_api "failed" "101: No network connection detected in create_lxc.sh" ;;
diff --git a/scripts/debug-api.sh b/scripts/debug-api.sh
index 12da7c6..1ba0bc3 100644
--- a/scripts/debug-api.sh
+++ b/scripts/debug-api.sh
@@ -36,13 +36,13 @@ API_DIR="$ROOT_DIR/api"
 
 if [ -d "$API_DIR" ]; then
   echo -e "${GREEN}✓ API directory exists at $API_DIR${NC}"
-  
+
   if [ -f "$API_DIR/server.js" ]; then
     echo -e "${GREEN}✓ server.js exists${NC}"
   else
     echo -e "${RED}✗ server.js is missing!${NC}"
   fi
-  
+
   if [ -d "$API_DIR/node_modules" ]; then
     echo -e "${GREEN}✓ node_modules exists${NC}"
   else
@@ -58,17 +58,17 @@ HISTORY_DIR="$ROOT_DIR/audit-history"
 
 if [ -d "$HISTORY_DIR" ]; then
   echo -e "${GREEN}✓ Audit history directory exists at $HISTORY_DIR${NC}"
-  
+
   count=$(ls -1 "$HISTORY_DIR"/*.json 2>/dev/null | wc -l)
   if [ "$count" -gt 0 ]; then
     echo -e "${GREEN}✓ Found $count JSON files in audit history${NC}"
   else
     echo -e "${RED}✗ No JSON files found in audit history${NC}"
   fi
-  
+
   if [ -f "$HISTORY_DIR/latest.json" ]; then
     echo -e "${GREEN}✓ latest.json exists${NC}"
-    
+
     # Check JSON validity
     if jq . "$HISTORY_DIR/latest.json" > /dev/null 2>&1; then
       echo -e "${GREEN}✓ latest.json is valid JSON${NC}"
@@ -85,7 +85,7 @@ fi
 # Check API is running (in production)
 if [ "$ENV" = "production" ]; then
   echo -e "\n${YELLOW}Checking API service:${NC}"
-  
+
   if systemctl is-active --quiet gitops-audit-api; then
     echo -e "${GREEN}✓ API service is running${NC}"
   else
@@ -93,7 +93,7 @@ if [ "$ENV" = "production" ]; then
     echo -e "${CYAN}Recent logs:${NC}"
     journalctl -u gitops-audit-api -n 10
   fi
-  
+
   echo -e "\n${YELLOW}Testing API endpoint:${NC}"
   if curl -s http://localhost:3070/audit > /dev/null; then
     echo -e "${GREEN}✓ API endpoint is responding${NC}"
@@ -114,4 +114,4 @@ else
   fi
 fi
 
-echo -e "\n${YELLOW}Debug complete!${NC}"
\ No newline at end of file
+echo -e "\n${YELLOW}Debug complete!${NC}"
diff --git a/scripts/generate_adguard_rewrites_from_sqlite.py b/scripts/generate_adguard_rewrites_from_sqlite.py
index 6c2c000..8a61a4c 100755
--- a/scripts/generate_adguard_rewrites_from_sqlite.py
+++ b/scripts/generate_adguard_rewrites_from_sqlite.py
@@ -1,11 +1,12 @@
-import sqlite3
-import os
 import argparse
-import requests
 import base64
 import json
+import os
+import sqlite3
 from datetime import datetime
 
+import requests
+
 # --- Configuration ---
 ADGUARD_HOST = "192.168.1.253"
 ADGUARD_PORT = "80"
@@ -18,13 +19,15 @@ LOG_FILE = "/opt/gitops/logs/adguard_rewrite.log"
 
 API_BASE = f"http://{ADGUARD_HOST}:{ADGUARD_PORT}/control"
 HEADERS = {
-    "Authorization": "Basic " + base64.b64encode(f"{ADGUARD_USER}:{ADGUARD_PASS}".encode()).decode(),
-    "Content-Type": "application/json"
+    "Authorization": "Basic "
+    + base64.b64encode(f"{ADGUARD_USER}:{ADGUARD_PASS}".encode()).decode(),
+    "Content-Type": "application/json",
 }
 
 # Ensure log directory exists
 os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
 
+
 def log(msg):
     timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
     full_msg = f"[{timestamp}] {msg}"
@@ -32,6 +35,7 @@ def log(msg):
     with open(LOG_FILE, "a") as log_file:
         log_file.write(full_msg + "\n")
 
+
 def get_latest_sqlite_file():
     snapshots = sorted(os.listdir(SNAPSHOT_DIR))
     if not snapshots:
@@ -42,15 +46,21 @@ def get_latest_sqlite_file():
         raise RuntimeError("database.sqlite not found in latest snapshot")
     return db_path
 
+
 def get_current_rewrites():
     try:
         response = requests.get(f"{API_BASE}/rewrite/list", headers=HEADERS, timeout=5)
         response.raise_for_status()
-        return {(entry["domain"].lower(), entry["answer"]) for entry in response.json() if entry["domain"].lower().endswith(".internal.lakehouse.wtf")}
+        return {
+            (entry["domain"].lower(), entry["answer"])
+            for entry in response.json()
+            if entry["domain"].lower().endswith(".internal.lakehouse.wtf")
+        }
     except Exception as e:
         log(f"❌ Failed to fetch current rewrites: {e}")
         return set()
 
+
 def get_internal_domains_from_sqlite(db_path):
     conn = sqlite3.connect(db_path)
     cursor = conn.cursor()
@@ -62,7 +72,9 @@ def get_internal_domains_from_sqlite(db_path):
     for row in rows:
         try:
             raw = row[0]
-            for domain in raw.replace('[', '').replace(']', '').replace('"', '').split(','):
+            for domain in (
+                raw.replace("[", "").replace("]", "").replace('"', "").split(",")
+            ):
                 domain = domain.strip().lower()
                 if domain.endswith(".internal.lakehouse.wtf"):
                     domains.add((domain, INTERNAL_TARGET_IP))
@@ -70,15 +82,17 @@ def get_internal_domains_from_sqlite(db_path):
             continue
     return domains
 
+
 def write_dry_run_log(to_add, to_remove):
     log_data = {
         "to_add": list(to_add),
         "to_remove": list(to_remove),
-        "timestamp": datetime.utcnow().isoformat()
+        "timestamp": datetime.utcnow().isoformat(),
     }
     with open(DRY_RUN_LOG, "w") as f:
         json.dump(log_data, f, indent=2)
 
+
 def read_dry_run_log():
     if not os.path.exists(DRY_RUN_LOG):
         return None
@@ -88,6 +102,7 @@ def read_dry_run_log():
         to_remove = set(tuple(x) for x in data.get("to_remove", []))
         return to_add, to_remove
 
+
 def sync_rewrites(target_rewrites, current_rewrites, commit=False):
     if not commit:
         to_add = target_rewrites - current_rewrites
@@ -125,9 +140,14 @@ def sync_rewrites(target_rewrites, current_rewrites, commit=False):
 
         log(f"✅ Sync complete: {len(to_add)} added, {len(to_remove)} removed.")
 
+
 def main():
-    parser = argparse.ArgumentParser(description="Generate AdGuard DNS rewrites from NPM database.")
-    parser.add_argument("--commit", action="store_true", help="Apply changes to AdGuard")
+    parser = argparse.ArgumentParser(
+        description="Generate AdGuard DNS rewrites from NPM database."
+    )
+    parser.add_argument(
+        "--commit", action="store_true", help="Apply changes to AdGuard"
+    )
     args = parser.parse_args()
 
     commit_mode = args.commit
@@ -137,5 +157,6 @@ def main():
     current_rewrites = get_current_rewrites()
     sync_rewrites(desired_rewrites, current_rewrites, commit=commit_mode)
 
+
 if __name__ == "__main__":
     main()
diff --git a/scripts/output/GitRepoReport.md b/scripts/output/GitRepoReport.md
index 0769731..4e8597a 100644
Binary files a/scripts/output/GitRepoReport.md and b/scripts/output/GitRepoReport.md differ
diff --git a/scripts/pre-commit-mcp.sh b/scripts/pre-commit-mcp.sh
index 897bc79..6e5a8a0 100755
--- a/scripts/pre-commit-mcp.sh
+++ b/scripts/pre-commit-mcp.sh
@@ -41,7 +41,7 @@ log_error() {
 # Function to check MCP linter availability
 check_mcp_linter() {
     log_info "Checking code-linter MCP server availability..."
-    
+
     # TODO: Integrate with Serena to check code-linter MCP server availability
     # This will be implemented when Serena orchestration is fully configured
     # Example:
@@ -52,7 +52,7 @@ check_mcp_linter() {
     #     MCP_LINTER_AVAILABLE=false
     #     log_warning "Code-linter MCP server not available, using fallback linting"
     # fi
-    
+
     # For now, use fallback validation
     MCP_LINTER_AVAILABLE=false
     log_warning "Code-linter MCP integration not yet implemented, using fallback validation"
@@ -62,9 +62,9 @@ check_mcp_linter() {
 validate_with_mcp() {
     local file_path="$1"
     local file_type="$2"
-    
+
     log_info "Validating $file_path with code-linter MCP..."
-    
+
     if [[ "$MCP_LINTER_AVAILABLE" == "true" ]]; then
         # TODO: Use Serena to orchestrate code-linter MCP validation
         # Example MCP operation:
@@ -76,7 +76,7 @@ validate_with_mcp() {
         #     log_error "MCP validation failed for $file_path"
         #     return 1
         # fi
-        
+
         log_warning "MCP validation not yet implemented for $file_path"
         return 0
     else
@@ -89,9 +89,9 @@ validate_with_mcp() {
 validate_with_fallback() {
     local file_path="$1"
     local file_type="$2"
-    
+
     log_info "Using fallback validation for $file_path ($file_type)"
-    
+
     case "$file_type" in
         "javascript"|"typescript")
             if command -v npx >/dev/null 2>&1; then
@@ -109,7 +109,7 @@ validate_with_fallback() {
             log_warning "ESLint not available, skipping JS/TS validation"
             return 0
             ;;
-            
+
         "shell")
             if command -v shellcheck >/dev/null 2>&1; then
                 if shellcheck "$file_path"; then
@@ -124,7 +124,7 @@ validate_with_fallback() {
                 return 0
             fi
             ;;
-            
+
         "python")
             if command -v python3 >/dev/null 2>&1; then
                 if python3 -m py_compile "$file_path" 2>/dev/null; then
@@ -139,7 +139,7 @@ validate_with_fallback() {
                 return 0
             fi
             ;;
-            
+
         "json")
             if command -v jq >/dev/null 2>&1; then
                 if jq empty "$file_path" 2>/dev/null; then
@@ -162,7 +162,7 @@ validate_with_fallback() {
                 return 0
             fi
             ;;
-            
+
         *)
             log_info "No specific validation for file type: $file_type"
             return 0
@@ -174,7 +174,7 @@ validate_with_fallback() {
 get_file_type() {
     local file_path="$1"
     local extension="${file_path##*.}"
-    
+
     case "$extension" in
         "js"|"jsx")
             echo "javascript"
@@ -203,30 +203,30 @@ get_file_type() {
 # Main validation function
 main() {
     log_info "Starting pre-commit validation with MCP integration"
-    
+
     # Check MCP linter availability
     check_mcp_linter
-    
+
     # Get list of staged files
     local staged_files
     staged_files=$(git diff --cached --name-only --diff-filter=ACM)
-    
+
     if [[ -z "$staged_files" ]]; then
         log_info "No staged files to validate"
         return 0
     fi
-    
+
     local validation_failed=false
     local files_validated=0
-    
+
     # Validate each staged file
     while IFS= read -r file; do
         if [[ -f "$file" ]]; then
             local file_type
             file_type=$(get_file_type "$file")
-            
+
             log_info "Validating: $file (type: $file_type)"
-            
+
             if validate_with_mcp "$file" "$file_type"; then
                 ((files_validated++))
             else
@@ -235,7 +235,7 @@ main() {
             fi
         fi
     done <<< "$staged_files"
-    
+
     # Summary
     echo ""
     echo "=================================================="
diff --git a/scripts/serena-orchestration.sh b/scripts/serena-orchestration.sh
index 7724722..8f0c88e 100755
--- a/scripts/serena-orchestration.sh
+++ b/scripts/serena-orchestration.sh
@@ -1,18 +1,18 @@
 #!/bin/bash
 
 # GitOps Auditor - Serena MCP Orchestration Framework
-# 
+#
 # This template demonstrates how to use Serena to coordinate multiple MCP servers
 # for comprehensive GitOps operations. This is the foundation for Phase 1 MCP integration.
-# 
+#
 # Usage: bash scripts/serena-orchestration.sh <operation> [options]
-# 
+#
 # Available operations:
 #   - validate-and-commit: Full code validation + GitHub operations
 #   - audit-and-report: Repository audit + issue creation
 #   - sync-repositories: GitHub sync + quality checks
 #   - deploy-workflow: Validation + build + deploy coordination
-# 
+#
 # Version: 1.0.0 (Phase 1 MCP Integration Framework)
 
 set -euo pipefail
@@ -69,25 +69,25 @@ log_orchestration() {
 # Function to check Serena availability
 check_serena_availability() {
     log_section "Checking Serena Orchestrator"
-    
+
     # TODO: Check if Serena is installed and configured
     # if command -v serena >/dev/null 2>&1; then
     #     log_success "Serena orchestrator found"
-    #     
+    #
     #     # Verify Serena configuration
     #     if [[ -f "$SERENA_CONFIG/config.json" ]]; then
     #         log_success "Serena configuration found"
     #     else
     #         log_warning "Serena configuration not found, using default settings"
     #     fi
-    #     
+    #
     #     return 0
     # else
     #     log_error "Serena orchestrator not found"
     #     log_info "Please install Serena MCP orchestrator"
     #     return 1
     # fi
-    
+
     # For Phase 1, simulate Serena availability check
     log_warning "Serena orchestrator integration not yet implemented"
     log_info "Using orchestration framework template for Phase 1"
@@ -97,13 +97,13 @@ check_serena_availability() {
 # Function to check MCP server availability
 check_mcp_servers() {
     log_section "Checking MCP Server Availability"
-    
+
     local available_servers=()
     local unavailable_servers=()
-    
+
     for server in "${MCP_SERVERS[@]}"; do
         log_info "Checking MCP server: $server"
-        
+
         # TODO: Use Serena to check MCP server status
         # if serena check-server "$server"; then
         #     log_success "MCP server available: $server"
@@ -112,7 +112,7 @@ check_mcp_servers() {
         #     log_warning "MCP server unavailable: $server"
         #     unavailable_servers+=("$server")
         # fi
-        
+
         # For Phase 1, simulate server checks
         case "$server" in
             "github")
@@ -133,10 +133,10 @@ check_mcp_servers() {
                 ;;
         esac
     done
-    
+
     log_info "Available MCP servers: ${#available_servers[@]}"
     log_info "Unavailable MCP servers: ${#unavailable_servers[@]}"
-    
+
     if [[ ${#available_servers[@]} -gt 0 ]]; then
         return 0
     else
@@ -147,10 +147,10 @@ check_mcp_servers() {
 # Orchestration Operation: Validate and Commit
 orchestrate_validate_and_commit() {
     local commit_message="$1"
-    
+
     log_section "Serena Orchestration: Validate and Commit"
     log_orchestration "Coordinating code-linter + GitHub MCP servers"
-    
+
     # Step 1: Code validation using code-linter MCP
     log_info "Step 1: Code validation via code-linter MCP"
     # TODO: serena code-linter validate --all --strict
@@ -160,7 +160,7 @@ orchestrate_validate_and_commit() {
         log_error "Code validation failed"
         return 1
     fi
-    
+
     # Step 2: Stage changes using filesystem operations
     log_info "Step 2: Staging changes"
     # TODO: serena filesystem stage-changes --all
@@ -170,7 +170,7 @@ orchestrate_validate_and_commit() {
         log_error "Failed to stage changes"
         return 1
     fi
-    
+
     # Step 3: Commit using GitHub MCP
     log_info "Step 3: Commit via GitHub MCP"
     # TODO: serena github commit --message="$commit_message" --verify
@@ -180,7 +180,7 @@ orchestrate_validate_and_commit() {
         log_error "Failed to create commit"
         return 1
     fi
-    
+
     # Step 4: Push using GitHub MCP
     log_info "Step 4: Push via GitHub MCP"
     # TODO: serena github push --branch="main" --verify
@@ -190,7 +190,7 @@ orchestrate_validate_and_commit() {
         log_error "Failed to push changes"
         return 1
     fi
-    
+
     log_orchestration "Validate and commit operation completed successfully"
     return 0
 }
@@ -199,7 +199,7 @@ orchestrate_validate_and_commit() {
 orchestrate_audit_and_report() {
     log_section "Serena Orchestration: Audit and Report"
     log_orchestration "Coordinating filesystem + GitHub MCP servers"
-    
+
     # Step 1: Run repository audit
     log_info "Step 1: Repository audit via filesystem MCP"
     # TODO: serena filesystem audit-repositories --path="$PROJECT_ROOT/repos"
@@ -209,23 +209,23 @@ orchestrate_audit_and_report() {
         log_error "Repository audit failed"
         return 1
     fi
-    
+
     # Step 2: Generate audit report
     log_info "Step 2: Generate audit report"
     local audit_file="$PROJECT_ROOT/output/audit-$(date +%Y%m%d_%H%M%S).json"
     # TODO: serena filesystem generate-report --format=json --output="$audit_file"
     log_success "Audit report generated: $audit_file"
-    
+
     # Step 3: Create GitHub issues for findings
     log_info "Step 3: Create GitHub issues via GitHub MCP"
     # TODO: serena github create-issues --from-audit="$audit_file" --labels="audit,automated"
     log_warning "GitHub issue creation pending MCP integration"
-    
+
     # Step 4: Update dashboard data
     log_info "Step 4: Update dashboard data"
     # TODO: serena filesystem update-dashboard --data="$audit_file"
     log_success "Dashboard data updated"
-    
+
     log_orchestration "Audit and report operation completed successfully"
     return 0
 }
@@ -234,12 +234,12 @@ orchestrate_audit_and_report() {
 orchestrate_sync_repositories() {
     log_section "Serena Orchestration: Sync Repositories"
     log_orchestration "Coordinating GitHub + code-linter + filesystem MCP servers"
-    
+
     # Step 1: Fetch latest repository list from GitHub
     log_info "Step 1: Fetch repositories via GitHub MCP"
     # TODO: serena github list-repositories --user="$(git config user.name)"
     log_warning "GitHub repository listing pending MCP integration"
-    
+
     # Step 2: Sync local repositories
     log_info "Step 2: Sync local repositories"
     # TODO: serena github sync-repositories --local-path="$PROJECT_ROOT/repos"
@@ -249,18 +249,18 @@ orchestrate_sync_repositories() {
         log_error "Repository sync failed"
         return 1
     fi
-    
+
     # Step 3: Validate synchronized repositories
     log_info "Step 3: Validate synchronized repositories via code-linter MCP"
     # TODO: serena code-linter validate-repositories --path="$PROJECT_ROOT/repos"
     log_info "Repository validation pending MCP integration"
-    
+
     # Step 4: Generate sync report
     log_info "Step 4: Generate sync report"
     local sync_report="$PROJECT_ROOT/output/sync-$(date +%Y%m%d_%H%M%S).json"
     # TODO: serena filesystem generate-sync-report --output="$sync_report"
     log_success "Sync report generated: $sync_report"
-    
+
     log_orchestration "Repository sync operation completed successfully"
     return 0
 }
@@ -268,10 +268,10 @@ orchestrate_sync_repositories() {
 # Orchestration Operation: Deploy Workflow
 orchestrate_deploy_workflow() {
     local environment="$1"
-    
+
     log_section "Serena Orchestration: Deploy Workflow"
     log_orchestration "Coordinating code-linter + GitHub + filesystem MCP servers"
-    
+
     # Step 1: Pre-deployment validation
     log_info "Step 1: Pre-deployment validation via code-linter MCP"
     # TODO: serena code-linter validate --all --strict --production
@@ -281,7 +281,7 @@ orchestrate_deploy_workflow() {
         log_error "Pre-deployment validation failed"
         return 1
     fi
-    
+
     # Step 2: Build application
     log_info "Step 2: Build application"
     # TODO: serena filesystem build-application --environment="$environment"
@@ -294,7 +294,7 @@ orchestrate_deploy_workflow() {
             return 1
         fi
     fi
-    
+
     # Step 3: Create deployment package
     log_info "Step 3: Create deployment package"
     local package_name="gitops-auditor-${environment}-$(date +%Y%m%d_%H%M%S).tar.gz"
@@ -305,13 +305,13 @@ orchestrate_deploy_workflow() {
         log_error "Failed to create deployment package"
         return 1
     fi
-    
+
     # Step 4: Tag release via GitHub MCP
     log_info "Step 4: Tag release via GitHub MCP"
     local version_tag="v$(date +%Y.%m.%d-%H%M%S)"
     # TODO: serena github create-tag --tag="$version_tag" --message="Automated deployment to $environment"
     log_warning "GitHub tag creation pending MCP integration"
-    
+
     # Step 5: Deploy to environment
     log_info "Step 5: Deploy to $environment environment"
     # TODO: serena deployment deploy --environment="$environment" --package="$package_name"
@@ -321,7 +321,7 @@ orchestrate_deploy_workflow() {
         log_error "Deployment to $environment failed"
         return 1
     fi
-    
+
     log_orchestration "Deploy workflow completed successfully"
     return 0
 }
@@ -329,23 +329,23 @@ orchestrate_deploy_workflow() {
 # Main orchestration function
 main() {
     local operation="${1:-help}"
-    
+
     echo -e "${CYAN}🎼 GitOps Auditor - Serena MCP Orchestration${NC}"
     echo -e "${CYAN}================================================${NC}"
     echo "Phase 1 MCP Integration Framework"
     echo ""
-    
+
     # Check Serena availability
     if ! check_serena_availability; then
         log_error "Serena orchestrator not available"
         exit 1
     fi
-    
+
     # Check MCP servers
     if ! check_mcp_servers; then
         log_warning "Some MCP servers are unavailable, operations may use fallback methods"
     fi
-    
+
     # Execute requested operation
     case "$operation" in
         "validate-and-commit")
diff --git a/scripts/sync_github_repos.sh b/scripts/sync_github_repos.sh
index 203bf04..b67603f 100755
--- a/scripts/sync_github_repos.sh
+++ b/scripts/sync_github_repos.sh
@@ -38,8 +38,8 @@ mapfile -t remote_repos < <(curl -s "$GITHUB_API_URL" | jq -r '.[].name' | sort)
 ### JSON STRUCTURE (GitHub presence only) ###
 {
   echo "{"
-  echo "  \"timestamp\": \"${TIMESTAMP}\"," 
-  echo "  \"health_status\": \"green\"," 
+  echo "  \"timestamp\": \"${TIMESTAMP}\","
+  echo "  \"health_status\": \"green\","
   echo "  \"summary\": {"
   echo "    \"total\": ${#remote_repos[@]},"
   echo "    \"missing\": 0,"
@@ -53,9 +53,9 @@ mapfile -t remote_repos < <(curl -s "$GITHUB_API_URL" | jq -r '.[].name' | sort)
   for repo in "${remote_repos[@]}"; do
     [[ $first -eq 0 ]] && echo ","
     echo "    {"
-    echo "      \"name\": \"$repo\"," 
-    echo "      \"status\": \"clean\"," 
-    echo "      \"clone_url\": \"https://github.com/$GITHUB_USER/$repo.git\"," 
+    echo "      \"name\": \"$repo\","
+    echo "      \"status\": \"clean\","
+    echo "      \"clone_url\": \"https://github.com/$GITHUB_USER/$repo.git\","
     echo "      \"dashboard_link\": \"/audit/$repo?action=view\""
     echo -n "    }"
     first=0
diff --git a/scripts/sync_github_repos_mcp.sh b/scripts/sync_github_repos_mcp.sh
index 13c5631..36c9894 100755
--- a/scripts/sync_github_repos_mcp.sh
+++ b/scripts/sync_github_repos_mcp.sh
@@ -1,12 +1,12 @@
 #!/bin/bash
 
 # GitOps Repository Sync Script with GitHub MCP Integration
-# 
+#
 # Enhanced version of the original sync_github_repos.sh that uses GitHub MCP server
 # operations coordinated through Serena orchestration instead of direct git commands.
-# 
+#
 # Usage: bash scripts/sync_github_repos_mcp.sh [--dev] [--dry-run] [--verbose]
-# 
+#
 # Version: 1.1.0 (Phase 1 MCP Integration)
 # Maintainer: GitOps Auditor Team
 # License: MIT
@@ -124,7 +124,7 @@ log_mcp() {
 # Function to load configuration
 load_configuration() {
     log_section "Loading Configuration"
-    
+
     # Try to load from config file
     local config_file="$PROJECT_ROOT/config/gitops-config.json"
     if [[ -f "$config_file" ]]; then
@@ -132,7 +132,7 @@ load_configuration() {
         # TODO: Parse JSON configuration when config-loader is enhanced
         log_verbose "Configuration file found but JSON parsing pending"
     fi
-    
+
     # Load from environment or use defaults
     if [[ -z "$GITHUB_USER" ]]; then
         GITHUB_USER=$(git config user.name 2>/dev/null || echo "")
@@ -142,7 +142,7 @@ load_configuration() {
             exit 1
         fi
     fi
-    
+
     log_success "Configuration loaded successfully"
     log_info "GitHub User: $GITHUB_USER"
     log_info "Local Repos: $LOCAL_REPOS_DIR"
@@ -155,20 +155,20 @@ load_configuration() {
 # Function to check MCP server availability
 check_mcp_availability() {
     log_section "Checking MCP Server Availability"
-    
+
     if [[ "$MCP_INTEGRATION" == "false" ]]; then
         log_warning "MCP integration disabled by user"
         GITHUB_MCP_AVAILABLE=false
         SERENA_AVAILABLE=false
         return
     fi
-    
+
     # Check Serena orchestrator
     # TODO: Implement actual Serena availability check
     # if command -v serena >/dev/null 2>&1; then
     #     log_success "Serena orchestrator found"
     #     SERENA_AVAILABLE=true
-    #     
+    #
     #     # Check GitHub MCP server through Serena
     #     if serena check-server github; then
     #         log_success "GitHub MCP server available via Serena"
@@ -182,7 +182,7 @@ check_mcp_availability() {
     #     SERENA_AVAILABLE=false
     #     GITHUB_MCP_AVAILABLE=false
     # fi
-    
+
     # For Phase 1, simulate MCP availability check
     SERENA_AVAILABLE=false
     GITHUB_MCP_AVAILABLE=false
@@ -193,9 +193,9 @@ check_mcp_availability() {
 # Function to initialize directories
 initialize_directories() {
     log_section "Initializing Directories"
-    
+
     local dirs=("$LOCAL_REPOS_DIR" "$OUTPUT_DIR" "$AUDIT_HISTORY_DIR")
-    
+
     for dir in "${dirs[@]}"; do
         if [[ ! -d "$dir" ]]; then
             if [[ "$DRY_RUN" == "true" ]]; then
@@ -214,7 +214,7 @@ initialize_directories() {
 # Function to fetch GitHub repositories using MCP or fallback
 fetch_github_repositories() {
     log_section "Fetching GitHub Repositories"
-    
+
     if [[ "$GITHUB_MCP_AVAILABLE" == "true" ]]; then
         fetch_github_repositories_mcp
     else
@@ -225,14 +225,14 @@ fetch_github_repositories() {
 # Function to fetch repositories using GitHub MCP server
 fetch_github_repositories_mcp() {
     log_mcp "Fetching repositories via GitHub MCP server"
-    
+
     # TODO: Use Serena to orchestrate GitHub MCP operations
     # Example MCP operation:
     # GITHUB_REPOS=$(serena github list-repositories \
     #     --user="$GITHUB_USER" \
     #     --format=json \
     #     --include-private=false)
-    # 
+    #
     # if [[ $? -eq 0 ]]; then
     #     log_success "Successfully fetched repositories via GitHub MCP"
     #     echo "$GITHUB_REPOS" > "$OUTPUT_DIR/github-repos-mcp.json"
@@ -240,7 +240,7 @@ fetch_github_repositories_mcp() {
     #     log_error "Failed to fetch repositories via GitHub MCP"
     #     return 1
     # fi
-    
+
     log_warning "GitHub MCP repository fetching not yet implemented"
     log_info "Falling back to GitHub API"
     fetch_github_repositories_fallback
@@ -249,17 +249,17 @@ fetch_github_repositories_mcp() {
 # Function to fetch repositories using GitHub API (fallback)
 fetch_github_repositories_fallback() {
     log_info "Fetching repositories via GitHub API (fallback)"
-    
+
     local github_api_url="https://api.github.com/users/$GITHUB_USER/repos?per_page=100&sort=updated"
     local github_repos_file="$OUTPUT_DIR/github-repos.json"
-    
+
     log_verbose "GitHub API URL: $github_api_url"
-    
+
     if [[ "$DRY_RUN" == "true" ]]; then
         log_info "Would fetch repositories from: $github_api_url"
         return 0
     fi
-    
+
     if command -v curl >/dev/null 2>&1; then
         log_info "Fetching repository list from GitHub API..."
         if curl -s -f "$github_api_url" > "$github_repos_file"; then
@@ -280,10 +280,10 @@ fetch_github_repositories_fallback() {
 # Function to analyze local repositories
 analyze_local_repositories() {
     log_section "Analyzing Local Repositories"
-    
+
     local local_repos=()
     local audit_results=()
-    
+
     # Find all directories in LOCAL_REPOS_DIR that contain .git
     if [[ -d "$LOCAL_REPOS_DIR" ]]; then
         while IFS= read -r -d '' repo_dir; do
@@ -291,7 +291,7 @@ analyze_local_repositories() {
             repo_name=$(basename "$repo_dir")
             local_repos+=("$repo_name")
             log_verbose "Found local repository: $repo_name"
-            
+
             # Analyze repository using MCP or fallback
             if analyze_repository_mcp "$repo_dir" "$repo_name"; then
                 log_verbose "Repository analysis completed: $repo_name"
@@ -300,7 +300,7 @@ analyze_local_repositories() {
             fi
         done < <(find "$LOCAL_REPOS_DIR" -maxdepth 1 -type d -name ".git" -exec dirname {} \; | sort | tr '\n' '\0')
     fi
-    
+
     log_info "Found ${#local_repos[@]} local repositories"
     return 0
 }
@@ -309,9 +309,9 @@ analyze_local_repositories() {
 analyze_repository_mcp() {
     local repo_dir="$1"
     local repo_name="$2"
-    
+
     log_verbose "Analyzing repository: $repo_name"
-    
+
     if [[ "$GITHUB_MCP_AVAILABLE" == "true" ]]; then
         # TODO: Use GitHub MCP for repository analysis
         # serena github analyze-repository \
@@ -331,21 +331,21 @@ analyze_repository_mcp() {
 analyze_repository_fallback() {
     local repo_dir="$1"
     local repo_name="$2"
-    
+
     if [[ ! -d "$repo_dir/.git" ]]; then
         log_warning "Not a git repository: $repo_dir"
         return 1
     fi
-    
+
     cd "$repo_dir"
-    
+
     # Check for uncommitted changes
     local has_uncommitted=false
     if ! git diff-index --quiet HEAD -- 2>/dev/null; then
         has_uncommitted=true
         log_verbose "Repository has uncommitted changes: $repo_name"
     fi
-    
+
     # Check remote URL
     local remote_url=""
     if remote_url=$(git remote get-url origin 2>/dev/null); then
@@ -353,20 +353,20 @@ analyze_repository_fallback() {
     else
         log_verbose "No remote configured for: $repo_name"
     fi
-    
+
     # Get current branch
     local current_branch=""
     if current_branch=$(git branch --show-current 2>/dev/null); then
         log_verbose "Current branch for $repo_name: $current_branch"
     fi
-    
+
     return 0
 }
 
 # Function to synchronize repositories using MCP or fallback
 synchronize_repositories() {
     log_section "Synchronizing Repositories"
-    
+
     if [[ "$GITHUB_MCP_AVAILABLE" == "true" ]]; then
         synchronize_repositories_mcp
     else
@@ -377,20 +377,20 @@ synchronize_repositories() {
 # Function to synchronize using GitHub MCP server
 synchronize_repositories_mcp() {
     log_mcp "Synchronizing repositories via GitHub MCP server"
-    
+
     # TODO: Use Serena to orchestrate GitHub MCP synchronization
     # Example MCP operations:
     # 1. Compare local vs GitHub repositories
     # 2. Clone missing repositories
     # 3. Update existing repositories
     # 4. Create issues for audit findings
-    # 
+    #
     # serena github sync-repositories \
     #     --local-path="$LOCAL_REPOS_DIR" \
     #     --user="$GITHUB_USER" \
     #     --dry-run="$DRY_RUN" \
     #     --create-issues=true
-    
+
     log_warning "GitHub MCP synchronization not yet implemented"
     log_info "Falling back to manual synchronization"
     synchronize_repositories_fallback
@@ -399,16 +399,16 @@ synchronize_repositories_mcp() {
 # Function to synchronize using fallback methods
 synchronize_repositories_fallback() {
     log_info "Synchronizing repositories using fallback methods"
-    
+
     local github_repos_file="$OUTPUT_DIR/github-repos.json"
-    
+
     if [[ ! -f "$github_repos_file" ]]; then
         log_error "GitHub repositories file not found: $github_repos_file"
         return 1
     fi
-    
+
     log_info "Processing GitHub repositories for synchronization..."
-    
+
     # Parse GitHub repositories and check against local
     if command -v jq >/dev/null 2>&1; then
         local sync_count=0
@@ -416,12 +416,12 @@ synchronize_repositories_fallback() {
             local repo_name clone_url
             repo_name=$(echo "$repo_info" | jq -r '.name')
             clone_url=$(echo "$repo_info" | jq -r '.clone_url')
-            
+
             local local_repo_path="$LOCAL_REPOS_DIR/$repo_name"
-            
+
             if [[ ! -d "$local_repo_path" ]]; then
                 log_info "Repository missing locally: $repo_name"
-                
+
                 if [[ "$DRY_RUN" == "true" ]]; then
                     log_info "Would clone: $clone_url -> $local_repo_path"
                 else
@@ -437,7 +437,7 @@ synchronize_repositories_fallback() {
                 log_verbose "Repository exists locally: $repo_name"
             fi
         done < <(jq -c '.[]' "$github_repos_file")
-        
+
         log_success "Synchronization completed. Repositories synchronized: $sync_count"
     else
         log_error "jq command not found - cannot parse GitHub repositories"
@@ -448,14 +448,14 @@ synchronize_repositories_fallback() {
 # Function to generate audit report
 generate_audit_report() {
     log_section "Generating Audit Report"
-    
+
     local timestamp
     timestamp=$(date +%Y%m%d_%H%M%S)
     local audit_file="$AUDIT_HISTORY_DIR/audit-$timestamp.json"
     local latest_file="$AUDIT_HISTORY_DIR/latest.json"
-    
+
     log_info "Generating comprehensive audit report..."
-    
+
     # Create audit report structure
     local audit_report
     audit_report=$(cat <<EOF
@@ -485,7 +485,7 @@ generate_audit_report() {
 }
 EOF
     )
-    
+
     if [[ "$DRY_RUN" == "true" ]]; then
         log_info "Would generate audit report: $audit_file"
         echo "$audit_report" | jq .
@@ -500,16 +500,16 @@ EOF
 # Function to create GitHub issues for audit findings (MCP integration)
 create_audit_issues() {
     log_section "Creating GitHub Issues for Audit Findings"
-    
+
     if [[ "$GITHUB_MCP_AVAILABLE" == "true" ]]; then
         log_mcp "Creating issues via GitHub MCP server"
-        
+
         # TODO: Use Serena to orchestrate GitHub MCP issue creation
         # serena github create-audit-issues \
         #     --from-report="$AUDIT_HISTORY_DIR/latest.json" \
         #     --labels="audit,automated,mcp-integration" \
         #     --dry-run="$DRY_RUN"
-        
+
         log_warning "GitHub MCP issue creation not yet implemented"
     else
         log_info "GitHub MCP not available - skipping automated issue creation"
@@ -524,19 +524,19 @@ main() {
     echo "Version: 1.1.0 (Phase 1 MCP Integration)"
     echo "Timestamp: $(date)"
     echo ""
-    
+
     # Load configuration
     load_configuration
-    
+
     # Check MCP availability
     check_mcp_availability
-    
+
     # Initialize directories
     initialize_directories
-    
+
     # Main workflow
     log_section "Starting Repository Synchronization Workflow"
-    
+
     # Step 1: Fetch GitHub repositories
     if fetch_github_repositories; then
         log_success "GitHub repository fetch completed"
@@ -544,7 +544,7 @@ main() {
         log_error "GitHub repository fetch failed"
         exit 1
     fi
-    
+
     # Step 2: Analyze local repositories
     if analyze_local_repositories; then
         log_success "Local repository analysis completed"
@@ -552,7 +552,7 @@ main() {
         log_error "Local repository analysis failed"
         exit 1
     fi
-    
+
     # Step 3: Synchronize repositories
     if synchronize_repositories; then
         log_success "Repository synchronization completed"
@@ -560,7 +560,7 @@ main() {
         log_error "Repository synchronization failed"
         exit 1
     fi
-    
+
     # Step 4: Generate audit report
     if generate_audit_report; then
         log_success "Audit report generation completed"
@@ -568,14 +568,14 @@ main() {
         log_error "Audit report generation failed"
         exit 1
     fi
-    
+
     # Step 5: Create GitHub issues for findings
     if create_audit_issues; then
         log_success "GitHub issue creation completed"
     else
         log_warning "GitHub issue creation skipped or failed"
     fi
-    
+
     # Final summary
     log_section "Synchronization Summary"
     log_success "GitOps repository synchronization completed successfully"
@@ -584,7 +584,7 @@ main() {
     log_info "Dry Run: $DRY_RUN"
     log_info "Output Directory: $OUTPUT_DIR"
     log_info "Audit History: $AUDIT_HISTORY_DIR"
-    
+
     echo ""
     echo -e "${GREEN}🎯 Repository sync workflow completed successfully!${NC}"
 }
diff --git a/scripts/sync_npm_to_adguard.py b/scripts/sync_npm_to_adguard.py
index cdf89db..574edc4 100755
--- a/scripts/sync_npm_to_adguard.py
+++ b/scripts/sync_npm_to_adguard.py
@@ -1,8 +1,9 @@
-import os
+import argparse
+import base64
 import json
+import os
+
 import requests
-import base64
-import argparse
 
 # === Configuration ===
 NPM_PROXY_PATH = "/opt/npm/data/nginx/proxy_host/"
diff --git a/scripts/validate-codebase-mcp.sh b/scripts/validate-codebase-mcp.sh
index de4af0e..c4512e1 100755
--- a/scripts/validate-codebase-mcp.sh
+++ b/scripts/validate-codebase-mcp.sh
@@ -2,9 +2,9 @@
 
 # GitOps Auditor - Code Quality Validation with MCP Integration
 # Validates entire codebase using code-linter MCP server via Serena orchestration
-# 
+#
 # Usage: bash scripts/validate-codebase-mcp.sh [--fix] [--strict]
-# 
+#
 # Version: 1.0.0 (Phase 1 MCP Integration)
 
 set -euo pipefail
@@ -89,18 +89,18 @@ init_logging() {
 # Function to check Serena and MCP server availability
 check_mcp_availability() {
     log_section "Checking MCP Server Availability"
-    
+
     # TODO: Integrate with Serena to check code-linter MCP server availability
     # This will be implemented when Serena orchestration is fully configured
-    # 
+    #
     # Example Serena integration:
     # if command -v serena >/dev/null 2>&1; then
     #     log_info "Serena orchestrator found"
-    #     
+    #
     #     if serena list-servers | grep -q "code-linter"; then
     #         log_success "Code-linter MCP server is available"
     #         MCP_LINTER_AVAILABLE=true
-    #         
+    #
     #         # Test MCP server connection
     #         if serena test-connection code-linter; then
     #             log_success "Code-linter MCP server connection verified"
@@ -116,7 +116,7 @@ check_mcp_availability() {
     #     log_warning "Serena orchestrator not found"
     #     MCP_LINTER_AVAILABLE=false
     # fi
-    
+
     # For Phase 1, we'll use fallback validation while setting up MCP integration
     MCP_LINTER_AVAILABLE=false
     log_warning "Serena and code-linter MCP integration not yet implemented"
@@ -127,12 +127,12 @@ check_mcp_availability() {
 validate_js_ts_mcp() {
     local files=("$@")
     local validation_passed=true
-    
+
     log_section "Validating JavaScript/TypeScript files (${#files[@]} files)"
-    
+
     for file in "${files[@]}"; do
         log_info "Validating: $file"
-        
+
         if [[ "$MCP_LINTER_AVAILABLE" == "true" ]]; then
             # TODO: Use Serena to orchestrate code-linter MCP validation
             # Example MCP operation:
@@ -146,7 +146,7 @@ validate_js_ts_mcp() {
             #     log_error "MCP validation failed: $file"
             #     validation_passed=false
             # fi
-            
+
             log_info "MCP validation placeholder for: $file"
         else
             # Fallback validation using ESLint
@@ -158,7 +158,7 @@ validate_js_ts_mcp() {
             fi
         fi
     done
-    
+
     return $([ "$validation_passed" = true ] && echo 0 || echo 1)
 }
 
@@ -166,12 +166,12 @@ validate_js_ts_mcp() {
 validate_shell_mcp() {
     local files=("$@")
     local validation_passed=true
-    
+
     log_section "Validating Shell scripts (${#files[@]} files)"
-    
+
     for file in "${files[@]}"; do
         log_info "Validating: $file"
-        
+
         if [[ "$MCP_LINTER_AVAILABLE" == "true" ]]; then
             # TODO: Use Serena to orchestrate code-linter MCP validation
             # Example MCP operation:
@@ -185,7 +185,7 @@ validate_shell_mcp() {
             #     log_error "MCP validation failed: $file"
             #     validation_passed=false
             # fi
-            
+
             log_info "MCP validation placeholder for: $file"
         else
             # Fallback validation using ShellCheck
@@ -197,7 +197,7 @@ validate_shell_mcp() {
             fi
         fi
     done
-    
+
     return $([ "$validation_passed" = true ] && echo 0 || echo 1)
 }
 
@@ -205,12 +205,12 @@ validate_shell_mcp() {
 validate_python_mcp() {
     local files=("$@")
     local validation_passed=true
-    
+
     log_section "Validating Python files (${#files[@]} files)"
-    
+
     for file in "${files[@]}"; do
         log_info "Validating: $file"
-        
+
         if [[ "$MCP_LINTER_AVAILABLE" == "true" ]]; then
             # TODO: Use Serena to orchestrate code-linter MCP validation
             # Example MCP operation:
@@ -224,7 +224,7 @@ validate_python_mcp() {
             #     log_error "MCP validation failed: $file"
             #     validation_passed=false
             # fi
-            
+
             log_info "MCP validation placeholder for: $file"
         else
             # Fallback validation using Python syntax check
@@ -236,14 +236,14 @@ validate_python_mcp() {
             fi
         fi
     done
-    
+
     return $([ "$validation_passed" = true ] && echo 0 || echo 1)
 }
 
 # Fallback validation functions
 validate_js_ts_fallback() {
     local file="$1"
-    
+
     if [[ -f "$PROJECT_ROOT/dashboard/package.json" ]]; then
         cd "$PROJECT_ROOT/dashboard"
         if command -v npx >/dev/null 2>&1; then
@@ -251,7 +251,7 @@ validate_js_ts_fallback() {
             if [[ "$FIX_MODE" == "true" ]]; then
                 eslint_args="$eslint_args --fix"
             fi
-            
+
             if npx eslint $eslint_args "$file" 2>/dev/null; then
                 return 0
             else
@@ -259,7 +259,7 @@ validate_js_ts_fallback() {
             fi
         fi
     fi
-    
+
     # If ESLint not available, basic syntax check
     if [[ "$file" == *.js || "$file" == *.jsx ]]; then
         if command -v node >/dev/null 2>&1; then
@@ -270,19 +270,19 @@ validate_js_ts_fallback() {
             fi
         fi
     fi
-    
+
     return 0  # Skip if no tools available
 }
 
 validate_shell_fallback() {
     local file="$1"
-    
+
     if command -v shellcheck >/dev/null 2>&1; then
         local shellcheck_args=""
         if [[ "$STRICT_MODE" == "false" ]]; then
             shellcheck_args="-e SC2034,SC2086"  # Ignore some common warnings
         fi
-        
+
         if shellcheck $shellcheck_args "$file"; then
             return 0
         else
@@ -300,7 +300,7 @@ validate_shell_fallback() {
 
 validate_python_fallback() {
     local file="$1"
-    
+
     if command -v python3 >/dev/null 2>&1; then
         if python3 -m py_compile "$file" 2>/dev/null; then
             return 0
@@ -308,14 +308,14 @@ validate_python_fallback() {
             return 1
         fi
     fi
-    
+
     return 0  # Skip if Python not available
 }
 
 # Function to collect files for validation
 collect_files() {
     log_section "Collecting files for validation"
-    
+
     # JavaScript/TypeScript files
     JS_TS_FILES=()
     while IFS= read -r -d '' file; do
@@ -327,7 +327,7 @@ collect_files() {
         | grep -v "build/" \
         | sort \
         | tr '\n' '\0')
-    
+
     # Shell script files
     SHELL_FILES=()
     while IFS= read -r -d '' file; do
@@ -337,7 +337,7 @@ collect_files() {
         | grep -v ".git" \
         | sort \
         | tr '\n' '\0')
-    
+
     # Python files
     PYTHON_FILES=()
     while IFS= read -r -d '' file; do
@@ -347,7 +347,7 @@ collect_files() {
         | grep -v ".git" \
         | sort \
         | tr '\n' '\0')
-    
+
     log_info "Found ${#JS_TS_FILES[@]} JavaScript/TypeScript files"
     log_info "Found ${#SHELL_FILES[@]} Shell script files"
     log_info "Found ${#PYTHON_FILES[@]} Python files"
@@ -361,43 +361,43 @@ main() {
     echo "Fix Mode: $FIX_MODE"
     echo "Strict Mode: $STRICT_MODE"
     echo ""
-    
+
     # Initialize logging
     init_logging
-    
+
     # Check MCP availability
     check_mcp_availability
-    
+
     # Collect files
     collect_files
-    
+
     local validation_failed=false
-    
+
     # Validate JavaScript/TypeScript files
     if [[ ${#JS_TS_FILES[@]} -gt 0 ]]; then
         if ! validate_js_ts_mcp "${JS_TS_FILES[@]}"; then
             validation_failed=true
         fi
     fi
-    
+
     # Validate Shell scripts
     if [[ ${#SHELL_FILES[@]} -gt 0 ]]; then
         if ! validate_shell_mcp "${SHELL_FILES[@]}"; then
             validation_failed=true
         fi
     fi
-    
+
     # Validate Python files
     if [[ ${#PYTHON_FILES[@]} -gt 0 ]]; then
         if ! validate_python_mcp "${PYTHON_FILES[@]}"; then
             validation_failed=true
         fi
     fi
-    
+
     # Summary
     echo ""
     log_section "Validation Summary"
-    
+
     if [[ "$validation_failed" == "true" ]]; then
         log_error "Code quality validation FAILED"
         log_error "Please fix the validation errors before proceeding"
diff --git a/setup-linting.ps1 b/setup-linting.ps1
index 4a14ec0..d579a8f 100644
--- a/setup-linting.ps1
+++ b/setup-linting.ps1
@@ -40,9 +40,9 @@ if (Get-Command npm -ErrorAction SilentlyContinue) {
         Write-Host "Creating package.json..." -ForegroundColor Yellow
         npm init -y | Out-Null
     }
-    
+
     npm install --save-dev eslint "@typescript-eslint/parser" "@typescript-eslint/eslint-plugin" prettier eslint-config-prettier eslint-plugin-prettier
-    
+
     Write-Host "✓ ESLint and Prettier installed" -ForegroundColor Green
 } else {
     Write-Host "Warning: npm not found. Please install Node.js first." -ForegroundColor Yellow
@@ -54,7 +54,7 @@ Write-Host "🔧 Setting up pre-commit hooks..." -ForegroundColor Yellow
 if (Get-Command pre-commit -ErrorAction SilentlyContinue) {
     pre-commit install
     Write-Host "✓ Pre-commit hooks installed" -ForegroundColor Green
-    
+
     # Test the hooks
     Write-Host "🧪 Testing pre-commit setup..." -ForegroundColor Yellow
     try {
diff --git a/setup-linting.sh b/setup-linting.sh
index a211b61..e736ec2 100644
--- a/setup-linting.sh
+++ b/setup-linting.sh
@@ -37,7 +37,7 @@ if command -v npm &> /dev/null; then
         echo "Creating package.json..."
         npm init -y > /dev/null
     fi
-    
+
     npm install --save-dev \
         eslint \
         @typescript-eslint/parser \
@@ -45,7 +45,7 @@ if command -v npm &> /dev/null; then
         prettier \
         eslint-config-prettier \
         eslint-plugin-prettier
-    
+
     echo -e "${GREEN}✓${NC} ESLint and Prettier installed"
 else
     echo -e "${YELLOW}Warning: npm not found. Please install Node.js dependencies manually.${NC}"
@@ -56,7 +56,7 @@ echo "🔧 Setting up pre-commit hooks..."
 if command -v pre-commit &> /dev/null; then
     pre-commit install
     echo -e "${GREEN}✓${NC} Pre-commit hooks installed"
-    
+
     # Test the hooks
     echo "🧪 Testing pre-commit setup..."
     if pre-commit run --all-files; then
@@ -125,7 +125,7 @@ jobs:
       - name: Run pre-commit on all files
         run: |
           pre-commit run --all-files --show-diff-on-failure > precommit-results.txt 2>&1 || true
-          echo "Pre-commit results:" 
+          echo "Pre-commit results:"
           cat precommit-results.txt
 
       - name: Create quality report
@@ -136,13 +136,13 @@ jobs:
           echo "**Commit:** ${{ github.sha }}" >> quality-report.md
           echo "**Branch:** ${{ github.ref_name }}" >> quality-report.md
           echo "" >> quality-report.md
-          
+
           echo "## Pre-commit Results" >> quality-report.md
           echo "\`\`\`" >> quality-report.md
           cat precommit-results.txt >> quality-report.md
           echo "\`\`\`" >> quality-report.md
           echo "" >> quality-report.md
-          
+
           # Check if pre-commit passed
           if pre-commit run --all-files; then
             echo "✅ **All quality checks passed!**" >> quality-report.md
@@ -151,7 +151,7 @@ jobs:
             echo "❌ **Quality issues found. Please review and fix.**" >> quality-report.md
             echo "quality_status=failed" >> $GITHUB_ENV
           fi
-          
+
           echo "" >> quality-report.md
           echo "---" >> quality-report.md
           echo "**🤖 Automated by GitHub Actions**" >> quality-report.md
@@ -160,7 +160,7 @@ jobs:
         run: |
           mkdir -p output
           cp quality-report.md output/CodeQualityReport.md
-          
+
           # Create JSON summary for dashboard integration
           cat > output/CodeQualityReport.json << EOF
           {
@@ -205,10 +205,10 @@ jobs:
         run: |
           git config user.name "GitOps Quality Bot"
           git config user.email "bot@users.noreply.github.com"
-          
+
           git add output/CodeQualityReport.md output/CodeQualityReport.json
           git diff --cached --quiet || git commit -m "📊 Update code quality report [skip ci]"
-          
+
           git push https://x-access-token:${{ secrets.GITHUB_TOKEN }}@github.com/${{ github.repository }}.git HEAD:main
 
       - name: Fail if quality checks failed
@@ -217,7 +217,7 @@ jobs:
           echo "Quality checks failed. Please fix the issues above."
           exit 1
 EOF
-    
+
     echo -e "${GREEN}✓${NC} GitHub Actions workflow created"
 fi
 
diff --git a/update-production.sh b/update-production.sh
index 25046ec..94ad20c 100644
--- a/update-production.sh
+++ b/update-production.sh
@@ -150,4 +150,4 @@ echo -e "${GREEN}    GitOps Auditor Update Complete!    ${NC}"
 echo -e "${GREEN}========================================${NC}"
 echo -e "${CYAN}Dashboard:${NC} http://$LXC_IP/"
 echo -e "${CYAN}API:${NC} http://$LXC_IP:3070/audit"
-echo -e "\nYou may need to clear your browser cache to see the updated dashboard."
\ No newline at end of file
+echo -e "\nYou may need to clear your browser cache to see the updated dashboard."
```
