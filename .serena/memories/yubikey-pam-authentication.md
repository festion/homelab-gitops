# YubiKey PAM Authentication Configuration

## Hardware
- **YubiKey**: Version 4 or 5 with OTP+U2F+CCID (Bus 003 Device 002: ID 1050:0407)
- **Authentication method**: FIDO U2F via `pam_u2f.so`

## Current Configuration (as of 2024-12-24)

| Service | File | Setting | Behavior |
|---------|------|---------|----------|
| Login screen (GDM) | `/etc/pam.d/gdm-password` | `sufficient` | YubiKey only |
| TTY login | `/etc/pam.d/login` | `sufficient` | YubiKey only |
| sudo | `/etc/pam.d/sudo` | `sufficient` | YubiKey only |
| SSH | `/etc/pam.d/sshd` | `required` | Password + YubiKey |

## Key Configuration Pattern

For YubiKey-only authentication, the `pam_u2f.so` line must:
1. Come **before** `@include common-auth`
2. Use `sufficient` instead of `required`

```
auth sufficient pam_u2f.so cue
@include common-auth
```

This means: If YubiKey succeeds, authentication is complete. If no YubiKey present, fall back to password.

For password + YubiKey (2FA), keep it **after** common-auth with `required`:
```
@include common-auth
auth required pam_u2f.so cue
```

## Backups
- `/etc/pam.d/gdm-password.bak`
- `/etc/pam.d/login.bak`
- `/etc/pam.d/backups-20251207/` (older backups)

## Troubleshooting
- If locked out, use TTY (Ctrl+Alt+F3) or boot to recovery mode
- Restore from `.bak` files if needed
- `grep -r u2f /etc/pam.d/` to check all U2F configurations
