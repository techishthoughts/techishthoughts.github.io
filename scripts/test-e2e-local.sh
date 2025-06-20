#!/bin/bash

# Local E2E Test Script
# This script helps run E2E tests locally with proper setup

set -e

echo "🎭 Local E2E Test Runner"
echo "========================"

# Check if Hugo is installed
if ! command -v hugo &> /dev/null; then
    echo "❌ Hugo is not installed"
    echo "Please install Hugo from https://gohugo.io/installation/"
    echo ""
    echo "On macOS with Homebrew:"
    echo "  brew install hugo"
    echo ""
    echo "On Linux:"
    echo "  snap install hugo --channel=extended"
    echo ""
    exit 1
fi

echo "✅ Hugo version: $(hugo version)"

# Check if Node.js dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm ci
fi

echo "🔨 Building React components..."
npm run build

echo "🎭 Installing Playwright browsers if needed..."
npx playwright install --with-deps chromium

echo "🚀 Running E2E tests..."
echo "Note: Playwright will automatically start Hugo server on port 1313"
npm run test:e2e

echo "✅ E2E tests completed successfully!"
