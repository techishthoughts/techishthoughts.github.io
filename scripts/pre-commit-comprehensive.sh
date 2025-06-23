#!/bin/bash

# Comprehensive Pre-Commit Validation Script
# This script runs all quality checks that would normally run in CI
# Use this for thorough validation before pushing to ensure CI will pass

set -e

echo "🚀 Starting comprehensive pre-commit validation..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Security Audit
print_status "🔒 Running security audit..."
if npm audit --audit-level moderate; then
    print_success "Security audit passed"
else
    print_error "Security audit failed - please fix vulnerabilities"
    exit 1
fi

# 2. Lint-staged (formatting and linting)
print_status "🎨 Running lint-staged (formatting & linting)..."
if npx lint-staged; then
    print_success "Lint-staged passed"
else
    print_error "Lint-staged failed - please fix formatting/linting issues"
    exit 1
fi

# 3. TypeScript compilation
print_status "🔍 Checking TypeScript compilation..."
if npm run type-check; then
    print_success "TypeScript compilation passed"
else
    print_error "TypeScript compilation failed - please fix type errors"
    exit 1
fi

# 4. Content validation
print_status "📝 Validating content (authors & frontmatter)..."
if npm run validate:content; then
    print_success "Content validation passed"
else
    print_error "Content validation failed - please fix content issues"
    exit 1
fi

# 5. Unit tests
print_status "🧪 Running unit tests..."
if npm run test:unit; then
    print_success "Unit tests passed"
else
    print_error "Unit tests failed - please fix failing tests"
    exit 1
fi

# 6. Build test (ensure everything builds)
print_status "🏗️ Testing build process..."
if npm run build; then
    print_success "Build test passed"
else
    print_error "Build test failed - please fix build issues"
    exit 1
fi

# 7. Additional markdown validation
print_status "📄 Validating markdown files..."
markdown_errors=0

if [ -d "content/posts" ]; then
    while IFS= read -r -d '' file; do
        if ! grep -q "^---" "$file"; then
            print_warning "Missing front matter in $file"
            ((markdown_errors++))
        fi

        if ! grep -q "^title:" "$file"; then
            print_warning "Missing title in $file"
            ((markdown_errors++))
        fi

        if ! grep -q "^date:" "$file"; then
            print_warning "Missing date in $file"
            ((markdown_errors++))
        fi
    done < <(find content/posts -name "*.md" -type f -print0)
fi

if [ $markdown_errors -eq 0 ]; then
    print_success "Markdown validation passed"
else
    print_warning "Found $markdown_errors markdown issues (warnings only)"
fi

# 8. Clean up build artifacts
print_status "🧹 Cleaning up build artifacts..."
npm run clean > /dev/null 2>&1 || true
print_success "Cleanup completed"

echo ""
echo "================================================"
print_success "🎉 All comprehensive pre-commit checks passed!"
print_status "Your code is ready for CI/CD pipeline"
echo "================================================"
