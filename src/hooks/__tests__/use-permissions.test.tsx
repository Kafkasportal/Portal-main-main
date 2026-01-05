import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { usePermissions, RequirePermission } from '../use-permissions'
import { mockSupabaseClient } from '@/test/mocks/supabase'
import React from 'react'

// Mock Supabase
vi.mock('@/lib/supabase/client', () => ({
    getSupabaseClient: vi.fn(() => mockSupabaseClient),
}))

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    })
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
}

describe('use-permissions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('usePermissions hook', () => {
        it('should return correct permissions for a user', async () => {
            // Mock roles query
            mockSupabaseClient.from.mockImplementation((table: string) => {
                if (table === 'users') {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({
                            data: { role_id: 'r1', roles: { id: 'r1', name: 'admin', hierarchy_level: 1, is_active: true } },
                            error: null
                        })
                    }
                }
                if (table === 'role_permissions') {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        then: vi.fn().mockImplementation((cb) => cb({
                            data: [
                                { permissions: { name: 'users.view' } },
                                { permissions: { name: 'users.edit' } }
                            ],
                            error: null
                        }))
                    }
                }
                if (table === 'user_permissions') {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        then: vi.fn().mockImplementation((cb) => cb({
                            data: [],
                            error: null
                        }))
                    }
                }
                return mockSupabaseClient
            })

            const { result } = renderHook(() => usePermissions('u1'), {
                wrapper: createWrapper()
            })

            await waitFor(() => expect(result.current.isLoading).toBe(false))

            expect(result.current.permissions).toContain('users.view')
            expect(result.current.hasPermission('users.view')).toBe(true)
            expect(result.current.hasPermission('non-existent')).toBe(false)
            expect(result.current.role?.name).toBe('admin')
        })

        it('should handle hierarchy correctly in canManageUser', async () => {
            // Mock for manager role (hierarchy 2)
            mockSupabaseClient.from.mockImplementation((table: string) => {
                if (table === 'users') {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({
                            data: { role_id: 'r2', roles: { id: 'r2', hierarchy_level: 2, name: 'manager', is_active: true } },
                            error: null
                        })
                    }
                }
                return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    then: vi.fn().mockImplementation((cb) => cb({ data: [], error: null }))
                }
            })

            const { result } = renderHook(() => usePermissions('manager-id'), {
                wrapper: createWrapper()
            })

            await waitFor(() => expect(result.current.isLoading).toBe(false))

            expect(result.current.role?.hierarchyLevel).toBe(2)
            expect(result.current.canManageUser(3)).toBe(true) // Can manage lower rank (3 > 2)
            expect(result.current.canManageUser(1)).toBe(false) // Cannot manage higher rank (1 < 2)
            expect(result.current.canManageUser(2)).toBe(false) // Cannot manage same rank (2 = 2)
        })
    })

    describe('RequirePermission component', () => {
        it('should render children when user has permission', async () => {
            // Setup mock permissions
            mockSupabaseClient.from.mockImplementation(() => ({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: { role_id: 'r1', roles: { name: 'admin' } }, error: null }),
                then: (cb: any) => cb({ data: [{ permissions: { name: 'test.perm' } }], error: null })
            }))

            render(
                <RequirePermission permission="test.perm" userId="u1">
                    <div data-testid="secret-content">Secret content</div>
                </RequirePermission>,
                { wrapper: createWrapper() }
            )

            // Content should appear after loading
            const content = await screen.findByTestId('secret-content')
            expect(content).toBeInTheDocument()
        })

        it('should render fallback when user lacks permission', async () => {
            mockSupabaseClient.from.mockImplementation(() => ({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: { role_id: 'r1', roles: { name: 'user' } }, error: null }),
                then: (cb: any) => cb({ data: [], error: null })
            }))

            render(
                <RequirePermission
                    permission="test.perm"
                    userId="u2"
                    fallback={<div data-testid="fallback">No access</div>}
                >
                    <div data-testid="secret-content">Secret content</div>
                </RequirePermission>,
                { wrapper: createWrapper() }
            )

            await waitFor(() => {
                expect(screen.queryByTestId('secret-content')).not.toBeInTheDocument()
                expect(screen.getByTestId('fallback')).toBeInTheDocument()
            })
        })
    })
})
