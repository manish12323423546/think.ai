#!/usr/bin/env python3
"""
Install all required dependencies for SD1 Film Production AI System
"""
import subprocess
import sys
import os

def install_package(package):
    """Install a package using pip."""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"✅ Successfully installed {package}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install {package}: {e}")
        return False

def main():
    print("🎬 SD1 Film Production AI System - Dependency Installation")
    print("=" * 60)
    
    # Check if we're in a virtual environment
    if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("✅ Virtual environment detected")
    else:
        print("⚠️  Warning: Not in a virtual environment. Consider using one.")
    
    # List of critical packages
    critical_packages = [
        "fastapi",
        "uvicorn",
        "google-genai",
        "pydantic",
        "python-dotenv",
        "httpx",
        "tenacity",
        "networkx",
        "geopy",
        "numpy",
        "pandas",
        "watchdog"
    ]
    
    print(f"\n📦 Installing {len(critical_packages)} critical packages...")
    
    failed_packages = []
    for package in critical_packages:
        if not install_package(package):
            failed_packages.append(package)
    
    print(f"\n📋 Installation Summary:")
    print(f"✅ Successfully installed: {len(critical_packages) - len(failed_packages)}")
    print(f"❌ Failed to install: {len(failed_packages)}")
    
    if failed_packages:
        print(f"\nFailed packages: {', '.join(failed_packages)}")
        print("Please install these manually or check your network connection.")
        return False
    
    # Install all requirements
    print(f"\n📁 Installing from requirements.txt...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ All requirements installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"⚠️  Some packages from requirements.txt may have failed: {e}")
    
    print(f"\n🎉 Installation complete!")
    print(f"🚀 You can now start the development server with: ./start_dev.sh")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)