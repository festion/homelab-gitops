# GitOps Auditor - GitHub Personal Access Token Setup

This document explains how to configure Personal Access Tokens (PATs) for secure GitHub authentication in the GitOps Auditor.

## 🔑 **Why Personal Access Tokens?**

- **More secure** than username/password
- **Fine-grained permissions** - only grant what's needed
- **Easily revokable** if compromised
- **Required by GitHub** for API access and automation
- **Works with 2FA** enabled accounts

## 🚀 **Quick Setup**

### **1. Create GitHub Personal Access Token**

1. Go to GitHub → Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Configure your token:

**Token Name:** `GitOps Auditor - [YOUR_MACHINE_NAME]`

**Expiration:** Choose based on your security needs (90 days recommended)

**Scopes needed:**
```
✅ repo (Full control of private repositories)
  ├── repo:status (Access commit status)
  ├── repo_deployment (Access deployment status)
  ├── public_repo (Access public repositories)
  └── repo:invite (Access repository invitations)

✅ workflow (Update GitHub Action workflows)

✅ read:org (Read org and team membership, read org projects)

Optional (for enhanced features):
✅ read:user (Read user profile data)
✅ user:email (Access user email addresses)
```

4. **Copy the token immediately** - you won't see it again!

### **2. Configure Environment Variables**

#### **For Local Development (WSL2/Linux):**
```bash
# Add to your ~/.bashrc or ~/.zshrc
export GITHUB_TOKEN="ghp_your_token_here"
export GITHUB_USERNAME="your_github_username"

# Reload your shell
source ~/.bashrc
```

#### **For Windows PowerShell:**
```powershell
# Add to your PowerShell profile
$env:GITHUB_TOKEN = "ghp_your_token_here"
$env:GITHUB_USERNAME = "your_github_username"

# Or set permanently
[Environment]::SetEnvironmentVariable("GITHUB_TOKEN", "ghp_your_token_here", "User")
[Environment]::SetEnvironmentVariable("GITHUB_USERNAME", "your_github_username", "User")
```

#### **For Production Server:**
```bash
# Create secure environment file
sudo nano /opt/gitops/.env

# Add these lines:
GITHUB_TOKEN=ghp_your_token_here
GITHUB_USERNAME=your_github_username
GITHUB_API_URL=https://api.github.com

# Secure the file
sudo chmod 600 /opt/gitops/.env
sudo chown gitops:gitops /opt/gitops/.env
```

### **3. GitHub Actions Secrets**

For automated workflows, add the token as a repository secret:

1. Go to your repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add these secrets:

```
Name: GITHUB_TOKEN
Value: ghp_your_token_here

Name: GITHUB_USERNAME  
Value: your_github_username
```

## 🔧 **Updated Script Configurations**

### **For sync_github_repos.sh:**
```bash
#!/bin/bash
# Updated to use Personal Access Token

# Load environment variables
if [ -f "/opt/gitops/.env" ]; then
    source /opt/gitops/.env
fi

# GitHub API configuration using PAT
GITHUB_API_URL="${GITHUB_API_URL:-https://api.github.com}"
GITHUB_USERNAME="${GITHUB_USERNAME:-$(whoami)}"

# Check for required token
if [ -z "$GITHUB_TOKEN" ]; then
    echo "ERROR: GITHUB_TOKEN environment variable not set"
    echo "Please set your GitHub Personal Access Token"
    exit 1
fi

# Use token for API calls
curl -H "Authorization: token $GITHUB_TOKEN" \
     -H "Accept: application/vnd.github.v3+json" \
     "$GITHUB_API_URL/user/repos?per_page=100"
```

### **For GitOps Dashboard API:**
```javascript
// api/server.js - Updated for PAT authentication
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;

if (!GITHUB_TOKEN) {
    console.error('ERROR: GITHUB_TOKEN environment variable not set');
    process.exit(1);
}

// GitHub API client with PAT
const githubHeaders = {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GitOps-Auditor/1.0'
};

// Example API call
async function getRepositories() {
    try {
        const response = await fetch(`https://api.github.com/user/repos?per_page=100`, {
            headers: githubHeaders
        });
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch repositories:', error);
        throw error;
    }
}
```

## 🛡️ **Security Best Practices**

### **Token Storage:**
- **Never commit tokens** to version control
- **Use environment variables** or secure credential stores
- **Rotate tokens regularly** (every 90 days recommended)
- **Use separate tokens** for different environments (dev/staging/prod)

### **Permissions:**
- **Grant minimal scopes** required for functionality
- **Use fine-grained tokens** when available
- **Monitor token usage** in GitHub settings

### **Environment Security:**
```bash
# Secure environment files
chmod 600 .env
chown root:root .env  # Or appropriate user

# Never log tokens
# BAD:  echo "Token: $GITHUB_TOKEN"
# GOOD: echo "Token: ${GITHUB_TOKEN:0:7}..."
```

## 🔍 **Testing Token Authentication**

### **Test API Access:**
```bash
# Test your token
curl -H "Authorization: token $GITHUB_TOKEN" \
     -H "Accept: application/vnd.github.v3+json" \
     https://api.github.com/user

# Should return your user information
```

### **Test Repository Access:**
```bash
# Test repository listing
curl -H "Authorization: token $GITHUB_TOKEN" \
     https://api.github.com/user/repos?per_page=5
```

## 🚨 **Troubleshooting**

### **Common Issues:**

**"Bad credentials" error:**
- Check token is correctly set: `echo ${GITHUB_TOKEN:0:10}...`
- Verify token hasn't expired in GitHub settings
- Ensure token has required scopes

**"Not Found" error:**
- Check repository permissions
- Verify organization access if needed
- Confirm token has `repo` scope

**Rate limiting:**
- Authenticated requests get 5,000/hour vs 60/hour unauthenticated
- Monitor rate limits: `curl -I -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user`

## 📋 **Migration Checklist**

- [ ] Create GitHub Personal Access Token
- [ ] Set environment variables (dev/prod)
- [ ] Add GitHub Actions secrets
- [ ] Update sync scripts to use PAT
- [ ] Update dashboard API configuration
- [ ] Test API connectivity
- [ ] Remove old username/password configs
- [ ] Update documentation for team
- [ ] Set token rotation reminder

## 🔄 **Token Rotation Process**

When tokens expire:

1. **Generate new token** with same scopes
2. **Update environment variables** in all environments
3. **Update GitHub Actions secrets**
4. **Test all integrations**
5. **Revoke old token** in GitHub settings
6. **Update team documentation**

---

**🔐 This approach provides secure, scalable authentication for your GitOps automation!**
