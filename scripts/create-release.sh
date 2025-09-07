#!/bin/bash

# Script to create a new release with automatic version bumping and release notes
# Usage: ./scripts/create-release.sh [patch|minor|major] [message]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository!"
    exit 1
fi

# Check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    print_error "Working directory is not clean. Please commit or stash changes first."
    exit 1
fi

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "0.0.0")
print_info "Current version: $CURRENT_VERSION"

# Parse version components
IFS='.' read -r major minor patch <<< "$CURRENT_VERSION"

# Default to patch if no argument provided
VERSION_TYPE=${1:-patch}
RELEASE_MESSAGE=${2:-""}

# Calculate new version
case $VERSION_TYPE in
    major)
        NEW_VERSION="$((major + 1)).0.0"
        ;;
    minor)
        NEW_VERSION="$major.$((minor + 1)).0"
        ;;
    patch)
        NEW_VERSION="$major.$minor.$((patch + 1))"
        ;;
    *)
        # Check if it's a custom version
        if [[ $VERSION_TYPE =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            NEW_VERSION=$VERSION_TYPE
        else
            print_error "Invalid version type: $VERSION_TYPE"
            print_info "Usage: $0 [patch|minor|major|x.y.z] [message]"
            exit 1
        fi
        ;;
esac

print_info "New version: $NEW_VERSION"

# Confirm release
print_warning "About to create release v$NEW_VERSION"
if [ -z "$RELEASE_MESSAGE" ]; then
    read -p "Enter release message (or press Enter for default): " RELEASE_MESSAGE
fi

if [ -z "$RELEASE_MESSAGE" ]; then
    RELEASE_MESSAGE="Release v$NEW_VERSION"
fi

read -p "Continue? [y/N] " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Release cancelled."
    exit 0
fi

# Update package.json version
print_info "Updating package.json version to $NEW_VERSION..."
if command -v node >/dev/null 2>&1; then
    # Use Node.js to update package.json
    node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        pkg.version = '$NEW_VERSION';
        fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
    "
    print_success "Updated package.json version to $NEW_VERSION"
else
    print_warning "Node.js not found, skipping package.json version update"
fi

# Create release commit
print_info "Creating release commit..."
git add package.json 2>/dev/null || true
git commit -m "$RELEASE_MESSAGE" --allow-empty

# Create and push tag
TAG_NAME="v$NEW_VERSION"
print_info "Creating tag $TAG_NAME..."
git tag -a "$TAG_NAME" -m "$RELEASE_MESSAGE"

print_info "Pushing changes and tag..."
git push origin main
git push origin "$TAG_NAME"

print_success "Release $TAG_NAME created successfully!"
print_info "GitHub Actions will now:"
print_info "  1. Create a GitHub release with auto-generated notes"
print_info "  2. Generate enhanced release notes"
print_info "  3. Update the release with project stats and links"

print_info "🔗 View the release at: https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/releases/tag/$TAG_NAME"

# Wait a moment and check if the release was created
print_info "Waiting for GitHub Actions to process the release..."
sleep 5

echo
print_success "🎉 Release process completed!"
print_info "Monitor the release workflow at: https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/actions"