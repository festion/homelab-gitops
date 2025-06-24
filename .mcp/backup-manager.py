#!/usr/bin/env python3
"""
Comprehensive Backup and Rollback System for Template Application

This module provides robust backup creation, validation, and rollback capabilities
for the GitOps Template Application Engine. It ensures safe template application
with complete recovery options.

Version: 1.0.0 (Phase 1B Implementation)
Dependencies: Template Application Engine, filesystem access
License: MIT
"""

import os
import shutil
import json
import hashlib
import tarfile
import zipfile
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
import logging
import tempfile


@dataclass
class BackupMetadata:
    """Metadata for backup operations"""

    backup_id: str
    repository_path: str
    backup_path: str
    creation_time: str
    template_name: Optional[str]
    backup_type: str  # 'full', 'incremental', 'snapshot'
    file_count: int
    total_size: int
    verification_hash: str
    retention_until: Optional[str]
    tags: List[str]
    description: str


@dataclass
class BackupValidationResult:
    """Result of backup validation"""

    is_valid: bool
    missing_files: List[str]
    corrupted_files: List[str]
    extra_files: List[str]
    hash_mismatches: List[str]
    validation_time: str
    error_messages: List[str]


@dataclass
class RestoreResult:
    """Result of backup restoration"""

    success: bool
    restored_files: List[str]
    skipped_files: List[str]
    failed_files: List[str]
    restore_time: str
    backup_id: str
    error_messages: List[str]
    warnings: List[str]


class BackupStrategy:
    """Define different backup strategies"""

    FULL = "full"  # Complete repository backup
    INCREMENTAL = "incremental"  # Only changed files since last backup
    SNAPSHOT = "snapshot"  # Git-style snapshot with metadata
    SELECTIVE = "selective"  # Only specified files/directories


class CompressionType:
    """Supported compression types"""

    NONE = "none"
    GZIP = "gzip"
    ZIP = "zip"
    TAR_GZ = "tar.gz"
    TAR_BZ2 = "tar.bz2"


class BackupManager:
    """Comprehensive backup and rollback management system"""

    def __init__(self, backup_root: str = ".mcp/backups"):
        self.backup_root = Path(backup_root).resolve()
        self.backup_root.mkdir(parents=True, exist_ok=True)

        self.metadata_dir = self.backup_root / "metadata"
        self.metadata_dir.mkdir(exist_ok=True)

        self.logger = self._setup_logging()

        # Default retention policy (30 days)
        self.default_retention_days = 30

        # Default compression
        self.default_compression = CompressionType.TAR_GZ

        # File patterns to exclude from backups
        self.default_excludes = {
            "*.pyc",
            "__pycache__",
            ".git",
            ".svn",
            ".hg",
            "node_modules",
            ".DS_Store",
            "Thumbs.db",
            "*.tmp",
            "*.temp",
            ".vscode",
            ".idea",
        }

    def _setup_logging(self) -> logging.Logger:
        """Setup logging configuration"""
        logger = logging.getLogger("BackupManager")
        logger.setLevel(logging.INFO)

        if not logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)

        return logger

    def create_backup(
        self,
        repository_path: str,
        backup_type: str = BackupStrategy.FULL,
        template_name: Optional[str] = None,
        compression: str = None,
        excludes: Optional[List[str]] = None,
        description: str = "",
        tags: Optional[List[str]] = None,
        retention_days: Optional[int] = None,
    ) -> str:
        """Create a backup of the repository"""

        repo_path = Path(repository_path).resolve()
        if not repo_path.exists():
            raise ValueError(f"Repository path does not exist: {repository_path}")

        # Generate backup ID
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_id = f"{repo_path.name}_{timestamp}"
        if template_name:
            backup_id = f"{backup_id}_{template_name}"

        # Setup paths
        backup_dir = self.backup_root / backup_id
        backup_dir.mkdir(exist_ok=True)

        # Determine compression
        compression = compression or self.default_compression

        # Setup excludes
        effective_excludes = set(self.default_excludes)
        if excludes:
            effective_excludes.update(excludes)

        # Setup retention
        retention_days = retention_days or self.default_retention_days
        retention_until = (datetime.now() + timedelta(days=retention_days)).isoformat()

        self.logger.info(f"Creating {backup_type} backup: {backup_id}")

        try:
            if backup_type == BackupStrategy.FULL:
                archive_path = self._create_full_backup(
                    repo_path, backup_dir, compression, effective_excludes
                )
            elif backup_type == BackupStrategy.INCREMENTAL:
                archive_path = self._create_incremental_backup(
                    repo_path, backup_dir, compression, effective_excludes
                )
            elif backup_type == BackupStrategy.SNAPSHOT:
                archive_path = self._create_snapshot_backup(
                    repo_path, backup_dir, compression, effective_excludes
                )
            elif backup_type == BackupStrategy.SELECTIVE:
                archive_path = self._create_selective_backup(
                    repo_path, backup_dir, compression, effective_excludes
                )
            else:
                raise ValueError(f"Unknown backup type: {backup_type}")

            # Calculate metadata
            file_count = self._count_files_in_archive(archive_path, compression)
            total_size = archive_path.stat().st_size
            verification_hash = self._calculate_file_hash(archive_path)

            # Create metadata
            metadata = BackupMetadata(
                backup_id=backup_id,
                repository_path=str(repo_path),
                backup_path=str(archive_path),
                creation_time=datetime.now().isoformat(),
                template_name=template_name,
                backup_type=backup_type,
                file_count=file_count,
                total_size=total_size,
                verification_hash=verification_hash,
                retention_until=retention_until,
                tags=tags or [],
                description=description,
            )

            # Save metadata
            self._save_metadata(backup_id, metadata)

            self.logger.info(f"Backup created successfully: {backup_id}")
            self.logger.info(f"  Archive: {archive_path}")
            self.logger.info(f"  Size: {self._format_size(total_size)}")
            self.logger.info(f"  Files: {file_count}")

            return backup_id

        except Exception as e:
            # Cleanup on failure
            if backup_dir.exists():
                shutil.rmtree(backup_dir, ignore_errors=True)

            self.logger.error(f"Backup creation failed: {e}")
            raise

    def _create_full_backup(
        self, repo_path: Path, backup_dir: Path, compression: str, excludes: set
    ) -> Path:
        """Create a full repository backup"""

        if compression == CompressionType.ZIP:
            archive_path = backup_dir / "backup.zip"
            return self._create_zip_backup(repo_path, archive_path, excludes)
        else:
            # Default to tar.gz
            archive_path = backup_dir / "backup.tar.gz"
            return self._create_tar_backup(
                repo_path, archive_path, compression, excludes
            )

    def _create_incremental_backup(
        self, repo_path: Path, backup_dir: Path, compression: str, excludes: set
    ) -> Path:
        """Create incremental backup (only changed files)"""

        # Find the last backup for this repository
        last_backup = self._find_last_backup(repo_path)

        if not last_backup:
            self.logger.info("No previous backup found, creating full backup")
            return self._create_full_backup(
                repo_path, backup_dir, compression, excludes
            )

        # Get files changed since last backup
        last_backup_time = datetime.fromisoformat(last_backup.creation_time)
        changed_files = self._find_changed_files(repo_path, last_backup_time, excludes)

        if not changed_files:
            self.logger.info("No files changed since last backup")
            # Create empty archive
            archive_path = backup_dir / "backup.tar.gz"
            with tarfile.open(archive_path, "w:gz") as tar:
                pass
            return archive_path

        # Create archive with only changed files
        archive_path = backup_dir / "backup.tar.gz"
        with tarfile.open(archive_path, "w:gz") as tar:
            for file_path in changed_files:
                rel_path = file_path.relative_to(repo_path)
                tar.add(file_path, arcname=rel_path)

        self.logger.info(
            f"Incremental backup created with {len(changed_files)} changed files"
        )
        return archive_path

    def _create_snapshot_backup(
        self, repo_path: Path, backup_dir: Path, compression: str, excludes: set
    ) -> Path:
        """Create git-style snapshot backup with metadata"""

        # Create file tree snapshot
        file_tree = self._create_file_tree_snapshot(repo_path, excludes)

        # Save file tree metadata
        tree_file = backup_dir / "file_tree.json"
        with open(tree_file, "w") as f:
            json.dump(file_tree, f, indent=2)

        # Create full archive
        archive_path = backup_dir / "backup.tar.gz"
        with tarfile.open(archive_path, "w:gz") as tar:
            # Add file tree metadata
            tar.add(tree_file, arcname="file_tree.json")

            # Add all repository files
            for root, dirs, files in os.walk(repo_path):
                # Apply excludes
                dirs[:] = [
                    d
                    for d in dirs
                    if not self._should_exclude(Path(root) / d, excludes)
                ]

                for file in files:
                    file_path = Path(root) / file
                    if not self._should_exclude(file_path, excludes):
                        rel_path = file_path.relative_to(repo_path)
                        tar.add(file_path, arcname=rel_path)

        return archive_path

    def _create_selective_backup(
        self,
        repo_path: Path,
        backup_dir: Path,
        compression: str,
        excludes: set,
        include_patterns: Optional[List[str]] = None,
    ) -> Path:
        """Create backup of only specified files/directories"""

        if not include_patterns:
            # Default to important configuration files
            include_patterns = [
                "*.json",
                "*.yml",
                "*.yaml",
                "*.md",
                "*.txt",
                ".env*",
                "Dockerfile*",
                "docker-compose*",
                "requirements.txt",
                "package*.json",
            ]

        archive_path = backup_dir / "backup.tar.gz"
        with tarfile.open(archive_path, "w:gz") as tar:
            for pattern in include_patterns:
                for file_path in repo_path.rglob(pattern):
                    if not self._should_exclude(file_path, excludes):
                        rel_path = file_path.relative_to(repo_path)
                        if file_path.is_file():
                            tar.add(file_path, arcname=rel_path)

        return archive_path

    def _create_tar_backup(
        self, repo_path: Path, archive_path: Path, compression: str, excludes: set
    ) -> Path:
        """Create tar-based backup"""

        mode_map = {
            CompressionType.NONE: "w",
            CompressionType.GZIP: "w:gz",
            CompressionType.TAR_GZ: "w:gz",
            CompressionType.TAR_BZ2: "w:bz2",
        }

        mode = mode_map.get(compression, "w:gz")

        with tarfile.open(archive_path, mode) as tar:
            for root, dirs, files in os.walk(repo_path):
                # Apply excludes to directories
                dirs[:] = [
                    d
                    for d in dirs
                    if not self._should_exclude(Path(root) / d, excludes)
                ]

                for file in files:
                    file_path = Path(root) / file
                    if not self._should_exclude(file_path, excludes):
                        rel_path = file_path.relative_to(repo_path)
                        tar.add(file_path, arcname=rel_path)

        return archive_path

    def _create_zip_backup(
        self, repo_path: Path, archive_path: Path, excludes: set
    ) -> Path:
        """Create zip-based backup"""

        with zipfile.ZipFile(archive_path, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for root, dirs, files in os.walk(repo_path):
                # Apply excludes to directories
                dirs[:] = [
                    d
                    for d in dirs
                    if not self._should_exclude(Path(root) / d, excludes)
                ]

                for file in files:
                    file_path = Path(root) / file
                    if not self._should_exclude(file_path, excludes):
                        rel_path = file_path.relative_to(repo_path)
                        zip_file.write(file_path, rel_path)

        return archive_path

    def validate_backup(self, backup_id: str) -> BackupValidationResult:
        """Validate backup integrity and completeness"""

        metadata = self._load_metadata(backup_id)
        if not metadata:
            return BackupValidationResult(
                is_valid=False,
                missing_files=[],
                corrupted_files=[],
                extra_files=[],
                hash_mismatches=[],
                validation_time=datetime.now().isoformat(),
                error_messages=[f"Backup metadata not found: {backup_id}"],
            )

        backup_path = Path(metadata.backup_path)
        validation_time = datetime.now().isoformat()
        errors = []

        # Check if backup file exists
        if not backup_path.exists():
            errors.append(f"Backup archive not found: {backup_path}")
            return BackupValidationResult(
                is_valid=False,
                missing_files=[str(backup_path)],
                corrupted_files=[],
                extra_files=[],
                hash_mismatches=[],
                validation_time=validation_time,
                error_messages=errors,
            )

        # Verify file hash
        current_hash = self._calculate_file_hash(backup_path)
        hash_mismatches = []

        if current_hash != metadata.verification_hash:
            hash_mismatches.append(str(backup_path))
            errors.append(
                f"Hash mismatch: expected {metadata.verification_hash}, got {current_hash}"
            )

        # Try to read archive contents
        corrupted_files = []
        try:
            if backup_path.suffix == ".zip":
                with zipfile.ZipFile(backup_path, "r") as zip_file:
                    zip_file.testzip()
            else:
                with tarfile.open(backup_path, "r") as tar:
                    tar.getmembers()
        except Exception as e:
            corrupted_files.append(str(backup_path))
            errors.append(f"Archive corruption detected: {e}")

        is_valid = len(errors) == 0

        return BackupValidationResult(
            is_valid=is_valid,
            missing_files=[],
            corrupted_files=corrupted_files,
            extra_files=[],
            hash_mismatches=hash_mismatches,
            validation_time=validation_time,
            error_messages=errors,
        )

    def restore_backup(
        self,
        backup_id: str,
        target_path: str,
        force: bool = False,
        selective_files: Optional[List[str]] = None,
    ) -> RestoreResult:
        """Restore backup to target location"""

        metadata = self._load_metadata(backup_id)
        if not metadata:
            return RestoreResult(
                success=False,
                restored_files=[],
                skipped_files=[],
                failed_files=[],
                restore_time=datetime.now().isoformat(),
                backup_id=backup_id,
                error_messages=[f"Backup metadata not found: {backup_id}"],
                warnings=[],
            )

        backup_path = Path(metadata.backup_path)
        target = Path(target_path).resolve()
        restore_time = datetime.now().isoformat()

        # Validate backup before restore
        validation = self.validate_backup(backup_id)
        if not validation.is_valid:
            return RestoreResult(
                success=False,
                restored_files=[],
                skipped_files=[],
                failed_files=[],
                restore_time=restore_time,
                backup_id=backup_id,
                error_messages=[
                    f"Backup validation failed: {validation.error_messages}"
                ],
                warnings=[],
            )

        self.logger.info(f"Restoring backup {backup_id} to {target}")

        # Create target directory
        target.mkdir(parents=True, exist_ok=True)

        restored_files = []
        skipped_files = []
        failed_files = []
        warnings = []

        try:
            if backup_path.suffix == ".zip":
                self._restore_from_zip(
                    backup_path,
                    target,
                    selective_files,
                    force,
                    restored_files,
                    skipped_files,
                    failed_files,
                    warnings,
                )
            else:
                self._restore_from_tar(
                    backup_path,
                    target,
                    selective_files,
                    force,
                    restored_files,
                    skipped_files,
                    failed_files,
                    warnings,
                )

            success = len(failed_files) == 0

            self.logger.info(f"Restore completed: {len(restored_files)} files restored")
            if skipped_files:
                self.logger.info(f"  {len(skipped_files)} files skipped")
            if failed_files:
                self.logger.warning(f"  {len(failed_files)} files failed")

            return RestoreResult(
                success=success,
                restored_files=restored_files,
                skipped_files=skipped_files,
                failed_files=failed_files,
                restore_time=restore_time,
                backup_id=backup_id,
                error_messages=[],
                warnings=warnings,
            )

        except Exception as e:
            self.logger.error(f"Restore failed: {e}")
            return RestoreResult(
                success=False,
                restored_files=restored_files,
                skipped_files=skipped_files,
                failed_files=failed_files,
                restore_time=restore_time,
                backup_id=backup_id,
                error_messages=[f"Restore operation failed: {e}"],
                warnings=warnings,
            )

    def _restore_from_tar(
        self,
        backup_path: Path,
        target: Path,
        selective_files: Optional[List[str]],
        force: bool,
        restored_files: List[str],
        skipped_files: List[str],
        failed_files: List[str],
        warnings: List[str],
    ):
        """Restore files from tar archive"""

        with tarfile.open(backup_path, "r") as tar:
            members = tar.getmembers()

            for member in members:
                if member.isfile():
                    # Check if file should be restored
                    if selective_files and member.name not in selective_files:
                        skipped_files.append(member.name)
                        continue

                    target_file = target / member.name

                    # Check if file exists and force is not set
                    if target_file.exists() and not force:
                        skipped_files.append(member.name)
                        warnings.append(f"File exists, skipped: {member.name}")
                        continue

                    try:
                        # Extract file
                        target_file.parent.mkdir(parents=True, exist_ok=True)
                        tar.extract(member, target)
                        restored_files.append(member.name)
                    except Exception as e:
                        failed_files.append(member.name)
                        warnings.append(f"Failed to restore {member.name}: {e}")

    def _restore_from_zip(
        self,
        backup_path: Path,
        target: Path,
        selective_files: Optional[List[str]],
        force: bool,
        restored_files: List[str],
        skipped_files: List[str],
        failed_files: List[str],
        warnings: List[str],
    ):
        """Restore files from zip archive"""

        with zipfile.ZipFile(backup_path, "r") as zip_file:
            for file_info in zip_file.filelist:
                if not file_info.is_dir():
                    # Check if file should be restored
                    if selective_files and file_info.filename not in selective_files:
                        skipped_files.append(file_info.filename)
                        continue

                    target_file = target / file_info.filename

                    # Check if file exists and force is not set
                    if target_file.exists() and not force:
                        skipped_files.append(file_info.filename)
                        warnings.append(f"File exists, skipped: {file_info.filename}")
                        continue

                    try:
                        # Extract file
                        target_file.parent.mkdir(parents=True, exist_ok=True)
                        zip_file.extract(file_info, target)
                        restored_files.append(file_info.filename)
                    except Exception as e:
                        failed_files.append(file_info.filename)
                        warnings.append(f"Failed to restore {file_info.filename}: {e}")

    def list_backups(
        self, repository_path: Optional[str] = None, template_name: Optional[str] = None
    ) -> List[BackupMetadata]:
        """List available backups with optional filtering"""

        backups = []

        for metadata_file in self.metadata_dir.glob("*.json"):
            try:
                metadata = self._load_metadata(metadata_file.stem)
                if metadata:
                    # Apply filters
                    if repository_path and metadata.repository_path != str(
                        Path(repository_path).resolve()
                    ):
                        continue

                    if template_name and metadata.template_name != template_name:
                        continue

                    backups.append(metadata)
            except Exception as e:
                self.logger.warning(
                    f"Failed to load backup metadata {metadata_file}: {e}"
                )

        # Sort by creation time (newest first)
        backups.sort(key=lambda x: x.creation_time, reverse=True)
        return backups

    def delete_backup(self, backup_id: str, force: bool = False) -> bool:
        """Delete a backup and its metadata"""

        metadata = self._load_metadata(backup_id)
        if not metadata:
            self.logger.warning(f"Backup metadata not found: {backup_id}")
            return False

        if not force:
            # Check retention policy
            retention_until = (
                datetime.fromisoformat(metadata.retention_until)
                if metadata.retention_until
                else None
            )
            if retention_until and datetime.now() < retention_until:
                self.logger.warning(
                    f"Backup {backup_id} is within retention period until {retention_until}"
                )
                return False

        # Delete backup files
        backup_dir = Path(metadata.backup_path).parent
        if backup_dir.exists():
            try:
                shutil.rmtree(backup_dir)
                self.logger.info(f"Deleted backup directory: {backup_dir}")
            except Exception as e:
                self.logger.error(
                    f"Failed to delete backup directory {backup_dir}: {e}"
                )
                return False

        # Delete metadata
        metadata_file = self.metadata_dir / f"{backup_id}.json"
        if metadata_file.exists():
            try:
                metadata_file.unlink()
                self.logger.info(f"Deleted backup metadata: {metadata_file}")
            except Exception as e:
                self.logger.error(f"Failed to delete metadata {metadata_file}: {e}")
                return False

        return True

    def cleanup_expired_backups(self) -> int:
        """Clean up backups that have exceeded their retention period"""

        deleted_count = 0
        current_time = datetime.now()

        for backup in self.list_backups():
            if backup.retention_until:
                retention_until = datetime.fromisoformat(backup.retention_until)
                if current_time > retention_until:
                    if self.delete_backup(backup.backup_id, force=True):
                        deleted_count += 1
                        self.logger.info(
                            f"Cleaned up expired backup: {backup.backup_id}"
                        )

        self.logger.info(f"Cleanup completed: {deleted_count} expired backups deleted")
        return deleted_count

    def _save_metadata(self, backup_id: str, metadata: BackupMetadata):
        """Save backup metadata to file"""
        metadata_file = self.metadata_dir / f"{backup_id}.json"
        with open(metadata_file, "w") as f:
            json.dump(asdict(metadata), f, indent=2)

    def _load_metadata(self, backup_id: str) -> Optional[BackupMetadata]:
        """Load backup metadata from file"""
        metadata_file = self.metadata_dir / f"{backup_id}.json"

        if not metadata_file.exists():
            return None

        try:
            with open(metadata_file, "r") as f:
                data = json.load(f)
            return BackupMetadata(**data)
        except Exception as e:
            self.logger.error(f"Failed to load metadata {metadata_file}: {e}")
            return None

    def _should_exclude(self, file_path: Path, excludes: set) -> bool:
        """Check if file should be excluded from backup"""

        # Check against exclude patterns
        for pattern in excludes:
            if file_path.match(pattern) or any(
                part.match(pattern) for part in file_path.parts
            ):
                return True

        return False

    def _find_last_backup(self, repo_path: Path) -> Optional[BackupMetadata]:
        """Find the most recent backup for a repository"""

        backups = self.list_backups(str(repo_path))
        return backups[0] if backups else None

    def _find_changed_files(
        self, repo_path: Path, since_time: datetime, excludes: set
    ) -> List[Path]:
        """Find files modified since the given time"""

        changed_files = []
        since_timestamp = since_time.timestamp()

        for root, dirs, files in os.walk(repo_path):
            # Apply excludes to directories
            dirs[:] = [
                d for d in dirs if not self._should_exclude(Path(root) / d, excludes)
            ]

            for file in files:
                file_path = Path(root) / file

                if not self._should_exclude(file_path, excludes):
                    try:
                        if file_path.stat().st_mtime > since_timestamp:
                            changed_files.append(file_path)
                    except OSError:
                        # File might have been deleted, skip
                        pass

        return changed_files

    def _create_file_tree_snapshot(
        self, repo_path: Path, excludes: set
    ) -> Dict[str, Any]:
        """Create a snapshot of the file tree with metadata"""

        tree = {}

        for root, dirs, files in os.walk(repo_path):
            # Apply excludes
            dirs[:] = [
                d for d in dirs if not self._should_exclude(Path(root) / d, excludes)
            ]

            for file in files:
                file_path = Path(root) / file

                if not self._should_exclude(file_path, excludes):
                    rel_path = str(file_path.relative_to(repo_path))

                    try:
                        stat = file_path.stat()
                        tree[rel_path] = {
                            "size": stat.st_size,
                            "mtime": stat.st_mtime,
                            "mode": stat.st_mode,
                            "hash": self._calculate_file_hash(file_path),
                        }
                    except OSError:
                        # Skip files that can't be accessed
                        pass

        return tree

    def _calculate_file_hash(self, file_path: Path) -> str:
        """Calculate SHA256 hash of file"""

        hash_sha256 = hashlib.sha256()

        try:
            with open(file_path, "rb") as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    hash_sha256.update(chunk)
        except Exception:
            return ""

        return hash_sha256.hexdigest()

    def _count_files_in_archive(self, archive_path: Path, compression: str) -> int:
        """Count files in archive"""

        try:
            if archive_path.suffix == ".zip":
                with zipfile.ZipFile(archive_path, "r") as zip_file:
                    return len([f for f in zip_file.filelist if not f.is_dir()])
            else:
                with tarfile.open(archive_path, "r") as tar:
                    return len([m for m in tar.getmembers() if m.isfile()])
        except Exception:
            return 0

    def _format_size(self, size_bytes: int) -> str:
        """Format file size in human readable format"""

        for unit in ["B", "KB", "MB", "GB", "TB"]:
            if size_bytes < 1024.0:
                return f"{size_bytes:.1f} {unit}"
            size_bytes /= 1024.0
        return f"{size_bytes:.1f} PB"


def main():
    """CLI interface for backup manager"""
    import argparse

    parser = argparse.ArgumentParser(description="GitOps Backup Manager")
    parser.add_argument(
        "action",
        choices=["create", "list", "validate", "restore", "delete", "cleanup"],
        help="Action to perform",
    )
    parser.add_argument("--repository", "-r", help="Repository path")
    parser.add_argument("--backup-id", help="Backup ID")
    parser.add_argument("--target", help="Restore target path")
    parser.add_argument(
        "--type",
        choices=["full", "incremental", "snapshot", "selective"],
        default="full",
        help="Backup type",
    )
    parser.add_argument("--template", help="Template name for backup tagging")
    parser.add_argument("--force", action="store_true", help="Force operation")
    parser.add_argument(
        "--compression",
        choices=["none", "gzip", "zip", "tar.gz", "tar.bz2"],
        help="Compression type",
    )

    args = parser.parse_args()

    backup_manager = BackupManager()

    if args.action == "create":
        if not args.repository:
            print("Error: --repository required for create action")
            return

        backup_id = backup_manager.create_backup(
            args.repository,
            backup_type=args.type,
            template_name=args.template,
            compression=args.compression,
        )
        print(f"Backup created: {backup_id}")

    elif args.action == "list":
        backups = backup_manager.list_backups(args.repository, args.template)
        print(f"Found {len(backups)} backups:")
        for backup in backups:
            print(
                f"  {backup.backup_id} - {backup.creation_time} - {backup.backup_type}"
            )
            print(f"    Repository: {backup.repository_path}")
            print(f"    Size: {backup_manager._format_size(backup.total_size)}")
            if backup.template_name:
                print(f"    Template: {backup.template_name}")
            print()

    elif args.action == "validate":
        if not args.backup_id:
            print("Error: --backup-id required for validate action")
            return

        result = backup_manager.validate_backup(args.backup_id)
        print(f"Validation result: {'VALID' if result.is_valid else 'INVALID'}")
        if result.error_messages:
            print("Errors:")
            for error in result.error_messages:
                print(f"  - {error}")

    elif args.action == "restore":
        if not args.backup_id or not args.target:
            print("Error: --backup-id and --target required for restore action")
            return

        result = backup_manager.restore_backup(args.backup_id, args.target, args.force)
        print(f"Restore result: {'SUCCESS' if result.success else 'FAILED'}")
        print(f"  Restored: {len(result.restored_files)} files")
        print(f"  Skipped: {len(result.skipped_files)} files")
        print(f"  Failed: {len(result.failed_files)} files")

        if result.error_messages:
            print("Errors:")
            for error in result.error_messages:
                print(f"  - {error}")

    elif args.action == "delete":
        if not args.backup_id:
            print("Error: --backup-id required for delete action")
            return

        if backup_manager.delete_backup(args.backup_id, args.force):
            print(f"Backup deleted: {args.backup_id}")
        else:
            print(f"Failed to delete backup: {args.backup_id}")

    elif args.action == "cleanup":
        deleted_count = backup_manager.cleanup_expired_backups()
        print(f"Cleanup completed: {deleted_count} expired backups deleted")


if __name__ == "__main__":
    main()
