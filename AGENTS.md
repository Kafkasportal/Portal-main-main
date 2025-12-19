# AGENTS.md

## Build & Development Commands

- **Dev server**: `npm run dev` (runs Next.js on port 3000)
- **Build**: `npm run build`
- **Start production**: `npm start`
- **Lint**: `eslint` (ESLint configured with Next.js and TypeScript rules)
- **Single test**: No testing framework configured (add Jest/Vitest if needed)

## Architecture & Codebase

**Tech Stack**: Next.js 16 + React 19, TypeScript, Tailwind CSS, Radix UI, TanStack Query/Table, Zustand

**Directory Structure**:
- `src/app/` - Next.js App Router (auth/dashboard routes)
- `src/components/` - React components (features/, layout/, shared/, ui/)
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utilities, validators, mock data
- `src/providers/` - Context/provider setup
- `src/stores/` - Zustand state management
- `src/types/` - TypeScript type definitions
- `src/middleware.ts` - Next.js middleware

**Database**: None (mock service in `src/lib/mock-service.ts`)

## Code Style & Conventions

- **TypeScript**: Strict mode enabled, target ES2017
- **Path alias**: `@/*` maps to `src/*`
- **Linting**: ESLint with Next.js web vitals + TypeScript config
- **UI Framework**: Radix UI + Tailwind CSS with CVA for components
- **Forms**: React Hook Form + Zod validation
- **State**: Zustand for global state, React Query for server state
- **Formatting**: Use Tailwind CSS classes, follow Next.js conventions
- **Error handling**: Error boundary (`error.tsx`), not-found page (`not-found.tsx`)
- **Naming**: camelCase for variables/functions, PascalCase for React components
- **Imports**: Organize by external libs, then internal modules

## Custom Rules

See `.claude/agents/ux-design-developer.md` for UX design-specific guidelines and agent configuration.
