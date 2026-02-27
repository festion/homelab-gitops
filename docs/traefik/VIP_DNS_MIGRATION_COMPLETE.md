# Traefik VIP DNS Migration — ARCHIVED

> **Status:** Retired (February 2026)
>
> The keepalived VIP (.101) was retired due to an IP conflict with a Roku TV.
> All `*.internal.lakehouse.wtf` entries reverted to 192.168.1.110 (Traefik direct).
> Keepalived is disabled on both Traefik containers (CT 110, CT 121).
>
> **Current DNS architecture:** See `operations/docs/network/dns-architecture.md`

This document previously detailed the January 2026 migration of 63 DNS rewrites
from Traefik's direct IP (.110) to a keepalived VIP (.101). The migration was
successful but the VIP was retired one month later. The full historical content
has been removed — see git history (`git log --follow VIP_DNS_MIGRATION_COMPLETE.md`)
if needed.
