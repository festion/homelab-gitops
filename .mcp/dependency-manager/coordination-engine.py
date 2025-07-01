#!/usr/bin/env python3
"""
Coordination Engine - Orchestrates changes across multiple dependent repositories
"""

import asyncio
import json
import logging
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Dict, List, Optional, Set
import subprocess

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CoordinationStatus(Enum):
    PLANNING = "planning"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    ROLLED_BACK = "rolled_back"


class CoordinationEngine:
    def __init__(self, dependency_db: str = ".mcp/dependency-manager/dependencies.db"):
        self.dependency_db = Path(dependency_db)
        self.active_coordinations = {}
        
    async def plan_coordinated_change(self, 
                                    primary_repo: str,
                                    change_description: str,
                                    affected_repos: List[str]) -> Dict:
        """Plan a coordinated change across multiple repositories"""
        plan = {
            "id": f"coord_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            "primary_repository": primary_repo,
            "change_description": change_description,
            "affected_repositories": affected_repos,
            "execution_phases": [],
            "rollback_plan": [],
            "estimated_duration": 0,
            "risk_assessment": {}
        }
        
        # Analyze dependencies to determine execution order
        execution_order = await self._determine_execution_order(
            primary_repo, affected_repos
        )
        
        # Create execution phases
        for phase_num, repos in enumerate(execution_order):
            phase = {
                "phase": phase_num + 1,
                "repositories": repos,
                "parallel": len(repos) > 1,
                "actions": []
            }
            
            for repo in repos:
                phase["actions"].append({
                    "repository": repo,
                    "steps": await self._generate_repo_steps(repo, primary_repo, change_description)
                })
            
            plan["execution_phases"].append(phase)
        
        # Generate rollback plan
        plan["rollback_plan"] = self._generate_rollback_plan(plan["execution_phases"])
        
        # Estimate duration
        plan["estimated_duration"] = sum(
            phase.get("estimated_duration", 300) for phase in plan["execution_phases"]
        )
        
        return plan
    
    async def _determine_execution_order(self, primary_repo: str, 
                                       affected_repos: List[str]) -> List[List[str]]:
        """Determine the order of execution based on dependencies"""
        # Simplified topological sort
        # In production, this would use the actual dependency graph
        
        # Phase 1: Primary repository
        phases = [[primary_repo]]
        
        # Phase 2: Direct dependencies
        direct_deps = [repo for repo in affected_repos 
                      if repo != primary_repo and self._is_direct_dependency(repo, primary_repo)]
        if direct_deps:
            phases.append(direct_deps)
        
        # Phase 3: Remaining repositories
        remaining = [repo for repo in affected_repos 
                    if repo != primary_repo and repo not in direct_deps]
        if remaining:
            phases.append(remaining)
        
        return phases
    
    def _is_direct_dependency(self, repo: str, dependency: str) -> bool:
        """Check if repo directly depends on dependency"""
        # Simplified check - in production would query dependency database
        return True
    
    async def _generate_repo_steps(self, repo: str, primary_repo: str, 
                                 change_description: str) -> List[Dict]:
        """Generate execution steps for a repository"""
        steps = []
        
        # Step 1: Create feature branch
        steps.append({
            "name": "Create feature branch",
            "command": f"git checkout -b update-{primary_repo}-{datetime.utcnow().strftime('%Y%m%d')}",
            "type": "git",
            "rollback": "git checkout main"
        })
        
        # Step 2: Update dependencies
        if repo != primary_repo:
            steps.append({
                "name": "Update dependencies",
                "command": "npm update" if self._is_npm_project(repo) else "pip install -U",
                "type": "dependency",
                "rollback": "git checkout -- package-lock.json"
            })
        
        # Step 3: Run tests
        steps.append({
            "name": "Run tests",
            "command": "npm test" if self._is_npm_project(repo) else "pytest",
            "type": "validation",
            "rollback": None
        })
        
        # Step 4: Commit changes
        steps.append({
            "name": "Commit changes",
            "command": f"git commit -am 'Update for {change_description}'",
            "type": "git",
            "rollback": "git reset --hard HEAD~1"
        })
        
        # Step 5: Push and create PR
        steps.append({
            "name": "Create pull request",
            "command": "gh pr create --title 'Coordinated update' --body 'Part of coordinated change'",
            "type": "github",
            "rollback": "gh pr close"
        })
        
        return steps
    
    def _is_npm_project(self, repo: str) -> bool:
        """Check if repository is an npm project"""
        # Simplified check
        return Path(f"repos/{repo}/package.json").exists()
    
    def _generate_rollback_plan(self, execution_phases: List[Dict]) -> List[Dict]:
        """Generate rollback plan from execution phases"""
        rollback_plan = []
        
        # Reverse the phases
        for phase in reversed(execution_phases):
            rollback_phase = {
                "phase": len(rollback_plan) + 1,
                "actions": []
            }
            
            for action in phase["actions"]:
                rollback_steps = []
                for step in reversed(action["steps"]):
                    if step.get("rollback"):
                        rollback_steps.append({
                            "name": f"Rollback: {step['name']}",
                            "command": step["rollback"],
                            "type": step["type"]
                        })
                
                if rollback_steps:
                    rollback_phase["actions"].append({
                        "repository": action["repository"],
                        "steps": rollback_steps
                    })
            
            if rollback_phase["actions"]:
                rollback_plan.append(rollback_phase)
        
        return rollback_plan
    
    async def execute_coordination(self, plan: Dict) -> Dict:
        """Execute a coordinated change plan"""
        coordination_id = plan["id"]
        self.active_coordinations[coordination_id] = {
            "status": CoordinationStatus.IN_PROGRESS,
            "started_at": datetime.utcnow(),
            "completed_phases": [],
            "failed_steps": []
        }
        
        result = {
            "coordination_id": coordination_id,
            "status": CoordinationStatus.IN_PROGRESS,
            "phases_completed": 0,
            "phases_total": len(plan["execution_phases"]),
            "logs": []
        }
        
        try:
            # Execute each phase
            for phase in plan["execution_phases"]:
                phase_result = await self._execute_phase(phase)
                
                if phase_result["success"]:
                    result["phases_completed"] += 1
                    self.active_coordinations[coordination_id]["completed_phases"].append(
                        phase["phase"]
                    )
                else:
                    result["status"] = CoordinationStatus.FAILED
                    result["logs"].append(f"Phase {phase['phase']} failed")
                    
                    # Trigger rollback
                    await self._execute_rollback(plan["rollback_plan"], 
                                               result["phases_completed"])
                    result["status"] = CoordinationStatus.ROLLED_BACK
                    break
                
                result["logs"].extend(phase_result["logs"])
            
            if result["status"] == CoordinationStatus.IN_PROGRESS:
                result["status"] = CoordinationStatus.COMPLETED
                
        except Exception as e:
            logger.error(f"Coordination failed: {e}")
            result["status"] = CoordinationStatus.FAILED
            result["error"] = str(e)
        
        finally:
            self.active_coordinations[coordination_id]["status"] = result["status"]
            self.active_coordinations[coordination_id]["completed_at"] = datetime.utcnow()
        
        return result
    
    async def _execute_phase(self, phase: Dict) -> Dict:
        """Execute a single phase of the coordination plan"""
        result = {
            "phase": phase["phase"],
            "success": True,
            "logs": []
        }
        
        if phase["parallel"]:
            # Execute actions in parallel
            tasks = []
            for action in phase["actions"]:
                tasks.append(self._execute_action(action))
            
            action_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for i, action_result in enumerate(action_results):
                if isinstance(action_result, Exception):
                    result["success"] = False
                    result["logs"].append(f"Action failed: {str(action_result)}")
                elif not action_result["success"]:
                    result["success"] = False
                
                if isinstance(action_result, dict):
                    result["logs"].extend(action_result.get("logs", []))
        else:
            # Execute actions sequentially
            for action in phase["actions"]:
                action_result = await self._execute_action(action)
                
                if not action_result["success"]:
                    result["success"] = False
                    result["logs"].extend(action_result["logs"])
                    break
                
                result["logs"].extend(action_result["logs"])
        
        return result
    
    async def _execute_action(self, action: Dict) -> Dict:
        """Execute a single action (repository changes)"""
        result = {
            "repository": action["repository"],
            "success": True,
            "logs": []
        }
        
        repo_path = f"repos/{action['repository']}"
        
        for step in action["steps"]:
            try:
                result["logs"].append(f"Executing: {step['name']}")
                
                # Execute command
                proc = await asyncio.create_subprocess_shell(
                    step["command"],
                    cwd=repo_path,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                
                stdout, stderr = await proc.communicate()
                
                if proc.returncode != 0:
                    result["success"] = False
                    result["logs"].append(f"Failed: {stderr.decode()}")
                    break
                else:
                    result["logs"].append(f"Success: {step['name']}")
                
            except Exception as e:
                result["success"] = False
                result["logs"].append(f"Error: {str(e)}")
                break
        
        return result
    
    async def _execute_rollback(self, rollback_plan: List[Dict], 
                              phases_to_rollback: int):
        """Execute rollback plan for completed phases"""
        logger.info(f"Executing rollback for {phases_to_rollback} phases")
        
        for i, phase in enumerate(rollback_plan):
            if i >= phases_to_rollback:
                break
            
            await self._execute_phase(phase)


# CLI interface
if __name__ == "__main__":
    import sys
    
    engine = CoordinationEngine()
    
    if len(sys.argv) < 2:
        print("Usage: coordination-engine.py <command> [args]")
        print("Commands: plan <primary_repo> <change> <affected_repos...>")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "plan" and len(sys.argv) >= 4:
        primary_repo = sys.argv[2]
        change_description = sys.argv[3]
        affected_repos = sys.argv[4:] if len(sys.argv) > 4 else []
        
        plan = asyncio.run(engine.plan_coordinated_change(
            primary_repo, change_description, affected_repos
        ))
        
        print(f"\nCoordination Plan: {plan['id']}")
        print("=" * 50)
        print(f"Primary Repository: {plan['primary_repository']}")
        print(f"Change: {plan['change_description']}")
        print(f"Affected Repositories: {', '.join(plan['affected_repositories'])}")
        print(f"\nExecution Phases:")
        
        for phase in plan["execution_phases"]:
            print(f"\nPhase {phase['phase']} ({'parallel' if phase['parallel'] else 'sequential'}):")
            for action in phase["actions"]:
                print(f"  Repository: {action['repository']}")
                for step in action["steps"]:
                    print(f"    - {step['name']}")
        
        print(f"\nEstimated Duration: {plan['estimated_duration']}s")
    
    else:
        print("Invalid command or arguments")
        sys.exit(1)
