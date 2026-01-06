/**
 * User API Route
 * Handles individual user operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

/**
 * GET /api/users/[id] - Get user by ID
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { data: { user }, error } = await supabase.auth.admin.getUserById(id)

    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/users/[id] - Update user
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params
    const body = await request.json()
    const supabase = createAdminClient()

    const updates: { user_metadata: Record<string, unknown>; password?: string; email?: string } = {
      user_metadata: {
        role: body.role,
        ad: body.ad,
        soyad: body.soyad,
        name: body.ad && body.soyad ? `${body.ad} ${body.soyad}`.trim() : undefined,
        phone: body.phone,
        birim: body.birim,
        yetki: body.yetki,
        gorev: body.gorev,
        dahili: body.dahili,
        kisa_kod: body.kisa_kod,
        kisa_kod2: body.kisa_kod2,
        erisim_yetkisi: body.erisim_yetkisi,
        imza_yetkisi: body.imza_yetkisi,
        fon_yetkisi: body.fon_yetkisi,
        fon_yetkisi2: body.fon_yetkisi2,
        fon_yetkisi3: body.fon_yetkisi3,
        fon_bolgesi_yetkisi: body.fon_bolgesi_yetkisi,
        imza_yetkisi2: body.imza_yetkisi2,
        imza_yetkisi3: body.imza_yetkisi3,
        permissions: body.permissions,
      },
    }

    if (body.password) {
      updates.password = body.password
    }

    if (body.email) {
      updates.email = body.email
    }

    const { data: { user }, error } = await supabase.auth.admin.updateUserById(
      id,
      updates
    )

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/users/[id] - Delete user
 */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { error } = await supabase.auth.admin.deleteUser(id)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
