#!/usr/bin/env bash
# Tests for scripts/pushover_notify.sh — the production deploy's failure alarm
# (ops #3310).
#
# These drive a REAL curl against a REAL local HTTP server, rather than stubbing
# the call out. That is deliberate: this alarm is `if: failure()`-only, so in
# production it runs solely during incidents. A test that stubs the request
# would reproduce exactly the blind spot the alarm exists to close — and
# stormcrow's ops #2480 is the measured case of an alarm that was never
# exercised until the day it was needed, and then failed open.
#
# Run: bash scripts/tests/test_pushover_notify.sh
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
SCRIPT="$HERE/../pushover_notify.sh"
TMP="$(mktemp -d)"
SRV_PID=""
cleanup() { [ -n "$SRV_PID" ] && kill "$SRV_PID" 2>/dev/null; rm -rf "$TMP"; }
trap cleanup EXIT

fail=0
ok()  { printf 'ok   - %s\n' "$1"; }
bad() { printf 'FAIL - %s\n' "$1"; fail=1; }

# --- a tiny stub Pushover -----------------------------------------------------
# Replies with whatever body/status the current mode file says, and records the
# request so we can assert what actually travelled — not merely that the call
# returned 0. A stub answering 200 to anything would otherwise pass with no
# credentials sent at all.
start_server() {
  cat > "$TMP/server.py" <<'PY'
import http.server, os, sys, json

STATE = os.environ["STUB_STATE"]

class H(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        n = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(n)
        with open(STATE + "/last_request", "wb") as fh:
            fh.write(body)
        with open(STATE + "/mode") as fh:
            mode = fh.read().strip()
        if mode == "valid":
            code, payload = 200, {"status": 1, "request": "abc"}
        elif mode == "invalid":
            code, payload = 400, {"status": 0, "errors": ["application token is invalid"]}
        else:
            code, payload = 500, {"status": 0, "errors": ["boom"]}
        # Compact separators, mirroring the real Pushover API's response shape.
        raw = json.dumps(payload, separators=(",", ":")).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def log_message(self, *a):
        pass

http.server.HTTPServer(("127.0.0.1", int(sys.argv[1])), H).serve_forever()
PY
  PORT=$(python3 -c 'import socket;s=socket.socket();s.bind(("127.0.0.1",0));print(s.getsockname()[1]);s.close()')
  echo valid > "$TMP/mode"
  STUB_STATE="$TMP" python3 "$TMP/server.py" "$PORT" &
  SRV_PID=$!
  URL="http://127.0.0.1:$PORT/x"
  for _ in $(seq 1 50); do
    curl -s --max-time 1 -X POST "$URL" -o /dev/null 2>/dev/null && break
    sleep 0.1
  done
}

if ! command -v python3 >/dev/null 2>&1; then
  echo "skip - python3 unavailable"; exit 0
fi
start_server

run() {  # run <mode> [env assignments...]
  local m="$1"; shift
  env PUSHOVER_VALIDATE_URL="$URL" PUSHOVER_API_URL="$URL" \
      COMMIT_SHA=abcdef1234567890 \
      RUN_URL=https://github.com/festion/homelab-gitops/actions/runs/99 \
      FAILED_JOBS="deploy-homelab on github-runner-2" \
      "$@" bash "$SCRIPT" "$m" 2>&1
}

# --- preflight: missing credentials is LOUD but non-fatal --------------------
# The whole point of preflight is that it runs on a GREEN deploy. It must never
# be the reason a good build fails to ship.
out="$(run preflight PUSHOVER_API_TOKEN= PUSHOVER_USER_KEY=)"; rc=$?
if [ "$rc" -eq 0 ] && printf '%s' "$out" | grep -q '::warning::'; then
  ok "preflight: missing creds warn loudly and do not block the deploy"
else
  bad "preflight: missing creds warn loudly and do not block the deploy (rc=$rc)"; echo "$out"
fi

# --- preflight: REJECTED credentials are surfaced ----------------------------
# Presence is not validity. ops #2480's 400 came from a credential that WAS set.
echo invalid > "$TMP/mode"
out="$(run preflight PUSHOVER_API_TOKEN=tok PUSHOVER_USER_KEY=usr)"; rc=$?
if [ "$rc" -eq 0 ] && printf '%s' "$out" | grep -q '::error::'; then
  ok "preflight: set-but-rejected creds raise ::error:: (presence != validity)"
else
  bad "preflight: set-but-rejected creds raise ::error:: (rc=$rc)"; echo "$out"
fi
if printf '%s' "$out" | grep -q 'application token is invalid'; then
  ok "preflight: surfaces Pushover's own error text"
else
  bad "preflight: surfaces Pushover's own error text"; echo "$out"
fi

# --- preflight: valid credentials pass quietly -------------------------------
echo valid > "$TMP/mode"
out="$(run preflight PUSHOVER_API_TOKEN=tok PUSHOVER_USER_KEY=usr)"; rc=$?
if [ "$rc" -eq 0 ] && printf '%s' "$out" | grep -q 'credentials validated'; then
  ok "preflight: valid creds pass"
else
  bad "preflight: valid creds pass (rc=$rc)"; echo "$out"
fi

# --- notify: a rejected alert is FATAL — the ops #3310 regression ------------
# This is the case that discriminates the fix from the bug. `curl … || true`
# passes every other test in this file and fails only this one.
echo invalid > "$TMP/mode"
out="$(run notify PUSHOVER_API_TOKEN=tok PUSHOVER_USER_KEY=usr)"; rc=$?
if [ "$rc" -ne 0 ] && printf '%s' "$out" | grep -q '::error::'; then
  ok "notify: a rejected alert EXITS NON-ZERO instead of vanishing into a green step"
else
  bad "notify: a rejected alert EXITS NON-ZERO (rc=$rc)"; echo "$out"
fi

# --- notify: missing creds is fatal too --------------------------------------
out="$(run notify PUSHOVER_API_TOKEN= PUSHOVER_USER_KEY=)"; rc=$?
if [ "$rc" -ne 0 ]; then
  ok "notify: cannot-send is fatal rather than silent"
else
  bad "notify: cannot-send is fatal rather than silent (rc=$rc)"; echo "$out"
fi

# --- notify: happy path sends, and the payload carries what triage needs -----
echo valid > "$TMP/mode"
rm -f "$TMP/last_request"
out="$(run notify PUSHOVER_API_TOKEN=tok-canonical PUSHOVER_USER_KEY=usr)"; rc=$?
if [ "$rc" -eq 0 ] && printf '%s' "$out" | grep -q 'failure alert sent'; then
  ok "notify: happy path sends"
else
  bad "notify: happy path sends (rc=$rc)"; echo "$out"
fi
if grep -q 'tok-canonical' "$TMP/last_request" 2>/dev/null; then
  ok "notify: the token actually reached the wire"
else
  bad "notify: the token actually reached the wire"
fi
if grep -q 'abcdef12' "$TMP/last_request" 2>/dev/null; then
  ok "notify: the message names the failing commit"
else
  bad "notify: the message names the failing commit"
fi
if grep -q 'actions/runs/99' "$TMP/last_request" 2>/dev/null; then
  ok "notify: the message carries the run URL"
else
  bad "notify: the message carries the run URL"
fi
# ops #3308: this deploy's failures flap BY RUNNER, so the runner is a required
# field, not a nicety. Without it the alert cannot distinguish "the deploy is
# broken" from "github-runner-2 is broken".
if grep -q 'github-runner-2' "$TMP/last_request" 2>/dev/null; then
  ok "notify: the message names the failed job and its runner (ops #3308)"
else
  bad "notify: the message names the failed job and its runner (ops #3308)"
fi

# --- notify: an unresolvable runner degrades, it does not block the alert -----
# The workflow fills FAILED_JOBS from the run's own jobs API. If that call fails
# the alert must still go out — a notification missing one field beats silence,
# which is the failure mode this whole card is about.
rm -f "$TMP/last_request"
out="$(run notify PUSHOVER_API_TOKEN=tok PUSHOVER_USER_KEY=usr FAILED_JOBS=)"; rc=$?
if [ "$rc" -eq 0 ] && grep -q 'unknown' "$TMP/last_request" 2>/dev/null; then
  ok "notify: an unresolvable job/runner degrades to 'unknown' and still sends"
else
  bad "notify: an unresolvable job/runner degrades and still sends (rc=$rc)"; echo "$out"
fi

# --- secrets must not leak into the deploy log -------------------------------
echo invalid > "$TMP/mode"
out="$(run preflight PUSHOVER_API_TOKEN=SUPERSECRETTOKEN PUSHOVER_USER_KEY=SUPERSECRETUSER)"
if ! printf '%s' "$out" | grep -q 'SUPERSECRETTOKEN' && \
   ! printf '%s' "$out" | grep -q 'SUPERSECRETUSER'; then
  ok "neither the token nor the user key is ever printed"
else
  bad "a credential leaked into the log"; echo "$out"
fi

# --- the workflow must wire the CANONICAL secret names -----------------------
# ops #2480 in one line: deploy.yml read PUSHOVER_APP_TOKEN while every other
# consumer read PUSHOVER_API_TOKEN, an unset secret interpolated to empty, and
# Pushover answered 400. The names must match Infisical's, which are
# PUSHOVER_API_TOKEN and PUSHOVER_USER_KEY.
#
# Match the ENV INJECTION, not the bare string: the comments in these files name
# the retired spelling deliberately, and a check that fires on its own
# documentation is worse than no check.
WF="$HERE/../../.github/workflows/deploy.yml"
if [ ! -f "$WF" ]; then
  bad "deploy.yml not found at $WF — this guard silently checks nothing"
else
  api="$(sed 's/#.*//' "$WF" | grep -cE '^[[:space:]]*PUSHOVER_API_TOKEN[[:space:]]*:' || true)"
  usr="$(sed 's/#.*//' "$WF" | grep -cE '^[[:space:]]*PUSHOVER_USER_KEY[[:space:]]*:' || true)"
  bogus="$(sed 's/#.*//' "$WF" | grep -cE '^[[:space:]]*PUSHOVER_(APP_TOKEN|TOKEN|USER)[[:space:]]*:' || true)"
  if [ "$api" -eq 0 ] || [ "$usr" -eq 0 ]; then
    bad "deploy.yml does not inject PUSHOVER_API_TOKEN/PUSHOVER_USER_KEY (api=$api user=$usr)"
  elif [ "$bogus" -ne 0 ]; then
    bad "deploy.yml injects a non-canonical PUSHOVER_* name ($bogus site(s)) — the ops #2480 shape"
  else
    ok "deploy.yml injects only the canonical PUSHOVER_API_TOKEN/PUSHOVER_USER_KEY"
  fi

  # And the notify invocation must not be softened back into a fail-open.
  if sed 's/#.*//' "$WF" | grep -qE 'pushover_notify\.sh[[:space:]]+notify.*(\|\|[[:space:]]*true|continue-on-error)'; then
    bad "deploy.yml softens the notify step with || true — that IS ops #3310"
  else
    ok "deploy.yml does not soften the notify step into a fail-open"
  fi
fi

echo "----"
if [ "$fail" -eq 0 ]; then echo "ALL TESTS PASSED"; else echo "SOME TESTS FAILED"; fi
exit "$fail"
