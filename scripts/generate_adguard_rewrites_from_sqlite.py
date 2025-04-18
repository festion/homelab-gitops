import sqlite3
import os
import argparse
import requests
import base64
import json
from datetime import datetime

# --- Configuration ---
ADGUARD_HOST = "192.168.1.253"
ADGUARD_PORT = "80"
ADGUARD_USER = "root"
ADGUARD_PASS = "<see Infisical: GRAFANA_ADMIN_PASSWORD/INFLUXDB_ADMIN_PASSWORD - pre-rotation T5/T6>"
INTERNAL_TARGET_IP = "192.168.1.95"
SNAPSHOT_DIR = "/opt/gitops/npm_proxy_snapshot"
DRY_RUN_LOG = "/opt/gitops/.last_adguard_dry_run.json"
LOG_FILE = "/opt/gitops/logs/adguard_rewrite.log"

API_BASE = f"http://{ADGUARD_HOST}:{ADGUARD_PORT}/control"
HEADERS = {
    "Authorization": "Basic " + base64.b64encode(f"{ADGUARD_USER}:{ADGUARD_PASS}".encode()).decode(),
    "Content-Type": "application/json"
}

# Ensure log directory exists
os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)

def log(msg):
    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    full_msg = f"[{timestamp}] {msg}"
    print(full_msg)
    with open(LOG_FILE, "a") as log_file:
        log_file.write(full_msg + "\n")

def get_latest_sqlite_file():
    snapshots = sorted(os.listdir(SNAPSHOT_DIR))
    if not snapshots:
        raise RuntimeError("No snapshot directories found")
    latest_dir = os.path.join(SNAPSHOT_DIR, snapshots[-1])
    db_path = os.path.join(latest_dir, "database.sqlite")
    if not os.path.exists(db_path):
        raise RuntimeError("database.sqlite not found in latest snapshot")
    return db_path

def get_current_rewrites():
    try:
        response = requests.get(f"{API_BASE}/rewrite/list", headers=HEADERS, timeout=5)
        response.raise_for_status()
        return {(entry["domain"].lower(), entry["answer"]) for entry in response.json() if entry["domain"].lower().endswith(".internal.lakehouse.wtf")}
    except Exception as e:
        log(f"❌ Failed to fetch current rewrites: {e}")
        return set()

def get_internal_domains_from_sqlite(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT domain_names FROM proxy_host")
    rows = cursor.fetchall()
    conn.close()

    domains = set()
    for row in rows:
        try:
            raw = row[0]
            for domain in raw.replace('[', '').replace(']', '').replace('"', '').split(','):
                domain = domain.strip().lower()
                if domain.endswith(".internal.lakehouse.wtf"):
                    domains.add((domain, INTERNAL_TARGET_IP))
        except Exception:
            continue
    return domains

def write_dry_run_log(to_add, to_remove):
    log_data = {
        "to_add": list(to_add),
        "to_remove": list(to_remove),
        "timestamp": datetime.utcnow().isoformat()
    }
    with open(DRY_RUN_LOG, "w") as f:
        json.dump(log_data, f, indent=2)

def read_dry_run_log():
    if not os.path.exists(DRY_RUN_LOG):
        return None
    with open(DRY_RUN_LOG, "r") as f:
        data = json.load(f)
        to_add = set(tuple(x) for x in data.get("to_add", []))
        to_remove = set(tuple(x) for x in data.get("to_remove", []))
        return to_add, to_remove

def sync_rewrites(target_rewrites, current_rewrites, commit=False):
    if not commit:
        to_add = target_rewrites - current_rewrites
        to_remove = current_rewrites - target_rewrites

        for domain, ip in sorted(to_add):
            log(f"🟢 Would add: {domain} → {ip}")
        for domain, ip in sorted(to_remove):
            log(f"🔴 Would remove: {domain}")
        write_dry_run_log(to_add, to_remove)
        log(f"📋 Dry-run complete: {len(to_add)} additions, {len(to_remove)} removals.")
    else:
        dry_data = read_dry_run_log()
        if not dry_data:
            log("❌ Cannot run --commit without running a dry-run first.")
            return
        to_add, to_remove = dry_data

        for domain, ip in sorted(to_add):
            log(f"➕ Adding: {domain} → {ip}")
            payload = {"domain": domain, "answer": ip}
            requests.post(f"{API_BASE}/rewrite/add", headers=HEADERS, json=payload)

        for domain, ip in sorted(to_remove):
            log(f"❌ Removing: {domain}")
            payload = {"domain": domain}
            requests.post(f"{API_BASE}/rewrite/delete", headers=HEADERS, json=payload)

        # Cleanup dry-run file after successful commit
        try:
            os.remove(DRY_RUN_LOG)
            log("🧹 Removed dry-run log after commit.")
        except Exception as e:
            log(f"⚠️ Failed to remove dry-run log: {e}")

        log(f"✅ Sync complete: {len(to_add)} added, {len(to_remove)} removed.")

def main():
    parser = argparse.ArgumentParser(description="Generate AdGuard DNS rewrites from NPM database.")
    parser.add_argument("--commit", action="store_true", help="Apply changes to AdGuard")
    args = parser.parse_args()

    commit_mode = args.commit

    db_path = get_latest_sqlite_file()
    desired_rewrites = get_internal_domains_from_sqlite(db_path)
    current_rewrites = get_current_rewrites()
    sync_rewrites(desired_rewrites, current_rewrites, commit=commit_mode)

if __name__ == "__main__":
    main()
