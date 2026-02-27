import argparse
import base64
import json
import os

import requests

# === Configuration ===
NPM_PROXY_PATH = "/opt/npm/data/nginx/proxy_host/"
ADGUARD_HOST = "192.168.1.253"
ADGUARD_PORT = "80"
ADGUARD_USER = "root"
ADGUARD_PASS = "redflower805"  # 🔒 replace with your actual password
ADGUARD_TARGET_IP = "192.168.1.95"  # NPM IP for internal rewrites

API_BASE = f"http://{ADGUARD_HOST}:{ADGUARD_PORT}/control"
HEADERS = {
    "Authorization": "Basic "
    + base64.b64encode(f"{ADGUARD_USER}:{ADGUARD_PASS}".encode()).decode(),
    "Content-Type": "application/json",
}


def get_current_rewrites():
    try:
        response = requests.get(f"{API_BASE}/rewrite/list", headers=HEADERS, timeout=5)
        response.raise_for_status()
        return {(entry["domain"], entry["answer"]) for entry in response.json()["data"]}
    except Exception as e:
        print(f"❌ Failed to fetch current rewrites: {e}")
        return set()


def get_internal_npm_domains():
    rewrites = set()
    if not os.path.exists(NPM_PROXY_PATH):
        print(f"❌ NPM proxy path not found: {NPM_PROXY_PATH}")
        return rewrites

    for file in os.listdir(NPM_PROXY_PATH):
        if file.endswith(".json"):
            with open(os.path.join(NPM_PROXY_PATH, file), "r") as f:
                try:
                    data = json.load(f)
                    for domain in data.get("domain_names", []):
                        if domain.endswith(".internal.lakehouse.wtf"):
                            rewrites.add((domain, ADGUARD_TARGET_IP))
                except json.JSONDecodeError:
                    continue
    return rewrites


def sync_rewrites(target_rewrites, current_rewrites, commit=False):
    to_add = target_rewrites - current_rewrites
    to_remove = current_rewrites - target_rewrites
    for domain, ip in sorted(to_add):
        print(f"{'🟢 Would add' if not commit else '➕ Adding'}: {domain} → {ip}")
        if commit:
            payload = {"domain": domain, "answer": ip}
            requests.post(f"{API_BASE}/rewrite/add", headers=HEADERS, json=payload)

    for domain, ip in sorted(to_remove):
        if domain.endswith(".internal.lakehouse.wtf"):
            print(f"{'🔴 Would remove' if not commit else '❌ Removing'}: {domain}")
            if commit:
                payload = {"domain": domain}
                requests.post(
                    f"{API_BASE}/rewrite/delete", headers=HEADERS, json=payload
                )


def main():
    parser = argparse.ArgumentParser(
        description="Sync AdGuard DNS rewrites from NPM internal domains."
    )
    parser.add_argument(
        "--commit", action="store_true", help="Apply changes (default is dry-run)"
    )
    args = parser.parse_args()

    current_rewrites = get_current_rewrites()
    desired_rewrites = get_internal_npm_domains()
    sync_rewrites(desired_rewrites, current_rewrites, commit=args.commit)


if __name__ == "__main__":
    main()
