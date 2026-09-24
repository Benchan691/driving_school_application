#!/bin/bash

# Quick update script - pulls latest from current branch
# Run this after Xcode command line tools are installed

set -e

cd "$(dirname "$0")"

CURRENT_BRANCH=$(git branch --show-current)
echo "🔄 Updating from origin/$CURRENT_BRANCH..."

git fetch origin
git pull origin "$CURRENT_BRANCH"

echo "✅ Update complete!"

