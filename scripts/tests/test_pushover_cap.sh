#!/usr/bin/env bash
# ops #4372 — every Pushover sender must cap its message at 1024 characters
# (Pushover rejects longer ones, so the page is lost).
#
# 1. ENUMERATE senders from the repo (tracked files naming the Pushover API),
#    never from a hand-written list, and fail if any lacks the cap logic.
# 2. DRIVE the real send paths of the known senders with a 3000-char message and
#    a shim curl, and assert <=1024 characters arrive.
#
# Run: bash scripts/tests/test_pushover_cap.sh
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
fail=0
ok()  { printf 'ok   - %s\n' "$1"; }
bad() { printf 'FAIL - %s\n' "$1"; fail=1; }

# --- 1. enumeration -----------------------------------------------------------
senders=()
while IFS= read -r -d '' f; do
  case "$f" in
    scripts/tests/*|tests/*|*/tests/*|*.md|archive/*|*/archive/*) continue ;;
  esac
  senders+=("$f")
done < <(git -C "$ROOT" grep -z -l -I -e api.pushover.net -e PUSHOVER_URL -e messages.json)
echo "enumerated ${#senders[@]} sender(s): ${senders[*]:-}"
[ "${#senders[@]}" -ge 1 ] && ok "enumeration found >=1 sender" || bad "enumeration found NO senders (a test that finds nothing must fail)"
for must in scripts/pushover_notify.sh scripts/loki-audit-cron.sh; do
  printf '%s\n' "${senders[@]:-}" | grep -qxF "$must" && ok "enumeration includes $must" || bad "enumeration misses known sender $must"
done
# Every enumerated sender must be DRIVEN below. The static marker check alone
# is satisfiable by a comment, so a new sender with no driver fails here.
DRIVEN=(scripts/pushover_notify.sh scripts/loki-audit-cron.sh)
for f in "${senders[@]:-}"; do
  [ -n "$f" ] || continue
  printf '%s\n' "${DRIVEN[@]}" | grep -qxF "$f" || bad "$f sends to Pushover but has no behavioural driver in this test (add one)"
done
for f in "${senders[@]:-}"; do
  [ -n "$f" ] || continue
  if grep -q 'ops #4372' "$ROOT/$f" && grep -q '1024' "$ROOT/$f" && grep -qF '… (truncated)' "$ROOT/$f"; then
    ok "$f carries the 1024-char cap"
  else
    bad "$f POSTs to Pushover with NO 1024-char cap (ops #4372)"
  fi
done

# --- 2. behaviour -------------------------------------------------------------
mkdir -p "$TMP/shim"
cat > "$TMP/shim/curl" <<SHIM
#!/usr/bin/env bash
cat > "$TMP/stdin"
SHIM
chmod +x "$TMP/shim/curl"

# Prints the character length of the message field in the captured curl config
# (decoding the -K escapes); empty if no message line.
msg_len() {
  python3 - "$TMP/stdin" <<'PY'
import re, sys
for line in open(sys.argv[1], encoding="utf-8"):
    m = re.match(r'--form-string "message=(.*)"\n?$', line)
    if m:
        v = re.sub(r'\\(.)', lambda x: {"n": "\n", "r": "\r"}.get(x.group(1), x.group(1)), m.group(1))
        print(len(v) if len(sys.argv) < 3 else int(v.endswith(sys.argv[2]))); break
PY
}
# 1 if the captured message ends with the truncation suffix, else 0.
msg_suffixed() {
  python3 - "$TMP/stdin" "… (truncated)" <<'PY'
import re, sys
for line in open(sys.argv[1], encoding="utf-8"):
    m = re.match(r'--form-string "message=(.*)"\n?$', line)
    if m:
        v = re.sub(r'\\(.)', lambda x: {"n": "\n", "r": "\r"}.get(x.group(1), x.group(1)), m.group(1))
        print(int(v.endswith(sys.argv[2]))); break
PY
}

BIG="$(python3 -c 'print("é"*3000, end="")')"   # multibyte: characters != bytes

# loki-audit-cron.sh: extract just the functions (the script runs an audit on source).
{ sed -n '/^cfg_escape() {/,/^}/p' "$ROOT/scripts/loki-audit-cron.sh"
  sed -n '/^send_pushover() {/,/^}/p' "$ROOT/scripts/loki-audit-cron.sh"; } > "$TMP/fns.sh"
if [ "$(grep -c '^cfg_escape() {\|^send_pushover() {' "$TMP/fns.sh")" -ne 2 ]; then
  bad "could not extract send_pushover from loki-audit-cron.sh"
else
  printf '%s\n' '. "$1"' 'send_pushover t "$2"' > "$TMP/drive.sh"
  : > "$TMP/stdin"
  PATH="$TMP/shim:$PATH" PUSHOVER_API_TOKEN=faketok PUSHOVER_USER_KEY=fakeusr TIMESTAMP=t \
    bash "$TMP/drive.sh" "$TMP/fns.sh" "$BIG" >/dev/null 2>&1
  n="$(msg_len)"
  if [ -n "$n" ] && [ "$n" -le 1024 ] && [ "$(msg_suffixed)" = 1 ]; then ok "loki-audit-cron: 3000-char message sent as $n chars, suffixed"
  else bad "loki-audit-cron: 3000-char message arrived as '${n:-<none>}' chars"; fi
  : > "$TMP/stdin"
  PATH="$TMP/shim:$PATH" PUSHOVER_API_TOKEN=faketok PUSHOVER_USER_KEY=fakeusr TIMESTAMP=t \
    bash "$TMP/drive.sh" "$TMP/fns.sh" "short msg" >/dev/null 2>&1
  [ "$(msg_len)" = "9" ] && ok "loki-audit-cron: short message untouched" || bad "loki-audit-cron: short message altered"
fi

# pushover_notify.sh notify mode: oversized FAILED_JOBS.
: > "$TMP/stdin"
PATH="$TMP/shim:$PATH" PUSHOVER_API_TOKEN=faketok PUSHOVER_USER_KEY=fakeusr COMMIT_SHA=abcdef1234567890 \
  RUN_URL=https://example.invalid/run/1 FAILED_JOBS="$BIG" \
  bash "$ROOT/scripts/pushover_notify.sh" notify >/dev/null 2>&1
n="$(msg_len)"
if [ -n "$n" ] && [ "$n" -le 1024 ] && [ "$(msg_suffixed)" = 1 ]; then ok "pushover_notify: oversized alert sent as $n chars, suffixed"
else bad "pushover_notify: oversized alert arrived as '${n:-<none>}' chars (or without the suffix)"; fi

# pushover_notify.sh notify mode: a short alert must pass through untouched.
: > "$TMP/stdin"
PATH="$TMP/shim:$PATH" PUSHOVER_API_TOKEN=faketok PUSHOVER_USER_KEY=fakeusr COMMIT_SHA=abcdef1234567890 \
  RUN_URL=https://example.invalid/run/1 FAILED_JOBS="unit" \
  bash "$ROOT/scripts/pushover_notify.sh" notify >/dev/null 2>&1
n="$(msg_len)"
if [ -n "$n" ] && [ "$n" -lt 1024 ] && [ "$(msg_suffixed)" = 0 ]; then ok "pushover_notify: short alert untouched ($n chars)"
else bad "pushover_notify: short alert altered ('${n:-<none>}' chars)"; fi

echo "----"
if [ "$fail" -eq 0 ]; then echo "ALL TESTS PASSED"; else echo "SOME TESTS FAILED"; fi
exit "$fail"
