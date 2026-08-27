#!/usr/bin/env bash
# Pushover alerting for the production deploy — credential resolution, preflight
# validation, and the failure notification itself.
#
# WHY THIS EXISTS (ops #3310)
# ---------------------------
# A failed "Deploy to Production" run on this repo notified nobody, in any way:
#
#   2026-08-26 00:47:13Z  3e30f57  SUCCESS
#   2026-08-26 01:28:48Z  410c0d0  FAILURE
#
# Two red production deploys 21 hours apart, found by accident. In between,
# every merge to main was unshipped. The deploy fails CLOSED — CT 123 keeps
# serving the last good build and /health stays 200 — which is why nothing
# screamed.
#
# WHY A SCRIPT AND NOT INLINE YAML (ops #2480, learned on stormcrow)
# ------------------------------------------------------------------
# stormcrow's deploy had exactly this alarm as an inline `curl … || true`. On
# 2026-08-02 it returned HTTP 400 and the step still reported success, so a
# genuinely failed deploy told nobody. Two defects, and the second is the
# dangerous one:
#
#   1. The credential name was wrong. Every other consumer in this homelab —
#      Infisical, scripts/hydrate-env.sh, stormcrow's config.py, the boxes'
#      .env files — calls these PUSHOVER_API_TOKEN and PUSHOVER_USER_KEY. An
#      unset secret interpolates to empty and Pushover answers 400.
#   2. `|| true` swallowed it. An alerting path that fails OPEN is worse than
#      no alerting at all, because absence of alerts reads as "nothing went
#      wrong" — which is the whole of ops #3310.
#
# Extracted into a script so the logic is testable at all: inline YAML in an
# `if: failure()` step can only ever be exercised by failing a real deploy.
# See scripts/tests/test_pushover_notify.sh.
#
# Modes:
#   preflight  — validate the credentials WITHOUT sending an alert, so a broken
#                notification path is discovered on a GREEN deploy rather than
#                during the incident that needed it. Never fatal: a Pushover
#                outage must not block shipping. Loud instead — ::warning::/
#                ::error:: annotations plus a $GITHUB_STEP_SUMMARY line.
#   notify     — send the failure alert. FATAL on failure (no `|| true`), so a
#                broken alert shows as a red step instead of vanishing.
#
# Never prints a token or user key — only presence, and the API's own status.
#
# Test hooks: PUSHOVER_API_URL / PUSHOVER_VALIDATE_URL override the endpoints;
#             GITHUB_STEP_SUMMARY is honoured if set (Actions sets it).
set -u

MODE="${1:-preflight}"
VALIDATE_URL="${PUSHOVER_VALIDATE_URL:-https://api.pushover.net/1/users/validate.json}"
MESSAGES_URL="${PUSHOVER_API_URL:-https://api.pushover.net/1/messages.json}"

log() { echo "[pushover] $*"; }

summary() {
  # Surface on the run's summary page, not only in the step log, so a warning on
  # a green deploy is actually seen. No-op when unset (local runs / tests).
  [ -n "${GITHUB_STEP_SUMMARY:-}" ] && printf '%s\n' "$*" >> "$GITHUB_STEP_SUMMARY"
  return 0
}

# PUSHOVER_API_TOKEN / PUSHOVER_USER_KEY are the only accepted names. They match
# Infisical's keys of the same name and every other consumer in the homelab.
#
# There is deliberately NO fallback to another spelling. ops #2480: a fallback's
# only reachable behaviour is to turn "canonical secret missing" into "send with
# some other, probably stale credential" — degrading silently instead of failing
# loudly, which is the exact state this script exists to escape.
TOKEN="${PUSHOVER_API_TOKEN:-}"
USER_KEY="${PUSHOVER_USER_KEY:-}"

missing=""
[ -z "$TOKEN" ] && missing="token"
[ -z "$USER_KEY" ] && missing="${missing:+$missing and }user key"

case "$MODE" in
  preflight)
    if [ -n "$missing" ]; then
      log "::warning::Pushover $missing not configured — a FAILED deploy will notify nobody."
      log "         Set PUSHOVER_API_TOKEN and PUSHOVER_USER_KEY as repository"
      log "         secrets on festion/homelab-gitops. This is not fatal, but it"
      log "         means the deploy's only failure alarm is dead (ops #3310)."
      summary "⚠️ **Pushover $missing missing** — a failed deploy will not notify anyone (ops #3310)."
      exit 0
    fi

    # Capability-test the actual values. Presence is not validity: the 400 that
    # started ops #2480 came from a credential that WAS set in the workflow.
    # users/validate.json checks token+user without sending a notification.
    body="$(curl -sS --max-time 10 \
              --form-string "token=${TOKEN}" \
              --form-string "user=${USER_KEY}" \
              "$VALIDATE_URL" 2>/dev/null)" || body=""
    # Whitespace-tolerant: JSON permits spaces after the colon, and matching the
    # compact form only would silently report a VALID credential as rejected.
    if printf '%s' "$body" | grep -qE '"status":[[:space:]]*1'; then
      log "credentials validated via ${VALIDATE_URL}"
      exit 0
    fi
    # Pushover echoes the offending field in `errors`; that names what is wrong
    # without revealing either value.
    errs="$(printf '%s' "$body" | sed -n 's/.*"errors":[[:space:]]*\[\([^]]*\)\].*/\1/p')"
    log "::error::Pushover credentials are set but REJECTED — a failed deploy will notify nobody."
    log "         endpoint: ${VALIDATE_URL}"
    log "         pushover said: ${errs:-<no parseable error; check the token/user pair>}"
    summary "🚨 **Pushover credentials rejected** — the deploy's failure alarm is dead (ops #3310). Pushover said: ${errs:-unparseable}"
    # Deliberately non-fatal: a Pushover outage must not block a deploy. The
    # ::error:: annotation and summary line are the alarm.
    exit 0
    ;;

  notify)
    SHORT_SHA="${COMMIT_SHA:0:8}"
    # ops #3308 established this deploy's failures flap BY RUNNER — succeeding on
    # two runners and failing on a third — so the runner is part of the message,
    # not a detail. FAILED_JOBS is filled in by the workflow from the run's own
    # jobs API (job name + runner); it degrades to "unknown" rather than blocking
    # the alert, because a notification missing one field still beats silence.
    if [ -n "$missing" ]; then
      log "::error::cannot send the deploy-failure alert: Pushover $missing not configured."
      summary "🚨 **Deploy failed AND the alert could not be sent** — Pushover $missing missing."
      exit 1
    fi
    # No `|| true`. If the alarm cannot fire, that must be visible as a failed
    # step; swallowing it is the whole of ops #3310.
    if curl -fsS --max-time 10 \
         --form-string "token=${TOKEN}" \
         --form-string "user=${USER_KEY}" \
         --form-string "priority=1" \
         --form-string "title=homelab-gitops: PRODUCTION DEPLOY FAILED" \
         --form-string "message=Deploy of ${SHORT_SHA:-unknown} to CT 123 FAILED; prod is serving the last good build and every merge since is unshipped. Failed: ${FAILED_JOBS:-unknown}. Run: ${RUN_URL:-unknown}" \
         "$MESSAGES_URL" -o /dev/null; then
      log "failure alert sent"
      exit 0
    fi
    log "::error::the deploy-failure Pushover alert was REJECTED."
    summary "🚨 **Deploy failed AND the alert was rejected by Pushover** (ops #3310)."
    exit 1
    ;;

  *)
    log "usage: $0 [preflight|notify]"
    exit 2
    ;;
esac
