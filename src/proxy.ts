import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  if (!request.nextUrl) return NextResponse.next();
  
  const { pathname } = request.nextUrl;
  if (!pathname) return NextResponse.next();

  // Get token and role from cookies
  const token = request.cookies.get('accessToken')?.value;
  const role = request.cookies.get('role')?.value;

  const publicRoutes = ['/login', '/register', '/', '/join-teacher', '/features'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // If trying to access protected route without token
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If logged in and trying to access public routes (like login/register)
  if (token && isPublicRoute && pathname !== '/' && pathname !== '/features' && pathname !== '/join-teacher') {
    return NextResponse.redirect(new URL(`/${role || 'student'}/dashboard`, request.url));
  }

  // Role-based protection
  if (token && role) {
    if (pathname.startsWith('/student') && role !== 'student') {
      return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
    }
    if (pathname.startsWith('/teacher') && role !== 'teacher') {
      return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
    }
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
    '/student/:path*',
    '/teacher/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/join-teacher',
    '/features',
  ],
};
