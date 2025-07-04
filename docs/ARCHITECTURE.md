# Architecture Documentation

## Overview

Think AI is built as a modern SaaS application using Next.js 15 App Router with a clear separation of concerns and role-based access control. The platform is designed for scalability, security, and optimal developer experience.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Browser                           │
├─────────────────────────────────────────────────────────────────┤
│                    Next.js App Router (React 19)                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Public Routes  │  │ Protected Routes │  │   API Routes    │ │
│  │  (Marketing)    │  │   (Dashboard)    │  │  (Webhooks)     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                       Middleware Layer                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Clerk Auth      │  │ Role Protection  │  │ Route Guards    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                      Server Actions Layer                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Customer Actions │  │ Stripe Actions  │  │ Project Actions │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                        Data Layer                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Drizzle ORM    │  │   PostgreSQL    │  │   Supabase      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                     External Services                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │     Clerk       │  │     Stripe      │  │   AI Services   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
think-ai/
├── app/                          # Next.js App Router
│   ├── (authenticated)/          # Protected routes
│   │   ├── dashboard/           # Main dashboard
│   │   │   ├── _components/     # Dashboard components
│   │   │   ├── analytics/       # Analytics module
│   │   │   ├── projects/        # Projects module
│   │   │   ├── scripts/         # Scripts module
│   │   │   ├── storyboards/     # Storyboards module
│   │   │   └── team/           # Team management
│   │   └── role-selection/      # Post-signup role config
│   ├── (unauthenticated)/        # Public routes
│   │   ├── (marketing)/         # Marketing pages
│   │   │   ├── (auth)/         # Auth flows
│   │   │   ├── about/          # About page
│   │   │   ├── contact/        # Contact page
│   │   │   ├── features/       # Features page
│   │   │   └── pricing/        # Pricing page
│   │   └── layout.tsx          # Public layout
│   └── api/                      # API endpoints
│       └── stripe/              # Stripe webhooks
├── components/                   # Reusable components
│   ├── auth/                    # Auth components
│   ├── payments/                # Payment components
│   ├── ui/                      # Shadcn UI components
│   └── markdown-renderer.tsx    # Utility components
├── db/                          # Database layer
│   ├── schema/                  # Drizzle schemas
│   ├── migrations/              # Database migrations
│   └── seed.ts                  # Seed data
├── actions/                     # Server actions
│   ├── customers.ts             # Customer operations
│   └── stripe.ts                # Stripe operations
├── lib/                         # Utilities
│   ├── roles.ts                 # Role management
│   ├── stripe.ts                # Stripe config
│   └── utils.ts                 # General utilities
├── hooks/                       # React hooks
│   ├── use-roles.ts             # Role checking
│   ├── use-project-access.ts    # Project access
│   └── use-mobile.tsx           # Mobile detection
└── types/                       # TypeScript types
    └── globals.d.ts             # Global type definitions
```

## Core Components

### 1. Authentication Layer

**Technology**: Clerk

The authentication system uses Clerk's metadata approach for role-based access control:

```typescript
// User metadata structure
{
  publicMetadata: {
    role: 'admin' | 'writer' | 'producer' | 'director' | 'storyboard_artist' | 'team_member',
    permissions: string[],
    projectAccess: string[]
  }
}
```

**Key Files**:
- `middleware.ts` - Route protection and role verification
- `lib/roles.ts` - Role and permission definitions
- `components/auth/role-gate.tsx` - Component-level access control

### 2. Database Layer

**Technology**: PostgreSQL with Drizzle ORM via Supabase

**Schema Overview**:

```sql
-- Customers table
customers {
  id: varchar (Clerk userId)
  email: varchar
  stripeId: varchar
  role: enum
  permissions: text[]
  projectAccess: text[]
  profile: jsonb
  subscriptionId: varchar
  priceId: varchar
  currentPeriodEnd: timestamp
}

-- Projects table
projects {
  id: uuid
  name: varchar
  description: text
  ownerId: varchar
  teamMembers: text[]
  status: varchar
  metadata: jsonb
}
```

### 3. Server Actions

Server actions handle all data mutations with built-in authentication and error handling:

```typescript
// Example server action pattern
export async function createCustomer(email: string) {
  const user = await currentUser()
  if (!user) throw new Error("Unauthorized")
  
  // Business logic with error handling
  try {
    const result = await db.insert(customers).values({...})
    return { data: result, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}
```

### 4. Role-Based Access Control (RBAC)

**Six User Roles**:

1. **Admin** - Full system access
2. **Writer** - Script creation and editing
3. **Producer** - Project management
4. **Director** - Creative oversight
5. **Storyboard Artist** - Visual planning
6. **Team Member** - Basic collaboration

**Permission System**:

```typescript
// Granular permissions
const permissions = [
  'projects:create',
  'projects:edit',
  'projects:delete',
  'scripts:create',
  'scripts:edit',
  'storyboards:create',
  'analytics:view',
  'team:manage',
  // ... 15+ permissions
]
```

### 5. UI Architecture

**Component Library**: Shadcn UI (New York style)

**Styling**: Tailwind CSS v4 with CSS variables

**Component Structure**:
```
components/
├── ui/                  # Base UI components
├── auth/                # Authentication components
├── payments/            # Payment components
└── dashboard/           # Dashboard-specific components
```

### 6. Payment Integration

**Technology**: Stripe

**Subscription Plans**:
- Indie Filmmaker ($29/month or $299/year)
- Studio Pro ($99/month or $999/year)

**Integration Points**:
- Checkout via Stripe Payment Links
- Webhook handling for subscription events
- Customer portal for subscription management

## Data Flow

### 1. Authentication Flow

```
User Login → Clerk Auth → Session Token → Middleware Check → Role Verification → Access Granted
```

### 2. Data Mutation Flow

```
Client Component → Server Action → Auth Check → Database Operation → Error Handling → Response
```

### 3. Subscription Flow

```
User Signup → Role Selection → Stripe Checkout → Webhook → Database Update → Access Granted
```

## Security Architecture

### 1. Route Protection

- Middleware-level authentication checks
- Role-based route guards
- Automatic redirects for unauthorized access

### 2. API Security

- Server action authentication
- Input validation
- SQL injection prevention via Drizzle ORM
- CSRF protection built into Next.js

### 3. Data Security

- Environment variable protection
- Secure session management via Clerk
- Encrypted database connections
- No client-side sensitive data exposure

## Performance Optimizations

### 1. Frontend Performance

- React Server Components for reduced bundle size
- Turbopack for faster development builds
- Image optimization with Next.js Image
- Code splitting at route level

### 2. Database Performance

- Connection pooling via Supabase
- Indexed queries for common operations
- Efficient schema design
- Query optimization in Drizzle

### 3. Caching Strategy

- Next.js built-in caching
- Static page generation for marketing pages
- Dynamic rendering for authenticated content
- Revalidation strategies for data freshness

## Deployment Architecture

### Production Environment

```
Vercel (Frontend) ← → Supabase (Database)
       ↓                    ↓
   Clerk Auth          PostgreSQL
       ↓
   Stripe API
```

### Environment Configuration

**Required Services**:
1. Vercel - Application hosting
2. Supabase - Database hosting
3. Clerk - Authentication
4. Stripe - Payments
5. Optional: OpenAI/Anthropic - AI features

## Monitoring and Observability

### 1. Error Tracking

- Vercel Analytics for performance metrics
- Console logging for development
- Structured error handling in server actions

### 2. User Analytics

- Role-based usage tracking
- Feature adoption metrics
- Performance monitoring

## Development Workflow

### 1. Local Development

```bash
# Start local database
npx supabase start

# Run development server
npm run dev
```

### 2. Testing Strategy

- Unit tests with Jest (configuration pending)
- E2E tests with Playwright (configuration pending)
- Manual testing for role-based features

### 3. Deployment Process

```bash
# Build and type check
npm run build
npm run types

# Deploy to Vercel
git push origin main
```

## Future Architecture Considerations

### 1. Scalability

- Horizontal scaling via Vercel
- Database read replicas for heavy loads
- CDN integration for global performance
- Queue system for AI processing

### 2. Microservices

- AI processing service separation
- Media storage service
- Real-time collaboration service

### 3. Advanced Features

- WebSocket integration for real-time updates
- GraphQL API for flexible data fetching
- Advanced caching with Redis
- Multi-tenancy support

## Architecture Decisions Record (ADR)

### ADR-001: Next.js App Router

**Decision**: Use Next.js 15 App Router
**Rationale**: Server components, better performance, modern React patterns
**Consequences**: Learning curve for team, better UX, reduced client bundle

### ADR-002: Clerk for Authentication

**Decision**: Use Clerk instead of custom auth
**Rationale**: Production-ready RBAC, reduced development time, security
**Consequences**: Vendor lock-in, monthly costs, less customization

### ADR-003: Drizzle ORM

**Decision**: Use Drizzle instead of Prisma
**Rationale**: Better TypeScript support, lighter weight, SQL-like syntax
**Consequences**: Smaller community, manual migrations

### ADR-004: Shadcn UI

**Decision**: Use Shadcn UI component library
**Rationale**: Customizable, accessible, well-maintained, owns the code
**Consequences**: Manual updates, more initial setup

This architecture provides a solid foundation for a scalable, secure, and maintainable film production platform with room for growth and enhancement.