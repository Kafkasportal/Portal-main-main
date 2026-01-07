import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const publicRoutes = ['/giris', '/kayit']

// Routes that require authentication
const protectedRoutes = [
    '/genel',
    '/bagis',
    '/uyeler',
    '/sosyal-yardim',
    '/etkinlikler',
    '/dokumanlar',
    '/ayarlar',
    '/kullanicilar',
    '/yedekleme'
]

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Check if it's a public route
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    // Check if it's a protected route
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

    // Get auth token from cookies (mock implementation)
    // In a real app, this would check for a valid JWT or session
    const authToken = request.cookies.get('auth-token')?.value

    // Check authentication - for demo, accept any auth token
    // In production, validate the token properly
    // Also check if cookie exists (even if value is empty, it means user was authenticated)
    const isAuthenticated = authToken !== undefined && authToken !== null && authToken !== ''

    // Redirect unauthenticated users to login
    if (isProtectedRoute && !isAuthenticated) {
        const loginUrl = new URL('/giris', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Redirect authenticated users away from login page
    if (isPublicRoute && isAuthenticated && pathname === '/giris') {
        // Allow access to login for demo purposes
        // In production, uncomment below to redirect to dashboard
        // return NextResponse.redirect(new URL('/genel', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)'
    ]
}
