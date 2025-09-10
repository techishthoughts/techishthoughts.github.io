#!/bin/bash

# Script to merge all open Dependabot PRs
# Run this script to merge all dependency update PRs

set -e

echo "🤖 Merging Dependabot PRs..."
echo "================================"

# Get all open Dependabot PRs
PRS=$(gh pr list --author "app/dependabot" --state open --json number --jq '.[].number')

if [ -z "$PRS" ]; then
    echo "✅ No open Dependabot PRs found"
    exit 0
fi

echo "Found the following Dependabot PRs to merge:"
for pr in $PRS; do
    title=$(gh pr view $pr --json title --jq '.title')
    echo "  #$pr - $title"
done

echo ""
read -p "Do you want to merge all these PRs? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Merge cancelled"
    exit 0
fi

# Merge each PR
for pr in $PRS; do
    echo ""
    echo "🔀 Processing PR #$pr..."

    # Check if PR is mergeable
    mergeable=$(gh pr view $pr --json mergeable --jq '.mergeable')
    state=$(gh pr view $pr --json state --jq '.state')

    if [ "$state" != "OPEN" ]; then
        echo "⚠️  PR #$pr is not open (state: $state), skipping..."
        continue
    fi

    if [ "$mergeable" != "MERGEABLE" ]; then
        echo "⚠️  PR #$pr is not mergeable (status: $mergeable), skipping..."
        continue
    fi

    # Try to merge the PR
    echo "✅ Merging PR #$pr..."
    if gh pr merge $pr --squash --delete-branch; then
        echo "✅ Successfully merged PR #$pr"
    else
        echo "❌ Failed to merge PR #$pr"
        echo "   You may need to merge this manually via the GitHub web interface"
    fi
done

echo ""
echo "🎉 Dependabot PR merge process completed!"
echo "Check your repository to verify all PRs were merged successfully."
