#!/usr/bin/env bash
# Manual GitHub repo creation guide
# Run from project root after git init and first commit
set -euo pipefail

REPO_NAME="ai-website-roaster"

echo "=== Create GitHub Repository ==="
echo ""
echo "Since gh CLI is not installed, follow these manual steps:"
echo ""
echo "1. Go to https://github.com/new"
echo "2. Repository name: ${REPO_NAME}"
echo "3. Description: AI-powered website roaster - paste a URL, get brutally honest feedback"
echo "4. Set visibility (Public or Private)"
echo "5. Do NOT initialize with README, .gitignore, or license"
echo "6. Click 'Create repository'"
echo ""
echo "Then run these commands (replace YOUR_USERNAME):"
echo ""
echo "  git remote add origin https://github.com/YOUR_USERNAME/${REPO_NAME}.git"
echo "  git branch -M main"
echo "  git push -u origin main"
echo ""
echo "After pushing, add your secrets:"
echo "  Go to Settings > Secrets and variables > Actions > New repository secret"
echo "  Add: OPENAI_API_KEY = your-key-here"
echo ""
echo "To install gh CLI for future use:"
echo "  winget install --id GitHub.cli"
echo ""
