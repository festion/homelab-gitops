# Omada API Operations

## API Types

Omada provides two API interfaces:

| API | Purpose | Authentication |
|-----|---------|----------------|
| **OpenAPI v1** | Official third-party integration | OAuth2 Client Credentials |
| **Web API v2** | Internal web interface API | Session cookies + CSRF |

---

## OpenAPI v1 (Recommended)

### Setup

1. Navigate to **Global View → Settings → Platform Integration → Open API**
2. Enable Open API
3. Create a new API Client:
   - Name: Descriptive name
   - Note the **Client ID** and **Client Secret**

### Authentication Flow

#### Step 1: Login

```bash
POST /openapi/authorize/login?client_id={CLIENT_ID}
Content-Type: application/json

{
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET"
}
```

#### Step 2: Get Token

```bash
POST /openapi/authorize/token?grant_type=client_credentials
Content-Type: application/json
Authorization: Basic {base64(client_id:client_secret)}
```

Response:
```json
{
  "access_token": "abc123...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

#### Step 3: Use Token

Include in all subsequent requests:
```
Authorization: AccessToken=abc123...
```

### Example: List Sites

```bash
curl -k -X GET "https://192.168.1.47:8043/openapi/v1/sites" \
  -H "Authorization: AccessToken=YOUR_ACCESS_TOKEN"
```

### Example: List Devices

```bash
curl -k -X GET "https://192.168.1.47:8043/openapi/v1/{omadacId}/sites/{siteId}/devices" \
  -H "Authorization: AccessToken=YOUR_ACCESS_TOKEN"
```

---

## Web API v2 (Internal)

Used by the Omada web interface. Useful for automation when OpenAPI doesn't support a feature.

### Base URL

```
https://192.168.1.47:8043/{controller_id}/api/v2/
```

The `controller_id` can be found in the URL when logged into the web interface.

### Authentication

Requires both:
1. **TPOMADA_SESSIONID** cookie (from login)
2. **Csrf-Token** header (from session)

### Login

```bash
curl -k -c cookies.txt -X POST \
  "https://192.168.1.47:8043/{controller_id}/api/v2/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YOUR_PASSWORD"}'
```

### Get CSRF Token

After login, extract from cookies or response headers.

### Example Request with CSRF

```bash
curl -k -b cookies.txt -X GET \
  "https://192.168.1.47:8043/{controller_id}/api/v2/sites/{siteId}/devices" \
  -H "Csrf-Token: YOUR_CSRF_TOKEN"
```

---

## Common Endpoints

### Sites

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/sites` | List all sites |
| GET | `/api/v2/sites/{siteId}` | Get site details |

### Devices

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/sites/{siteId}/devices` | List all adopted devices |
| GET | `/api/v2/sites/{siteId}/devices/{deviceMac}` | Get device details |
| POST | `/api/v2/sites/{siteId}/cmd/devices/{deviceMac}/reboot` | Reboot device |

### Clients

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/sites/{siteId}/clients` | List connected clients |
| GET | `/api/v2/sites/{siteId}/clients/{clientMac}` | Get client details |

**Note**: Client endpoints support paging:
```
?page=1&pageSize=100
```

### Networks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/sites/{siteId}/setting/lan` | Get LAN settings |
| GET | `/api/v2/sites/{siteId}/setting/lan/networks` | List VLANs |

---

## Code Examples

### Python - OpenAPI Authentication

```python
import requests
import json

BASE_URL = "https://192.168.1.47:8043"
CLIENT_ID = "your_client_id"
CLIENT_SECRET = "your_client_secret"

# Disable SSL warnings for self-signed cert
requests.packages.urllib3.disable_warnings()

# Login
login_resp = requests.post(
    f"{BASE_URL}/openapi/authorize/login?client_id={CLIENT_ID}",
    json={"client_id": CLIENT_ID, "client_secret": CLIENT_SECRET},
    verify=False
)

# Get token
import base64
auth = base64.b64encode(f"{CLIENT_ID}:{CLIENT_SECRET}".encode()).decode()
token_resp = requests.post(
    f"{BASE_URL}/openapi/authorize/token?grant_type=client_credentials",
    headers={"Authorization": f"Basic {auth}"},
    verify=False
)
access_token = token_resp.json()["access_token"]

# Make API call
headers = {"Authorization": f"AccessToken={access_token}"}
sites = requests.get(f"{BASE_URL}/openapi/v1/sites", headers=headers, verify=False)
print(sites.json())
```

### Bash - List Devices

```bash
#!/bin/bash

OMADA_HOST="192.168.1.47"
CLIENT_ID="your_client_id"
CLIENT_SECRET="your_client_secret"

# Get token
TOKEN=$(curl -sk -X POST \
  "https://${OMADA_HOST}:8043/openapi/authorize/token?grant_type=client_credentials" \
  -H "Authorization: Basic $(echo -n "${CLIENT_ID}:${CLIENT_SECRET}" | base64)" \
  | jq -r '.access_token')

# Get sites
SITES=$(curl -sk "https://${OMADA_HOST}:8043/openapi/v1/sites" \
  -H "Authorization: AccessToken=${TOKEN}")

echo "Sites: $SITES"
```

---

## Rate Limits & Best Practices

1. **Token Refresh**: Tokens expire after 1 hour; implement refresh logic
2. **Rate Limiting**: Avoid more than 10 requests/second
3. **SSL Verification**: Controller uses self-signed cert; handle appropriately
4. **Error Handling**: Check `errorCode` in responses (0 = success)

### Response Format

```json
{
  "errorCode": 0,
  "msg": "Success",
  "result": {
    // ... data
  }
}
```

### Common Error Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| -1 | General error |
| -30109 | Invalid token |
| -30110 | Token expired |
