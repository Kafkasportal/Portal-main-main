import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as mockService from '@/lib/mock-service'
import type { PaginatedResponse } from '@/types'

// Query Keys - Merkezi olarak yönetilen cache key'leri
export const queryKeys = {
    dashboard: {
        stats: ['dashboard-stats'] as const,
        applications: (status?: string) => ['dashboard-applications', status] as const,
        members: () => ['dashboard-members'] as const,
        beneficiaries: () => ['dashboard-beneficiaries'] as const,
    },
    donations: {
        all: ['donations'] as const,
        list: (filters?: Record<string, unknown>) => ['donations', filters] as const,
        detail: (id: string) => ['donations', id] as const,
    },
    kumbaras: {
        all: ['kumbaras'] as const,
        list: (filters?: Record<string, unknown>) => ['kumbaras', filters] as const,
        detail: (id: string) => ['kumbaras', id] as const,
        byCode: (code: string) => ['kumbaras', 'code', code] as const,
    },
    members: {
        all: ['members'] as const,
        list: (filters?: Record<string, unknown>) => ['members', filters] as const,
        detail: (id: string) => ['members', id] as const,
    },
    socialAid: {
        applications: {
            all: ['applications'] as const,
            list: (filters?: Record<string, unknown>) => ['applications', filters] as const,
            detail: (id: string) => ['applications', id] as const,
        },
        beneficiaries: {
            all: ['beneficiaries'] as const,
            list: (filters?: Record<string, unknown>) => ['beneficiaries', filters] as const,
            detail: (id: string) => ['beneficiaries', id] as const,
        },
        payments: {
            all: ['payments'] as const,
            list: (filters?: Record<string, unknown>) => ['payments', filters] as const,
        },
    },
} as const

// Generic hooks

// Dashboard Stats Hook
export function useDashboardStats(options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof mockService.fetchDashboardStats>>>, 'queryKey' | 'queryFn'>) {
    return useQuery({
        queryKey: queryKeys.dashboard.stats,
        queryFn: mockService.fetchDashboardStats,
        ...options,
    })
}

// Donations Hooks
export function useDonations(
    params?: Parameters<typeof mockService.fetchDonations>[0],
    options?: Omit<UseQueryOptions<PaginatedResponse<any>>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: queryKeys.donations.list(params),
        queryFn: () => mockService.fetchDonations(params || {}),
        ...options,
    })
}

export function useDonation(id: string, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof mockService.fetchDonation>>>, 'queryKey' | 'queryFn'>) {
    return useQuery({
        queryKey: queryKeys.donations.detail(id),
        queryFn: () => mockService.fetchDonation(id),
        enabled: !!id,
        ...options,
    })
}

// Create Donation Mutation
export function useCreateDonation(options?: UseMutationOptions<Awaited<ReturnType<typeof mockService.createDonation>>, Error, Parameters<typeof mockService.createDonation>[0]>) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: mockService.createDonation,
        onSuccess: () => {
            // Cache'i invalidate et
            queryClient.invalidateQueries({ queryKey: queryKeys.donations.all })
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats })
            toast.success('Bağış kaydı başarıyla oluşturuldu')
        },
        onError: (error) => {
            toast.error('Bağış kaydı oluşturulurken hata oluştu')
            console.error('Create donation error:', error)
        },
        ...options,
    })
}

// Members Hooks
export function useMembers(
    params?: Parameters<typeof mockService.fetchMembers>[0],
    options?: Omit<UseQueryOptions<PaginatedResponse<any>>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: queryKeys.members.list(params),
        queryFn: () => mockService.fetchMembers(params || {}),
        ...options,
    })
}

export function useMember(id: string, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof mockService.fetchMember>>>, 'queryKey' | 'queryFn'>) {
    return useQuery({
        queryKey: queryKeys.members.detail(id),
        queryFn: () => mockService.fetchMember(id),
        enabled: !!id,
        ...options,
    })
}

// Create Member Mutation
export function useCreateMember(options?: UseMutationOptions<Awaited<ReturnType<typeof mockService.createMember>>, Error, Parameters<typeof mockService.createMember>[0]>) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: mockService.createMember,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.members.all })
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats })
            toast.success('Üye kaydı başarıyla oluşturuldu')
        },
        onError: (error) => {
            toast.error('Üye kaydı oluşturulurken hata oluştu')
            console.error('Create member error:', error)
        },
        ...options,
    })
}

// Beneficiaries Hooks
export function useBeneficiaries(
    params?: Parameters<typeof mockService.fetchBeneficiaries>[0],
    options?: Omit<UseQueryOptions<PaginatedResponse<any>>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: queryKeys.socialAid.beneficiaries.list(params),
        queryFn: () => mockService.fetchBeneficiaries(params || {}),
        ...options,
    })
}

export function useBeneficiary(id: string, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof mockService.fetchBeneficiaryById>>>, 'queryKey' | 'queryFn'>) {
    return useQuery({
        queryKey: queryKeys.socialAid.beneficiaries.detail(id),
        queryFn: () => mockService.fetchBeneficiaryById(id),
        enabled: !!id,
        ...options,
    })
}

// Create Beneficiary Mutation
export function useCreateBeneficiary(options?: UseMutationOptions<Awaited<ReturnType<typeof mockService.createBeneficiary>>, Error, Parameters<typeof mockService.createBeneficiary>[0]>) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: mockService.createBeneficiary,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.socialAid.beneficiaries.all })
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats })
            toast.success('İhtiyaç sahibi kaydı başarıyla oluşturuldu')
        },
        onError: (error) => {
            toast.error('İhtiyaç sahibi kaydı oluşturulurken hata oluştu')
            console.error('Create beneficiary error:', error)
        },
        ...options,
    })
}

// Update Beneficiary Mutation
export function useUpdateBeneficiary(options?: UseMutationOptions<Awaited<ReturnType<typeof mockService.updateBeneficiary>>, Error, { id: string; data: Parameters<typeof mockService.updateBeneficiary>[1] }>) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }) => mockService.updateBeneficiary(id, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.socialAid.beneficiaries.all })
            queryClient.invalidateQueries({ queryKey: queryKeys.socialAid.beneficiaries.detail(variables.id) })
            toast.success('İhtiyaç sahibi bilgileri güncellendi')
        },
        onError: (error) => {
            toast.error('Güncelleme sırasında hata oluştu')
            console.error('Update beneficiary error:', error)
        },
        ...options,
    })
}

// Applications Hooks
export function useApplications(
    params?: Parameters<typeof mockService.fetchApplications>[0],
    options?: Omit<UseQueryOptions<PaginatedResponse<any>>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: queryKeys.socialAid.applications.list(params),
        queryFn: () => mockService.fetchApplications(params || {}),
        ...options,
    })
}

export function useApplication(id: string, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof mockService.fetchApplicationById>>>, 'queryKey' | 'queryFn'>) {
    return useQuery({
        queryKey: queryKeys.socialAid.applications.detail(id),
        queryFn: () => mockService.fetchApplicationById(id),
        enabled: !!id,
        ...options,
    })
}

// Update Application Status Mutation
export function useUpdateApplicationStatus(options?: UseMutationOptions<Awaited<ReturnType<typeof mockService.updateApplicationStatus>>, Error, Parameters<typeof mockService.updateApplicationStatus>>) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (args) => mockService.updateApplicationStatus(...args),
        onSuccess: (_data, [id]) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.socialAid.applications.all })
            queryClient.invalidateQueries({ queryKey: queryKeys.socialAid.applications.detail(id) })
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats })
            toast.success('Başvuru durumu güncellendi')
        },
        onError: (error) => {
            toast.error('Durum güncellenirken hata oluştu')
            console.error('Update application status error:', error)
        },
        ...options,
    })
}

// Kumbaras Hooks
export function useKumbaras(
    params?: Parameters<typeof mockService.fetchKumbaras>[0],
    options?: Omit<UseQueryOptions<PaginatedResponse<any>>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: queryKeys.kumbaras.list(params),
        queryFn: () => mockService.fetchKumbaras(params || {}),
        ...options,
    })
}

export function useKumbaraByCode(code: string, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof mockService.fetchKumbaraByCode>>>, 'queryKey' | 'queryFn'>) {
    return useQuery({
        queryKey: queryKeys.kumbaras.byCode(code),
        queryFn: () => mockService.fetchKumbaraByCode(code),
        enabled: !!code,
        ...options,
    })
}

// Create Kumbara Mutation
export function useCreateKumbara(options?: UseMutationOptions<Awaited<ReturnType<typeof mockService.createKumbara>>, Error, Parameters<typeof mockService.createKumbara>[0]>) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: mockService.createKumbara,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.kumbaras.all })
            toast.success('Kumbara başarıyla oluşturuldu')
        },
        onError: (error) => {
            toast.error('Kumbara oluşturulurken hata oluştu')
            console.error('Create kumbara error:', error)
        },
        ...options,
    })
}

// Collect Kumbara Mutation
export function useCollectKumbara(options?: UseMutationOptions<Awaited<ReturnType<typeof mockService.collectKumbara>>, Error, Parameters<typeof mockService.collectKumbara>[0]>) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: mockService.collectKumbara,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.kumbaras.all })
            queryClient.invalidateQueries({ queryKey: queryKeys.donations.all })
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats })
            toast.success('Kumbara başarıyla boşaltıldı')
        },
        onError: (error) => {
            toast.error('Kumbara boşaltılırken hata oluştu')
            console.error('Collect kumbara error:', error)
        },
        ...options,
    })
}
