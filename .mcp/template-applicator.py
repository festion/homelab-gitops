#!/usr/bin/env python3
"""
Phase 1B: Template Application Engine
Simplified version for testing resume functionality
"""

import json
import argparse
import sys
from pathlib import Path
import shutil
import tempfile
import subprocess
from typing import Dict, List, Any, Optional
import hashlib
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class TemplateApplicator:
    """Core template application engine for testing"""

    def __init__(self, dry_run: bool = True, verbose: bool = False):
        self.dry_run = dry_run
        self.verbose = verbose
        self.script_dir = Path(__file__).parent
        self.project_root = self.script_dir.parent
        self.templates_dir = self.script_dir / "templates"

    def list_templates(self) -> List[Dict[str, Any]]:
        """List available templates"""
        templates = []
        if self.templates_dir.exists():
            for template_dir in self.templates_dir.iterdir():
                if template_dir.is_dir():
                    template_file = template_dir / "template.json"
                    if template_file.exists():
                        try:
                            with open(template_file) as f:
                                template_data = json.load(f)
                                templates.append(
                                    {
                                        "name": template_dir.name,
                                        "path": str(template_dir),
                                        "config": template_data,
                                    }
                                )
                        except Exception as e:
                            logger.warning(
                                f"Could not load template {template_dir.name}: {e}"
                            )
        return templates

    def validate_template(self, template_path: Path) -> bool:
        """Validate template configuration"""
        try:
            if not template_path.exists():
                logger.error(f"Template path does not exist: {template_path}")
                return False

            template_file = template_path / "template.json"
            if not template_file.exists():
                logger.error(f"Template configuration not found: {template_file}")
                return False

            with open(template_file) as f:
                template_data = json.load(f)

            # Basic validation
            required_fields = ["id", "name", "version", "files"]
            for field in required_fields:
                if field not in template_data:
                    logger.error(
                        f"Missing required field '{field}' in template configuration"
                    )
                    return False

            logger.info(
                f"Template validation successful: {template_data['name']} v{template_data['version']}"
            )
            return True

        except Exception as e:
            logger.error(f"Template validation failed: {e}")
            return False

    def analyze_repository(self, repo_path: Path) -> Dict[str, Any]:
        """Analyze repository for template application readiness"""
        analysis = {
            "path": str(repo_path),
            "is_git_repo": False,
            "has_mcp_config": False,
            "has_uncommitted_changes": False,
            "files": {},
            "directories": {},
        }

        if not repo_path.exists():
            logger.error(f"Repository path does not exist: {repo_path}")
            return analysis

        # Check if Git repository
        git_dir = repo_path / ".git"
        if git_dir.exists():
            analysis["is_git_repo"] = True

            # Check for uncommitted changes
            try:
                result = subprocess.run(
                    ["git", "status", "--porcelain"],
                    cwd=repo_path,
                    capture_output=True,
                    text=True,
                )
                if result.stdout.strip():
                    analysis["has_uncommitted_changes"] = True
            except Exception as e:
                logger.warning(f"Could not check Git status: {e}")

        # Check for existing MCP configuration
        mcp_config = repo_path / ".mcp.json"
        if mcp_config.exists():
            analysis["has_mcp_config"] = True

        logger.info(f"Repository analysis complete: {repo_path.name}")
        return analysis

    def apply_template_dry_run(
        self, template_path: Path, repo_path: Path
    ) -> Dict[str, Any]:
        """Perform dry-run template application"""
        logger.info(f"Starting dry-run template application")
        logger.info(f"Template: {template_path}")
        logger.info(f"Repository: {repo_path}")

        # Load template configuration
        template_file = template_path / "template.json"
        with open(template_file) as f:
            template_data = json.load(f)

        # Analyze repository
        repo_analysis = self.analyze_repository(repo_path)

        # Plan changes
        planned_changes = {
            "template": template_data,
            "repository": repo_analysis,
            "files_to_create": [],
            "files_to_modify": [],
            "directories_to_create": [],
            "conflicts": [],
        }

        # Process template files
        for file_config in template_data.get("files", []):
            source_path = template_path / file_config["source"]
            target_path = repo_path / file_config["path"]

            if source_path.exists():
                if target_path.exists():
                    planned_changes["files_to_modify"].append(
                        {
                            "path": file_config["path"],
                            "source": str(source_path),
                            "merge_strategy": file_config.get(
                                "merge_strategy", "replace"
                            ),
                        }
                    )
                    if file_config["path"] in [".mcp.json", "CLAUDE.md"]:
                        planned_changes["conflicts"].append(
                            {
                                "path": file_config["path"],
                                "reason": "Critical file requires manual review",
                            }
                        )
                else:
                    planned_changes["files_to_create"].append(
                        {"path": file_config["path"], "source": str(source_path)}
                    )

        # Process directories
        for dir_config in template_data.get("directories", []):
            dir_path = repo_path / dir_config["path"]
            if not dir_path.exists():
                planned_changes["directories_to_create"].append(dir_config["path"])

        logger.info(
            f"Dry-run complete: {len(planned_changes['files_to_create'])} files to create, "
            f"{len(planned_changes['files_to_modify'])} files to modify, "
            f"{len(planned_changes['conflicts'])} conflicts detected"
        )

        return planned_changes

    def apply_template(self, template_path: Path, repo_path: Path) -> Dict[str, Any]:
        """Apply template to repository (actual application)"""
        if self.dry_run:
            return self.apply_template_dry_run(template_path, repo_path)

        logger.info(f"Applying template to repository: {repo_path}")
        # This would be the actual implementation for applying changes
        # For testing purposes, we'll just return the dry-run results
        return self.apply_template_dry_run(template_path, repo_path)


def main():
    parser = argparse.ArgumentParser(description="Template Application Engine")
    parser.add_argument(
        "action",
        choices=["list", "validate", "apply", "analyze"],
        help="Action to perform",
    )
    parser.add_argument("--template", help="Template name or path")
    parser.add_argument("--repository", help="Repository path")
    parser.add_argument(
        "--dry-run", action="store_true", default=True, help="Perform dry-run (default)"
    )
    parser.add_argument("--apply", action="store_true", help="Actually apply changes")
    parser.add_argument("--verbose", action="store_true", help="Verbose output")

    args = parser.parse_args()

    # Create applicator
    dry_run = not args.apply
    applicator = TemplateApplicator(dry_run=dry_run, verbose=args.verbose)

    try:
        if args.action == "list":
            templates = applicator.list_templates()
            print("Available templates:")
            for template in templates:
                print(
                    f"  - {template['name']}: {template['config'].get('description', 'No description')}"
                )

        elif args.action == "validate":
            if not args.template:
                logger.error("Template name or path required for validation")
                sys.exit(1)
            template_path = Path(args.template)
            if not template_path.is_absolute():
                template_path = applicator.templates_dir / args.template

            if applicator.validate_template(template_path):
                print("Template validation successful")
            else:
                sys.exit(1)

        elif args.action == "analyze":
            if not args.repository:
                logger.error("Repository path required for analysis")
                sys.exit(1)
            repo_path = Path(args.repository)
            analysis = applicator.analyze_repository(repo_path)
            print(json.dumps(analysis, indent=2))

        elif args.action == "apply":
            if not args.template or not args.repository:
                logger.error(
                    "Both template and repository are required for application"
                )
                sys.exit(1)

            template_path = Path(args.template)
            if not template_path.is_absolute():
                template_path = applicator.templates_dir / args.template

            repo_path = Path(args.repository)

            if not applicator.validate_template(template_path):
                sys.exit(1)

            result = applicator.apply_template(template_path, repo_path)
            print(json.dumps(result, indent=2))

    except KeyboardInterrupt:
        logger.info("Operation cancelled by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Operation failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
