---
description: Run TypeScript type checking
---

# Type Check

Run TypeScript compiler to check for type errors without building.

## Usage

```
/type-check
```

## What it does

1. Runs `npm run type-check`
2. Reports any type errors found in the codebase
3. Shows file paths and line numbers for errors

## Notes

- Faster than a full build
- Checks type correctness without emitting JS
- Useful for catching type-related bugs early
