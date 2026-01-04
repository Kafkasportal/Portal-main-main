# 🔒 Security Guide for Kafkasder Management Panel

This guide covers security best practices, environment variable management, and compliance standards for the Kafkasder Management Panel project.

---

## 📋 Table of Contents
1. [Environment Variables](#environment-variables)
2. [Security Actions Taken](#security-actions-taken)
3. [Input Validation](#input-validation)
4. [CSRF Protection](#csrf-protection)
5. [Security Headers](#security-headers)
6. [Secret Management](#secret-management)
7. [Authentication & Authorization](#authentication--authorization)
8. [Row Level Security (RLS)](#row-level-security-rls)
9. [Incident Response](#incident-response)
10. [Best Practices](#best-practices)

---

## 🔒 Environment Variables

### Required Environment Variables

This project uses sensitive credentials that **MUST NEVER** be committed to the repository.

#### Production Environment Variables (Render/GitHub Actions)

```bash
# Supabase Credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# API Keys  
RENDER_API_KEY=your-render-api-key-here
GITHUB_TOKEN=your-github-token-here

# Sentry Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://your-key@sentry.io/project
SENTRY_ORG=your-organization-slug
SENTRY_PROJECT=your-project-slug
SENTRY_AUTH_TOKEN=your-sentry-token-here
```

#### Local Development (.env.local)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_USE_MOCK_API=true  # Optional
```

### 🔑 How to Get Your Keys

#### Supabase Keys
1. Visit https://supabase.com/dashboard/project/your-project-id/settings/api
2. Copy `anon` key → Set as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Copy `service_role` key → Set as `SUPABASE_SERVICE_ROLE_KEY` (NEVER expose in client-side)

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
1. Visit https://sentry.io/settings/auth-tokens/
2. Create new token with `project:releases` and `project:write` scope
3. Copy → Set as `SENTRY_AUTH_TOKEN`

---

## 🚨 Security Actions Taken

### ✅ Hardcoded Secrets Removed

All hardcoded secrets have been removed from:
- ✅ `render.yaml` - All JWT tokens and API keys removed
- ✅ `scripts/one-command-migrate.sh` - Supabase anon key removed
- ✅ `scripts/passwordless-migrate.js` - Service role key removed
- ✅ `scripts/supabase-api-migrate.js` - Service role key removed

### ✅ Security Features Implemented

- **SQL Injection Protection**: Prepared statements, parameterized queries
- **Row Level Security (RLS)**: All tables protected with RLS policies
- **CSRF Protection**: Token-based CSRF validation
- **XSS Protection**: React's built-in XSS protection + CSP headers
- **Input Validation**: Zod schemas on all form inputs
- **Secret Scanning**: SonarCloud integration for secret detection

---

## 🛡️ Input Validation

### Zod Schemas

All user inputs are validated using Zod schemas in `src/lib/validators.ts`:

```typescript
// Example: Member validation
const memberSchema = z.object({
  tcKimlikNo: z.string().length(11).regex(/^\d+$/),
  email: z.string().email(),
  telefon: z.string().regex(/^5\d{9}$/),
  ad: z.string().min(2).max(100),
  soyad: z.string().min(2).max(100),
})

// Validate on both client and server
const result = memberSchema.safeParse(formData)
if (!result.success) {
  // Handle validation errors
}
```

### Validation Layers

1. **Client-side**: Immediate feedback using Zod + React Hook Form
2. **API-level**: Server-side validation in API routes
3. **Database**: Column constraints, CHECK constraints, triggers

---

## 🛡️ CSRF Protection

### Implementation

CSRF (Cross-Site Request Forgery) protection is implemented using token-based validation:

```typescript
// src/lib/csrf/index.ts
export async function generateCSRFToken(): Promise<string> {
  const token = crypto.randomUUID()
  await setCSRFToken(token)
  return token
}

export async function validateCSRFToken(token: string): Promise<boolean> {
  const storedToken = await getCSRFToken()
  return storedToken === token
}
```

### Usage in Forms

```typescript
// In form component
const { data: csrfToken } = await fetch('/api/csrf').then(r => r.json())

// Form submission must include CSRF token
const response = await fetch('/api/some-endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify(formData)
})
```

---

## 🔐 Security Headers

### Next.js Middleware Headers

```typescript
// middleware.ts
const response = NextResponse.next()

response.headers.set('X-Frame-Options', 'DENY')
response.headers.set('X-Content-Type-Options', 'nosniff')
response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
response.headers.set('X-XSS-Protection', '1; mode=block')

// Content Security Policy
response.headers.set('Content-Security-Policy', 
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +  // Required for Next.js
  "style-src 'self' 'unsafe-inline'; " +
  "img-src 'self' data: https:; " +
  "font-src 'self'; " +
  "connect-src 'self' https://*.supabase.co https://*.sentry.io;"
)
```

### CSP Policy Details

| Directive | Value | Purpose |
|-----------|--------|---------|
| `default-src` | `'self'` | Only allow resources from same origin |
| `script-src` | `'self' 'unsafe-inline' 'unsafe-eval'` | JavaScript (Next.js requires unsafe) |
| `style-src` | `'self' 'unsafe-inline'` | CSS (Tailwind requires unsafe-inline) |
| `connect-src` | `'self' https://*.supabase.co https://*.sentry.io` | API calls |
| `img-src` | `'self' data: https:` | Images |

---

## 🔑 Secret Management

### Best Practices

1. **Never Commit Secrets**: Always use environment variables
2. **Use .env.local**: Keep local secrets out of version control
3. **Rotate Regularly**: Every 90 days for critical secrets
4. **Minimum Permissions**: Grant only required scopes
5. **Audit Access**: Regularly review who has access to secrets

### GitHub Secrets Management

For CI/CD, use GitHub Secrets:

```bash
# Settings > Secrets and variables > Actions
# Add secrets:
- SUPABASE_SERVICE_ROLE_KEY
- SENTRY_AUTH_TOKEN
- RENDER_API_KEY
```

### Environment Variable Priority

1. Production: Render dashboard environment variables
2. Development: `.env.local` (never commit)
3. Fallback: `.env.example` (safe defaults)

---

## 🔐 Authentication & Authorization

### Supabase Auth

Authentication is handled by Supabase Auth:

```typescript
// Server-side auth check
const supabase = createServerClient()
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  return redirect('/giris')
}

// User has valid session, proceed
```

### Role-Based Access Control (RBAC)

User roles are defined in `src/types/rbac.ts`:

```typescript
export type UserRole = 'admin' | 'moderator' | 'muhasebe' | 'user'

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['all'],
  moderator: ['read', 'create', 'update'],
  muhasebe: ['read', 'create', 'update:donations'],
  user: ['read']
}
```

### Permission Checks

```typescript
function hasPermission(user: User, action: string): boolean {
  return ROLE_PERMISSIONS[user.role].includes('all') ||
         ROLE_PERMISSIONS[user.role].includes(action)
}
```

---

## 🛡️ Row Level Security (RLS)

### RLS Policies

All database tables have Row Level Security enabled:

```sql
-- Example: Members table RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Admin can see all rows
CREATE POLICY "Admins can see all members"
ON members
FOR ALL
TO authenticated
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- Users can only see rows they created or are assigned to
CREATE POLICY "Users can see own members"
ON members
FOR SELECT
TO authenticated
USING (
  created_by = auth.uid() OR
  assigned_to = auth.uid()
);
```

### Function Security

SQL functions use `SECURITY DEFINER` with proper checks:

```sql
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  -- Only authenticated users can access
  IF NOT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid()
  ) THEN
    RETURN NULL;
  END IF;

  -- Business logic
  SELECT json_build_object(...) INTO result;
  RETURN result;
END;
$$;
```

---

## 🚨 Incident Response

### Security Incident Checklist

If a security breach is suspected:

#### Immediate Actions (0-1 hours)
- [ ] **Identify scope**: Determine what was exposed
- [ ] **Contain breach**: Rotate exposed credentials immediately
- [ ] **Notify stakeholders**: Alert team and affected users
- [ ] **Enable additional monitoring**: Set up alerts

#### Investigation (1-24 hours)
- [ ] **Review access logs**: Check authentication logs
- [ ] **Analyze impact**: Determine data affected
- [ ] **Document timeline**: Create incident timeline
- [ ] **Identify root cause**: Find vulnerability exploited

#### Remediation (24-72 hours)
- [ ] **Patch vulnerabilities**: Fix security issues
- [ ] **Update secrets**: Generate new keys
- [ ] **Test fixes**: Verify vulnerabilities are resolved
- [ ] **Monitor for recurrence**: Watch for repeat attacks

#### Post-Incident (72+ hours)
- [ ] **Post-mortem**: Document lessons learned
- [ ] **Update policies**: Improve security practices
- [ ] **Communicate**: Share findings with stakeholders

---

## 📊 Security Compliance

### SonarCloud Security Standards

Automated security scanning via SonarCloud:

- ✅ **Secret Detection**: API keys, tokens, passwords
- ✅ **SQL Injection**: SQL query analysis
- ✅ **XSS Vulnerabilities**: Cross-site scripting checks
- ✅ **Dependency Scanning**: Vulnerable package detection
- ✅ **Code Quality Gates**: Automated PR enforcement

### OWASP Top 10 Coverage

| Risk | Status | Mitigation |
|-------|---------|------------|
| **Injection** | ✅ Protected | Prepared statements, Zod validation |
| **Broken Auth** | ✅ Protected | Supabase Auth, RLS |
| **XSS** | ✅ Protected | React XSS protection, CSP headers |
| **CSRF** | ✅ Protected | Token-based CSRF validation |
| **Security Misconfiguration** | ✅ Protected | Environment variables, proper CORS |
| **Sensitive Data Exposure** | ✅ Protected | RLS, no secrets in code |
| **Access Control** | ✅ Protected | RBAC, RLS policies |
| **Security Logging** | ✅ Protected | Sentry error tracking |
| **SSRF** | ✅ Protected | Supabase client, allowlisted URLs |
| **Dependencies** | ✅ Protected | npm audit, Dependabot |

---

## 📞 Security Contacts

- **Security Team**: security@kafkasder.org
- **GitHub Security**: https://github.com/Kafkasportal/Portal-main/security
- **Supabase Support**: https://supabase.com/support
- **Sentry Support**: https://sentry.io/support

---

## 🔐 Best Practices

### Development

1. **Never hardcode secrets**: Use environment variables
2. **Validate all inputs**: Use Zod schemas
3. **Use prepared statements**: Prevent SQL injection
4. **Sanitize output**: Prevent XSS attacks
5. **Implement RBAC**: Check permissions on sensitive actions

### Deployment

1. **Use HTTPS**: Enforce SSL/TLS
2. **Secure headers**: CSP, XSS protection, frame options
3. **Secret rotation**: Regularly update credentials
4. **Audit logs**: Monitor for suspicious activity
5. **Backup security**: Encrypt backups, limit access

### Maintenance

1. **Update dependencies**: Run `npm audit` regularly
2. **Review RLS policies**: Ensure least privilege
3. **Monitor Sentry**: Watch for security-related errors
4. **Test security**: Run penetration testing
5. **Document changes**: Keep security docs updated

---

**Last Updated**: January 4, 2026  
**Version**: 1.0.0  
**Maintained By**: KafkasDer Security Team 🔒

