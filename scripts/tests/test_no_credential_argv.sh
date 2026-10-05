#!/usr/bin/env bash
# ops #4348: no shipped shell file may pass a Pushover token/user to curl in
# argv. argv is readable by any local user via ps and /proc/<pid>/cmdline,
# including other CI jobs on a shared runner; credentials go via `curl -K
# /dev/stdin` with every value routed through cfg_escape.
#
# The scan has planted positive controls: it must flag each bad shape, and must
# stay quiet on the approved shape, before its verdict on the repo is believed.
#
# Run: bash scripts/tests/test_no_credential_argv.sh
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
fail=0
ok()  { printf 'ok   - %s\n' "$1"; }
bad() { printf 'FAIL - %s\n' "$1"; fail=1; }

RE='(--data-urlencode|--data-raw|--data-binary|--data|--form-string|--form|-d|-F)\s+"?(token|user)=\$(?!\(cfg_escape )'
scan() { grep -nP -- "$RE" "$@" 2>/dev/null; }   # prints hits, rc 0 if any

# --- positive controls: each must be flagged ---------------------------------
# Built from fragments so this file does not itself match the scan once tracked.
D='$'; E='=$'
POS=(
  "curl --form-string \"token${E}PUSHOVER_API_TOKEN\" https://x"
  "curl --form-string \"user${E}{USER_KEY}\" https://x"
  "curl -F token${E}T https://x"
  "curl -d \"user${E}U\" https://x"
  "curl --data-urlencode \"token${E}(cat /x)\" https://x"
  "curl --data \"token${E}(cfg_escape_not \\\"${D}T\\\")\" https://x"
)
i=0
for line in "${POS[@]}"; do
  i=$((i+1)); printf '%s\n' "$line" > "$TMP/pos$i.sh"
  if scan "$TMP/pos$i.sh" >/dev/null; then ok "control $i flagged"; else bad "control $i NOT flagged: $line"; fi
done
# --- negative control: the approved shape must not be flagged ----------------
printf '%s\n' "--form-string \"token=${D}(cfg_escape \"${D}TOKEN\")\"" > "$TMP/neg.sh"
if scan "$TMP/neg.sh" >/dev/null; then bad "approved shape flagged"; else ok "approved cfg_escape shape not flagged"; fi

# --- coverage: scan must see the known sender files, as a number -------------
files=()
while IFS= read -r -d '' f; do files+=("$ROOT/$f"); done < <(git -C "$ROOT" ls-files -z -- '*.sh')
n=${#files[@]}
for must in scripts/pushover_notify.sh scripts/loki-audit-cron.sh; do
  printf '%s\0' "${files[@]}" | grep -zqxF "$ROOT/$must" && ok "scan covers $must" || bad "scan does NOT cover $must"
done
echo "scanned $n tracked shell files"
[ "$n" -gt 0 ] || bad "no shell files enumerated"

hits="$(scan "${files[@]}")"
if [ -z "$hits" ]; then ok "no shipped shell file passes token=/user= in argv"
else bad "credential in argv:"; echo "$hits" | cut -c1-160; fi

# --- loki-audit-cron.sh: drive its real send_pushover with a shim curl --------
# The script runs an audit on source, so extract just the two functions.
mkdir -p "$TMP/shim"
cat > "$TMP/shim/curl" <<SHIM
#!/usr/bin/env bash
printf '%s\n' "\$@" > "$TMP/loki_argv"
cat > "$TMP/loki_stdin"
SHIM
chmod +x "$TMP/shim/curl"
{ sed -n '/^cfg_escape() {/,/^}/p' "$ROOT/scripts/loki-audit-cron.sh"
  sed -n '/^send_pushover() {/,/^}/p' "$ROOT/scripts/loki-audit-cron.sh"; } > "$TMP/fns.sh"
if [ "$(grep -c '^cfg_escape() {\|^send_pushover() {' "$TMP/fns.sh")" -ne 2 ]; then
  bad "could not extract cfg_escape and send_pushover from loki-audit-cron.sh"
else
  FT="FAKETOKENloki1111aaaa2222bbbb33"; FU="FAKEUSERloki4444cccc5555dddd66"
  cat > "$TMP/drive.sh" <<'DRV'
. "$1"
send_pushover 't"itle' $'line1\nline2 back\\slash'
DRV
  out="$(PATH="$TMP/shim:$PATH" PUSHOVER_API_TOKEN="$FT" PUSHOVER_USER_KEY="$FU" TIMESTAMP=t \
    bash "$TMP/drive.sh" "$TMP/fns.sh" 2>&1)"
  if [ ! -s "$TMP/loki_argv" ]; then bad "loki: shim curl never ran"; echo "$out" | sed "s/FAKE[A-Za-z0-9]*/<fake>/g" | head
  else
    ! grep -qF "$FT" "$TMP/loki_argv" && ! grep -qF "$FU" "$TMP/loki_argv" \
      && ok "loki: fake credentials ABSENT from curl argv" || bad "loki: credentials in curl argv"
    grep -qF "$FT" "$TMP/loki_stdin" && grep -qF "$FU" "$TMP/loki_stdin" \
      && ok "loki: fake credentials PRESENT on curl stdin" || bad "loki: credentials missing from stdin"
    [ "$(wc -l < "$TMP/loki_stdin")" -eq 7 ] \
      && ok "loki: hostile newline did not add a config line (7 lines for 7 fields)" \
      || bad "loki: stdin has $(wc -l < "$TMP/loki_stdin") lines, expected 7"
  fi
fi

echo "----"
if [ "$fail" -eq 0 ]; then echo "ALL TESTS PASSED"; else echo "SOME TESTS FAILED"; fi
exit "$fail"
