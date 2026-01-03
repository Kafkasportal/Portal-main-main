# Security Guide

## 🔒 Environment Variables

This project uses sensitive credentials that **MUST NEVER** be committed to the repository.

### Required Environment Variables

Add these to your Render Dashboard (Settings → Environment):

```bash
# Supabase Credentials
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# API Keys  
RENDER_API_KEY=your-render-api-key-here
GITHUB_TOKEN=your-github-token-here
SENTRY_AUTH_TOKEN=your-sentry-token-here
```

### 🚨 Security Actions Taken

All hardcoded secrets have been removed from:
- ✅ `render.yaml` - All JWT tokens and API keys removed
- ✅ `scripts/one-command-migrate.sh` - Supabase anon key removed
- ✅ `scripts/passwordless-migrate.js` - Service role key removed
- ✅ `scripts/supabase-api-migrate.js` - Service role key removed

### 🔑 How to Get Your Keys

#### Supabase Keys
1. Visit https://supabase.com/dashboard/project/idsiiayyvygcgegmqcov/settings/api
2. Copy `anon` key → Set as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Copy `service_role` key → Set as `SUPABASE_SERVICE_ROLE_KEY`

#### Render API Key
1. Visit https://dashboard.render.com/u/settings
2. Click "API Keys" → "Create API Key"
3. Copy → Set as `RENDER_API_KEY`

#### GitHub Token
1. Visit https://github.com/settings/tokens
2. Create new Personal Access Token (classic)
3. Required scopes: `repo`, `workflow`
4. Copy → Set as `GITHUB_TOKEN`

#### Sentry Auth Token
1. Visit https://kafkasder-oc.sentry.io/settings/auth-tokens/
2. Create new token with `project:write` scope
3. Copy → Set as `SENTRY_AUTH_TOKEN`

### ⚠️ Exposed Tokens - Action Required

**CRITICAL:** The following tokens were previously exposed in the codebase and MUST be revoked:

1. **Supabase Anon Key** (ending in ...shZQ)
   - Revoke at: https://supabase.com/dashboard/project/idsiiayyvygcgegmqcov/settings/api
   - Generate new key
   
2. **Supabase Service Role Key** (ending in ...SZ4)
   - Revoke at: https://supabase.com/dashboard/project/idsiiayyvygcgegmqcov/settings/api  
   - Generate new key

3. **Render API Key** (rnd_JWyvNZTTdcB00iGHghVUxWbESLZc)
   - Revoke at: https://dashboard.render.com/u/settings
   - Generate new key

4. **GitHub Token** (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)
   - Revoke at: https://github.com/settings/tokens
   - Generate new token

### 📝 Local Development

Create a `.env.local` file (never commit this):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://idsiiayyvygcgegmqcov.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-new-service-role-key
```

### 🔐 Best Practices

1. **Never commit secrets** - Always use environment variables
2. **Rotate tokens regularly** - Especially after exposure
3. **Use .env.local** - Keep local secrets out of git
4. **Minimum permissions** - Only grant required scopes
5. **Monitor access** - Check Supabase/GitHub/Render logs regularly

## 📊 SonarQube Security Compliance

This document addresses the following SonarQube vulnerabilities:
- ✅ JWT tokens in render.yaml (Fixed)
- ✅ Service Role Key exposure (Fixed)
- ✅ GitHub token in config (Fixed)
- ✅ Render API key exposure (Fixed)
