import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not write any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make your application
  // vulnerable to security issues.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes check
  const publicRoutes = ['/giris', '/kayit', '/sifremi-unuttum']
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  if (!user && !isPublicRoute) {
    // No user, redirect to login page
    const url = request.nextUrl.clone()
    url.pathname = '/giris'
    return NextResponse.redirect(url)
  }

  if (user && request.nextUrl.pathname === '/giris') {
    // User is logged in, redirect to dashboard
    const url = request.nextUrl.clone()
    url.pathname = '/genel'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
