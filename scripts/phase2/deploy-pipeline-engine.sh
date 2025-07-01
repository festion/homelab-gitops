#!/bin/bash
# deploy-pipeline-engine.sh - Deploy Phase 2 Pipeline Engine

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
PRODUCTION_SERVER="${PRODUCTION_SERVER:-192.168.1.58}"
DEPLOYMENT_USER="${DEPLOYMENT_USER:-root}"
DEPLOYMENT_DIR="${DEPLOYMENT_DIR:-/opt/gitops}"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}⚙️  Phase 2.2: Pipeline Engine${NC}"
echo -e "${BLUE}Target: ${PRODUCTION_SERVER}:${DEPLOYMENT_DIR}/.mcp/pipeline-engine${NC}"

# Create pipeline engine structure
echo -e "\n${BLUE}[INFO]${NC} Creating pipeline engine components..."
mkdir -p "${PROJECT_ROOT}/.mcp/pipeline-engine/templates"

# Pipeline Orchestrator
cat > "${PROJECT_ROOT}/.mcp/pipeline-engine/pipeline-orchestrator.py" << 'EOF'
#!/usr/bin/env python3
"""
Pipeline Orchestrator - Core engine for CI/CD pipeline execution
Integrates with GitHub MCP for Actions and Serena for coordination
"""

import asyncio
import json
import logging
import sqlite3
import uuid
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Dict, List, Optional, Any
import yaml
import aiohttp

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PipelineStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"


class StageStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    SKIPPED = "skipped"


class PipelineOrchestrator:
    def __init__(self, db_path: str = ".mcp/pipeline-engine/pipelines.db"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_database()
        self.active_pipelines: Dict[str, asyncio.Task] = {}
        
    def _init_database(self):
        """Initialize pipeline database"""
        conn = sqlite3.connect(self.db_path)
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS pipelines (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                repository_id TEXT NOT NULL,
                definition TEXT NOT NULL,
                version TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_by TEXT,
                status TEXT DEFAULT 'active'
            );
            
            CREATE TABLE IF NOT EXISTS pipeline_runs (
                id TEXT PRIMARY KEY,
                pipeline_id TEXT NOT NULL,
                run_number INTEGER NOT NULL,
                status TEXT NOT NULL,
                started_at TIMESTAMP,
                completed_at TIMESTAMP,
                trigger_type TEXT,
                trigger_data TEXT,
                execution_log TEXT,
                metrics TEXT,
                FOREIGN KEY (pipeline_id) REFERENCES pipelines(id)
            );
            
            CREATE TABLE IF NOT EXISTS stage_runs (
                id TEXT PRIMARY KEY,
                run_id TEXT NOT NULL,
                stage_name TEXT NOT NULL,
                status TEXT NOT NULL,
                started_at TIMESTAMP,
                completed_at TIMESTAMP,
                output TEXT,
                FOREIGN KEY (run_id) REFERENCES pipeline_runs(id)
            );
        """)
        conn.close()
    
    async def create_pipeline(self, name: str, repository_id: str, 
                            definition: Dict[str, Any]) -> str:
        """Create a new pipeline definition"""
        pipeline_id = str(uuid.uuid4())
        
        conn = sqlite3.connect(self.db_path)
        conn.execute("""
            INSERT INTO pipelines (id, name, repository_id, definition, version)
            VALUES (?, ?, ?, ?, ?)
        """, (pipeline_id, name, repository_id, json.dumps(definition), "1.0"))
        conn.commit()
        conn.close()
        
        logger.info(f"Created pipeline {name} with ID {pipeline_id}")
        return pipeline_id
    
    async def execute_pipeline(self, pipeline_id: str, 
                             trigger_type: str = "manual",
                             trigger_data: Optional[Dict] = None) -> str:
        """Execute a pipeline"""
        # Get pipeline definition
        conn = sqlite3.connect(self.db_path)
        cursor = conn.execute(
            "SELECT definition FROM pipelines WHERE id = ?", (pipeline_id,)
        )
        row = cursor.fetchone()
        if not row:
            raise ValueError(f"Pipeline {pipeline_id} not found")
        
        definition = json.loads(row[0])
        
        # Create run record
        run_id = str(uuid.uuid4())
        run_number = self._get_next_run_number(pipeline_id)
        
        conn.execute("""
            INSERT INTO pipeline_runs 
            (id, pipeline_id, run_number, status, started_at, trigger_type, trigger_data)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (run_id, pipeline_id, run_number, PipelineStatus.PENDING.value,
              datetime.utcnow(), trigger_type, json.dumps(trigger_data or {})))
        conn.commit()
        conn.close()
        
        # Start pipeline execution
        task = asyncio.create_task(
            self._execute_pipeline_async(run_id, pipeline_id, definition)
        )
        self.active_pipelines[run_id] = task
        
        logger.info(f"Started pipeline run {run_id} for pipeline {pipeline_id}")
        return run_id
    
    async def _execute_pipeline_async(self, run_id: str, pipeline_id: str,
                                    definition: Dict[str, Any]):
        """Execute pipeline stages asynchronously"""
        try:
            # Update status to running
            self._update_run_status(run_id, PipelineStatus.RUNNING)
            
            # Execute stages
            for stage in definition.get("stages", []):
                stage_result = await self._execute_stage(run_id, stage)
                if stage_result != StageStatus.SUCCESS:
                    self._update_run_status(run_id, PipelineStatus.FAILED)
                    return
            
            # All stages completed successfully
            self._update_run_status(run_id, PipelineStatus.SUCCESS)
            
        except Exception as e:
            logger.error(f"Pipeline execution failed: {e}")
            self._update_run_status(run_id, PipelineStatus.FAILED)
        finally:
            # Cleanup
            if run_id in self.active_pipelines:
                del self.active_pipelines[run_id]
    
    async def _execute_stage(self, run_id: str, stage: Dict[str, Any]) -> StageStatus:
        """Execute a pipeline stage"""
        stage_name = stage.get("name", "unnamed")
        stage_id = str(uuid.uuid4())
        
        # Create stage run record
        conn = sqlite3.connect(self.db_path)
        conn.execute("""
            INSERT INTO stage_runs (id, run_id, stage_name, status, started_at)
            VALUES (?, ?, ?, ?, ?)
        """, (stage_id, run_id, stage_name, StageStatus.RUNNING.value, datetime.utcnow()))
        conn.commit()
        conn.close()
        
        try:
            # Check condition
            if "condition" in stage:
                if not await self._evaluate_condition(stage["condition"]):
                    self._update_stage_status(stage_id, StageStatus.SKIPPED)
                    return StageStatus.SKIPPED
            
            # Execute jobs
            jobs = stage.get("jobs", [])
            if stage.get("parallel", False):
                # Execute jobs in parallel
                results = await asyncio.gather(
                    *[self._execute_job(job) for job in jobs],
                    return_exceptions=True
                )
                success = all(r is True for r in results if not isinstance(r, Exception))
            else:
                # Execute jobs sequentially
                success = True
                for job in jobs:
                    if not await self._execute_job(job):
                        success = False
                        break
            
            status = StageStatus.SUCCESS if success else StageStatus.FAILED
            self._update_stage_status(stage_id, status)
            return status
            
        except Exception as e:
            logger.error(f"Stage execution failed: {e}")
            self._update_stage_status(stage_id, StageStatus.FAILED)
            return StageStatus.FAILED
    
    async def _execute_job(self, job: Dict[str, Any]) -> bool:
        """Execute a single job"""
        job_name = job.get("name", "unnamed")
        
        # MCP server execution
        if "mcp" in job:
            return await self._execute_mcp_job(job)
        
        # Script execution
        if "script" in job:
            return await self._execute_script_job(job)
        
        # GitHub Action execution
        if "action" in job:
            return await self._execute_github_action(job)
        
        logger.warning(f"Job {job_name} has no execution method")
        return False
    
    async def _execute_mcp_job(self, job: Dict[str, Any]) -> bool:
        """Execute job via MCP server"""
        mcp_server = job.get("mcp")
        
        if mcp_server == "code-linter":
            # Execute linting via code-linter MCP
            # This would integrate with actual MCP server
            logger.info(f"Executing code-linter job: {job.get('name')}")
            await asyncio.sleep(2)  # Simulate execution
            return True
        
        elif mcp_server == "github":
            # Execute via GitHub MCP
            logger.info(f"Executing GitHub MCP job: {job.get('name')}")
            await asyncio.sleep(2)  # Simulate execution
            return True
        
        logger.error(f"Unknown MCP server: {mcp_server}")
        return False
    
    async def _execute_script_job(self, job: Dict[str, Any]) -> bool:
        """Execute shell script job"""
        script = job.get("script")
        logger.info(f"Executing script job: {job.get('name')}")
        
        # Execute script in subprocess
        proc = await asyncio.create_subprocess_shell(
            script,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await proc.communicate()
        
        return proc.returncode == 0
    
    async def _execute_github_action(self, job: Dict[str, Any]) -> bool:
        """Trigger GitHub Action workflow"""
        action = job.get("action")
        logger.info(f"Triggering GitHub Action: {action}")
        
        # This would integrate with GitHub MCP to trigger workflows
        await asyncio.sleep(3)  # Simulate API call
        return True
    
    async def _evaluate_condition(self, condition: str) -> bool:
        """Evaluate stage condition"""
        # Simple condition evaluation
        # In production, this would be more sophisticated
        if condition == "branch == 'main'":
            return True  # Simplified for demo
        return False
    
    def _update_run_status(self, run_id: str, status: PipelineStatus):
        """Update pipeline run status"""
        conn = sqlite3.connect(self.db_path)
        completed = status in [PipelineStatus.SUCCESS, PipelineStatus.FAILED, 
                              PipelineStatus.CANCELLED]
        
        if completed:
            conn.execute("""
                UPDATE pipeline_runs 
                SET status = ?, completed_at = ?
                WHERE id = ?
            """, (status.value, datetime.utcnow(), run_id))
        else:
            conn.execute("""
                UPDATE pipeline_runs SET status = ? WHERE id = ?
            """, (status.value, run_id))
        
        conn.commit()
        conn.close()
    
    def _update_stage_status(self, stage_id: str, status: StageStatus):
        """Update stage run status"""
        conn = sqlite3.connect(self.db_path)
        completed = status != StageStatus.RUNNING
        
        if completed:
            conn.execute("""
                UPDATE stage_runs 
                SET status = ?, completed_at = ?
                WHERE id = ?
            """, (status.value, datetime.utcnow(), stage_id))
        else:
            conn.execute("""
                UPDATE stage_runs SET status = ? WHERE id = ?
            """, (status.value, stage_id))
        
        conn.commit()
        conn.close()
    
    def _get_next_run_number(self, pipeline_id: str) -> int:
        """Get next run number for pipeline"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.execute("""
            SELECT MAX(run_number) FROM pipeline_runs WHERE pipeline_id = ?
        """, (pipeline_id,))
        max_num = cursor.fetchone()[0]
        conn.close()
        return (max_num or 0) + 1
    
    async def cancel_pipeline(self, run_id: str):
        """Cancel a running pipeline"""
        if run_id in self.active_pipelines:
            self.active_pipelines[run_id].cancel()
            self._update_run_status(run_id, PipelineStatus.CANCELLED)
            logger.info(f"Cancelled pipeline run {run_id}")
    
    def get_pipeline_status(self, run_id: str) -> Optional[Dict]:
        """Get current pipeline status"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.execute("""
            SELECT pr.*, p.name 
            FROM pipeline_runs pr
            JOIN pipelines p ON pr.pipeline_id = p.id
            WHERE pr.id = ?
        """, (run_id,))
        
        row = cursor.fetchone()
        if not row:
            return None
        
        # Get stage statuses
        stage_cursor = conn.execute("""
            SELECT stage_name, status, started_at, completed_at
            FROM stage_runs
            WHERE run_id = ?
            ORDER BY started_at
        """, (run_id,))
        
        stages = []
        for stage_row in stage_cursor:
            stages.append({
                "name": stage_row[0],
                "status": stage_row[1],
                "started_at": stage_row[2],
                "completed_at": stage_row[3]
            })
        
        conn.close()
        
        return {
            "run_id": row[0],
            "pipeline_id": row[1],
            "pipeline_name": row[-1],
            "run_number": row[2],
            "status": row[3],
            "started_at": row[4],
            "completed_at": row[5],
            "trigger_type": row[6],
            "stages": stages
        }


async def main():
    """Test pipeline orchestrator"""
    orchestrator = PipelineOrchestrator()
    
    # Create test pipeline
    definition = {
        "name": "Test Pipeline",
        "stages": [
            {
                "name": "Quality Check",
                "parallel": True,
                "jobs": [
                    {"name": "Linting", "mcp": "code-linter"},
                    {"name": "Security Scan", "script": "echo 'Running security scan'"}
                ]
            },
            {
                "name": "Build",
                "jobs": [
                    {"name": "Compile", "script": "echo 'Building application'"}
                ]
            },
            {
                "name": "Deploy",
                "condition": "branch == 'main'",
                "jobs": [
                    {"name": "Deploy to Production", "action": "deploy-prod"}
                ]
            }
        ]
    }
    
    pipeline_id = await orchestrator.create_pipeline(
        "Test Pipeline", "test-repo", definition
    )
    
    # Execute pipeline
    run_id = await orchestrator.execute_pipeline(pipeline_id)
    print(f"Started pipeline run: {run_id}")
    
    # Wait for completion
    await asyncio.sleep(10)
    
    # Get status
    status = orchestrator.get_pipeline_status(run_id)
    print(f"Pipeline status: {json.dumps(status, indent=2)}")


if __name__ == "__main__":
    asyncio.run(main())
EOF

# Pipeline templates
cat > "${PROJECT_ROOT}/.mcp/pipeline-engine/templates/node-ci.yaml" << 'EOF'
name: "Node.js CI/CD Pipeline"
version: "1.0"
description: "Standard CI/CD pipeline for Node.js applications"

triggers:
  - push:
      branches: [main, develop]
  - pull_request:
      types: [opened, synchronize]

stages:
  - name: "Quality Check"
    parallel: true
    jobs:
      - name: "ESLint"
        mcp: "code-linter"
        config: ".eslintrc.js"
      
      - name: "Prettier Check"
        script: "npx prettier --check ."
      
      - name: "Security Audit"
        script: "npm audit --audit-level=moderate"

  - name: "Build"
    jobs:
      - name: "Install Dependencies"
        script: "npm ci"
        cache:
          key: "node-modules-{{ checksum 'package-lock.json' }}"
          paths:
            - node_modules
      
      - name: "Compile TypeScript"
        script: "npm run build"
        condition: "exists('tsconfig.json')"

  - name: "Test"
    parallel: true
    jobs:
      - name: "Unit Tests"
        script: "npm test"
        coverage:
          threshold: 80
          report: "coverage/lcov.info"
      
      - name: "Integration Tests"
        script: "npm run test:integration"
        condition: "exists('tests/integration')"

  - name: "Deploy"
    condition: "branch == 'main' && status == 'success'"
    jobs:
      - name: "Build Docker Image"
        script: |
          docker build -t $REPO_NAME:$GIT_SHA .
          docker tag $REPO_NAME:$GIT_SHA $REPO_NAME:latest
      
      - name: "Deploy to Production"
        mcp: "github"
        action: "create-deployment"
        environment: "production"
EOF

cat > "${PROJECT_ROOT}/.mcp/pipeline-engine/templates/python-ci.yaml" << 'EOF'
name: "Python CI/CD Pipeline"
version: "1.0"
description: "Standard CI/CD pipeline for Python applications"

stages:
  - name: "Quality Check"
    parallel: true
    jobs:
      - name: "Black Formatter"
        script: "black --check ."
      
      - name: "Flake8 Linter"
        mcp: "code-linter"
        linter: "flake8"
      
      - name: "MyPy Type Check"
        script: "mypy ."
        condition: "exists('mypy.ini')"

  - name: "Test"
    jobs:
      - name: "Pytest"
        script: "pytest --cov=. --cov-report=xml"
        coverage:
          threshold: 85
          report: "coverage.xml"

  - name: "Package"
    condition: "tag =~ /^v/"
    jobs:
      - name: "Build Package"
        script: "python setup.py sdist bdist_wheel"
      
      - name: "Publish to PyPI"
        script: "twine upload dist/*"
        secrets: ["PYPI_TOKEN"]
EOF

# GitHub Actions bridge
cat > "${PROJECT_ROOT}/.mcp/pipeline-engine/github-actions-bridge.py" << 'EOF'
#!/usr/bin/env python3
"""
GitHub Actions Bridge - Integrates pipeline engine with GitHub Actions
"""

import asyncio
import json
import os
from typing import Dict, Optional
import aiohttp
import yaml


class GitHubActionsBridge:
    def __init__(self, github_token: str, repo_owner: str, repo_name: str):
        self.github_token = github_token
        self.repo_owner = repo_owner
        self.repo_name = repo_name
        self.api_base = "https://api.github.com"
        self.headers = {
            "Authorization": f"token {github_token}",
            "Accept": "application/vnd.github.v3+json"
        }
    
    async def create_workflow(self, pipeline_definition: Dict) -> str:
        """Convert pipeline definition to GitHub Actions workflow"""
        workflow = {
            "name": pipeline_definition.get("name", "GitOps Managed Pipeline"),
            "on": self._convert_triggers(pipeline_definition.get("triggers", [])),
            "jobs": {}
        }
        
        # Convert stages to jobs
        for i, stage in enumerate(pipeline_definition.get("stages", [])):
            job_id = f"stage_{i}_{stage['name'].replace(' ', '_').lower()}"
            workflow["jobs"][job_id] = self._convert_stage_to_job(stage, i)
        
        return yaml.dump(workflow, default_flow_style=False)
    
    def _convert_triggers(self, triggers: list) -> Dict:
        """Convert pipeline triggers to GitHub Actions format"""
        gh_triggers = {}
        
        for trigger in triggers:
            if isinstance(trigger, dict):
                for trigger_type, config in trigger.items():
                    if trigger_type == "push":
                        gh_triggers["push"] = {"branches": config.get("branches", ["main"])}
                    elif trigger_type == "pull_request":
                        gh_triggers["pull_request"] = {"types": config.get("types", ["opened", "synchronize"])}
                    elif trigger_type == "schedule":
                        gh_triggers["schedule"] = [{"cron": config.get("cron", "0 0 * * *")}]
        
        return gh_triggers or {"workflow_dispatch": {}}
    
    def _convert_stage_to_job(self, stage: Dict, index: int) -> Dict:
        """Convert pipeline stage to GitHub Actions job"""
        job = {
            "name": stage.get("name", f"Stage {index}"),
            "runs-on": "ubuntu-latest",
            "steps": []
        }
        
        # Add checkout step
        job["steps"].append({
            "name": "Checkout code",
            "uses": "actions/checkout@v3"
        })
        
        # Convert stage jobs to steps
        for stage_job in stage.get("jobs", []):
            step = {"name": stage_job.get("name", "Job")}
            
            if "script" in stage_job:
                step["run"] = stage_job["script"]
            elif "mcp" in stage_job:
                # Use custom action for MCP integration
                step["uses"] = f"homelab-gitops/mcp-action@v1"
                step["with"] = {
                    "mcp-server": stage_job["mcp"],
                    "config": stage_job.get("config", "")
                }
            
            job["steps"].append(step)
        
        # Add condition
        if "condition" in stage:
            job["if"] = self._convert_condition(stage["condition"])
        
        return job
    
    def _convert_condition(self, condition: str) -> str:
        """Convert pipeline condition to GitHub Actions expression"""
        # Simple mapping for common conditions
        mappings = {
            "branch == 'main'": "github.ref == 'refs/heads/main'",
            "tag =~ /^v/": "startsWith(github.ref, 'refs/tags/v')",
            "status == 'success'": "success()"
        }
        return mappings.get(condition, condition)
    
    async def trigger_workflow(self, workflow_file: str, inputs: Optional[Dict] = None) -> str:
        """Trigger a GitHub Actions workflow"""
        url = f"{self.api_base}/repos/{self.repo_owner}/{self.repo_name}/actions/workflows/{workflow_file}/dispatches"
        
        payload = {
            "ref": "main",
            "inputs": inputs or {}
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=self.headers, json=payload) as resp:
                if resp.status == 204:
                    return "Workflow triggered successfully"
                else:
                    error = await resp.text()
                    raise Exception(f"Failed to trigger workflow: {error}")
    
    async def get_workflow_run_status(self, run_id: int) -> Dict:
        """Get status of a workflow run"""
        url = f"{self.api_base}/repos/{self.repo_owner}/{self.repo_name}/actions/runs/{run_id}"
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=self.headers) as resp:
                if resp.status == 200:
                    return await resp.json()
                else:
                    raise Exception(f"Failed to get workflow status: {resp.status}")
    
    async def create_deployment(self, environment: str, payload: Dict) -> Dict:
        """Create a GitHub deployment"""
        url = f"{self.api_base}/repos/{self.repo_owner}/{self.repo_name}/deployments"
        
        deployment_data = {
            "ref": payload.get("ref", "main"),
            "environment": environment,
            "payload": payload,
            "description": f"GitOps automated deployment to {environment}",
            "auto_merge": False,
            "required_contexts": []
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=self.headers, json=deployment_data) as resp:
                if resp.status == 201:
                    return await resp.json()
                else:
                    error = await resp.text()
                    raise Exception(f"Failed to create deployment: {error}")


# Example usage
if __name__ == "__main__":
    bridge = GitHubActionsBridge(
        github_token=os.environ.get("GITHUB_TOKEN", ""),
        repo_owner="homelab",
        repo_name="test-repo"
    )
    
    # Example pipeline definition
    pipeline = {
        "name": "Test Pipeline",
        "triggers": [{"push": {"branches": ["main", "develop"]}}],
        "stages": [
            {
                "name": "Build",
                "jobs": [
                    {"name": "Build App", "script": "npm run build"}
                ]
            }
        ]
    }
    
    # Convert to GitHub Actions
    workflow_yaml = asyncio.run(bridge.create_workflow(pipeline))
    print(workflow_yaml)
EOF

# Deploy to production
echo -e "\n${BLUE}[INFO]${NC} Deploying pipeline engine to production..."
ssh "${DEPLOYMENT_USER}@${PRODUCTION_SERVER}" "mkdir -p ${DEPLOYMENT_DIR}/.mcp/pipeline-engine/templates"

# Copy pipeline engine files
scp -r "${PROJECT_ROOT}/.mcp/pipeline-engine/"* \
    "${DEPLOYMENT_USER}@${PRODUCTION_SERVER}:${DEPLOYMENT_DIR}/.mcp/pipeline-engine/"

# Make scripts executable
ssh "${DEPLOYMENT_USER}@${PRODUCTION_SERVER}" << EOF
chmod +x ${DEPLOYMENT_DIR}/.mcp/pipeline-engine/*.py
# Install Python dependencies
cd ${DEPLOYMENT_DIR}
pip3 install aiohttp pyyaml
EOF

# Create pipeline CLI tool
echo -e "\n${BLUE}[INFO]${NC} Creating pipeline CLI tool..."
cat > "${PROJECT_ROOT}/scripts/gitops-pipeline" << 'EOF'
#!/bin/bash
# GitOps Pipeline CLI Tool

PIPELINE_ENGINE="/opt/gitops/.mcp/pipeline-engine/pipeline-orchestrator.py"

case "$1" in
    create)
        python3 "$PIPELINE_ENGINE" create "$@"
        ;;
    execute)
        python3 "$PIPELINE_ENGINE" execute "$@"
        ;;
    status)
        python3 "$PIPELINE_ENGINE" status "$@"
        ;;
    list)
        python3 "$PIPELINE_ENGINE" list "$@"
        ;;
    *)
        echo "Usage: gitops-pipeline {create|execute|status|list} [options]"
        exit 1
        ;;
esac
EOF

chmod +x "${PROJECT_ROOT}/scripts/gitops-pipeline"
scp "${PROJECT_ROOT}/scripts/gitops-pipeline" \
    "${DEPLOYMENT_USER}@${PRODUCTION_SERVER}:/usr/local/bin/"

echo -e "${GREEN}✅ Phase 2.2 Pipeline Engine deployed successfully${NC}"