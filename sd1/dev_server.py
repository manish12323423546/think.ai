#!/usr/bin/env python3
"""
Development server with auto-reload functionality for SD1 Film Production AI System
"""
import subprocess
import sys
import time
import os
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import threading
import signal

class ChangeHandler(FileSystemEventHandler):
    """Handle file system changes and trigger server restart."""
    
    def __init__(self, restart_callback):
        self.restart_callback = restart_callback
        self.last_restart = 0
        self.restart_delay = 2  # seconds
        
    def on_modified(self, event):
        if event.is_directory:
            return
            
        # Only restart for Python files
        if not event.src_path.endswith('.py'):
            return
            
        # Avoid rapid restarts
        current_time = time.time()
        if current_time - self.last_restart < self.restart_delay:
            return
            
        print(f"\n🔄 File changed: {event.src_path}")
        print("🚀 Restarting server...")
        self.last_restart = current_time
        self.restart_callback()

class DevServer:
    """Development server with auto-reload capability."""
    
    def __init__(self):
        self.process = None
        self.observer = None
        self.running = False
        
    def start_server(self):
        """Start the FastAPI server."""
        if self.process:
            self.stop_server()
            
        print("🌟 Starting SD1 Film Production AI Server...")
        
        # Start uvicorn with the API
        cmd = [
            sys.executable, "-m", "uvicorn", 
            "api:app", 
            "--host", "0.0.0.0", 
            "--port", "8000",
            "--log-level", "info"
        ]
        
        self.process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            bufsize=1
        )
        
        # Start a thread to read and display output
        self.output_thread = threading.Thread(target=self._read_output, daemon=True)
        self.output_thread.start()
        
        time.sleep(2)  # Give server time to start
        print("✅ Server started successfully!")
        print("📡 API available at: http://localhost:8000")
        print("📋 API docs available at: http://localhost:8000/docs")
        print("👀 Watching for file changes...")
        
    def stop_server(self):
        """Stop the FastAPI server."""
        if self.process:
            print("🛑 Stopping server...")
            self.process.terminate()
            try:
                self.process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.process.kill()
            self.process = None
            
    def _read_output(self):
        """Read and display server output."""
        if not self.process:
            return
            
        for line in iter(self.process.stdout.readline, ''):
            if line:
                print(f"[SERVER] {line.strip()}")
                
    def start_file_watcher(self):
        """Start watching for file changes."""
        event_handler = ChangeHandler(self.restart_server)
        self.observer = Observer()
        
        # Watch the current directory and src directory
        watch_paths = [
            ".",
            "src"
        ]
        
        for path in watch_paths:
            if os.path.exists(path):
                self.observer.schedule(event_handler, path, recursive=True)
                print(f"👁️  Watching: {os.path.abspath(path)}")
        
        self.observer.start()
        
    def restart_server(self):
        """Restart the server."""
        self.stop_server()
        time.sleep(1)
        self.start_server()
        
    def run(self):
        """Run the development server with auto-reload."""
        self.running = True
        
        # Handle Ctrl+C gracefully
        def signal_handler(sig, frame):
            print("\n🛑 Shutting down development server...")
            self.running = False
            self.stop_server()
            if self.observer:
                self.observer.stop()
                self.observer.join()
            sys.exit(0)
            
        signal.signal(signal.SIGINT, signal_handler)
        
        try:
            print("🎬 SD1 Film Production AI Development Server")
            print("=" * 50)
            
            # Start the server
            self.start_server()
            
            # Start file watching
            self.start_file_watcher()
            
            # Keep the main thread alive
            while self.running:
                time.sleep(1)
                
        except KeyboardInterrupt:
            signal_handler(None, None)
        except Exception as e:
            print(f"❌ Error: {e}")
        finally:
            self.stop_server()
            if self.observer:
                self.observer.stop()
                self.observer.join()

if __name__ == "__main__":
    # Check if watchdog is installed
    try:
        import watchdog
    except ImportError:
        print("📦 Installing watchdog for file monitoring...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "watchdog"])
        import watchdog
    
    # Change to the script directory
    os.chdir(Path(__file__).parent)
    
    # Start the development server
    dev_server = DevServer()
    dev_server.run()