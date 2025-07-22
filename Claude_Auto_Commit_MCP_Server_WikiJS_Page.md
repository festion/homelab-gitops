---
title: Claude Auto-Commit MCP Server - Complete API Reference
description: Complete API reference and documentation for the Claude Auto-Commit MCP Server with comprehensive pre-commit review capabilities
published: true
date: 2025-01-22T15:14:00.000Z
tags: mcp, claude, git, automation, api-reference, pre-commit, ai
editor: markdown
---

# Claude Auto-Commit MCP Server - Complete API Reference

> **✨ NEW**: AI-powered Git commits with comprehensive pre-commit review using Claude authentication (username/password like Claude Code or API key)

## Overview

The Claude Auto-Commit MCP Server provides intelligent Git commit functionality powered by Claude AI with comprehensive pre-commit review capabilities. It supports both API key and username/password authentication methods.

## 🔧 Quick Setup

### Authentication Options
Choose **one** authentication method:

```bash
# Option A: Username/Password (like Claude Code)
export CLAUDE_USERNAME="your-email@example.com"
export CLAUDE_PASSWORD="your-password"

# Option B: API Key
export ANTHROPIC_API_KEY="sk-ant-api03-..."
```

### Server Configuration
- **Location**: `/home/dev/workspace/mcp-servers/claude-auto-commit-mcp-server/`
- **Wrapper**: `/home/dev/workspace/claude-auto-commit-wrapper.sh`
- **MCP Integration**: `claude mcp add claude-auto-commit "/home/dev/workspace/claude-auto-commit-wrapper.sh stdio"`

## 🛠️ Available Tools (3 Total)

## 1. `generate_commit_message`

**Purpose**: Generate AI-powered commit messages based on staged changes

### Key Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `conventional_commits` | boolean | `false` | Use conventional commits format |
| `language` | string | `"en"` | Message language (`en`, `ja`, `fr`, `de`, `es`) |
| `include_emoji` | boolean | `false` | Include emojis |
| `max_length` | integer | `72` | Maximum message length |

### Example Usage
```json
{
  "name": "generate_commit_message",
  "arguments": {
    "conventional_commits": true,
    "language": "en",
    "max_length": 72
  }
}
```

---

## 2. `auto_stage_and_commit`

**Purpose**: Auto-stage files and create commits with comprehensive pre-commit review

### Key Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `enable_pre_commit_review` | boolean | `true` | Enable 8-step pre-commit review |
| `dry_run` | boolean | `false` | Preview without committing |
| `message_config` | object | - | Commit message configuration |
| `review_config` | object | - | Pre-commit review settings |

### Pre-Commit Review Configuration
```json
{
  "review_config": {
    "depth": "comprehensive",
    "require_task_verification": true,
    "require_documentation_check": true,
    "require_test_validation": true,
    "fail_on_warnings": false
  }
}
```

### Example Usage
```json
{
  "name": "auto_stage_and_commit",
  "arguments": {
    "enable_pre_commit_review": true,
    "message_config": {
      "conventional_commits": true
    },
    "dry_run": false
  }
}
```

---

## 3. `smart_commit` ⭐

**Purpose**: Advanced commit with deep AI analysis and comprehensive workflow integration

### Key Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `analysis_depth` | string | `"standard"` | `basic`, `standard`, `deep`, `comprehensive` |
| `auto_stage` | boolean | `true` | Automatically stage files |
| `include_pre_commit_review` | boolean | `true` | Include comprehensive review |
| `require_review_approval` | boolean | `true` | Require review approval |
| `generate_suggestions` | boolean | `true` | Generate improvement suggestions |
| `dry_run` | boolean | `false` | Analyze without committing |

### Example Usage
```json
{
  "name": "smart_commit",
  "arguments": {
    "analysis_depth": "comprehensive",
    "include_pre_commit_review": true,
    "require_review_approval": true,
    "auto_stage": true,
    "dry_run": false
  }
}
```

## 🔍 Pre-Commit Review System

The server implements **8 comprehensive review steps** before any commit:

### Review Categories
1. **`diff_analysis`** - Code problems, bugs, security issues
2. **`task_verification`** - ✅ **Verifies completed tasks [x] have actual implementations**
3. **`documentation_alignment`** - ✅ **Checks code matches documentation (a.md, b.md, c.md)**
4. **`functionality_removal`** - ✅ **Reports any removed functionality/logic**
5. **`test_quality`** - ✅ **Ensures tests are proper, no placeholders**
6. **`test_alignment`** - ✅ **Verifies tests haven't become misaligned**
7. **`test_coverage`** - ✅ **Reports if test coverage was reduced**
8. **`final_review`** - ✅ **Raises concerns and recommendations**

### Severity Levels
- **`critical`** 🚫 - Blocks commit
- **`high`** ⚠️ - May block commit
- **`medium`** 💡 - Warnings
- **`low`** ℹ️ - Suggestions
- **`info`** 📝 - Informational

### Review Status
- **`approved`** ✅ - Commit approved
- **`rejected`** ❌ - Commit blocked
- **`warning`** ⚠️ - Issues found, approval needed

## 📋 Command Examples

### Quick Commands

```bash
# Set credentials (choose one)
export CLAUDE_USERNAME="your-email@example.com" && export CLAUDE_PASSWORD="your-password"

# Generate commit message only
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"generate_commit_message","arguments":{"conventional_commits":true}}}' | /home/dev/workspace/claude-auto-commit-wrapper.sh stdio

# Auto-stage and commit with review
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"auto_stage_and_commit","arguments":{"enable_pre_commit_review":true}}}' | /home/dev/workspace/claude-auto-commit-wrapper.sh stdio

# Smart commit (comprehensive)
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"smart_commit","arguments":{"analysis_depth":"comprehensive","dry_run":true}}}' | /home/dev/workspace/claude-auto-commit-wrapper.sh stdio
```

### MCP Client Integration

```json
{
  "mcpServers": {
    "claude-auto-commit": {
      "command": "/home/dev/workspace/claude-auto-commit-wrapper.sh",
      "args": ["stdio"],
      "env": {
        "CLAUDE_USERNAME": "your-email@example.com",
        "CLAUDE_PASSWORD": "your-password"
      }
    }
  }
}
```

## 📊 Example Response

When you run `smart_commit`, you get comprehensive analysis:

```json
{
  "success": true,
  "commit_sha": "a1b2c3d4e5f6",
  "message": "feat: implement comprehensive pre-commit review system",
  "analysis": {
    "change_type": "feat",
    "complexity": "high",
    "impact": "major",
    "confidence": 0.92
  },
  "pre_commit_review": {
    "review_status": "approved",
    "review_summary": "Reviewed 15 files with 489 additions. No critical issues.",
    "findings": [
      {
        "category": "documentation_alignment",
        "severity": "low",
        "message": "Consider updating README with new features",
        "suggestion": "Add usage examples to documentation"
      }
    ],
    "recommendations": [
      "Update documentation to reflect new capabilities",
      "Consider adding integration tests"
    ],
    "commit_approved": true,
    "review_duration": 8.7
  },
  "workflow_integration": {
    "suggested_next_steps": [
      "Review documentation alignment findings",
      "Run comprehensive tests before merging"
    ]
  }
}
```

## 🚀 Server Management

```bash
# Start server
/home/dev/workspace/claude-auto-commit-wrapper.sh start

# Check status  
/home/dev/workspace/claude-auto-commit-wrapper.sh status

# Test functionality
/home/dev/workspace/claude-auto-commit-wrapper.sh test

# View logs
/home/dev/workspace/claude-auto-commit-wrapper.sh logs
```

## ⚡ Best Practices

1. **Start with Dry Run**: Always test with `"dry_run": true` first
2. **Use Comprehensive Review**: Enable `"analysis_depth": "comprehensive"` for production
3. **Enable All Reviews**: Set `require_task_verification`, `require_documentation_check`, and `require_test_validation` to `true`
4. **Review Findings**: Always check pre-commit review results before proceeding
5. **Use Conventional Commits**: Enable `"conventional_commits": true` for consistency

## 🔧 Troubleshooting

### Authentication Issues
- Verify credentials with Claude Code first
- Check internet connectivity for Claude API
- Use `test` command to validate setup

### No Response
- Check server logs at `/tmp/claude-auto-commit-mcp.log`
- Ensure JSON format is valid
- Verify staged changes exist

### Review Failures
- Address critical findings first
- Use dry run to preview issues
- Check for problematic staged files (Windows paths, etc.)

## 📖 Related Documentation

- [MCP Servers Index](/mcp-servers) - All available MCP servers
- [Claude Code Integration Guide](https://docs.anthropic.com/en/docs/claude-code) - Claude Code setup
- [Git Best Practices](/git/best-practices) - Git workflow recommendations

---

> **🎉 Success**: Your Claude Auto-Commit MCP Server is now ready to provide AI-powered commits with comprehensive pre-commit review using the same credentials as Claude Code!