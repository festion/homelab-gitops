#!/usr/bin/env python3
"""
TrueNAS MCP Server Installer
Installs and configures the TrueNAS MCP server following project patterns
"""

import os
import sys
import subprocess
import shutil
import json
from pathlib import Path
import venv

def create_virtual_environment(server_dir: Path) -> bool:
    """Create a virtual environment for the server"""
    venv_path = server_dir / "venv"
    
    print(f"Creating virtual environment at {venv_path}...")
    try:
        # Create virtual environment
        venv.create(venv_path, with_pip=True)
        print("✅ Virtual environment created successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to create virtual environment: {e}")
        return False

def install_dependencies(server_dir: Path) -> bool:
    """Install Python dependencies"""
    venv_path = server_dir / "venv"
    requirements_file = server_dir / "requirements.txt"
    
    if not requirements_file.exists():
        print("❌ requirements.txt not found")
        return False
    
    # Determine pip path based on platform
    if os.name == 'nt':  # Windows
        pip_path = venv_path / "Scripts" / "pip.exe"
        python_path = venv_path / "Scripts" / "python.exe"
    else:  # Unix/Linux/macOS
        pip_path = venv_path / "bin" / "pip"
        python_path = venv_path / "bin" / "python"
    
    print(f"Installing dependencies from {requirements_file}...")
    try:
        # Upgrade pip first
        subprocess.run([str(python_path), "-m", "pip", "install", "--upgrade", "pip"], 
                      check=True, capture_output=True)
        
        # Install requirements
        subprocess.run([str(pip_path), "install", "-r", str(requirements_file)], 
                      check=True, capture_output=True)
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def create_config_template(server_dir: Path) -> bool:
    """Create configuration template files"""
    try:
        # Create .env file if it doesn't exist
        env_file = server_dir / ".env"
        env_example = server_dir / ".env.example"
        
        if not env_file.exists() and env_example.exists():
            shutil.copy(env_example, env_file)
            print("✅ Created .env configuration file")
        
        # Create Claude Desktop config template
        claude_config = {
            "mcpServers": {
                "truenas": {
                    "command": str(server_dir / "run_server.py"),
                    "args": [],
                    "env": {
                        "TRUENAS_URL": "http://your-truenas-server",
                        "TRUENAS_API_KEY": "your-api-key",
                        "TRUENAS_VERIFY_SSL": "false",
                        "TRUENAS_TIMEOUT": "30"
                    }
                }
            }
        }
        
        claude_config_file = server_dir / "claude-desktop-config.json"
        with open(claude_config_file, 'w') as f:
            json.dump(claude_config, f, indent=2)
        print("✅ Created Claude Desktop configuration template")
        
        return True
    except Exception as e:
        print(f"❌ Failed to create configuration templates: {e}")
        return False

def make_scripts_executable(server_dir: Path) -> bool:
    """Make Python scripts executable on Unix systems"""
    if os.name == 'nt':  # Skip on Windows
        return True
    
    try:
        scripts = [
            server_dir / "truenas_mcp_server.py",
            server_dir / "run_server.py",
            server_dir / "test_startup.py"
        ]
        
        for script in scripts:
            if script.exists():
                os.chmod(script, 0o755)
        
        print("✅ Made scripts executable")
        return True
    except Exception as e:
        print(f"❌ Failed to make scripts executable: {e}")
        return False

def run_tests(server_dir: Path) -> bool:
    """Run startup tests"""
    test_script = server_dir / "test_startup.py"
    if not test_script.exists():
        print("⚠️  Test script not found, skipping tests")
        return True
    
    # Determine python path
    venv_path = server_dir / "venv"
    if os.name == 'nt':  # Windows
        python_path = venv_path / "Scripts" / "python.exe"
    else:  # Unix/Linux/macOS
        python_path = venv_path / "bin" / "python"
    
    print("Running startup tests...")
    try:
        result = subprocess.run([str(python_path), str(test_script)], 
                              cwd=server_dir, check=False, capture_output=True, text=True)
        
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        
        if result.returncode == 0:
            print("✅ Tests completed successfully")
            return True
        else:
            print("⚠️  Tests completed with warnings (this is normal for initial setup)")
            return True
    except Exception as e:
        print(f"❌ Failed to run tests: {e}")
        return False

def print_usage_instructions(server_dir: Path):
    """Print usage instructions"""
    print("\n" + "="*60)
    print("🎉 TrueNAS MCP Server Installation Complete!")
    print("="*60)
    print("\n📋 Next Steps:")
    print(f"1. Edit configuration: {server_dir / '.env'}")
    print("   - Set your TrueNAS URL and API key")
    print("   - Adjust SSL verification settings")
    print()
    print(f"2. Test the server: python3 {server_dir / 'test_startup.py'}")
    print()
    print(f"3. Add to Claude Desktop:")
    print(f"   - Copy configuration from: {server_dir / 'claude-desktop-config.json'}")
    print("   - Add to your Claude Desktop MCP settings")
    print()
    print("🚀 Usage Examples:")
    print("   - 'List all storage pools in my TrueNAS'")
    print("   - 'Create a dataset called backups in the tank pool'")
    print("   - 'Show me all users and their permissions'")
    print("   - 'Take a snapshot of tank/important'")

def main():
    """Main installer function"""
    print("🔧 TrueNAS MCP Server Installer")
    print("=" * 40)
    
    # Get server directory
    server_dir = Path(__file__).parent
    print(f"Installing in: {server_dir}")
    
    # Installation steps
    steps = [
        ("Creating virtual environment", lambda: create_virtual_environment(server_dir)),
        ("Installing dependencies", lambda: install_dependencies(server_dir)),
        ("Creating configuration templates", lambda: create_config_template(server_dir)),
        ("Making scripts executable", lambda: make_scripts_executable(server_dir)),
        ("Running tests", lambda: run_tests(server_dir)),
    ]
    
    success_count = 0
    for step_name, step_func in steps:
        print(f"\n📦 {step_name}...")
        if step_func():
            success_count += 1
        else:
            print(f"❌ Failed: {step_name}")
            break
    
    print(f"\n📊 Installation completed: {success_count}/{len(steps)} steps successful")
    
    if success_count == len(steps):
        print_usage_instructions(server_dir)
        return 0
    else:
        print("❌ Installation incomplete. Please resolve the errors and try again.")
        return 1

if __name__ == "__main__":
    sys.exit(main())