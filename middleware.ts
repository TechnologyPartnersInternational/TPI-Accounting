import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define the protected paths. For this simple app, we can protect all routes except auth ones.
const protectedPrefixes = ['/jobs', '/clients', '/api/export'];
const isProtected = (path: string) => {
  if (path === '/') return true;
  return protectedPrefixes.some(prefix => path.startsWith(prefix));
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get('auth_token');

  // If user is trying to access a protected route without being authenticated
  if (isProtected(pathname) && !authCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If user is authenticated and trying to access the login page
  if (pathname.startsWith('/login') && authCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Config ensures middleware runs on specified paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
