#!/bin/bash

# SD1 Film Production AI System - Development Server Startup Script

echo "🎬 SD1 Film Production AI System"
echo "================================="
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed or not in PATH"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "api.py" ]; then
    echo "❌ api.py not found. Please run this script from the sd1 directory."
    exit 1
fi

# Install watchdog if not available
echo "📦 Checking dependencies..."
python3 -c "import watchdog" 2>/dev/null || {
    echo "Installing watchdog for file monitoring..."
    pip install watchdog
}

# Check environment variables
echo "🔍 Checking environment configuration..."
if [ -z "$GOOGLE_API_KEY" ]; then
    echo "⚠️  Warning: GOOGLE_API_KEY not set"
else
    echo "✅ Google API Key configured"
fi

if [ -z "$REPLICATE_API_TOKEN" ]; then
    echo "⚠️  Warning: REPLICATE_API_TOKEN not set (Storyboard generation will be disabled)"
else
    echo "✅ Replicate API Token configured"
fi

echo ""
echo "🚀 Starting development server with auto-reload..."
echo "📡 Server will be available at: http://localhost:8000"
echo "📋 API documentation: http://localhost:8000/docs"
echo "🔄 Auto-reload enabled - server will restart when files change"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the development server
python3 dev_server.py