/**
 * Toggle User Status API Route
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

/**
 * POST /api/users/[id]/toggle - Toggle user active status
 */
export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params
    const body = await request.json()
    const isActive = body.isActive

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data: { user }, error } = await supabase.auth.admin.updateUserById(
      id,
      {
        ban_duration: isActive ? 'none' : '31536000s', // 1 year
      }
    )

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error toggling user status:', error)
    return NextResponse.json(
      { error: 'Failed to toggle user status' },
      { status: 500 }
    )
  }
}
