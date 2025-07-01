#!/bin/bash
# deploy-dependencies.sh - Deploy Phase 2 Dependency Management System

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

echo -e "${GREEN}🔗 Phase 2.3: Dependency Management System${NC}"
echo -e "${BLUE}Target: ${PRODUCTION_SERVER}:${DEPLOYMENT_DIR}/.mcp/dependency-manager${NC}"

# Create dependency manager structure
echo -e "\n${BLUE}[INFO]${NC} Creating dependency management components..."
mkdir -p "${PROJECT_ROOT}/.mcp/dependency-manager"

# Dependency Scanner
cat > "${PROJECT_ROOT}/.mcp/dependency-manager/dependency-scanner.py" << 'EOF'
#!/usr/bin/env python3
"""
Dependency Scanner - Discovers and tracks dependencies across repositories
"""

import json
import logging
import os
import re
import sqlite3
from pathlib import Path
from typing import Dict, List, Set, Tuple
import subprocess
import toml
import yaml

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DependencyType:
    NPM = "npm"
    GIT = "git"
    DOCKER = "docker"
    API = "api"
    CONFIG = "config"
    DATA = "data"


class DependencyScanner:
    def __init__(self, db_path: str = ".mcp/dependency-manager/dependencies.db"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_database()
        
    def _init_database(self):
        """Initialize dependency database"""
        conn = sqlite3.connect(self.db_path)
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS repository_dependencies (
                id TEXT PRIMARY KEY,
                source_repo TEXT NOT NULL,
                target_repo TEXT NOT NULL,
                dependency_type TEXT NOT NULL,
                version_constraint TEXT,
                impact_level TEXT DEFAULT 'medium',
                discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_validated TIMESTAMP,
                metadata TEXT
            );
            
            CREATE TABLE IF NOT EXISTS dependency_changes (
                id TEXT PRIMARY KEY,
                dependency_id TEXT NOT NULL,
                change_type TEXT NOT NULL,
                old_version TEXT,
                new_version TEXT,
                detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                impact_analysis TEXT,
                FOREIGN KEY (dependency_id) REFERENCES repository_dependencies(id)
            );
            
            CREATE INDEX IF NOT EXISTS idx_source_repo ON repository_dependencies(source_repo);
            CREATE INDEX IF NOT EXISTS idx_target_repo ON repository_dependencies(target_repo);
        """)
        conn.close()
    
    def scan_repository(self, repo_path: str) -> List[Dict]:
        """Scan a repository for all types of dependencies"""
        repo_path = Path(repo_path)
        if not repo_path.exists():
            raise ValueError(f"Repository path does not exist: {repo_path}")
        
        repo_name = repo_path.name
        dependencies = []
        
        # Scan for different dependency types
        dependencies.extend(self._scan_npm_dependencies(repo_path, repo_name))
        dependencies.extend(self._scan_git_dependencies(repo_path, repo_name))
        dependencies.extend(self._scan_docker_dependencies(repo_path, repo_name))
        dependencies.extend(self._scan_api_dependencies(repo_path, repo_name))
        dependencies.extend(self._scan_config_dependencies(repo_path, repo_name))
        
        # Store in database
        self._store_dependencies(dependencies)
        
        logger.info(f"Found {len(dependencies)} dependencies in {repo_name}")
        return dependencies
    
    def _scan_npm_dependencies(self, repo_path: Path, repo_name: str) -> List[Dict]:
        """Scan package.json for NPM dependencies"""
        dependencies = []
        package_json = repo_path / "package.json"
        
        if package_json.exists():
            try:
                with open(package_json) as f:
                    data = json.load(f)
                
                # Process dependencies
                for dep_name, version in data.get("dependencies", {}).items():
                    # Check if it's a local dependency
                    if version.startswith("file:") or version.startswith("link:"):
                        target_path = version.split(":", 1)[1]
                        target_repo = Path(target_path).name
                        dependencies.append({
                            "source_repo": repo_name,
                            "target_repo": target_repo,
                            "dependency_type": DependencyType.NPM,
                            "version_constraint": version,
                            "impact_level": "high",
                            "metadata": {"package": dep_name, "local": True}
                        })
                    # Check if it's a git dependency
                    elif version.startswith("git+") or "github.com" in version:
                        repo_match = re.search(r'github\.com[:/]([^/]+)/([^.]+)', version)
                        if repo_match:
                            target_repo = repo_match.group(2)
                            dependencies.append({
                                "source_repo": repo_name,
                                "target_repo": target_repo,
                                "dependency_type": DependencyType.NPM,
                                "version_constraint": version,
                                "impact_level": "medium",
                                "metadata": {"package": dep_name, "git": True}
                            })
                
            except Exception as e:
                logger.error(f"Error scanning package.json: {e}")
        
        return dependencies
    
    def _scan_git_dependencies(self, repo_path: Path, repo_name: str) -> List[Dict]:
        """Scan for git submodules"""
        dependencies = []
        gitmodules = repo_path / ".gitmodules"
        
        if gitmodules.exists():
            try:
                # Parse .gitmodules file
                config = subprocess.run(
                    ["git", "config", "-f", str(gitmodules), "--list"],
                    capture_output=True, text=True, cwd=repo_path
                ).stdout
                
                submodules = {}
                for line in config.splitlines():
                    if "submodule." in line:
                        key, value = line.split("=", 1)
                        parts = key.split(".")
                        if len(parts) >= 3:
                            name = parts[1]
                            prop = parts[2]
                            if name not in submodules:
                                submodules[name] = {}
                            submodules[name][prop] = value
                
                # Create dependencies from submodules
                for name, props in submodules.items():
                    if "url" in props:
                        url = props["url"]
                        repo_match = re.search(r'([^/]+?)(?:\.git)?$', url)
                        if repo_match:
                            target_repo = repo_match.group(1)
                            dependencies.append({
                                "source_repo": repo_name,
                                "target_repo": target_repo,
                                "dependency_type": DependencyType.GIT,
                                "version_constraint": props.get("branch", "main"),
                                "impact_level": "high",
                                "metadata": {
                                    "path": props.get("path", name),
                                    "url": url
                                }
                            })
                
            except Exception as e:
                logger.error(f"Error scanning git submodules: {e}")
        
        return dependencies
    
    def _scan_docker_dependencies(self, repo_path: Path, repo_name: str) -> List[Dict]:
        """Scan Dockerfile and docker-compose for dependencies"""
        dependencies = []
        
        # Scan Dockerfiles
        for dockerfile in repo_path.glob("**/Dockerfile*"):
            try:
                with open(dockerfile) as f:
                    content = f.read()
                
                # Find FROM statements
                from_matches = re.findall(r'FROM\s+([^\s]+)', content)
                for image in from_matches:
                    # Check if it's a local build
                    if "/" not in image and ":" not in image:
                        continue
                    
                    # Extract repository name from image
                    if ":" in image:
                        image_name = image.split(":")[0]
                    else:
                        image_name = image
                    
                    # Check for local registry or known patterns
                    if image_name.startswith("localhost/") or image_name.startswith("registry.local/"):
                        target_repo = image_name.split("/")[-1]
                        dependencies.append({
                            "source_repo": repo_name,
                            "target_repo": target_repo,
                            "dependency_type": DependencyType.DOCKER,
                            "version_constraint": image,
                            "impact_level": "high",
                            "metadata": {
                                "dockerfile": str(dockerfile.relative_to(repo_path)),
                                "image": image
                            }
                        })
                
            except Exception as e:
                logger.error(f"Error scanning Dockerfile: {e}")
        
        # Scan docker-compose files
        for compose_file in repo_path.glob("**/docker-compose*.y*ml"):
            try:
                with open(compose_file) as f:
                    data = yaml.safe_load(f)
                
                if data and "services" in data:
                    for service_name, service in data["services"].items():
                        if "image" in service:
                            image = service["image"]
                            # Similar logic as Dockerfile
                            if "localhost/" in image or "registry.local/" in image:
                                target_repo = image.split("/")[-1].split(":")[0]
                                dependencies.append({
                                    "source_repo": repo_name,
                                    "target_repo": target_repo,
                                    "dependency_type": DependencyType.DOCKER,
                                    "version_constraint": image,
                                    "impact_level": "medium",
                                    "metadata": {
                                        "compose_file": str(compose_file.relative_to(repo_path)),
                                        "service": service_name
                                    }
                                })
                        
                        # Check for build context dependencies
                        if "build" in service and isinstance(service["build"], dict):
                            context = service["build"].get("context", ".")
                            if context.startswith("../"):
                                target_repo = Path(context).name
                                dependencies.append({
                                    "source_repo": repo_name,
                                    "target_repo": target_repo,
                                    "dependency_type": DependencyType.DOCKER,
                                    "version_constraint": "build",
                                    "impact_level": "high",
                                    "metadata": {
                                        "compose_file": str(compose_file.relative_to(repo_path)),
                                        "service": service_name,
                                        "build_context": context
                                    }
                                })
                
            except Exception as e:
                logger.error(f"Error scanning docker-compose: {e}")
        
        return dependencies
    
    def _scan_api_dependencies(self, repo_path: Path, repo_name: str) -> List[Dict]:
        """Scan for API endpoint dependencies in configuration files"""
        dependencies = []
        
        # Common config file patterns
        config_patterns = ["**/*.json", "**/*.yaml", "**/*.yml", "**/*.toml", 
                          "**/*.env", "**/*.config"]
        
        api_patterns = [
            r'https?://([^/]+)/api',
            r'api\.([^/\s]+)',
            r'endpoint["\']?\s*[:=]\s*["\']([^"\']+)',
            r'base_url["\']?\s*[:=]\s*["\']([^"\']+)'
        ]
        
        for pattern in config_patterns:
            for config_file in repo_path.glob(pattern):
                if "node_modules" in str(config_file) or ".git" in str(config_file):
                    continue
                
                try:
                    with open(config_file, encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                    
                    # Search for API patterns
                    for api_pattern in api_patterns:
                        matches = re.findall(api_pattern, content, re.IGNORECASE)
                        for match in matches:
                            # Try to extract service name
                            service_match = re.search(r'([a-zA-Z0-9_-]+)(?:-api|-service)?', match)
                            if service_match:
                                target_service = service_match.group(1)
                                # Check if it looks like an internal service
                                if not any(x in match for x in ['.com', '.org', '.net', 'localhost']):
                                    dependencies.append({
                                        "source_repo": repo_name,
                                        "target_repo": f"{target_service}-api",
                                        "dependency_type": DependencyType.API,
                                        "version_constraint": "latest",
                                        "impact_level": "high",
                                        "metadata": {
                                            "config_file": str(config_file.relative_to(repo_path)),
                                            "endpoint": match
                                        }
                                    })
                
                except Exception as e:
                    logger.debug(f"Error scanning {config_file}: {e}")
        
        return dependencies
    
    def _scan_config_dependencies(self, repo_path: Path, repo_name: str) -> List[Dict]:
        """Scan for shared configuration file dependencies"""
        dependencies = []
        
        # Look for symlinks to external configs
        for item in repo_path.rglob("*"):
            if item.is_symlink():
                target = item.resolve()
                if target.exists() and not target.is_relative_to(repo_path):
                    # Extract repository from path
                    parts = target.parts
                    for i, part in enumerate(parts):
                        if part == "repos" and i + 1 < len(parts):
                            target_repo = parts[i + 1]
                            dependencies.append({
                                "source_repo": repo_name,
                                "target_repo": target_repo,
                                "dependency_type": DependencyType.CONFIG,
                                "version_constraint": "symlink",
                                "impact_level": "medium",
                                "metadata": {
                                    "symlink": str(item.relative_to(repo_path)),
                                    "target": str(target)
                                }
                            })
                            break
        
        # Look for references to shared config repos
        config_refs = ["shared-config", "common-config", "config-repo", "infrastructure"]
        for ref in config_refs:
            for config_file in repo_path.glob("**/*.{json,yaml,yml,toml}"):
                if "node_modules" in str(config_file) or ".git" in str(config_file):
                    continue
                
                try:
                    with open(config_file, encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                    
                    if ref in content:
                        dependencies.append({
                            "source_repo": repo_name,
                            "target_repo": ref,
                            "dependency_type": DependencyType.CONFIG,
                            "version_constraint": "reference",
                            "impact_level": "low",
                            "metadata": {
                                "config_file": str(config_file.relative_to(repo_path)),
                                "reference": ref
                            }
                        })
                        break
                
                except Exception:
                    pass
        
        return dependencies
    
    def _store_dependencies(self, dependencies: List[Dict]):
        """Store discovered dependencies in database"""
        conn = sqlite3.connect(self.db_path)
        
        for dep in dependencies:
            # Generate unique ID
            dep_id = f"{dep['source_repo']}_{dep['target_repo']}_{dep['dependency_type']}"
            
            # Check if dependency exists
            cursor = conn.execute(
                "SELECT id FROM repository_dependencies WHERE id = ?", (dep_id,)
            )
            exists = cursor.fetchone() is not None
            
            if exists:
                # Update existing dependency
                conn.execute("""
                    UPDATE repository_dependencies 
                    SET version_constraint = ?, last_validated = CURRENT_TIMESTAMP,
                        metadata = ?
                    WHERE id = ?
                """, (dep.get('version_constraint'), 
                     json.dumps(dep.get('metadata', {})), dep_id))
            else:
                # Insert new dependency
                conn.execute("""
                    INSERT INTO repository_dependencies 
                    (id, source_repo, target_repo, dependency_type, version_constraint,
                     impact_level, metadata)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (dep_id, dep['source_repo'], dep['target_repo'],
                     dep['dependency_type'], dep.get('version_constraint'),
                     dep.get('impact_level', 'medium'),
                     json.dumps(dep.get('metadata', {}))))
        
        conn.commit()
        conn.close()
    
    def get_repository_dependencies(self, repo_name: str) -> List[Dict]:
        """Get all dependencies for a repository"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.execute("""
            SELECT * FROM repository_dependencies 
            WHERE source_repo = ? OR target_repo = ?
            ORDER BY impact_level DESC, dependency_type
        """, (repo_name, repo_name))
        
        dependencies = []
        for row in cursor:
            dependencies.append({
                "id": row[0],
                "source_repo": row[1],
                "target_repo": row[2],
                "dependency_type": row[3],
                "version_constraint": row[4],
                "impact_level": row[5],
                "discovered_at": row[6],
                "last_validated": row[7],
                "metadata": json.loads(row[8]) if row[8] else {}
            })
        
        conn.close()
        return dependencies
    
    def build_dependency_graph(self) -> Dict:
        """Build complete dependency graph"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.execute("SELECT * FROM repository_dependencies")
        
        graph = {
            "nodes": set(),
            "edges": [],
            "by_type": {},
            "impact_summary": {}
        }
        
        for row in cursor:
            source = row[1]
            target = row[2]
            dep_type = row[3]
            impact = row[5]
            
            # Add nodes
            graph["nodes"].add(source)
            graph["nodes"].add(target)
            
            # Add edge
            graph["edges"].append({
                "source": source,
                "target": target,
                "type": dep_type,
                "impact": impact,
                "version": row[4]
            })
            
            # Group by type
            if dep_type not in graph["by_type"]:
                graph["by_type"][dep_type] = []
            graph["by_type"][dep_type].append({
                "source": source,
                "target": target
            })
            
            # Impact summary
            if impact not in graph["impact_summary"]:
                graph["impact_summary"][impact] = 0
            graph["impact_summary"][impact] += 1
        
        graph["nodes"] = list(graph["nodes"])
        conn.close()
        return graph


# Command-line interface
if __name__ == "__main__":
    import sys
    
    scanner = DependencyScanner()
    
    if len(sys.argv) < 2:
        print("Usage: dependency-scanner.py <command> [args]")
        print("Commands: scan <repo_path>, list <repo_name>, graph")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "scan" and len(sys.argv) >= 3:
        repo_path = sys.argv[2]
        dependencies = scanner.scan_repository(repo_path)
        print(f"Scanned {repo_path}: {len(dependencies)} dependencies found")
        
    elif command == "list" and len(sys.argv) >= 3:
        repo_name = sys.argv[2]
        dependencies = scanner.get_repository_dependencies(repo_name)
        for dep in dependencies:
            direction = "→" if dep["source_repo"] == repo_name else "←"
            other = dep["target_repo"] if dep["source_repo"] == repo_name else dep["source_repo"]
            print(f"{dep['dependency_type']:8} {direction} {other:20} [{dep['impact_level']}]")
            
    elif command == "graph":
        graph = scanner.build_dependency_graph()
        print(f"Dependency Graph:")
        print(f"  Nodes: {len(graph['nodes'])}")
        print(f"  Edges: {len(graph['edges'])}")
        print(f"  Impact: {graph['impact_summary']}")
        print(f"  Types: {list(graph['by_type'].keys())}")
        
    else:
        print("Invalid command or arguments")
        sys.exit(1)
EOF

# Impact Analyzer
cat > "${PROJECT_ROOT}/.mcp/dependency-manager/impact-analyzer.py" << 'EOF'
#!/usr/bin/env python3
"""
Impact Analyzer - Analyzes the impact of changes across dependent repositories
"""

import json
import logging
import sqlite3
from collections import defaultdict, deque
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Set, Tuple

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ImpactLevel:
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    
    @staticmethod
    def combine(level1: str, level2: str) -> str:
        """Combine two impact levels, returning the higher one"""
        levels = [ImpactLevel.LOW, ImpactLevel.MEDIUM, 
                 ImpactLevel.HIGH, ImpactLevel.CRITICAL]
        idx1 = levels.index(level1) if level1 in levels else 0
        idx2 = levels.index(level2) if level2 in levels else 0
        return levels[max(idx1, idx2)]


class ImpactAnalyzer:
    def __init__(self, db_path: str = ".mcp/dependency-manager/dependencies.db"):
        self.db_path = Path(db_path)
        self.dependency_graph = None
        self._load_dependencies()
    
    def _load_dependencies(self):
        """Load dependency graph from database"""
        self.dependency_graph = defaultdict(list)
        self.reverse_graph = defaultdict(list)
        self.dependency_details = {}
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.execute("SELECT * FROM repository_dependencies")
        
        for row in cursor:
            dep_id = row[0]
            source = row[1]
            target = row[2]
            dep_type = row[3]
            impact = row[5]
            
            # Build forward and reverse graphs
            self.dependency_graph[source].append({
                "target": target,
                "type": dep_type,
                "impact": impact,
                "id": dep_id
            })
            
            self.reverse_graph[target].append({
                "source": source,
                "type": dep_type,
                "impact": impact,
                "id": dep_id
            })
            
            # Store dependency details
            self.dependency_details[dep_id] = {
                "source": source,
                "target": target,
                "type": dep_type,
                "impact": impact,
                "version": row[4],
                "metadata": json.loads(row[8]) if row[8] else {}
            }
        
        conn.close()
    
    def analyze_change_impact(self, changed_repo: str, 
                            change_type: str = "update") -> Dict:
        """Analyze the impact of changes in a repository"""
        impact_analysis = {
            "changed_repository": changed_repo,
            "change_type": change_type,
            "direct_impact": [],
            "transitive_impact": [],
            "affected_repositories": set(),
            "impact_paths": [],
            "risk_assessment": {},
            "recommendations": []
        }
        
        # Find directly dependent repositories
        direct_deps = self.reverse_graph.get(changed_repo, [])
        for dep in direct_deps:
            impact_analysis["direct_impact"].append({
                "repository": dep["source"],
                "dependency_type": dep["type"],
                "impact_level": dep["impact"],
                "reason": f"Directly depends on {changed_repo}"
            })
            impact_analysis["affected_repositories"].add(dep["source"])
        
        # Calculate transitive impact using BFS
        visited = set([changed_repo])
        queue = deque([(dep["source"], [changed_repo, dep["source"]], dep["impact"]) 
                      for dep in direct_deps])
        
        while queue:
            current_repo, path, accumulated_impact = queue.popleft()
            
            if current_repo in visited:
                continue
            
            visited.add(current_repo)
            
            # Check dependencies of current repository
            for dep in self.reverse_graph.get(current_repo, []):
                if dep["source"] not in visited:
                    new_path = path + [dep["source"]]
                    new_impact = ImpactLevel.combine(accumulated_impact, dep["impact"])
                    
                    queue.append((dep["source"], new_path, new_impact))
                    
                    impact_analysis["transitive_impact"].append({
                        "repository": dep["source"],
                        "dependency_path": " → ".join(new_path),
                        "impact_level": new_impact,
                        "distance": len(new_path) - 1
                    })
                    impact_analysis["affected_repositories"].add(dep["source"])
                    impact_analysis["impact_paths"].append(new_path)
        
        # Calculate risk assessment
        impact_analysis["risk_assessment"] = self._assess_risk(impact_analysis)
        
        # Generate recommendations
        impact_analysis["recommendations"] = self._generate_recommendations(
            impact_analysis, change_type
        )
        
        impact_analysis["affected_repositories"] = list(
            impact_analysis["affected_repositories"]
        )
        
        return impact_analysis
    
    def _assess_risk(self, impact_analysis: Dict) -> Dict:
        """Assess the risk level of the change"""
        risk_score = 0
        risk_factors = []
        
        # Factor 1: Number of affected repositories
        affected_count = len(impact_analysis["affected_repositories"])
        if affected_count > 10:
            risk_score += 30
            risk_factors.append("High number of affected repositories")
        elif affected_count > 5:
            risk_score += 20
            risk_factors.append("Moderate number of affected repositories")
        elif affected_count > 0:
            risk_score += 10
            risk_factors.append("Some repositories affected")
        
        # Factor 2: Critical dependencies
        critical_deps = [
            dep for dep in impact_analysis["direct_impact"] 
            if dep["impact_level"] == ImpactLevel.CRITICAL
        ]
        if critical_deps:
            risk_score += 40
            risk_factors.append(f"{len(critical_deps)} critical dependencies affected")
        
        # Factor 3: Dependency types
        dep_types = set()
        for dep in impact_analysis["direct_impact"]:
            dep_types.add(dep["dependency_type"])
        
        if "docker" in dep_types:
            risk_score += 15
            risk_factors.append("Docker image dependencies affected")
        if "api" in dep_types:
            risk_score += 20
            risk_factors.append("API dependencies affected")
        
        # Determine risk level
        if risk_score >= 70:
            risk_level = "HIGH"
        elif risk_score >= 40:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
        
        return {
            "risk_level": risk_level,
            "risk_score": risk_score,
            "risk_factors": risk_factors,
            "mitigation_priority": self._get_mitigation_priority(risk_level)
        }
    
    def _get_mitigation_priority(self, risk_level: str) -> List[str]:
        """Get mitigation priorities based on risk level"""
        if risk_level == "HIGH":
            return [
                "Immediate testing of all critical dependencies",
                "Staged rollout with monitoring",
                "Prepare rollback plan",
                "Notify all affected teams"
            ]
        elif risk_level == "MEDIUM":
            return [
                "Test primary dependencies",
                "Monitor deployment closely",
                "Have rollback plan ready"
            ]
        else:
            return [
                "Standard testing procedures",
                "Normal deployment process"
            ]
    
    def _generate_recommendations(self, impact_analysis: Dict, 
                                change_type: str) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        # Based on change type
        if change_type == "breaking":
            recommendations.append(
                "⚠️  Breaking change detected - coordinate with all dependent teams"
            )
            recommendations.append(
                "Create migration guide for dependent repositories"
            )
        
        # Based on affected repositories
        affected_count = len(impact_analysis["affected_repositories"])
        if affected_count > 5:
            recommendations.append(
                f"Consider phased rollout - {affected_count} repositories affected"
            )
        
        # Based on dependency types
        dep_types = set()
        for dep in impact_analysis["direct_impact"]:
            dep_types.add(dep["dependency_type"])
        
        if "api" in dep_types:
            recommendations.append(
                "Ensure API backward compatibility or version the API"
            )
        
        if "docker" in dep_types:
            recommendations.append(
                "Update Docker images and test container deployments"
            )
        
        # Based on risk assessment
        risk_level = impact_analysis["risk_assessment"]["risk_level"]
        if risk_level == "HIGH":
            recommendations.append(
                "Schedule change during maintenance window"
            )
            recommendations.append(
                "Prepare detailed rollback procedures"
            )
        
        return recommendations
    
    def find_circular_dependencies(self) -> List[List[str]]:
        """Find circular dependencies in the graph"""
        cycles = []
        visited = set()
        rec_stack = set()
        
        def dfs(node: str, path: List[str]):
            visited.add(node)
            rec_stack.add(node)
            path.append(node)
            
            for dep in self.dependency_graph.get(node, []):
                target = dep["target"]
                
                if target not in visited:
                    if dfs(target, path.copy()):
                        return True
                elif target in rec_stack:
                    # Found a cycle
                    cycle_start = path.index(target)
                    cycle = path[cycle_start:] + [target]
                    cycles.append(cycle)
            
            path.pop()
            rec_stack.remove(node)
            return False
        
        # Check all nodes
        all_nodes = set(self.dependency_graph.keys()) | set(self.reverse_graph.keys())
        for node in all_nodes:
            if node not in visited:
                dfs(node, [])
        
        return cycles
    
    def get_dependency_chain(self, source: str, target: str) -> List[List[str]]:
        """Find all dependency chains between two repositories"""
        paths = []
        
        def dfs(current: str, target: str, path: List[str], visited: Set[str]):
            if current == target:
                paths.append(path.copy())
                return
            
            if current in visited:
                return
            
            visited.add(current)
            
            for dep in self.dependency_graph.get(current, []):
                next_repo = dep["target"]
                if next_repo not in visited:
                    path.append(next_repo)
                    dfs(next_repo, target, path, visited.copy())
                    path.pop()
        
        dfs(source, target, [source], set())
        return paths
    
    def calculate_repository_importance(self) -> Dict[str, float]:
        """Calculate importance score for each repository based on dependencies"""
        importance = defaultdict(float)
        all_repos = set(self.dependency_graph.keys()) | set(self.reverse_graph.keys())
        
        # Base score: number of dependents
        for repo in all_repos:
            dependents = len(self.reverse_graph.get(repo, []))
            importance[repo] = dependents * 10
        
        # Bonus for critical dependencies
        for repo, deps in self.reverse_graph.items():
            for dep in deps:
                if dep["impact"] == ImpactLevel.CRITICAL:
                    importance[repo] += 5
                elif dep["impact"] == ImpactLevel.HIGH:
                    importance[repo] += 3
        
        # PageRank-style propagation
        damping = 0.85
        iterations = 10
        
        for _ in range(iterations):
            new_importance = defaultdict(float)
            
            for repo in all_repos:
                rank = (1 - damping) + damping * sum(
                    importance[dep["source"]] / len(self.dependency_graph.get(dep["source"], [1]))
                    for dep in self.reverse_graph.get(repo, [])
                )
                new_importance[repo] = rank
            
            importance = new_importance
        
        # Normalize scores
        max_score = max(importance.values()) if importance else 1
        for repo in importance:
            importance[repo] = (importance[repo] / max_score) * 100
        
        return dict(importance)


# CLI interface
if __name__ == "__main__":
    import sys
    
    analyzer = ImpactAnalyzer()
    
    if len(sys.argv) < 2:
        print("Usage: impact-analyzer.py <command> [args]")
        print("Commands: analyze <repo>, circular, chain <source> <target>, importance")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "analyze" and len(sys.argv) >= 3:
        repo = sys.argv[2]
        change_type = sys.argv[3] if len(sys.argv) > 3 else "update"
        
        analysis = analyzer.analyze_change_impact(repo, change_type)
        
        print(f"\nImpact Analysis for {repo} ({change_type})")
        print("=" * 50)
        print(f"Risk Level: {analysis['risk_assessment']['risk_level']}")
        print(f"Affected Repositories: {len(analysis['affected_repositories'])}")
        
        if analysis['direct_impact']:
            print("\nDirect Impact:")
            for impact in analysis['direct_impact']:
                print(f"  - {impact['repository']} [{impact['impact_level']}] via {impact['dependency_type']}")
        
        if analysis['recommendations']:
            print("\nRecommendations:")
            for rec in analysis['recommendations']:
                print(f"  • {rec}")
    
    elif command == "circular":
        cycles = analyzer.find_circular_dependencies()
        if cycles:
            print("Circular Dependencies Found:")
            for cycle in cycles:
                print(f"  {' → '.join(cycle)}")
        else:
            print("No circular dependencies found")
    
    elif command == "chain" and len(sys.argv) >= 4:
        source = sys.argv[2]
        target = sys.argv[3]
        chains = analyzer.get_dependency_chain(source, target)
        
        if chains:
            print(f"Dependency chains from {source} to {target}:")
            for chain in chains:
                print(f"  {' → '.join(chain)}")
        else:
            print(f"No dependency chain found from {source} to {target}")
    
    elif command == "importance":
        scores = analyzer.calculate_repository_importance()
        sorted_repos = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        
        print("Repository Importance Scores:")
        for repo, score in sorted_repos[:10]:
            print(f"  {repo:30} {score:6.2f}")
    
    else:
        print("Invalid command or arguments")
        sys.exit(1)
EOF

# Coordination Engine
cat > "${PROJECT_ROOT}/.mcp/dependency-manager/coordination-engine.py" << 'EOF'
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
EOF

# Make scripts executable
chmod +x "${PROJECT_ROOT}/.mcp/dependency-manager/"*.py

# Deploy to production
echo -e "\n${BLUE}[INFO]${NC} Deploying dependency manager to production..."
ssh "${DEPLOYMENT_USER}@${PRODUCTION_SERVER}" "mkdir -p ${DEPLOYMENT_DIR}/.mcp/dependency-manager"

scp -r "${PROJECT_ROOT}/.mcp/dependency-manager/"* \
    "${DEPLOYMENT_USER}@${PRODUCTION_SERVER}:${DEPLOYMENT_DIR}/.mcp/dependency-manager/"

# Install dependencies on production
ssh "${DEPLOYMENT_USER}@${PRODUCTION_SERVER}" << EOF
cd ${DEPLOYMENT_DIR}
chmod +x .mcp/dependency-manager/*.py
pip3 install toml pyyaml
EOF

# Create dependency CLI tool
echo -e "\n${BLUE}[INFO]${NC} Creating dependency CLI tool..."
cat > "${PROJECT_ROOT}/scripts/gitops-deps" << 'EOF'
#!/bin/bash
# GitOps Dependency Management CLI Tool

DEPS_DIR="/opt/gitops/.mcp/dependency-manager"

case "$1" in
    scan)
        shift
        python3 "$DEPS_DIR/dependency-scanner.py" scan "$@"
        ;;
    analyze)
        shift
        python3 "$DEPS_DIR/impact-analyzer.py" analyze "$@"
        ;;
    coordinate)
        shift
        python3 "$DEPS_DIR/coordination-engine.py" plan "$@"
        ;;
    graph)
        python3 "$DEPS_DIR/dependency-scanner.py" graph
        ;;
    *)
        echo "Usage: gitops-deps {scan|analyze|coordinate|graph} [options]"
        echo ""
        echo "Commands:"
        echo "  scan <repo>      - Scan repository for dependencies"
        echo "  analyze <repo>   - Analyze change impact for repository"
        echo "  coordinate       - Plan coordinated change across repos"
        echo "  graph           - Show dependency graph summary"
        exit 1
        ;;
esac
EOF

chmod +x "${PROJECT_ROOT}/scripts/gitops-deps"
scp "${PROJECT_ROOT}/scripts/gitops-deps" \
    "${DEPLOYMENT_USER}@${PRODUCTION_SERVER}:/usr/local/bin/"

echo -e "${GREEN}✅ Phase 2.3 Dependency Management deployed successfully${NC}"