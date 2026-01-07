# 🏗️ Architecture

KafkasDer Yönetim Paneli teknik mimari dokümantasyonu.

## Tech Stack

```json
{
  "Framework": "Next.js 16 (App Router)",
  "UI": "React 19",
  "Language": "TypeScript 5.9",
  "Styling": "Tailwind CSS 4.0",
  "Components": "shadcn/ui (Radix UI)",
  "Database": "Supabase (PostgreSQL)",
  "State Management": "Zustand",
  "Data Fetching": "TanStack Query v5",
  "Forms": "React Hook Form + Zod",
  "Charts": "Recharts",
  "Icons": "Lucide React",
  "Excel": "ExcelJS",
  "QR Code": "@zxing/library"
}
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/             # React components
│   ├── ui/               # shadcn/ui primitives
│   ├── layout/           # Sidebar, Header, Breadcrumbs
│   ├── shared/           # DataTable, StatCard, PageHeader
│   └── features/         # Feature-specific components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities
│   ├── supabase/         # Supabase client
│   ├── supabase-service.ts # CRUD operations
│   ├── constants.ts      # NAV_ITEMS, labels
│   ├── validators.ts     # Zod schemas
│   └── utils.ts          # Helper functions
├── stores/                # Zustand state stores
├── types/                 # TypeScript types
└── providers/             # React providers
```

## Component Architecture

### UI Components (`components/ui/`)
- shadcn/ui primitives (Button, Card, Table, Dialog, etc.)
- Reusable, unstyled, accessible
- Tailwind CSS styling

### Layout Components (`components/layout/`)
- **Sidebar** - Navigation with collapsible menu
- **Header** - Top bar with user info
- **Breadcrumbs** - Navigation breadcrumbs
- **ProgressBar** - Page loading indicator

### Shared Components (`components/shared/`)
- **DataTable** - Generic table with sorting, filtering
- **StatCard** - Metric display card
- **PageHeader** - Page title and actions
- **QueryError** - Error handling component
- **EmptyState** - No data placeholder

### Feature Components (`components/features/`)
- **donations/** - Donation management
- **members/** - Member management
- **social-aid/** - Social aid management
- **kumbara/** - Collection box management

## Data Layer

### Supabase Client
```typescript
// Client-side
getSupabaseClient()

// Server-side
await createClient()
```

### Service Layer (`lib/supabase-service.ts`)
- `fetchMembers()` - Member CRUD
- `fetchDonations()` - Donation CRUD
- `fetchApplications()` - Application CRUD
- `fetchBeneficiaries()` - Beneficiary CRUD
- `fetchDashboardStats()` - Dashboard stats

### Custom Hooks (`hooks/use-api.ts`)
```typescript
useDashboardStats()
useDonations(params)
useMembers(params)
useApplications(params)
useBeneficiaries(params)
```

## State Management

### Zustand Stores (`stores/`)
- **sidebar-store** - Sidebar collapse state
- **theme-store** - Theme preferences

### TanStack Query
- Server state management
- Automatic caching (5min)
- Background refetching
- Optimistic updates

## Routing

### Route Groups
- `(auth)` - Authentication pages
- `(dashboard)` - Protected pages with sidebar

### Navigation
- Client-side navigation (Link, useRouter)
- URL state with nuqs (pagination, filters)
- Active route highlighting

## Styling

### Tailwind CSS 4
- Utility-first CSS
- Dark mode support
- Responsive design

### shadcn/ui
- New York style
- Accessible components
- Customizable themes

### Color Palette
- Primary: Gold/Amber accents
- Background: Dark theme
- Text: High contrast

## Performance

### Bundle Optimization
- Tree-shaking (13 packages)
- Code splitting (Recharts, ExcelJS, @zxing)
- Dynamic imports
- Bundle analyzer: `npm run build:analyze`

### Caching
- React Query: 5min stale time
- Static assets: 1 year
- Image optimization (AVIF/WebP)

## Security

### Authentication
- Supabase Auth
- Session management
- Protected routes

### Row Level Security (RLS)
- Database-level permissions
- User-based access control

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# API
NEXT_PUBLIC_API_URL=
```

## Development Workflow

```bash
# Development
npm run dev

# Build
npm run build

# Test
npm run test
npm run test:e2e

# Lint
npm run lint
npm run format
```

## Related Docs

- [WORKFLOW.md](./WORKFLOW.md) - Business workflows
- [DATA_MODEL.md](./DATA_MODEL.md) - Data models
- [SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md) - Database setup
