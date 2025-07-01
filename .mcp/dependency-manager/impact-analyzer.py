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
