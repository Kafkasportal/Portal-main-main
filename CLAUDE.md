# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Kafkasder Yönetim Paneli** - a comprehensive management system for the Kafkas Göçmenleri Derneği (Caucasian Immigrants Association). The application manages donations (bağışlar), members (üyeler), social aid (sosyal yardım), and beneficiary tracking.

**Tech Stack:**
- Next.js 16 (App Router with React 19)
- TypeScript
- Tailwind CSS v4 + shadcn/ui components (New York style)
- Zustand for state management
- React Query (@tanstack/react-query) for async state
- React Hook Form + Zod for form validation
- nuqs for URL state management

## Common Commands

```bash
# Development
npm run dev          # Start development server at http://localhost:3000

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
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
├── lib/
│   ├── utils.ts       # cn() utility and helper functions
│   ├── validators.ts  # Zod schemas for form validation
│   ├── constants.ts   # NAV_ITEMS, label mappings, Turkish cities/countries
│   ├── mock-data.ts   # Mock data for development
│   └── mock-service.ts # Mock API service
├── stores/
│   ├── sidebar-store.ts # Sidebar state (open/collapsed/mobile)
│   └── user-store.ts    # User authentication state
├── hooks/
│   ├── use-media-query.ts # Responsive breakpoint detection
│   └── use-debounce.ts    # Debounced value hook
├── providers/
│   └── query-provider.tsx # React Query configuration
├── types/
│   └── index.ts       # All TypeScript type definitions
└── middleware.ts      # Route protection (currently mock auth)
```

## Architecture & Patterns

### Route Groups
- `(auth)`: Public routes with centered layout (login/register)
- `(dashboard)`: Protected routes with sidebar + header layout
- Root redirects to `/genel` (dashboard overview)

### Authentication
- **Current State:** Mock authentication (always authenticated)
- **Implementation:** `middleware.ts:35` has `isAuthenticated = true`
- Protected routes: All `/genel`, `/bagis`, `/uyeler`, `/sosyal-yardim`, etc.
- Public routes: `/giris`, `/kayit`
- Auth token checked via cookies (`auth-token`)

### State Management
1. **Zustand** (client state):
   - `useSidebarStore`: Sidebar open/collapsed state with localStorage persistence
   - `useUserStore`: User auth state (mock login implementation)

2. **React Query** (server state):
   - Configured in `query-provider.tsx`
   - Used for data fetching (ready for API integration)

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

## Development Notes

### Mock Data
Currently using mock data from `lib/mock-data.ts` and `lib/mock-service.ts`:
- `CURRENT_USER`: Default user (Ahmet Yılmaz, admin)
- Replace with actual API calls when backend is ready
- Mock service simulates async operations with setTimeout

### Data Fetching Pattern
Ready for API integration:
```typescript
// Replace mock-service.ts calls with actual API endpoints
import { getMockDonations } from '@/lib/mock-service'
// → Change to: fetch('/api/donations')
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
4. Handle submission with mock service or API call

## Common Gotchas

- **Date Handling**: Some mock data uses `new Date()` which may cause hydration mismatches. Use fixed dates or ISO strings.
- **Authentication**: Currently bypassed in middleware. Implement proper JWT/session auth before production.
- **Turkish Sorting**: Use `localeCompare('tr-TR')` for correct Turkish alphabetical sorting.
- **TC Kimlik Validation**: 11-digit numeric validation in `validators.ts`, but no checksum validation implemented.
- **Phone Numbers**: Support Turkish mobile operators (501-509, 530-559 ranges).
