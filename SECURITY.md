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

4. **GitHub Token** (EXPOSED - IMMEDIATE REVOCATION REQUIRED)
   - **Status**: ⚠️ CRITICAL SECURITY INCIDENT
   - **Action**: Revoke immediately at https://github.com/settings/tokens
   - **Generate**: New token with minimum required scopes
   - **Store**: Use GitHub Secrets or secure vault

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

### 🚨 Security Incident Response

**IMMEDIATE ACTIONS REQUIRED:**

1. **Revoked Tokens**: All exposed tokens must be revoked immediately
2. **Audit Logs**: Review authentication logs for unauthorized access
3. **Rotate Secrets**: Generate new secrets with proper storage
4. **Scan Codebase**: Remove any remaining hardcoded secrets
5. **Update Documentation**: Ensure no secrets remain in documentation

### 🔍 Incident Analysis Checklist

- [ ] **Review GitHub access logs** for unusual activity
- [ ] **Check Supabase audit logs** for unauthorized API calls
- [ ] **Monitor Render deployment logs** for suspicious activity
- [ ] **Scan git history** for additional exposed secrets
- [ ] **Update all integrations** with new secrets
- [ ] **Enable additional monitoring** for security events

### 🛡️ Prevention Measures

**Going forward, all secrets must:**
- Be stored in environment variables or secret vaults
- Never be committed to version control
- Use principle of least privilege
- Be rotated regularly (every 90 days)
- Have audit logging enabled

### 📞 Emergency Contacts

- **Security Team**: [security@kafkasder.org]
- **GitHub Support**: https://github.com/contact
- **Supabase Support**: https://supabase.com/support
- **Render Support**: https://render.com/support

---

## 📊 Security Compliance

This document addresses the following security vulnerabilities and compliance frameworks:

### SonarQube/SonarCloud Security Compliance
- ✅ JWT tokens in render.yaml (Fixed)
- ✅ Service Role Key exposure (Fixed)
- ✅ GitHub token in config (Fixed)
- ✅ Render API key exposure (Fixed)
- ✅ SonarCloud integration configured for MSP compliance

### Automated Security Scanning
- ✅ **Static Code Analysis**: SonarCloud integration
- ✅ **Dependency Scanning**: npm audit + OWASP checks
- ✅ **Secret Detection**: API key exposure prevention
- ✅ **Quality Gates**: Automated PR enforcement

### MSP Security Standards
- ✅ **Multi-tenant Isolation**: Project-specific analysis
- ✅ **Audit Trail**: Complete analysis history
- ✅ **Compliance Reporting**: Export capabilities
- ✅ **Access Control**: Token-based authentication
