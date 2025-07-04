# Development Workflow Guide

## Getting Started

This guide covers the development workflow for Think AI, including coding standards, best practices, and common development tasks.

## Development Environment

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "drizzle-team.drizzle-orm-vscode",
    "aaron-bond.better-comments",
    "usernamehw.errorlens"
  ]
}
```

### VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

## Development Commands

### Daily Development

```bash
# Start development server with Turbopack
npm run dev

# Start Supabase (if not running)
npx supabase start

# Watch for type errors
npm run types -- --watch
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format:write

# Run all fixes (recommended before commits)
npm run clean

# Type checking
npm run types
```

### Database Management

```bash
# After schema changes, push to local database
npx drizzle-kit push

# Generate migration files
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate

# Open database studio
open http://127.0.0.1:54323

# Reset database
npx supabase db reset

# Seed database
npx bun db/seed.ts
```

### Testing

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run e2e tests
npm run test:e2e

# Run tests in watch mode
npm run test:unit -- --watch
```

## Project Structure Guidelines

### File Organization

```
src/
├── app/                    # Next.js app directory
│   ├── (authenticated)/   # Protected routes
│   │   └── dashboard/     # Dashboard features
│   ├── (unauthenticated)/ # Public routes
│   └── api/               # API endpoints
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   └── [feature]/        # Feature-specific components
├── actions/              # Server actions
├── lib/                  # Utilities and helpers
├── hooks/                # Custom React hooks
├── types/                # TypeScript types
└── db/                   # Database schema
```

### Naming Conventions

#### Files and Folders

```typescript
// Components
components/ui/button.tsx              // lowercase with hyphens
components/auth/role-gate.tsx         // feature-component pattern

// Pages
app/(authenticated)/dashboard/page.tsx    // always page.tsx
app/(authenticated)/dashboard/layout.tsx  // always layout.tsx

// Server Actions
actions/customers.ts                  // plural, lowercase

// Utilities
lib/utils.ts                         // lowercase, descriptive
lib/roles.ts                         // domain-specific

// Hooks
hooks/use-roles.ts                   // use- prefix
hooks/use-mobile.tsx                 // .tsx if JSX
```

#### Code Conventions

```typescript
// Components - PascalCase
export function MyComponent() { }

// Functions - camelCase
export function myUtilityFunction() { }

// Constants - UPPER_SNAKE_CASE
export const API_URL = "https://api.example.com"

// Types/Interfaces - PascalCase
type UserRole = "admin" | "writer"
interface CustomerData { }

// Enums - PascalCase
enum Status {
  Active = "active",
  Inactive = "inactive"
}
```

## Common Development Tasks

### Adding a New Page

1. **Create the page file**:
   ```bash
   touch app/(authenticated)/dashboard/new-feature/page.tsx
   ```

2. **Add the page component**:
   ```typescript
   import { Metadata } from "next"
   
   export const metadata: Metadata = {
     title: "New Feature | Think AI",
     description: "Description of the new feature"
   }
   
   export default function NewFeaturePage() {
     return (
       <div>
         <h1>New Feature</h1>
         {/* Your content */}
       </div>
     )
   }
   ```

3. **Add navigation** (if needed):
   ```typescript
   // In app/(authenticated)/dashboard/_components/dashboard-sidebar.tsx
   {
     title: "New Feature",
     href: "/dashboard/new-feature",
     icon: <IconComponent />
   }
   ```

### Adding a New Component

1. **Create component file**:
   ```bash
   touch components/ui/new-component.tsx
   ```

2. **Install from Shadcn UI** (if available):
   ```bash
   npx shadcn@latest add dialog
   ```

3. **Create custom component**:
   ```typescript
   import { cn } from "@/lib/utils"
   
   interface NewComponentProps {
     className?: string
     children: React.ReactNode
   }
   
   export function NewComponent({ className, children }: NewComponentProps) {
     return (
       <div className={cn("default-styles", className)}>
         {children}
       </div>
     )
   }
   ```

### Adding a Server Action

1. **Create or update action file**:
   ```typescript
   // actions/projects.ts
   "use server"
   
   import { currentUser } from "@clerk/nextjs/server"
   import { db } from "@/db"
   import { projects } from "@/db/schema"
   import { checkPermission } from "@/lib/roles"
   
   export async function createProject(input: {
     name: string
     description?: string
   }) {
     // 1. Authentication
     const user = await currentUser()
     if (!user) {
       return { data: null, error: "Unauthorized" }
     }
     
     // 2. Permission check
     const canCreate = await checkPermission("projects:create")
     if (!canCreate) {
       return { data: null, error: "Insufficient permissions" }
     }
     
     // 3. Validation
     if (!input.name?.trim()) {
       return { data: null, error: "Name is required" }
     }
     
     try {
       // 4. Database operation
       const [project] = await db
         .insert(projects)
         .values({
           id: crypto.randomUUID(),
           name: input.name,
           description: input.description,
           ownerId: user.id,
         })
         .returning()
       
       return { data: project, error: null }
     } catch (error) {
       console.error("Failed to create project:", error)
       return { data: null, error: "Failed to create project" }
     }
   }
   ```

### Working with Database Schema

1. **Update schema**:
   ```typescript
   // db/schema/projects.ts
   import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
   
   export const projects = pgTable("projects", {
     id: uuid("id").primaryKey().defaultRandom(),
     name: text("name").notNull(),
     description: text("description"),
     ownerId: text("owner_id").notNull(),
     createdAt: timestamp("created_at").defaultNow(),
     updatedAt: timestamp("updated_at").defaultNow()
   })
   ```

2. **Generate types**:
   ```typescript
   export type Project = typeof projects.$inferSelect
   export type NewProject = typeof projects.$inferInsert
   ```

3. **Push changes**:
   ```bash
   npx drizzle-kit push
   ```

### Adding Role-Based Features

1. **Create role-gated component**:
   ```typescript
   import { RoleGate } from "@/components/auth/role-gate"
   
   export function AdminFeature() {
     return (
       <RoleGate roles={["admin"]}>
         <div>Admin only content</div>
       </RoleGate>
     )
   }
   ```

2. **Check permissions in server actions**:
   ```typescript
   import { checkRole, checkPermission } from "@/lib/roles"
   
   const isAdmin = await checkRole("admin")
   const canEdit = await checkPermission("projects:edit")
   ```

3. **Use role hooks**:
   ```typescript
   import { useRole } from "@/hooks/use-roles"
   
   export function MyComponent() {
     const { role, hasPermission } = useRole()
     
     if (!hasPermission("projects:view")) {
       return <div>No access</div>
     }
     
     return <div>Protected content</div>
   }
   ```

## Git Workflow

### Branch Naming

```bash
# Features
feature/add-project-search
feature/implement-ai-storyboards

# Bug fixes
fix/login-redirect-issue
fix/stripe-webhook-timeout

# Improvements
improve/dashboard-performance
refactor/auth-flow
```

### Commit Messages

Follow conventional commits:

```bash
# Features
feat: add project search functionality
feat(auth): implement role-based redirects

# Fixes
fix: resolve login redirect loop
fix(stripe): handle webhook timeout

# Improvements
refactor: optimize dashboard queries
style: update button hover states
docs: add API documentation

# Other
chore: update dependencies
test: add auth flow tests
```

### Pull Request Process

1. **Create feature branch**:
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make changes and commit**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. **Run checks before pushing**:
   ```bash
   npm run clean
   npm run types
   npm test
   ```

4. **Push and create PR**:
   ```bash
   git push -u origin feature/new-feature
   ```

## Debugging

### Client-Side Debugging

```typescript
// Use console with descriptive messages
console.log("[Dashboard] Loading user data:", userId)

// Use React DevTools
// Install: https://react.dev/learn/react-developer-tools

// Debug renders
import { useEffect } from "react"

useEffect(() => {
  console.log("[Component] Rendered with props:", props)
})
```

### Server-Side Debugging

```typescript
// In server actions
console.log("[Action] createProject called with:", input)

// In API routes
console.log("[API] Webhook received:", event.type)

// Database queries
console.log("[DB] Query result:", result)
```

### Common Issues

#### TypeScript Errors

```bash
# Clear cache and rebuild
rm -rf .next
npm run dev

# Check for type errors
npm run types
```

#### Database Issues

```bash
# Check if Supabase is running
npx supabase status

# Reset database
npx supabase db reset

# Check migrations
npx drizzle-kit studio
```

#### Authentication Issues

```typescript
// Debug Clerk user
const user = await currentUser()
console.log("Clerk user:", user)
console.log("Metadata:", user?.publicMetadata)
```

## Performance Best Practices

### 1. Use Server Components by Default

```typescript
// ✅ Good - Server Component
export default function ProductList() {
  const products = await getProducts()
  return <div>{/* render products */}</div>
}

// ❌ Avoid - Unnecessary Client Component
"use client"
export default function ProductList() {
  // Fetching in client
}
```

### 2. Optimize Images

```typescript
import Image from "next/image"

// ✅ Good
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority
/>

// ❌ Avoid
<img src="/hero.jpg" alt="Hero" />
```

### 3. Lazy Load Components

```typescript
import dynamic from "next/dynamic"

const HeavyComponent = dynamic(
  () => import("@/components/heavy-component"),
  { loading: () => <div>Loading...</div> }
)
```

### 4. Optimize Database Queries

```typescript
// ✅ Good - Select only needed columns
const users = await db
  .select({
    id: customers.id,
    email: customers.email
  })
  .from(customers)

// ❌ Avoid - Selecting all columns
const users = await db.select().from(customers)
```

## Security Best Practices

### 1. Always Validate Input

```typescript
import { z } from "zod"

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100)
})

export async function createUser(input: unknown) {
  const validated = schema.safeParse(input)
  if (!validated.success) {
    return { error: "Invalid input" }
  }
  // Continue with validated.data
}
```

### 2. Use Environment Variables

```typescript
// ✅ Good
const apiKey = process.env.STRIPE_SECRET_KEY

// ❌ Never hardcode secrets
const apiKey = "sk_test_123..."
```

### 3. Sanitize User Content

```typescript
import DOMPurify from "isomorphic-dompurify"

// When rendering user content
const clean = DOMPurify.sanitize(userContent)
```

## Deployment Checklist

Before deploying:

- [ ] Run `npm run clean`
- [ ] Run `npm run types`
- [ ] Run `npm test`
- [ ] Check environment variables
- [ ] Review database migrations
- [ ] Test critical user flows
- [ ] Update documentation
- [ ] Create PR and get review

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com)
- [Clerk Documentation](https://clerk.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [Supabase Documentation](https://supabase.com/docs)