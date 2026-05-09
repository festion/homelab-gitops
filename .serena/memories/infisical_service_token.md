# Infisical Service Token

> **REVOKED 2026-05-09** — Vikunja #1102. The token below was committed to
> this repo (read-only access via git log, but write-capable in dev+prod via
> Infisical) and was rotated as part of the 2026-05-08 monorepo security
> remediation. Old value returns HTTP 404 on the Infisical API. Literal
> redacted.
>
> For new interactive tokens, prefer `infisical login -i` (per-machine
> session) or a Machine Identity (universal-auth) — do NOT mint a new
> long-lived service token and commit it here.

## Old token (revoked)

- **Token**: `<see Vikunja #1102 — REVOKED 2026-05-09>`
- **Token ID**: `58fae899-b38e-48cf-a14d-d3ce082bc66e`
- **Name**: ClaudeCode
- **Scope**: dev + prod (read+write on `/`)
- **Created**: 2025-12-02
- **Revoked**: 2026-05-09 (via Infisical web UI)

## Replacement procedure

1. Use `infisical login --domain="https://infisical.internal.lakehouse.wtf" -i`
   for interactive sessions. The wrapper at `~/.local/bin/infisical-get` handles
   session expiry by falling back to the `claude-code-dev` Machine Identity
   (universal-auth, creds at `~/.infisical/machine-identity.env`).
2. For headless/CI use, prefer Machine Identities over service tokens. Service
   tokens are deprecated upstream as of Infisical 0.40+.

## Available Secrets (prod environment)

See the live Infisical project — no point listing here, the inventory drifts.
