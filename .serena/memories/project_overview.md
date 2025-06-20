# Homelab GitOps Auditor - Project Overview

## Purpose
The Homelab GitOps Auditor is a comprehensive tool designed to monitor, audit, and visualize the health and status of Git repositories in a homelab GitOps environment. It helps identify issues such as uncommitted changes, stale branches, and missing files, presenting the results through an interactive dashboard.

## Key Features
- **Repository Health Monitoring**: Audits Git repositories for uncommitted changes, stale tags, and missing files
- **Interactive Dashboard**: React-based web interface with charts and visualizations
- **GitHub Sync**: Compares local repos with GitHub to identify missing/extra repos
- **DNS Sync Automation**: Handles automatic extraction of internal domains from Nginx Proxy Manager and generation of DNS rewrites for AdGuard Home
- **Auto-refreshing Data**: Live updates with configurable intervals
- **Repository Actions**: Clone missing repositories, delete extra repositories, commit or discard changes

## Architecture Components
1. **Dashboard Frontend** (`/dashboard/`): React-based web interface with charts and visualizations
2. **API Backend** (`/api/`): Express.js server providing API endpoints for dashboard operations
3. **Audit Scripts** (`/scripts/`): Repository synchronization, DNS sync, and deployment utilities
4. **Data Storage**: Audit reports stored as JSON and Markdown with historical snapshots

## Core Health Metrics
- **Clean**: Repository has no uncommitted changes
- **Dirty**: Repository has uncommitted local modifications  
- **Missing**: Repository exists on GitHub but not locally
- **Extra**: Repository exists locally but not on GitHub
- **Stale Tags**: Tags pointing to unreachable commits
- **Missing Files**: Key project files like README.md are absent

## Target Environment
- Designed for homelab GitOps environments
- Self-hosting on LXC containers, Proxmox, etc.
- Integration with AdGuard Home and Nginx Proxy Manager
- Supports both development and production deployments