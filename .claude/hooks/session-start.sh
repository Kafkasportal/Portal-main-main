#!/bin/bash
set -euo pipefail

# Only run in Claude Code on the web (remote environments)
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo "🚀 Installing dependencies for KafkasDer Yönetim Paneli..."

# Install npm dependencies
# Using 'npm install' instead of 'npm ci' to leverage container caching
# Using --legacy-peer-deps to handle React 19 / testing-library React 18 peer dependency mismatch
npm install --legacy-peer-deps

echo "✅ Dependencies installed successfully!"
echo "📦 Ready for testing and linting"
