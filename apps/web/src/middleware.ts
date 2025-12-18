/**
 * Next.js Middleware - First-Boot Detection
 *
 * Redirects users to /setup wizard if system is not configured.
 * Checks SetupWizardState.systemConfigured flag in database.
 */

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@shop-rewards/db';

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

// Cache the setup status to avoid DB queries on every request
let setupStatusCache: { configured: boolean; timestamp: number } | null = null;
const CACHE_TTL = 5000; // 5 seconds

/**
 * Check if system setup is complete
 * Checks database for systemConfigured flag with caching
 */
async function isSystemConfigured(): Promise<boolean> {
  // Check environment variable first (for production/Docker)
  if (process.env.SETUP_COMPLETED === 'true') {
    return true;
  }

  // Check cache
  if (setupStatusCache && Date.now() - setupStatusCache.timestamp < CACHE_TTL) {
    return setupStatusCache.configured;
  }

  try {
    // Query database
    const state = await prisma.setupWizardState.findUnique({
      where: { id: 'system' },
      select: { systemConfigured: true },
    });

    const configured = state?.systemConfigured ?? false;

    // Update cache
    setupStatusCache = {
      configured,
      timestamp: Date.now(),
    };

    return configured;
  } catch (error) {
    // If database is not available, assume not configured
    console.error('[Middleware] Failed to check setup status:', error);
    return false;
  }
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const setupComplete = await isSystemConfigured();

  console.log('[Middleware] Request:', {
    pathname,
    setupComplete,
  });

  // If accessing home page and system is already configured, redirect to admin
  if (pathname === '/' && setupComplete) {
    console.log('[Middleware] Setup complete, redirecting to admin dashboard');
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // If accessing setup page and system is already configured, redirect to admin
  if (pathname.startsWith('/setup') && setupComplete) {
    console.log('[Middleware] Setup already complete, redirecting to admin');
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // If accessing protected route and system is not configured, redirect to setup
  if (requiresSetup(pathname) && !setupComplete) {
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
