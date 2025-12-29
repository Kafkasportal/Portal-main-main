# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Kafkasder Yönetim Paneli** - A management system for Kafkas Göçmenleri Derneği (Caucasian Immigrants Association). Manages donations (bağışlar), members (üyeler), social aid (sosyal yardım), and beneficiary tracking.

**Tech Stack:**
- Next.js 16 (App Router) with React 19
- TypeScript 5.9
- Tailwind CSS v4 + shadcn/ui (New York style)
- Supabase (PostgreSQL, Auth, Storage)
- Zustand for client state
- React Query for server state
- React Hook Form + Zod for forms
- nuqs for URL state

## Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)

# Build & Production
npm run build            # Production build
npm run build:analyze    # Build with bundle analyzer
npm start                # Start production server
npm run preview          # Build and start (combined)

# Code Quality
npm run lint             # ESLint check
npm run lint:fix         # ESLint fix
npm run format           # Prettier format all
npm run format:check     # Prettier check
npm run type-check       # TypeScript check (no emit)

# Testing
npm run test             # Jest unit tests
npm run test:watch       # Jest watch mode
npm run test:coverage    # Jest with coverage report
npm run test:e2e         # Playwright E2E tests
npm run test:e2e:ui      # Playwright with UI
npm run test:e2e:debug   # Playwright debug mode

# Database
npm run db:seed          # Run seed script
npm run db:migrate       # Supabase push
```

**Test file patterns:** `src/**/*.test.{ts,tsx}` or `src/**/*.spec.{ts,tsx}`
**E2E tests directory:** `tests/`

## Architecture

### Route Groups
- `(auth)`: Public routes (`/giris`, `/kayit`, `/sifremi-unuttum`) with centered layout
- `(dashboard)`: Protected routes with sidebar layout
- Root `/` redirects to `/genel`

### Data Layer Toggle
The app supports both mock and real APIs via environment variable:
```typescript
// src/lib/api-service.ts
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'
const service = USE_MOCK ? mockService : supabaseService
```
Set `NEXT_PUBLIC_USE_MOCK_API=true` for development without Supabase.

### Authentication
- Supabase Auth via `@supabase/ssr`
- Middleware at `src/lib/supabase/middleware.ts` handles session refresh and route protection
- Protected routes redirect unauthenticated users to `/giris`
- Auth state checked via `supabase.auth.getUser()`

### State Management
1. **Zustand** (client): `stores/sidebar-store.ts`, `stores/user-store.ts`
2. **React Query** (server): Configured in `providers/query-provider.tsx`
3. **URL State** (nuqs): Table pagination, sorting, filters

### Component Hierarchy
```
components/
├── ui/           # shadcn/ui primitives (do not edit directly)
├── layout/       # Sidebar, Header, Breadcrumbs
├── shared/       # DataTable, StatCard, PageHeader, EmptyState
└── features/     # Domain-specific (donations/, members/, social-aid/)
```

### Data Tables
Reusable `DataTable` at `components/shared/data-table/`:
- Built on @tanstack/react-table
- Column definitions in `components/features/*/columns.tsx`
- Supports sorting, filtering, pagination, column visibility

### Type System
All types in `types/index.ts`. Key entities:
- `Bagis`, `Bagisci` - Donations
- `Uye` - Members with dues tracking
- `Kumbara` - Collection boxes with QR/GPS
- `IhtiyacSahibi` - Beneficiaries (most complex - identity, immigration, family, health, economic data)
- `SosyalYardimBasvuru` - Aid applications

## Key Conventions

### Path Aliases
Always use `@/` for imports: `import { Button } from '@/components/ui/button'`

### Turkish Language
- All UI text in Turkish with proper characters (ı, ş, ğ, ü, ö, ç)
- Label mappings in `lib/constants.ts` (e.g., `PAYMENT_METHOD_LABELS`, `STATUS_VARIANTS`)

### Theming
- Dark mode default: `<html lang="tr" className="dark">`
- Use `cn()` from `lib/utils.ts` for conditional classes
- CSS variables for colors (Tailwind v4)

### Forms
1. Define Zod schema in `lib/validators.ts`
2. Use React Hook Form with `@hookform/resolvers/zod`
3. Use shadcn form components from `components/ui/form.tsx`

## Feature Routes

| Route | Description |
|-------|-------------|
| `/genel` | Dashboard with stats and charts (recharts) |
| `/bagis/liste` | Donation list |
| `/bagis/kumbara` | Collection box management with QR |
| `/bagis/raporlar` | Donation reports |
| `/uyeler/liste` | Member list |
| `/uyeler/yeni` | New member form |
| `/sosyal-yardim/ihtiyac-sahipleri` | Beneficiary database |
| `/sosyal-yardim/basvurular` | Aid applications |
| `/sosyal-yardim/odemeler` | Payment processing |
| `/sosyal-yardim/istatistikler` | Aid statistics |

## Environment Variables

Copy `.env.example` to `.env.local`. Key variables:
- `NEXT_PUBLIC_USE_MOCK_API` - Set `true` to use mock data
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `DATABASE_URL` - PostgreSQL connection string

## Common Gotchas

- **Hydration**: Avoid `new Date()` in initial render; use ISO strings or fixed dates
- **Turkish Sorting**: Use `localeCompare('tr-TR')` for correct alphabetical order
- **TC Kimlik**: 11-digit numeric validation exists but no checksum validation
- **Phone Numbers**: Mobile operators use 501-509, 530-559 ranges
- **Supabase Security**: Never write logic between `createServerClient` and `supabase.auth.getUser()` calls
