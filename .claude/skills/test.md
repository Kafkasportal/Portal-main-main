---
description: Run the test suite
---

# Test

Run unit tests or E2E tests for the application.

## Usage

```
/test [unit|e2e]
```

## What it does

1. Runs `npm run test` for unit tests by default
2. Can run E2E tests with `npm run test:e2e`
3. Shows test results and coverage if available
4. Reports any failing tests

## Notes

- Unit tests use Jest
- E2E tests use Playwright
- Coverage report available with `npm run test:coverage`
