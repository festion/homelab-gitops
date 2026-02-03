# PROJECT_INDEX.md Population Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create PROJECT_INDEX.md files for all workspace repositories to enable AI context refresh via gemini-index.sh

**Architecture:** Each repo gets a `.claude/PROJECT_INDEX.md` file containing structured metadata about the project: purpose, structure, key files, patterns, and entry points. A global `gemini-index.sh` script regenerates these indexes on demand.

**Tech Stack:** Bash, Markdown, Gemini CLI

---

## Repositories to Index

| Repo | Type | Priority |
|------|------|----------|
| homelab-gitops | Infrastructure/GitOps | High |
| home-assistant-config | Home Automation | High |
| operations | Runbooks/Scripts | High |
| dotfiles | Configuration | High |
| proxmox-agent | Python Service | Medium |
| netbox-agent | Python Service | Medium |
| birdnet-gone | Go Application | Medium |
| model-catalog | Web App | Medium |
| 1-line-deploy | Scripts | Low |
| seed2smoke | Application | Low |
| gw4-config-tool | Tool | Low |
| hass-ab-ble-gateway-suite | Integration | Low |
| serena | External Tool | Skip |

---

### Task 1: Create gemini-index.sh Script

**Files:**
- Create: `~/dotfiles/scripts/gemini-index.sh`
- Create: `~/.local/bin/gemini-index.sh` (symlink)

**Step 1: Create the indexer script**

```bash
#!/bin/bash
#
# gemini-index.sh - Generate PROJECT_INDEX.md for repositories
#
# Usage: gemini-index.sh [repo-path]
#   If no path provided, indexes current directory
#

set -e

REPO_PATH="${1:-$(pwd)}"
INDEX_FILE="$REPO_PATH/.claude/PROJECT_INDEX.md"

if [[ ! -d "$REPO_PATH/.git" ]]; then
    echo "Error: $REPO_PATH is not a git repository"
    exit 1
fi

mkdir -p "$REPO_PATH/.claude"

REPO_NAME=$(basename "$REPO_PATH")
GENERATED_DATE=$(date +%Y-%m-%d)

echo "Generating PROJECT_INDEX.md for $REPO_NAME..."

# Use gemini to analyze and generate the index
gemini --yolo -p "Analyze this repository and generate a PROJECT_INDEX.md file with the following structure:

# $REPO_NAME Project Index

Generated: $GENERATED_DATE

## Purpose
[One paragraph describing what this project does]

## Directory Structure
[Tree view of important directories with descriptions]

## Key Files
[List of important files with one-line descriptions]

## Architecture Patterns
[Key patterns, conventions, and architectural decisions]

## Entry Points
[Main files, scripts, or commands to start with]

## Dependencies
[Key external dependencies and integrations]

## Common Tasks
[How to build, test, deploy, etc.]

Be concise but comprehensive. Focus on what an AI assistant needs to know to work effectively in this codebase." > "$INDEX_FILE"

echo "Created $INDEX_FILE"
```

**Step 2: Make executable and create symlink**

```bash
chmod +x ~/dotfiles/scripts/gemini-index.sh
mkdir -p ~/.local/bin
ln -sf ~/dotfiles/scripts/gemini-index.sh ~/.local/bin/gemini-index.sh
```

**Step 3: Test the script**

```bash
gemini-index.sh ~/dotfiles
cat ~/dotfiles/.claude/PROJECT_INDEX.md
```

**Step 4: Commit**

```bash
cd ~/dotfiles
git add scripts/gemini-index.sh
git commit -m "feat: add gemini-index.sh for PROJECT_INDEX.md generation"
git push
```

---

### Task 2: Index homelab-gitops Repository

**Files:**
- Create: `~/workspace/homelab-gitops/.claude/PROJECT_INDEX.md`

**Step 1: Generate index**

```bash
cd ~/workspace/homelab-gitops
gemini-index.sh .
```

**Step 2: Review and refine**

Read the generated file and manually adjust if needed for accuracy.

**Step 3: Commit**

```bash
git add .claude/PROJECT_INDEX.md
git commit -m "docs: add PROJECT_INDEX.md for AI context"
git push
```

---

### Task 3: Index home-assistant-config Repository

**Files:**
- Create: `~/workspace/home-assistant-config/.claude/PROJECT_INDEX.md`

**Step 1: Generate index**

```bash
cd ~/workspace/home-assistant-config
gemini-index.sh .
```

**Step 2: Review and refine**

Ensure HA-specific patterns (packages, integrations, automations) are captured.

**Step 3: Commit**

```bash
git add .claude/PROJECT_INDEX.md
git commit -m "docs: add PROJECT_INDEX.md for AI context"
git push
```

---

### Task 4: Index operations Repository

**Files:**
- Create: `~/workspace/operations/.claude/PROJECT_INDEX.md`

**Step 1: Generate index**

```bash
cd ~/workspace/operations
gemini-index.sh .
```

**Step 2: Review and refine**

Focus on runbook structure and operational procedures.

**Step 3: Commit**

```bash
git add .claude/PROJECT_INDEX.md
git commit -m "docs: add PROJECT_INDEX.md for AI context"
git push
```

---

### Task 5: Index dotfiles Repository

**Files:**
- Create: `~/dotfiles/.claude/PROJECT_INDEX.md`

**Step 1: Generate index**

```bash
cd ~/dotfiles
gemini-index.sh .
```

**Step 2: Review and refine**

Document the symlink strategy and hook system.

**Step 3: Commit**

```bash
git add .claude/PROJECT_INDEX.md
git commit -m "docs: add PROJECT_INDEX.md for AI context"
git push
```

---

### Task 6: Index proxmox-agent Repository

**Files:**
- Create: `~/workspace/proxmox-agent/.claude/PROJECT_INDEX.md`

**Step 1: Generate index**

```bash
cd ~/workspace/proxmox-agent
gemini-index.sh .
```

**Step 2: Commit**

```bash
git add .claude/PROJECT_INDEX.md
git commit -m "docs: add PROJECT_INDEX.md for AI context"
git push
```

---

### Task 7: Index netbox-agent Repository

**Files:**
- Create: `~/workspace/netbox-agent/.claude/PROJECT_INDEX.md`

**Step 1: Generate index**

```bash
cd ~/workspace/netbox-agent
gemini-index.sh .
```

**Step 2: Commit**

```bash
git add .claude/PROJECT_INDEX.md
git commit -m "docs: add PROJECT_INDEX.md for AI context"
git push
```

---

### Task 8: Index birdnet-gone Repository

**Files:**
- Create: `~/workspace/birdnet-gone/.claude/PROJECT_INDEX.md`

**Step 1: Generate index**

```bash
cd ~/workspace/birdnet-gone
gemini-index.sh .
```

**Step 2: Commit**

```bash
git add .claude/PROJECT_INDEX.md
git commit -m "docs: add PROJECT_INDEX.md for AI context"
git push
```

---

### Task 9: Index model-catalog Repository

**Files:**
- Create: `~/workspace/model-catalog/.claude/PROJECT_INDEX.md`

**Step 1: Generate index**

```bash
cd ~/workspace/model-catalog
gemini-index.sh .
```

**Step 2: Commit**

```bash
git add .claude/PROJECT_INDEX.md
git commit -m "docs: add PROJECT_INDEX.md for AI context"
git push
```

---

### Task 10: Index Remaining Low-Priority Repos

**Files:**
- Create: `~/workspace/1-line-deploy/.claude/PROJECT_INDEX.md`
- Create: `~/workspace/seed2smoke/.claude/PROJECT_INDEX.md`
- Create: `~/workspace/gw4-config-tool/.claude/PROJECT_INDEX.md`
- Create: `~/workspace/hass-ab-ble-gateway-suite/.claude/PROJECT_INDEX.md`

**Step 1: Batch generate indexes**

```bash
for repo in 1-line-deploy seed2smoke gw4-config-tool hass-ab-ble-gateway-suite; do
    cd ~/workspace/$repo
    gemini-index.sh .
    git add .claude/PROJECT_INDEX.md
    git commit -m "docs: add PROJECT_INDEX.md for AI context"
    git push
done
```

---

## Completion Checklist

- [ ] gemini-index.sh script created and working
- [ ] homelab-gitops indexed
- [ ] home-assistant-config indexed
- [ ] operations indexed
- [ ] dotfiles indexed
- [ ] proxmox-agent indexed
- [ ] netbox-agent indexed
- [ ] birdnet-gone indexed
- [ ] model-catalog indexed
- [ ] Low-priority repos indexed
