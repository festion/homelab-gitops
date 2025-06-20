// GitOps Auditor v1.1.0 - CSV Export Module
// Provides CSV export functionality for audit data

const fs = require('fs');
const path = require('path');

/**
 * Generate CSV export of audit data
 * @param {Object} auditData - The audit data to export
 * @returns {string} CSV formatted string
 */
function generateAuditCSV(auditData) {
  // CSV Header
  const csvHeader = 'Repository,Status,Clone URL,Local Path,Last Modified,Health Status,Uncommitted Changes\n';
  
  // Convert repos to CSV rows
  const csvRows = auditData.repos.map(repo => {
    const localPath = repo.local_path || repo.path || '';
    const cloneUrl = repo.clone_url || repo.remote || '';
    const lastModified = repo.last_modified || '';
    const uncommittedChanges = repo.uncommittedChanges ? 'Yes' : 'No';
    
    // Escape commas and quotes in CSV data
    const escapeCsv = (field) => {
      if (typeof field !== 'string') field = String(field);
      if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    };
    
    return [
      escapeCsv(repo.name),
      escapeCsv(repo.status),
      escapeCsv(cloneUrl),
      escapeCsv(localPath),
      escapeCsv(lastModified),
      escapeCsv(auditData.health_status),
      escapeCsv(uncommittedChanges)
    ].join(',');
  }).join('\n');
  
  return csvHeader + csvRows;
}

/**
 * Express route handler for CSV export
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} historyDir - Path to audit history directory
 */
function handleCSVExport(req, res, historyDir) {
  try {
    const auditFile = path.join(historyDir, 'GitRepoReport.json');
    
    if (!fs.existsSync(auditFile)) {
      return res.status(404).json({ error: 'No audit data found' });
    }

    const auditData = JSON.parse(fs.readFileSync(auditFile, 'utf8'));
    const csvContent = generateAuditCSV(auditData);
    
    // Set CSV response headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="gitops-audit-${auditData.timestamp.split('T')[0]}.csv"`);
    
    res.send(csvContent);
    
    console.log(`📊 CSV export generated for ${auditData.repos.length} repositories`);
    
  } catch (error) {
    console.error('❌ CSV export failed:', error);
    res.status(500).json({ error: 'Failed to generate CSV export' });
  }
}

module.exports = {
  generateAuditCSV,
  handleCSVExport
};
