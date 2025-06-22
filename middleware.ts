import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
])

const isRoleSelectionRoute = createRouteMatcher([
  '/role-selection',
])

export default clerkMiddleware(async (auth, req) => {
  // Allow access to role selection
  if (isRoleSelectionRoute(req)) {
    return NextResponse.next()
  }

  // Protect dashboard routes
  if (isProtectedRoute(req)) {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)"
  ]
}
