// GitOps Auditor v1.1.0 - Email Notification Module  
// Provides email summary functionality for nightly audits

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

/**
 * Configuration for email notifications
 */
const EMAIL_CONFIG = {
  // Email settings (can be overridden via environment variables)
  FROM_EMAIL: process.env.GITOPS_FROM_EMAIL || 'gitops-auditor@lakehouse.wtf',
  TO_EMAIL: process.env.GITOPS_TO_EMAIL || null,
  SMTP_HOST: process.env.GITOPS_SMTP_HOST || 'localhost',
  SMTP_PORT: process.env.GITOPS_SMTP_PORT || '25',
  SUBJECT_PREFIX: process.env.GITOPS_EMAIL_PREFIX || '[GitOps Audit]'
};

/**
 * Generate HTML email summary from audit data
 * @param {Object} auditData - The audit data
 * @returns {string} HTML email content
 */
function generateEmailHTML(auditData) {
  const timestamp = new Date(auditData.timestamp).toLocaleString();
  const healthColor = auditData.health_status === 'green' ? '#10B981' : 
                     auditData.health_status === 'yellow' ? '#F59E0B' : '#EF4444';
  
  const summary = auditData.summary;
  const dirtyRepos = auditData.repos.filter(r => r.status === 'dirty' || r.uncommittedChanges);
  const missingRepos = auditData.repos.filter(r => r.status === 'missing');
  const extraRepos = auditData.repos.filter(r => r.status === 'extra');
  
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>GitOps Audit Summary</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .status-badge { 
      display: inline-block; 
      padding: 4px 12px; 
      border-radius: 20px; 
      color: white; 
      font-weight: bold;
      background-color: ${healthColor};
    }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
    .summary-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
    .summary-number { font-size: 24px; font-weight: bold; color: #2563eb; }
    .repo-list { margin: 15px 0; }
    .repo-item { background: #fff; border-left: 4px solid #e5e7eb; padding: 10px; margin: 5px 0; }
    .repo-dirty { border-left-color: #f59e0b; }
    .repo-missing { border-left-color: #ef4444; }
    .repo-extra { border-left-color: #8b5cf6; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏠 GitOps Audit Summary</h1>
    <p><strong>Timestamp:</strong> ${timestamp}</p>
    <p><strong>Overall Status:</strong> <span class="status-badge">${auditData.health_status.toUpperCase()}</span></p>
  </div>

  <div class="summary-grid">
    <div class="summary-card">
      <div class="summary-number">${summary.total}</div>
      <div>Total Repos</div>
    </div>
    <div class="summary-card">
      <div class="summary-number">${summary.clean}</div>
      <div>Clean</div>
    </div>
    <div class="summary-card">
      <div class="summary-number">${summary.dirty}</div>
      <div>Dirty</div>
    </div>
    <div class="summary-card">
      <div class="summary-number">${summary.missing}</div>
      <div>Missing</div>
    </div>
    <div class="summary-card">
      <div class="summary-number">${summary.extra}</div>
      <div>Extra</div>
    </div>
  </div>`;

  // Add details for problematic repositories
  if (dirtyRepos.length > 0) {
    html += `
  <h3>🔄 Repositories with Uncommitted Changes (${dirtyRepos.length})</h3>
  <div class="repo-list">`;
    dirtyRepos.forEach(repo => {
      html += `<div class="repo-item repo-dirty"><strong>${repo.name}</strong><br>Status: ${repo.status}</div>`;
    });
    html += `</div>`;
  }

  if (missingRepos.length > 0) {
    html += `
  <h3>❌ Missing Repositories (${missingRepos.length})</h3>
  <div class="repo-list">`;
    missingRepos.forEach(repo => {
      html += `<div class="repo-item repo-missing"><strong>${repo.name}</strong><br>Clone URL: ${repo.clone_url || 'N/A'}</div>`;
    });
    html += `</div>`;
  }

  if (extraRepos.length > 0) {
    html += `
  <h3>➕ Extra Repositories (${extraRepos.length})</h3>
  <div class="repo-list">`;
    extraRepos.forEach(repo => {
      html += `<div class="repo-item repo-extra"><strong>${repo.name}</strong><br>Path: ${repo.local_path || repo.path || 'N/A'}</div>`;
    });
    html += `</div>`;
  }

  html += `
  <div class="footer">
    <p>📊 <strong>GitOps Auditor v1.1.0</strong> - Automated repository monitoring for your homelab</p>
    <p>🌐 Dashboard: <a href="https://gitops.internal.lakehouse.wtf/">https://gitops.internal.lakehouse.wtf/</a></p>
  </div>
</body>
</html>`;

  return html;
}

/**
 * Send email using system mail command
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML email content
 * @param {string} toEmail - Recipient email address
 * @returns {Promise<boolean>} Success status
 */
function sendEmail(subject, htmlContent, toEmail) {
  return new Promise((resolve, reject) => {
    if (!toEmail) {
      console.log('📧 No recipient email configured, skipping email notification');
      resolve(false);
      return;
    }

    const fullSubject = `${EMAIL_CONFIG.SUBJECT_PREFIX} ${subject}`;
    
    // Create temporary HTML file
    const tempFile = path.join('/tmp', `gitops-email-${Date.now()}.html`);
    fs.writeFileSync(tempFile, htmlContent);
    
    // Send email using mail command (works with most Unix systems)
    const mailCommand = `mail -s "${fullSubject}" -a "Content-Type: text/html" "${toEmail}" < "${tempFile}"`;
    
    exec(mailCommand, (error, stdout, stderr) => {
      // Clean up temp file
      try {
        fs.unlinkSync(tempFile);
      } catch (e) {
        console.warn('⚠️ Failed to clean up temp email file:', e.message);
      }
      
      if (error) {
        console.error('❌ Failed to send email:', error.message);
        reject(error);
      } else {
        console.log(`📧 Email sent successfully to ${toEmail}`);
        resolve(true);
      }
    });
  });
}

/**
 * Send audit summary email
 * @param {Object} auditData - The audit data
 * @param {string} toEmail - Optional recipient email (overrides config)
 * @returns {Promise<boolean>} Success status
 */
async function sendAuditSummary(auditData, toEmail = null) {
  try {
    const recipient = toEmail || EMAIL_CONFIG.TO_EMAIL;
    
    if (!recipient) {
      console.log('📧 Email notifications disabled - no recipient configured');
      console.log('💡 Set GITOPS_TO_EMAIL environment variable to enable email notifications');
      return false;
    }

    const subject = `Audit Summary - ${auditData.health_status.toUpperCase()} (${auditData.summary.total} repos, ${auditData.summary.dirty} dirty)`;
    const htmlContent = generateEmailHTML(auditData);
    
    const success = await sendEmail(subject, htmlContent, recipient);
    return success;
    
  } catch (error) {
    console.error('❌ Failed to send audit summary email:', error);
    return false;
  }
}

/**
 * Express route handler for sending email summary
 * @param {Object} req - Express request object  
 * @param {Object} res - Express response object
 * @param {string} historyDir - Path to audit history directory
 */
async function handleEmailSummary(req, res, historyDir) {
  try {
    const auditFile = path.join(historyDir, 'GitRepoReport.json');
    
    if (!fs.existsSync(auditFile)) {
      return res.status(404).json({ error: 'No audit data found' });
    }

    const auditData = JSON.parse(fs.readFileSync(auditFile, 'utf8'));
    const toEmail = req.body.email || null;
    
    const success = await sendAuditSummary(auditData, toEmail);
    
    if (success) {
      res.json({ 
        status: 'Email sent successfully', 
        recipient: toEmail || EMAIL_CONFIG.TO_EMAIL,
        repos: auditData.summary.total 
      });
    } else {
      res.status(400).json({ error: 'Failed to send email - check configuration' });
    }
    
  } catch (error) {
    console.error('❌ Email summary API failed:', error);
    res.status(500).json({ error: 'Failed to send email summary' });
  }
}

module.exports = {
  sendAuditSummary,
  handleEmailSummary,
  generateEmailHTML,
  EMAIL_CONFIG
};
