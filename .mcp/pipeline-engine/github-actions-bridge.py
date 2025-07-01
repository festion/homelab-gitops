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
