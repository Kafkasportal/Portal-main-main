---
description: Build the Next.js application for production
---

# Build

Build the Next.js application for production deployment.

## Usage

```
/build
```

## What it does

1. Checks if `node_modules` exists and installs dependencies if needed
2. Runs the production build: `npm run build`
3. Reports build success or failures
4. Shows build output and any warnings/errors

## Notes

- Build output will be in `.next/` directory
- Type checking is included in the build process
- ESLint runs automatically during build
- Production optimizations are applied automatically
