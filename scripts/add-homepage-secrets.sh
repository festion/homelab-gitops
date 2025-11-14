#!/bin/bash
#
# Add Homepage environment variables to Infisical homelab-gitops project
#
# Usage:
#   INFISICAL_TOKEN=st.650cfc13... bash scripts/add-homepage-secrets.sh
#

set -e

INFISICAL_URL="${INFISICAL_URL:-https://infisical.internal.lakehouse.wtf}"
INFISICAL_ENV="${INFISICAL_ENV:-prod}"
INFISICAL_TOKEN="${INFISICAL_TOKEN}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

if [ -z "$INFISICAL_TOKEN" ]; then
  echo -e "${RED}❌ INFISICAL_TOKEN not set${NC}"
  echo ""
  echo "Please set the homelab-gitops token:"
  echo "  export INFISICAL_TOKEN=\"st.650cfc13-6ecd-4a3b-91cc-8d7a123b67c4...\""
  echo ""
  echo "Then run:"
  echo "  bash scripts/add-homepage-secrets.sh"
  exit 1
fi

echo -e "${YELLOW}📝 Adding Homepage secrets to homelab-gitops project...${NC}"
echo ""

# Function to add a secret
add_secret() {
  local secret_name="$1"
  local secret_value="$2"

  echo -n "  Adding $secret_name... "

  response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Authorization: Bearer $INFISICAL_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"secretName\":\"$secret_name\",\"secretValue\":\"$secret_value\",\"environment\":\"$INFISICAL_ENV\",\"type\":\"shared\"}" \
    "$INFISICAL_URL/api/v3/secrets/raw/$secret_name" 2>&1)

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
    echo -e "${GREEN}✅${NC}"
    return 0
  else
    # Try to update instead
    response=$(curl -s -w "\n%{http_code}" -X PATCH \
      -H "Authorization: Bearer $INFISICAL_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"secretValue\":\"$secret_value\"}" \
      "$INFISICAL_URL/api/v3/secrets/raw/$secret_name?environment=$INFISICAL_ENV" 2>&1)

    http_code=$(echo "$response" | tail -n1)

    if [ "$http_code" -eq 200 ]; then
      echo -e "${YELLOW}✅ (updated)${NC}"
      return 0
    else
      echo -e "${RED}❌ (HTTP $http_code)${NC}"
      return 1
    fi
  fi
}

# Add Homepage application secrets
echo -e "${YELLOW}Homepage Application Configuration:${NC}"
add_secret "NODE_ENV" "production"
add_secret "PORT" "3000"
add_secret "HOMEPAGE_ALLOWED_HOSTS" "homepage.internal.lakehouse.wtf,192.168.1.45,localhost"

echo ""
echo -e "${YELLOW}Homepage Integration Credentials:${NC}"

# Proxmox
add_secret "HOMEPAGE_VAR_PROXMOX_USER" "api@pve!homepage"
add_secret "HOMEPAGE_VAR_PROXMOX_TOKEN" "<PROXMOX_API_TOKEN_ROTATED_T11_see_Vikunja_1062>"

# Home Assistant
add_secret "HOMEPAGE_VAR_HASS_TOKEN" "<HA_LONG_LIVED_JWT_ROTATED_T8_see_Vikunja_1059>"

# AdGuard
add_secret "HOMEPAGE_VAR_ADGUARD_USER" "admin"
add_secret "HOMEPAGE_VAR_ADGUARD_PASS" "your-password"

# TrueNAS
add_secret "HOMEPAGE_VAR_TRUENAS_KEY" "<TRUENAS_API_KEY_id2_ROTATED_T10_see_Vikunja_1061>"

# Grafana
add_secret "HOMEPAGE_VAR_GRAFANA_USER" "admin"
add_secret "HOMEPAGE_VAR_GRAFANA_PASS" "<see Infisical: GRAFANA_ADMIN_PASSWORD/INFLUXDB_ADMIN_PASSWORD - pre-rotation T5/T6>"

# Omada
add_secret "HOMEPAGE_VAR_OMADA_USER" "admin"
add_secret "HOMEPAGE_VAR_OMADA_PASS" "admin"

# InfluxDB
add_secret "HOMEPAGE_VAR_INFLUX_USER" "admin"
add_secret "HOMEPAGE_VAR_INFLUX_PASS" "<see Infisical: GRAFANA_ADMIN_PASSWORD/INFLUXDB_ADMIN_PASSWORD - pre-rotation T5/T6>"

echo ""
echo -e "${GREEN}✅ Homepage secrets added to homelab-gitops project!${NC}"
echo ""
echo "Next steps:"
echo "1. Verify secrets in Infisical web UI:"
echo "   https://infisical.internal.lakehouse.wtf"
echo ""
echo "2. Update Homepage configuration to use Infisical:"
echo "   - Use infisicalManager to fetch these secrets"
echo "   - Remove hardcoded credentials from systemd service"
echo ""
echo "3. Test Homepage with Infisical integration:"
echo "   - Restart Homepage service"
echo "   - Verify all integrations still work"
