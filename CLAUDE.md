# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the Think AI platform codebase.

## Commands

### Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run types` - Run TypeScript type checking
- `npm run format:write` - Format code with Prettier
- `npm run clean` - Run both lint:fix and format:write

### Database
- `npx drizzle-kit push` - Push schema changes to database
- `npx drizzle-kit generate` - Generate migration files
- `npx drizzle-kit migrate` - Run migrations
- `npx bun db/seed` - Seed database
- `npx supabase start` - Start local Supabase instance

### Testing
- `npm run test` - Run all tests (unit + e2e)
- `npm run test:unit` - Run Jest unit tests
- `npm run test:e2e` - Run Playwright e2e tests

### Shadcn UI Components
- `npx shadcn@latest add [component-name]` - Install new Shadcn UI components

## Architecture

Think AI is a Next.js 15 film pre-production platform using the App Router with clear separation between authenticated and unauthenticated routes.

### Route Structure
- `/app/(unauthenticated)` - Public routes
  - `(marketing)` - Landing pages, pricing, features, about, contact
  - `(auth)` - Login and signup flows
- `/app/(authenticated)` - Protected routes requiring Clerk auth
  - `dashboard` - Main application with projects, scripts, production tools
- `/app/api` - API routes including Stripe webhook handler

### Key Patterns
- **Server Actions** in `/actions` for data mutations (customers, Stripe operations)
- **Database Schema** in `/db/schema` using Drizzle ORM with PostgreSQL
- **UI Components** in `/components/ui` from Shadcn UI library
- **Authentication** handled by Clerk middleware with protected route groups
- **Payments** integrated via Stripe with webhook handling for subscriptions

### Film Production Features
- **AI Script Analysis**: Automated script breakdown and metadata extraction
- **Smart Scheduling**: AI-powered scene scheduling optimization
- **Budget Automation**: Intelligent budget estimation and planning
- **Storyboard Generation**: AI-powered visual storyboard creation
- **Team Collaboration**: Role-based access for film production teams
- **Production Analytics**: Comprehensive project insights and reporting

### Data Flow
1. Authentication state managed by Clerk (`@clerk/nextjs`)
2. Customer and project data stored in PostgreSQL via Drizzle ORM
3. Stripe integration for subscription management (Indie Filmmaker, Studio Pro plans)
4. Server actions handle all data mutations with proper auth checks
5. AI services integration for film production automation

### Environment Variables Required
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `OPENAI_API_KEY` - OpenAI API for AI features (optional)
- `ANTHROPIC_API_KEY` - Anthropic API for AI features (optional)
- Database connection handled by Supabase CLI