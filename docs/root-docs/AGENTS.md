# Agent Guide for Kafkasder Management Panel

This document contains essential information for AI agents working on the Kafkasder Management Panel repository.

## Project Context
**Kafkasder Yönetim Paneli** is a management system for the Caucasian Immigrants Association. It handles members, donations, social aid, and beneficiary tracking.

### Key Domains
- **Members (Üyeler)**: Membership tracking, dues (aidat), types (Active/Passive/Honorary).
- **Donations (Bağış)**: Cash, credit card, bank transfer tracking. Collection boxes (Kumbara) with QR/GPS.
- **Social Aid (Sosyal Yardım)**: Beneficiary tracking, aid applications, in-kind/cash aid distribution.
- **Dashboard**: Reporting and analytics.

## Tech Stack
- **Runtime**: Node.js v20+
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.9
- **UI**: React 19, Tailwind CSS v4, shadcn/ui (New York style)
- **Backend/DB**: Supabase (PostgreSQL, Auth, Storage)
- **State**: Zustand (client), React Query (server), nuqs (URL)
- **Forms**: React Hook Form + Zod

## Essential Commands

### Development
```bash
npm run dev              # Start development server
npm run build            # Production build
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript compiler check
npm run format           # Format code with Prettier
```

### Testing
```bash
npm run test             # Run unit tests (Jest)
npm run test:e2e         # Run E2E tests (Playwright)
npm run test:watch       # Run unit tests in watch mode
```

### Database
```bash
npm run db:seed          # Seed database with initial data
npm run db:migrate       # Push migrations to Supabase
```

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── (auth)/          # Public auth routes (login, register)
│   ├── (dashboard)/     # Protected app routes (sidebar layout)
│   └── api/             # API routes
├── components/
│   ├── ui/              # shadcn/ui primitives (DO NOT EDIT directly)
│   ├── features/        # Domain-specific components (kumbara, members, etc.)
│   ├── shared/          # Reusable app components (DataTable, etc.)
│   └── layout/          # Layout components (Sidebar, Header)
├── lib/
│   ├── supabase/        # Supabase client/server configuration
│   ├── db/              # Database utilities (offline queue, etc.)
│   └── utils.ts         # Common utilities (cn, formatting)
├── stores/              # Zustand stores (scan-queue, sidebar, etc.)
└── types/               # TypeScript definitions
tests/                   # Playwright E2E tests
conductor/               # Project documentation and guidelines
```

## Coding Standards

### TypeScript & Style
- **Strict Typing**: No `any`. Use `unknown` if necessary.
- **Exports**: Prefer named exports over default exports (except for Next.js Pages).
- **Quotes**: Use single quotes `'` for strings.
- **Semicolons**: Mandatory.
- **Visibility**: Do not use `#private`. Use TypeScript `private`/`protected`.
- **Naming**:
  - `UpperCamelCase` for components, interfaces, types.
  - `lowerCamelCase` for functions, variables.
  - No `_` prefixes for private members.

### UI & Components
- **Import Path**: Always use `@/` alias (e.g., `@/components/ui/button`).
- **Tailwind**: Use utility classes. Use `cn()` for conditional classes.
- **Language**: All UI text must be in **Turkish** (tr-TR).
- **Icons**: Lucide React (`lucide-react`).

### State Management
- **Client State**: Use Zustand (`src/stores/`).
- **Server State**: Use React Query.
- **URL State**: Use `nuqs` for filters, pagination, and sorting.

### Database & Auth
- **Client-side**: Use `createBrowserClient` (via `@/lib/supabase/client`).
- **Server-side**: Use `createServerClient` (via `@/lib/supabase/server`).
- **Mocking**: Check `NEXT_PUBLIC_USE_MOCK_API` flag.
- **Security**: Never write logic between client creation and `auth.getUser()` check in protected routes.

## Testing Strategy
- **Unit Tests**: Place next to source file (e.g., `component.test.ts`). Use for logic and hooks.
- **E2E Tests**: Place in `tests/` folder. Use for critical user flows (login, donation, etc.).

## Common Gotchas
- **Hydration**: Avoid `new Date()` mismatches. Use fixed dates or effect-based rendering for timestamps.
- **Turkish Sorting**: Always use `.localeCompare('tr-TR')` for sorting strings.
- **Mobile Numbers**: Turkish format usually `5xx xxx xx xx`.
- **Offline Mode**: The app has offline capabilities (see `src/lib/db/offline-queue.ts`).
