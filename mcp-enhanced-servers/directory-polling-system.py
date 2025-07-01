#!/usr/bin/env python3
"""
Intelligent Directory Polling System
Phase 3A: Document Discovery and Processing

This system monitors directories for documentation changes and automatically
processes and uploads them to WikiJS with intelligent classification.
"""

import asyncio
import hashlib
import json
import logging
import os
import time
from pathlib import Path
from typing import Dict, List, Optional, Set, Any
from datetime import datetime
from dataclasses import dataclass, asdict
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

@dataclass
class DocumentMetadata:
    """Metadata for discovered documents"""
    file_path: str
    content_hash: str
    file_size: int
    last_modified: float
    document_type: str
    priority_score: int
    tags: List[str]
    repository: Optional[str] = None
    language: Optional[str] = None
    discovered_at: Optional[str] = None

class DocumentClassifier:
    """AI-powered document classification and tagging"""
    
    def __init__(self):
        self.document_patterns = {
            'readme': r'(?i)readme\.md$',
            'api_doc': r'(?i)api.*\.md$|(?i).*api\.md$',
            'deployment': r'(?i)deploy.*\.md$|(?i).*deploy.*\.md$',
            'configuration': r'(?i)config.*\.md$|(?i).*config.*\.md$',
            'security': r'(?i)security\.md$',
            'changelog': r'(?i)changelog\.md$|(?i)changes\.md$',
            'roadmap': r'(?i)roadmap\.md$',
            'development': r'(?i)dev.*\.md$|(?i)development\.md$',
            'production': r'(?i)prod.*\.md$|(?i)production\.md$',
            'phase_doc': r'(?i)phase.*\.md$',
            'architecture': r'(?i)arch.*\.md$|(?i)design\.md$',
            'troubleshooting': r'(?i)trouble.*\.md$|(?i)debug.*\.md$'
        }
        
        self.priority_weights = {
            'readme': 100,
            'api_doc': 90,
            'security': 85,
            'deployment': 80,
            'roadmap': 75,
            'phase_doc': 70,
            'architecture': 65,
            'changelog': 60,
            'configuration': 55,
            'development': 50,
            'production': 50,
            'troubleshooting': 45
        }

    def classify_document(self, file_path: str, content: str) -> DocumentMetadata:
        """Classify a document and generate metadata"""
        import re
        
        file_name = Path(file_path).name
        doc_type = 'general'
        tags = []
        
        # Pattern-based classification
        for doc_type_name, pattern in self.document_patterns.items():
            if re.search(pattern, file_name):
                doc_type = doc_type_name
                break
        
        # Content-based tagging
        content_lower = content.lower()
        
        # Technical tags
        if any(keyword in content_lower for keyword in ['api', 'endpoint', 'rest', 'graphql']):
            tags.append('api')
        if any(keyword in content_lower for keyword in ['docker', 'kubernetes', 'deployment']):
            tags.append('deployment')
        if any(keyword in content_lower for keyword in ['security', 'authentication', 'authorization']):
            tags.append('security')
        if any(keyword in content_lower for keyword in ['database', 'sql', 'migration']):
            tags.append('database')
        if any(keyword in content_lower for keyword in ['frontend', 'react', 'vue', 'angular']):
            tags.append('frontend')
        if any(keyword in content_lower for keyword in ['backend', 'server', 'api']):
            tags.append('backend')
        if any(keyword in content_lower for keyword in ['devops', 'ci/cd', 'pipeline']):
            tags.append('devops')
        
        # Phase tags
        if any(keyword in content_lower for keyword in ['phase 1', 'phase1']):
            tags.append('phase1')
        if any(keyword in content_lower for keyword in ['phase 2', 'phase2']):
            tags.append('phase2')
        if any(keyword in content_lower for keyword in ['phase 3', 'phase3']):
            tags.append('phase3')
        
        # Calculate priority score
        base_priority = self.priority_weights.get(doc_type, 40)
        
        # Boost priority for recent files
        file_stat = os.stat(file_path)
        age_days = (time.time() - file_stat.st_mtime) / (24 * 3600)
        if age_days < 1:
            base_priority += 20
        elif age_days < 7:
            base_priority += 10
        
        # Boost for comprehensive documentation
        if len(content) > 5000:
            base_priority += 15
        elif len(content) > 1000:
            base_priority += 5
        
        # Generate content hash
        content_hash = hashlib.sha256(content.encode('utf-8')).hexdigest()
        
        return DocumentMetadata(
            file_path=file_path,
            content_hash=content_hash,
            file_size=len(content),
            last_modified=file_stat.st_mtime,
            document_type=doc_type,
            priority_score=min(base_priority, 100),  # Cap at 100
            tags=tags,
            repository=self._extract_repository_name(file_path),
            language=self._detect_language(content),
            discovered_at=datetime.now().isoformat()
        )

    def _extract_repository_name(self, file_path: str) -> Optional[str]:
        """Extract repository name from file path"""
        path_parts = Path(file_path).parts
        
        # Look for common repository indicators
        for part in path_parts:
            if any(indicator in part.lower() for indicator in ['git', 'repo', 'project']):
                # Return the next part as repository name
                try:
                    idx = path_parts.index(part)
                    if idx + 1 < len(path_parts):
                        return path_parts[idx + 1]
                except ValueError:
                    pass
        
        # Fallback: use the directory containing the file
        return Path(file_path).parent.name

    def _detect_language(self, content: str) -> Optional[str]:
        """Detect the primary language/framework mentioned in content"""
        content_lower = content.lower()
        
        languages = {
            'python': ['python', 'pip', 'virtualenv', 'django', 'flask'],
            'javascript': ['javascript', 'node.js', 'npm', 'react', 'vue'],
            'typescript': ['typescript', 'ts', 'angular'],
            'go': ['golang', 'go mod'],
            'rust': ['rust', 'cargo'],
            'java': ['java', 'maven', 'gradle'],
            'shell': ['bash', 'shell', 'zsh'],
            'docker': ['docker', 'dockerfile', 'container'],
            'kubernetes': ['kubernetes', 'k8s', 'kubectl']
        }
        
        for lang, keywords in languages.items():
            if any(keyword in content_lower for keyword in keywords):
                return lang
        
        return None

class FileWatcher(FileSystemEventHandler):
    """File system event handler for real-time monitoring"""
    
    def __init__(self, polling_system):
        self.polling_system = polling_system
        self.logger = logging.getLogger('file-watcher')
    
    def on_modified(self, event):
        if not event.is_directory and event.src_path.endswith('.md'):
            self.logger.info(f"File modified: {event.src_path}")
            asyncio.create_task(self.polling_system.process_file(event.src_path))
    
    def on_created(self, event):
        if not event.is_directory and event.src_path.endswith('.md'):
            self.logger.info(f"File created: {event.src_path}")
            asyncio.create_task(self.polling_system.process_file(event.src_path))

class DirectoryPollingSystem:
    """
    Intelligent Directory Polling System with Real-time Monitoring
    
    Features:
    - Multi-format document discovery
    - Real-time file system monitoring
    - AI-powered content classification
    - Duplicate detection and conflict resolution
    - Batch processing with progress tracking
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.logger = self._setup_logging()
        self.classifier = DocumentClassifier()
        self.processed_documents: Dict[str, DocumentMetadata] = {}
        self.processing_queue: asyncio.Queue = asyncio.Queue()
        self.wiki_uploader = None  # Will connect to WikiJS MCP server
        
        # Configuration
        self.watch_directories = config.get('watch_directories', [])
        self.file_patterns = config.get('file_patterns', ['*.md', '*.rst', '*.txt'])
        self.batch_size = config.get('batch_size', 10)
        self.processing_interval = config.get('processing_interval', 30)  # seconds
        
        # File system observer
        self.observer = Observer()
        self.is_monitoring = False

    def _setup_logging(self) -> logging.Logger:
        """Setup structured logging"""
        logger = logging.getLogger('directory-poller')
        logger.setLevel(logging.INFO)
        
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
        return logger

    async def start_monitoring(self) -> Dict[str, Any]:
        """Start real-time directory monitoring"""
        self.logger.info("Starting directory monitoring system")
        
        # Set up file system watchers
        for directory in self.watch_directories:
            if os.path.exists(directory):
                event_handler = FileWatcher(self)
                self.observer.schedule(event_handler, directory, recursive=True)
                self.logger.info(f"Watching directory: {directory}")
            else:
                self.logger.warning(f"Directory does not exist: {directory}")
        
        # Start observer
        self.observer.start()
        self.is_monitoring = True
        
        # Start processing task
        processing_task = asyncio.create_task(self._process_queue_worker())
        
        # Initial discovery scan
        initial_docs = await self.discover_documents()
        
        return {
            'status': 'monitoring_started',
            'directories_watched': len([d for d in self.watch_directories if os.path.exists(d)]),
            'initial_documents_found': len(initial_docs),
            'real_time_monitoring': True,
            'processing_task_active': True
        }

    async def discover_documents(self) -> List[DocumentMetadata]:
        """Discover all documents in monitored directories"""
        self.logger.info("Starting document discovery scan")
        
        discovered_docs = []
        
        for directory in self.watch_directories:
            if not os.path.exists(directory):
                continue
                
            self.logger.info(f"Scanning directory: {directory}")
            
            for pattern in self.file_patterns:
                # Use pathlib for pattern matching
                path_obj = Path(directory)
                for file_path in path_obj.rglob(pattern.replace('*', '*')):
                    if file_path.is_file():
                        try:
                            doc_metadata = await self.process_file(str(file_path))
                            if doc_metadata:
                                discovered_docs.append(doc_metadata)
                        except Exception as e:
                            self.logger.error(f"Error processing {file_path}: {e}")
        
        self.logger.info(f"Document discovery completed: {len(discovered_docs)} documents found")
        return discovered_docs

    async def process_file(self, file_path: str) -> Optional[DocumentMetadata]:
        """Process a single file and classify it"""
        try:
            # Check if file should be processed
            if not self._should_process_file(file_path):
                return None
            
            # Read file content
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            # Skip empty files
            if len(content.strip()) < 10:
                return None
            
            # Classify document
            doc_metadata = self.classifier.classify_document(file_path, content)
            
            # Check for duplicates
            if await self._is_duplicate(doc_metadata):
                self.logger.debug(f"Duplicate document detected: {file_path}")
                return None
            
            # Store metadata
            self.processed_documents[file_path] = doc_metadata
            
            # Queue for upload
            await self.processing_queue.put(doc_metadata)
            
            self.logger.info(f"Processed document: {file_path} (type: {doc_metadata.document_type}, priority: {doc_metadata.priority_score})")
            
            return doc_metadata
            
        except Exception as e:
            self.logger.error(f"Error processing file {file_path}: {e}")
            return None

    async def batch_process_queue(self) -> Dict[str, Any]:
        """Process queued documents in batches"""
        processed_count = 0
        uploaded_count = 0
        failed_count = 0
        
        batch = []
        
        # Collect batch
        while len(batch) < self.batch_size and not self.processing_queue.empty():
            try:
                doc_metadata = await asyncio.wait_for(self.processing_queue.get(), timeout=1.0)
                batch.append(doc_metadata)
            except asyncio.TimeoutError:
                break
        
        if not batch:
            return {
                'processed': 0,
                'uploaded': 0,
                'failed': 0,
                'queue_size': self.processing_queue.qsize()
            }
        
        # Sort batch by priority
        batch.sort(key=lambda x: x.priority_score, reverse=True)
        
        # Process batch
        for doc_metadata in batch:
            try:
                # Upload to WikiJS (simulated)
                upload_result = await self._upload_to_wiki(doc_metadata)
                
                if upload_result['success']:
                    uploaded_count += 1
                    self.logger.info(f"Uploaded: {doc_metadata.file_path}")
                else:
                    failed_count += 1
                    self.logger.error(f"Upload failed: {doc_metadata.file_path}")
                
                processed_count += 1
                
                # Mark task as done
                self.processing_queue.task_done()
                
            except Exception as e:
                failed_count += 1
                self.logger.error(f"Error uploading {doc_metadata.file_path}: {e}")
        
        return {
            'processed': processed_count,
            'uploaded': uploaded_count,
            'failed': failed_count,
            'queue_size': self.processing_queue.qsize()
        }

    async def get_system_status(self) -> Dict[str, Any]:
        """Get comprehensive system status"""
        return {
            'monitoring_active': self.is_monitoring,
            'directories_watched': len(self.watch_directories),
            'documents_processed': len(self.processed_documents),
            'queue_size': self.processing_queue.qsize(),
            'file_patterns': self.file_patterns,
            'batch_size': self.batch_size,
            'processing_interval': self.processing_interval,
            'top_document_types': self._get_document_type_stats(),
            'recent_discoveries': self._get_recent_discoveries()
        }

    def stop_monitoring(self) -> Dict[str, Any]:
        """Stop directory monitoring"""
        if self.is_monitoring:
            self.observer.stop()
            self.observer.join()
            self.is_monitoring = False
            self.logger.info("Directory monitoring stopped")
        
        return {
            'status': 'monitoring_stopped',
            'final_queue_size': self.processing_queue.qsize(),
            'total_documents_processed': len(self.processed_documents)
        }

    # Private helper methods
    
    def _should_process_file(self, file_path: str) -> bool:
        """Determine if a file should be processed"""
        file_path_obj = Path(file_path)
        
        # Check file extension
        if not any(file_path.endswith(pattern.replace('*', '')) for pattern in self.file_patterns):
            return False
        
        # Skip hidden files and directories
        if any(part.startswith('.') for part in file_path_obj.parts):
            return False
        
        # Skip common non-documentation directories
        skip_dirs = {'node_modules', '__pycache__', '.git', 'vendor', 'build', 'dist'}
        if any(skip_dir in file_path_obj.parts for skip_dir in skip_dirs):
            return False
        
        return True

    async def _is_duplicate(self, doc_metadata: DocumentMetadata) -> bool:
        """Check if document is a duplicate"""
        for existing_path, existing_metadata in self.processed_documents.items():
            # Same content hash = duplicate
            if existing_metadata.content_hash == doc_metadata.content_hash:
                return True
            
            # Very similar file names in same directory
            if (Path(existing_path).parent == Path(doc_metadata.file_path).parent and
                Path(existing_path).stem.lower() == Path(doc_metadata.file_path).stem.lower()):
                return True
        
        return False

    async def _upload_to_wiki(self, doc_metadata: DocumentMetadata) -> Dict[str, Any]:
        """Upload document to WikiJS (simulated)"""
        # Simulate upload delay
        await asyncio.sleep(0.1)
        
        # Simulate upload process
        self.logger.debug(f"Uploading {doc_metadata.file_path} to WikiJS")
        
        return {
            'success': True,
            'wiki_page_id': f"page_{hash(doc_metadata.file_path) % 10000}",
            'upload_time': datetime.now().isoformat(),
            'document_type': doc_metadata.document_type,
            'tags': doc_metadata.tags
        }

    async def _process_queue_worker(self) -> None:
        """Background worker to process the document queue"""
        while self.is_monitoring:
            try:
                result = await self.batch_process_queue()
                if result['processed'] > 0:
                    self.logger.info(f"Batch processed: {result['processed']} documents, {result['uploaded']} uploaded")
                
                # Wait before next batch
                await asyncio.sleep(self.processing_interval)
                
            except Exception as e:
                self.logger.error(f"Error in queue worker: {e}")
                await asyncio.sleep(5)  # Error recovery delay

    def _get_document_type_stats(self) -> Dict[str, int]:
        """Get statistics about document types"""
        type_counts = {}
        for metadata in self.processed_documents.values():
            doc_type = metadata.document_type
            type_counts[doc_type] = type_counts.get(doc_type, 0) + 1
        
        return dict(sorted(type_counts.items(), key=lambda x: x[1], reverse=True)[:10])

    def _get_recent_discoveries(self) -> List[Dict[str, Any]]:
        """Get recent document discoveries"""
        recent = sorted(
            self.processed_documents.values(),
            key=lambda x: x.discovered_at or '',
            reverse=True
        )[:5]
        
        return [
            {
                'file_path': doc.file_path,
                'document_type': doc.document_type,
                'priority_score': doc.priority_score,
                'discovered_at': doc.discovered_at
            }
            for doc in recent
        ]


# Testing and demonstration
async def main():
    """
    Directory Polling System Demo
    Phase 3A Implementation
    """
    print("🔍 Starting Intelligent Directory Polling System")
    print("📂 Phase 3A: Document Discovery and Processing")
    
    # Configuration
    config = {
        'watch_directories': [
            '/home/dev/workspace/homelab-gitops-auditor',
            '/home/dev/workspace/mcp-servers'
        ],
        'file_patterns': ['*.md', '*.rst', '*.txt'],
        'batch_size': 5,
        'processing_interval': 10
    }
    
    # Initialize polling system
    polling_system = DirectoryPollingSystem(config)
    
    print(f"\n📋 Configuration:")
    print(f"   - Watch directories: {len(config['watch_directories'])}")
    print(f"   - File patterns: {config['file_patterns']}")
    print(f"   - Batch size: {config['batch_size']}")
    
    # Start monitoring
    start_result = await polling_system.start_monitoring()
    print(f"\n✅ Monitoring started:")
    print(f"   - Directories watched: {start_result['directories_watched']}")
    print(f"   - Initial documents found: {start_result['initial_documents_found']}")
    print(f"   - Real-time monitoring: {start_result['real_time_monitoring']}")
    
    # Process initial queue
    print(f"\n🔄 Processing initial document queue...")
    for i in range(3):  # Process a few batches
        batch_result = await polling_system.batch_process_queue()
        if batch_result['processed'] > 0:
            print(f"   Batch {i+1}: {batch_result['processed']} processed, {batch_result['uploaded']} uploaded")
        else:
            break
    
    # Get system status
    status = await polling_system.get_system_status()
    print(f"\n📊 System Status:")
    print(f"   - Documents processed: {status['documents_processed']}")
    print(f"   - Queue size: {status['queue_size']}")
    print(f"   - Top document types: {status['top_document_types']}")
    
    # Stop monitoring
    stop_result = polling_system.stop_monitoring()
    print(f"\n🛑 Monitoring stopped:")
    print(f"   - Final queue size: {stop_result['final_queue_size']}")
    print(f"   - Total documents processed: {stop_result['total_documents_processed']}")
    
    print(f"\n🎉 Directory Polling System demonstration completed!")
    print(f"📚 Ready for Phase 3A integration")

if __name__ == "__main__":
    asyncio.run(main())