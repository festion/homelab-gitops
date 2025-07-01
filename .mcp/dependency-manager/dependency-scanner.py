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
