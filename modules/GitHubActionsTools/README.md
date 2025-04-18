# GitHubActionsTools PowerShell Module

This module provides GitOps-friendly PowerShell tooling for managing GitHub Actions workflows.

## 📦 Module: `Remove-GitHubWorkflowRuns`

Deletes workflow runs from one or more GitHub repositories, with support for filtering by:
- Conclusion status
- Age (in days)
- Dry-run preview mode
- Skipping archived repositories

---

## 🧰 Requirements

- PowerShell 5.1 or later
- GitHub CLI (`gh`) installed and authenticated  
  👉 Run `gh auth login` if not already set up

---

## 🔧 Installation (Local)

```powershell
Import-Module "$PSScriptRoot\GitHubActionsTools.psd1"
