# 🚀 Production Deployment Guide for Kafkasder Management Panel

Complete guide for deploying the Kafkasder Management Panel to production environment.

---

## 📋 Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Deployment Steps](#deployment-steps)
3. [Environment Configuration](#environment-configuration)
4. [User Management](#user-management)
5. [Backup Strategy](#backup-strategy)
6. [Monitoring & Logging](#monitoring--logging)
7. [Security Best Practices](#security-best-practices)
8. [Troubleshooting](#troubleshooting)
9. [Maintenance Schedule](#maintenance-schedule)

---

## ✅ Pre-Deployment Checklist

### Critical Requirements

- [ ] **1. Environment Variables**
  ```bash
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
  SENTRY_ORG=your_org_slug
  SENTRY_PROJECT=your_project_slug
  SENTRY_AUTH_TOKEN=your_auth_token
  ```

- [ ] **2. Database Migration**
  ```bash
  # Apply all migrations to Supabase
  # Run from Supabase Dashboard > SQL Editor
  # Or use: npm run db:migrate
  ```

- [ ] **3. Initial Admin User**
  ```sql
  -- Supabase Dashboard > SQL Editor
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    'auth_user_id_here',  -- From Supabase Auth
    'admin@kafkasder.org',
    'Admin Kullanıcı',
    'admin'
  );
  ```

- [ ] **4. Type Check**
  ```bash
  npm run type-check
  # Fix errors or use SKIP_TYPE_CHECK=true for first deployment
  ```

- [ ] **5. Test Suite**
  ```bash
  npm run test
  npm run test:e2e  # E2E tests
  ```

- [ ] **6. Build Test**
  ```bash
  npm run build
  # Must complete successfully
  ```

- [ ] **7. Sentry Configuration**
  ```bash
  # Verify Sentry DSN is valid
  # Test error tracking at /api/sentry-test
  ```

---

## 🚀 Deployment Steps

### Render.com Deployment

#### 1. Connect GitHub Repository

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Blueprint**
3. Connect repository: `https://github.com/Kafkasportal/Portal-main`
4. The `render.yaml` file will be auto-detected

#### 2. Configure Environment Variables

```bash
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_org_slug
SENTRY_PROJECT=your_project_slug
SENTRY_AUTH_TOKEN=your_auth_token
SKIP_TYPE_CHECK=true  # For first deployment only
```

#### 3. Build Settings

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

#### 4. Deploy

- Click **Create Web Service**
- First deploy starts automatically
- Wait for build and deployment to complete (5-10 minutes)

#### 5. Verify Deployment

1. Check Render dashboard for "Live" status
2. Visit your Render URL
3. Test login with admin user
4. Verify all pages load correctly
5. Test core functionality (members, donations, social aid)

---

## 🔐 Environment Configuration

### Production Variables

| Variable | Required | Description | Where to Set |
|-----------|-----------|-------------|--------------|
| `NODE_ENV` | Yes | Environment mode | Render Dashboard |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL | Render Dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase public key | Render Dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase admin key | Render Dashboard |
| `NEXT_PUBLIC_SENTRY_DSN` | Yes | Sentry project DSN | Render Dashboard |
| `SENTRY_ORG` | Yes | Sentry organization slug | Render Dashboard |
| `SENTRY_PROJECT` | Yes | Sentry project slug | Render Dashboard |
| `SENTRY_AUTH_TOKEN` | Yes | Sentry auth token | Render Dashboard |
| `SKIP_TYPE_CHECK` | No | Skip TypeScript build check | Render Dashboard (temp) |

### Security Notes

- `SUPABASE_SERVICE_ROLE_KEY` should NEVER be exposed to client-side
- `SENTRY_AUTH_TOKEN` is for build-time source map uploads only
- Anon key is safe for client-side, has limited permissions

---

## 👥 User Management

### Create Admin User

```sql
-- Run in Supabase Dashboard > SQL Editor
INSERT INTO public.users (id, email, name, role, created_at)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@kafkasder.org' LIMIT 1),
  'admin@kafkasder.org',
  'Admin Kullanıcı',
  'admin',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin';
```

### Role Permissions

| Role | Permissions |
|-------|------------|
| **admin** | All permissions: create, read, update, delete, user management |
| **moderator** | Create, read, update records (no delete, no user management) |
| **muhasebe** | Create, read, update donations and payments (read-only for other modules) |
| **user** | Read-only access to all data |

### Add New Users

**Method 1: Through Supabase Dashboard**

1. Go to Supabase Authentication > Users
2. Click "Add User"
3. Enter email and password
4. Set user metadata (name, role if needed)
5. Send email to user

**Method 2: Through Application**

1. Login as admin
2. Go to Ayarlar > Kullanıcılar
3. Click "Yeni Kullanıcı"
4. Enter user details
5. Assign role
6. Save

---

## 💾 Backup Strategy

### Automated Backups (Supabase)

Supabase provides automatic daily backups:
- **Retention**: 7 days (free tier)
- **Backup Time**: Daily at 00:00 UTC
- **Access**: Supabase Dashboard > Database > Backups

### Application-Level Backups

From the application interface (Ayarlar > Yedekleme):

1. **Full Backup**
   - Includes all tables: users, members, donations, beneficiaries, etc.
   - Format: JSON file
   - Download automatically created

2. **Data-Only Backup**
   - Excludes system tables
   - Smaller file size
   - Faster import

3. **Backup History**
   - View past backups
   - Download any previous backup
   - Compare versions

### Manual Backup

```bash
# From application interface
Ayarlar > Yedekleme > Tam Yedek Oluştur
# JSON file downloads automatically
```

### Restore from Backup

```bash
# From application interface
Ayarlar > Yedekleme > Geri Yükleme
# Select backup JSON file
# ⚠️ WARNING: This overwrites current data!
```

### Backup Best Practices

1. **Daily Backups**: Automated daily backup
2. **Weekly Archives**: Download backups to external storage
3. **Pre-Critical Changes**: Manual backup before major changes
4. **Test Restore**: Periodically test restore procedure
5. **Multiple Locations**: Store backups in different locations

---

## 📊 Monitoring & Logging

### Sentry (Error Tracking)

#### Setup Verification

1. Visit [Sentry Dashboard](https://sentry.io)
2. Navigate to your project
3. Go to **Settings** > **Client Keys (DSN)**
4. Verify DSN matches environment variable
5. Test error tracking at `/api/sentry-test`

#### Key Metrics to Monitor

- **Error Rate**: Total errors per hour
- **Error Types**: Categorize by error type
- **Users Affected**: Number of unique users impacted
- **Release Performance**: Compare error rates between releases

#### Performance Monitoring

1. Go to Sentry > Performance
2. Monitor:
   - Page load times
   - API response times
   - Database query performance
   - Slow transactions

### Supabase Logs

```bash
# Supabase Dashboard > Logs
- Database queries and performance
- API requests and errors
- Authentication events
- Real-time subscriptions
```

### Render Logs

```bash
# Render Dashboard > Logs > Your Service
- Application startup/shutdown
- Build logs
- Runtime errors
- Request/response logs
```

---

## 🔒 Security Best Practices

### 1. Password Policy

- **Minimum length**: 8 characters
- **Complexity**: At least 1 uppercase, 1 lowercase, 1 digit
- **Rotation**: Change passwords every 90 days
- **Supabase Auth**: Provides built-in password strength validation

### 2. Two-Factor Authentication (2FA)

```sql
-- Enable in Supabase Dashboard
-- Authentication > Providers > Email MFA
-- Or configure SMS MFA for additional security
```

### 3. IP Restrictions (Optional)

```bash
# Render Dashboard > Settings > IP Allowlist
# Restrict access to specific IP addresses
# Add office network IPs only
```

### 4. SSL/HTTPS

- ✅ Render provides automatic SSL certificates
- ✅ HTTPS is enforced
- ✅ HTTP requests redirect to HTTPS

### 5. Database Security

```sql
-- Enable RLS on all tables
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- Create policies for each role
CREATE POLICY "Policy name" ON [table_name]
FOR ALL TO [role]
USING (...);
```

---

## 🚨 Troubleshooting

### Build Failures

#### TypeScript Errors

```bash
# Check TypeScript errors
npm run type-check

# Common fixes:
# - Fix type mismatches
# - Add missing type definitions
# - Update dependencies

# Temporarily skip for deployment (not recommended)
SKIP_TYPE_CHECK=true
```

#### Dependency Issues

```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install

# Or use pnpm
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Runtime Errors

#### Application Won't Start

```bash
# Check Render logs for startup errors
# Common causes:
# - Missing environment variables
# - Database connection failure
# - Port conflicts

# Verify environment variables
echo $NEXT_PUBLIC_SUPABASE_URL

# Test database connection
# Use Supabase Dashboard > SQL Editor
SELECT 1;
```

#### Authentication Errors

```bash
# Check Sentry for auth errors
# Verify Supabase Auth settings
# Test auth at /api/auth/test
```

### Database Connection Issues

```bash
# Check environment variables
# Verify Supabase project status (Dashboard)
# Test RLS policies
# Check Supabase connection logs
```

### Performance Issues

```bash
# Check Sentry Performance tab
# Identify slow endpoints
# Check database query performance in Supabase logs
# Verify caching is working (TanStack Query)
```

---

## 📅 Maintenance Schedule

### Daily Tasks

- [ ] Check Sentry error logs
- [ ] Monitor application uptime
- [ ] Verify automated backups ran

### Weekly Tasks

- [ ] Download backup copies to external storage
- [ ] Review user activity reports
- [ ] Check performance metrics
- [ ] Update dependencies (npm audit)

### Monthly Tasks

- [ ] Security audit review
- [ ] Database optimization (VACUUM, ANALYZE)
- [ ] Rotate sensitive secrets (API keys)
- [ ] Archive old records (if needed)
- [ ] Review and update documentation

### Quarterly Tasks

- [ ] Full security audit
- [ ] Disaster recovery drill
- [ ] Capacity planning
- [ ] License and subscription review

---

## 📝 Post-Deployment Tasks

### Day 1

1. ✅ **Monitor Closely**: Watch for errors in first 24 hours
2. ✅ **Test All Features**: Verify all modules work correctly
3. ✅ **User Training**: Train staff on new system
4. ✅ **Initial Backup**: Create first production backup

### Week 1

1. ✅ **Collect Feedback**: Gather user feedback
2. ✅ **Fix Bugs**: Address any issues found
3. ✅ **Optimize**: Improve slow queries or pages
4. ✅ **Document**: Document any customizations

### Month 1

1. ✅ **Performance Review**: Analyze performance metrics
2. ✅ **Security Review**: Audit access and permissions
3. ✅ **Capacity Planning**: Plan for growth
4. ✅ **Backup Verification**: Test restore procedure

---

## 🎯 Rollback Plan

If critical issues occur after deployment:

### Immediate Actions

1. **Identify Issue**: Determine scope and severity
2. **Notify Users**: Inform of temporary downtime
3. **Rollback Code**: Revert to previous stable version
4. **Rollback Database**: If schema changes were made

### Rollback Steps

```bash
# Code rollback
git revert [commit-hash]
git push

# Database rollback
# Use backup to restore previous state
```

### Post-Rollback

1. **Investigate Cause**: Analyze why deployment failed
2. **Fix Issues**: Resolve problems in development
3. **Test Thoroughly**: Verify fixes work
4. **Redeploy**: Deploy fixed version

---

## 📞 Support Resources

### Emergency Contacts

- **Security Team**: security@kafkasder.org
- **Technical Lead**: [Contact info]
- **Render Support**: https://render.com/support
- **Supabase Support**: https://supabase.com/support
- **Sentry Support**: https://sentry.io/support

### Documentation

- **Development Guide**: `/docs/DEVELOPMENT.md`
- **Security Guide**: `/docs/SECURITY.md`
- **Testing Guide**: `/docs/TESTING.md`
- **User Guide**: `/docs/USER_GUIDE.md`

### Monitoring Dashboards

- **Sentry**: https://sentry.io
- **Supabase**: https://supabase.com/dashboard
- **Render**: https://dashboard.render.com

---

**Last Updated**: January 4, 2026  
**Version**: 1.0.0  
**Maintained By**: KafkasDer Operations Team 🚀

