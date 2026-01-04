/**
 * Bulk Delete Users API Route
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * POST /api/users/bulk-delete - Delete multiple users
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userIds = body.userIds

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'userIds array is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const errors: string[] = []

    for (const userId of userIds) {
      const { error } = await supabase.auth.admin.deleteUser(userId)
      if (error) {
        errors.push(`${userId}: ${error.message}`)
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Some users failed to delete', details: errors },
        { status: 207 } // Multi-status
      )
    }

    return NextResponse.json({ success: true, deleted: userIds.length })
  } catch (error) {
    console.error('Error bulk deleting users:', error)
    return NextResponse.json(
      { error: 'Failed to delete users' },
      { status: 500 }
    )
  }
}
