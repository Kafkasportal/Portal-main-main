# Security Headers Implementation

This document explains the security headers implemented in the Portal application to protect against common web vulnerabilities.

## Overview

Security headers are HTTP response headers that instruct web browsers to implement additional security mechanisms. They help protect against:
- Clickjacking attacks
- MIME type sniffing
- Cross-Site Scripting (XSS)
- Cross-Site Request Forgery (CSRF)
- Man-in-the-middle attacks

## Implemented Headers

### 1. X-Frame-Options
**Value:** `DENY`

Prevents the application from being embedded in iframes on other websites. This protects against clickjacking attacks where a malicious site could overlay invisible frames over the application.

**Options:**
- `DENY`: Never allow framing (recommended for sensitive content)
- `SAMEORIGIN`: Allow framing on same origin only
- `ALLOW-FROM`: Allow framing from specific origin

### 2. X-Content-Type-Options
**Value:** `nosniff`

Prevents browsers from MIME-sniffing the content type. Without this header, older browsers might interpret files differently than specified in the Content-Type header.

**Options:**
- `nosniff`: Enforce strict MIME type checking

### 3. Referrer-Policy
**Value:** `strict-origin-when-cross-origin`

Controls how much referrer information is shared when navigating from the application.

**Options:**
- `no-referrer`: Never send referrer information
- `strict-origin-when-cross-origin`: Send only origin for cross-origin requests (recommended for balance of privacy and functionality)
- `same-origin`: Send referrer only for same-origin requests
- `origin`: Always send origin

### 4. Permissions-Policy (formerly Feature-Policy)
**Value:** 
```
accelerometer=(), camera=(), geolocation=(), gyroscope=(), 
magnetometer=(), microphone=(), payment=(), usb=(), vr=()
```

Disables potentially dangerous browser APIs and features that the application doesn't need.

**Disabled Features:**
- `accelerometer`: Motion sensor access
- `camera`: Camera access
- `geolocation`: Location services
- `gyroscope`: Rotation sensor access
- `magnetometer`: Magnetic field sensor access
- `microphone`: Microphone access
- `payment`: Payment Request API
- `usb`: USB access
- `vr`: Virtual reality headset access

### 5. Strict-Transport-Security (HSTS)
**Value (Production):** `max-age=63072000; includeSubdomains; preload`
**Value (Development):** `max-age=3600`

Forces browsers to use HTTPS connections and prevents downgrade attacks.

**Parameters:**
- `max-age`: Time in seconds to remember HTTPS requirement (2 years in production)
- `includeSubdomains`: Apply policy to all subdomains
- `preload`: Allow inclusion in HSTS preload list for automatic enforcement

**HSTS Preload List:**
Submit your domain at https://hstspreload.org/ for automatic HTTPS enforcement across browsers.

### 6. X-XSS-Protection
**Value:** `1; mode=block`

Enables browser XSS protection filters (legacy header, kept for compatibility).

### 7. X-Permitted-Cross-Domain-Policies
**Value:** `none`

Controls Flash/PDF cross-domain policies.

### 8. Content-Security-Policy (CSP)
**Format:** `directive source1 source2; directive2 source1;`

Comprehensive policy controlling resource loading and script execution:

```
default-src 'self'
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://vercel.live https://challenges.cloudflare.com
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net
font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com
img-src 'self' data: https:
connect-src 'self' https: ws: wss:
frame-ancestors 'none'
base-uri 'self'
form-action 'self'
```

**Key Directives:**
- `default-src`: Default policy for all content types
- `script-src`: Allowed JavaScript sources
- `style-src`: Allowed stylesheets sources
- `font-src`: Allowed font sources
- `img-src`: Allowed image sources
- `connect-src`: Allowed fetch/websocket connections
- `frame-ancestors`: Who can frame this page
- `base-uri`: Allowed base URL values
- `form-action`: Where forms can submit

## Implementation Details

### Middleware Location
The security headers are implemented in `/middleware.ts` at the root of the project. This middleware:

1. Runs on every request matching the configured matcher pattern
2. Calls the Supabase session update middleware
3. Adds security headers to all responses
4. Applies the CSP policy

### Exempted Routes
The middleware matcher excludes:
- `_next/static`: Static assets
- `_next/image`: Optimized images
- `favicon.ico`: Favicon
- `monitoring`: Sentry monitoring webhook

### Header Configuration
Additional headers are also set in `next.config.ts` for:
- Static assets caching
- Development tools

## Usage

### Using Security Headers Utilities

The `src/lib/security/headers.ts` module provides utilities for managing security headers:

```typescript
import { 
  getDefaultSecurityHeaders, 
  buildCSP, 
  getHSTSHeader 
} from '@/lib/security/headers'

// Get default security headers
const headers = getDefaultSecurityHeaders()

// Build custom CSP
const csp = buildCSP({
  'img-src': ["'self'", 'https://example.com'],
})

// Get HSTS header for production
const hsts = getHSTSHeader(process.env.NODE_ENV === 'production')
```

### API Routes with Custom Headers

For API routes that need custom headers:

```typescript
// src/app/api/endpoint/route.ts
import { buildCSP, mergeSecurityHeaders } from '@/lib/security/headers'

export async function GET(request: Request) {
  const headers = new Headers({
    ...mergeSecurityHeaders({
      'X-Custom-Header': 'value',
    }),
  })

  return new Response('content', { headers })
}
```

## Testing Security Headers

### Using Browser DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Reload the page
4. Check the Response Headers of any request

### Using Command Line

```bash
# Using curl
curl -I https://yourdomain.com

# Using curl with verbose output
curl -i https://yourdomain.com

# Using curl to check specific header
curl -I https://yourdomain.com | grep "X-Frame-Options"
```

### Using Online Tools
- [Security Headers](https://securityheaders.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)
- [Qualys SSL Server Test](https://www.ssllabs.com/ssltest/)

## Performance Considerations

- **HSTS Preload List**: Including in the preload list can take weeks to months
- **CSP Violations**: Monitor CSP violations in production using CSP violation reporting
- **Header Size**: Keep CSP policies reasonably sized to avoid header bloat

## Common Issues

### CSP Violations
If legitimate content is blocked by CSP:
1. Check browser console for CSP violation reports
2. Update the CSP directive to allow the source
3. Test in development before deploying

### HSTS Issues
- Once HSTS is set, browsers enforce it for the specified duration
- Can only be removed after max-age expires
- Be careful when moving between HTTP/HTTPS during development

## Future Enhancements

1. **CSP Nonce-based Script Execution**: Replace `'unsafe-inline'` with nonce
2. **CSP Reporting**: Implement reporting-uri for CSP violations
3. **Dynamic CSP**: Generate CSP dynamically based on environment
4. **Subresource Integrity (SRI)**: Add hashes for external scripts
5. **Expect-CT Header**: Certificate transparency enforcement

## References

- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
- [MDN Security Headers Guide](https://developer.mozilla.org/en-US/docs/Glossary/Security_header)
- [Content-Security-Policy Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [HSTS Preload List](https://hstspreload.org/)
