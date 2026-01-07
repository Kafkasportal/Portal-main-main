# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Kafkasder Yönetim Paneli** - a comprehensive management system for the Kafkas Göçmenleri Derneği (Caucasian Immigrants Association). The application manages donations (bağışlar), members (üyeler), social aid (sosyal yardım), and beneficiary tracking.

**Tech Stack:**
- Next.js 16 (App Router with React 19)
- TypeScript 5.9
- Tailwind CSS v4 + shadcn/ui components (New York style)
- Zustand for state management
- React Query (@tanstack/react-query) for async state
- React Hook Form + Zod for form validation
- nuqs for URL state management
- Supabase for database and auth

## Common Commands

```bash
# Development
npm run dev              # Start development server at http://localhost:3000

# Production
npm run build            # Build for production
npm run build:analyze    # Build with bundle analyzer
npm start                # Start production server
npm run preview          # Build and start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Run ESLint with auto-fix
npm run format           # Format code with Prettier
npm run type-check       # Run TypeScript type checking

# Testing
npm run test             # Run Jest unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:ui      # Run Playwright with UI
npm run test:e2e:debug   # Run Playwright in debug mode

# Database
npm run db:push          # Push schema to Supabase
npm run db:seed          # Seed test data

# Cleanup
npm run clean            # Remove .next, out, and cache
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/         # Authentication routes (/giris, /kayit) with centered layout
│   ├── (dashboard)/    # Protected dashboard routes with sidebar layout
│   ├── layout.tsx      # Root layout with QueryProvider and Toaster
│   └── globals.css     # Global styles and Tailwind configuration
├── components/
│   ├── ui/            # shadcn/ui primitives (button, card, table, etc.)
│   ├── layout/        # Sidebar, Header, Breadcrumbs
│   ├── shared/        # DataTable, StatCard, PageHeader, EmptyState
│   └── features/      # Feature-specific components (donations, members, social-aid)
├── hooks/
│   ├── use-api.ts     # React Query hooks for data fetching
│   ├── use-media-query.ts # Responsive breakpoint detection
│   └── use-debounce.ts    # Debounced value hook
├── lib/
│   ├── supabase/      # Supabase client (client.ts, server.ts, middleware.ts)
│   ├── supabase-service.ts # CRUD operations with Supabase
│   ├── utils.ts       # cn() utility and helper functions
│   ├── validators.ts  # Zod schemas for form validation
│   ├── constants.ts   # NAV_ITEMS, label mappings, Turkish cities/countries
│   ├── mock-data.ts   # Mock data for development
│   └── mock-service.ts # Mock API service (fallback when Supabase unavailable)
├── stores/
│   ├── sidebar-store.ts # Sidebar state (open/collapsed/mobile)
│   └── user-store.ts    # User authentication state
├── providers/
│   └── query-provider.tsx # React Query configuration
├── types/
│   ├── index.ts       # All TypeScript type definitions
│   └── supabase.ts    # Supabase-generated types
└── middleware.ts      # Route protection with cookie-based auth
```

## Architecture & Patterns

### Data Layer Architecture

The app uses a layered data architecture:

1. **Supabase Client** (`lib/supabase/`)
   - `client.ts` - Browser client with mock fallback when credentials missing
   - `server.ts` - Server client for Server Components and API routes
   - `middleware.ts` - Session management for middleware
   - Falls back to mock client when `NEXT_PUBLIC_SUPABASE_URL` not set

2. **Service Layer** (`lib/supabase-service.ts`)
   - CRUD functions for all entities (fetchMembers, createDonation, etc.)
   - Type mapping between Supabase schema and app types
   - Pagination support via `toPaginatedResponse`
   - Storage operations for document upload/download

3. **React Query Hooks** (`hooks/use-api.ts`)
   - Custom hooks wrapping service functions
   - Centralized query keys for cache invalidation
   - Mutations with toast notifications
   - Automatic cache invalidation on updates

### Environment Variables

```bash
# Required for Supabase integration
NEXT_PUBLIC_SUPABASE_URL=         # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=        # Service role key (server-side)

# Optional
NEXT_PUBLIC_USE_MOCK_API=true     # Force mock mode even with credentials
```

Without these variables, the app falls back to mock mode for development.

### Route Groups
- `(auth)`: Public routes with centered layout (login/register)
- `(dashboard)`: Protected routes with sidebar + header layout
- Root redirects to `/genel` (dashboard overview)

### Authentication
- **Implementation:** Cookie-based JWT via Supabase Auth
- **Middleware:** `src/middleware.ts` validates auth token cookie
- **Protected routes:** All `/genel`, `/bagis`, `/uyeler`, `/sosyal-yardim`, etc.
- **Public routes:** `/giris`, `/kayit`
- Auth token checked via `auth-token` cookie managed by Supabase SSR

### State Management
1. **Zustand** (client state):
   - `useSidebarStore`: Sidebar open/collapsed state with localStorage persistence
   - `useUserStore`: User auth state

2. **React Query** (server state):
   - Configured in `query-provider.tsx`
   - Query keys centralized in `hooks/use-api.ts`
   - 5min stale time, automatic refetch on window focus

3. **URL State** (nuqs):
   - Table pagination, sorting, filters stored in URL
   - Type: `TableState` in `types/index.ts`

### Data Tables
The app uses a reusable `DataTable` component (`components/shared/data-table/`) built on @tanstack/react-table:
- Features: sorting, filtering, pagination, column visibility
- Column definitions in `components/features/*/columns.tsx`
- Loading states with skeletons
- Empty states handled automatically

### Forms
All forms use React Hook Form + Zod:
- Schemas in `lib/validators.ts` (donationSchema, memberSchema, etc.)
- Form components in `components/features/*/`
- Type inference: `z.infer<typeof schema>`

### Type System
Comprehensive TypeScript types in `types/index.ts`:
- **Donations (Bağış)**: `Bagis`, `Bagisci`, donor tracking
- **Members (Üye)**: `Uye` with membership details and dues (aidat)
- **Social Aid (Sosyal Yardım)**: `SosyalYardimBasvuru` (applications)
- **Beneficiaries (İhtiyaç Sahibi)**: Extensive `IhtiyacSahibi` type with:
  - Identity documents (kimlik, pasaport, vize)
  - Immigration status (göç ikamet bilgileri)
  - Family details (aile hane bilgileri)
  - Economic situation (ekonomik durum)
  - Health information (sağlık bilgileri)
  - Linked records count (bağlantılı kayıtlar)

### Navigation
Navigation structure defined in `lib/constants.ts:NAV_ITEMS`:
- Hierarchical menu with icons (lucide-react)
- Active state management via pathname matching
- Mobile responsive (Sheet component on mobile, collapsible sidebar on desktop)

## Important Conventions

### Path Aliases
Use `@/` for imports: `import { Button } from '@/components/ui/button'`

### Turkish Language
- All UI text, labels, and messages are in Turkish
- Use Turkish characters correctly (ı, ş, ğ, ü, ö, ç)
- Label mappings in `constants.ts` (e.g., `PAYMENT_METHOD_LABELS`, `DONATION_PURPOSE_LABELS`)

### Status Badges
Status variants mapped in `constants.ts:STATUS_VARIANTS`:
- `beklemede` → warning
- `tamamlandi` → success
- `iptal` → destructive
- `onaylandi` → success
- `reddedildi` → destructive

### CSS Classes
- Use `cn()` utility from `lib/utils.ts` for conditional classes
- Tailwind v4 with CSS variables for theming
- Dark mode by default: `<html lang="tr" className="dark">`

### Component Organization
- UI primitives: `components/ui/` (shadcn/ui components)
- Shared components: `components/shared/` (reusable across features)
- Feature components: `components/features/` (domain-specific)

## Key Features

### 1. Donations (Bağışlar)
- `/bagis/liste`: Donation list with filters
- `/bagis/kumbara`: Collection box management
- `/bagis/raporlar`: Reports and analytics
- Type: `Bagis` with donor info, amount, purpose, payment method

### 2. Members (Üyeler)
- `/uyeler/liste`: Member list with search/filter
- `/uyeler/yeni`: New member registration form
- Tracks membership dues (aidat) status: güncel, gecmis, muaf

### 3. Social Aid (Sosyal Yardım)
Complex module with multiple sub-pages:
- `/sosyal-yardim/ihtiyac-sahipleri`: Beneficiary database (comprehensive tracking)
- `/sosyal-yardim/basvurular`: Aid applications
- `/sosyal-yardim/odemeler`: Payment processing
- `/sosyal-yardim/istatistikler`: Statistics and reports

**Beneficiary System (İhtiyaç Sahibi):**
This is the most complex entity in the system. The `IhtiyacSahibi` type includes:
- Basic info: name, nationality, birth date, ID numbers (TC/foreign)
- Contact: phones (mobile/landline/international), email
- Address: country, city, district, neighborhood
- Identity documents: passport, visa, residence permit
- Immigration status: temporary protection, entry date, gate
- Family structure: marital status, number of children, orphans
- Economic situation: employment, income, debt, housing
- Health status: chronic illness, disability, insurance
- Aid history: application count, aid received, total amount
- Linked records: documents, photos, sponsors, interviews

### 4. Dashboard (`/genel`)
Overview page with statistics cards and charts using recharts

## Configuration Files

- `components.json`: shadcn/ui configuration (New York style, lucide icons)
- `tsconfig.json`: Path alias `@/*` maps to `./src/*`
- `next.config.ts`: Minimal config (default Next.js settings)
- `eslint.config.mjs`: ESLint configuration
- `jest.config.js`: Jest test configuration
- `playwright.config.ts`: E2E test configuration

## Development Notes

### Data Fetching Patterns

**React Query Hooks (Recommended):**
```typescript
import { useDonations, useCreateDonation } from '@/hooks/use-api'

// Fetch data
const { data, isLoading, error } = useDonations({ page: 1, limit: 10 })

// Create mutation
const createMutation = useCreateDonation()
createMutation.mutate(newDonation)
```

**Direct Service Calls:**
```typescript
import { fetchDonations, createDonation } from '@/lib/supabase-service'

const { data, count } = await fetchDonations({ page: 1, limit: 10 })
await createDonation(donationData)
```

**Direct Supabase:**
```typescript
import { getSupabaseClient } from '@/lib/supabase/client'

const supabase = getSupabaseClient()
const { data } = await supabase.from('donations').select('*')
```

### Responsive Design
- Mobile-first approach
- Sidebar: Sheet on mobile, collapsible sidebar on desktop (breakpoint: lg)
- Use `useIsMobile()` hook from `hooks/use-media-query.ts`

### Adding New Pages
1. Create route in `src/app/(dashboard)/your-route/page.tsx`
2. Add to `NAV_ITEMS` in `lib/constants.ts`
3. Add to protected routes in `middleware.ts` if needed
4. Use `PageHeader` component for consistent page titles
5. Use `DataTable` for list views with columns file

### Adding New Forms
1. Define Zod schema in `lib/validators.ts`
2. Create form component using React Hook Form
3. Use shadcn/ui form components (`form.tsx`)
4. Use mutation hooks from `hooks/use-api.ts` for submission

### Adding New Service Functions
1. Add CRUD function to `lib/supabase-service.ts`
2. Add corresponding React Query hooks to `hooks/use-api.ts`
3. Add query keys to `queryKeys` object
4. Use `toPaginatedResponse` for list queries

## Common Gotchas

- **Date Handling**: Dates from Supabase are ISO strings; convert with `new Date()` for display
- **Authentication**: Uses Supabase SSR with cookie sessions. The middleware checks for `auth-token` cookie.
- **Mock Mode**: When Supabase credentials are missing, the app uses mock client (see `client.ts:createMockClient`)
- **Turkish Sorting**: Use `localeCompare('tr-TR')` for correct Turkish alphabetical sorting.
- **TC Kimlik Validation**: 11-digit numeric validation in `validators.ts`, but no checksum validation implemented.
- **Phone Numbers**: Support Turkish mobile operators (501-509, 530-559 ranges).
- **Query Invalidation**: Use centralized `queryKeys` from `hooks/use-api.ts` for cache management
- **Server vs Client Components**: Use `createClient()` from `lib/supabase/server` for Server Components, `getSupabaseClient()` from `lib/supabase/client` for client components

## Related Documentation

- [README.md](./README.md) - Project overview and setup
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture details
- [DATA_MODEL.md](./DATA_MODEL.md) - Data models and entity relationships
- [WORKFLOW.md](./WORKFLOW.md) - Business workflows
- [docs/SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md) - Supabase setup guide
