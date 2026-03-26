# Project Index: homelab-gitops

## 1. Core Purpose

This project provides a GitOps framework for managing a homelab environment. It automates the deployment, configuration, and monitoring of various services through version-controlled infrastructure definitions. A key feature is the integration of an AI agent (Claude) with a WikiJS instance to automate documentation and content processing, managed by a custom Model Context Protocol (MCP).

## 2. Architecture

The system is a multi-component, service-oriented architecture designed for automated, Git-driven operations.

-   **Backend API (`/api`)**: A central Node.js application that orchestrates deployments, manages configurations, and integrates with various services like WikiJS and Infisical for secrets management. It exposes RESTful and WebSocket endpoints.
-   **Frontend Dashboard (`/dashboard`)**: A web-based user interface for monitoring the status of services, viewing deployment logs, and interacting with the system.
-   **Infrastructure (`/infrastructure`)**: Contains declarative configurations for core services managed by Docker Compose, including Traefik (reverse proxy), Prometheus/Grafana (monitoring), and other homelab applications.
-   **Automation & Tooling (`/scripts`, `/wrappers`)**: A collection of Bash and Python scripts that handle deployment pipelines, health checks, backups, system audits, and integration with external systems (e.g., Proxmox, TrueNAS).
-   **AI & Documentation (`/wikijs-ai-agent`, `mcp-servers`)**: A specialized set of services that connect the Claude AI model to the WikiJS platform. This includes content processors, sync agents, and MCP servers to standardize communication and data flow.

## 3. Key
