#!/usr/bin/env python3
"""
Intelligent Conflict Resolution System for Template Application

This module provides sophisticated conflict detection and resolution capabilities
for the GitOps Template Application Engine. It handles file conflicts, merge
strategies, and user decision points for complex scenarios.

Version: 1.0.0 (Phase 1B Implementation)
Dependencies: Template Application Engine
License: MIT
"""

import json
import os
import re
import hashlib
import difflib
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any, Set
from dataclasses import dataclass
from enum import Enum
import logging


class ConflictType(Enum):
    """Types of conflicts that can occur during template application"""

    FILE_EXISTS = "file_exists"
    DIRECTORY_MISMATCH = "directory_mismatch"
    CONTENT_CONFLICT = "content_conflict"
    DEPENDENCY_CONFLICT = "dependency_conflict"
    SCRIPT_NAME_COLLISION = "script_name_collision"
    CRITICAL_FILE_OVERWRITE = "critical_file_overwrite"
    PERMISSION_CONFLICT = "permission_conflict"
    ENCODING_CONFLICT = "encoding_conflict"


class ConflictSeverity(Enum):
    """Severity levels for conflicts"""

    LOW = "low"  # Can be auto-resolved
    MEDIUM = "medium"  # Should prompt user but has default
    HIGH = "high"  # Requires user decision
    CRITICAL = "critical"  # Requires explicit user confirmation


class ResolutionStrategy(Enum):
    """Available resolution strategies"""

    AUTO_MERGE = "auto_merge"
    MANUAL_MERGE = "manual_merge"
    TEMPLATE_WINS = "template_wins"
    EXISTING_WINS = "existing_wins"
    SIDE_BY_SIDE = "side_by_side"
    USER_DECISION = "user_decision"
    SKIP_FILE = "skip_file"
    BACKUP_AND_REPLACE = "backup_and_replace"


@dataclass
class ConflictDetail:
    """Detailed information about a specific conflict"""

    type: ConflictType
    severity: ConflictSeverity
    file_path: str
    template_path: str
    existing_path: str
    description: str
    suggested_strategy: ResolutionStrategy
    auto_resolvable: bool
    user_prompt: Optional[str] = None
    resolution_options: List[str] = None
    metadata: Dict[str, Any] = None


@dataclass
class ResolutionResult:
    """Result of conflict resolution"""

    success: bool
    strategy_used: ResolutionStrategy
    action_taken: str
    message: str
    backup_created: Optional[str] = None
    merged_content: Optional[str] = None
    requires_manual_review: bool = False


class ConflictAnalyzer:
    """Analyzes potential conflicts before template application"""

    def __init__(self):
        self.logger = logging.getLogger("ConflictAnalyzer")

        # Critical files that require special handling
        self.critical_files = {
            "CLAUDE.md",
            ".env",
            ".env.local",
            ".env.production",
            "package.json",
            "requirements.txt",
            "Cargo.toml",
            "docker-compose.yml",
            "Dockerfile",
        }

        # Files that support intelligent merging
        self.mergeable_extensions = {
            ".json",
            ".yml",
            ".yaml",
            ".md",
            ".txt",
            ".gitignore",
            ".dockerignore",
        }

    def analyze_file_conflict(
        self, template_file: Path, existing_file: Path
    ) -> ConflictDetail:
        """Analyze conflict between template and existing file"""

        file_name = existing_file.name
        rel_path = str(existing_file.relative_to(existing_file.parent.parent))

        # Determine conflict type and severity
        if not existing_file.exists():
            # No conflict - new file
            return None

        if existing_file.is_dir() and template_file.is_file():
            return ConflictDetail(
                type=ConflictType.DIRECTORY_MISMATCH,
                severity=ConflictSeverity.HIGH,
                file_path=rel_path,
                template_path=str(template_file),
                existing_path=str(existing_file),
                description=f"Directory exists where template expects file: {file_name}",
                suggested_strategy=ResolutionStrategy.USER_DECISION,
                auto_resolvable=False,
                user_prompt=f"Directory '{file_name}' exists. Replace with file?",
                resolution_options=[
                    "Replace directory with file",
                    "Skip template file",
                    "Rename directory",
                ],
            )

        if file_name in self.critical_files:
            return self._analyze_critical_file_conflict(template_file, existing_file)

        # Check for content conflicts
        if self._files_are_identical(template_file, existing_file):
            return None  # No conflict - files are identical

        # Determine merge strategy based on file type
        if existing_file.suffix in self.mergeable_extensions:
            return self._analyze_mergeable_conflict(template_file, existing_file)
        else:
            return self._analyze_binary_conflict(template_file, existing_file)

    def _analyze_critical_file_conflict(
        self, template_file: Path, existing_file: Path
    ) -> ConflictDetail:
        """Analyze conflicts with critical files"""
        file_name = existing_file.name

        if file_name == "CLAUDE.md":
            return ConflictDetail(
                type=ConflictType.CRITICAL_FILE_OVERWRITE,
                severity=ConflictSeverity.CRITICAL,
                file_path=str(existing_file),
                template_path=str(template_file),
                existing_path=str(existing_file),
                description="CLAUDE.md contains project-specific instructions",
                suggested_strategy=ResolutionStrategy.MANUAL_MERGE,
                auto_resolvable=False,
                user_prompt="CLAUDE.md exists with project-specific content. How should it be handled?",
                resolution_options=[
                    "Append template content to existing file",
                    "Create CLAUDE-template.md alongside existing",
                    "Manual merge required",
                    "Skip template CLAUDE.md",
                ],
            )

        elif file_name.startswith(".env"):
            return ConflictDetail(
                type=ConflictType.CRITICAL_FILE_OVERWRITE,
                severity=ConflictSeverity.HIGH,
                file_path=str(existing_file),
                template_path=str(template_file),
                existing_path=str(existing_file),
                description="Environment file contains sensitive configuration",
                suggested_strategy=ResolutionStrategy.SIDE_BY_SIDE,
                auto_resolvable=False,
                user_prompt=f"{file_name} contains environment configuration. How should it be handled?",
                resolution_options=[
                    "Create template version as .env.template",
                    "Merge non-conflicting variables",
                    "Skip template file",
                    "Backup existing and replace",
                ],
            )

        elif file_name == "package.json":
            return ConflictDetail(
                type=ConflictType.DEPENDENCY_CONFLICT,
                severity=ConflictSeverity.MEDIUM,
                file_path=str(existing_file),
                template_path=str(template_file),
                existing_path=str(existing_file),
                description="Package.json contains project-specific dependencies",
                suggested_strategy=ResolutionStrategy.AUTO_MERGE,
                auto_resolvable=True,
                metadata={"merge_type": "package_json"},
            )

        else:
            return ConflictDetail(
                type=ConflictType.CRITICAL_FILE_OVERWRITE,
                severity=ConflictSeverity.HIGH,
                file_path=str(existing_file),
                template_path=str(template_file),
                existing_path=str(existing_file),
                description=f"Critical file {file_name} would be overwritten",
                suggested_strategy=ResolutionStrategy.USER_DECISION,
                auto_resolvable=False,
            )

    def _analyze_mergeable_conflict(
        self, template_file: Path, existing_file: Path
    ) -> ConflictDetail:
        """Analyze conflicts with mergeable files"""
        return ConflictDetail(
            type=ConflictType.CONTENT_CONFLICT,
            severity=ConflictSeverity.LOW,
            file_path=str(existing_file),
            template_path=str(template_file),
            existing_path=str(existing_file),
            description=f"Content differences in mergeable file: {existing_file.name}",
            suggested_strategy=ResolutionStrategy.AUTO_MERGE,
            auto_resolvable=True,
            metadata={"merge_type": existing_file.suffix[1:]},  # Remove the dot
        )

    def _analyze_binary_conflict(
        self, template_file: Path, existing_file: Path
    ) -> ConflictDetail:
        """Analyze conflicts with binary or non-mergeable files"""
        return ConflictDetail(
            type=ConflictType.FILE_EXISTS,
            severity=ConflictSeverity.MEDIUM,
            file_path=str(existing_file),
            template_path=str(template_file),
            existing_path=str(existing_file),
            description=f"Binary or non-mergeable file exists: {existing_file.name}",
            suggested_strategy=ResolutionStrategy.TEMPLATE_WINS,
            auto_resolvable=True,
            user_prompt=f"File '{existing_file.name}' exists. Replace with template version?",
            resolution_options=[
                "Replace with template",
                "Keep existing",
                "Backup and replace",
            ],
        )

    def _files_are_identical(self, file1: Path, file2: Path) -> bool:
        """Check if two files have identical content"""
        try:
            with open(file1, "rb") as f1, open(file2, "rb") as f2:
                return (
                    hashlib.md5(f1.read()).hexdigest()
                    == hashlib.md5(f2.read()).hexdigest()
                )
        except Exception:
            return False

    def detect_script_conflicts(
        self, template_scripts: Dict[str, str], existing_scripts: Dict[str, str]
    ) -> List[ConflictDetail]:
        """Detect conflicts in script definitions (package.json scripts, etc.)"""
        conflicts = []

        for script_name, template_command in template_scripts.items():
            if script_name in existing_scripts:
                existing_command = existing_scripts[script_name]

                if template_command != existing_command:
                    conflicts.append(
                        ConflictDetail(
                            type=ConflictType.SCRIPT_NAME_COLLISION,
                            severity=ConflictSeverity.MEDIUM,
                            file_path=f"scripts.{script_name}",
                            template_path="template",
                            existing_path="existing",
                            description=f"Script '{script_name}' has different commands",
                            suggested_strategy=ResolutionStrategy.USER_DECISION,
                            auto_resolvable=False,
                            user_prompt=f"Script '{script_name}' conflict. Template: '{template_command}' vs Existing: '{existing_command}'",
                            resolution_options=[
                                "Use template version",
                                "Keep existing version",
                                "Rename template script",
                                "Manual merge",
                            ],
                            metadata={
                                "template_command": template_command,
                                "existing_command": existing_command,
                            },
                        )
                    )

        return conflicts


class ConflictResolver:
    """Resolves conflicts using various strategies"""

    def __init__(self, interactive: bool = True):
        self.interactive = interactive
        self.logger = logging.getLogger("ConflictResolver")
        self.analyzer = ConflictAnalyzer()

        # Track user preferences for consistent decisions
        self.user_preferences = {}

    def resolve_conflict(
        self, conflict: ConflictDetail, variables: Dict[str, str] = None
    ) -> ResolutionResult:
        """Resolve a specific conflict using appropriate strategy"""

        if conflict.auto_resolvable and not self.interactive:
            return self._auto_resolve(conflict, variables)

        if conflict.suggested_strategy == ResolutionStrategy.USER_DECISION:
            return self._prompt_user_decision(conflict)

        # Apply the suggested strategy
        return self._apply_strategy(conflict, conflict.suggested_strategy, variables)

    def _auto_resolve(
        self, conflict: ConflictDetail, variables: Dict[str, str] = None
    ) -> ResolutionResult:
        """Automatically resolve conflicts that don't require user input"""

        if conflict.type == ConflictType.CONTENT_CONFLICT:
            return self._auto_merge_content(conflict, variables)

        elif conflict.type == ConflictType.DEPENDENCY_CONFLICT:
            return self._auto_merge_dependencies(conflict, variables)

        elif conflict.suggested_strategy == ResolutionStrategy.TEMPLATE_WINS:
            return self._replace_with_template(conflict, variables)

        else:
            return ResolutionResult(
                success=False,
                strategy_used=ResolutionStrategy.USER_DECISION,
                action_taken="auto_resolution_failed",
                message=f"Cannot auto-resolve {conflict.type.value} conflict",
                requires_manual_review=True,
            )

    def _auto_merge_content(
        self, conflict: ConflictDetail, variables: Dict[str, str] = None
    ) -> ResolutionResult:
        """Automatically merge file content based on file type"""

        merge_type = conflict.metadata.get("merge_type", "text")
        template_file = Path(conflict.template_path)
        existing_file = Path(conflict.existing_path)

        try:
            if merge_type == "json":
                return self._merge_json_content(template_file, existing_file, variables)
            elif merge_type in ["yml", "yaml"]:
                return self._merge_yaml_content(template_file, existing_file, variables)
            elif merge_type == "md":
                return self._merge_markdown_content(
                    template_file, existing_file, variables
                )
            elif merge_type in ["gitignore", "dockerignore"]:
                return self._merge_ignore_file(template_file, existing_file, variables)
            else:
                return self._merge_text_content(template_file, existing_file, variables)

        except Exception as e:
            self.logger.error(f"Auto-merge failed: {e}")
            return ResolutionResult(
                success=False,
                strategy_used=ResolutionStrategy.AUTO_MERGE,
                action_taken="merge_failed",
                message=f"Auto-merge failed: {e}",
                requires_manual_review=True,
            )

    def _merge_json_content(
        self, template_file: Path, existing_file: Path, variables: Dict[str, str] = None
    ) -> ResolutionResult:
        """Merge JSON files intelligently"""
        try:
            with open(template_file, "r") as f:
                template_content = f.read()

            # Apply variable substitution if provided
            if variables:
                template_content = self._substitute_variables(
                    template_content, variables
                )

            template_data = json.loads(template_content)

            with open(existing_file, "r") as f:
                existing_data = json.load(f)

            # Deep merge the objects
            merged_data = self._deep_merge_dict(existing_data, template_data)

            # Format the merged content
            merged_content = json.dumps(merged_data, indent=2)

            return ResolutionResult(
                success=True,
                strategy_used=ResolutionStrategy.AUTO_MERGE,
                action_taken="json_merged",
                message="JSON files merged successfully",
                merged_content=merged_content,
            )

        except Exception as e:
            raise Exception(f"JSON merge failed: {e}")

    def _merge_markdown_content(
        self, template_file: Path, existing_file: Path, variables: Dict[str, str] = None
    ) -> ResolutionResult:
        """Merge markdown files by appending with section headers"""
        try:
            with open(template_file, "r") as f:
                template_content = f.read()

            if variables:
                template_content = self._substitute_variables(
                    template_content, variables
                )

            with open(existing_file, "r") as f:
                existing_content = f.read()

            # Look for template insertion markers
            if "<!-- TEMPLATE_CONTENT -->" in existing_content:
                merged_content = existing_content.replace(
                    "<!-- TEMPLATE_CONTENT -->", template_content
                )
            else:
                # Append with clear separation
                separator = "\n\n---\n\n## Template Content\n\n"
                merged_content = existing_content + separator + template_content

            return ResolutionResult(
                success=True,
                strategy_used=ResolutionStrategy.AUTO_MERGE,
                action_taken="markdown_merged",
                message="Markdown files merged with template content appended",
                merged_content=merged_content,
            )

        except Exception as e:
            raise Exception(f"Markdown merge failed: {e}")

    def _merge_ignore_file(
        self, template_file: Path, existing_file: Path, variables: Dict[str, str] = None
    ) -> ResolutionResult:
        """Merge .gitignore style files by combining unique lines"""
        try:
            with open(template_file, "r") as f:
                template_lines = set(line.strip() for line in f if line.strip())

            with open(existing_file, "r") as f:
                existing_lines = set(line.strip() for line in f if line.strip())

            # Combine and sort lines
            all_lines = sorted(existing_lines.union(template_lines))
            merged_content = "\n".join(all_lines) + "\n"

            return ResolutionResult(
                success=True,
                strategy_used=ResolutionStrategy.AUTO_MERGE,
                action_taken="ignore_file_merged",
                message=f"Merged {len(template_lines)} template lines with {len(existing_lines)} existing lines",
                merged_content=merged_content,
            )

        except Exception as e:
            raise Exception(f"Ignore file merge failed: {e}")

    def _auto_merge_dependencies(
        self, conflict: ConflictDetail, variables: Dict[str, str] = None
    ) -> ResolutionResult:
        """Auto-merge package.json or similar dependency files"""

        if conflict.metadata.get("merge_type") == "package_json":
            return self._merge_package_json(
                Path(conflict.template_path), Path(conflict.existing_path), variables
            )
        else:
            return ResolutionResult(
                success=False,
                strategy_used=ResolutionStrategy.USER_DECISION,
                action_taken="unsupported_dependency_merge",
                message="Dependency merge type not supported",
                requires_manual_review=True,
            )

    def _merge_package_json(
        self, template_file: Path, existing_file: Path, variables: Dict[str, str] = None
    ) -> ResolutionResult:
        """Specifically merge package.json files"""
        try:
            with open(template_file, "r") as f:
                template_content = f.read()

            if variables:
                template_content = self._substitute_variables(
                    template_content, variables
                )

            template_data = json.loads(template_content)

            with open(existing_file, "r") as f:
                existing_data = json.load(f)

            # Merge with package.json specific logic
            merged_data = existing_data.copy()

            # Merge dependencies, devDependencies, scripts
            merge_fields = [
                "dependencies",
                "devDependencies",
                "peerDependencies",
                "scripts",
            ]
            conflicts_found = []

            for field in merge_fields:
                if field in template_data:
                    if field not in merged_data:
                        merged_data[field] = {}

                    for key, value in template_data[field].items():
                        if (
                            key in merged_data[field]
                            and merged_data[field][key] != value
                        ):
                            conflicts_found.append(
                                f"{field}.{key}: {merged_data[field][key]} vs {value}"
                            )
                        merged_data[field][key] = value

            # Add other fields from template if not present
            for key, value in template_data.items():
                if key not in merge_fields and key not in merged_data:
                    merged_data[key] = value

            merged_content = json.dumps(merged_data, indent=2)

            return ResolutionResult(
                success=True,
                strategy_used=ResolutionStrategy.AUTO_MERGE,
                action_taken="package_json_merged",
                message=f"package.json merged successfully. {len(conflicts_found)} conflicts auto-resolved.",
                merged_content=merged_content,
                requires_manual_review=len(conflicts_found) > 0,
            )

        except Exception as e:
            raise Exception(f"package.json merge failed: {e}")

    def _replace_with_template(
        self, conflict: ConflictDetail, variables: Dict[str, str] = None
    ) -> ResolutionResult:
        """Replace existing file with template version"""
        try:
            template_file = Path(conflict.template_path)

            with open(template_file, "r") as f:
                content = f.read()

            if variables:
                content = self._substitute_variables(content, variables)

            return ResolutionResult(
                success=True,
                strategy_used=ResolutionStrategy.TEMPLATE_WINS,
                action_taken="file_replaced",
                message=f"File replaced with template version: {conflict.file_path}",
                merged_content=content,
            )

        except Exception as e:
            return ResolutionResult(
                success=False,
                strategy_used=ResolutionStrategy.TEMPLATE_WINS,
                action_taken="replacement_failed",
                message=f"Failed to replace file: {e}",
            )

    def _prompt_user_decision(self, conflict: ConflictDetail) -> ResolutionResult:
        """Prompt user for conflict resolution decision"""

        if not self.interactive:
            return ResolutionResult(
                success=False,
                strategy_used=ResolutionStrategy.USER_DECISION,
                action_taken="user_prompt_skipped",
                message="Interactive mode disabled, cannot prompt user",
                requires_manual_review=True,
            )

        print(f"\n🔶 Conflict Detected: {conflict.description}")
        print(f"   File: {conflict.file_path}")
        print(f"   Severity: {conflict.severity.value}")

        if conflict.user_prompt:
            print(f"   {conflict.user_prompt}")

        if conflict.resolution_options:
            print("\nResolution options:")
            for i, option in enumerate(conflict.resolution_options, 1):
                print(f"   {i}. {option}")

            while True:
                try:
                    choice = input(
                        f"\nSelect option (1-{len(conflict.resolution_options)}) or 's' to skip: "
                    )

                    if choice.lower() == "s":
                        return ResolutionResult(
                            success=True,
                            strategy_used=ResolutionStrategy.SKIP_FILE,
                            action_taken="file_skipped",
                            message=f"File skipped by user choice: {conflict.file_path}",
                        )

                    choice_idx = int(choice) - 1
                    if 0 <= choice_idx < len(conflict.resolution_options):
                        selected_option = conflict.resolution_options[choice_idx]
                        return self._execute_user_choice(
                            conflict, choice_idx, selected_option
                        )
                    else:
                        print("Invalid choice. Please try again.")

                except (ValueError, KeyboardInterrupt):
                    print("Invalid input. Please enter a number or 's' to skip.")

        return ResolutionResult(
            success=False,
            strategy_used=ResolutionStrategy.USER_DECISION,
            action_taken="user_prompt_failed",
            message="User decision prompt failed",
            requires_manual_review=True,
        )

    def _execute_user_choice(
        self, conflict: ConflictDetail, choice_idx: int, selected_option: str
    ) -> ResolutionResult:
        """Execute the user's resolution choice"""

        # This would be implemented based on the specific options provided
        # For now, return a placeholder result
        return ResolutionResult(
            success=True,
            strategy_used=ResolutionStrategy.USER_DECISION,
            action_taken=f"user_choice_{choice_idx}",
            message=f"User selected: {selected_option}",
        )

    def _substitute_variables(self, content: str, variables: Dict[str, str]) -> str:
        """Substitute template variables in content"""
        variable_pattern = re.compile(r"\{\{(\w+)\}\}")

        def replace_var(match):
            var_name = match.group(1)
            return variables.get(var_name, match.group(0))

        return variable_pattern.sub(replace_var, content)

    def _deep_merge_dict(self, base: Dict, update: Dict) -> Dict:
        """Deep merge two dictionaries"""
        result = base.copy()

        for key, value in update.items():
            if (
                key in result
                and isinstance(result[key], dict)
                and isinstance(value, dict)
            ):
                result[key] = self._deep_merge_dict(result[key], value)
            else:
                result[key] = value

        return result

    def _apply_strategy(
        self,
        conflict: ConflictDetail,
        strategy: ResolutionStrategy,
        variables: Dict[str, str] = None,
    ) -> ResolutionResult:
        """Apply a specific resolution strategy"""

        if strategy == ResolutionStrategy.AUTO_MERGE:
            return self._auto_merge_content(conflict, variables)
        elif strategy == ResolutionStrategy.TEMPLATE_WINS:
            return self._replace_with_template(conflict, variables)
        elif strategy == ResolutionStrategy.EXISTING_WINS:
            return ResolutionResult(
                success=True,
                strategy_used=ResolutionStrategy.EXISTING_WINS,
                action_taken="existing_file_kept",
                message=f"Existing file kept: {conflict.file_path}",
            )
        elif strategy == ResolutionStrategy.SKIP_FILE:
            return ResolutionResult(
                success=True,
                strategy_used=ResolutionStrategy.SKIP_FILE,
                action_taken="file_skipped",
                message=f"Template file skipped: {conflict.file_path}",
            )
        else:
            return ResolutionResult(
                success=False,
                strategy_used=strategy,
                action_taken="strategy_not_implemented",
                message=f"Resolution strategy not implemented: {strategy.value}",
                requires_manual_review=True,
            )

    def generate_conflict_report(self, conflicts: List[ConflictDetail]) -> str:
        """Generate a comprehensive conflict report"""
        if not conflicts:
            return "No conflicts detected."

        report = ["Conflict Analysis Report", "=" * 50, ""]

        # Summary by severity
        severity_counts = {}
        for conflict in conflicts:
            severity = conflict.severity.value
            severity_counts[severity] = severity_counts.get(severity, 0) + 1

        report.append("Summary by Severity:")
        for severity, count in sorted(severity_counts.items()):
            report.append(f"  {severity.upper()}: {count}")
        report.append("")

        # Detailed conflicts
        report.append("Detailed Conflicts:")
        for i, conflict in enumerate(conflicts, 1):
            report.extend(
                [
                    f"{i}. {conflict.file_path}",
                    f"   Type: {conflict.type.value}",
                    f"   Severity: {conflict.severity.value}",
                    f"   Description: {conflict.description}",
                    f"   Suggested Strategy: {conflict.suggested_strategy.value}",
                    f"   Auto-resolvable: {conflict.auto_resolvable}",
                    "",
                ]
            )

        return "\n".join(report)


def main():
    """CLI interface for conflict resolver testing"""
    import argparse

    parser = argparse.ArgumentParser(description="GitOps Conflict Resolver")
    parser.add_argument(
        "--analyze", help="Analyze conflicts between template and existing file"
    )
    parser.add_argument("--template", help="Template file path")
    parser.add_argument("--existing", help="Existing file path")
    parser.add_argument(
        "--interactive",
        action="store_true",
        help="Enable interactive conflict resolution",
    )

    args = parser.parse_args()

    if args.analyze and args.template and args.existing:
        analyzer = ConflictAnalyzer()
        resolver = ConflictResolver(interactive=args.interactive)

        template_path = Path(args.template)
        existing_path = Path(args.existing)

        if not template_path.exists():
            print(f"Template file not found: {template_path}")
            return

        if not existing_path.exists():
            print(f"Existing file not found: {existing_path}")
            return

        conflict = analyzer.analyze_file_conflict(template_path, existing_path)

        if conflict:
            print("Conflict detected:")
            print(f"  Type: {conflict.type.value}")
            print(f"  Severity: {conflict.severity.value}")
            print(f"  Description: {conflict.description}")
            print(f"  Auto-resolvable: {conflict.auto_resolvable}")

            if args.interactive:
                result = resolver.resolve_conflict(conflict)
                print(f"\nResolution result:")
                print(f"  Success: {result.success}")
                print(f"  Strategy: {result.strategy_used.value}")
                print(f"  Action: {result.action_taken}")
                print(f"  Message: {result.message}")
        else:
            print("No conflicts detected.")
    else:
        print(
            "Usage: python conflict-resolver.py --analyze --template <path> --existing <path>"
        )


if __name__ == "__main__":
    main()
