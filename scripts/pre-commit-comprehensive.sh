#!/bin/bash

# Comprehensive Pre-Commit Script
# This script runs all tests, linting, and validation before allowing commits

set -e  # Exit on any error

echo "🔍 Comprehensive Pre-Commit Validation"
echo "======================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${2}${1}${NC}"
}

# Function to run command with status
run_with_status() {
    local cmd="$1"
    local description="$2"

    print_status "🔄 $description..." "$BLUE"

    if eval "$cmd"; then
        print_status "✅ $description passed" "$GREEN"
    else
        print_status "❌ $description failed" "$RED"
        echo "Command that failed: $cmd"
        exit 1
    fi
}

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    print_status "❌ Not in a git repository" "$RED"
    exit 1
fi

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only)
if [ -z "$STAGED_FILES" ]; then
    print_status "⚠️  No staged files found" "$YELLOW"
    exit 0
fi

print_status "📋 Staged files:" "$BLUE"
echo "$STAGED_FILES" | sed 's/^/  /'

# Check if Node.js dependencies are installed
if [ ! -d "node_modules" ]; then
    print_status "📦 Installing dependencies..." "$BLUE"
    npm ci
fi

# 1. Code Formatting
run_with_status "npm run format:check" "Code formatting check"

# 2. Linting
run_with_status "npm run lint" "ESLint"

# 3. Type Checking
run_with_status "npm run type-check" "TypeScript type checking"

# 4. Content Validation
run_with_status "npm run validate:content" "Content validation (authors & frontmatter)"

# 5. Security Audit
run_with_status "npm run security:audit" "Security audit"

# 6. Unit Tests
print_status "🧪 Running unit tests..." "$BLUE"
if npm run test -- --reporter=verbose --bail=1; then
    print_status "✅ Unit tests passed" "$GREEN"
else
    print_status "❌ Unit tests failed" "$RED"
    print_status "💡 Tip: Run 'npm run test:ui' to debug failing tests" "$YELLOW"
    exit 1
fi

# 7. Build Test
print_status "🔨 Testing build process..." "$BLUE"
if npm run build; then
    print_status "✅ Build process successful" "$GREEN"
else
    print_status "❌ Build process failed" "$RED"
    exit 1
fi

# 8. E2E Tests (only if E2E related files are changed)
E2E_FILES=$(echo "$STAGED_FILES" | grep -E "(playwright|e2e|\.spec\.ts|\.test\.ts)" || true)
if [ -n "$E2E_FILES" ] || echo "$STAGED_FILES" | grep -q "playwright.config.ts"; then
    print_status "🎭 Running E2E tests (E2E related changes detected)..." "$BLUE"

    # Ensure Playwright browsers are installed
    if ! npx playwright install --with-deps >/dev/null 2>&1; then
        print_status "⚠️  Installing Playwright browsers..." "$YELLOW"
        npx playwright install --with-deps
    fi

    if npm run test:e2e:ci -- --reporter=line; then
        print_status "✅ E2E tests passed" "$GREEN"
    else
        print_status "❌ E2E tests failed" "$RED"
        print_status "💡 Tip: Run 'npm run test:e2e:ui' to debug failing tests" "$YELLOW"
        exit 1
    fi
else
    print_status "⏭️  Skipping E2E tests (no E2E related changes)" "$YELLOW"
fi

# 9. Hugo Build Test (if content changes)
CONTENT_FILES=$(echo "$STAGED_FILES" | grep -E "(content/|layouts/|hugo\.toml)" || true)
if [ -n "$CONTENT_FILES" ]; then
    print_status "🦄 Testing Hugo build..." "$BLUE"

    if command -v hugo >/dev/null 2>&1; then
        if hugo --minify --destination=public-test; then
            print_status "✅ Hugo build successful" "$GREEN"
            rm -rf public-test
        else
            print_status "❌ Hugo build failed" "$RED"
            exit 1
        fi
    else
        print_status "⚠️  Hugo not installed, skipping Hugo build test" "$YELLOW"
    fi
else
    print_status "⏭️  Skipping Hugo build test (no content changes)" "$YELLOW"
fi

# 10. Final Validation
print_status "🔍 Running final validation..." "$BLUE"
if npm run validate:all; then
    print_status "✅ Final validation passed" "$GREEN"
else
    print_status "❌ Final validation failed" "$RED"
    exit 1
fi

# Success message
echo ""
print_status "🎉 All pre-commit checks passed!" "$GREEN"
print_status "🚢 Ready to commit and push!" "$BLUE"

# Optional: Show summary
echo ""
print_status "📊 Summary:" "$BLUE"
echo "  ✅ Code formatting"
echo "  ✅ Linting (ESLint)"
echo "  ✅ Type checking (TypeScript)"
echo "  ✅ Content validation"
echo "  ✅ Security audit"
echo "  ✅ Unit tests"
echo "  ✅ Build process"
if [ -n "$E2E_FILES" ]; then
    echo "  ✅ E2E tests"
fi
if [ -n "$CONTENT_FILES" ]; then
    echo "  ✅ Hugo build"
fi
echo "  ✅ Final validation"
echo ""
