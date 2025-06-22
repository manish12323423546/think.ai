# Think AI - Film Pre-Production Platform

Think AI is an advanced AI-powered platform that revolutionizes film pre-production workflows. From script analysis to storyboard generation, our platform helps filmmakers, studios, and content creators streamline their production process.

## Features

- **AI Script Breakdown**: Automated script analysis extracting scenes, characters, props, locations, and technical requirements
- **Smart Scheduling**: AI-powered scene scheduling that optimizes shoot sequences based on constraints
- **Budget Automation**: Intelligent budget estimation with category-wise breakdowns and optimization suggestions  
- **AI Storyboards**: Generate professional storyboard sketches from scene descriptions using advanced AI models
- **Team Collaboration**: Role-based access for directors, producers, writers, and crew members
- **Production Analytics**: Comprehensive project insights, timeline tracking, and production readiness reports

## Tech Stack

- Frontend: [Next.js](https://nextjs.org/docs), [Tailwind](https://tailwindcss.com/docs/guides/nextjs), [Shadcn](https://ui.shadcn.com/docs/installation), [Framer Motion](https://www.framer.com/motion/introduction/)
- Backend: [PostgreSQL](https://www.postgresql.org/about/), [Supabase](https://supabase.com/), [Drizzle](https://orm.drizzle.team/docs/get-started-postgresql), [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- Auth: [Clerk](https://clerk.com/)
- Payments: [Stripe](https://stripe.com/)
- AI Integration: Custom AI models for script analysis, scheduling optimization, and storyboard generation

## Prerequisites

You will need accounts for the following services to run Think AI locally:

- Create a [GitHub](https://github.com/) account
- Create a [Supabase](https://supabase.com/) account  
- Create a [Clerk](https://clerk.com/) account
- Create a [Stripe](https://stripe.com/) account
- Create a [Vercel](https://vercel.com/) account

All services offer free tiers suitable for development and testing.

## Environment Variables

```bash
# Database
DATABASE_URL=
# Access Supabase Studio here: http://127.0.0.1:54323/project/default

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login # do not change
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup # do not change

# Payments (Stripe)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_YEARLY=
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_MONTHLY=

# AI Services (Optional - for enhanced features)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
```

## Setup

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd think-ai
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Copy environment variables
   ```bash
   cp .env.example .env.local
   ```
   Fill in the environment variables from above

4. Set up the database
   ```bash
   npx supabase start
   npx drizzle-kit push
   ```

5. Seed the database (optional)
   ```bash
   npx bun db/seed
   ```

6. Start the development server
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run types` - Run TypeScript type checking
- `npm test` - Run all tests
- `npm run clean` - Format code and fix linting issues

## Project Structure

```
think-ai/
├── app/                    # Next.js app directory
│   ├── (authenticated)/   # Protected dashboard routes
│   ├── (unauthenticated)/ # Public marketing pages
│   └── api/               # API routes
├── components/            # Reusable UI components
├── db/                   # Database schema and migrations
├── actions/              # Server actions
├── lib/                  # Utility functions
└── hooks/                # Custom React hooks
```

## Deployment

Think AI is optimized for deployment on [Vercel](https://vercel.com/). Connect your GitHub repository to Vercel for automatic deployments.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Email: support@thinkai.com
- Documentation: [View Features](/features)
- Issues: [GitHub Issues](https://github.com/thinkai/issues)

---

**Think AI** - Revolutionizing film pre-production with artificial intelligence.
