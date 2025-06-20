# GitOps Auditor v1.1.0 - Deployment Guide
# Complete deployment instructions for upgrading to v1.1.0

## 🎉 v1.1.0 Features Overview

This release adds three major features:
- **📊 CSV Export**: Download audit reports as spreadsheet files
- **📧 Email Summaries**: Send HTML email reports with repository status
- **🔍 Enhanced Diff Viewer**: Professional git diff visualization

## 🚀 Deployment Steps

### 1. **Backend API Updates**

```bash
# SSH to your production server
ssh root@192.168.1.58

# Navigate to project directory
cd /opt/gitops

# Create backup
cp -r api api-backup-$(date +%Y%m%d)

# Add new v1.1.0 API modules
# (These files should be uploaded from your development environment)
```

**Copy these new files to `/opt/gitops/api/`:**
- `csv-export.js` - CSV export functionality  
- `email-notifications.js` - Email summary system

**Copy enhanced script to `/opt/gitops/scripts/`:**
- `nightly-email-summary.sh` - Automated email summaries

```bash
# Make script executable
chmod +x /opt/gitops/scripts/nightly-email-summary.sh

# Update the main server.js with v1.1.0 endpoints
# (The new imports and endpoints have been added)

# Restart API service to load new features
systemctl restart gitops-audit-api

# Verify API is running with new endpoints
curl http://localhost:3070/audit
curl http://localhost:3070/audit/export/csv
```

### 2. **Frontend Dashboard Updates**

```bash
# From your development environment, build the updated dashboard
cd dashboard
npm run build

# Copy new build to production
scp -r dist/* root@192.168.1.58:/var/www/gitops-dashboard/

# Alternatively, rebuild on the server:
# cd /opt/gitops/dashboard
# npm install
# npm run build
# cp -r dist/* /var/www/gitops-dashboard/
```

**New dashboard files include:**
- Enhanced `audit.tsx` with CSV export and email controls
- New `DiffViewer.tsx` component for advanced diff visualization
- Updated `roadmap.tsx` reflecting v1.1.0 completion

### 3. **Email Configuration (Optional)**

```bash
# Configure email notifications via environment variables
echo 'export GITOPS_TO_EMAIL="admin@lakehouse.wtf"' >> /etc/environment
echo 'export GITOPS_SMTP_HOST="localhost"' >> /etc/environment
echo 'export GITOPS_SMTP_PORT="25"' >> /etc/environment

# Or add to systemd service file
systemctl edit gitops-audit-api

# Add these lines under [Service]:
# Environment=GITOPS_TO_EMAIL=admin@lakehouse.wtf
# Environment=GITOPS_SMTP_HOST=localhost
# Environment=GITOPS_SMTP_PORT=25
```

### 4. **Automated Email Summaries (Optional)**

```bash
# Add nightly email summary to cron
echo "0 3 * * * /opt/gitops/scripts/nightly-email-summary.sh" | crontab -

# Test email functionality
/opt/gitops/scripts/nightly-email-summary.sh --test

# View cron jobs
crontab -l
```

### 5. **Verification & Testing**

```bash
# Test API endpoints
curl -s http://localhost:3070/audit | jq '.summary'
curl -I http://localhost:3070/audit/export/csv

# Test email endpoint (requires valid email)
curl -X POST -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}' \
  http://localhost:3070/audit/email-summary

# Check service status
systemctl status gitops-audit-api
systemctl status gitops-dashboard

# View logs
journalctl -u gitops-audit-api -f
```

### 6. **Access Updated Dashboard**

Navigate to: `https://gitops.internal.lakehouse.wtf/`

**New v1.1.0 Features Available:**
- **📊 "Export CSV"** button in the top-right header
- **📧 Email input field** with "Email Summary" button  
- **🔍 "Enhanced Diff"** button for repositories with changes
- **📋 Updated roadmap** showing v1.1.0 completion

## 🛠️ Troubleshooting

### API Not Starting
```bash
# Check server.js imports
grep -n "csv-export\|email-notifications" /opt/gitops/api/server.js

# Check file permissions
ls -la /opt/gitops/api/

# Manual start for debugging
cd /opt/gitops && NODE_ENV=production node api/server.js
```

### Email Not Working
```bash
# Test system mail
echo "Test message" | mail -s "Test Subject" admin@example.com

# Check SMTP configuration
systemctl status postfix
# or
systemctl status sendmail

# View email logs
tail -f /var/log/mail.log
```

### CSV Export Issues
```bash
# Test CSV endpoint directly
curl -v http://localhost:3070/audit/export/csv -o test.csv
file test.csv
head test.csv
```

### Enhanced Diff Viewer Not Loading
```bash
# Check browser console for JavaScript errors
# Verify DiffViewer.tsx is properly built in the dashboard
ls -la /var/www/gitops-dashboard/assets/

# Rebuild frontend if needed
cd /opt/gitops/dashboard && npm run build
```

## 📊 Success Criteria

**✅ v1.1.0 deployment is successful when:**

1. **CSV Export**: Clicking "Export CSV" downloads a properly formatted file
2. **Email Summary**: Email input accepts addresses and sends HTML reports  
3. **Enhanced Diff**: "Enhanced Diff" button opens professional diff viewer
4. **Roadmap Updated**: Dashboard shows v1.1.0 completion status
5. **API Health**: All endpoints respond correctly
6. **Services Running**: Both API and dashboard services are active

## 🎯 Optional Next Steps

- **Monitor email delivery** success rates
- **Schedule regular CSV exports** for historical analysis  
- **Customize email templates** for your organization
- **Set up email alerts** for critical repository status changes
- **Explore v1.2.0 features** like repository health trends

## 🆘 Support

If you encounter issues:
1. Check service logs: `journalctl -u gitops-audit-api -f`
2. Verify file permissions and ownership
3. Test individual components (API, dashboard, email)
4. Roll back to previous version if needed: `cp -r api-backup-* api/`

---

**🎉 Congratulations! You now have GitOps Auditor v1.1.0 with CSV export, email summaries, and enhanced diff viewing capabilities!**
