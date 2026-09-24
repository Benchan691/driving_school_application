#!/bin/bash

# Script to update local code from GitHub
# Run this after Xcode command line tools are installed

set -e

echo "🔄 Updating code from GitHub..."
echo ""

# Navigate to project directory
cd "$(dirname "$0")"

# Check git status
echo "📊 Current status:"
git status --short
echo ""

# Fetch latest changes
echo "⬇️  Fetching latest changes from GitHub..."
git fetch origin

# Show what branches are available
echo ""
echo "📋 Available branches:"
git branch -r

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo ""
echo "📍 Current branch: $CURRENT_BRANCH"

# Ask user which branch to pull (default: current branch)
read -p "Which branch to pull? [default: $CURRENT_BRANCH]: " BRANCH
BRANCH=${BRANCH:-$CURRENT_BRANCH}

# Pull latest changes
echo ""
echo "⬇️  Pulling latest changes from origin/$BRANCH..."
git pull origin "$BRANCH"

echo ""
echo "✅ Update complete!"
echo ""
echo "📊 Updated files:"
git log --oneline -10

