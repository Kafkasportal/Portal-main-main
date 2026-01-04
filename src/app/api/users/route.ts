/**
 * Users API Route
 * Handles user CRUD operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getUsers as getUsersService, getUserCount } from '@/lib/services/users.service'

/**
 * GET /api/users - Get all users with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const role = searchParams.get('role') || undefined
    const isActive = searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined
    const search = searchParams.get('search') || undefined

    const filters = {
      role,
      isActive,
      search,
    }

    const result = await getUsersService({ filters, page, pageSize })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/users - Create a new user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.email || !body.ad || !body.soyad || !body.role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createAdminClient()

    const { data: { user }, error } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password || 'tempPassword123!',
      email_confirm: true,
      user_metadata: {
        role: body.role,
        ad: body.ad,
        soyad: body.soyad,
        name: `${body.ad} ${body.soyad}`.trim(),
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
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
