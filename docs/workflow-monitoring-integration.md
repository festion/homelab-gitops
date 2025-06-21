# Workflow Monitoring Integration - DevOps Platform Evolution

## Overview
Integration plan for monitoring CI/CD workflows across multiple repositories from the homelab-gitops-auditor platform.

## Implementation Architecture

### Phase 1: Workflow Status API (Immediate)
```javascript
// New API endpoint: /api/workflow-status
app.get('/workflow-status/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = req.params;

    // Use GitHub MCP to fetch workflow runs
    const workflowRuns = await githubMcp.getWorkflowRuns(owner, repo);

    const status = {
      repository: `${owner}/${repo}`,
      lastRun: workflowRuns[0],
      health: calculateWorkflowHealth(workflowRuns),
      trends: analyzeWorkflowTrends(workflowRuns),
      timestamp: new Date().toISOString()
    };

    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Phase 2: Real-time Dashboard Integration
```jsx
// New React component: WorkflowMonitor.tsx
const WorkflowMonitor = () => {
  const [workflows, setWorkflows] = useState([]);

  useEffect(() => {
    const fetchWorkflowStatus = async () => {
      const repos = ['home-assistant-config', 'homelab-gitops-auditor'];
      const statuses = await Promise.all(
        repos.map(repo =>
          fetch(`/api/workflow-status/festion/${repo}`).then(r => r.json())
        )
      );
      setWorkflows(statuses);
    };

    fetchWorkflowStatus();
    const interval = setInterval(fetchWorkflowStatus, 300000); // 5 min
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="workflow-monitor">
      <h2>CI/CD Pipeline Health</h2>
      {workflows.map(workflow => (
        <WorkflowCard key={workflow.repository} workflow={workflow} />
      ))}
    </div>
  );
};
```

### Phase 3: GitHub Webhook Integration
```javascript
// Webhook endpoint for real-time updates
app.post('/webhooks/github', (req, res) => {
  const { action, workflow_run, repository } = req.body;

  if (action === 'completed') {
    // Update workflow status in real-time
    broadcastWorkflowUpdate({
      repository: repository.full_name,
      status: workflow_run.conclusion,
      timestamp: workflow_run.updated_at
    });
  }

  res.status(200).send('OK');
});
```

## Configuration Updates

### Add to config/settings.conf
```bash
# Workflow monitoring settings
GITHUB_WEBHOOK_SECRET="your-webhook-secret"
WORKFLOW_MONITOR_ENABLED=true
WORKFLOW_REFRESH_INTERVAL=300  # 5 minutes
```

### Dashboard Integration Points
1. **Main Dashboard**: Add workflow health widgets
2. **Repository View**: Show CI/CD status per repo
3. **Alerts Panel**: Highlight failing workflows
4. **Trends View**: Historical workflow performance

## Benefits for DevOps Platform
- **Centralized Monitoring**: Single view of all repository health
- **Proactive Alerts**: Early detection of CI/CD issues
- **Workflow Standardization**: Template deployment across repos
- **Performance Tracking**: Measure deployment velocity and success rates

## Next Steps
1. Implement basic API endpoints
2. Add React components to dashboard
3. Configure GitHub webhooks
4. Deploy standardized workflows to other repositories

## Repository Coverage
- ✅ home-assistant-config: Dual YAML + HA validation
- 🔄 homelab-gitops-auditor: Code quality + deployment
- 📋 Future repos: Standardized workflow templates
