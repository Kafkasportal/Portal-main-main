import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getCurrentUser, isAdmin, getUsers, getUserCount, getUserById, createUser, updateUser, deleteUser, ROLE_PERMISSIONS_MAP } from '../users.service'
import { createAdminClient } from '@/lib/supabase/server'
import { Role } from '@/types/users'

vi.mock('@/lib/supabase/server', () => ({
    createAdminClient: vi.fn(),
}))

describe('users.service', () => {
    const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        aud: 'authenticated',
        app_metadata: {
            role: 'admin',
            name: 'Test Admin',
            ad: 'Test',
            soyad: 'Admin',
            permissions: ROLE_PERMISSIONS_MAP.admin
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }

    const mockSupabase = {
        auth: {
            getUser: vi.fn(),
            admin: {
                getUserById: vi.fn(),
                listUsers: vi.fn(),
                createUser: vi.fn(),
                updateUserById: vi.fn(),
                deleteUser: vi.fn()
            }
        }
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(createAdminClient).mockResolvedValue(mockSupabase as any)
    })

    describe('getCurrentUser', () => {
        it('should return mapped user when authenticated', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

            const result = await getCurrentUser()

            expect(result?.id).toBe(mockUser.id)
            expect(result?.role).toBe('admin')
            expect(result?.name).toBe('Test Admin')
        })

        it('should return null when not authenticated', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
            const result = await getCurrentUser()
            expect(result).toBeNull()
        })
    })

    describe('isAdmin', () => {
        it('should return true if user role is admin', async () => {
            mockSupabase.auth.admin.getUserById.mockResolvedValue({ data: { user: mockUser }, error: null })
            const result = await isAdmin('user-1')
            expect(result).toBe(true)
        })

        it('should return false if user role is not admin', async () => {
            const modUser = { ...mockUser, app_metadata: { ...mockUser.app_metadata, role: 'moderator' } }
            mockSupabase.auth.admin.getUserById.mockResolvedValue({ data: { user: modUser }, error: null })
            const result = await isAdmin('user-2')
            expect(result).toBe(false)
        })
    })

    describe('getUsers', () => {
        it('should list all users and handle pagination', async () => {
            mockSupabase.auth.admin.listUsers.mockResolvedValue({
                data: { users: [mockUser] },
                error: null
            })

            const result = await getUsers({ page: 1, pageSize: 10 })

            expect(result.users).toHaveLength(1)
            expect(result.total).toBe(1)
            expect(mockSupabase.auth.admin.listUsers).toHaveBeenCalled()
        })

        it('should filter users by search term', async () => {
            const users = [
                mockUser,
                { ...mockUser, id: 'user-2', app_metadata: { ...mockUser.app_metadata, name: 'Other User' } }
            ]
            mockSupabase.auth.admin.listUsers.mockResolvedValue({ data: { users }, error: null })

            const result = await getUsers({ filters: { search: 'Other' } })

            expect(result.users).toHaveLength(1)
            expect(result.users[0].name).toBe('Other User')
        })
    })

    describe('createUser', () => {
        it('should create user with default permissions', async () => {
            const userData = {
                email: 'new@example.com',
                password: 'password123',
                role: Role.MODERATOR,
                ad: 'Mod',
                soyad: 'User'
            }

            mockSupabase.auth.admin.createUser.mockResolvedValue({
                data: { user: { ...mockUser, email: userData.email, app_metadata: { role: Role.MODERATOR } } },
                error: null
            })

            const result = await createUser(userData)

            expect(result.email).toBe(userData.email)
            expect(mockSupabase.auth.admin.createUser).toHaveBeenCalledWith(expect.objectContaining({
                email: userData.email,
                app_metadata: expect.objectContaining({
                    role: Role.MODERATOR
                })
            }))
        })
    })

    describe('updateUser', () => {
        it('should update user and metadata', async () => {
            mockSupabase.auth.admin.getUserById.mockResolvedValue({ data: { user: mockUser }, error: null })
            mockSupabase.auth.admin.updateUserById.mockResolvedValue({
                data: { user: { ...mockUser, app_metadata: { ...mockUser.app_metadata, name: 'Updated Name' } } },
                error: null
            })

            const result = await updateUser('user-1', { name: 'Updated Name' })

            expect(result.name).toBe('Updated Name')
            expect(mockSupabase.auth.admin.updateUserById).toHaveBeenCalled()
        })
    })

    describe('deleteUser', () => {
        it('should call deleteUser admin method', async () => {
            mockSupabase.auth.admin.deleteUser.mockResolvedValue({ data: {}, error: null })
            await deleteUser('user-1')
            expect(mockSupabase.auth.admin.deleteUser).toHaveBeenCalledWith('user-1')
        })
    })
})
