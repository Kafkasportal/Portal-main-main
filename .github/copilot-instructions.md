# Copilot Instructions for Kafkasder Management Panel

AI coding agents should use this guide to understand the project's architecture, conventions, and workflows.

## Project Overview

**Kafkasder Yönetim Paneli** manages membership, donations, social aid, and beneficiary tracking for Kafkas Göçmenleri Derneği (Caucasian Immigrants Association).

**Tech Stack**: Next.js 16 (App Router) + React 19 + TypeScript + Supabase + Tailwind CSS + shadcn/ui

## Essential Architecture Patterns

### 1. Route Groups & Layout Structure
- **`(auth)`**: Public routes (`/giris`, `/kayit`, `/sifremi-unuttum`) with centered layout
- **`(dashboard)`**: Protected routes with persistent sidebar, theme, user context
- Middleware at `src/lib/supabase/middleware.ts` handles session refresh and redirects unauthenticated users to `/giris`

### 2. Data Layer Architecture
The app supports toggling between mock and real APIs via `NEXT_PUBLIC_USE_MOCK_API` environment variable:
```typescript
// src/lib/api-service.ts pattern - do NOT directly use Supabase in components
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'
const service = USE_MOCK ? mockService : supabaseService
```
Always fetch through service layer, not directly from Supabase client.

### 3. Supabase Client Usage
- **Server-side**: `createServerClient()` from `@/lib/supabase/server` (SSR safe)
- **Client-side**: `createBrowserClient()` from `@/lib/supabase/client` (browser context only)
- **Admin operations**: `createAdminClient()` uses service role key for privileged actions
- Do NOT mix client/server clients; check middleware for session refresh pattern

### 4. State Management Boundaries
- **Client state** (sidebar, filters): Zustand stores in `src/stores/` with persist middleware
- **Server state** (data fetching): React Query via `src/providers/query-provider.tsx`
- **URL state** (pagination, sorting): nuqs library (not useState)
- **Zustand example**: `stores/scan-queue-store.ts` shows offline queue pattern with IndexedDB persistence

### 5. Component Organization
```
components/
├── ui/           # shadcn/ui primitives (DO NOT EDIT - regenerate via CLI)
├── layout/       # Sidebar, Header, Breadcrumbs (layout-only components)
├── shared/       # Reusable patterns: DataTable, StatCard, PageHeader, EmptyState
└── features/     # Domain logic: donations/, members/, social-aid/, kumbara/
```
Feature components import shared components; shared components don't import feature components.

### 6. Data Table Pattern
Reusable at `components/shared/data-table/`:
- Uses @tanstack/react-table for headless table logic
- Column definitions live in `components/features/*/columns.tsx` (NOT in table component)
- Supports sorting, filtering, pagination, column visibility
- `cn()` utility for conditional Tailwind classes

## Development Workflows

### Setup & Running
```bash
npm install              # Install dependencies
npm run dev              # Start dev server (localhost:3000)
npm run type-check       # TypeScript check (no emit)
npm run lint             # ESLint validation
npm run format           # Prettier formatting
```

### Testing
```bash
npm run test             # Jest unit tests (src/**/*.test.{ts,tsx})
npm run test:watch       # Jest watch mode
npm run test:e2e         # Playwright E2E tests (tests/ directory)
npm run test:e2e:ui      # Playwright UI mode (recommended for debugging)
```

### Database
```bash
npm run db:seed          # Seed initial data (scripts/seed.ts)
npm run db:migrate       # Push migrations to Supabase
```
Migrations live in `supabase/migrations/` and use Supabase tooling.

## Code Style & Conventions

### TypeScript & Naming
- **No `any`** - use `unknown` if necessary
- **Strict mode enabled** - all types must be explicit
- **Named exports** (except Next.js pages/layouts use default exports)
- **Naming**: `UpperCamelCase` for types/interfaces/components, `lowerCamelCase` for functions/variables
- **Single quotes** for strings, **semicolons required**
- **No private fields** (`#`) - use TypeScript `private`/`protected`

### UI & Text
- **Import path**: Always use `@/` alias (e.g., `@/components/ui/button`)
- **Tailwind CSS**: Utility classes only; use `cn()` for conditionals
- **All UI text must be Turkish** (tr-TR) - no hardcoded English in UI
- **Icons**: Lucide React (`lucide-react`)

### Forms
- **React Hook Form** + **Zod** for validation
- Zod schemas define both validation and types
- Forms use shadcn/ui inputs with Radix UI primitives

### Testing Patterns
- Jest for unit tests (`src/**/*.test.ts{x}`)
- Playwright for E2E tests (`tests/**/*.spec.ts`)
- Coverage thresholds enforced: 50% branches/functions/lines/statements
- Mock API patterns in test setup files

## Key File References

| Purpose | Location |
|---------|----------|
| Type definitions | `src/types/index.ts` (central, not scattered) |
| Utility functions | `src/lib/utils.ts` (with `cn()` for Tailwind) |
| Environment variables | `.env.local`, prefix with `NEXT_PUBLIC_` for client access |
| API service toggle | `src/lib/api-service.ts` (mock vs Supabase) |
| Supabase client init | `src/lib/supabase/{client,server}.ts` |
| Query provider setup | `src/providers/query-provider.tsx` |
| Offline queue logic | `src/lib/db/offline-queue.ts` + `stores/scan-queue-store.ts` |

## Domain-Specific Knowledge

### Key Entities
- **Üyeler (Members)**: Tracked with ID, dues status (`aidat_durumu`), membership type
- **Bağışlar (Donations)**: Cash, card, bank transfers with purpose tracking
- **Sosyal Yardım (Social Aid)**: Beneficiary tracking, in-kind and cash distributions
- **Kumbaralar (Collection Boxes)**: Physical donation boxes with QR/GPS location tracking

### Database Schema Location
Primary schema at `supabase/schema.sql`; migrations in `supabase/migrations/` (numbered by date).

## Common Pitfalls

1. **Importing shadcn/ui components directly** - They're auto-generated in `components/ui/`. If a component breaks, regenerate it via `npx shadcn-ui@latest add <component>`
2. **Using client components in Server Components** - Check for `'use client'` directive; Server Components can't use hooks/browser APIs
3. **Hardcoded English in UI** - ALL user-facing text must be in Turkish
4. **Mixing state management** - Use nuqs for URL state (not useState), Zustand for client state (not Context), React Query for server state (not useState)
5. **Direct Supabase calls in components** - Route through service layer or API routes
6. **Not running type-check** - `npm run type-check` catches issues eslint misses

## Integration Points

- **Sentry**: Error tracking configured in `sentry.*.config.ts` (client, server, edge)
- **GitHub**: PR workflows and deployment via Render (see `render.yaml`)
- **Supabase**: Auth, database, storage (SSR-safe clients mandatory)
- **Codacy**: Code quality analysis (see instructions in `.github/instructions/codacy.instructions.md`)

---

**Last Updated**: December 2025  
**For AI Agents**: Read [docs/root-docs/AGENTS.md](../docs/root-docs/AGENTS.md) for extended context and domain details.
