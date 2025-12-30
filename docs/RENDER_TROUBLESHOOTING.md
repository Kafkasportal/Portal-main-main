# Render Deployment Troubleshooting Guide

This document contains troubleshooting information for common Render deployment issues.

## ❌ Error: "Publish directory dist does not exist!"

This error occurs when Render is configured to deploy as a static site instead of a Node.js web service.

### Root Cause

- Service is configured as "Static Site" instead of "Web Service"
- A `publishDirectory` setting is configured (should be empty for Next.js)
- Build configuration doesn't match the service type

### Solution Steps

#### 1. Check Render Dashboard Service Settings

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your service (`kafkasder-panel`)
3. Go to Settings tab
4. Verify the following settings:

**Service Configuration:**

- **Service Type**: Web Service (NOT Static Site)
- **Runtime**: Node
- **Build Command**: `node scripts/debug-render.js && npm ci && npm run build && node scripts/verify-build.js`
- **Start Command**: `npm start`
- **Publish Directory**: **LEAVE EMPTY** (should be blank)
- **Static Files Directory**: **LEAVE EMPTY** (should be blank)

#### 2. Verify Git Repository Settings

- **Repository**: `https://github.com/Kafkasportal/Portal.git`
- **Branch**: `main` (or your target branch)
- **Root Directory**: **LEAVE EMPTY** (should be blank)

#### 3. Environment Variables

Ensure all required environment variables are set in the Render dashboard:

- `NODE_ENV=production`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- Other project-specific variables

### Next.js Standalone Deployment

This project uses Next.js standalone output mode:

- **Output Directory**: `.next/` (NOT `dist/` or `out/`)
- **Deployment Mode**: Node.js server (NOT static files)
- **Features**: Supports SSR, API routes, dynamic routing

### How It Should Work

1. **Build Phase**:
   - Runs `npm ci && npm run build`
   - Creates `.next/standalone/` directory
   - Includes all necessary files for deployment

2. **Start Phase**:
   - Runs `npm start` (which executes `next start`)
   - Serves the application on the assigned port
   - Handles dynamic requests via Node.js

### Verification Scripts

The project includes verification scripts to help debug issues:

```bash
# Debug build environment
npm run debug:render

# Verify build output
npm run build:verify
```

### Alternative: Manual Service Creation

If the render.yaml configuration isn't working:

1. Delete the existing service
2. Create a new service manually:
   - Choose "Web Service"
   - Select your repository
   - Set build/start commands manually
   - **DO NOT** set a publish directory

### Contact Support

If issues persist:

1. Check Render documentation: <https://render.com/docs>
2. Contact Render support with this error message
3. Include the service ID: `srv-d59oiphr0fns73fu2fr0`

---

**Last Updated**: December 30, 2025
**Service ID**: srv-d59oiphr0fns73fu2fr0
