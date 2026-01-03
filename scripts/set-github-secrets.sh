#!/bin/bash

# =============================================================================
# GitHub Secrets Setup Script
# =============================================================================
# Bu script, GitHub secrets'ı güvenli şekilde ayarlar
# =============================================================================

set -e

echo "🔐 GitHub Secrets Setup Starting..."

# Environment Variables (GitHub Actions will automatically mask these)
echo "Setting up environment variables..."

# Supabase Configuration
echo "⚙️ Setting Supabase secrets..."
# Note: These should be set in GitHub repository settings, not hardcoded
echo "→ NEXT_PUBLIC_SUPABASE_ANON_KEY: [SET_IN_GITHUB_SECRETS]"
echo "→ SUPABASE_SERVICE_ROLE_KEY: [SET_IN_GITHUB_SECRETS]"
echo "→ NEXT_PUBLIC_SUPABASE_URL: https://idsiiayyvygcgegmqcov.supabase.co"

# Sentry Configuration
echo "📡 Setting Sentry secrets..."
echo "→ NEXT_PUBLIC_SENTRY_DSN: [SET_IN_GITHUB_SECRETS]"
echo "→ SENTRY_ORG: kafkasder-oc"
echo "→ SENTRY_PROJECT: javascript-nextjs"
echo "→ SENTRY_AUTH_TOKEN: [SET_IN_GITHUB_SECRETS]"

# Render Configuration
echo "🚀 Setting Render secrets..."
echo "→ RENDER_API_KEY: [SET_IN_GITHUB_SECRETS]"

# GitHub Token (for repository access)
echo "🔑 Setting GitHub token..."
echo "→ GITHUB_TOKEN: [SET_IN_GITHUB_SECRETS]"

# MCP Configuration
echo "🧠 Setting MCP secrets..."
echo "→ STORMMCP_URL: https://stormmcp.ai/gateway/7e6981d1-22cc-42a2-af7f-2b9f7f55bb7e/mcp"
echo "→ STORMMCP_API_KEY: [SET_IN_GITHUB_SECRETS]"

echo ""
echo "✅ GitHub secrets setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to repository Settings → Secrets and variables → Actions"
echo "2. Add the following secrets:"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - SUPABASE_SERVICE_ROLE_KEY" 
echo "   - NEXT_PUBLIC_SENTRY_DSN"
echo "   - SENTRY_ORG"
echo "   - SENTRY_PROJECT"
echo "   - SENTRY_AUTH_TOKEN"
echo "   - RENDER_API_KEY"
echo "   - GITHUB_TOKEN"
echo "   - STORMMCP_URL"
echo "   - STORMMCP_API_KEY"
echo "3. Delete this script after setting secrets"
echo ""
echo "⚠️  SECURITY REMINDER:"
echo "   - Never commit secrets to version control"
echo "   - Use GitHub Secrets for all sensitive data"
echo "   - Rotate keys regularly (every 90 days)"
echo "   - Monitor access logs"
