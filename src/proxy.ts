import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth/cookie';
import { isAuthDisabled } from '@/lib/auth/mode';

// Optimistic checks only (cookie present or not). The real session check runs in the
// Data Access Layer (src/lib/auth/dal.ts) on every page, Server Action and Route Handler.
export function proxy(request: NextRequest) {
  if (isAuthDisabled) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Server Action calls pass through so the DAL can answer them properly
  const isServerAction = request.headers.has('next-action');
  if ((pathname === '/dashboard' || pathname.startsWith('/dashboard/')) && !isServerAction) {
    const signInUrl = new URL('/auth/sign-in', request.url);
    signInUrl.searchParams.set('next', pathname + search);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)'
  ]
};
