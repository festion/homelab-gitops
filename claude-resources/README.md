# Claude Resources

Centralized Claude Code configuration, skills, and slash commands for the homelab environment.

## Structure

```
claude-resources/
├── skills/                    # Claude Code skills
│   ├── openscad-modeler/      # OpenSCAD 3D modeling assistant
│   ├── lxc-service-deployment/# LXC container deployment guide
│   └── packaged/              # .skill files for claude.ai web interface
├── commands/                  # Slash commands (.md files)
└── settings/
    ├── settings.json          # Shared Claude Code settings
    └── settings.local.json.example
```

## Setup

Run the setup script after cloning the repo:

```bash
./setup-claude.sh
```

This creates symlinks from `~/.claude/` to this repository:
- `~/.claude/settings.json` → `claude-resources/settings/settings.json`
- `~/.claude/skills/` → `claude-resources/skills/`
- `~/.claude/commands/` → `claude-resources/commands/`

## Adding New Skills

1. Create a directory under `skills/` with your skill name
2. Add a `SKILL.md` file with the skill definition
3. Optionally add a `references/` directory for supporting docs
4. For claude.ai, package as `.skill` file in `skills/packaged/`

## Adding Slash Commands

Create a `.md` file in `commands/`:

```markdown
# commands/deploy.md
Deploy the specified service to production using the standard LXC deployment workflow.
```

Then use as `/deploy` in Claude Code.

## Skills

### openscad-modeler
OpenSCAD 3D modeling assistant for creating and modifying parametric 3D models.

### lxc-service-deployment  
Guide for deploying services to LXC containers with Traefik integration.

## Related

- `mcp-servers/` - MCP server implementations (proxmox, truenas, wikijs, etc.)
- `.claude/` - Project-specific Claude configuration overrides
