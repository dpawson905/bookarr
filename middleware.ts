import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { nextAuth } from './lib/config'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next()
  }

  // Check authentication for protected routes
  const token = await getToken({ 
    req: request, 
    secret: nextAuth.secret 
  })

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/settings', '/books', '/authors', '/downloads']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // If it's a protected route and user is not authenticated, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (token && pathname === '/auth/signin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (except setup)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/setup|_next/static|_next/image|favicon.ico).*)',
  ],
}