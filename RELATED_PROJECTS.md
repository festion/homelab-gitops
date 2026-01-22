# Related Projects

This document explains the relationship between homelab repositories and when to use each.

## Repository Overview

### homelab-gitops (this repository)
**GitHub:** https://github.com/festion/homelab-gitops

**Purpose:** GitOps platform for infrastructure automation, auditing, and deployment.

**Contains:**
- React dashboard frontend (`dashboard/`)
- Express.js API backend (`api/`)
- MCP servers (`mcp-servers/`)
  - Proxmox, TrueNAS, WikiJS, GitHub, Home Assistant, etc.
- Infrastructure configurations (`infrastructure/`)
  - `traefik/` - Reverse proxy configuration
  - `kea/` - DHCP server configuration
  - `grafana/` - Dashboards and alerting
  - `promtail/` - Log shipping configs
  - `cloudflare/` - DNS/CDN configuration
  - `node-red/` - Automation flows
- Deployment scripts and CI/CD

**Target Audience:** Automated systems, developers

**Deployment:** LXC container at `192.168.1.58`

---

### operations
**GitHub:** https://github.com/festion/operations

**Purpose:** Operational documentation and procedures for the homelab infrastructure.

**Contains:**
- Markdown documentation (synced to WikiJS)
- Runbooks and procedures
- Troubleshooting guides
- Alarm system documentation (DSC PC1616)
- Proxmox cluster documentation
- Utility scripts for auditing and DNS management

**Target Audience:** Humans reading documentation

**Deployment:** WikiJS sync at `wiki.internal.lakehouse.wtf/operations`

---

## Decision Guide

| Need to... | Use |
|------------|-----|
| Update Grafana alerts | homelab-gitops |
| Modify Traefik routes | homelab-gitops |
| Change DHCP reservations | homelab-gitops |
| Add monitoring dashboard | homelab-gitops |
| Deploy new MCP server | homelab-gitops |
| Write documentation | operations |
| Create a runbook | operations |
| Add troubleshooting guide | operations |
| Document a procedure | operations |

## Infrastructure Configurations

All infrastructure configurations live in this repository under `infrastructure/`:

```
infrastructure/
├── cloudflare/          # DNS and CDN configuration
├── grafana/
│   ├── dashboards/      # JSON dashboard definitions
│   └── provisioning/
│       ├── alerting/    # Alert rules and notification policies
│       └── dashboards/  # Dashboard provisioning
├── kea/                 # DHCP server configuration
├── monitoring/          # Prometheus and monitoring setup
├── node-red/            # Automation flows
├── promtail/            # Log shipping configuration
└── traefik/             # Reverse proxy configuration
    ├── config/
    │   └── dynamic/     # Dynamic routing config
    ├── monitoring/      # Traefik-specific monitoring
    └── systemd/         # Service configuration
```

## File Location Reference

| Content Type | Location |
|--------------|----------|
| Grafana alerting rules | `homelab-gitops/infrastructure/grafana/provisioning/alerting/` |
| Grafana dashboards | `homelab-gitops/infrastructure/grafana/dashboards/` |
| Traefik config | `homelab-gitops/infrastructure/traefik/` |
| Kea DHCP config | `homelab-gitops/infrastructure/kea/` |
| Promtail configs | `homelab-gitops/infrastructure/promtail/` |
| Node-RED flows | `homelab-gitops/infrastructure/node-red/` |
| Proxmox docs | `operations/docs/proxmox/` |
| Alarm system docs | `operations/docs/alarm-system/` |
| Troubleshooting guides | `operations/docs/troubleshooting/` |
| Runbooks | `operations/runbooks/` |
| Procedures | `operations/procedures/` |

## Migration History

**2026-01-22:** Consolidated infrastructure configs from `operations/configs/` to this repository:
- Grafana alerting rules now in `infrastructure/grafana/provisioning/alerting/`
- Notification policies added
- Cross-references established between repositories
