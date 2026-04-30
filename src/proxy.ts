import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function proxyHandler(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token and role from cookies (preferred for proxy/middleware)
  const token = request.cookies.get('accessToken')?.value;
  const role = request.cookies.get('role')?.value;

  const publicRoutes = ['/login', '/register', '/'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // If trying to access protected route without token
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If logged in and trying to access public routes (like login/register)
  if (token && isPublicRoute && pathname !== '/') {
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

// Named export for Next.js 16
export const proxy = proxyHandler;
// Default export as fallback
export default proxyHandler;

export const config = {
  matcher: [
    '/student/:path*',
    '/teacher/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
};
