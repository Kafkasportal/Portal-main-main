---
description: Run ESLint on the codebase
---

# Lint

Run ESLint to check code quality and find potential issues.

## Usage

```
/lint
```

## What it does

1. Runs `npm run lint` to check all files
2. Displays any linting errors or warnings
3. Optionally runs `npm run lint:fix` to auto-fix issues

## Notes

- ESLint is configured for TypeScript and React
- Checks for code quality, consistency, and potential bugs
- Auto-fix can resolve many issues automatically
