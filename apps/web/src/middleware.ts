/**
 * Next.js Middleware - First-Boot Detection
 *
 * Redirects users to /setup wizard if system is not configured.
 * Checks SetupWizardState.systemConfigured flag in database.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that should always be accessible (even when not configured)
const PUBLIC_ROUTES = [
  '/setup',
  '/api/trpc',
  '/_next',
  '/favicon.ico',
  '/assets',
];

// Routes that require setup to be completed
const PROTECTED_ROUTES = [
  '/',
  '/admin',
  '/dashboard',
  '/login',
];

/**
 * Check if system setup is complete
 * Reads from environment variable set by entrypoint script
 */
function isSystemConfigured(): boolean {
  // Check SETUP_COMPLETED environment variable
  // This is set by docker entrypoint scripts after wizard completion
  return process.env.SETUP_COMPLETED === 'true';
}

/**
 * Check if route requires setup completion
 */
function requiresSetup(pathname: string): boolean {
  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return false;
  }

  // All other routes require setup
  return true;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('[Middleware] Request:', {
    pathname,
    setupComplete: isSystemConfigured(),
  });

  // If accessing setup page and system is already configured, redirect to home
  if (pathname.startsWith('/setup') && isSystemConfigured()) {
    console.log('[Middleware] Setup already complete, redirecting to home');
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If accessing protected route and system is not configured, redirect to setup
  if (requiresSetup(pathname) && !isSystemConfigured()) {
    console.log('[Middleware] System not configured, redirecting to setup');
    return NextResponse.redirect(new URL('/setup', request.url));
  }

  // Allow request to proceed
  return NextResponse.next();
}

// Configure matcher to run middleware on specific routes
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
