# 🤖 AI Agent Guide for Kafkasder Management Panel

This document contains essential information for AI agents working on Kafkasder Management Panel repository.

## 📋 Table of Contents
1. [Project Context](#project-context)
2. [Tech Stack](#tech-stack)
3. [Essential Commands](#essential-commands)
4. [Project Structure](#project-structure)
5. [Coding Standards](#coding-standards)
6. [Testing Strategy](#testing-strategy)
7. [Common Gotchas](#common-gotchas)
8. [AI-Specific Guidelines](#ai-specific-guidelines)

---

## Project Context

**Kafkasder Yönetim Paneli** is a management system for the Caucasian Immigrants Association (Kafkas Göçmenleri Derneği). It handles donations (bağışlar), members (üyeler), social aid (sosyal yardım), and beneficiary tracking.

### 🎯 Key Domains

- **Members (Üyeler)**: Membership tracking, dues (aidat), types (Active/Passive/Honorary)
- **Donations (Bağış)**: Cash, credit card, bank transfer tracking. Collection boxes (Kumbara) with QR/GPS
- **Social Aid (Sosyal Yardım)**: Beneficiary tracking, aid applications, in-kind/cash aid distribution
- **Dashboard**: Reporting and analytics

### 🎨 Design Philosophy

- **User-Centric**: All UI text in Turkish (tr-TR) with proper characters (ı, ş, ğ, ü, ö, ç)
- **Responsive First**: Mobile and desktop optimized interface
- **Dark Mode Default**: System uses dark theme by default
- **Accessibility**: WCAG 2.1 compliant

---

## Tech Stack

| Category | Technology | Version | Purpose |
|----------|------------|----------|----------|
| **Runtime** | Node.js | v20+ | JavaScript runtime |
| **Framework** | Next.js | 16 (App Router) | React framework with SSR |
| **Language** | TypeScript | 5.9 | Type-safe JavaScript |
| **UI Library** | React | 19.2.3 | Component framework |
| **Styling** | Tailwind CSS | 4.0 | Utility-first CSS |
| **UI Components** | shadcn/ui | Latest | Pre-built components |
| **Backend/DB** | Supabase | 2.89.0 | PostgreSQL, Auth, Storage |
| **State (Client)** | Zustand | 5.0.9 | Global state management |
| **State (Server)** | TanStack Query | 5.90.12 | Server state caching |
| **State (URL)** | nuqs | Latest | URL state management |
| **Forms** | React Hook Form | 7.69.0 | Form validation |
| **Validation** | Zod | Latest | Schema validation |
| **Charts** | Recharts | Latest | Data visualization |

---

## Essential Commands

### 🚀 Development

```bash
npm run dev              # Start development server (localhost:3000)
npm run build            # Production build
npm run build:analyze    # Build with bundle analyzer
npm start                # Start production server
npm run preview          # Build and start (combined)
```

### 🔍 Code Quality

```bash
npm run lint             # ESLint check
npm run lint:fix         # ESLint auto-fix
npm run format           # Prettier format all
npm run format:check     # Prettier check
npm run type-check       # TypeScript check (no emit)
```

### 🧪 Testing

```bash
npm run test             # Jest unit tests
npm run test:watch       # Jest watch mode
npm run test:coverage    # Jest with coverage report
npm run test:e2e         # Playwright E2E tests
npm run test:e2e:ui      # Playwright with UI
npm run test:e2e:debug   # Playwright debug mode
```

### 🗄️ Database

```bash
npm run db:seed          # Run seed script
npm run db:migrate       # Supabase push migrations
```

**Test file patterns:** `src/**/*.test.{ts,tsx}` or `src/**/*.spec.{ts,tsx}`  
**E2E tests directory:** `tests/`

---

## Project Structure

```
Portal-main-main/
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── (auth)/              # Public auth routes (login, register)
│   │   ├── (dashboard)/         # Protected app routes (sidebar layout)
│   │   └── api/                 # API routes
│   ├── components/
│   │   ├── ui/                  # shadcn/ui primitives (DO NOT EDIT directly)
│   │   ├── features/            # Domain-specific components (kumbara, members, etc.)
│   │   ├── shared/              # Reusable app components (DataTable, etc.)
│   │   └── layout/              # Layout components (Sidebar, Header)
│   ├── lib/
│   │   ├── supabase/            # Supabase client/server configuration
│   │   ├── db/                  # Database utilities (offline queue, etc.)
│   │   ├── services/            # Business logic services
│   │   └── utils.ts             # Common utilities (cn, formatting)
│   ├── hooks/                   # Custom React hooks
│   ├── stores/                  # Zustand stores (scan-queue, sidebar, etc.)
│   ├── types/                   # TypeScript definitions
│   └── providers/               # Context providers (QueryProvider, etc.)
tests/                          # Playwright E2E tests
supabase/migrations/             # Database migrations
scripts/                        # Utility scripts
```

---

## Coding Standards

### 🎨 TypeScript & Style

- **Strict Typing**: No `any`. Use `unknown` if necessary
- **Explicit Types**: Always define return types for functions
- **Exports**: Prefer named exports over default exports (except for Next.js Pages)
- **Quotes**: Use single quotes `'` for strings
- **Semicolons**: Mandatory
- **Visibility**: Do not use `#private`. Use TypeScript `private`/`protected`
- **Naming**:
  - `UpperCamelCase` for components, interfaces, types
  - `lowerCamelCase` for functions, variables
  - `SCREAMING_SNAKE_CASE` for constants
  - No `_` prefixes for private members

### 🧩 UI & Components

- **Import Path**: Always use `@/` alias (e.g., `@/components/ui/button`)
- **Tailwind**: Use utility classes. Use `cn()` for conditional classes
- **Language**: All UI text must be in **Turkish** (tr-TR)
- **Icons**: Lucide React (`lucide-react`)
- **Components**: Keep components under 200 lines when possible

### 📦 State Management

- **Client State**: Use Zustand (`src/stores/`)
- **Server State**: Use React Query (TanStack Query)
- **URL State**: Use `nuqs` for filters, pagination, and sorting
- **Form State**: Use React Hook Form with local state

### 🔐 Database & Auth

- **Client-side**: Use `createBrowserClient` (via `@/lib/supabase/client`)
- **Server-side**: Use `createServerClient` (via `@/lib/supabase/server`)
- **Mocking**: Check `NEXT_PUBLIC_USE_MOCK_API` flag
- **Security**: Never write logic between client creation and `supabase.auth.getUser()` check in protected routes

### 🎯 Forms

1. Define Zod schema in `src/lib/validators.ts`
2. Use React Hook Form with `@hookform/resolvers/zod`
3. Use shadcn form components from `@/components/ui/form.tsx`
4. Validate on both client and server sides

---

## Testing Strategy

- **Unit Tests**: Place next to source file (e.g., `component.test.ts`). Use for logic and hooks
- **E2E Tests**: Place in `tests/` folder. Use for critical user flows (login, donation, etc.)
- **Test Coverage**: Target 70%+ coverage across the codebase

### Test Structure

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { myFunction } from './myModule'

describe('myFunction', () => {
  it('should return expected output', () => {
    expect(myFunction('input')).toBe('expected')
  })

  it('should handle edge cases', () => {
    expect(myFunction('')).toBe('')
    expect(myFunction(null)).toThrow()
  })
})
```

---

## Common Gotchas

### 💧 Hydration Issues

**Problem**: `new Date()` in initial render causes hydration mismatch  
**Solution**: Use ISO strings or fixed dates in initial render, effect-based rendering for timestamps

### 🇹🇷 Turkish Sorting

**Problem**: Alphabetical sorting doesn't work correctly for Turkish characters  
**Solution**: Always use `.localeCompare('tr-TR')` for sorting strings

```typescript
data.sort((a, b) => a.name.localeCompare(b.name, 'tr-TR'))
```

### 📱 Phone Numbers

**Problem**: Turkish mobile format validation  
**Solution**: Turkish mobile operators use 501-509, 530-559 ranges

```typescript
const turkishMobileRegex = /^5(0[1-9]|[3-5][0-9])\d{7}$/
```

### 🆔 TC Kimlik

**Problem**: Turkish ID validation  
**Solution**: 11-digit numeric validation exists but no checksum validation in current implementation

### 🔐 Supabase Security

**Critical**: Never write logic between `createServerClient` and `supabase.auth.getUser()` calls in protected routes

**Wrong**:
```typescript
const supabase = createServerClient()
const user = supabase.auth.getUser()
if (user) { /* logic */ }
```

**Right**:
```typescript
const supabase = createServerClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return redirect('/giris')
```

### 📡 Offline Mode

**Feature**: The app has offline capabilities for data entry  
**Implementation**: See `src/lib/db/offline-queue.ts` for offline data queue

---

## AI-Specific Guidelines

### 🤖 When Working as an AI Agent

1. **Read Context First**: Always read relevant documentation files before making changes
2. **Understand Domain**: Familiarize yourself with the business logic of donations, members, and social aid
3. **Check Existing Patterns**: Look at similar components to follow established patterns
4. **Test Changes**: Always ensure tests pass after modifications
5. **Update Documentation**: Update relevant docs when adding features

### 📝 File Modifications

When modifying files:
1. **Read the file first** to understand context
2. **Follow existing patterns** (coding style, imports, structure)
3. **Add comments** for complex logic
4. **Update tests** if behavior changes
5. **Run linter**: `npm run lint` before committing

### 🔄 Refactoring Guidelines

1. **Small steps**: Refactor incrementally
2. **Test frequently**: Run tests after each change
3. **Preserve behavior**: Don't change functionality during refactoring
4. **Update imports**: Ensure all import paths are updated
5. **Document changes**: Add comments explaining why refactoring was needed

### 🐛 Bug Fixing Process

1. **Reproduce locally**: Ensure you can reproduce the issue
2. **Check Sentry logs**: Look for error context in production
3. **Write failing test**: Ensure test fails before fix
4. **Implement fix**: Make minimal changes to fix the bug
5. **Verify fix**: Test passes, no regressions
6. **Update docs**: Document the fix if needed

### ✨ Feature Development

1. **Understand requirements**: Clarify with stakeholders if needed
2. **Design API first**: Define types and interfaces
3. **Implement backend**: Database migrations, API endpoints
4. **Build UI**: Create components following design patterns
5. **Add tests**: Unit tests for logic, E2E for user flows
6. **Documentation**: Update relevant docs and README
7. **Code review**: Self-review before committing

---

## 📚 Additional Resources

- **Main README**: `/README.md` - Project overview and quick start
- **Development Guide**: `/docs/DEVELOPMENT.md` - Detailed development instructions
- **Security Guide**: `/docs/SECURITY.md` - Security best practices
- **Production Guide**: `/docs/PRODUCTION.md` - Deployment and monitoring
- **Testing Guide**: `/docs/TESTING.md` - Testing strategies
- **User Guide**: `/docs/USER_GUIDE.md` - End-user documentation

---

**Last Updated**: January 4, 2026  
**Version**: 1.0.0  
**Maintained By**: KafkasDer Development Team 🚀

