# Environment Setup Guide

## Prerequisites

Before setting up Think AI, ensure you have the following installed:

- **Node.js** (v18.17 or higher) - [Download](https://nodejs.org/)
- **npm** (v10 or higher) - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- **Supabase CLI** - [Install Guide](https://supabase.com/docs/guides/cli)

Optional but recommended:
- **Bun** - For faster package installation and seed scripts [Install](https://bun.sh/)
- **VS Code** - Recommended IDE with TypeScript support

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd think-ai
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Or using bun (faster)
bun install
```

### 3. Environment Configuration

#### Create Environment File

```bash
cp .env.example .env.local
```

#### Required Environment Variables

Edit `.env.local` and add the following:

```bash
# ============================================
# DATABASE (Supabase)
# ============================================
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
# Access Supabase Studio at: http://127.0.0.1:54323

# ============================================
# AUTHENTICATION (Clerk)
# ============================================
# Get from: https://dashboard.clerk.com/
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# These URLs are fixed - do not change
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup

# ============================================
# PAYMENTS (Stripe)
# ============================================
# Get from: https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_...

# Webhook secret (see Stripe webhook setup below)
STRIPE_WEBHOOK_SECRET=whsec_...

# Payment Links (create in Stripe Dashboard)
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_YEARLY=https://buy.stripe.com/test_...
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_MONTHLY=https://buy.stripe.com/test_...

# ============================================
# AI SERVICES (Optional)
# ============================================
# For AI-powered features (script analysis, storyboards)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

### 4. Service Setup

#### Supabase (Database)

1. **Install Supabase CLI** (if not already installed):
   ```bash
   brew install supabase/tap/supabase
   ```

2. **Start Supabase locally**:
   ```bash
   npx supabase start
   ```

3. **Note the output** - You'll see:
   ```
   Started supabase local development setup.
   
   API URL: http://127.0.0.1:54321
   GraphQL URL: http://127.0.0.1:54321/graphql/v1
   DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
   Studio URL: http://127.0.0.1:54323
   ```

4. **Access Supabase Studio** at http://127.0.0.1:54323 to view your database

#### Clerk (Authentication)

1. **Create a Clerk account** at [clerk.com](https://clerk.com)

2. **Create a new application**:
   - Choose "Next.js" as your framework
   - Select "Email" and/or "Google" for authentication methods

3. **Get your API keys**:
   - Navigate to "API Keys" in Clerk Dashboard
   - Copy the Publishable Key and Secret Key

4. **Configure metadata permissions**:
   - Go to "User & Authentication" → "Email, Phone, Username"
   - Enable "Public metadata" under Advanced

5. **Set up webhook** (optional for production):
   - Add endpoint: `https://your-domain.com/api/clerk/webhook`
   - Select events: `user.created`, `user.updated`

#### Stripe (Payments)

1. **Create a Stripe account** at [stripe.com](https://stripe.com)

2. **Get API keys**:
   - Go to "Developers" → "API keys"
   - Copy the Secret key (starts with `sk_test_`)

3. **Create Products and Prices**:
   ```
   Indie Filmmaker Plan:
   - Monthly: $29/month
   - Yearly: $299/year (save $49)
   
   Studio Pro Plan:
   - Monthly: $99/month
   - Yearly: $999/year (save $189)
   ```

4. **Create Payment Links**:
   - Go to "Payment Links" in Stripe Dashboard
   - Create links for each plan (monthly and yearly)
   - Copy the payment link URLs

5. **Set up Webhook**:
   - Go to "Developers" → "Webhooks"
   - Add endpoint: `https://your-domain.com/api/stripe/webhooks`
   - Select events:
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copy the signing secret (starts with `whsec_`)

### 5. Database Setup

#### Initialize Database Schema

```bash
# Push schema to database
npx drizzle-kit push

# Or generate and run migrations
npx drizzle-kit generate
npx drizzle-kit migrate
```

#### Seed Database (Optional)

```bash
# Using bun (recommended)
npx bun db/seed.ts

# Or using tsx
npx tsx db/seed.ts
```

This creates sample data including:
- Test users with different roles
- Sample projects
- Mock subscription data

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Development Workflow

### Code Quality

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run types

# Format code
npm run format:write

# Run all fixes
npm run clean
```

### Database Management

```bash
# View database studio
open http://127.0.0.1:54323

# Generate migrations after schema changes
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate

# Push schema changes (development)
npx drizzle-kit push

# Reset database
npx supabase db reset
```

### Testing Stripe Webhooks Locally

1. **Install Stripe CLI**:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. **Login to Stripe**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to localhost**:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhooks
   ```

4. **Copy the webhook signing secret** shown in the output

5. **Update `.env.local`** with the new `STRIPE_WEBHOOK_SECRET`

### Common Issues and Solutions

#### Issue: Database connection failed

**Solution**: Ensure Supabase is running
```bash
npx supabase start
```

#### Issue: Clerk authentication not working

**Solution**: Check that:
- API keys are correct in `.env.local`
- URLs are set correctly (no trailing slashes)
- Public metadata is enabled in Clerk dashboard

#### Issue: Stripe webhooks failing

**Solution**: 
- Ensure webhook secret is correct
- Check that Stripe CLI is forwarding to the correct URL
- Verify webhook events are selected in Stripe dashboard

#### Issue: TypeScript errors

**Solution**:
```bash
# Clear TypeScript cache
rm -rf .next
npm run dev
```

## Production Deployment

### Vercel Deployment

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository

3. **Configure Environment Variables**:
   - Add all variables from `.env.local`
   - Use production keys instead of test keys

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete

### Post-Deployment

1. **Update Clerk URLs**:
   - Add production domain to Clerk allowed origins

2. **Update Stripe Webhook**:
   - Create production webhook with your Vercel URL
   - Update `STRIPE_WEBHOOK_SECRET` in Vercel

3. **Set up Supabase Production**:
   - Create a Supabase project
   - Run migrations on production database
   - Update `DATABASE_URL` in Vercel

## Environment Variable Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://...` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk public key | `pk_test_...` |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key | `sk_test_...` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Yes | Sign in route | `/login` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Yes | Sign up route | `/signup` |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook secret | `whsec_...` |
| `NEXT_PUBLIC_STRIPE_PAYMENT_LINK_YEARLY` | Yes | Yearly plan link | `https://buy.stripe.com/...` |
| `NEXT_PUBLIC_STRIPE_PAYMENT_LINK_MONTHLY` | Yes | Monthly plan link | `https://buy.stripe.com/...` |
| `OPENAI_API_KEY` | No | OpenAI API key | `sk-...` |
| `ANTHROPIC_API_KEY` | No | Anthropic API key | `sk-ant-...` |

## Next Steps

After successful setup:

1. **Explore the codebase** - Check `/docs/ARCHITECTURE.md`
2. **Understand the API** - Read `/docs/API.md`
3. **Learn the development workflow** - See `/docs/DEVELOPMENT.md`
4. **Review role-based auth** - Read `/ROLE_BASED_AUTH_REPORT.md`

## Support

If you encounter issues:

1. Check the [troubleshooting section](#common-issues-and-solutions)
2. Review logs in the console
3. Check service dashboards (Clerk, Stripe, Supabase)
4. Open an issue on GitHub with:
   - Error messages
   - Steps to reproduce
   - Environment details