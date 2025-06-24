#!/usr/bin/env python3
"""
Template Application Engine for GitOps Repository Standardization

This module provides the core template application engine for Phase 1B of the
GitOps Auditor project. It handles automated template application, variable
substitution, and file merging across multiple repositories.

Version: 1.0.0 (Phase 1B Implementation)
Dependencies: Phase 1A infrastructure, MCP server integration
License: MIT
"""

import json
import os
import sys
import shutil
import tempfile
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, asdict
from datetime import datetime
import logging

# Template and validation system imports
try:
    from .conflict_resolver import ConflictResolver
    from .backup_manager import BackupManager
except ImportError:
    # Graceful degradation if other components not yet implemented
    ConflictResolver = None
    BackupManager = None


@dataclass
class TemplateConfig:
    """Configuration for template application"""

    name: str
    version: str
    description: str
    variables: Dict[str, str]
    files: List[str]
    directories: List[str]
    merge_strategies: Dict[str, str]
    validation_rules: Dict[str, Any]


@dataclass
class ApplicationResult:
    """Result of template application operation"""

    success: bool
    repository_path: str
    template_name: str
    files_created: List[str]
    files_modified: List[str]
    conflicts_detected: List[str]
    conflicts_resolved: List[str]
    errors: List[str]
    warnings: List[str]
    backup_path: Optional[str]
    application_time: str
    dry_run: bool


class TemplateEngine:
    """Core template processing engine"""

    def __init__(self, template_dir: str, config_file: Optional[str] = None):
        self.template_dir = Path(template_dir)
        self.config_file = config_file
        self.logger = self._setup_logging()

        # Initialize supporting components if available
        self.conflict_resolver = ConflictResolver() if ConflictResolver else None
        self.backup_manager = BackupManager() if BackupManager else None

        # Template variables pattern
        self.variable_pattern = re.compile(r"\{\{(\w+)\}\}")

        # Load default merge strategies
        self.default_merge_strategies = {
            ".json": "merge_json",
            ".md": "append_content",
            ".txt": "append_content",
            ".yml": "merge_yaml",
            ".yaml": "merge_yaml",
            ".gitignore": "merge_lines",
            "package.json": "merge_package_json",
            "README.md": "merge_readme",
        }

    def _setup_logging(self) -> logging.Logger:
        """Setup logging configuration"""
        logger = logging.getLogger("TemplateApplicator")
        logger.setLevel(logging.INFO)

        if not logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)

        return logger

    def load_template_config(self, template_name: str) -> Optional[TemplateConfig]:
        """Load template configuration from template directory"""
        config_path = self.template_dir / template_name / "template.json"

        if not config_path.exists():
            self.logger.error(f"Template configuration not found: {config_path}")
            return None

        try:
            with open(config_path, "r") as f:
                config_data = json.load(f)

            return TemplateConfig(
                name=config_data.get("name", template_name),
                version=config_data.get("version", "1.0.0"),
                description=config_data.get("description", ""),
                variables=config_data.get("variables", {}),
                files=config_data.get("files", []),
                directories=config_data.get("directories", []),
                merge_strategies=config_data.get("merge_strategies", {}),
                validation_rules=config_data.get("validation_rules", {}),
            )

        except Exception as e:
            self.logger.error(f"Failed to load template config: {e}")
            return None

    def substitute_variables(self, content: str, variables: Dict[str, str]) -> str:
        """Substitute template variables in content"""

        def replace_var(match):
            var_name = match.group(1)
            return variables.get(var_name, match.group(0))

        return self.variable_pattern.sub(replace_var, content)

    def detect_conflicts(self, template_path: Path, target_path: Path) -> List[str]:
        """Detect potential conflicts before applying template"""
        conflicts = []

        if target_path.exists():
            if target_path.is_file():
                conflicts.append(f"File exists: {target_path}")
            elif template_path.is_file():
                conflicts.append(f"Directory exists where file expected: {target_path}")

        # Check for critical files that need special handling
        critical_files = ["CLAUDE.md", ".env", ".env.local", "package.json"]
        if target_path.name in critical_files and target_path.exists():
            conflicts.append(f"Critical file requires merge strategy: {target_path}")

        return conflicts

    def apply_merge_strategy(
        self,
        template_file: Path,
        target_file: Path,
        strategy: str,
        variables: Dict[str, str],
    ) -> Tuple[bool, str]:
        """Apply specific merge strategy for file conflicts"""
        try:
            if strategy == "overwrite":
                return self._merge_overwrite(template_file, target_file, variables)
            elif strategy == "append_content":
                return self._merge_append(template_file, target_file, variables)
            elif strategy == "merge_json":
                return self._merge_json(template_file, target_file, variables)
            elif strategy == "merge_package_json":
                return self._merge_package_json(template_file, target_file, variables)
            elif strategy == "merge_readme":
                return self._merge_readme(template_file, target_file, variables)
            elif strategy == "merge_lines":
                return self._merge_lines(template_file, target_file, variables)
            else:
                return False, f"Unknown merge strategy: {strategy}"

        except Exception as e:
            return False, f"Merge strategy failed: {e}"

    def _merge_overwrite(
        self, template_file: Path, target_file: Path, variables: Dict[str, str]
    ) -> Tuple[bool, str]:
        """Simple overwrite merge strategy"""
        with open(template_file, "r") as f:
            content = f.read()

        content = self.substitute_variables(content, variables)

        target_file.parent.mkdir(parents=True, exist_ok=True)
        with open(target_file, "w") as f:
            f.write(content)

        return True, "File overwritten successfully"

    def _merge_append(
        self, template_file: Path, target_file: Path, variables: Dict[str, str]
    ) -> Tuple[bool, str]:
        """Append template content to existing file"""
        with open(template_file, "r") as f:
            template_content = f.read()

        template_content = self.substitute_variables(template_content, variables)

        existing_content = ""
        if target_file.exists():
            with open(target_file, "r") as f:
                existing_content = f.read()

        # Add separator if content exists
        separator = (
            "\n\n" if existing_content and not existing_content.endswith("\n\n") else ""
        )
        combined_content = existing_content + separator + template_content

        target_file.parent.mkdir(parents=True, exist_ok=True)
        with open(target_file, "w") as f:
            f.write(combined_content)

        return True, "Content appended successfully"

    def _merge_json(
        self, template_file: Path, target_file: Path, variables: Dict[str, str]
    ) -> Tuple[bool, str]:
        """Merge JSON files by combining objects"""
        try:
            with open(template_file, "r") as f:
                template_content = f.read()

            template_content = self.substitute_variables(template_content, variables)
            template_data = json.loads(template_content)

            existing_data = {}
            if target_file.exists():
                with open(target_file, "r") as f:
                    existing_data = json.load(f)

            # Deep merge the JSON objects
            merged_data = self._deep_merge_dict(existing_data, template_data)

            target_file.parent.mkdir(parents=True, exist_ok=True)
            with open(target_file, "w") as f:
                json.dump(merged_data, f, indent=2)

            return True, "JSON files merged successfully"

        except Exception as e:
            return False, f"JSON merge failed: {e}"

    def _merge_package_json(
        self, template_file: Path, target_file: Path, variables: Dict[str, str]
    ) -> Tuple[bool, str]:
        """Special merge strategy for package.json files"""
        try:
            with open(template_file, "r") as f:
                template_content = f.read()

            template_content = self.substitute_variables(template_content, variables)
            template_data = json.loads(template_content)

            existing_data = {}
            if target_file.exists():
                with open(target_file, "r") as f:
                    existing_data = json.load(f)

            # Merge dependencies intelligently
            merged_data = existing_data.copy()

            # Merge dependencies, devDependencies, scripts
            for key in ["dependencies", "devDependencies", "scripts"]:
                if key in template_data:
                    if key not in merged_data:
                        merged_data[key] = {}
                    merged_data[key].update(template_data[key])

            # Update other fields from template if not present
            for key, value in template_data.items():
                if key not in ["dependencies", "devDependencies", "scripts"]:
                    if key not in merged_data:
                        merged_data[key] = value

            target_file.parent.mkdir(parents=True, exist_ok=True)
            with open(target_file, "w") as f:
                json.dump(merged_data, f, indent=2)

            return True, "package.json merged successfully"

        except Exception as e:
            return False, f"package.json merge failed: {e}"

    def _merge_readme(
        self, template_file: Path, target_file: Path, variables: Dict[str, str]
    ) -> Tuple[bool, str]:
        """Special merge strategy for README files"""
        with open(template_file, "r") as f:
            template_content = f.read()

        template_content = self.substitute_variables(template_content, variables)

        if not target_file.exists():
            target_file.parent.mkdir(parents=True, exist_ok=True)
            with open(target_file, "w") as f:
                f.write(template_content)
            return True, "README created from template"

        # Read existing README
        with open(target_file, "r") as f:
            existing_content = f.read()

        # Find insertion point or append
        lines = existing_content.split("\n")
        template_lines = template_content.split("\n")

        # Look for ## Template Sections marker
        insertion_point = -1
        for i, line in enumerate(lines):
            if "## Template Sections" in line or "<!-- TEMPLATE_SECTIONS -->" in line:
                insertion_point = i + 1
                break

        if insertion_point >= 0:
            # Insert at marked location
            new_lines = (
                lines[:insertion_point] + template_lines + lines[insertion_point:]
            )
        else:
            # Append with separator
            new_lines = lines + ["", "## Template Sections"] + template_lines

        merged_content = "\n".join(new_lines)

        with open(target_file, "w") as f:
            f.write(merged_content)

        return True, "README merged with template content"

    def _merge_lines(
        self, template_file: Path, target_file: Path, variables: Dict[str, str]
    ) -> Tuple[bool, str]:
        """Merge files by combining unique lines (for .gitignore, etc.)"""
        with open(template_file, "r") as f:
            template_content = f.read()

        template_content = self.substitute_variables(template_content, variables)
        template_lines = set(
            line.strip() for line in template_content.split("\n") if line.strip()
        )

        existing_lines = set()
        if target_file.exists():
            with open(target_file, "r") as f:
                existing_lines = set(
                    line.strip() for line in f.read().split("\n") if line.strip()
                )

        # Combine and sort lines
        all_lines = sorted(existing_lines.union(template_lines))

        target_file.parent.mkdir(parents=True, exist_ok=True)
        with open(target_file, "w") as f:
            f.write("\n".join(all_lines) + "\n")

        return (
            True,
            f"Merged {len(template_lines)} template lines with {len(existing_lines)} existing lines",
        )

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

    def validate_repository(
        self, repo_path: Path, validation_rules: Dict[str, Any]
    ) -> List[str]:
        """Validate repository meets template requirements"""
        errors = []

        # Check required files
        required_files = validation_rules.get("required_files", [])
        for file_path in required_files:
            full_path = repo_path / file_path
            if not full_path.exists():
                errors.append(f"Required file missing: {file_path}")

        # Check required directories
        required_dirs = validation_rules.get("required_directories", [])
        for dir_path in required_dirs:
            full_path = repo_path / dir_path
            if not full_path.exists():
                errors.append(f"Required directory missing: {dir_path}")

        return errors


class TemplateApplicator:
    """Main template application orchestrator"""

    def __init__(
        self, template_dir: str = ".mcp/templates", backup_dir: str = ".mcp/backups"
    ):
        self.template_engine = TemplateEngine(template_dir)
        self.backup_dir = Path(backup_dir)
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        self.logger = self.template_engine.logger

    def apply_template(
        self,
        template_name: str,
        repository_path: str,
        variables: Optional[Dict[str, str]] = None,
        dry_run: bool = False,
        force: bool = False,
    ) -> ApplicationResult:
        """Apply template to repository with comprehensive error handling"""

        repo_path = Path(repository_path).resolve()
        start_time = datetime.now()

        # Initialize result object
        result = ApplicationResult(
            success=False,
            repository_path=str(repo_path),
            template_name=template_name,
            files_created=[],
            files_modified=[],
            conflicts_detected=[],
            conflicts_resolved=[],
            errors=[],
            warnings=[],
            backup_path=None,
            application_time=start_time.isoformat(),
            dry_run=dry_run,
        )

        try:
            # Load template configuration
            template_config = self.template_engine.load_template_config(template_name)
            if not template_config:
                result.errors.append(
                    f"Failed to load template configuration: {template_name}"
                )
                return result

            # Merge variables
            final_variables = template_config.variables.copy()
            if variables:
                final_variables.update(variables)

            # Add standard variables
            final_variables.update(
                {
                    "projectName": repo_path.name,
                    "projectPath": str(repo_path),
                    "timestamp": start_time.isoformat(),
                    "templateName": template_name,
                    "templateVersion": template_config.version,
                }
            )

            # Create backup if not dry run
            if not dry_run and self.template_engine.backup_manager:
                backup_path = self.template_engine.backup_manager.create_backup(
                    repo_path
                )
                result.backup_path = str(backup_path)
                self.logger.info(f"Created backup: {backup_path}")

            # Get template directory
            template_path = self.template_engine.template_dir / template_name

            # Process all files in template
            for root, dirs, files in os.walk(template_path):
                root_path = Path(root)

                # Skip template.json and other metadata files
                files = [f for f in files if f != "template.json"]

                for file_name in files:
                    template_file = root_path / file_name

                    # Calculate relative path from template root
                    rel_path = template_file.relative_to(template_path)
                    target_file = repo_path / rel_path

                    # Detect conflicts
                    conflicts = self.template_engine.detect_conflicts(
                        template_file, target_file
                    )
                    result.conflicts_detected.extend(conflicts)

                    # Determine merge strategy
                    file_ext = template_file.suffix
                    merge_strategy = template_config.merge_strategies.get(
                        str(rel_path),
                        template_config.merge_strategies.get(
                            file_ext,
                            self.template_engine.default_merge_strategies.get(
                                file_ext, "overwrite"
                            ),
                        ),
                    )

                    if dry_run:
                        self.logger.info(f"Would apply {merge_strategy} to {rel_path}")
                        if target_file.exists():
                            result.files_modified.append(str(rel_path))
                        else:
                            result.files_created.append(str(rel_path))
                        continue

                    # Apply merge strategy
                    success, message = self.template_engine.apply_merge_strategy(
                        template_file, target_file, merge_strategy, final_variables
                    )

                    if success:
                        self.logger.info(
                            f"Applied {merge_strategy} to {rel_path}: {message}"
                        )
                        if target_file.existed_before_merge:
                            result.files_modified.append(str(rel_path))
                        else:
                            result.files_created.append(str(rel_path))

                        if conflicts:
                            result.conflicts_resolved.extend(conflicts)
                    else:
                        result.errors.append(
                            f"Failed to apply {merge_strategy} to {rel_path}: {message}"
                        )

            # Post-application validation
            validation_errors = self.template_engine.validate_repository(
                repo_path, template_config.validation_rules
            )
            result.errors.extend(validation_errors)

            # Determine overall success
            result.success = len(result.errors) == 0

            if result.success:
                self.logger.info(
                    f"Template {template_name} applied successfully to {repo_path}"
                )
            else:
                self.logger.error(
                    f"Template application failed with {len(result.errors)} errors"
                )

        except Exception as e:
            result.errors.append(f"Unexpected error during template application: {e}")
            self.logger.error(f"Template application failed: {e}", exc_info=True)

        return result

    def list_available_templates(self) -> List[str]:
        """List all available templates"""
        templates = []
        if self.template_engine.template_dir.exists():
            for item in self.template_engine.template_dir.iterdir():
                if item.is_dir() and (item / "template.json").exists():
                    templates.append(item.name)
        return sorted(templates)

    def validate_template(self, template_name: str) -> Tuple[bool, List[str]]:
        """Validate template configuration and files"""
        errors = []

        template_config = self.template_engine.load_template_config(template_name)
        if not template_config:
            errors.append(f"Invalid template configuration: {template_name}")
            return False, errors

        template_path = self.template_engine.template_dir / template_name

        # Check all referenced files exist
        for file_path in template_config.files:
            full_path = template_path / file_path
            if not full_path.exists():
                errors.append(f"Template file missing: {file_path}")

        return len(errors) == 0, errors


def main():
    """CLI interface for template applicator"""
    import argparse

    parser = argparse.ArgumentParser(description="GitOps Template Applicator")
    parser.add_argument(
        "action", choices=["apply", "list", "validate"], help="Action to perform"
    )
    parser.add_argument("--template", "-t", help="Template name")
    parser.add_argument("--repository", "-r", help="Repository path")
    parser.add_argument("--variables", "-v", help="Variables JSON file")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be done without applying",
    )
    parser.add_argument(
        "--force", action="store_true", help="Force application even with conflicts"
    )
    parser.add_argument("--verbose", action="store_true", help="Enable verbose logging")

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    applicator = TemplateApplicator()

    if args.action == "list":
        templates = applicator.list_available_templates()
        print("Available templates:")
        for template in templates:
            print(f"  - {template}")

    elif args.action == "validate":
        if not args.template:
            print("Error: --template required for validate action")
            sys.exit(1)

        valid, errors = applicator.validate_template(args.template)
        if valid:
            print(f"Template {args.template} is valid")
        else:
            print(f"Template {args.template} validation failed:")
            for error in errors:
                print(f"  - {error}")
            sys.exit(1)

    elif args.action == "apply":
        if not args.template or not args.repository:
            print("Error: --template and --repository required for apply action")
            sys.exit(1)

        variables = {}
        if args.variables:
            with open(args.variables, "r") as f:
                variables = json.load(f)

        result = applicator.apply_template(
            args.template,
            args.repository,
            variables=variables,
            dry_run=args.dry_run,
            force=args.force,
        )

        # Print results
        print(f"Template Application Result:")
        print(f"  Success: {result.success}")
        print(f"  Files Created: {len(result.files_created)}")
        print(f"  Files Modified: {len(result.files_modified)}")
        print(f"  Conflicts Resolved: {len(result.conflicts_resolved)}")
        print(f"  Errors: {len(result.errors)}")

        if result.errors:
            print("\nErrors:")
            for error in result.errors:
                print(f"  - {error}")

        if not result.success:
            sys.exit(1)


if __name__ == "__main__":
    main()
