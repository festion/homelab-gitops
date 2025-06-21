# Security Assessment Procedures

Use this prompt for comprehensive security assessments of the homelab-gitops-auditor project.

## Security Assessment Scope

### 1. Code Security Analysis
Evaluate the codebase for security vulnerabilities:

**Static Code Analysis**:
- Review for common vulnerabilities (OWASP Top 10)
- Check for hardcoded secrets or credentials
- Analyze input validation and sanitization
- Review authentication and authorization logic
- Assess error handling and information disclosure

**Dependency Security**:
- Scan npm packages for known vulnerabilities
- Review dependency versions and update status
- Check for unmaintained or deprecated packages
- Assess third-party integration security

### 2. Infrastructure Security Review
Assess deployment and operational security:

**Server Configuration**:
- Review system hardening measures
- Check service configurations
- Analyze network security settings
- Validate access controls and permissions
- Review log management and monitoring

**Container/Service Security**:
- Assess service isolation
- Review runtime security measures
- Check for privilege escalation risks
- Validate resource limitations
- Review backup and recovery security

### 3. Application Security Testing
Test the running application for vulnerabilities:

**Authentication & Authorization**:
- Test login mechanisms
- Verify session management
- Check role-based access controls
- Test password policies
- Review token handling

**Input Validation & Injection**:
- Test for SQL injection vulnerabilities
- Check for XSS vulnerabilities
- Test command injection scenarios
- Verify file upload security
- Check API input validation

## Assessment Methodology

### Step 1: Automated Security Scanning
```bash
# Run npm audit for dependency vulnerabilities
npm audit --audit-level moderate

# Check for hardcoded secrets
grep -r "password\|secret\|key\|token" --include="*.js" --include="*.json" .

# Scan for common vulnerability patterns
grep -r "eval\|exec\|system\|shell_exec" --include="*.js" .

# Check file permissions
find . -type f -perm /o+w -ls
```

### Step 2: Configuration Security Review
```bash
# Check service configurations
sudo systemctl cat gitops-auditor | grep -i security
sudo systemctl cat gitops-dashboard | grep -i security

# Review nginx security headers
grep -i "header\|ssl\|security" nginx/gitops-dashboard.conf

# Check file ownership and permissions
ls -la config/
ls -la api/
```

### Step 3: Manual Code Review
Review critical code sections:

**Authentication Logic** (`api/server.js`, `api/github-mcp-manager.js`):
- Verify secure authentication implementation
- Check for session fixation vulnerabilities
- Review token generation and validation
- Assess logout and session cleanup

**Input Handling** (All API endpoints):
- Validate input sanitization
- Check for injection vulnerability patterns
- Review file upload handling
- Assess data validation logic

**Error Handling** (Throughout codebase):
- Check for information disclosure in errors
- Verify appropriate error logging
- Review error message content
- Assess exception handling completeness

### Step 4: Runtime Security Testing
```bash
# Test API endpoints for common vulnerabilities
curl -X POST http://localhost:3000/api/audit \
  -H "Content-Type: application/json" \
  -d '{"repo": "../../../etc/passwd"}'

# Test for XSS in dashboard
curl "http://localhost:3001/?search=<script>alert('xss')</script>"

# Test authentication bypass attempts
curl -H "Authorization: Bearer invalid" http://localhost:3000/api/status

# Test file access controls
curl http://localhost:3000/../config/settings.conf
```

## Security Checklist

### Critical Security Controls
- [ ] **Authentication Required**: All sensitive endpoints require authentication
- [ ] **Input Validation**: All user inputs are validated and sanitized
- [ ] **Output Encoding**: All dynamic content is properly encoded
- [ ] **Access Controls**: Proper authorization checks are implemented
- [ ] **Secure Configuration**: Default configurations are secure
- [ ] **Error Handling**: Errors don't reveal sensitive information
- [ ] **Logging**: Security events are properly logged
- [ ] **Encryption**: Sensitive data is encrypted in transit and at rest

### Infrastructure Security
- [ ] **System Hardening**: Operating system is properly hardened
- [ ] **Network Security**: Network access is appropriately restricted
- [ ] **Service Isolation**: Services run with minimal privileges
- [ ] **Backup Security**: Backups are encrypted and access-controlled
- [ ] **Update Management**: Security updates are regularly applied
- [ ] **Monitoring**: Security monitoring and alerting is configured

### Application Security
- [ ] **Dependency Management**: Dependencies are regularly updated
- [ ] **Secret Management**: No secrets in source code
- [ ] **Session Security**: Secure session management implemented
- [ ] **API Security**: API endpoints properly secured
- [ ] **File Security**: File operations are secured
- [ ] **Database Security**: Database access is properly controlled

## Vulnerability Assessment

### Severity Classification

**Critical**:
- Remote code execution
- Authentication bypass
- Privilege escalation
- Data breach potential

**High**:
- SQL injection
- XSS vulnerabilities
- Insecure direct object references
- Sensitive data exposure

**Medium**:
- CSRF vulnerabilities
- Information disclosure
- Insecure configurations
- Missing security headers

**Low**:
- Verbose error messages
- Missing input validation
- Weak password policies
- Outdated dependencies (non-critical)

### Risk Assessment Matrix
For each vulnerability:

**Impact Assessment**:
- Data confidentiality impact
- Data integrity impact
- System availability impact
- Business operation impact

**Likelihood Assessment**:
- Attack complexity
- Required access level
- Attacker skill requirement
- Discovery probability

**Overall Risk** = Impact × Likelihood

## Remediation Guidelines

### Immediate Actions (Critical/High Severity)
1. **Isolate affected systems** if actively exploited
2. **Apply emergency patches** or workarounds
3. **Monitor for exploitation** attempts
4. **Document incident** for tracking

### Short-term Remediation (Medium Severity)
1. **Plan fixes** within next sprint/release
2. **Implement compensating controls** if needed
3. **Update monitoring** to detect exploitation
4. **Test fixes** thoroughly before deployment

### Long-term Improvements (Low Severity)
1. **Include in regular maintenance** cycles
2. **Update security procedures** based on findings
3. **Enhance testing** to prevent similar issues
4. **Review architectural** changes needed

## Security Testing Integration

### Automated Security Testing
```bash
# Add to CI/CD pipeline
npm audit --audit-level moderate
snyk test  # If using Snyk
eslint --ext .js --rule 'security/detect-*' api/

# Pre-commit security checks
./scripts/lint-before-commit.sh
```

### Regular Security Reviews
- **Monthly**: Dependency vulnerability scans
- **Quarterly**: Configuration security review
- **Bi-annually**: Full penetration testing
- **Annually**: Architecture security review

### Security Monitoring
```bash
# Monitor for suspicious activities
tail -f /var/log/nginx/access.log | grep -i "attack\|inject\|script"

# Check for failed authentication attempts
journalctl -u gitops-auditor | grep -i "auth\|login\|failed"

# Monitor file access patterns
auditctl -w /opt/gitops-auditor -p wa -k gitops_access
```

## Reporting Format

### Executive Summary
```markdown
# Security Assessment Report - [Date]

## Overall Security Posture
- **Risk Level**: [Low/Medium/High/Critical]
- **Vulnerabilities Found**: [Count by severity]
- **Compliance Status**: [Assessment against standards]

## Key Findings
1. [Most critical finding]
2. [Second most critical finding]
3. [Additional significant findings]

## Immediate Actions Required
1. [Highest priority action]
2. [Second priority action]
3. [Additional urgent actions]
```

### Technical Details
For each vulnerability:
- **Vulnerability ID**: Unique identifier
- **Severity**: Critical/High/Medium/Low
- **Description**: Technical description
- **Location**: File/function/endpoint affected
- **Impact**: Potential impact if exploited
- **Remediation**: Specific steps to fix
- **Timeline**: Recommended fix timeline

Use this framework to maintain strong security posture and quickly identify and remediate security issues.
