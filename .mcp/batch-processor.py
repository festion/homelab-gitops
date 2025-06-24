#!/usr/bin/env python3
"""
Batch Processing System for Template Application

This module provides sophisticated batch processing capabilities for applying
templates across multiple repositories with parallel execution, progress tracking,
error handling, and resume functionality.

Version: 1.0.0 (Phase 1B Implementation)
Dependencies: Template Application Engine, Conflict Resolver, Backup Manager
License: MIT
"""

import os
import json
import asyncio
import concurrent.futures
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any, Callable
from dataclasses import dataclass, asdict
from datetime import datetime
from enum import Enum
import logging
import signal
import time

# Import Phase 1B components
try:
    from .template_applicator import TemplateApplicator, ApplicationResult
    from .conflict_resolver import ConflictResolver, ConflictDetail
    from .backup_manager import BackupManager
except ImportError:
    # Graceful degradation for testing
    TemplateApplicator = None
    ConflictResolver = None
    BackupManager = None
    ApplicationResult = None


class BatchStatus(Enum):
    """Status of batch operations"""

    PENDING = "pending"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class RepositoryStatus(Enum):
    """Status of individual repository processing"""

    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"
    CONFLICTED = "conflicted"


@dataclass
class RepositoryTask:
    """Individual repository processing task"""

    repository_path: str
    template_name: str
    variables: Dict[str, str]
    priority: int = 50  # 0-100, higher = more priority
    status: RepositoryStatus = RepositoryStatus.QUEUED
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    result: Optional[Any] = None  # ApplicationResult when complete
    error_message: Optional[str] = None
    backup_id: Optional[str] = None
    conflicts: List[Any] = None  # List of ConflictDetail when available
    retry_count: int = 0
    max_retries: int = 3


@dataclass
class BatchConfig:
    """Configuration for batch processing"""

    max_workers: int = 4
    dry_run: bool = False
    create_backups: bool = True
    auto_resolve_conflicts: bool = True
    interactive_conflicts: bool = False
    retry_failed: bool = True
    max_retries: int = 3
    retry_delay: float = 5.0
    progress_callback: Optional[Callable] = None
    checkpoint_interval: int = 10  # Save progress every N repositories
    timeout_per_repo: int = 300  # 5 minutes per repository


@dataclass
class BatchOperation:
    """Batch operation metadata and state"""

    batch_id: str
    template_name: str
    creation_time: str
    status: BatchStatus
    total_repositories: int
    completed_repositories: int
    failed_repositories: int
    skipped_repositories: int
    conflicted_repositories: int
    config: BatchConfig
    tasks: List[RepositoryTask]
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    checkpoint_path: Optional[str] = None


@dataclass
class BatchProgress:
    """Real-time batch progress information"""

    batch_id: str
    status: BatchStatus
    total: int
    completed: int
    failed: int
    skipped: int
    conflicted: int
    current_repository: Optional[str] = None
    progress_percentage: float = 0.0
    estimated_remaining: Optional[float] = None  # seconds
    repositories_per_minute: float = 0.0


class ProgressTracker:
    """Track and report batch processing progress"""

    def __init__(self, batch_operation: BatchOperation):
        self.batch_operation = batch_operation
        self.start_time = time.time()
        self.completion_times = []
        self.logger = logging.getLogger("ProgressTracker")

    def update_repository_status(
        self,
        repo_path: str,
        status: RepositoryStatus,
        result: Optional[Any] = None,
        error: Optional[str] = None,
    ):
        """Update status of individual repository"""

        # Find and update the task
        for task in self.batch_operation.tasks:
            if task.repository_path == repo_path:
                task.status = status
                task.result = result
                task.error_message = error

                if status == RepositoryStatus.PROCESSING:
                    task.start_time = datetime.now().isoformat()
                elif status in [
                    RepositoryStatus.COMPLETED,
                    RepositoryStatus.FAILED,
                    RepositoryStatus.SKIPPED,
                ]:
                    task.end_time = datetime.now().isoformat()
                    if status == RepositoryStatus.COMPLETED:
                        self.completion_times.append(time.time())

                break

        # Update batch counters
        self._update_batch_counters()

    def _update_batch_counters(self):
        """Update batch-level counters based on task statuses"""

        completed = sum(
            1
            for task in self.batch_operation.tasks
            if task.status == RepositoryStatus.COMPLETED
        )
        failed = sum(
            1
            for task in self.batch_operation.tasks
            if task.status == RepositoryStatus.FAILED
        )
        skipped = sum(
            1
            for task in self.batch_operation.tasks
            if task.status == RepositoryStatus.SKIPPED
        )
        conflicted = sum(
            1
            for task in self.batch_operation.tasks
            if task.status == RepositoryStatus.CONFLICTED
        )

        self.batch_operation.completed_repositories = completed
        self.batch_operation.failed_repositories = failed
        self.batch_operation.skipped_repositories = skipped
        self.batch_operation.conflicted_repositories = conflicted

    def get_progress(self) -> BatchProgress:
        """Get current progress information"""

        total = self.batch_operation.total_repositories
        completed = self.batch_operation.completed_repositories
        failed = self.batch_operation.failed_repositories
        skipped = self.batch_operation.skipped_repositories
        conflicted = self.batch_operation.conflicted_repositories

        # Calculate progress percentage
        processed = completed + failed + skipped + conflicted
        progress_percentage = (processed / total * 100) if total > 0 else 0

        # Calculate repositories per minute
        elapsed_time = time.time() - self.start_time
        repos_per_minute = (processed / (elapsed_time / 60)) if elapsed_time > 0 else 0

        # Estimate remaining time
        remaining_repos = total - processed
        estimated_remaining = (
            (remaining_repos / repos_per_minute * 60) if repos_per_minute > 0 else None
        )

        # Find current processing repository
        current_repo = None
        for task in self.batch_operation.tasks:
            if task.status == RepositoryStatus.PROCESSING:
                current_repo = Path(task.repository_path).name
                break

        return BatchProgress(
            batch_id=self.batch_operation.batch_id,
            status=self.batch_operation.status,
            total=total,
            completed=completed,
            failed=failed,
            skipped=skipped,
            conflicted=conflicted,
            current_repository=current_repo,
            progress_percentage=progress_percentage,
            estimated_remaining=estimated_remaining,
            repositories_per_minute=repos_per_minute,
        )

    def print_progress(self):
        """Print current progress to console"""

        progress = self.get_progress()

        print(
            f"\r🔄 Batch Progress: {progress.progress_percentage:.1f}% "
            f"({progress.completed + progress.failed + progress.skipped + progress.conflicted}/{progress.total}) "
            f"✅ {progress.completed} ❌ {progress.failed} ⏭️ {progress.skipped} ⚠️ {progress.conflicted}",
            end="",
        )

        if progress.current_repository:
            print(f" | Processing: {progress.current_repository}", end="")

        if progress.estimated_remaining and progress.estimated_remaining > 0:
            minutes = int(progress.estimated_remaining / 60)
            seconds = int(progress.estimated_remaining % 60)
            print(f" | ETA: {minutes}m {seconds}s", end="")


class BatchProcessor:
    """Main batch processing orchestrator"""

    def __init__(self, checkpoint_dir: str = ".mcp/checkpoints"):
        self.checkpoint_dir = Path(checkpoint_dir)
        self.checkpoint_dir.mkdir(parents=True, exist_ok=True)

        self.template_applicator = TemplateApplicator() if TemplateApplicator else None
        self.conflict_resolver = (
            ConflictResolver(interactive=False) if ConflictResolver else None
        )
        self.backup_manager = BackupManager() if BackupManager else None

        self.logger = self._setup_logging()
        self.current_batch = None
        self.progress_tracker = None
        self._shutdown_requested = False

        # Setup signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)

    def _setup_logging(self) -> logging.Logger:
        """Setup logging configuration"""
        logger = logging.getLogger("BatchProcessor")
        logger.setLevel(logging.INFO)

        if not logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)

        return logger

    def _signal_handler(self, signum, frame):
        """Handle shutdown signals gracefully"""
        self.logger.info(f"Received signal {signum}, initiating graceful shutdown...")
        self._shutdown_requested = True

        if self.current_batch:
            self.current_batch.status = BatchStatus.CANCELLED
            self._save_checkpoint()

    def create_batch_operation(
        self,
        template_name: str,
        repositories: List[str],
        variables: Optional[Dict[str, str]] = None,
        config: Optional[BatchConfig] = None,
    ) -> str:
        """Create a new batch operation"""

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        batch_id = f"batch_{template_name}_{timestamp}"

        # Default configuration
        if config is None:
            config = BatchConfig()

        # Create repository tasks
        tasks = []
        for i, repo_path in enumerate(repositories):
            repo_variables = variables.copy() if variables else {}

            # Add repository-specific variables
            repo_name = Path(repo_path).name
            repo_variables.update(
                {
                    "projectName": repo_name,
                    "projectPath": repo_path,
                    "repositoryIndex": str(i),
                    "totalRepositories": str(len(repositories)),
                }
            )

            task = RepositoryTask(
                repository_path=str(Path(repo_path).resolve()),
                template_name=template_name,
                variables=repo_variables,
                priority=50,
            )
            tasks.append(task)

        # Create batch operation
        batch_operation = BatchOperation(
            batch_id=batch_id,
            template_name=template_name,
            creation_time=datetime.now().isoformat(),
            status=BatchStatus.PENDING,
            total_repositories=len(repositories),
            completed_repositories=0,
            failed_repositories=0,
            skipped_repositories=0,
            conflicted_repositories=0,
            config=config,
            tasks=tasks,
        )

        # Save checkpoint
        self._save_batch_operation(batch_operation)

        self.logger.info(f"Created batch operation: {batch_id}")
        self.logger.info(f"  Template: {template_name}")
        self.logger.info(f"  Repositories: {len(repositories)}")
        self.logger.info(f"  Workers: {config.max_workers}")

        return batch_id

    async def execute_batch(self, batch_id: str) -> BatchOperation:
        """Execute batch operation with parallel processing"""

        # Load batch operation
        batch_operation = self._load_batch_operation(batch_id)
        if not batch_operation:
            raise ValueError(f"Batch operation not found: {batch_id}")

        self.current_batch = batch_operation
        self.progress_tracker = ProgressTracker(batch_operation)

        # Update status
        batch_operation.status = BatchStatus.RUNNING
        batch_operation.start_time = datetime.now().isoformat()

        self.logger.info(f"Starting batch execution: {batch_id}")

        try:
            # Sort tasks by priority (higher priority first)
            tasks_to_process = sorted(
                [
                    task
                    for task in batch_operation.tasks
                    if task.status == RepositoryStatus.QUEUED
                ],
                key=lambda t: t.priority,
                reverse=True,
            )

            # Execute tasks with controlled concurrency
            semaphore = asyncio.Semaphore(batch_operation.config.max_workers)
            tasks = [
                self._process_repository_async(task, semaphore)
                for task in tasks_to_process
            ]

            # Process all tasks
            await asyncio.gather(*tasks, return_exceptions=True)

            # Final status update
            if self._shutdown_requested:
                batch_operation.status = BatchStatus.CANCELLED
            elif batch_operation.failed_repositories > 0:
                batch_operation.status = BatchStatus.FAILED
            else:
                batch_operation.status = BatchStatus.COMPLETED

            batch_operation.end_time = datetime.now().isoformat()

            # Final checkpoint save
            self._save_batch_operation(batch_operation)

            self.logger.info(f"Batch execution completed: {batch_id}")
            self.logger.info(f"  Status: {batch_operation.status.value}")
            self.logger.info(f"  Completed: {batch_operation.completed_repositories}")
            self.logger.info(f"  Failed: {batch_operation.failed_repositories}")
            self.logger.info(f"  Skipped: {batch_operation.skipped_repositories}")

            return batch_operation

        except Exception as e:
            batch_operation.status = BatchStatus.FAILED
            batch_operation.end_time = datetime.now().isoformat()
            self._save_batch_operation(batch_operation)

            self.logger.error(f"Batch execution failed: {e}")
            raise

        finally:
            self.current_batch = None
            self.progress_tracker = None

    async def _process_repository_async(
        self, task: RepositoryTask, semaphore: asyncio.Semaphore
    ):
        """Process a single repository asynchronously"""

        async with semaphore:
            if self._shutdown_requested:
                task.status = RepositoryStatus.SKIPPED
                task.error_message = "Batch operation cancelled"
                return

            # Update progress
            self.progress_tracker.update_repository_status(
                task.repository_path, RepositoryStatus.PROCESSING
            )

            try:
                # Run synchronous template application in thread pool
                loop = asyncio.get_event_loop()
                with concurrent.futures.ThreadPoolExecutor() as executor:
                    future = executor.submit(self._process_repository_sync, task)

                    # Apply timeout
                    try:
                        await asyncio.wait_for(
                            asyncio.wrap_future(future),
                            timeout=self.current_batch.config.timeout_per_repo,
                        )
                    except asyncio.TimeoutError:
                        task.status = RepositoryStatus.FAILED
                        task.error_message = f"Processing timeout ({self.current_batch.config.timeout_per_repo}s)"

                        self.progress_tracker.update_repository_status(
                            task.repository_path, task.status, error=task.error_message
                        )
                        return

            except Exception as e:
                task.status = RepositoryStatus.FAILED
                task.error_message = f"Unexpected error: {e}"

                self.logger.error(
                    f"Repository processing failed: {task.repository_path}: {e}"
                )

            finally:
                # Update progress
                self.progress_tracker.update_repository_status(
                    task.repository_path, task.status, task.result, task.error_message
                )

                # Save checkpoint periodically
                if self.current_batch.config.checkpoint_interval > 0:
                    processed_count = (
                        self.current_batch.completed_repositories
                        + self.current_batch.failed_repositories
                        + self.current_batch.skipped_repositories
                    )

                    if (
                        processed_count % self.current_batch.config.checkpoint_interval
                        == 0
                    ):
                        self._save_checkpoint()

    def _process_repository_sync(self, task: RepositoryTask):
        """Synchronously process a single repository"""

        repo_path = Path(task.repository_path)

        if not repo_path.exists():
            task.status = RepositoryStatus.FAILED
            task.error_message = f"Repository path does not exist: {repo_path}"
            return

        try:
            # Create backup if enabled
            if self.current_batch.config.create_backups and self.backup_manager:
                backup_id = self.backup_manager.create_backup(
                    str(repo_path),
                    template_name=task.template_name,
                    description=f"Pre-template backup for batch {self.current_batch.batch_id}",
                )
                task.backup_id = backup_id
                self.logger.debug(f"Created backup {backup_id} for {repo_path}")

            # Apply template
            if self.template_applicator:
                result = self.template_applicator.apply_template(
                    task.template_name,
                    str(repo_path),
                    variables=task.variables,
                    dry_run=self.current_batch.config.dry_run,
                )

                task.result = result

                if result.success:
                    task.status = RepositoryStatus.COMPLETED
                    self.logger.info(f"Template applied successfully: {repo_path.name}")
                else:
                    # Check if conflicts were detected
                    if (
                        result.conflicts_detected
                        and self.current_batch.config.auto_resolve_conflicts
                    ):
                        task.status = RepositoryStatus.CONFLICTED
                        task.error_message = (
                            f"Conflicts detected: {len(result.conflicts_detected)}"
                        )
                    else:
                        task.status = RepositoryStatus.FAILED
                        task.error_message = (
                            f"Template application failed: {result.errors}"
                        )
            else:
                task.status = RepositoryStatus.FAILED
                task.error_message = "Template applicator not available"

        except Exception as e:
            task.status = RepositoryStatus.FAILED
            task.error_message = f"Processing error: {e}"
            self.logger.error(f"Repository processing error: {repo_path}: {e}")

    def resume_batch(self, batch_id: str) -> BatchOperation:
        """Resume a paused or failed batch operation"""

        batch_operation = self._load_batch_operation(batch_id)
        if not batch_operation:
            raise ValueError(f"Batch operation not found: {batch_id}")

        if batch_operation.status == BatchStatus.COMPLETED:
            self.logger.info(f"Batch {batch_id} already completed")
            return batch_operation

        # Reset failed tasks if retry is enabled
        if batch_operation.config.retry_failed:
            for task in batch_operation.tasks:
                if (
                    task.status == RepositoryStatus.FAILED
                    and task.retry_count < task.max_retries
                ):
                    task.status = RepositoryStatus.QUEUED
                    task.retry_count += 1
                    task.error_message = None

        self.logger.info(f"Resuming batch operation: {batch_id}")

        # Execute the batch
        return asyncio.run(self.execute_batch(batch_id))

    def pause_batch(self, batch_id: str) -> bool:
        """Pause a running batch operation"""

        if self.current_batch and self.current_batch.batch_id == batch_id:
            self.current_batch.status = BatchStatus.PAUSED
            self._save_checkpoint()
            self.logger.info(f"Batch operation paused: {batch_id}")
            return True

        return False

    def cancel_batch(self, batch_id: str) -> bool:
        """Cancel a batch operation"""

        if self.current_batch and self.current_batch.batch_id == batch_id:
            self._shutdown_requested = True
            self.current_batch.status = BatchStatus.CANCELLED
            self._save_checkpoint()
            self.logger.info(f"Batch operation cancelled: {batch_id}")
            return True

        # Load and update status if not currently running
        batch_operation = self._load_batch_operation(batch_id)
        if batch_operation and batch_operation.status in [
            BatchStatus.PENDING,
            BatchStatus.PAUSED,
        ]:
            batch_operation.status = BatchStatus.CANCELLED
            self._save_batch_operation(batch_operation)
            return True

        return False

    def get_batch_status(self, batch_id: str) -> Optional[BatchProgress]:
        """Get current status of batch operation"""

        if (
            self.current_batch
            and self.current_batch.batch_id == batch_id
            and self.progress_tracker
        ):
            return self.progress_tracker.get_progress()

        # Load from checkpoint
        batch_operation = self._load_batch_operation(batch_id)
        if batch_operation:
            # Create temporary progress tracker for status
            temp_tracker = ProgressTracker(batch_operation)
            return temp_tracker.get_progress()

        return None

    def list_batch_operations(self) -> List[str]:
        """List all batch operations"""

        batch_files = list(self.checkpoint_dir.glob("batch_*.json"))
        return [f.stem for f in batch_files]

    def get_batch_details(self, batch_id: str) -> Optional[BatchOperation]:
        """Get detailed information about a batch operation"""

        return self._load_batch_operation(batch_id)

    def _save_checkpoint(self):
        """Save current batch state as checkpoint"""

        if self.current_batch:
            self._save_batch_operation(self.current_batch)

    def _save_batch_operation(self, batch_operation: BatchOperation):
        """Save batch operation to file"""

        checkpoint_file = self.checkpoint_dir / f"{batch_operation.batch_id}.json"

        # Convert to serializable format
        data = asdict(batch_operation)

        # Handle nested dataclasses
        for i, task in enumerate(data["tasks"]):
            if "result" in task and task["result"]:
                # Convert ApplicationResult to dict if it's a dataclass
                if hasattr(task["result"], "__dict__"):
                    task["result"] = asdict(task["result"])

        with open(checkpoint_file, "w") as f:
            json.dump(data, f, indent=2)

        batch_operation.checkpoint_path = str(checkpoint_file)

    def _load_batch_operation(self, batch_id: str) -> Optional[BatchOperation]:
        """Load batch operation from file"""

        checkpoint_file = self.checkpoint_dir / f"{batch_id}.json"

        if not checkpoint_file.exists():
            return None

        try:
            with open(checkpoint_file, "r") as f:
                data = json.load(f)

            # Convert back to dataclasses
            config_data = data.pop("config")
            config = BatchConfig(**config_data)

            tasks_data = data.pop("tasks")
            tasks = []
            for task_data in tasks_data:
                # Convert status enums
                task_data["status"] = RepositoryStatus(task_data["status"])
                tasks.append(RepositoryTask(**task_data))

            data["config"] = config
            data["tasks"] = tasks
            data["status"] = BatchStatus(data["status"])

            return BatchOperation(**data)

        except Exception as e:
            self.logger.error(f"Failed to load batch operation {batch_id}: {e}")
            return None

    def generate_batch_report(self, batch_id: str) -> str:
        """Generate comprehensive batch processing report"""

        batch_operation = self._load_batch_operation(batch_id)
        if not batch_operation:
            return f"Batch operation not found: {batch_id}"

        report = [
            "Batch Processing Report",
            "=" * 50,
            "",
            f"Batch ID: {batch_operation.batch_id}",
            f"Template: {batch_operation.template_name}",
            f"Status: {batch_operation.status.value.upper()}",
            f"Created: {batch_operation.creation_time}",
            "",
        ]

        if batch_operation.start_time:
            report.append(f"Started: {batch_operation.start_time}")

        if batch_operation.end_time:
            report.append(f"Completed: {batch_operation.end_time}")

            # Calculate duration
            start = datetime.fromisoformat(batch_operation.start_time)
            end = datetime.fromisoformat(batch_operation.end_time)
            duration = end - start
            report.append(f"Duration: {duration}")

        report.extend(
            [
                "",
                "Summary:",
                f"  Total Repositories: {batch_operation.total_repositories}",
                f"  ✅ Completed: {batch_operation.completed_repositories}",
                f"  ❌ Failed: {batch_operation.failed_repositories}",
                f"  ⏭️ Skipped: {batch_operation.skipped_repositories}",
                f"  ⚠️ Conflicted: {batch_operation.conflicted_repositories}",
                "",
                "Configuration:",
                f"  Max Workers: {batch_operation.config.max_workers}",
                f"  Dry Run: {batch_operation.config.dry_run}",
                f"  Create Backups: {batch_operation.config.create_backups}",
                f"  Auto Resolve Conflicts: {batch_operation.config.auto_resolve_conflicts}",
                "",
                "Repository Details:",
            ]
        )

        # Group repositories by status
        status_groups = {}
        for task in batch_operation.tasks:
            status = task.status.value
            if status not in status_groups:
                status_groups[status] = []
            status_groups[status].append(task)

        for status, tasks in status_groups.items():
            report.append(f"\n{status.upper()} ({len(tasks)}):")
            for task in tasks:
                repo_name = Path(task.repository_path).name
                report.append(f"  - {repo_name}")
                if task.error_message:
                    report.append(f"    Error: {task.error_message}")
                if task.backup_id:
                    report.append(f"    Backup: {task.backup_id}")

        return "\n".join(report)


def main():
    """CLI interface for batch processor"""
    import argparse

    parser = argparse.ArgumentParser(description="GitOps Batch Processor")
    parser.add_argument(
        "action",
        choices=["create", "execute", "resume", "status", "list", "report", "cancel"],
        help="Action to perform",
    )
    parser.add_argument("--batch-id", help="Batch operation ID")
    parser.add_argument("--template", help="Template name")
    parser.add_argument("--repositories", nargs="+", help="Repository paths")
    parser.add_argument("--variables", help="Variables JSON file")
    parser.add_argument(
        "--workers", type=int, default=4, help="Number of parallel workers"
    )
    parser.add_argument("--dry-run", action="store_true", help="Dry run mode")
    parser.add_argument("--no-backup", action="store_true", help="Skip backup creation")
    parser.add_argument(
        "--interactive", action="store_true", help="Interactive conflict resolution"
    )

    args = parser.parse_args()

    processor = BatchProcessor()

    if args.action == "create":
        if not args.template or not args.repositories:
            print("Error: --template and --repositories required for create action")
            return

        variables = {}
        if args.variables:
            with open(args.variables, "r") as f:
                variables = json.load(f)

        config = BatchConfig(
            max_workers=args.workers,
            dry_run=args.dry_run,
            create_backups=not args.no_backup,
            interactive_conflicts=args.interactive,
        )

        batch_id = processor.create_batch_operation(
            args.template, args.repositories, variables, config
        )
        print(f"Batch operation created: {batch_id}")

    elif args.action == "execute":
        if not args.batch_id:
            print("Error: --batch-id required for execute action")
            return

        result = asyncio.run(processor.execute_batch(args.batch_id))
        print(f"Batch execution completed: {result.status.value}")

    elif args.action == "resume":
        if not args.batch_id:
            print("Error: --batch-id required for resume action")
            return

        result = processor.resume_batch(args.batch_id)
        print(f"Batch resume completed: {result.status.value}")

    elif args.action == "status":
        if not args.batch_id:
            print("Error: --batch-id required for status action")
            return

        progress = processor.get_batch_status(args.batch_id)
        if progress:
            print(f"Batch Status: {progress.status.value}")
            print(
                f"Progress: {progress.progress_percentage:.1f}% ({progress.completed + progress.failed + progress.skipped}/{progress.total})"
            )
            print(f"✅ Completed: {progress.completed}")
            print(f"❌ Failed: {progress.failed}")
            print(f"⏭️ Skipped: {progress.skipped}")
            if progress.current_repository:
                print(f"Current: {progress.current_repository}")
        else:
            print(f"Batch not found: {args.batch_id}")

    elif args.action == "list":
        batches = processor.list_batch_operations()
        print(f"Found {len(batches)} batch operations:")
        for batch_id in batches:
            details = processor.get_batch_details(batch_id)
            if details:
                print(
                    f"  {batch_id} - {details.status.value} - {details.template_name}"
                )

    elif args.action == "report":
        if not args.batch_id:
            print("Error: --batch-id required for report action")
            return

        report = processor.generate_batch_report(args.batch_id)
        print(report)

    elif args.action == "cancel":
        if not args.batch_id:
            print("Error: --batch-id required for cancel action")
            return

        if processor.cancel_batch(args.batch_id):
            print(f"Batch cancelled: {args.batch_id}")
        else:
            print(f"Failed to cancel batch: {args.batch_id}")


if __name__ == "__main__":
    main()
