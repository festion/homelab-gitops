# Claude Auto-Commit MCP Server - Complete API Reference

## Overview

The Claude Auto-Commit MCP Server provides intelligent Git commit functionality powered by Claude AI with comprehensive pre-commit review capabilities. It supports both API key and username/password authentication (like Claude Code).

## Server Information

- **Name**: `claude-auto-commit-server`
- **Version**: `1.0.0`
- **Location**: `/home/dev/workspace/mcp-servers/claude-auto-commit-mcp-server/`
- **Wrapper**: `/home/dev/workspace/claude-auto-commit-wrapper.sh`
- **Protocol**: Model Context Protocol (MCP) v1.0

## Authentication Methods

### Option A: API Key Authentication
```bash
export ANTHROPIC_API_KEY="sk-ant-api03-..."
# OR
export CLAUDE_API_KEY="sk-ant-api03-..."
```

### Option B: Username/Password Authentication (Like Claude Code)
```bash
export CLAUDE_USERNAME="your-email@example.com"
export CLAUDE_PASSWORD="your-password"
# OR
export CLAUDE_EMAIL="your-email@example.com"
export CLAUDE_PASSWORD="your-password"
```

## Available Tools (3 Total)

## 1. `generate_commit_message`

Generates AI-powered commit messages based on repository changes using Claude's advanced language understanding.

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `language` | string | No | `"en"` | Message language (`en`, `ja`, `fr`, `de`, `es`) |
| `conventional_commits` | boolean | No | `false` | Use conventional commits format |
| `include_emoji` | boolean | No | `false` | Include emojis in commit messages |
| `template` | string | No | - | Template name for message generation |
| `max_length` | integer | No | `72` | Maximum commit message length |
| `generate_count` | integer | No | `1` | Number of alternatives (max: 5) |
| `context_lines` | integer | No | `3` | Context lines in diff analysis |
| `analyze_file_types` | array | No | - | Specific file types to analyze |

### Example Request

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "generate_commit_message",
    "arguments": {
      "language": "en",
      "conventional_commits": true,
      "include_emoji": false,
      "max_length": 72,
      "generate_count": 3
    }
  }
}
```

### Example Response

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [{
      "type": "text",
      "text": "{
        \"message\": \"feat: implement Claude auto-commit MCP server with pre-commit review\",
        \"confidence\": 0.95,
        \"alternative_messages\": [
          \"feat: add AI-powered commit generation with comprehensive review\",
          \"feat: implement auto-commit server with 8-step pre-commit validation\"
        ],
        \"analysis\": {
          \"change_type\": \"feat\",
          \"scope\": \"auto-commit\",
          \"complexity\": \"high\",
          \"impact\": \"major\",
          \"files_modified\": 25,
          \"lines_added\": 1247,
          \"lines_removed\": 23,
          \"languages\": [\"typescript\", \"javascript\"],
          \"breaking_changes\": false,
          \"summary\": \"Implements comprehensive auto-commit functionality with AI analysis\"
        },
        \"generated_at\": \"2025-01-22T10:30:00Z\",
        \"model_used\": \"claude-3-sonnet-20240229\",
        \"tokens_used\": 1247,
        \"processing_time\": \"3.2s\"
      }"
    }]
  }
}
```

---

## 2. `auto_stage_and_commit`

Automatically stages changes and creates commits with AI-generated messages and comprehensive pre-commit review.

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `message` | string | No | - | Custom commit message (auto-generated if not provided) |
| `message_config` | object | No | - | Configuration for message generation |
| `stage_options` | object | No | - | Configuration for file staging |
| `enable_pre_commit_review` | boolean | No | `true` | Enable comprehensive pre-commit review |
| `review_config` | object | No | - | Pre-commit review configuration |
| `dry_run` | boolean | No | `false` | Preview changes without committing |

#### `message_config` Object

| Field | Type | Description |
|-------|------|-------------|
| `language` | string | Message language (`en`, `ja`, `fr`, `de`, `es`) |
| `template` | string | Template to use |
| `conventional_commits` | boolean | Use conventional commits format |
| `include_emoji` | boolean | Include emojis |

#### `stage_options` Object

| Field | Type | Description |
|-------|------|-------------|
| `patterns` | array | File patterns to include |
| `exclude_patterns` | array | File patterns to exclude |
| `auto_detect` | boolean | Auto-detect relevant files |

#### `review_config` Object

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `depth` | string | `"standard"` | Review depth (`basic`, `standard`, `comprehensive`) |
| `auto_approve_safe_changes` | boolean | `false` | Auto-approve when no critical issues |
| `fail_on_warnings` | boolean | `false` | Reject commit on warnings |
| `require_task_verification` | boolean | `true` | Verify completed tasks have implementations |
| `require_documentation_check` | boolean | `true` | Check documentation alignment |
| `require_test_validation` | boolean | `true` | Validate test quality |

### Example Request

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "auto_stage_and_commit",
    "arguments": {
      "message_config": {
        "conventional_commits": true,
        "language": "en"
      },
      "enable_pre_commit_review": true,
      "review_config": {
        "depth": "comprehensive",
        "require_task_verification": true
      },
      "dry_run": false
    }
  }
}
```

### Example Response

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [{
      "type": "text",
      "text": "{
        \"success\": true,
        \"commit_sha\": \"a1b2c3d4e5f6\",
        \"message\": \"feat: implement comprehensive pre-commit review system\",
        \"files_staged\": [
          \"src/review-engine.ts\",
          \"src/claude-client.ts\",
          \"src/index.ts\"
        ],
        \"changes_summary\": {
          \"files_modified\": 3,
          \"lines_added\": 489,
          \"lines_removed\": 12
        },
        \"pre_commit_review\": {
          \"review_status\": \"approved\",
          \"review_summary\": \"Reviewed 3 files with 489 additions and 12 deletions. No critical issues detected.\",
          \"findings\": [],
          \"recommendations\": [
            \"Consider updating documentation for new review features\"
          ],
          \"commit_approved\": true,
          \"review_duration\": 4.2
        },
        \"pushed\": false,
        \"commit_url\": \"https://github.com/owner/repo/commit/a1b2c3d4e5f6\"
      }"
    }]
  }
}
```

---

## 3. `smart_commit`

Advanced commit generation with deep analysis, workflow integration, and comprehensive pre-commit review system.

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `analysis_depth` | string | No | `"standard"` | Analysis depth (`basic`, `standard`, `deep`, `comprehensive`) |
| `template_name` | string | No | - | Template to use |
| `auto_stage` | boolean | No | `true` | Automatically stage files |
| `require_confirmation` | boolean | No | `false` | Require user confirmation |
| `generate_suggestions` | boolean | No | `true` | Generate improvement suggestions |
| `include_pre_commit_review` | boolean | No | `true` | Include comprehensive pre-commit review |
| `require_review_approval` | boolean | No | `true` | Require review approval before committing |
| `dry_run` | boolean | No | `false` | Perform analysis without committing |

### Example Request

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "smart_commit",
    "arguments": {
      "analysis_depth": "comprehensive",
      "include_pre_commit_review": true,
      "require_review_approval": true,
      "auto_stage": true,
      "dry_run": false,
      "generate_suggestions": true
    }
  }
}
```

### Example Response

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [{
      "type": "text",
      "text": "{
        \"success\": true,
        \"commit_sha\": \"x7y8z9a1b2c3\",
        \"message\": \"feat: implement AI-powered smart commit with workflow integration\",
        \"analysis\": {
          \"change_type\": \"feat\",
          \"complexity\": \"high\",
          \"impact\": \"major\",
          \"confidence\": 0.92,
          \"recommendations\": [
            \"Consider adding performance tests\",
            \"Update API documentation for new features\"
          ]
        },
        \"pre_commit_review\": {
          \"review_status\": \"approved\",
          \"review_summary\": \"Comprehensive analysis of 15 files completed successfully\",
          \"findings\": [
            {
              \"category\": \"documentation_alignment\",
              \"severity\": \"low\",
              \"message\": \"Consider updating README with new smart_commit examples\",
              \"suggestion\": \"Add usage examples to documentation\"
            }
          ],
          \"recommendations\": [
            \"Update documentation to reflect new smart commit capabilities\",
            \"Consider adding integration tests for workflow features\"
          ],
          \"commit_approved\": true,
          \"review_duration\": 8.7
        },
        \"workflow_integration\": {
          \"suggested_next_steps\": [
            \"Review and address documentation alignment findings\",
            \"Run comprehensive tests before merging\",
            \"Consider creating pull request for team review\"
          ],
          \"commit_url\": \"https://github.com/owner/repo/commit/x7y8z9a1b2c3\",
          \"follow_up_actions\": [
            \"Update project documentation\",
            \"Run integration tests\"
          ]
        }
      }"
    }]
  }
}
```

## Pre-Commit Review System

The server implements a comprehensive 8-step pre-commit review process:

### Review Categories

1. **`diff_analysis`** - Code problems and bugs
2. **`task_verification`** - Completed tasks have implementations
3. **`documentation_alignment`** - Code matches documentation
4. **`functionality_removal`** - Detect removed functionality
5. **`test_quality`** - Test completeness and quality
6. **`test_alignment`** - Test consistency
7. **`test_coverage`** - Coverage reduction detection

### Severity Levels

- **`critical`** - Blocks commit, must be fixed
- **`high`** - Important issues, may block commit
- **`medium`** - Warnings, commit allowed with approval
- **`low`** - Minor suggestions
- **`info`** - Informational findings

### Review Status

- **`approved`** - Commit approved, no critical issues
- **`rejected`** - Commit blocked due to critical/high issues
- **`warning`** - Issues found but commit can proceed

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| `-32600` | `INVALID_REQUEST` | Malformed request or missing parameters |
| `-32603` | `INTERNAL_ERROR` | Server processing error |
| `-32000` | `AUTHENTICATION_FAILED` | Invalid or missing Claude credentials |
| `-32001` | `NO_CHANGES_DETECTED` | No staged changes found |
| `-32002` | `REVIEW_REJECTED` | Pre-commit review failed |

## Usage Examples

### Basic Commit Generation

```bash
echo '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "generate_commit_message",
    "arguments": {
      "conventional_commits": true
    }
  }
}' | /home/dev/workspace/claude-auto-commit-wrapper.sh stdio
```

### Auto-Stage and Commit with Review

```bash
echo '{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "auto_stage_and_commit",
    "arguments": {
      "enable_pre_commit_review": true,
      "review_config": {
        "depth": "comprehensive"
      }
    }
  }
}' | /home/dev/workspace/claude-auto-commit-wrapper.sh stdio
```

### Smart Commit (Dry Run)

```bash
echo '{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "smart_commit",
    "arguments": {
      "analysis_depth": "comprehensive",
      "dry_run": true
    }
  }
}' | /home/dev/workspace/claude-auto-commit-wrapper.sh stdio
```

## MCP Client Integration

### Claude Code Integration

```bash
claude mcp add claude-auto-commit "/home/dev/workspace/claude-auto-commit-wrapper.sh stdio"
```

### Generic MCP Client Configuration

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

## Best Practices

### 1. Use Dry Run for Testing
Always test with `"dry_run": true` before making actual commits.

### 2. Enable Comprehensive Review
For production code, use `"analysis_depth": "comprehensive"` and enable all review options.

### 3. Stage Files Appropriately
Use `stage_options` to control which files are included in commits.

### 4. Review Findings
Always review the pre-commit findings and recommendations before proceeding.

### 5. Use Conventional Commits
Enable `"conventional_commits": true` for consistent commit message formatting.

## Server Management

### Start Server
```bash
/home/dev/workspace/claude-auto-commit-wrapper.sh start
```

### Check Status
```bash
/home/dev/workspace/claude-auto-commit-wrapper.sh status
```

### View Logs
```bash
/home/dev/workspace/claude-auto-commit-wrapper.sh logs
```

### Test Functionality
```bash
/home/dev/workspace/claude-auto-commit-wrapper.sh test
```

## Troubleshooting

### Authentication Issues
- Verify `CLAUDE_USERNAME` and `CLAUDE_PASSWORD` are set
- Check credentials work with Claude Code
- Ensure stable internet connection

### No Response from Server
- Check server logs: `/tmp/claude-auto-commit-mcp.log`
- Verify JSON request format
- Ensure proper MCP protocol usage

### Review Failures
- Address critical findings first
- Use `"dry_run": true` to preview issues
- Check git staging area for problematic files

### Performance
- Use `"analysis_depth": "basic"` for faster processing
- Limit `context_lines` for large diffs
- Consider staging fewer files for complex reviews

## Support

- **Server Location**: `/home/dev/workspace/mcp-servers/claude-auto-commit-mcp-server/`
- **Documentation**: See README.md in server directory
- **Configuration**: Use `config.example.json` as template
- **Logs**: Available at `/tmp/claude-auto-commit-mcp.log`