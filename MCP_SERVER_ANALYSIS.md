# MCP Server Analysis & Standardization Plan

## Current Structure Analysis

### Duplicates Identified

#### 1. Home Assistant Servers
- **`/home/dev/workspace/home-assistant-mcp-server/`** (ACTIVE - Full implementation)
  - Complete Python package with app/ directory
  - Docker support, tests, documentation
  - Virtual environment and dependencies
  - Git repository with development history
  
- **`/home/dev/workspace/mcp-servers/home-assistant-mcp-server/`** (EMPTY - Stub/placeholder)
  - Empty directory, appears to be placeholder

- **Wrapper Relationship**: 
  - `hass-mcp-wrapper.sh` → points to workspace root version
  - `home-assistant` (in MCP config) → same implementation, different wrapper

#### 2. Other Duplicates in Configuration
- **proxmox** vs **proxmox-mcp**: Same server, different config entries
- **wikijs** vs **wikijs-mcp**: Same server, different config entries  
- **serena** vs **serena-enhanced**: Different servers, but similar functionality

### Standard MCP Server Suite (Recommended)

#### Core Infrastructure Servers
1. **filesystem** - File system operations (Node.js)
2. **network-fs** - Network file system access
3. **serena-enhanced** - Code analysis and editing (Python)

#### Platform Integration Servers  
4. **home-assistant** - Smart home automation (Python)
5. **proxmox** - Virtualization management (Python)
6. **truenas** - NAS storage management (Python) 
7. **github** - Git repository operations (Node.js)
8. **wikijs** - Documentation management (Python)

#### Development & Utility Servers
9. **code-linter** - Code quality analysis
10. **directory-polling** - File system monitoring
11. **claude-auto-commit** - Automated git commits

### Directory Structure Optimization

#### Current Issues
- Mixed server locations (workspace root vs mcp-servers/)
- Empty placeholder directories
- Duplicate configurations
- Inconsistent naming (hass-mcp vs home-assistant)

#### Recommended Structure
```
/home/dev/workspace/
├── mcp-servers/                    # All MCP servers consolidated here
│   ├── home-assistant/            # Renamed from home-assistant-mcp-server
│   ├── proxmox/                   # Standardized name
│   ├── truenas/                   # Standardized name
│   ├── github/                    # Standardized name
│   ├── wikijs/                    # Standardized name
│   ├── code-linter/               # Standardized name
│   ├── directory-polling/         # Standardized name
│   ├── network-fs/                # Standardized name
│   └── claude-auto-commit/        # Standardized name
├── wrappers/                      # All wrapper scripts
│   ├── home-assistant-wrapper.sh
│   ├── proxmox-wrapper.sh
│   └── ...
└── configs/                       # Configuration files
    └── mcp-servers.json
```

### Configuration Cleanup Required

#### .claude.json Duplicates to Remove
- Multiple `mcpServers` sections across different project contexts
- Duplicate server names (proxmox/proxmox-mcp, wikijs/wikijs-mcp)
- Inconsistent command formats (bash vs direct execution)

#### Standardized Configuration Format
```json
{
  "mcpServers": {
    "home-assistant": {
      "type": "stdio",
      "command": "bash",
      "args": ["/home/dev/workspace/wrappers/home-assistant-wrapper.sh"],
      "env": {}
    }
  }
}
```

## Action Plan

### Phase 1: Consolidation
1. Move all active servers to `/home/dev/workspace/mcp-servers/`
2. Remove empty placeholder directories
3. Standardize server names (remove -mcp-server suffixes)

### Phase 2: Configuration Cleanup  
1. Consolidate duplicate .claude.json entries
2. Standardize wrapper script locations
3. Update all paths in wrappers

### Phase 3: Testing & Validation
1. Test each server individually
2. Validate no broken dependencies
3. Update documentation

## Impact Assessment

### Benefits
- Single source of truth for MCP servers
- Consistent naming and structure  
- Reduced configuration complexity
- Easier maintenance and updates

### Risks
- Potential path breakage during migration
- Wrapper script updates required
- Configuration file updates needed

### Mitigation
- Create backups before changes
- Update paths incrementally
- Test after each change