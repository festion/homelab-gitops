#!/bin/bash
# setup-claude.sh - Symlink Claude resources from homelab-gitops repo
# Run this script on each machine after cloning the repo

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_RESOURCES="$SCRIPT_DIR/claude-resources"
CLAUDE_DIR="$HOME/.claude"

echo "Setting up Claude resources from: $CLAUDE_RESOURCES"
echo "Target Claude directory: $CLAUDE_DIR"
echo ""

# Create Claude config directory if it doesn't exist
mkdir -p "$CLAUDE_DIR"

# Backup existing settings if not already a symlink
if [ -f "$CLAUDE_DIR/settings.json" ] && [ ! -L "$CLAUDE_DIR/settings.json" ]; then
    echo "Backing up existing settings.json to settings.json.backup"
    mv "$CLAUDE_DIR/settings.json" "$CLAUDE_DIR/settings.json.backup"
fi

# Symlink settings.json
if [ -f "$CLAUDE_RESOURCES/settings/settings.json" ]; then
    ln -sf "$CLAUDE_RESOURCES/settings/settings.json" "$CLAUDE_DIR/settings.json"
    echo "✓ Linked settings.json"
fi

# Backup and symlink skills directory
if [ -d "$CLAUDE_DIR/skills" ] && [ ! -L "$CLAUDE_DIR/skills" ]; then
    echo "Backing up existing skills/ to skills.backup/"
    mv "$CLAUDE_DIR/skills" "$CLAUDE_DIR/skills.backup"
fi

# Symlink skills directory
if [ -d "$CLAUDE_RESOURCES/skills" ]; then
    ln -sf "$CLAUDE_RESOURCES/skills" "$CLAUDE_DIR/skills"
    echo "✓ Linked skills/"
fi

# Symlink commands directory (if it exists)
if [ -d "$CLAUDE_RESOURCES/commands" ]; then
    if [ -d "$CLAUDE_DIR/commands" ] && [ ! -L "$CLAUDE_DIR/commands" ]; then
        echo "Backing up existing commands/ to commands.backup/"
        mv "$CLAUDE_DIR/commands" "$CLAUDE_DIR/commands.backup"
    fi
    ln -sf "$CLAUDE_RESOURCES/commands" "$CLAUDE_DIR/commands"
    echo "✓ Linked commands/"
fi

echo ""
echo "Claude resources setup complete!"
echo ""
echo "Skills available:"
ls -1 "$CLAUDE_DIR/skills/" 2>/dev/null | grep -v "^packaged$" | sed 's/^/  - /'
echo ""
echo "Commands available:"
ls -1 "$CLAUDE_DIR/commands/"*.md 2>/dev/null | xargs -I {} basename {} .md | sed 's/^/  - \//' || echo "  (none yet)"
echo ""
echo "Note: .skill files for claude.ai are in: $CLAUDE_RESOURCES/skills/packaged/"
