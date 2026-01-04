# 🧪 Testing Guide for Kafkasder Management Panel

Comprehensive testing strategy, guidelines, and best practices for the Kafkasder Management Panel project.

---

## 📋 Table of Contents
1. [Testing Overview](#testing-overview)
2. [Unit Testing](#unit-testing)
3. [Integration Testing](#integration-testing)
4. [E2E Testing](#e2e-testing)
5. [Test Coverage](#test-coverage)
6. [Test Writing Guidelines](#test-writing-guidelines)
7. [Continuous Integration](#continuous-integration)
8. [Troubleshooting](#troubleshooting)

---

## 🧪 Testing Overview

### Testing Stack

| Tool | Purpose | Version |
|-------|---------|---------|
| **Vitest** | Unit testing | Latest |
| **React Testing Library** | Component testing | Latest |
| **Playwright** | E2E testing | Latest |
| **Jest DOM** | DOM matchers | Latest |
| **SonarCloud** | Code quality & coverage | Latest |

### Testing Philosophy

1. **Test-Driven Development (TDD)**: Write tests before code when possible
2. **AAA Pattern**: Arrange, Act, Assert for clear test structure
3. **Descriptive Tests**: Test names should explain what they test
4. **Isolation**: Each test should be independent
5. **Fast Feedback**: Unit tests should run in milliseconds

### Test Categories

| Type | Purpose | Tool |
|-------|---------|--------|
| **Unit** | Test individual functions/components in isolation | Vitest |
| **Component** | Test React components with user interactions | React Testing Library |
| **Integration** | Test multiple components/services together | Vitest + MSW |
| **E2E** | Test complete user flows in browser | Playwright |

---

## 🧩 Unit Testing

### Running Unit Tests

```bash
# Run all tests
npm test

# Run tests once (CI mode)
npm run test:run

# Run specific test file
npm test validators.test.ts

# Run tests matching pattern
npm test -- --grep "phone number"

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Unit Test Structure

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { myFunction } from './myModule'

describe('myFunction', () => {
  // Setup before each test
  beforeEach(() => {
    // Arrange
  })

  // Cleanup after each test
  afterEach(() => {
    // Cleanup
  })

  it('should return correct output for valid input', () => {
    // Arrange
    const input = 'test-input'

    // Act
    const result = myFunction(input)

    // Assert
    expect(result).toBe('expected-output')
  })

  it('should handle edge cases', () => {
    // Arrange
    const emptyInput = ''
    const nullInput = null

    // Act & Assert
    expect(myFunction(emptyInput)).toBe('')
    expect(() => myFunction(nullInput)).toThrow()
  })
})
```

### Testing Async Functions

```typescript
describe('async functions', () => {
  it('should resolve with expected value', async () => {
    const result = await myAsyncFunction('input')
    expect(result).toBe('expected')
  })

  it('should handle errors', async () => {
    await expect(myAsyncFunction('invalid')).rejects.toThrow('Error message')
  })
})
```

### Testing Hooks

```typescript
import { renderHook, act, waitFor } from '@testing-library/react'
import { useMyHook } from './useMyHook'

describe('useMyHook', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useMyHook())
    expect(result.current.value).toBe('default')
  })

  it('should update value on action', async () => {
    const { result } = renderHook(() => useMyHook())
    
    act(() => {
      result.current.setValue('new-value')
    })
    
    await waitFor(() => {
      expect(result.current.value).toBe('new-value')
    })
  })
})
```

---

## 🧩 Component Testing

### Running Component Tests

```bash
# Component tests use same commands as unit tests
npm test components
```

### Component Test Example

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly with props', () => {
    render(<MyComponent title="Test Title" />)
    
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    const user = userEvent.setup()
    render(<MyComponent />)
    
    const button = screen.getByRole('button', { name: 'Submit' })
    await user.click(button)
    
    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument()
    })
  })

  it('shows error message on invalid input', async () => {
    const user = userEvent.setup()
    render(<MyComponent />)
    
    const input = screen.getByLabelText('Email')
    await user.type(input, 'invalid-email')
    
    const button = screen.getByRole('button', { name: 'Submit' })
    await user.click(button)
    
    expect(screen.getByText('Please enter a valid email')).toBeInTheDocument()
  })
})
```

### Testing Form Components

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MyForm } from './MyForm'

describe('MyForm', () => {
  it('validates email field', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<MyForm onSubmit={onSubmit} />)
    
    const emailInput = screen.getByLabelText('Email')
    await user.type(emailInput, 'not-an-email')
    
    const submitButton = screen.getByRole('button', { name: 'Submit' })
    await user.click(submitButton)
    
    expect(screen.getByText('Invalid email')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
```

---

## 🎭 Integration Testing

### Testing API Routes

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createMocks } from 'node-mocks-http'
import { GET } from '@/app/api/members/route'

const { req, res } = createMocks({
  method: 'GET',
  query: { page: '1', limit: '10' }
})

describe('/api/members', () => {
  it('should return paginated members list', async () => {
    const response = await GET(req)
    const data = await response.json()
    
    expect(data.members).toHaveLength(10)
    expect(data.total).toBeGreaterThan(10)
    expect(response.status).toBe(200)
  })
})
```

### Testing Database Operations

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { supabase } from '@/lib/supabase/client'

describe('Member Service', () => {
  beforeEach(async () => {
    // Clean up test data
    await supabase.from('members').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  })

  it('should create new member', async () => {
    const newMember = {
      tc_kimlik: '12345678901',
      ad: 'Test',
      soyad: 'User',
      email: 'test@example.com'
    }
    
    const { data, error } = await supabase
      .from('members')
      .insert(newMember)
      .select()
      .single()
    
    expect(error).toBeNull()
    expect(data).toMatchObject(newMember)
  })
})
```

---

## 🎭 E2E Testing

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run in headed mode (visible browser)
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test login.spec.ts

# Run with specific browser
npx playwright test --project=chromium
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:3000/giris')
    
    // Fill login form
    await page.fill('input[name="email"]', 'admin@kafkasder.org')
    await page.fill('input[name="password"]', 'Test123!')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('/genel')
    await expect(page.locator('text=Dashboard')).toBeVisible()
  })

  test('should show error message with invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/giris')
    
    await page.fill('input[name="email"]', 'invalid@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Geçersiz email veya şifre')).toBeVisible()
  })
})
```

### Testing User Flows

```typescript
test.describe('Donation Flow', () => {
  test('should complete donation process', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/giris')
    await loginAsAdmin(page)
    
    // Navigate to donations
    await page.click('text=Bağış')
    await page.click('text=Yeni Bağış')
    
    // Fill donation form
    await page.fill('input[name="tutar"]', '1000')
    await page.fill('input[name="bagisci_adi"]', 'Test Bağışçı')
    await page.selectOption('select[name="odeme_yontemi"]', 'Nakit')
    
    // Submit
    await page.click('button[type="submit"]')
    
    // Verify success
    await expect(page.locator('text=Bağış başarıyla kaydedildi')).toBeVisible()
    
    // Check donation appears in list
    await page.click('text=Bağış Listesi')
    await expect(page.locator('text=Test Bağışçı')).toBeVisible()
  })
})
```

---

## 📊 Test Coverage

### Coverage Targets

| Category | Current | Target | Status |
|-----------|---------|--------|--------|
| Validators | 95% | 95% | ✅ |
| Utilities | 90% | 90% | ✅ |
| Services | 0% | 80% | ⚠️ |
| Hooks | 0% | 70% | ⚠️ |
| Components | 0% | 60% | ⚠️ |
| **Overall** | ~5% | 70% | ⚠️ |

### Generating Coverage Report

```bash
# Generate coverage
npm run test:coverage

# Open HTML report
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

### Coverage Report Structure

```
coverage/
├── index.html              # Overall coverage report
├── lcov-report/          # Detailed HTML report
├── lcov.info             # LCOV format
└── coverage-final.json     # JSON format
```

### Improving Coverage

#### Priority 1 (This Week)
- [ ] Service layer tests (donations, members, beneficiaries)
- [ ] Mapper tests (database transformations)
- [ ] Hook tests (useApi, useScanSync)

#### Priority 2 (Next 2 Weeks)
- [ ] Component tests (UI components, forms)
- [ ] Integration tests (full workflows)

#### Priority 3 (Long Term)
- [ ] E2E tests (Playwright)
- [ ] Visual regression tests
- [ ] Performance tests

---

## 📝 Test Writing Guidelines

### Best Practices

#### 1. Descriptive Test Names

```typescript
// ✅ Good
it('should format Turkish phone number correctly', () => {})

// ❌ Bad
it('phone formatting', () => {})
```

#### 2. AAA Pattern

```typescript
// ✅ Good - Clear Arrange, Act, Assert
it('should calculate donation total', () => {
  // Arrange
  const donations = [100, 200, 300]
  
  // Act
  const total = calculateTotal(donations)
  
  // Assert
  expect(total).toBe(600)
})

// ❌ Bad - Mixed steps
it('should calculate total', () => {
  expect(calculateTotal([100, 200, 300])).toBe(600)
})
```

#### 3. Test One Thing

```typescript
// ✅ Good - Single assertion
it('should validate email format', () => {
  const result = validateEmail('test@example.com')
  expect(result.valid).toBe(true)
})

// ❌ Bad - Multiple assertions
it('should validate and format email', () => {
  const result = validateEmail('test@example.com')
  expect(result.valid).toBe(true)
  expect(result.formatted).toBe('test@example.com')
  expect(result.domain).toBe('example.com')
})
```

#### 4. Use Meaningful Data

```typescript
// ✅ Good - Realistic test data
it('should calculate total donation amount', () => {
  const donations = [
    { amount: 1000, currency: 'TRY' },
    { amount: 500, currency: 'EUR' },
    { amount: 200, currency: 'USD' }
  ]
  expect(calculateTotal(donations)).toBeCloseTo(30000, 10) // With conversion
})

// ❌ Bad - Unrealistic data
it('should sum numbers', () => {
  expect(sum([1, 2, 3])).toBe(6)
})
```

### Test Organization

```typescript
describe('Validator: Phone Number', () => {
  describe('Turkish Mobile Numbers', () => {
    it('should accept valid Turkish mobile number', () => {})
    it('should reject invalid prefix', () => {})
    it('should reject wrong length', () => {})
  })

  describe('International Numbers', () => {
    it('should accept valid international format', () => {})
    it('should normalize to standard format', () => {})
  })
})
```

---

## 🔄 Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Run unit tests
        run: npm run test:run
      
      - name: Generate coverage
        run: npm run test:coverage
      
      - name: Upload coverage to SonarCloud
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload E2E screenshots
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

### Quality Gates

- **Lint**: Must pass
- **Type Check**: Must pass (or be explicitly skipped)
- **Unit Tests**: Must pass, 70%+ coverage
- **E2E Tests**: Must pass
- **SonarCloud**: Quality gate must pass

---

## 🚨 Troubleshooting

### Test Failures

#### Unit Test Fails

```bash
# Run with verbose output
npm test -- --reporter=verbose

# Run specific test file
npm test utils.test.ts

# Run single test
npm test -t "should format Turkish phone"

# Debug in VS Code
# Add 'debugger' in test
# Run: npm run test:debug
```

#### Component Test Fails

```bash
# Check for hydration issues
# Ensure consistent rendering between server/client

# Check for async issues
# Use waitFor instead of immediate assertions

# Debug component state
// Add debug output
console.log('Component state:', screen.debug())
```

#### E2E Test Fails

```bash
# Run in headed mode to see what's happening
npm run test:e2e:ui

# Run in debug mode with inspector
npm run test:e2e:debug

# Take screenshots on failure
// In test:
await page.screenshot({ path: 'failure.png' })
```

### Coverage Issues

#### Low Coverage

```bash
# Generate detailed coverage report
npm run test:coverage

# Check specific files
open coverage/lcov-report/index.html

# Identify untested lines
# Red lines in coverage report need tests
```

#### Coverage Not Generating

```bash
# Check vitest.config.ts
// Ensure coverage is enabled:
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
      ]
    }
  }
})
```

### Flaky Tests

#### Test Passes Intermittently

```typescript
// Add retries
describe('flaky test', () => {
  it.retries(3)('should work reliably', () => {
    // Test logic
  })
})

// Use waitFor with longer timeout
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument()
}, { timeout: 5000 })

// Add delay for async operations
await new Promise(resolve => setTimeout(resolve, 100))
```

---

## 📚 Additional Resources

### Documentation

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

### Guides

- [Testing Best Practices](https://kentcdodds.com/blog/common-testing-mistakes/)
- [Testing React Components](https://testingjavascript.com/)
- [E2E Testing Strategies](https://www.cypress.io/blog/end-to-end-testing-best-practices/)

### Tools

- [SonarCloud](https://sonarcloud.io/) - Code quality & coverage
- [GitHub Actions](https://docs.github.com/en/actions) - CI/CD
- [Codecov](https://codecov.io/) - Coverage reports (optional)

---

**Last Updated**: January 4, 2026  
**Version**: 1.0.0  
**Maintained By**: KafkasDer QA Team 🧪

