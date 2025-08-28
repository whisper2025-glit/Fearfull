#!/bin/bash

# Adventure Story MCP Server Build Script
set -e

echo "🚀 Building Adventure Story MCP Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Navigate to MCP server directory
cd "$(dirname "$0")"

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building TypeScript..."
npm run build

echo "📝 Creating data directory..."
mkdir -p data

echo "✅ Build completed successfully!"
echo ""
echo "📋 Next steps:"
echo "  1. Configure environment variables (optional): cp .env.example .env"
echo "  2. Start development server: npm run dev"
echo "  3. Or start production server: npm start"
echo ""
echo "🔧 To integrate with your MCP client, add this configuration:"
echo "  \"adventure-story\": {"
echo "    \"command\": \"node\","
echo "    \"args\": [\"$(pwd)/dist/index.js\"]"
echo "  }"
