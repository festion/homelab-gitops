"""
Core linting engine for the Code Linter MCP Server.
"""

import asyncio
import json
import logging
import os
import shutil
import subprocess
import tempfile
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any

from .config import CodeLinterConfig, LanguageConfig, LinterConfig
from .exceptions import (
    ValidationError, 
    UnsupportedLanguageError, 
    LinterNotFoundError,
    SecurityError
)
from .security import SecurityValidator

logger = logging.getLogger(__name__)


class LintResult:
    """Result of a linting operation."""
    
    def __init__(
        self, 
        success: bool, 
        errors: List[Dict] = None, 
        warnings: List[Dict] = None,
        suggestions: List[Dict] = None,
        formatted_code: Optional[str] = None,
        linter: str = "",
        execution_time: float = 0.0
    ):
        self.success = success
        self.errors = errors or []
        self.warnings = warnings or []
        self.suggestions = suggestions or []
        self.formatted_code = formatted_code
        self.linter = linter
        self.execution_time = execution_time
    
    def to_dict(self) -> Dict:
        """Convert result to dictionary."""
        return {
            "success": self.success,
            "errors": self.errors,
            "warnings": self.warnings,
            "suggestions": self.suggestions,
            "formatted_code": self.formatted_code,
            "linter": self.linter,
            "execution_time": self.execution_time
        }


class LintingEngine:
    """Core engine for code linting and validation."""
    
    def __init__(self, config: CodeLinterConfig):
        self.config = config
        self.security = SecurityValidator(config.security)
        self.executor = ThreadPoolExecutor(max_workers=config.concurrent_linters)
        self.result_cache = {} if config.cache_results else None
        self._setup_logging()
        
    def _setup_logging(self):
        """Setup logging configuration."""
        logging.basicConfig(
            level=getattr(logging, self.config.log_level.upper()),
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
    
    def detect_language(self, file_path: str) -> Optional[str]:
        """Detect programming language from file extension."""
        file_ext = Path(file_path).suffix.lower()
        
        for lang_name, lang_config in self.config.languages.items():
            if file_ext in lang_config.extensions:
                return lang_name
        
        return None
    
    async def lint_file(self, file_path: str, content: Optional[str] = None) -> Dict[str, LintResult]:
        """Lint a single file with all applicable linters."""
        # Security validation
        if not self.security.validate_file_extension(file_path):
            raise SecurityError(f"File extension not allowed: {file_path}")
        
        if not self.security.validate_file_path(file_path):
            raise SecurityError(f"File path not allowed: {file_path}")
        
        # Detect language
        language = self.detect_language(file_path)
        if not language:
            raise UnsupportedLanguageError(f"Unsupported file type: {file_path}")
        
        lang_config = self.config.languages[language]
        
        # Run linters
        results = {}
        linters_to_run = lang_config.default_linters or list(lang_config.linters.keys())
        
        tasks = []
        for linter_name in linters_to_run:
            if linter_name in lang_config.linters:
                linter_config = lang_config.linters[linter_name]
                if linter_config.enabled:
                    task = self._run_linter(file_path, content, linter_name, linter_config)
                    tasks.append((linter_name, task))
        
        # Execute linters concurrently
        for linter_name, task in tasks:
            try:
                result = await task
                results[linter_name] = result
            except Exception as e:
                logger.error(f"Error running {linter_name}: {e}")
                results[linter_name] = LintResult(
                    success=False, 
                    errors=[{"message": str(e), "type": "linter_error"}],
                    linter=linter_name
                )
        
        return results
    
    async def _run_linter(
        self, 
        file_path: str, 
        content: Optional[str], 
        linter_name: str, 
        linter_config: LinterConfig
    ) -> LintResult:
        """Run a specific linter on a file."""
        start_time = time.time()
        
        try:
            # Check if linter is available
            linter_command = linter_config.command or linter_name
            if not shutil.which(linter_command):
                raise LinterNotFoundError(f"Linter '{linter_name}' not found in PATH")
            
            # Prepare temporary file if content is provided
            temp_file = None
            target_file = file_path
            
            if content is not None:
                temp_file = tempfile.NamedTemporaryFile(
                    mode='w', 
                    suffix=Path(file_path).suffix,
                    delete=False
                )
                temp_file.write(content)
                temp_file.close()
                target_file = temp_file.name
            
            # Run linter
            result = await asyncio.get_event_loop().run_in_executor(
                self.executor,
                self._execute_linter,
                linter_command,
                target_file,
                linter_config
            )
            
            # Clean up temporary file
            if temp_file:
                os.unlink(temp_file.name)
            
            execution_time = time.time() - start_time
            result.execution_time = execution_time
            result.linter = linter_name
            
            return result
            
        except Exception as e:
            execution_time = time.time() - start_time
            return LintResult(
                success=False,
                errors=[{"message": str(e), "type": "execution_error"}],
                linter=linter_name,
                execution_time=execution_time
            )
    
    def _execute_linter(
        self, 
        linter_command: str, 
        file_path: str, 
        linter_config: LinterConfig
    ) -> LintResult:
        """Execute linter command synchronously."""
        cmd = [linter_command] + linter_config.args + [file_path]
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=linter_config.timeout,
                cwd=os.path.dirname(file_path) if os.path.exists(file_path) else None
            )
            
            return self._parse_linter_output(
                linter_command, 
                result.returncode, 
                result.stdout, 
                result.stderr
            )
            
        except subprocess.TimeoutExpired:
            return LintResult(
                success=False,
                errors=[{"message": f"Linter timeout after {linter_config.timeout}s", "type": "timeout"}]
            )
        except Exception as e:
            return LintResult(
                success=False,
                errors=[{"message": str(e), "type": "execution_error"}]
            )

    def _parse_linter_output(
        self, 
        linter_name: str, 
        return_code: int, 
        stdout: str, 
        stderr: str
    ) -> LintResult:
        """Parse linter output into structured format."""
        # Basic implementation - can be extended for specific linters
        success = return_code == 0
        errors = []
        warnings = []
        
        # Parse stderr for errors
        if stderr:
            for line in stderr.strip().split('\n'):
                if line:
                    errors.append({
                        "message": line,
                        "type": "error",
                        "source": "stderr"
                    })
        
        # Parse stdout based on linter type
        if stdout:
            if linter_name in ['flake8', 'pylint']:
                self._parse_python_linter_output(stdout, errors, warnings)
            elif linter_name in ['eslint']:
                self._parse_eslint_output(stdout, errors, warnings)
            elif linter_name in ['yamllint']:
                self._parse_yamllint_output(stdout, errors, warnings)
            else:
                # Generic parsing
                for line in stdout.strip().split('\n'):
                    if line and not success:
                        errors.append({
                            "message": line,
                            "type": "error",
                            "source": "stdout"
                        })
        
        return LintResult(
            success=success and not errors,
            errors=errors,
            warnings=warnings
        )
    
    def _parse_python_linter_output(self, output: str, errors: List, warnings: List):
        """Parse Python linter output (flake8, pylint)."""
        for line in output.strip().split('\n'):
            if ':' in line:
                parts = line.split(':', 3)
                if len(parts) >= 4:
                    file_path, line_num, col_num, message = parts
                    error_data = {
                        "file": file_path.strip(),
                        "line": int(line_num.strip()) if line_num.strip().isdigit() else 0,
                        "column": int(col_num.strip()) if col_num.strip().isdigit() else 0,
                        "message": message.strip(),
                        "type": "warning" if any(w in message.lower() for w in ['warning', 'w']) else "error"
                    }
                    
                    if error_data["type"] == "warning":
                        warnings.append(error_data)
                    else:
                        errors.append(error_data)

    def _parse_eslint_output(self, output: str, errors: List, warnings: List):
        """Parse ESLint JSON output."""
        try:
            data = json.loads(output)
            for file_result in data:
                for message in file_result.get('messages', []):
                    error_data = {
                        "file": file_result.get('filePath', ''),
                        "line": message.get('line', 0),
                        "column": message.get('column', 0),
                        "message": message.get('message', ''),
                        "rule": message.get('ruleId', ''),
                        "type": "warning" if message.get('severity') == 1 else "error"
                    }
                    
                    if error_data["type"] == "warning":
                        warnings.append(error_data)
                    else:
                        errors.append(error_data)
        except json.JSONDecodeError:
            # Fallback to text parsing
            pass

    def _parse_yamllint_output(self, output: str, errors: List, warnings: List):
        """Parse yamllint output."""
        for line in output.strip().split('\n'):
            if ':' in line:
                parts = line.split(':', 3)
                if len(parts) >= 4:
                    file_path, line_num, col_num, message = parts
                    error_data = {
                        "file": file_path.strip(),
                        "line": int(line_num.strip()) if line_num.strip().isdigit() else 0,
                        "column": int(col_num.strip()) if col_num.strip().isdigit() else 0,
                        "message": message.strip(),
                        "type": "warning" if "warning" in message.lower() else "error"
                    }
                    
                    if error_data["type"] == "warning":
                        warnings.append(error_data)
                    else:
                        errors.append(error_data)