#!/bin/bash
#
# Cloudflare Zero Trust Helper Script
# Utility script for managing Zero Trust policies, devices, and WARP enrollment
#
# Usage:
#   source scripts/cloudflare-zerotrust-helper.sh
#   zt_list_enrolled_devices
#   zt_add_allowed_email "user@example.com"
#
# Credentials are loaded from Infisical (homelab-gitops project)
#

INFISICAL_URL="${INFISICAL_URL:-https://infisical.internal.lakehouse.wtf}"
INFISICAL_ENV="${INFISICAL_ENV:-prod}"
INFISICAL_WORKSPACE_ID="${INFISICAL_WORKSPACE_ID:-a5488023-8138-4c71-9dcc-42e85a11e542}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Cloudflare API base URL
CF_API="https://api.cloudflare.com/client/v4"

# Cache for credentials
_CF_TOKEN=""
_CF_ACCOUNT_ID=""
_WARP_APP_ID=""
_WARP_POLICY_ID=""

#
# Internal: Get secret from Infisical
#
_get_infisical_secret() {
  local secret_name="$1"

  if [ -z "$INFISICAL_TOKEN" ]; then
    echo -e "${RED}Error: INFISICAL_TOKEN not set${NC}" >&2
    echo "Set it with: export INFISICAL_TOKEN=\"your-token\"" >&2
    return 1
  fi

  curl -s -H "Authorization: Bearer $INFISICAL_TOKEN" \
    "$INFISICAL_URL/api/v3/secrets/raw/$secret_name?workspaceId=$INFISICAL_WORKSPACE_ID&environment=$INFISICAL_ENV" \
    | jq -r '.secret.secretValue // empty'
}

#
# Internal: Load Cloudflare credentials
#
_load_cf_credentials() {
  if [ -n "$_CF_TOKEN" ] && [ -n "$_CF_ACCOUNT_ID" ]; then
    return 0
  fi

  echo -e "${YELLOW}Loading Cloudflare credentials from Infisical...${NC}" >&2

  _CF_TOKEN=$(_get_infisical_secret "CF_ZEROTRUST_API")
  _CF_ACCOUNT_ID=$(_get_infisical_secret "CF_ACCOUNT_ID")

  if [ -z "$_CF_TOKEN" ] || [ -z "$_CF_ACCOUNT_ID" ]; then
    echo -e "${RED}Failed to load Cloudflare credentials${NC}" >&2
    return 1
  fi

  echo -e "${GREEN}Credentials loaded${NC}" >&2
  return 0
}

#
# Internal: Make Cloudflare API request
#
_cf_api() {
  local method="$1"
  local endpoint="$2"
  local data="$3"

  if ! _load_cf_credentials; then
    return 1
  fi

  if [ -n "$data" ]; then
    curl -s -X "$method" \
      -H "Authorization: Bearer $_CF_TOKEN" \
      -H "Content-Type: application/json" \
      -d "$data" \
      "$CF_API$endpoint"
  else
    curl -s -X "$method" \
      -H "Authorization: Bearer $_CF_TOKEN" \
      "$CF_API$endpoint"
  fi
}

#
# Internal: Get WARP app and policy IDs
#
_get_warp_ids() {
  if [ -n "$_WARP_APP_ID" ] && [ -n "$_WARP_POLICY_ID" ]; then
    return 0
  fi

  # Find WARP app
  local apps=$(_cf_api GET "/accounts/$_CF_ACCOUNT_ID/access/apps")
  _WARP_APP_ID=$(echo "$apps" | jq -r '.result[] | select(.type == "warp") | .id' | head -1)

  if [ -z "$_WARP_APP_ID" ]; then
    echo -e "${RED}No WARP app found${NC}" >&2
    return 1
  fi

  # Find first policy (enrollment policy)
  local policies=$(_cf_api GET "/accounts/$_CF_ACCOUNT_ID/access/apps/$_WARP_APP_ID/policies")
  _WARP_POLICY_ID=$(echo "$policies" | jq -r '.result[0].id // empty')

  return 0
}

# ============================================================================
# Public Functions
# ============================================================================

#
# Test connection and credentials
#
zt_test_connection() {
  echo -e "${YELLOW}Testing Cloudflare Zero Trust connection...${NC}"

  if ! _load_cf_credentials; then
    return 1
  fi

  local result=$(_cf_api GET "/user/tokens/verify")
  local status=$(echo "$result" | jq -r '.result.status // "unknown"')

  if [ "$status" = "active" ]; then
    echo -e "${GREEN}Token is valid and active${NC}"

    # Test Zero Trust access
    local org=$(_cf_api GET "/accounts/$_CF_ACCOUNT_ID/access/organizations")
    local org_name=$(echo "$org" | jq -r '.result.name // "unknown"')
    echo -e "${GREEN}Zero Trust Organization: $org_name${NC}"
    return 0
  else
    echo -e "${RED}Token verification failed${NC}"
    return 1
  fi
}

#
# List enrolled devices
#
zt_list_devices() {
  echo -e "${YELLOW}Fetching enrolled devices...${NC}"

  if ! _load_cf_credentials; then
    return 1
  fi

  local devices=$(_cf_api GET "/accounts/$_CF_ACCOUNT_ID/devices")

  if [ "$(echo "$devices" | jq -r '.success')" = "true" ]; then
    local count=$(echo "$devices" | jq -r '.result | length')
    echo -e "${GREEN}Found $count device(s):${NC}"
    echo ""
    echo "$devices" | jq -r '.result[] | "  \(.name // "Unknown") (\(.device_type // "unknown"))\n    User: \(.user.email // "N/A")\n    Last seen: \(.last_seen // "N/A")\n    ID: \(.id)\n"'
  else
    echo -e "${RED}Failed to fetch devices${NC}"
    echo "$devices" | jq -r '.errors[0].message // "Unknown error"'
    return 1
  fi
}

#
# List allowed emails in WARP enrollment policy
#
zt_list_allowed_emails() {
  echo -e "${YELLOW}Fetching allowed emails...${NC}"

  if ! _load_cf_credentials; then
    return 1
  fi

  if ! _get_warp_ids; then
    return 1
  fi

  local policy=$(_cf_api GET "/accounts/$_CF_ACCOUNT_ID/access/apps/$_WARP_APP_ID/policies/$_WARP_POLICY_ID")

  echo -e "${GREEN}Allowed emails:${NC}"
  echo "$policy" | jq -r '.result.include[] | select(.email) | "  - \(.email.email)"'
  echo ""
  echo "$policy" | jq -r '.result.include[] | select(.email_domain) | "  - *@\(.email_domain.domain)"'
}

#
# Add email to WARP enrollment policy
#
zt_add_allowed_email() {
  local email="$1"

  if [ -z "$email" ]; then
    echo -e "${RED}Usage: zt_add_allowed_email <email>${NC}"
    return 1
  fi

  echo -e "${YELLOW}Adding $email to allowed list...${NC}"

  if ! _load_cf_credentials; then
    return 1
  fi

  if ! _get_warp_ids; then
    return 1
  fi

  # Get current policy
  local policy=$(_cf_api GET "/accounts/$_CF_ACCOUNT_ID/access/apps/$_WARP_APP_ID/policies/$_WARP_POLICY_ID")
  local current_include=$(echo "$policy" | jq -r '.result.include')

  # Check if email already exists
  if echo "$current_include" | jq -e ".[] | select(.email.email == \"$email\")" > /dev/null 2>&1; then
    echo -e "${YELLOW}Email $email is already in the allowed list${NC}"
    return 0
  fi

  # Add new email to include list
  local new_include=$(echo "$current_include" | jq ". + [{\"email\": {\"email\": \"$email\"}}]")

  # Update policy
  local result=$(_cf_api PUT "/accounts/$_CF_ACCOUNT_ID/access/apps/$_WARP_APP_ID/policies/$_WARP_POLICY_ID" \
    "{\"name\": \"Allow Personal Emails\", \"decision\": \"allow\", \"include\": $new_include}")

  if [ "$(echo "$result" | jq -r '.success')" = "true" ]; then
    echo -e "${GREEN}Added $email to allowed list${NC}"
    return 0
  else
    echo -e "${RED}Failed to add email${NC}"
    echo "$result" | jq -r '.errors[0].message // "Unknown error"'
    return 1
  fi
}

#
# Add email domain to WARP enrollment policy
#
zt_add_allowed_domain() {
  local domain="$1"

  if [ -z "$domain" ]; then
    echo -e "${RED}Usage: zt_add_allowed_domain <domain>${NC}"
    return 1
  fi

  echo -e "${YELLOW}Adding *@$domain to allowed list...${NC}"

  if ! _load_cf_credentials; then
    return 1
  fi

  if ! _get_warp_ids; then
    return 1
  fi

  # Get current policy
  local policy=$(_cf_api GET "/accounts/$_CF_ACCOUNT_ID/access/apps/$_WARP_APP_ID/policies/$_WARP_POLICY_ID")
  local current_include=$(echo "$policy" | jq -r '.result.include')

  # Check if domain already exists
  if echo "$current_include" | jq -e ".[] | select(.email_domain.domain == \"$domain\")" > /dev/null 2>&1; then
    echo -e "${YELLOW}Domain $domain is already in the allowed list${NC}"
    return 0
  fi

  # Add new domain to include list
  local new_include=$(echo "$current_include" | jq ". + [{\"email_domain\": {\"domain\": \"$domain\"}}]")

  # Update policy
  local result=$(_cf_api PUT "/accounts/$_CF_ACCOUNT_ID/access/apps/$_WARP_APP_ID/policies/$_WARP_POLICY_ID" \
    "{\"name\": \"Allow Personal Emails\", \"decision\": \"allow\", \"include\": $new_include}")

  if [ "$(echo "$result" | jq -r '.success')" = "true" ]; then
    echo -e "${GREEN}Added *@$domain to allowed list${NC}"
    return 0
  else
    echo -e "${RED}Failed to add domain${NC}"
    echo "$result" | jq -r '.errors[0].message // "Unknown error"'
    return 1
  fi
}

#
# Remove email from WARP enrollment policy
#
zt_remove_allowed_email() {
  local email="$1"

  if [ -z "$email" ]; then
    echo -e "${RED}Usage: zt_remove_allowed_email <email>${NC}"
    return 1
  fi

  echo -e "${YELLOW}Removing $email from allowed list...${NC}"

  if ! _load_cf_credentials; then
    return 1
  fi

  if ! _get_warp_ids; then
    return 1
  fi

  # Get current policy
  local policy=$(_cf_api GET "/accounts/$_CF_ACCOUNT_ID/access/apps/$_WARP_APP_ID/policies/$_WARP_POLICY_ID")
  local current_include=$(echo "$policy" | jq -r '.result.include')

  # Remove email from include list
  local new_include=$(echo "$current_include" | jq "[.[] | select(.email.email != \"$email\")]")

  # Update policy
  local result=$(_cf_api PUT "/accounts/$_CF_ACCOUNT_ID/access/apps/$_WARP_APP_ID/policies/$_WARP_POLICY_ID" \
    "{\"name\": \"Allow Personal Emails\", \"decision\": \"allow\", \"include\": $new_include}")

  if [ "$(echo "$result" | jq -r '.success')" = "true" ]; then
    echo -e "${GREEN}Removed $email from allowed list${NC}"
    return 0
  else
    echo -e "${RED}Failed to remove email${NC}"
    echo "$result" | jq -r '.errors[0].message // "Unknown error"'
    return 1
  fi
}

#
# Revoke a device
#
zt_revoke_device() {
  local device_id="$1"

  if [ -z "$device_id" ]; then
    echo -e "${RED}Usage: zt_revoke_device <device_id>${NC}"
    echo "Use zt_list_devices to get device IDs"
    return 1
  fi

  echo -e "${YELLOW}Revoking device $device_id...${NC}"

  if ! _load_cf_credentials; then
    return 1
  fi

  local result=$(_cf_api DELETE "/accounts/$_CF_ACCOUNT_ID/devices/$device_id")

  if [ "$(echo "$result" | jq -r '.success')" = "true" ]; then
    echo -e "${GREEN}Device revoked${NC}"
    return 0
  else
    echo -e "${RED}Failed to revoke device${NC}"
    echo "$result" | jq -r '.errors[0].message // "Unknown error"'
    return 1
  fi
}

#
# List Access applications
#
zt_list_apps() {
  echo -e "${YELLOW}Fetching Access applications...${NC}"

  if ! _load_cf_credentials; then
    return 1
  fi

  local apps=$(_cf_api GET "/accounts/$_CF_ACCOUNT_ID/access/apps")

  if [ "$(echo "$apps" | jq -r '.success')" = "true" ]; then
    echo -e "${GREEN}Access Applications:${NC}"
    echo ""
    echo "$apps" | jq -r '.result[] | "  \(.name)\n    Type: \(.type)\n    ID: \(.id)\n"'
  else
    echo -e "${RED}Failed to fetch applications${NC}"
    return 1
  fi
}

#
# List identity providers
#
zt_list_idps() {
  echo -e "${YELLOW}Fetching identity providers...${NC}"

  if ! _load_cf_credentials; then
    return 1
  fi

  local idps=$(_cf_api GET "/accounts/$_CF_ACCOUNT_ID/access/identity_providers")

  if [ "$(echo "$idps" | jq -r '.success')" = "true" ]; then
    echo -e "${GREEN}Identity Providers:${NC}"
    echo ""
    echo "$idps" | jq -r '.result[] | "  \(.name) (\(.type))\n    ID: \(.id)\n"'
  else
    echo -e "${RED}Failed to fetch identity providers${NC}"
    return 1
  fi
}

#
# Show help
#
zt_help() {
  cat <<EOF
${GREEN}Cloudflare Zero Trust Helper${NC}

Manage Zero Trust policies, devices, and WARP enrollment.

${YELLOW}Setup:${NC}
  export INFISICAL_TOKEN="your-infisical-token"
  source scripts/cloudflare-zerotrust-helper.sh

${YELLOW}Available Functions:${NC}
  ${CYAN}Connection${NC}
    zt_test_connection              Test API connection and credentials

  ${CYAN}Device Management${NC}
    zt_list_devices                 List all enrolled devices
    zt_revoke_device <id>           Revoke/remove a device

  ${CYAN}Email Enrollment Policy${NC}
    zt_list_allowed_emails          List allowed emails/domains
    zt_add_allowed_email <email>    Allow a specific email
    zt_add_allowed_domain <domain>  Allow all emails from a domain
    zt_remove_allowed_email <email> Remove an email from allowed list

  ${CYAN}Access Management${NC}
    zt_list_apps                    List Access applications
    zt_list_idps                    List identity providers

  ${CYAN}Help${NC}
    zt_help                         Show this help message

${YELLOW}Examples:${NC}
  # Test connection
  zt_test_connection

  # Add a new allowed email
  zt_add_allowed_email "friend@gmail.com"

  # Allow entire domain
  zt_add_allowed_domain "company.com"

  # List and revoke a device
  zt_list_devices
  zt_revoke_device "abc123-device-id"

${YELLOW}Environment Variables:${NC}
  INFISICAL_TOKEN       - Infisical access token (required)
  INFISICAL_URL         - Infisical server (default: https://infisical.internal.lakehouse.wtf)
  INFISICAL_ENV         - Environment (default: prod)

${YELLOW}Credentials:${NC}
  CF_ZEROTRUST_API and CF_ACCOUNT_ID are loaded from Infisical automatically.

EOF
}

# If script is run directly (not sourced), show help
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
  zt_help
fi
