#!/bin/bash

LOG_DIR="/opt/gitops/logs"
LOG_FILE="${LOG_DIR}/gitops_dns_sync.log"

mkdir -p "$LOG_DIR"

log() {
  local ts
  ts=$(date -u '+%Y-%m-%d %H:%M:%S')
  echo "[$ts] $*" | tee -a "$LOG_FILE"
}

log "🚀 Starting GitOps DNS Sync Process..."

log "📥 Fetching latest NPM database snapshot..."
/opt/gitops/scripts/fetch_npm_config.sh

log "🔎 Running dry-run rewrite sync..."
python3 /opt/gitops/scripts/generate_adguard_rewrites_from_sqlite.py

log "✅ Committing rewrite sync..."
python3 /opt/gitops/scripts/generate_adguard_rewrites_from_sqlite.py --commit

log "🏁 GitOps DNS Sync Process Complete."
