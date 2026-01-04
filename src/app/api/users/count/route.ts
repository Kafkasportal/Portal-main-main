/**
 * User Count API Route
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUserCount } from '@/lib/services/users.service'

/**
 * GET /api/users/count - Get user count by role
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get('role') || undefined

    const count = await getUserCount(role)

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Error fetching user count:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user count' },
      { status: 500 }
    )
  }
}
