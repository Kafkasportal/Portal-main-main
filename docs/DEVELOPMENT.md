# 🛠️ Development Guide for Kafkasder Management Panel

Comprehensive guide for developers working on Kafkasder Management Panel project.

---

## 📋 Table of Contents
1. [Getting Started](#getting-started)
2. [Project Setup](#project-setup)
3. [Architecture](#architecture)
4. [Tech Stack](#tech-stack)
5. [Development Workflow](#development-workflow)
6. [Backend Development](#backend-development)
7. [Frontend Development](#frontend-development)
8. [Supabase Integration](#supabase-integration)
9. [Performance Optimization](#performance-optimization)
10. [Code Organization](#code-organization)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20 or higher
- **Package Manager**: npm v10+ or pnpm
- **Git**: Latest version
- **Editor**: VS Code (recommended) with extensions

### VS Code Extensions (Recommended)

- **ESLint**: Linting
- **Prettier**: Code formatting
- **TypeScript Importer**: Auto imports
- **Tailwind CSS IntelliSense**: Class autocomplete
- **Vitest**: Test runner
- **Thunder Client**: GraphQL (if needed)

### First-Time Setup

```bash
# Clone repository
git clone https://github.com/Kafkasportal/Portal-main.git
cd Portal-main

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Update .env.local with your credentials
nano .env.local

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

Application will be available at http://localhost:3000

---

## 🏗️ Project Setup

### Environment Variables

Create `.env.local` file in project root:

```bash
# ============================================
# Supabase Configuration
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ============================================
# Sentry Monitoring (Optional)
# ============================================
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project
SENTRY_ORG=your-organization
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-auth-token

# ============================================
# Development Options
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_USE_MOCK_API=true  # Use mock data without Supabase
SKIP_TYPE_CHECK=false              # Skip TypeScript checks (for debugging)
```

### .env.example

Template for `.env.local` - never commit actual secrets:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-auth-token

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_USE_MOCK_API=false
```

---

## 🏗 Architecture

### Project Structure

```
Portal-main-main/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Public auth routes
│   │   │   ├── giris/          # Login page
│   │   │   ├── kayit/          # Registration page
│   │   │   └── layout.tsx       # Auth layout
│   │   ├── (dashboard)/         # Protected routes
│   │   │   ├── genel/           # Dashboard
│   │   │   ├── uyeler/          # Members
│   │   │   ├── bagis/           # Donations
│   │   │   ├── sosyal-yardim/    # Social aid
│   │   │   ├── ayarlar/        # Settings
│   │   │   └── layout.tsx       # Dashboard layout (sidebar)
│   │   ├── api/                 # API routes
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Landing page
│   │   └── globals.css          # Global styles
│   │
│   ├── components/
│   │   ├── analytics/            # Analytics components
│   │   ├── features/            # Feature-specific components
│   │   │   ├── charts/         # Recharts components
│   │   │   ├── documents/      # Document management
│   │   │   ├── donations/      # Donation features
│   │   │   ├── hospitals/      # Hospital features
│   │   │   ├── kumbara/        # Collection box features
│   │   │   ├── members/        # Member features
│   │   │   ├── referrals/      # Referral features
│   │   │   ├── settings/       # Settings features
│   │   │   └── social-aid/     # Social aid features
│   │   ├── layout/              # Layout components
│   │   │   ├── sidebar/        # Sidebar component
│   │   │   └── header/         # Header component
│   │   ├── shared/              # Reusable components
│   │   │   ├── data-table/      # TanStack Table wrapper
│   │   │   ├── error-boundary/  # Error boundary
│   │   │   └── stat-card/      # Stats cards
│   │   └── ui/                 # shadcn/ui primitives
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── form.tsx
│   │       └── ...
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── use-api.ts           # API hook
│   │   ├── use-csrf-token.ts   # CSRF token hook
│   │   ├── use-debounce.ts     # Debounce hook
│   │   ├── use-device.ts        # Device detection
│   │   ├── use-permissions.ts   # Permission hook
│   │   ├── useScanSync.ts      # Scan queue sync
│   │   └── ...
│   │
│   ├── lib/                      # Utilities and configurations
│   │   ├── analytics-service.ts # Analytics service
│   │   ├── constants.ts         # App constants
│   │   ├── csrf/               # CSRF utilities
│   │   ├── db/                 # Database utilities
│   │   ├── error-logger.ts      # Error logging
│   │   ├── export/             # Export utilities
│   │   ├── security/           # Security utilities
│   │   ├── sentry/             # Sentry config
│   │   ├── services/            # Business logic
│   │   ├── supabase/           # Supabase clients
│   │   ├── validation/          # Validation utilities
│   │   └── utils.ts            # General utilities
│   │
│   ├── providers/                # React providers
│   │   └── query-provider.tsx   # TanStack Query provider
│   │
│   ├── stores/                   # Zustand stores
│   │   ├── sidebar-store.ts     # Sidebar state
│   │   ├── user-store.ts        # User state
│   │   └── scan-queue-store.ts  # Scan queue state
│   │
│   ├── types/                    # TypeScript definitions
│   │   ├── env.d.ts            # Environment types
│   │   ├── index.ts             # Main types
│   │   ├── rbac.ts             # RBAC types
│   │   └── supabase.ts         # Supabase types
│   │
│   └── test/                     # Test setup
│       └── setup.ts
│
├── supabase/
│   ├── migrations/               # Database migrations
│   │   ├── 0001_initial_schema.sql
│   │   ├── 0002_rls_policies.sql
│   │   └── ...
│   ├── functions/                # Edge functions
│   └── seed.sql                 # Seed data
│
├── tests/                       # Playwright E2E tests
│   ├── auth.spec.ts
│   ├── donations.spec.ts
│   └── ...
│
├── scripts/                     # Utility scripts
│   ├── auto-migrate.js
│   ├── create-user.ts
│   └── ...
│
├── docs/                        # Documentation
│   ├── AGENTS.md
│   ├── CONTRIBUTING.md
│   ├── DEVELOPMENT.md
│   ├── PRODUCTION.md
│   ├── SECURITY.md
│   ├── TESTING.md
│   └── USER_GUIDE.md
│
├── public/                      # Static assets
│   ├── favicon.ico
│   └── ...
│
├── .env.example                 # Environment template
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
├── vitest.config.ts           # Vitest configuration
├── playwright.config.ts        # Playwright configuration
└── package.json                # Dependencies
```

### Key Patterns

#### Route Groups

- **(auth)**: Public routes (login, register, forgot password)
  - No authentication required
  - Centered layout
  - Redirects to dashboard after auth

- **(dashboard)**: Protected routes
  - Authentication required
  - Sidebar layout
  - Access controlled by RBAC

#### Component Organization

```typescript
// Features: Domain-specific components
components/features/donations/
  ├── DonationForm.tsx         # Form component
  ├── DonationList.tsx          # List component
  ├── DonationCard.tsx          # Display component
  └── columns.tsx              # Table columns

// Shared: Reusable across features
components/shared/
  ├── DataTable.tsx            # Generic data table
  ├── PageHeader.tsx           # Standard page header
  ├── EmptyState.tsx           # Empty state display
  └── StatCard.tsx            # Statistics card
```

---

## 💻 Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|----------|---------|
| **Next.js** | 16.1.1 | React framework with SSR |
| **React** | 19.2.3 | UI library |
| **TypeScript** | 5.9.3 | Type safety |
| **Tailwind CSS** | 4.0 | Styling |
| **shadcn/ui** | Latest | UI components |
| **Radix UI** | Latest | Headless UI primitives |
| **Lucide React** | Latest | Icons |

### State Management

| Technology | Purpose | Usage |
|------------|---------|-------|
| **Zustand** | 5.0.9 | Client global state |
| **TanStack Query** | 5.90.12 | Server state caching |
| **nuqs** | Latest | URL state management |
| **React Hook Form** | 7.69.0 | Form state |
| **Zod** | Latest | Form validation |

### Backend & Database

| Technology | Version | Purpose |
|------------|----------|---------|
| **Supabase** | 2.89.0 | BaaS platform |
| **PostgreSQL** | 17.6.1 | Database |
| **Supabase Auth** | Latest | Authentication |
| **Supabase Storage** | Latest | File storage |
| **Supabase Realtime** | Latest | Real-time updates |

### Testing

| Technology | Version | Purpose |
|------------|----------|---------|
| **Vitest** | Latest | Unit testing |
| **React Testing Library** | Latest | Component testing |
| **Playwright** | Latest | E2E testing |
| **Jest DOM** | Latest | DOM matchers |

### DevOps & Quality

| Technology | Purpose |
|------------|---------|
| **GitHub Actions** | CI/CD |
| **SonarCloud** | Code quality |
| **Sentry** | Error tracking |
| **Render.com** | Hosting |

---

## 🔄 Development Workflow

### Daily Commands

```bash
# Start development
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Testing
npm run test

# Build
npm run build
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/your-feature

# Create pull request
# Via GitHub interface
```

### Branch Naming

- `feature/feature-name`: New features
- `fix/issue-description`: Bug fixes
- `refactor/component-name`: Code refactoring
- `docs/documentation-update`: Documentation changes
- `test/feature-name`: Test additions

### Commit Message Format

```bash
type(scope): description

# Examples:
feat(donations): add export to Excel
fix(auth): resolve session refresh issue
docs(readme): update installation guide
refactor(members): optimize table rendering
test(api): add donation endpoint tests
```

---

## 🗄️ Backend Development

### API Routes

API routes in `src/app/api/`:

```typescript
// src/app/api/members/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  // Check authentication
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Query database
  const { data: members } = await supabase
    .from('members')
    .select('*')

  return NextResponse.json({ members })
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  
  // Validate input
  const validated = memberSchema.parse(body)
  
  // Insert into database
  const { data, error } = await supabase
    .from('members')
    .insert(validated)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
```

### Database Functions (RPC)

Supabase RPC functions for complex queries:

```sql
-- supabase/migrations/000x_dashboard_stats.sql
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  -- Security check
  IF NOT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid()
  ) THEN
    RETURN NULL;
  END IF;

  -- Business logic
  SELECT json_build_object(
    'totalMembers', (SELECT COUNT(*) FROM members WHERE durum = 'aktif'),
    'totalDonations', (SELECT COALESCE(SUM(tutar), 0) FROM bagislar),
    'activeBeneficiaries', (SELECT COUNT(*) FROM ihtiyac_sahipleri WHERE durum = 'aktif')
  ) INTO result;

  RETURN result;
END;
$$;
```

**Usage in TypeScript:**

```typescript
const { data: stats } = await supabase
  .rpc('get_dashboard_stats')

console.log(stats.totalMembers)
```

### Bulk Operations

For performance-critical operations, use Supabase client's batch operations:

```typescript
// Bulk insert
const records = [
  { ad: 'Test1', soyad: 'User1' },
  { ad: 'Test2', soyad: 'User2' },
  { ad: 'Test3', soyad: 'User3' }
]

const { data, error } = await supabase
  .from('members')
  .insert(records)
  .select()
```

### Data Export

Excel export functionality:

```typescript
import { utils, writeFile } from 'xlsx'

async function exportToExcel(data: any[], filename: string) {
  const worksheet = utils.json_to_sheet(data)
  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, worksheet, 'Data')
  
  const excelBuffer = writeFile(workbook, { bookType: 'xlsx' })
  return new Blob([excelBuffer], { type: 'application/octet-stream' })
}
```

---

## 🎨 Frontend Development

### Component Structure

```typescript
// components/features/donations/DonationForm.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { donationSchema } from '@/lib/validators'

export function DonationForm() {
  const form = useForm<z.infer<typeof donationSchema>>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      tutar: '',
      bagisci_adi: '',
      odeme_yontemi: 'nakit'
    }
  })

  const onSubmit = async (data: z.infer<typeof donationSchema>) => {
    const response = await fetch('/api/donations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    if (response.ok) {
      // Handle success
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="tutar"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Kaydet</Button>
      </form>
    </Form>
  )
}
```

### Data Table Components

Using TanStack Table with shadcn/ui:

```typescript
// components/features/donations/columns.tsx
import { ColumnDef } from '@tanstack/react-table'

export const columns: ColumnDef<Donation>[] = [
  {
    accessorKey: 'tarih',
    header: 'Tarih',
    cell: ({ row }) => formatDate(row.original.tarih)
  },
  {
    accessorKey: 'bagisci_adi',
    header: 'Bağışçı',
    cell: ({ row }) => row.original.bagisci_adi
  },
  {
    accessorKey: 'tutar',
    header: 'Tutar',
    cell: ({ row }) => formatCurrency(row.original.tutar)
  },
  {
    accessorKey: 'actions',
    header: 'İşlemler',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">•••</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Düzenle</DropdownMenuItem>
          <DropdownMenuItem>Sil</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
]
```

### State Management

**Zustand for Client State:**

```typescript
// stores/sidebar-store.ts
import { create } from 'zustand'

interface SidebarState {
  isOpen: boolean
  toggle: () => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen }))
}))
```

**TanStack Query for Server State:**

```typescript
// In component
import { useQuery } from '@tanstack/react-query'

function DonationsList() {
  const { data: donations, isLoading, error } = useQuery({
    queryKey: ['donations'],
    queryFn: async () => {
      const response = await fetch('/api/donations')
      return response.json()
    }
  })

  if (isLoading) return <Loading />
  if (error) return <Error message={error.message} />

  return (
    <DataTable columns={columns} data={donations || []} />
  )
}
```

**URL State with nuqs:**

```typescript
import { useQueryState } from 'nuqs'

function DonationsPage() {
  const [page, setPage] = useQueryState('page', 1)
  const [search, setSearch] = useQueryState('search', '')

  // Updates URL automatically
  const handleSearch = (value: string) => {
    setSearch(value)
  }
}
```

---

## 🗄️ Supabase Integration

### Client-Side

```typescript
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Usage
const { data, error } = await supabase
  .from('members')
  .select('*')
  .eq('id', memberId)
```

### Server-Side

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options })
        }
      }
    }
  )
}

// Usage in API route
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### MCP Integration

Using Supabase MCP for database operations:

```typescript
// Available MCP functions
- mcp_new_execute_sql()        // Run custom SQL
- mcp_new_apply_migration()      // Apply migrations
- mcp_new_list_tables()         // List all tables
- mcp_new_list_extensions()      // List database extensions
- mcp_new_list_migrations()     // List migrations
```

---

## ⚡ Performance Optimization

### Dashboard Stats RPC

Optimized database function for dashboard stats:

```sql
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS json
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  -- Single optimized query
  SELECT json_build_object(
    'totalMembers', (SELECT COUNT(*) FROM members WHERE durum = 'aktif'),
    'totalDonations', (SELECT COALESCE(SUM(tutar), 0) FROM bagislar),
    'activeBeneficiaries', (SELECT COUNT(*) FROM ihtiyac_sahipleri WHERE durum = 'aktif')
  ) INTO result;

  RETURN result;
END;
$$;
```

**Usage:**

```typescript
const { data: stats } = await supabase.rpc('get_dashboard_stats')
```

### Database Indexes

Critical indexes for performance:

```sql
-- Members table
CREATE INDEX idx_members_durum ON members(durum);
CREATE INDEX idx_members_adi_soyad ON members(adi, soyad);

-- Donations table
CREATE INDEX idx_donations_tarih ON bagislar(tarih DESC);
CREATE INDEX idx_donations_bagisci ON bagislar(bagisci_adi);

-- Beneficiaries table
CREATE INDEX idx_beneficiaries_durum ON ihtiyac_sahipleri(durum);
CREATE INDEX idx_beneficiaries_kategori ON ihtiyac_sahipleri(kategori);
```

### TanStack Query Caching

```typescript
const { data } = useQuery({
  queryKey: ['dashboard-stats'],
  queryFn: fetchDashboardStats,
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
})
```

### Lazy Loading Components

```typescript
import dynamic from 'next/dynamic'

// Lazy load heavy components
const DonationChart = dynamic(() => 
  import('@/components/analytics/donation-chart').then(mod => mod.default),
  { loading: () => <ChartSkeleton /> }
)
```

---

## 📂 Code Organization

### File Naming Conventions

- **Components**: PascalCase (e.g., `DonationForm.tsx`)
- **Utilities**: camelCase (e.g., `formatCurrency.ts`)
- **Hooks**: camelCase with `use` prefix (e.g., `useDonations.ts`)
- **Types**: camelCase or PascalCase (e.g., `donation.ts` or `Donation.ts`)
- **API Routes**: lowercase with descriptive names (e.g., `/api/donations/route.ts`)

### Import Organization

```typescript
// 1. External libraries
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'

// 2. Internal utilities
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'

// 3. Components (local to distant)
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/shared/data-table'

// 4. Types
import type { Donation } from '@/types'
```

### Folder Structure Guidelines

- Keep components under 200 lines when possible
- Split large components into smaller sub-components
- Group related files in feature folders
- Keep test files next to source files

---

## 📚 Additional Resources

### Documentation

- **Agent Guide**: `/docs/AGENTS.md`
- **Contributing**: `/docs/CONTRIBUTING.md`
- **Security**: `/docs/SECURITY.md`
- **Production**: `/docs/PRODUCTION.md`
- **Testing**: `/docs/TESTING.md`
- **User Guide**: `/docs/USER_GUIDE.md`

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)

---

**Last Updated**: January 4, 2026  
**Version**: 1.0.0  
**Maintained By**: KafkasDer Development Team 🛠️

