#!/bin/bash

# Load token from secure storage
if [ -f "/home/dev/.github_token" ]; then
    export GITHUB_PERSONAL_ACCESS_TOKEN=$(cat /home/dev/.github_token)
elif [ -f "/home/dev/.mcp_tokens/github_token" ]; then
    export GITHUB_PERSONAL_ACCESS_TOKEN=$(cat /home/dev/.mcp_tokens/github_token)
else
    export GITHUB_PERSONAL_ACCESS_TOKEN="${GITHUB_PERSONAL_ACCESS_TOKEN:-your_github_token_here}"
fi

# Check if token is configured
if [ "$GITHUB_PERSONAL_ACCESS_TOKEN" = "your_github_token_here" ]; then
    echo "ERROR: GitHub MCP server requires configuration. Please set GITHUB_PERSONAL_ACCESS_TOKEN environment variable or store token in /home/dev/.github_token"
    echo "Example: echo 'ghp_your_actual_token' > /home/dev/.github_token && chmod 600 /home/dev/.github_token"
    exit 1
fi

docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN="$GITHUB_PERSONAL_ACCESS_TOKEN" ghcr.io/github/github-mcp-server
