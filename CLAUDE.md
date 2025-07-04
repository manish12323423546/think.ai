# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npx supabase start` - Start local Supabase (required before dev)

### Code Quality
- `npm run clean` - Fix linting and format code (run before commits)
- `npm run lint` - Run ESLint
- `npm run types` - Run TypeScript type checking
- `npm run format:write` - Format code with Prettier

### Database
- `npx drizzle-kit push` - Push schema changes to database
- `npx drizzle-kit generate` - Generate migration files
- `npx drizzle-kit migrate` - Run migrations
- `npx bun db/seed.ts` - Seed database with test data
- `npx supabase db reset` - Reset database

### Testing
- `npm run test` - Run all tests (note: test configs not yet implemented)
- `npm run test:unit` - Run Jest unit tests
- `npm run test:e2e` - Run Playwright e2e tests

### UI Components
- `npx shadcn@latest add [component-name]` - Install Shadcn UI components

## Architecture

Think AI is a Next.js 15 film pre-production platform with role-based access control (RBAC) and AI-powered production tools.

### Critical Architecture Patterns

#### Role-Based Access Control
The platform implements 6 distinct user roles stored in Clerk metadata:
- **admin** - Full system access, user management
- **writer** - Script creation/editing, story development
- **producer** - Project management, team coordination
- **director** - Creative oversight, approval workflows
- **storyboard_artist** - Visual planning, storyboard creation
- **team_member** - Basic viewing, collaboration

Role checking patterns:
```typescript
// Client-side: hooks/use-roles.ts
const { role, hasPermission } = useRole()

// Server-side: lib/roles.ts
const canEdit = await checkPermission("projects:edit")

// Component gating: components/auth/role-gate.tsx
<RoleGate roles={["admin", "producer"]} />
```

#### Server Action Error Handling
All server actions follow a resilient pattern with timeouts and safe defaults:
```typescript
// Pattern used in actions/customers.ts
try {
  const result = await Promise.race([
    dbQuery(),
    timeout(5000)
  ])
  return { isSuccess: true, data: result }
} catch (error) {
  // Return safe default, never throw
  return { isSuccess: false, data: defaultObject }
}
```

#### Database Schema
- PostgreSQL via Supabase with Drizzle ORM
- Main tables: `customers` (users) and `projects`
- Role stored as enum, permissions as text array
- All IDs are UUIDs, timestamps auto-managed

### Route Structure
- `/app/(unauthenticated)` - Public marketing and auth pages
- `/app/(authenticated)/dashboard` - Protected app routes
- `/app/api/stripe/webhooks` - Stripe webhook handler
- Middleware protects `/dashboard/*` routes

### Key Implementation Details

1. **Authentication Flow**
   - Signup → Role selection page → Dashboard
   - Roles stored in Clerk `unsafeMetadata.role`
   - Permissions auto-assigned from `ROLE_PERMISSIONS` map

2. **Data Mutations**
   - Always use server actions in `/actions`
   - Never throw errors - return `{ isSuccess, data }`
   - Include 5-second timeout protection

3. **Component Patterns**
   - Role-specific dashboards in `dashboard/_components/dashboards/`
   - Use `<RoleGate>` for conditional rendering
   - Client components must have `"use client"` directive

4. **Stripe Integration**
   - Payment links for subscriptions (not embedded checkout)
   - Webhook handles subscription lifecycle
   - Customer portal for subscription management

### Environment Setup
Required services: Supabase (local), Clerk, Stripe
See `.env.example` for all required variables

### Important Files
- `middleware.ts` - Route protection logic
- `lib/roles.ts` - Role definitions and permissions
- `db/schema/` - Database structure
- `components/auth/role-gate.tsx` - Permission components