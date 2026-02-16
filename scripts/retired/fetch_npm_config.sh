#!/bin/bash

# --- Configuration ---
PROXMOX_HOST="192.168.1.137"
NPM_CTID=105
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SNAPSHOT_DIR="/opt/gitops/npm_proxy_snapshot"
LOCAL_SNAPSHOT="${SNAPSHOT_DIR}/${TIMESTAMP}"
REMOTE_DB_PATH="/var/lib/lxc/${NPM_CTID}/rootfs/data/database.sqlite"

LOG_DIR="/opt/gitops/logs"
LOG_FILE="${LOG_DIR}/fetch_npm_config.log"
mkdir -p "$LOG_DIR"

log() {
  local ts
  ts=$(date -u '+%Y-%m-%d %H:%M:%S')
  echo "[$ts] $*" | tee -a "$LOG_FILE"
}

# --- Execution ---
log "🔐 Connecting to Proxmox at ${PROXMOX_HOST}..."
ssh root@${PROXMOX_HOST} "pct stop ${NPM_CTID}"
log "🚑 Stopping LXC ${NPM_CTID}..."

log "🔧 Mounting LXC ${NPM_CTID} rootfs..."
ssh root@${PROXMOX_HOST} "pct mount ${NPM_CTID}"

log "📁 Copying NPM database to GitOps container..."
mkdir -p "$LOCAL_SNAPSHOT"
rsync -avz -e ssh root@${PROXMOX_HOST}:${REMOTE_DB_PATH} "$LOCAL_SNAPSHOT/" 2>>"$LOG_FILE"

if [[ -f "${LOCAL_SNAPSHOT}/database.sqlite" ]]; then
  log "✅ Successfully copied database.sqlite to ${LOCAL_SNAPSHOT}"
else
  log "❌ database.sqlite not found in snapshot directory — rsync may have failed."
fi

log "🔄 Unmounting LXC ${NPM_CTID} rootfs..."
ssh root@${PROXMOX_HOST} "pct unmount ${NPM_CTID}"

log "🚀 Restarting LXC ${NPM_CTID}..."
ssh root@${PROXMOX_HOST} "pct start ${NPM_CTID}"

log "✅ Done. Snapshot saved to: ${LOCAL_SNAPSHOT}/database.sqlite"
