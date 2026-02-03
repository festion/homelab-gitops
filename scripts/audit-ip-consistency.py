#!/usr/bin/env python3
"""
IP Address Consistency Audit Script

Audits IP addresses across three systems to detect mismatches:
1. Traefik services (services.yml)
2. Kea DHCP reservations
3. AdGuard DNS rewrites
4. Live container IPs from Proxmox

Generates a markdown report with color-coded status.
"""

import argparse
import base64
import json
import os
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path

import requests
import yaml

# --- Configuration ---
TRAEFIK_SERVICES_PATH = Path(__file__).parent.parent / "infrastructure/traefik/config/dynamic/services.yml"
REPORT_OUTPUT_PATH = Path(__file__).parent.parent / "docs/IP_AUDIT_REPORT.md"
LOG_DIR = Path("/opt/gitops/logs") if Path("/opt/gitops").exists() else Path(__file__).parent.parent / "logs"

# Kea DHCP servers
KEA_PRIMARY = "192.168.1.133"
KEA_SECONDARY = "192.168.1.134"

# AdGuard DNS
ADGUARD_HOST = "192.168.1.253"
ADGUARD_PORT = "80"
ADGUARD_USER = "root"
ADGUARD_PASS = "redflower805"

# Traefik IP (all internal DNS should point here)
TRAEFIK_IP = "192.168.1.110"

# Proxmox hosts
PROXMOX_HOSTS = ["192.168.1.137", "192.168.1.125", "192.168.1.126"]

# Physical hosts/services (skip container IP matching for these)
PHYSICAL_SERVICES = [
    "proxmox-service",
    "proxmox2-service",
    "proxmox3-service",
    "truenas-service",
    "omada-service",   # Omada controller is a physical device
]

# Ensure log directory exists
LOG_DIR.mkdir(parents=True, exist_ok=True)


def log(msg, level="INFO"):
    """Log message with timestamp."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] [{level}] {msg}")


def parse_traefik_services():
    """Parse Traefik services.yml to extract service IPs."""
    services = {}

    if not TRAEFIK_SERVICES_PATH.exists():
        log(f"Traefik services file not found: {TRAEFIK_SERVICES_PATH}", "ERROR")
        return services

    with open(TRAEFIK_SERVICES_PATH) as f:
        data = yaml.safe_load(f)

    http_services = data.get("http", {}).get("services", {})

    for service_name, config in http_services.items():
        lb = config.get("loadBalancer", {})
        servers = lb.get("servers", [])
        if servers:
            url = servers[0].get("url", "")
            # Extract IP and port from URL like http://192.168.1.74:8086
            match = re.match(r'https?://([^:/]+):?(\d+)?', url)
            if match:
                ip = match.group(1)
                port = match.group(2) or "80"
                # Skip localhost
                if ip != "localhost":
                    services[service_name] = {
                        "ip": ip,
                        "port": port,
                        "url": url
                    }

    log(f"Parsed {len(services)} services from Traefik config")
    return services


def get_kea_reservations():
    """Fetch DHCP reservations from Kea primary server via SSH."""
    reservations = {}

    try:
        cmd = f'ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no root@{KEA_PRIMARY} "cat /etc/kea/kea-dhcp4.conf"'
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)

        if result.returncode != 0:
            log(f"Failed to fetch Kea config: {result.stderr}", "ERROR")
            return reservations

        config_text = result.stdout

        # Parse reservations - look for hw-address and ip-address pairs
        # Format: "hw-address": "xx:xx:xx:xx:xx:xx"
        #         "ip-address": "192.168.1.xxx"
        #         "hostname": "name"

        # Simple regex-based parsing for reservation blocks
        reservation_pattern = r'"hw-address":\s*"([^"]+)"[^}]*?"ip-address":\s*"([^"]+)"[^}]*?(?:"hostname":\s*"([^"]+)")?'
        matches = re.findall(reservation_pattern, config_text, re.DOTALL)

        for mac, ip, hostname in matches:
            hostname = hostname if hostname else f"unknown-{mac.replace(':', '')[-6:]}"
            reservations[ip] = {
                "mac": mac.lower(),
                "hostname": hostname.lower()
            }

        log(f"Parsed {len(reservations)} DHCP reservations from Kea")

    except subprocess.TimeoutExpired:
        log("Timeout fetching Kea reservations", "ERROR")
    except Exception as e:
        log(f"Error fetching Kea reservations: {e}", "ERROR")

    return reservations


def get_adguard_rewrites():
    """Fetch DNS rewrites from AdGuard API."""
    rewrites = {}

    try:
        api_url = f"http://{ADGUARD_HOST}:{ADGUARD_PORT}/control/rewrite/list"
        auth = base64.b64encode(f"{ADGUARD_USER}:{ADGUARD_PASS}".encode()).decode()
        headers = {
            "Authorization": f"Basic {auth}",
            "Content-Type": "application/json"
        }

        response = requests.get(api_url, headers=headers, timeout=10)
        response.raise_for_status()

        for entry in response.json():
            domain = entry.get("domain", "").lower()
            answer = entry.get("answer", "")
            if domain.endswith(".internal.lakehouse.wtf"):
                rewrites[domain] = answer

        log(f"Fetched {len(rewrites)} DNS rewrites from AdGuard")

    except Exception as e:
        log(f"Error fetching AdGuard rewrites: {e}", "ERROR")

    return rewrites


def get_live_container_ips():
    """Get live container IPs from Proxmox hosts via SSH."""
    live_ips = {}

    for host in PROXMOX_HOSTS:
        try:
            # Get container list with IPs from tags
            cmd = f'ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no root@{host} "pct list" 2>/dev/null'
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)

            if result.returncode != 0:
                continue

            # Parse pct list output
            for line in result.stdout.strip().split('\n')[1:]:  # Skip header
                parts = line.split()
                if len(parts) >= 3:
                    vmid = parts[0]
                    status = parts[1]
                    name = parts[2]

                    if status == "running":
                        # Get IP from container config tags
                        cmd_config = f'ssh -o ConnectTimeout=5 root@{host} "pct config {vmid}" 2>/dev/null | grep -E "^tags:"'
                        result_config = subprocess.run(cmd_config, shell=True, capture_output=True, text=True, timeout=10)

                        if result_config.returncode == 0:
                            tags = result_config.stdout.strip()
                            # Extract IP from tags like "tags: 192.168.1.74;community-script"
                            ip_match = re.search(r'192\.168\.1\.\d+', tags)
                            if ip_match:
                                live_ips[name.lower()] = {
                                    "ip": ip_match.group(),
                                    "host": host,
                                    "vmid": vmid
                                }

        except Exception as e:
            log(f"Error querying Proxmox host {host}: {e}", "WARNING")

    log(f"Found {len(live_ips)} live container IPs from Proxmox")
    return live_ips


def cross_reference_data(traefik_services, dhcp_reservations, dns_rewrites, live_ips):
    """Cross-reference all data sources and identify issues."""
    results = {
        "green": [],    # All consistent
        "yellow": [],   # Missing DHCP reservation
        "red": [],      # IP mismatch
        "info": []      # Additional info
    }

    for service_name, service_data in sorted(traefik_services.items()):
        traefik_ip = service_data["ip"]

        # Extract base name for DNS lookup (remove -service suffix)
        base_name = service_name.replace("-service", "")
        dns_domain = f"{base_name}.internal.lakehouse.wtf"

        # Check DHCP reservation
        has_dhcp = traefik_ip in dhcp_reservations
        dhcp_hostname = dhcp_reservations.get(traefik_ip, {}).get("hostname", "N/A")

        # Check DNS rewrite
        dns_target = dns_rewrites.get(dns_domain, "N/A")
        dns_ok = dns_target == TRAEFIK_IP

        # Check live IP (find matching container)
        # Skip physical hosts - they're not containers
        live_info = None
        if service_name not in PHYSICAL_SERVICES:
            # First pass: look for exact match
            for container_name, container_data in live_ips.items():
                if container_name == base_name.lower():
                    live_info = container_data
                    break

            # Second pass: try partial match only if no exact match found
            if not live_info:
                for container_name, container_data in live_ips.items():
                    # Skip containers with suffixes like -sync, -standby, -2
                    if "-" in container_name and container_name.split("-")[0] != base_name.lower():
                        if base_name.lower() in container_name:
                            continue  # Skip partial matches that have extra suffixes
                    if len(base_name) >= 4 and base_name.lower() in container_name:
                        live_info = container_data
                        break

        live_ip = live_info["ip"] if live_info else "N/A"
        ip_match = live_ip == traefik_ip or live_ip == "N/A"

        # Determine status
        entry = {
            "service": service_name,
            "traefik_ip": traefik_ip,
            "dhcp_reserved": has_dhcp,
            "dhcp_hostname": dhcp_hostname,
            "dns_domain": dns_domain,
            "dns_target": dns_target,
            "live_ip": live_ip,
            "port": service_data["port"]
        }

        if not has_dhcp:
            entry["issue"] = "Missing DHCP reservation"
            results["yellow"].append(entry)
        elif not ip_match and live_ip != "N/A":
            entry["issue"] = f"IP mismatch: Traefik={traefik_ip}, Live={live_ip}"
            results["red"].append(entry)
        else:
            entry["status"] = "OK"
            results["green"].append(entry)

    return results


def generate_report(results, traefik_services, dhcp_reservations):
    """Generate markdown report."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    total = len(traefik_services)
    green_count = len(results["green"])
    yellow_count = len(results["yellow"])
    red_count = len(results["red"])

    report = f"""# IP Address Consistency Audit Report

**Generated:** {timestamp}

## Summary

| Status | Count | Description |
|--------|-------|-------------|
| OK | {green_count} | All systems consistent |
| WARNING | {yellow_count} | Missing DHCP reservation |
| ERROR | {red_count} | IP mismatch detected |
| **Total** | **{total}** | Services audited |

---

"""

    # RED - Critical issues
    if results["red"]:
        report += "## ERRORS - IP Mismatches (Urgent Fix Required)\n\n"
        report += "| Service | Traefik IP | Live IP | Issue |\n"
        report += "|---------|------------|---------|-------|\n"
        for entry in results["red"]:
            report += f"| {entry['service']} | {entry['traefik_ip']} | {entry['live_ip']} | {entry['issue']} |\n"
        report += "\n---\n\n"

    # YELLOW - Warnings
    if results["yellow"]:
        report += "## WARNINGS - Missing DHCP Reservations\n\n"
        report += "These services should have DHCP reservations to prevent IP changes:\n\n"
        report += "| Service | IP Address | Port | Action Needed |\n"
        report += "|---------|------------|------|---------------|\n"
        for entry in results["yellow"]:
            report += f"| {entry['service']} | {entry['traefik_ip']} | {entry['port']} | Add DHCP reservation |\n"
        report += "\n---\n\n"

    # GREEN - All good
    if results["green"]:
        report += "## OK - Consistent Configuration\n\n"
        report += "| Service | IP Address | DHCP Reserved | DHCP Hostname |\n"
        report += "|---------|------------|---------------|---------------|\n"
        for entry in results["green"]:
            report += f"| {entry['service']} | {entry['traefik_ip']} | Yes | {entry['dhcp_hostname']} |\n"
        report += "\n---\n\n"

    # Statistics
    report += f"""## Audit Statistics

- **Traefik Services:** {len(traefik_services)}
- **DHCP Reservations:** {len(dhcp_reservations)}
- **Coverage:** {green_count}/{total} services have DHCP reservations ({100*green_count//total if total > 0 else 0}%)

---

## Recommended Actions

"""

    if results["red"]:
        report += "### Critical (Fix Immediately)\n\n"
        for entry in results["red"]:
            report += f"1. **{entry['service']}**: Update Traefik services.yml IP from `{entry['traefik_ip']}` to `{entry['live_ip']}`\n"
        report += "\n"

    if results["yellow"]:
        report += "### Important (Fix Soon)\n\n"
        for entry in results["yellow"]:
            report += f"1. **{entry['service']}**: Add DHCP reservation for IP `{entry['traefik_ip']}`\n"
        report += "\n"

    report += """---

*Report generated by `scripts/audit-ip-consistency.py`*
"""

    return report


def main():
    parser = argparse.ArgumentParser(
        description="Audit IP address consistency across Traefik, DHCP, and DNS."
    )
    parser.add_argument(
        "--output", "-o",
        default=str(REPORT_OUTPUT_PATH),
        help=f"Output path for report (default: {REPORT_OUTPUT_PATH})"
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output results as JSON instead of markdown"
    )
    parser.add_argument(
        "--quiet", "-q",
        action="store_true",
        help="Suppress progress output"
    )
    args = parser.parse_args()

    if args.quiet:
        global log
        log = lambda msg, level="INFO": None

    log("Starting IP consistency audit...")

    # Collect data from all sources
    log("Parsing Traefik services...")
    traefik_services = parse_traefik_services()

    log("Fetching Kea DHCP reservations...")
    dhcp_reservations = get_kea_reservations()

    log("Fetching AdGuard DNS rewrites...")
    dns_rewrites = get_adguard_rewrites()

    log("Querying live container IPs...")
    live_ips = get_live_container_ips()

    # Cross-reference and identify issues
    log("Cross-referencing data...")
    results = cross_reference_data(traefik_services, dhcp_reservations, dns_rewrites, live_ips)

    # Generate output
    if args.json:
        output = json.dumps({
            "timestamp": datetime.now().isoformat(),
            "results": results,
            "statistics": {
                "total_services": len(traefik_services),
                "ok": len(results["green"]),
                "warnings": len(results["yellow"]),
                "errors": len(results["red"])
            }
        }, indent=2)
        print(output)
    else:
        report = generate_report(results, traefik_services, dhcp_reservations)

        # Write report to file
        output_path = Path(args.output)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w") as f:
            f.write(report)

        log(f"Report written to: {output_path}")

        # Print summary
        print("\n" + "="*60)
        print("AUDIT SUMMARY")
        print("="*60)
        print(f"  OK:       {len(results['green'])} services")
        print(f"  WARNINGS: {len(results['yellow'])} missing DHCP reservations")
        print(f"  ERRORS:   {len(results['red'])} IP mismatches")
        print("="*60)

        if results["red"]:
            print("\nCRITICAL ISSUES FOUND - See report for details")
            sys.exit(1)
        elif results["yellow"]:
            print("\nWarnings found - Review report for recommended actions")
            sys.exit(0)
        else:
            print("\nAll systems consistent!")
            sys.exit(0)


if __name__ == "__main__":
    main()
