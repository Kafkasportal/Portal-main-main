# Secret Management Guide

## 🚨 Critical Security Alert

**IMMEDIATE ACTION REQUIRED**: All exposed tokens must be revoked immediately before proceeding with this guide.

## 🔐 Proper Secret Management

### 1. **Never Commit Secrets**
```bash
# ❌ NEVER DO THIS
const API_KEY = "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";

# ✅ ALWAYS DO THIS
const API_KEY = process.env.GITHUB_TOKEN;
```

### 2. **Environment Variables**
Use environment variables for all secrets:

```bash
# .env.local (NEVER COMMIT)
GITHUB_TOKEN=your-new-token-here
SUPABASE_SERVICE_ROLE_KEY=your-new-key-here
RENDER_API_KEY=your-new-key-here
```

### 3. **GitHub Secrets**
Store secrets in GitHub repository settings:

1. Go to repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add secret with descriptive name
4. Reference in workflows: `${{ secrets.SECRET_NAME }}`

### 4. **Secret Vault Solutions**

#### Recommended Solutions:
- **GitHub Secrets** (Free, integrated)
- **AWS Secrets Manager** (Enterprise)
- **Azure Key Vault** (Enterprise)
- **HashiCorp Vault** (Self-hosted)
- **1Password Secrets** (Team collaboration)

#### Implementation Example:
```yaml
# GitHub Secrets (Recommended)
- name: Deploy
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    SUPABASE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

## 🔄 Secret Rotation Process

### Monthly Rotation Checklist
- [ ] Review secret usage logs
- [ ] Generate new secrets
- [ ] Update all integrations
- [ ] Test with new secrets
- [ ] Revoke old secrets
- [ ] Update documentation

### Emergency Rotation (Security Incident)
1. **Immediate**: Revoke all exposed secrets
2. **Audit**: Check access logs for misuse
3. **Generate**: Create new secrets with stronger entropy
4. **Update**: Replace in all locations
5. **Monitor**: Watch for suspicious activity
6. **Document**: Record incident details

## 🛡️ Security Best Practices

### Development Environment
```bash
# Use .env.local for local development
cp .env.example .env.local
# Edit .env.local with real secrets
# Add .env.local to .gitignore
```

### Production Environment
```yaml
# Use GitHub Secrets in workflows
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  API_KEY: ${{ secrets.API_KEY }}
```

### Code Reviews
Check for secrets in:
- [ ] Configuration files
- [ ] Environment files
- [ ] Documentation
- [ ] Code comments
- [ ] Git history

## 🔍 Secret Detection Tools

### Automated Scanning
```bash
# GitGuardian (Recommended)
ggshield scan

# TruffleHog
trufflehog git https://github.com/repo

# Gitleaks
gitleaks detect --source . --verbose --report-format json
```

### Pre-commit Hooks
```bash
# .husky/pre-commit
#!/bin/sh
ggshield scan pre-commit
```

## 📋 Secret Types & Storage

| Secret Type | Storage Method | Rotation Frequency | Risk Level |
|-------------|----------------|-------------------|-------------|
| API Keys | GitHub Secrets | 90 days | High |
| Database Credentials | GitHub Secrets | 60 days | Critical |
| JWT Tokens | Environment Variables | 30 days | High |
| SSH Keys | SSH Agent | 180 days | Critical |
| Certificates | Secret Vault | 365 days | Critical |

## 🚨 Incident Response

### Step 1: Containment
1. Stop all affected services
2. Revoke exposed secrets immediately
3. Enable additional monitoring

### Step 2: Investigation
1. Review access logs
2. Identify unauthorized usage
3. Determine impact scope
4. Document timeline

### Step 3: Recovery
1. Generate new secrets
2. Update all integrations
3. Test functionality
4. Monitor for issues

### Step 4: Prevention
1. Implement secret scanning
2. Add pre-commit hooks
3. Train team on secret management
4. Regular security audits

## 📞 Support Resources

### Security Tools
- **GitGuardian**: https://www.gitguardian.com
- **TruffleHog**: https://github.com/trufflesecurity/trufflehog
- **Gitleaks**: https://github.com/zricethezav/gitleaks
- **GitHub Secret Scanning**: https://docs.github.com/code-security

### Incident Response
- **GitHub Security**: https://github.com/security
- **OWASP Cheat Sheet**: https://cheatsheetseries.owasp.org
- **CWE Database**: https://cwe.mitre.org

---

**Remember**: The cost of a security breach far exceeds the cost of proper secret management.
