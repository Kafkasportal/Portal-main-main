/**
 * Admin Route Protection Middleware
 * Protects admin-only API routes from unauthorized access
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Admin role required for protected routes
 */
const ADMIN_ROLES = ['admin', 'moderator'] as const

/**
 * Check if user has admin role
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // Read-only for checking roles
        },
      },
    }
  )

  const { data: user, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  if (error || !user) {
    return false
  }

  return ADMIN_ROLES.includes(user.role as any)
}

/**
 * Get current authenticated user from session
 */
export async function getCurrentUser(): Promise<{ id: string; role: string } | null> {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // Read-only for checking roles
        },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', user.id)
    .single()

  if (userError || !userData) {
    return null
  }

  return {
    id: userData.id,
    role: userData.role,
  }
}

/**
 * Admin protection middleware for API routes
 * Use this in admin-only API routes:
 * 
 * Example:
 * import { withAdminProtection } from '@/lib/security/admin-protection'
 *
 * export async function GET(request: NextRequest) {
 *   const { user } = await withAdminProtection(request)
 *   // User is authenticated and has admin role
 *   return NextResponse.json({ data: 'admin content' })
 * }
 */
export async function withAdminProtection(request: Request) {
  const user = await getCurrentUser()

  if (!user) {
    return Response.json(
      {
        error: 'Unauthorized',
        message: 'Oturum açılmış, lütfen giriş yapın',
      },
      { status: 401 }
    )
  }

  const hasAdminAccess = await isAdmin(user.id)

  if (!hasAdminAccess) {
    return Response.json(
      {
        error: 'Forbidden',
        message: 'Bu işlem için yetkiniz yok',
      },
      { status: 403 }
    )
  }

  // User is authenticated and has admin role
  return { user }
}

/**
 * Role-based access control helper
 */
export function hasPermission(
  userRole: string,
  requiredRole: 'admin' | 'moderator' | 'user'
): boolean {
  const roleHierarchy = {
    admin: ['admin', 'moderator', 'user'],
    moderator: ['moderator', 'user'],
    user: ['user'],
  }

  return roleHierarchy[requiredRole].includes(userRole as any)
}

/**
 * Check if user can perform specific action
 */
export function canPerformAction(
  userRole: string,
  action: 'create' | 'read' | 'update' | 'delete' | 'admin'
): boolean {
  const permissions: Record<string, string[]> = {
    user: ['read'],
    moderator: ['create', 'read', 'update'],
    admin: ['create', 'read', 'update', 'delete', 'admin'],
  }

  return permissions[userRole]?.includes(action) || false
}

/**
 * Create admin API route handler wrapper
 * Use this to wrap entire route handlers:
 *
 * Example:
 * import { adminRoute } from '@/lib/security/admin-protection'
 *
 * const handler = adminRoute(async (request, context) => {
 *   return NextResponse.json({ success: true })
 * })
 *
 * export { handler as GET, handler as POST }
 */
export function adminRoute<T extends any[]>(
  handler: (request: Request, context: { user: { id: string; role: string } }) => T | Promise<T>
) {
  return async (request: Request): Promise<T> => {
    const result = await withAdminProtection(request)

    if (result instanceof Response) {
      // Error response (401 or 403)
      return result as any
    }

    // User is authenticated and has admin role
    const { user } = result as { user: { id: string; role: string } }
    return handler(request, { user })
  }
}

