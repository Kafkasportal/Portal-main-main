import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as hooks from '../use-api'
import * as service from '@/lib/supabase-service'
import { toast } from 'sonner'
import React from 'react'

// Mock service
vi.mock('@/lib/supabase-service')
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    }
}))

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false }
        },
    })
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
}

describe('use-api hooks', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('useDashboardStats', () => {
        it('should fetch dashboard stats', async () => {
            const mockStats = { activeMembers: 100 }
            vi.mocked(service.fetchDashboardStats).mockResolvedValue(mockStats as any)

            const { result } = renderHook(() => hooks.useDashboardStats(), {
                wrapper: createWrapper()
            })

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toEqual(mockStats)
            expect(service.fetchDashboardStats).toHaveBeenCalled()
        })
    })

    describe('useDonations', () => {
        it('should fetch donations with params', async () => {
            const mockData = { data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }
            vi.mocked(service.fetchDonations).mockResolvedValue(mockData)

            const params = { page: 1, search: 'test' }
            const { result } = renderHook(() => hooks.useDonations(params), {
                wrapper: createWrapper()
            })

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(service.fetchDonations).toHaveBeenCalledWith(params)
        })
    })

    describe('useCreateDonation', () => {
        it('should create donation and show success toast', async () => {
            const donation = { tutar: 100, bagisci_adi: 'Ali' }
            vi.mocked(service.createDonation).mockResolvedValue({ id: 1, ...donation } as any)

            const { result } = renderHook(() => hooks.useCreateDonation(), {
                wrapper: createWrapper()
            })

            await result.current.mutateAsync(donation as any)

            // Fix: ignore additional react-query arguments
            expect(service.createDonation).toHaveBeenCalledWith(donation, expect.anything())
            expect(toast.success).toHaveBeenCalledWith('Bağış başarıyla kaydedildi')
        })

        it('should show error toast on failure', async () => {
            vi.mocked(service.createDonation).mockRejectedValue(new Error('Fail'))

            const { result } = renderHook(() => hooks.useCreateDonation(), {
                wrapper: createWrapper()
            })

            await expect(result.current.mutateAsync({} as any)).rejects.toThrow()
            expect(toast.error).toHaveBeenCalledWith('Bağış kaydedilirken hata oluştu')
        })
    })

    describe('useCreateMember', () => {
        it('should create member successfully', async () => {
            const member = { ad: 'Yeni', soyad: 'Üye' }
            vi.mocked(service.createMember).mockResolvedValue({ id: 1, ...member } as any)

            const { result } = renderHook(() => hooks.useCreateMember(), {
                wrapper: createWrapper()
            })

            await result.current.mutateAsync(member as any)

            expect(service.createMember).toHaveBeenCalledWith(member, expect.anything())
            expect(toast.success).toHaveBeenCalledWith('Üye kaydı başarıyla oluşturuldu')
        })
    })

    describe('useBeneficiaries', () => {
        it('should fetch beneficiaries', async () => {
            const mockData = { data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }
            vi.mocked(service.fetchBeneficiaries).mockResolvedValue(mockData)

            const { result } = renderHook(() => hooks.useBeneficiaries(), {
                wrapper: createWrapper()
            })

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(service.fetchBeneficiaries).toHaveBeenCalled()
        })
    })

    describe('useUpdateBeneficiary', () => {
        it('should update beneficiary successfully', async () => {
            const updates = { ad: 'Güncel' }
            vi.mocked(service.updateBeneficiary).mockResolvedValue({ id: 1, ...updates } as any)

            const { result } = renderHook(() => hooks.useUpdateBeneficiary(), {
                wrapper: createWrapper()
            })

            await result.current.mutateAsync({ id: '1', data: updates as any })

            expect(service.updateBeneficiary).toHaveBeenCalledWith(1, updates)
            expect(toast.success).toHaveBeenCalledWith('İhtiyaç sahibi bilgileri güncellendi')
        })
    })

    describe('useApplications', () => {
        it('should fetch applications', async () => {
            const mockData = { data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }
            vi.mocked(service.fetchApplications).mockResolvedValue(mockData)

            const { result } = renderHook(() => hooks.useApplications(), {
                wrapper: createWrapper()
            })

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(service.fetchApplications).toHaveBeenCalled()
        })
    })

    describe('useKumbaras', () => {
        it('should fetch kumbaras', async () => {
            const mockData = { data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }
            vi.mocked(service.fetchKumbaras).mockResolvedValue(mockData)

            const { result } = renderHook(() => hooks.useKumbaras(), {
                wrapper: createWrapper()
            })

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(service.fetchKumbaras).toHaveBeenCalled()
        })
    })

    describe('useUsers', () => {
        it('should fetch users', async () => {
            const mockData = { data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }
            vi.mocked(service.fetchUsers).mockResolvedValue(mockData)

            const { result } = renderHook(() => hooks.useUsers(), {
                wrapper: createWrapper()
            })

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(service.fetchUsers).toHaveBeenCalled()
        })

        it('should fetch current user', async () => {
            const mockUser = { id: 'u1', email: 'test@test.com' }
            vi.mocked(service.fetchCurrentUser).mockResolvedValue(mockUser as any)

            const { result } = renderHook(() => hooks.useCurrentUser(), {
                wrapper: createWrapper()
            })

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toEqual(mockUser)
        })
    })

    describe('usePayments', () => {
        it('should fetch payments', async () => {
            const mockData = { data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }
            vi.mocked(service.fetchPayments).mockResolvedValue(mockData)

            const { result } = renderHook(() => hooks.usePayments(), {
                wrapper: createWrapper()
            })

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(service.fetchPayments).toHaveBeenCalled()
        })
    })

    describe('useInKindAids', () => {
        it('should fetch in-kind aids', async () => {
            const mockData = { data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }
            vi.mocked(service.fetchInKindAids).mockResolvedValue(mockData)

            const { result } = renderHook(() => hooks.useInKindAids(), {
                wrapper: createWrapper()
            })

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(service.fetchInKindAids).toHaveBeenCalled()
        })
    })

    describe('useFinancialSummary', () => {
        it('should fetch financial summary', async () => {
            const mockSummary = { totalIncome: 1000, totalExpense: 500 }
            vi.mocked(service.fetchFinancialSummary).mockResolvedValue(mockSummary as any)

            const { result } = renderHook(() => hooks.useFinancialSummary(), {
                wrapper: createWrapper()
            })

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toEqual(mockSummary)
        })
    })
})
