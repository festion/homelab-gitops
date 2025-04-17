#!/bin/bash

PROXMOX_HOST="192.168.1.137"  # Replace with your Proxmox host IP
LXC_ID="123"
MOUNT_SRC="/opt/npm/data/nginx/proxy_host"
MOUNT_DST="/mnt/npm_proxy_host"
CONF_FILE="/etc/pve/lxc/${LXC_ID}.conf"

echo "🔐 Checking SSH access to Proxmox (${PROXMOX_HOST})..."
ssh root@${PROXMOX_HOST} "test -f ${CONF_FILE}" || {
  echo "❌ Cannot access LXC config on Proxmox"; exit 1;
}

echo "🔍 Checking if mount already exists..."
if ssh root@${PROXMOX_HOST} grep -q "${MOUNT_DST}" "${CONF_FILE}"; then
  echo "✅ Bind mount already present."
else
  echo "➕ Adding mount to ${CONF_FILE}..."
  ssh root@${PROXMOX_HOST} "echo 'mp0: ${MOUNT_SRC},mp=${MOUNT_DST},ro=1' >> ${CONF_FILE}"
  echo "🔁 Restarting LXC ${LXC_ID}..."
ssh root@${PROXMOX_HOST} "pct stop ${LXC_ID} && pct start ${LXC_ID}"
  echo "✅ Done. Mount should now be active."
fi
