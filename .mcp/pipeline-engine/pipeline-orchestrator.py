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
