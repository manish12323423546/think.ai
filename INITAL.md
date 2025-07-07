## FEATURE:
[Describe the specific feature you want to add to Think AI. Be clear and specific about functionality.]

Example: "Add AI-powered script breakdown analysis to extract characters, props, and locations from uploaded scripts"

## INTEGRATION WITH EXISTING:
[Explain how this feature should integrate with the current Think AI codebase. What existing components will it interact with?]

Example: 
- Must work with existing role-based access control system (lib/roles.ts)
- Should integrate with existing project management in db/schema/projects.sql
- Need to add new dashboard components following existing patterns in app/(authenticated)/dashboard
- Must respect user permissions defined in hooks/use-roles.ts

## EXAMPLES FROM EXISTING CODE:
[Reference existing files/patterns in the Think AI codebase that this feature should follow. This helps AI understand your coding style and patterns.]

Example:
- Follow server action pattern from actions/customers.ts with timeout protection
- Use existing error handling: return { isSuccess: boolean, data: any }
- Follow existing component structure in components/auth/role-gate.tsx
- Use existing database patterns from db/schema/ with Drizzle ORM
- Follow existing dashboard layout patterns in dashboard/_components/dashboards/

## EXISTING DEPENDENCIES TO USE:
[List current libraries, frameworks, databases that this feature should use. Don't introduce new dependencies unless necessary.]

Current Tech Stack:
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS + Shadcn UI components
- Clerk (authentication)
- Supabase (PostgreSQL database)
- Drizzle ORM
- Stripe (payments)
- Framer Motion (animations)
- Server Actions (data mutations)

## OTHER CONSIDERATIONS:
[Any gotchas, specific requirements, or things AI assistants commonly miss with Think AI project.]

Example:
- All server actions must include 5-second timeout protection
- Never throw errors in server actions - always return { isSuccess, data }
- Role-based access control is critical - check permissions before any operation
- Use <RoleGate> component for conditional rendering based on user roles
- All protected routes are in app/(authenticated)/ directory
- Database operations use Drizzle ORM with PostgreSQL
- Follow existing authentication flow: Signup → Role selection → Dashboard
- All components requiring interactivity need "use client" directive
- Run npm run clean before commits to ensure code quality
- Use npx supabase start for local development database
