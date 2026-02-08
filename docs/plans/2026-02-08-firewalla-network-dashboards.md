# Firewalla Network Dashboards Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create three Grafana dashboards visualizing Firewalla Zeek connection and DNS logs flowing through Fluent Bit into Loki.

**Architecture:** Three provisioned JSON dashboard files dropped into the existing Grafana dashboard directory. Auto-loaded by the existing file-based provisioner (polls every 30s). All queries use Loki structured metadata pipe syntax for high-cardinality fields.

**Tech Stack:** Grafana 12.3.1 JSON dashboard format, Loki datasource (UID: `P8E80F9AEF21F6940`), schemaVersion 39.

---

## Reference: Conventions from Existing Dashboards

Before writing any JSON, understand these conventions from `infrastructure-overview.json` and `network-services.json`:

- **Datasource:** Every panel AND every target needs `"datasource": {"type": "loki", "uid": "P8E80F9AEF21F6940"}`
- **Schema:** `"schemaVersion": 39`, `"pluginVersion": "12.3.1"`
- **Grid:** 24 columns wide. Stat panels: `h:4, w:6`. Timeseries: `h:8, w:12`. Logs: `h:8-10, w:24`
- **Boilerplate:** `"id": null`, `"editable": true`, `"graphTooltip": 1`, `"fiscalYearStartMonth": 0`
- **Time:** `"from": "now-1h"`, `"to": "now"`
- **No variables** on network-services.json (infrastructure-overview has job/search variables)
- **Structured metadata queries** use pipe syntax: `{job="zeek-conn"} | proto="tcp"` (NOT label selectors)

## Reference: Zeek Connection States

| Code | Meaning | Security Signal |
|------|---------|----------------|
| SF | Normal (SYN-FIN) | Healthy |
| S0 | SYN, no reply | Port scan / dead host |
| REJ | Rejected (RST) | Blocked / refused |
| S1 | SYN-ACK, no final ACK | Incomplete handshake |
| RSTO | RST from originator | Client abort |
| RSTR | RST from responder | Server abort |

## Reference: DNS Resolver IPs (for security exclusions)

- `192.168.1.224` — adguard-2 (primary)
- `192.168.1.253` — adguard (replica)

---

## Task 1: Create Network Overview Dashboard

**Files:**
- Create: `infrastructure/grafana/dashboards/firewalla-network-overview.json`

**Step 1: Create the dashboard JSON file**

Create `infrastructure/grafana/dashboards/firewalla-network-overview.json` with this exact content:

```json
{
  "annotations": {
    "list": []
  },
  "editable": true,
  "fiscalYearStartMonth": 0,
  "graphTooltip": 1,
  "id": null,
  "links": [],
  "panels": [
    {
      "datasource": {
        "type": "loki",
        "uid": "P8E80F9AEF21F6940"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "thresholds" },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [{ "color": "green", "value": null }]
          },
          "unit": "short"
        },
        "overrides": []
      },
      "gridPos": { "h": 4, "w": 6, "x": 0, "y": 0 },
      "id": 1,
      "options": {
        "colorMode": "value",
        "graphMode": "area",
        "justifyMode": "auto",
        "orientation": "auto",
        "reduceOptions": {
          "calcs": ["lastNotNull"],
          "fields": "",
          "values": false
        },
        "textMode": "auto"
      },
      "pluginVersion": "12.3.1",
      "targets": [
        {
          "datasource": { "type": "loki", "uid": "P8E80F9AEF21F6940" },
          "expr": "sum(count_over_time({job=\"zeek-conn\"}[5m]))",
          "refId": "A",
          "queryType": "range"
        }
      ],
      "title": "Connections (5m)",
      "type": "stat"
    },
    {
      "datasource": {
        "type": "loki",
        "uid": "P8E80F9AEF21F6940"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "thresholds" },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              { "color": "green", "value": null },
              { "color": "red", "value": 1 }
            ]
          },
          "unit": "short"
        },
        "overrides": []
      },
      "gridPos": { "h": 4, "w": 6, "x": 6, "y": 0 },
      "id": 2,
      "options": {
        "colorMode": "value",
        "graphMode": "area",
        "justifyMode": "auto",
        "orientation": "auto",
        "reduceOptions": {
          "calcs": ["lastNotNull"],
          "fields": "",
          "values": false
        },
        "textMode": "auto"
      },
      "pluginVersion": "12.3.1",
      "targets": [
        {
          "datasource": { "type": "loki", "uid": "P8E80F9AEF21F6940" },
          "expr": "sum(count_over_time({job=\"zeek-conn\"} | conn_state=\"REJ\" [5m]))",
          "refId": "A",
          "queryType": "range"
        }
      ],
      "title": "Rejected (5m)",
      "type": "stat"
    },
    {
      "datasource": {
        "type": "loki",
        "uid": "P8E80F9AEF21F6940"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "palette-classic" },
          "custom": {
            "hideFrom": { "legend": false, "tooltip": false, "viz": false }
          },
          "mappings": []
        },
        "overrides": []
      },
      "gridPos": { "h": 8, "w": 6, "x": 12, "y": 0 },
      "id": 3,
      "options": {
        "legend": { "displayMode": "list", "placement": "bottom", "showLegend": true },
        "pieType": "donut",
        "reduceOptions": {
          "calcs": ["lastNotNull"],
          "fields": "",
          "values": false
        },
        "tooltip": { "maxHeight": 600, "mode": "single", "sort": "none" }
      },
      "pluginVersion": "12.3.1",
      "targets": [
        {
          "datasource": { "type": "loki", "uid": "P8E80F9AEF21F6940" },
          "expr": "sum by (proto) (count_over_time({job=\"zeek-conn\"} | proto=~\".+\" [$__interval]))",
          "legendFormat": "{{proto}}",
          "refId": "A",
          "queryType": "range"
        }
      ],
      "title": "Protocol Distribution",
      "type": "piechart"
    },
    {
      "datasource": {
        "type": "loki",
        "uid": "P8E80F9AEF21F6940"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "palette-classic" },
          "custom": {
            "hideFrom": { "legend": false, "tooltip": false, "viz": false }
          },
          "mappings": []
        },
        "overrides": []
      },
      "gridPos": { "h": 8, "w": 6, "x": 18, "y": 0 },
      "id": 4,
      "options": {
        "legend": { "displayMode": "list", "placement": "bottom", "showLegend": true },
        "pieType": "donut",
        "reduceOptions": {
          "calcs": ["lastNotNull"],
          "fields": "",
          "values": false
        },
        "tooltip": { "maxHeight": 600, "mode": "single", "sort": "none" }
      },
      "pluginVersion": "12.3.1",
      "targets": [
        {
          "datasource": { "type": "loki", "uid": "P8E80F9AEF21F6940" },
          "expr": "sum by (conn_state) (count_over_time({job=\"zeek-conn\"} | conn_state=~\".+\" [$__interval]))",
          "legendFormat": "{{conn_state}}",
          "refId": "A",
          "queryType": "range"
        }
      ],
      "title": "Connection States",
      "type": "piechart"
    },
    {
      "datasource": {
        "type": "loki",
        "uid": "P8E80F9AEF21F6940"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "palette-classic" },
          "custom": {
            "axisBorderShow": false,
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "line",
            "fillOpacity": 20,
            "gradientMode": "none",
            "hideFrom": { "legend": false, "tooltip": false, "viz": false },
            "insertNulls": false,
            "lineInterpolation": "smooth",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": { "type": "linear" },
            "showPoints": "never",
            "spanNulls": false,
            "stacking": { "group": "A", "mode": "normal" },
            "thresholdsStyle": { "mode": "off" }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [{ "color": "green", "value": null }]
          },
          "unit": "short"
        },
        "overrides": []
      },
      "gridPos": { "h": 8, "w": 12, "x": 0, "y": 4 },
      "id": 5,
      "options": {
        "legend": {
          "calcs": ["mean", "max"],
          "displayMode": "table",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": { "maxHeight": 600, "mode": "multi", "sort": "desc" }
      },
      "pluginVersion": "12.3.1",
      "targets": [
        {
          "datasource": { "type": "loki", "uid": "P8E80F9AEF21F6940" },
          "expr": "sum by (proto) (count_over_time({job=\"zeek-conn\"} | proto=~\".+\" [$__interval]))",
          "legendFormat": "{{proto}}",
          "refId": "A",
          "queryType": "range"
        }
      ],
      "title": "Connection Volume by Protocol",
      "type": "timeseries"
    },
    {
      "datasource": {
        "type": "loki",
        "uid": "P8E80F9AEF21F6940"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "palette-classic" },
          "custom": {
            "axisBorderShow": false,
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "bars",
            "fillOpacity": 80,
            "gradientMode": "none",
            "hideFrom": { "legend": false, "tooltip": false, "viz": false },
            "insertNulls": false,
            "lineInterpolation": "smooth",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": { "type": "linear" },
            "showPoints": "never",
            "spanNulls": false,
            "stacking": { "group": "A", "mode": "none" },
            "thresholdsStyle": { "mode": "off" }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [{ "color": "green", "value": null }]
          },
          "unit": "short"
        },
        "overrides": []
      },
      "gridPos": { "h": 8, "w": 12, "x": 0, "y": 12 },
      "id": 6,
      "options": {
        "legend": {
          "calcs": ["sum"],
          "displayMode": "table",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": { "maxHeight": 600, "mode": "multi", "sort": "desc" }
      },
      "pluginVersion": "12.3.1",
      "targets": [
        {
          "datasource": { "type": "loki", "uid": "P8E80F9AEF21F6940" },
          "expr": "topk(10, sum by (service) (count_over_time({job=\"zeek-conn\"} | service=~\".+\" [$__interval])))",
          "legendFormat": "{{service}}",
          "refId": "A",
          "queryType": "range"
        }
      ],
      "title": "Top Services",
      "type": "timeseries"
    },
    {
      "datasource": {
        "type": "loki",
        "uid": "P8E80F9AEF21F6940"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "palette-classic" },
          "custom": {
            "axisBorderShow": false,
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "bars",
            "fillOpacity": 80,
            "gradientMode": "none",
            "hideFrom": { "legend": false, "tooltip": false, "viz": false },
            "insertNulls": false,
            "lineInterpolation": "smooth",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": { "type": "linear" },
            "showPoints": "never",
            "spanNulls": false,
            "stacking": { "group": "A", "mode": "none" },
            "thresholdsStyle": { "mode": "off" }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [{ "color": "green", "value": null }]
          },
          "unit": "short"
        },
        "overrides": []
      },
      "gridPos": { "h": 8, "w": 12, "x": 12, "y": 12 },
      "id": 7,
      "options": {
        "legend": {
          "calcs": ["sum"],
          "displayMode": "table",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": { "maxHeight": 600, "mode": "multi", "sort": "desc" }
      },
      "pluginVersion": "12.3.1",
      "targets": [
        {
          "datasource": { "type": "loki", "uid": "P8E80F9AEF21F6940" },
          "expr": "topk(10, sum by (resp_p) (count_over_time({job=\"zeek-conn\"} | resp_p=~\".+\" [$__interval])))",
          "legendFormat": "port {{resp_p}}",
          "refId": "A",
          "queryType": "range"
        }
      ],
      "title": "Top Destination Ports",
      "type": "timeseries"
    },
    {
      "datasource": {
        "type": "loki",
        "uid": "P8E80F9AEF21F6940"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "palette-classic" },
          "custom": {
            "axisBorderShow": false,
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "bars",
            "fillOpacity": 80,
            "gradientMode": "none",
            "hideFrom": { "legend": false, "tooltip": false, "viz": false },
            "insertNulls": false,
            "lineInterpolation": "smooth",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": { "type": "linear" },
            "showPoints": "never",
            "spanNulls": false,
            "stacking": { "group": "A", "mode": "none" },
            "thresholdsStyle": { "mode": "off" }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [{ "color": "green", "value": null }]
          },
          "unit": "short"
        },
        "overrides": []
      },
      "gridPos": { "h": 8, "w": 12, "x": 0, "y": 20 },
      "id": 8,
      "options": {
        "legend": {
          "calcs": ["sum"],
          "displayMode": "table",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": { "maxHeight": 600, "mode": "multi", "sort": "desc" }
      },
      "pluginVersion": "12.3.1",
      "targets": [
        {
          "datasource": { "type": "loki", "uid": "P8E80F9AEF21F6940" },
          "expr": "topk(15, sum by (orig_h) (count_over_time({job=\"zeek-conn\"} | orig_h=~\".+\" [$__interval])))",
          "legendFormat": "{{orig_h}}",
          "refId": "A",
          "queryType": "range"
        }
      ],
      "title": "Top Source IPs",
      "type": "timeseries"
    },
    {
      "datasource": {
        "type": "loki",
        "uid": "P8E80F9AEF21F6940"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "palette-classic" },
          "custom": {
            "axisBorderShow": false,
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "bars",
            "fillOpacity": 80,
            "gradientMode": "none",
            "hideFrom": { "legend": false, "tooltip": false, "viz": false },
            "insertNulls": false,
            "lineInterpolation": "smooth",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": { "type": "linear" },
            "showPoints": "never",
            "spanNulls": false,
            "stacking": { "group": "A", "mode": "none" },
            "thresholdsStyle": { "mode": "off" }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [{ "color": "green", "value": null }]
          },
          "unit": "short"
        },
        "overrides": []
      },
      "gridPos": { "h": 8, "w": 12, "x": 12, "y": 20 },
      "id": 9,
      "options": {
        "legend": {
          "calcs": ["sum"],
          "displayMode": "table",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": { "maxHeight": 600, "mode": "multi", "sort": "desc" }
      },
      "pluginVersion": "12.3.1",
      "targets": [
        {
          "datasource": { "type": "loki", "uid": "P8E80F9AEF21F6940" },
          "expr": "topk(15, sum by (resp_h) (count_over_time({job=\"zeek-conn\"} | resp_h=~\".+\" [$__interval])))",
          "legendFormat": "{{resp_h}}",
          "refId": "A",
          "queryType": "range"
        }
      ],
      "title": "Top Destination IPs",
      "type": "timeseries"
    },
    {
      "datasource": {
        "type": "loki",
        "uid": "P8E80F9AEF21F6940"
      },
      "gridPos": { "h": 10, "w": 24, "x": 0, "y": 28 },
      "id": 10,
      "options": {
        "dedupStrategy": "none",
        "enableLogDetails": true,
        "prettifyLogMessage": false,
        "showCommonLabels": false,
        "showLabels": true,
        "showTime": true,
        "sortOrder": "Descending",
        "wrapLogMessage": true
      },
      "pluginVersion": "12.3.1",
      "targets": [
        {
          "datasource": { "type": "loki", "uid": "P8E80F9AEF21F6940" },
          "expr": "{job=\"zeek-conn\"}",
          "refId": "A",
          "queryType": "range"
        }
      ],
      "title": "Connection Log Stream",
      "type": "logs"
    }
  ],
  "schemaVersion": 39,
  "tags": ["loki", "network", "firewalla", "zeek"],
  "templating": { "list": [] },
  "time": { "from": "now-1h", "to": "now" },
  "timepicker": {},
  "timezone": "browser",
  "title": "Firewalla Network Overview",
  "uid": "firewalla-network-overview",
  "version": 1,
  "weekStart": ""
}
```

**Step 2: Validate JSON syntax**

Run: `python3 -c "import json; json.load(open('infrastructure/grafana/dashboards/firewalla-network-overview.json')); print('OK')"` from repo root.
Expected: `OK`

**Step 3: Commit**

```bash
git add infrastructure/grafana/dashboards/firewalla-network-overview.json
git commit -m "feat: add Firewalla network overview Grafana dashboard

Visualizes Zeek connection logs from Loki with protocol distribution,
connection states, top IPs/ports/services, and searchable log stream."
```

---

## Task 2: Create DNS Analysis Dashboard

**Files:**
- Create: `infrastructure/grafana/dashboards/firewalla-dns-analysis.json`

**Step 1: Create the dashboard JSON file**

Create `infrastructure/grafana/dashboards/firewalla-dns-analysis.json` with this exact content:

```json
{
  "annotations": {
    "list": []
  },
  "editable": true,
  "fiscalYearStartMonth": 0,
  "graphTooltip": 1,
  "id": null,
  "links": [],
  "panels": [
    {
      "datasource": {
        "type": "loki",
        "uid": "P8E80F9AEF21F6940"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "thresholds" },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [{ "color": "green", "value": null }]
          },
          "unit": "short"
        },
        "overrides": []
      },
      "gridPos": { "h": 4, "w": 6, "x": 0, "y": 0 },
      "id": 1,
      "options": {
        "colorMode": "value",
        "graphMode": "area",
        "justifyMode": "auto",
        "orientation": "auto",
        "reduceOptions": {
          "calcs": ["lastNotNull"],
          "fields": "",
          "values": false
        },
        "textMode": "auto"
      },
      "pluginVersion": "12.3.1",
      "targets": [
        {
          "datasource": { "type": "loki", "uid": "P8E80F9AEF21F6940" },
          "expr": "sum(count_over_time({job=\"zeek-dns\"}[5m]))",
          "refId": "A",
          "queryType": "range"
        }
      ],
      "title": "DNS Queries (5m)",
      "type": "stat"
    },
    {
      "datasource": {
        "type": "loki",
        "uid": "P8E80F9AEF21F6940"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "thresholds" },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              { "color": "green", "value": null },
              { "color": "yellow", "value": 80 },
              { "color": "red", "value": 50 }
            ]
          },
          "unit": "percent",
          "max": 100,
          "min": 0
        },
        "overrides": []
      },
      "gridPos": { "h": 4, "w": 6, "x": 6, "y": 0 },
      "id": 2,
      "options": {
        "colorMode": "value",
        "graphMode": "none",
        "justifyMode": "auto",
        "orientation": "auto",
        "reduceOptions": {
          "calcs": ["lastNotNull"],
          "fields": "",
          "values": false
        },
        "textMode": "auto"
      },
      "pluginVersion": "12.3.1",
      "targets": [
        {
          "datasource": { "type": "loki", "uid": "P8E80F9AEF21F6940" },
          "expr": "sum(count_over_time({job=\"zeek-dns\"} | rcode_name=\"NOERROR\" [5m])) / sum(count_over_time({job=\"zeek-dns\"}[5m])) * 100",
          "refId": "A",
          "queryType": "range"
        }
      ],
      "title": "Success Rate",
      "type": "stat"
    },
    {
      "datasource": {
        "type": "loki",
        "uid": "P8E80F9AEF21F6940"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "thresholds" },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              { "color": "green", "value": null },
              { "color": "yellow", "value": 10 },
              { "color": "red", "value": 50 }
            ]
          },
          "unit": "short"
        },
        "overrides": []
      },
      "gridPos": { "h": 4, "w": 6, "x": 12, "y": 0 },
      "id": 3,
      "options": {
        "colorMode": "value",
        "graphMode": "area",
        "justifyMode": "auto",
        "orientation": "auto",
        "reduceOptions": {
          "calcs": ["lastNotNull"],
          "fields": "",
          "values": false
        },
        "textMode": "auto"
      },
      "pluginVersion": "12.3.1",
      "targets": [
        {
          "datasource": { "type": "loki", "uid": "P8E80F9AEF21F6940" },
          "expr": "sum(count_over_time({job=\"zeek-dns\"} | rcode_name=~\"NXDOMAIN|SERVFAIL|REFUSED\" [5m]))",
          "refId": "A",
          "queryType": "range"
        }
      ],
      "title": "Failed Queries (5m)",
      "type": "stat"
    },
    {
      "datasource": {
        "type": "loki",
        "uid": "P8E80F9AEF21F6940"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "palette-classic" },
          "custom": {
            "hideFrom": { "legend": false, "tooltip": false, "viz": false }
          },
          "mappings": []
        },
        "overrides": []
      },
      "gridPos": { "h": 8, "w": 6, "x": 18, "y": 0 },
      "id": 4,
      "options": {
        "legend": { "displayMode": "list", "placement": "bottom", "showLegend": true },
        "pieType": "donut",
        "reduceOptions": {
          "calcs": ["lastNotNull"],
          "fields": "",
          "values": false
        },
        "tooltip": { "maxHeight": 600, "mode": "single", "sort": "none" }
      },
      "pluginVersion": "12.3.1",
      "targets": [
        {
          "datasource": { "type": "loki", "uid": "P8E80F9AEF21F6940" },
          "expr": "sum by (rcode_name) (count_over_time({job=\"zeek-dns\"} | rcode_name=~\".+\" [$__interval]))",
          "legendFormat": "{{rcode_name}}",
          "refId": "A",
          "queryType": "range"
        }
      ],
      "title": "Response Codes",
      "type": "piechart"
    },
    {
      "datasource": {
        "type": "loki",
        "uid": "P8E80F9AEF21F6940"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "palette-classic" },
          "custom": {
            "axisBorderShow": false,
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "line",
            "fillOpacity": 20,
            "gradientMode": "none",
            "hideFrom": { "legend": false, "tooltip": false, "viz": false },
            "insertNulls": false,
            "lineInterpolation": "smooth",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": { "type": "linear" },
            "showPoints": "never",
            "spanNulls": false,
            "stacking": { "group": "A", "mode": "normal" },
            "thresholdsStyle": { "mode": "off" }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [{ "color": "green", "value": null }]
          },
          "unit": "short"
        },
        "overrides": []
      },
      "gridPos": { "h": 8, "w": 12, "x": 0, "y": 4 },
      "id": 5,
      "options": {
        "legend": {
          "calcs": ["sum"],
          "displayMode": "table",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": { "maxHeight": 600, "mode": "multi", "sort": "desc" }
      },
      "pluginVersion": "12.3.1",
      "targets": [
        {
          "datasource": { "type": "loki", "uid": "P8E80F9AEF21F6940" },
          "expr": "sum by (rcode_name) (count_over_time({job=\"zeek-dns\"} | rcode_name=~\".+\" [$__interval]))",
          "legendFormat": "{{rcode_name}}",
          "refId": "A",
          "queryType": "range"
        }
      ],
      "title": "Query Volume by Response Code",
      "type": "timeseries"
    },
    {
      "datasource": {
        "type": "loki",
        "uid": "P8E80F9AEF21F6940"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "palette-classic" },
          "custom": {
            "axisBorderShow": false,
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "bars",
            "fillOpacity": 80,
            "gradientMode": "none",
            "hideFrom": { "legend": false, "tooltip": false, "viz": false },
            "insertNulls": false,
            "lineInterpolation": "smooth",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": { "type": "linear" },
            "showPoints": "never",
            "spanNulls": false,
            "stacking": { "group": "A", "mode": "none" },
            "thresholdsStyle": { "mode": "off" }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [{ "color": "green", "value": null }]
          },
          "unit": "short"
        },
        "overrides": []
      },
      "gridPos": { "h": 8, "w": 12, "x": 12, "y": 12 },
      "id": 6,
      "options": {
        "legend": {
          "calcs": ["sum"],
          "displayMode": "table",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": { "maxHeight": 600, "mode": "multi", "sort": "desc" }
      },
      "pluginVersion": "12.3.1",
      "targets": [
        {
          "datasource": { "type": "loki", "uid": "P8E80F9AEF21F6940" },
          "expr": "topk(10, sum by (qtype_name) (count_over_time({job=\"zeek-dns\"} | qtype_name=~\".+\" [$__interval])))",
          "legendFormat": "{{qtype_name}}",
          "refId": "A",
          "queryType": "range"
        }
      ],
      "title": "Query Type Distribution",
      "type": "timeseries"
    },
    {
      "datasource": {
        "type": "loki",
        "uid": "P8E80F9AEF21F6940"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "palette-classic" },
          "custom": {
            "axisBorderShow": false,
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "bars",
            "fillOpacity": 80,
            "gradientMode": "none",
            "hideFrom": { "legend": false, "tooltip": false, "viz": false },
            "insertNulls": false,
            "lineInterpolation": "smooth",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": { "type": "linear" },
            "showPoints": "never",
            "spanNulls": false,
            "stacking": { "group": "A", "mode": "none" },
            "thresholdsStyle": { "mode": "off" }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [{ "color": "green", "value": null }]
          },
          "unit": "short"
        },
        "overrides": []
      },
      "gridPos": { "h": 8, "w": 12, "x": 0, "y": 12 },
      "id": 7,
      "options": {
        "legend": {
          "calcs": ["sum"],
          "displayMode": "table",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": { "maxHeight": 600, "mode": "multi", "sort": "desc" }
      },
      "pluginVersion": "12.3.1",
      "targets": [
        {
          "datasource": { "type": "loki", "uid": "P8E80F9AEF21F6940" },
          "expr": "topk(15, sum by (query) (count_over_time({job=\"zeek-dns\"} | query=~\".+\" [$__interval])))",
          "legendFormat": "{{query}}",
          "refId": "A",
          "queryType": "range"
        }
      ],
      "title": "Top Queried Domains",
      "type": "timeseries"
    },
    {
      "datasource": {
        "type": "loki",
        "uid": "P8E80F9AEF21F6940"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "palette-classic" },
          "custom": {
            "axisBorderShow": false,
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "bars",
            "fillOpacity": 80,
            "gradientMode": "none",
            "hideFrom": { "legend": false, "tooltip": false, "viz": false },
            "insertNulls": false,
            "lineInterpolation": "smooth",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": { "type": "linear" },
            "showPoints": "never",
            "spanNulls": false,
            "stacking": { "group": "A", "mode": "none" },
            "thresholdsStyle": { "mode": "off" }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [{ "color": "green", "value": null }]
          },
          "unit": "short"
        },
        "overrides": []
      },
      "gridPos": { "h": 8, "w": 12, "x": 0, "y": 20 },
      "id": 8,
      "options": {
        "legend": {
          "calcs": ["sum"],
          "displayMode": "table",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": { "maxHeight": 600, "mode": "multi", "sort": "desc" }
      },
      "pluginVersion": "12.3.1",
      "targets": [
        {
          "datasource": { "type": "loki", "uid": "P8E80F9AEF21F6940" },
          "expr": "topk(15, sum by (query) (count_over_time({job=\"zeek-dns\"} | rcode_name=\"NXDOMAIN\" | query=~\".+\" [$__interval])))",
          "legendFormat": "{{query}}",
          "refId": "A",
          "queryType": "range"
        }
      ],
      "title": "Top NXDOMAIN Queries",
      "type": "timeseries"
    },
    {
      "datasource": {
        "type": "loki",
        "uid": "P8E80F9AEF21F6940"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "palette-classic" },
          "custom": {
            "axisBorderShow": false,
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "bars",
            "fillOpacity": 80,
            "gradientMode": "none",
            "hideFrom": { "legend": false, "tooltip": false, "viz": false },
            "insertNulls": false,
            "lineInterpolation": "smooth",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": { "type": "linear" },
            "showPoints": "never",
            "spanNulls": false,
            "stacking": { "group": "A", "mode": "none" },
            "thresholdsStyle": { "mode": "off" }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [{ "color": "green", "value": null }]
          },
          "unit": "short"
        },
        "overrides": []
      },
      "gridPos": { "h": 8, "w": 12, "x": 12, "y": 20 },
      "id": 9,
      "options": {
        "legend": {
          "calcs": ["sum"],
          "displayMode": "table",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": { "maxHeight": 600, "mode": "multi", "sort": "desc" }
      },
      "pluginVersion": "12.3.1",
      "targets": [
        {
          "datasource": { "type": "loki", "uid": "P8E80F9AEF21F6940" },
          "expr": "topk(15, sum by (orig_h) (count_over_time({job=\"zeek-dns\"} | orig_h=~\".+\" [$__interval])))",
          "legendFormat": "{{orig_h}}",
          "refId": "A",
          "queryType": "range"
        }
      ],
      "title": "Top DNS Clients",
      "type": "timeseries"
    },
    {
      "datasource": {
        "type": "loki",
        "uid": "P8E80F9AEF21F6940"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "palette-classic" },
          "custom": {
            "axisBorderShow": false,
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "bars",
            "fillOpacity": 80,
            "gradientMode": "none",
            "hideFrom": { "legend": false, "tooltip": false, "viz": false },
            "insertNulls": false,
            "lineInterpolation": "smooth",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": { "type": "linear" },
            "showPoints": "never",
            "spanNulls": false,
            "stacking": { "group": "A", "mode": "none" },
            "thresholdsStyle": { "mode": "off" }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [{ "color": "green", "value": null }]
          },
          "unit": "short"
        },
        "overrides": []
      },
      "gridPos": { "h": 8, "w": 24, "x": 0, "y": 28 },
      "id": 10,
      "options": {
        "legend": {
          "calcs": ["sum"],
          "displayMode": "table",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": { "maxHeight": 600, "mode": "multi", "sort": "desc" }
      },
      "pluginVersion": "12.3.1",
      "targets": [
        {
          "datasource": { "type": "loki", "uid": "P8E80F9AEF21F6940" },
          "expr": "topk(5, sum by (resp_h) (count_over_time({job=\"zeek-dns\"} | resp_h=~\".+\" [$__interval])))",
          "legendFormat": "{{resp_h}}",
          "refId": "A",
          "queryType": "range"
        }
      ],
      "title": "DNS Servers Hit",
      "type": "timeseries"
    },
    {
      "datasource": {
        "type": "loki",
        "uid": "P8E80F9AEF21F6940"
      },
      "gridPos": { "h": 10, "w": 24, "x": 0, "y": 36 },
      "id": 11,
      "options": {
        "dedupStrategy": "none",
        "enableLogDetails": true,
        "prettifyLogMessage": false,
        "showCommonLabels": false,
        "showLabels": true,
        "showTime": true,
        "sortOrder": "Descending",
        "wrapLogMessage": true
      },
      "pluginVersion": "12.3.1",
      "targets": [
        {
          "datasource": { "type": "loki", "uid": "P8E80F9AEF21F6940" },
          "expr": "{job=\"zeek-dns\"}",
          "refId": "A",
          "queryType": "range"
        }
      ],
      "title": "DNS Query Log Stream",
      "type": "logs"
    }
  ],
  "schemaVersion": 39,
  "tags": ["loki", "dns", "firewalla", "zeek"],
  "templating": { "list": [] },
  "time": { "from": "now-1h", "to": "now" },
  "timepicker": {},
  "timezone": "browser",
  "title": "Firewalla DNS Analysis",
  "uid": "firewalla-dns-analysis",
  "version": 1,
  "weekStart": ""
}
```

**Step 2: Validate JSON syntax**

Run: `python3 -c "import json; json.load(open('infrastructure/grafana/dashboards/firewalla-dns-analysis.json')); print('OK')"` from repo root.
Expected: `OK`

**Step 3: Commit**

```bash
git add infrastructure/grafana/dashboards/firewalla-dns-analysis.json
git commit -m "feat: add Firewalla DNS analysis Grafana dashboard

Visualizes Zeek DNS logs from Loki with query rates, success rates,
NXDOMAIN tracking, response codes, query types, and top clients."
```

---

## Task 3: Create Network Security Dashboard

**Files:**
- Create: `infrastructure/grafana/dashboards/firewalla-network-security.json`

**Step 1: Create the dashboard JSON file**

Create `infrastructure/grafana/dashboards/firewalla-network-security.json` with this exact content:

```json
{
  "annotations": {
    "list": []
  },
  "editable": true,
  "fiscalYearStartMonth": 0,
  "graphTooltip": 1,
  "id": null,
  "links": [],
  "panels": [
    {
      "datasource": {
        "type": "loki",
        "uid": "P8E80F9AEF21F6940"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "thresholds" },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              { "color": "green", "value": null },
              { "color": "orange", "value": 10 },
              { "color": "red", "value": 50 }
            ]
          },
          "unit": "short"
        },
        "overrides": []
      },
      "gridPos": { "h": 4, "w": 8, "x": 0, "y": 0 },
      "id": 1,
      "options": {
        "colorMode": "value",
        "graphMode": "area",
        "justifyMode": "auto",
        "orientation": "auto",
        "reduceOptions": {
          "calcs": ["lastNotNull"],
          "fields": "",
          "values": false
        },
        "textMode": "auto"
      },
      "pluginVersion": "12.3.1",
      "targets": [
        {
          "datasource": { "type": "loki", "uid": "P8E80F9AEF21F6940" },
          "expr": "sum(count_over_time({job=\"zeek-conn\"} | conn_state=\"REJ\" [5m]))",
          "refId": "A",
          "queryType": "range"
        }
      ],
      "title": "Rejected Connections (5m)",
      "type": "stat"
    },
    {
      "datasource": {
        "type": "loki",
        "uid": "P8E80F9AEF21F6940"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "thresholds" },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              { "color": "green", "value": null },
              { "color": "orange", "value": 20 },
              { "color": "red", "value": 100 }
            ]
          },
          "unit": "short"
        },
        "overrides": []
      },
      "gridPos": { "h": 4, "w": 8, "x": 8, "y": 0 },
      "id": 2,
      "options": {
        "colorMode": "value",
        "graphMode": "area",
        "justifyMode": "auto",
        "orientation": "auto",
        "reduceOptions": {
          "calcs": ["lastNotNull"],
          "fields": "",
          "values": false
        },
        "textMode": "auto"
      },
      "pluginVersion": "12.3.1",
      "targets": [
        {
          "datasource": { "type": "loki", "uid": "P8E80F9AEF21F6940" },
          "expr": "sum(count_over_time({job=\"zeek-conn\"} | conn_state=\"S0\" [5m]))",
          "refId": "A",
          "queryType": "range"
        }
      ],
      "title": "Unanswered Connections (5m)",
      "type": "stat"
    },
    {
      "datasource": {
        "type": "loki",
        "uid": "P8E80F9AEF21F6940"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "thresholds" },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              { "color": "green", "value": null },
              { "color": "yellow", "value": 10 },
              { "color": "red", "value": 50 }
            ]
          },
          "unit": "short"
        },
        "overrides": []
      },
      "gridPos": { "h": 4, "w": 8, "x": 16, "y": 0 },
      "id": 3,
      "options": {
        "colorMode": "value",
        "graphMode": "area",
        "justifyMode": "auto",
        "orientation": "auto",
        "reduceOptions": {
          "calcs": ["lastNotNull"],
          "fields": "",
          "values": false
        },
        "textMode": "auto"
      },
      "pluginVersion": "12.3.1",
      "targets": [
        {
          "datasource": { "type": "loki", "uid": "P8E80F9AEF21F6940" },
          "expr": "sum(count_over_time({job=\"zeek-dns\"} | rcode_name=~\"NXDOMAIN|SERVFAIL|REFUSED\" [5m]))",
          "refId": "A",
          "queryType": "range"
        }
      ],
      "title": "DNS Failures (5m)",
      "type": "stat"
    },
    {
      "datasource": {
        "type": "loki",
        "uid": "P8E80F9AEF21F6940"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "palette-classic" },
          "custom": {
            "axisBorderShow": false,
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "line",
            "fillOpacity": 20,
            "gradientMode": "none",
            "hideFrom": { "legend": false, "tooltip": false, "viz": false },
            "insertNulls": false,
            "lineInterpolation": "smooth",
            "lineWidth": 2,
            "pointSize": 5,
            "scaleDistribution": { "type": "linear" },
            "showPoints": "never",
            "spanNulls": false,
            "stacking": { "group": "A", "mode": "none" },
            "thresholdsStyle": { "mode": "off" }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [{ "color": "green", "value": null }]
          },
          "unit": "short"
        },
        "overrides": [
          {
            "matcher": { "id": "byName", "options": "Rejected (REJ)" },
            "properties": [
              { "id": "color", "value": { "fixedColor": "red", "mode": "fixed" } }
            ]
          },
          {
            "matcher": { "id": "byName", "options": "Unanswered (S0)" },
            "properties": [
              { "id": "color", "value": { "fixedColor": "orange", "mode": "fixed" } }
            ]
          }
        ]
      },
      "gridPos": { "h": 8, "w": 12, "x": 0, "y": 4 },
      "id": 4,
      "options": {
        "legend": {
          "calcs": ["sum", "max"],
          "displayMode": "table",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": { "maxHeight": 600, "mode": "multi", "sort": "desc" }
      },
      "pluginVersion": "12.3.1",
      "targets": [
        {
          "datasource": { "type": "loki", "uid": "P8E80F9AEF21F6940" },
          "expr": "sum(count_over_time({job=\"zeek-conn\"} | conn_state=\"REJ\" [$__interval]))",
          "legendFormat": "Rejected (REJ)",
          "refId": "A",
          "queryType": "range"
        },
        {
          "datasource": { "type": "loki", "uid": "P8E80F9AEF21F6940" },
          "expr": "sum(count_over_time({job=\"zeek-conn\"} | conn_state=\"S0\" [$__interval]))",
          "legendFormat": "Unanswered (S0)",
          "refId": "B",
          "queryType": "range"
        }
      ],
      "title": "Anomalous Connection Rate",
      "type": "timeseries"
    },
    {
      "datasource": {
        "type": "loki",
        "uid": "P8E80F9AEF21F6940"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "palette-classic" },
          "custom": {
            "axisBorderShow": false,
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "bars",
            "fillOpacity": 80,
            "gradientMode": "none",
            "hideFrom": { "legend": false, "tooltip": false, "viz": false },
            "insertNulls": false,
            "lineInterpolation": "smooth",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": { "type": "linear" },
            "showPoints": "never",
            "spanNulls": false,
            "stacking": { "group": "A", "mode": "none" },
            "thresholdsStyle": { "mode": "off" }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [{ "color": "green", "value": null }]
          },
          "unit": "short"
        },
        "overrides": []
      },
      "gridPos": { "h": 8, "w": 12, "x": 12, "y": 4 },
      "id": 5,
      "options": {
        "legend": {
          "calcs": ["sum"],
          "displayMode": "table",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": { "maxHeight": 600, "mode": "multi", "sort": "desc" }
      },
      "pluginVersion": "12.3.1",
      "targets": [
        {
          "datasource": { "type": "loki", "uid": "P8E80F9AEF21F6940" },
          "expr": "topk(10, sum by (resp_p) (count_over_time({job=\"zeek-conn\"} | resp_p!=\"80\" | resp_p!=\"443\" | resp_p!=\"53\" | resp_p!=\"22\" | resp_p!=\"8080\" | resp_p!=\"8443\" | resp_p!=\"3100\" | resp_p!=\"1883\" | resp_p=~\".+\" [$__interval])))",
          "legendFormat": "port {{resp_p}}",
          "refId": "A",
          "queryType": "range"
        }
      ],
      "title": "Unusual Outbound Ports",
      "type": "timeseries"
    },
    {
      "datasource": {
        "type": "loki",
        "uid": "P8E80F9AEF21F6940"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "palette-classic" },
          "custom": {
            "axisBorderShow": false,
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "bars",
            "fillOpacity": 80,
            "gradientMode": "none",
            "hideFrom": { "legend": false, "tooltip": false, "viz": false },
            "insertNulls": false,
            "lineInterpolation": "smooth",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": { "type": "linear" },
            "showPoints": "never",
            "spanNulls": false,
            "stacking": { "group": "A", "mode": "none" },
            "thresholdsStyle": { "mode": "off" }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [{ "color": "green", "value": null }]
          },
          "unit": "short"
        },
        "overrides": []
      },
      "gridPos": { "h": 8, "w": 12, "x": 0, "y": 12 },
      "id": 6,
      "options": {
        "legend": {
          "calcs": ["sum"],
          "displayMode": "table",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": { "maxHeight": 600, "mode": "multi", "sort": "desc" }
      },
      "pluginVersion": "12.3.1",
      "targets": [
        {
          "datasource": { "type": "loki", "uid": "P8E80F9AEF21F6940" },
          "expr": "topk(10, sum by (orig_h) (count_over_time({job=\"zeek-conn\"} | conn_state=\"REJ\" | orig_h=~\".+\" [$__interval])))",
          "legendFormat": "{{orig_h}}",
          "refId": "A",
          "queryType": "range"
        }
      ],
      "title": "Top Rejected Sources",
      "type": "timeseries"
    },
    {
      "datasource": {
        "type": "loki",
        "uid": "P8E80F9AEF21F6940"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "palette-classic" },
          "custom": {
            "axisBorderShow": false,
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "bars",
            "fillOpacity": 80,
            "gradientMode": "none",
            "hideFrom": { "legend": false, "tooltip": false, "viz": false },
            "insertNulls": false,
            "lineInterpolation": "smooth",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": { "type": "linear" },
            "showPoints": "never",
            "spanNulls": false,
            "stacking": { "group": "A", "mode": "none" },
            "thresholdsStyle": { "mode": "off" }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [{ "color": "green", "value": null }]
          },
          "unit": "short"
        },
        "overrides": []
      },
      "gridPos": { "h": 8, "w": 12, "x": 12, "y": 12 },
      "id": 7,
      "options": {
        "legend": {
          "calcs": ["sum"],
          "displayMode": "table",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": { "maxHeight": 600, "mode": "multi", "sort": "desc" }
      },
      "pluginVersion": "12.3.1",
      "targets": [
        {
          "datasource": { "type": "loki", "uid": "P8E80F9AEF21F6940" },
          "expr": "topk(10, sum by (resp_h) (count_over_time({job=\"zeek-conn\"} | conn_state=\"S0\" | resp_h=~\".+\" [$__interval])))",
          "legendFormat": "{{resp_h}}",
          "refId": "A",
          "queryType": "range"
        }
      ],
      "title": "Top Unanswered Destinations",
      "type": "timeseries"
    },
    {
      "datasource": {
        "type": "loki",
        "uid": "P8E80F9AEF21F6940"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "palette-classic" },
          "custom": {
            "axisBorderShow": false,
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "bars",
            "fillOpacity": 80,
            "gradientMode": "none",
            "hideFrom": { "legend": false, "tooltip": false, "viz": false },
            "insertNulls": false,
            "lineInterpolation": "smooth",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": { "type": "linear" },
            "showPoints": "never",
            "spanNulls": false,
            "stacking": { "group": "A", "mode": "none" },
            "thresholdsStyle": { "mode": "off" }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [{ "color": "green", "value": null }]
          },
          "unit": "short"
        },
        "overrides": []
      },
      "gridPos": { "h": 8, "w": 12, "x": 0, "y": 20 },
      "id": 8,
      "options": {
        "legend": {
          "calcs": ["sum"],
          "displayMode": "table",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": { "maxHeight": 600, "mode": "multi", "sort": "desc" }
      },
      "pluginVersion": "12.3.1",
      "targets": [
        {
          "datasource": { "type": "loki", "uid": "P8E80F9AEF21F6940" },
          "expr": "topk(10, sum by (orig_h) (count_over_time({job=\"zeek-conn\"} | orig_h=~\".+\" [5m])))",
          "legendFormat": "{{orig_h}}",
          "refId": "A",
          "queryType": "range"
        }
      ],
      "title": "High Connection Rate Sources",
      "type": "timeseries"
    },
    {
      "datasource": {
        "type": "loki",
        "uid": "P8E80F9AEF21F6940"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "palette-classic" },
          "custom": {
            "axisBorderShow": false,
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "bars",
            "fillOpacity": 80,
            "gradientMode": "none",
            "hideFrom": { "legend": false, "tooltip": false, "viz": false },
            "insertNulls": false,
            "lineInterpolation": "smooth",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": { "type": "linear" },
            "showPoints": "never",
            "spanNulls": false,
            "stacking": { "group": "A", "mode": "none" },
            "thresholdsStyle": { "mode": "off" }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [{ "color": "green", "value": null }]
          },
          "unit": "short"
        },
        "overrides": []
      },
      "gridPos": { "h": 8, "w": 12, "x": 12, "y": 20 },
      "id": 9,
      "options": {
        "legend": {
          "calcs": ["sum"],
          "displayMode": "table",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": { "maxHeight": 600, "mode": "multi", "sort": "desc" }
      },
      "pluginVersion": "12.3.1",
      "targets": [
        {
          "datasource": { "type": "loki", "uid": "P8E80F9AEF21F6940" },
          "expr": "topk(10, sum by (orig_h) (count_over_time({job=\"zeek-dns\"} | rcode_name=\"NXDOMAIN\" | orig_h=~\".+\" [$__interval])))",
          "legendFormat": "{{orig_h}}",
          "refId": "A",
          "queryType": "range"
        }
      ],
      "title": "NXDOMAIN Repeat Offenders",
      "type": "timeseries"
    },
    {
      "datasource": {
        "type": "loki",
        "uid": "P8E80F9AEF21F6940"
      },
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "palette-classic" },
          "custom": {
            "axisBorderShow": false,
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "bars",
            "fillOpacity": 80,
            "gradientMode": "none",
            "hideFrom": { "legend": false, "tooltip": false, "viz": false },
            "insertNulls": false,
            "lineInterpolation": "smooth",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": { "type": "linear" },
            "showPoints": "never",
            "spanNulls": false,
            "stacking": { "group": "A", "mode": "none" },
            "thresholdsStyle": { "mode": "off" }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [{ "color": "green", "value": null }]
          },
          "unit": "short"
        },
        "overrides": []
      },
      "gridPos": { "h": 8, "w": 24, "x": 0, "y": 28 },
      "id": 10,
      "options": {
        "legend": {
          "calcs": ["sum"],
          "displayMode": "table",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": { "maxHeight": 600, "mode": "multi", "sort": "desc" }
      },
      "pluginVersion": "12.3.1",
      "targets": [
        {
          "datasource": { "type": "loki", "uid": "P8E80F9AEF21F6940" },
          "expr": "topk(5, sum by (resp_h) (count_over_time({job=\"zeek-dns\"} | resp_h!=\"192.168.1.224\" | resp_h!=\"192.168.1.253\" | resp_h=~\".+\" [$__interval])))",
          "legendFormat": "{{resp_h}}",
          "refId": "A",
          "queryType": "range"
        }
      ],
      "title": "Non-Standard DNS Servers",
      "type": "timeseries"
    },
    {
      "datasource": {
        "type": "loki",
        "uid": "P8E80F9AEF21F6940"
      },
      "gridPos": { "h": 10, "w": 24, "x": 0, "y": 36 },
      "id": 11,
      "options": {
        "dedupStrategy": "none",
        "enableLogDetails": true,
        "prettifyLogMessage": false,
        "showCommonLabels": false,
        "showLabels": true,
        "showTime": true,
        "sortOrder": "Descending",
        "wrapLogMessage": true
      },
      "pluginVersion": "12.3.1",
      "targets": [
        {
          "datasource": { "type": "loki", "uid": "P8E80F9AEF21F6940" },
          "expr": "{job=\"zeek-conn\"} | conn_state=~\"REJ|S0\"",
          "refId": "A",
          "queryType": "range"
        }
      ],
      "title": "Security Event Log Stream",
      "type": "logs"
    }
  ],
  "schemaVersion": 39,
  "tags": ["loki", "security", "firewalla", "zeek"],
  "templating": { "list": [] },
  "time": { "from": "now-1h", "to": "now" },
  "timepicker": {},
  "timezone": "browser",
  "title": "Firewalla Network Security",
  "uid": "firewalla-network-security",
  "version": 1,
  "weekStart": ""
}
```

**Step 2: Validate JSON syntax**

Run: `python3 -c "import json; json.load(open('infrastructure/grafana/dashboards/firewalla-network-security.json')); print('OK')"` from repo root.
Expected: `OK`

**Step 3: Commit**

```bash
git add infrastructure/grafana/dashboards/firewalla-network-security.json
git commit -m "feat: add Firewalla network security Grafana dashboard

Monitors rejected/unanswered connections, unusual ports, non-standard
DNS servers, NXDOMAIN repeat offenders, and high connection rate sources."
```

---

## Task 4: Deploy dashboards to Grafana

**Step 1: Copy all three dashboard files to Grafana container**

```bash
ssh root@192.168.1.137 "pct exec 101 -- mkdir -p /var/lib/grafana/dashboards"
for f in firewalla-network-overview.json firewalla-dns-analysis.json firewalla-network-security.json; do
  scp infrastructure/grafana/dashboards/$f root@192.168.1.137:/tmp/$f
  ssh root@192.168.1.137 "pct push 101 /tmp/$f /var/lib/grafana/dashboards/$f && rm /tmp/$f"
done
```

**Step 2: Verify dashboards loaded**

Wait 30 seconds (provisioner poll interval), then check Grafana API:

```bash
ssh root@192.168.1.137 "pct exec 101 -- curl -s http://localhost:3000/api/search?tag=firewalla" | python3 -m json.tool
```

Expected: JSON array with 3 dashboard entries (firewalla-network-overview, firewalla-dns-analysis, firewalla-network-security).

**Step 3: Smoke test each dashboard**

Open in browser:
- `https://grafana.internal.lakehouse.wtf/d/firewalla-network-overview`
- `https://grafana.internal.lakehouse.wtf/d/firewalla-dns-analysis`
- `https://grafana.internal.lakehouse.wtf/d/firewalla-network-security`

Verify each dashboard loads and shows data (not "No data" on all panels). If panels show "No data", check that Zeek logs are flowing:

```bash
curl -s "http://192.168.1.170:3100/loki/api/v1/label/job/values" | python3 -m json.tool | grep zeek
```

Expected: `"zeek-conn"` and `"zeek-dns"` in output.

**Step 4: Final commit and push**

```bash
git pushx
```
