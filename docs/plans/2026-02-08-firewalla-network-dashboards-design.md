# Firewalla Network Dashboards Design

**Date:** 2026-02-08
**Status:** Approved
**Data Source:** Zeek logs via Fluent Bit → Loki (`zeek-conn`, `zeek-dns`)

## Context

Fluent Bit migration is complete. Firewalla Zeek connection and DNS logs are flowing to Loki with rich structured metadata but no dashboards exist to visualize them. Three dashboards will be built.

## Data Available

### zeek-conn (Connection Logs)
**Structured metadata:** `proto`, `service`, `conn_state`, `orig_h`, `resp_h`, `resp_p`

### zeek-dns (DNS Logs)
**Structured metadata:** `proto`, `query`, `qtype_name`, `rcode_name`, `orig_h`, `resp_h`

### Known DNS Resolvers (for security exclusions)
- `192.168.1.224` — adguard-2 (primary)
- `192.168.1.253` — adguard (replica)

## Dashboard 1: Network Overview

**UID:** `firewalla-network-overview`
**Tags:** loki, network, firewalla, zeek
**Purpose:** "What's happening on my network right now" — top talkers, protocol breakdown, connection volume.

### Panels

| # | Title | Type | Query Summary |
|---|-------|------|---------------|
| 1 | Connection Rate | stat | `sum(count_over_time({job="zeek-conn"}[$__interval]))` |
| 2 | Active Protocols | pie | `sum by (proto) (count_over_time({job="zeek-conn"}[$__interval]))` |
| 3 | Top Services | bar gauge | Top 10 by `service` metadata count |
| 4 | Connection Volume | timeseries | Connections over time, stacked by `proto` |
| 5 | Top Source IPs | table | Most active `orig_h` with connection count |
| 6 | Top Destination IPs | table | Most active `resp_h` with connection count |
| 7 | Top Destination Ports | bar gauge | Most hit `resp_p` values |
| 8 | Connection State Distribution | pie | `conn_state` breakdown (SF, S0, REJ, etc.) |
| 9 | Connection Log Stream | logs | Searchable raw log viewer |

### Key Queries
```logql
# Connection rate
sum(count_over_time({job="zeek-conn"}[$__interval]))

# Protocol breakdown
sum by (proto) (count_over_time({job="zeek-conn"}[$__interval]))

# Top services (uses structured metadata)
topk(10, sum by (service) (count_over_time({job="zeek-conn"}[$__interval])))

# Top source IPs
topk(20, sum by (orig_h) (count_over_time({job="zeek-conn"}[$__interval])))

# Connection states
sum by (conn_state) (count_over_time({job="zeek-conn"}[$__interval]))
```

---

## Dashboard 2: DNS Analysis

**UID:** `firewalla-dns-analysis`
**Tags:** loki, dns, firewalla, zeek
**Purpose:** DNS query patterns, failure rates, and unusual lookups.

### Panels

| # | Title | Type | Query Summary |
|---|-------|------|---------------|
| 1 | DNS Query Rate | stat | Total queries/sec |
| 2 | Query Success Rate | gauge | % of `rcode_name=NOERROR` |
| 3 | Failed Queries (5m) | stat | NXDOMAIN + SERVFAIL + REFUSED count |
| 4 | Query Volume | timeseries | Queries over time, stacked by `rcode_name` |
| 5 | Response Code Breakdown | pie | `rcode_name` distribution |
| 6 | Query Type Distribution | bar gauge | `qtype_name` breakdown (A, AAAA, MX, etc.) |
| 7 | Top Queried Domains | table | Most frequent `query` values |
| 8 | Top NXDOMAIN Queries | table | Most frequent failed domain lookups |
| 9 | Top DNS Clients | table | Most active `orig_h` by query count |
| 10 | DNS Servers Hit | table | `resp_h` breakdown |
| 11 | DNS Query Log Stream | logs | Searchable raw log viewer |

### Key Queries
```logql
# Query rate
sum(count_over_time({job="zeek-dns"}[$__interval]))

# Success rate
sum(count_over_time({job="zeek-dns"} | rcode_name="NOERROR" [$__interval]))
  /
sum(count_over_time({job="zeek-dns"}[$__interval])) * 100

# Failed queries
sum(count_over_time({job="zeek-dns"} | rcode_name=~"NXDOMAIN|SERVFAIL|REFUSED" [$__interval]))

# Top NXDOMAIN domains
topk(20, sum by (query) (count_over_time({job="zeek-dns"} | rcode_name="NXDOMAIN" [$__interval])))

# Top DNS clients
topk(20, sum by (orig_h) (count_over_time({job="zeek-dns"}[$__interval])))
```

---

## Dashboard 3: Network Security

**UID:** `firewalla-network-security`
**Tags:** loki, security, firewalla, zeek
**Purpose:** Anomaly detection — unusual connections, suspicious DNS, rejected traffic.

### Panels

| # | Title | Type | Query Summary |
|---|-------|------|---------------|
| 1 | Rejected Connections (5m) | stat | `conn_state=REJ` count |
| 2 | Unanswered Connections (5m) | stat | `conn_state=S0` count |
| 3 | DNS Failures (5m) | stat | NXDOMAIN + SERVFAIL count |
| 4 | Rejected Connection Rate | timeseries | `conn_state=REJ` over time |
| 5 | Unanswered Connection Rate | timeseries | `conn_state=S0` over time |
| 6 | Unusual Outbound Ports | table | Connections to ports NOT in {80,443,53,22,8080,8443,3100,1883,8883} |
| 7 | Top Rejected Sources | table | IPs with most REJ connections |
| 8 | Top Unanswered Destinations | table | IPs/ports not responding |
| 9 | High Connection Rate Sources | table | IPs with abnormally high conn counts |
| 10 | NXDOMAIN Repeat Offenders | table | Clients repeatedly querying non-existent domains |
| 11 | Non-Standard DNS Servers | table | DNS traffic to servers other than 192.168.1.224 and 192.168.1.253 |
| 12 | Security Event Log Stream | logs | Filtered to REJ + S0 + unusual events |

### Key Queries
```logql
# Rejected connections
sum(count_over_time({job="zeek-conn"} | conn_state="REJ" [$__interval]))

# Unanswered (port scan signature)
sum(count_over_time({job="zeek-conn"} | conn_state="S0" [$__interval]))

# Unusual ports (exclude common)
{job="zeek-conn"} | resp_p!="80" | resp_p!="443" | resp_p!="53" | resp_p!="22" | resp_p!="8080" | resp_p!="8443" | resp_p!="3100" | resp_p!="1883"

# Non-standard DNS servers
{job="zeek-dns"} | resp_h!="192.168.1.224" | resp_h!="192.168.1.253"

# High connection rate sources (top talkers)
topk(10, sum by (orig_h) (count_over_time({job="zeek-conn"}[5m])))

# NXDOMAIN repeat offenders
topk(10, sum by (orig_h) (count_over_time({job="zeek-dns"} | rcode_name="NXDOMAIN" [$__interval])))
```

---

## Implementation Notes

### File Locations
All dashboard JSONs go in `/home/dev/workspace/homelab-gitops/infrastructure/grafana/dashboards/`:
- `firewalla-network-overview.json`
- `firewalla-dns-analysis.json`
- `firewalla-network-security.json`

These are auto-loaded by the existing provisioning config at `provisioning/dashboards/default.yaml` (polls `/var/lib/grafana/dashboards` every 30s).

### Style Consistency
Match existing dashboards:
- Grafana schema version consistent with `infrastructure-overview.json`
- Tags follow pattern: `loki, <domain>, firewalla, zeek`
- Time range default: Last 1 hour
- Auto-refresh: 30 seconds
- Datasource: Loki (UID: `P8E80F9AEF21F6940`)

### Structured Metadata Query Pattern
All high-cardinality fields use pipe syntax (not label selectors):
```logql
# Correct (structured metadata)
{job="zeek-conn"} | proto="tcp" | conn_state="REJ"

# Wrong (would cause cardinality explosion)
{job="zeek-conn", proto="tcp", conn_state="REJ"}
```

### Zeek Connection States Reference
| Code | Meaning | Security Relevance |
|------|---------|-------------------|
| SF | Normal (SYN-FIN) | Healthy |
| S0 | SYN, no reply | Port scan / dead host |
| REJ | Rejected (RST) | Blocked / refused |
| S1 | SYN-ACK, no final ACK | Incomplete handshake |
| RSTO | RST from originator | Client abort |
| RSTR | RST from responder | Server abort |
| OTH | Other | Midstream traffic |
