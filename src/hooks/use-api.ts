import * as apiService from '@/lib/api-service'
import * as mockService from '@/lib/mock-service'
import type { Bagis, IhtiyacSahibi, Kumbara, PaginatedResponse, SosyalYardimBasvuru, Uye } from '@/types'
import { useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query'
import { toast } from 'sonner'

// API Toggle: .env'deki NEXT_PUBLIC_USE_MOCK_API değerine göre servis seçimi
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false'
const service = USE_MOCK ? mockService : apiService

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
export function useDashboardStats(options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof service.fetchDashboardStats>>>, 'queryKey' | 'queryFn'>) {
    return useQuery({
        queryKey: queryKeys.dashboard.stats,
        queryFn: service.fetchDashboardStats,
        ...options,
    })
}

// Donations Hooks
export function useDonations(
    params?: Parameters<typeof service.fetchDonations>[0],
    options?: Omit<UseQueryOptions<PaginatedResponse<Bagis>>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: queryKeys.donations.list(params),
        queryFn: () => service.fetchDonations(params || {}),
        ...options,
    })
}

export function useDonation(id: string, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof service.fetchDonation>>>, 'queryKey' | 'queryFn'>) {
    return useQuery({
        queryKey: queryKeys.donations.detail(id),
        queryFn: () => service.fetchDonation(id),
        enabled: !!id,
        ...options,
    })
}

// Create Donation Mutation
export function useCreateDonation(options?: UseMutationOptions<Awaited<ReturnType<typeof service.createDonation>>, Error, Parameters<typeof service.createDonation>[0]>) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: service.createDonation,
        onSuccess: () => {
            // Cache'i invalidate et
            void queryClient.invalidateQueries({ queryKey: queryKeys.donations.all })
            void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats })
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
    params?: Parameters<typeof service.fetchMembers>[0],
    options?: Omit<UseQueryOptions<PaginatedResponse<Uye>>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: queryKeys.members.list(params),
        queryFn: () => service.fetchMembers(params || {}),
        ...options,
    })
}

export function useMember(id: string, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof service.fetchMember>>>, 'queryKey' | 'queryFn'>) {
    return useQuery({
        queryKey: queryKeys.members.detail(id),
        queryFn: () => service.fetchMember(id),
        enabled: !!id,
        ...options,
    })
}

// Create Member Mutation
export function useCreateMember(options?: UseMutationOptions<Awaited<ReturnType<typeof service.createMember>>, Error, Parameters<typeof service.createMember>[0]>) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: service.createMember,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.members.all })
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
    params?: Parameters<typeof service.fetchBeneficiaries>[0],
    options?: Omit<UseQueryOptions<PaginatedResponse<IhtiyacSahibi>>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: queryKeys.socialAid.beneficiaries.list(params),
        queryFn: () => service.fetchBeneficiaries(params || {}),
        ...options,
    })
}

export function useBeneficiary(id: string, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof service.fetchBeneficiaryById>>>, 'queryKey' | 'queryFn'>) {
    return useQuery({
        queryKey: queryKeys.socialAid.beneficiaries.detail(id),
        queryFn: () => service.fetchBeneficiaryById(id),
        enabled: !!id,
        ...options,
    })
}

// Create Beneficiary Mutation
export function useCreateBeneficiary(options?: UseMutationOptions<Awaited<ReturnType<typeof service.createBeneficiary>>, Error, Parameters<typeof service.createBeneficiary>[0]>) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: service.createBeneficiary,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.socialAid.beneficiaries.all })
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
export function useUpdateBeneficiary(options?: UseMutationOptions<Awaited<ReturnType<typeof service.updateBeneficiary>>, Error, { id: string; data: Parameters<typeof service.updateBeneficiary>[1] }>) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }) => service.updateBeneficiary(id, data),
        onSuccess: (_data, variables) => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.socialAid.beneficiaries.all })
            void queryClient.invalidateQueries({ queryKey: queryKeys.socialAid.beneficiaries.detail(variables.id) })
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
    params?: Parameters<typeof service.fetchApplications>[0],
    options?: Omit<UseQueryOptions<PaginatedResponse<SosyalYardimBasvuru>>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: queryKeys.socialAid.applications.list(params),
        queryFn: () => service.fetchApplications(params || {}),
        ...options,
    })
}

export function useApplication(id: string, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof service.fetchApplicationById>>>, 'queryKey' | 'queryFn'>) {
    return useQuery({
        queryKey: queryKeys.socialAid.applications.detail(id),
        queryFn: () => service.fetchApplicationById(id),
        enabled: !!id,
        ...options,
    })
}

// Update Application Status Mutation
export function useUpdateApplicationStatus(options?: UseMutationOptions<Awaited<ReturnType<typeof service.updateApplicationStatus>>, Error, Parameters<typeof service.updateApplicationStatus>>) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (args) => service.updateApplicationStatus(...args),
        onSuccess: (_data, [id]) => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.socialAid.applications.all })
            void queryClient.invalidateQueries({ queryKey: queryKeys.socialAid.applications.detail(id) })
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
    params?: Parameters<typeof service.fetchKumbaras>[0],
    options?: Omit<UseQueryOptions<PaginatedResponse<Kumbara>>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: queryKeys.kumbaras.list(params),
        queryFn: () => service.fetchKumbaras(params || {}),
        ...options,
    })
}

export function useKumbaraByCode(code: string, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof service.fetchKumbaraByCode>>>, 'queryKey' | 'queryFn'>) {
    return useQuery({
        queryKey: queryKeys.kumbaras.byCode(code),
        queryFn: () => service.fetchKumbaraByCode(code),
        enabled: !!code,
        ...options,
    })
}

// Create Kumbara Mutation
export function useCreateKumbara(options?: UseMutationOptions<Awaited<ReturnType<typeof service.createKumbara>>, Error, Parameters<typeof service.createKumbara>[0]>) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: service.createKumbara,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.kumbaras.all })
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
export function useCollectKumbara(options?: UseMutationOptions<Awaited<ReturnType<typeof service.collectKumbara>>, Error, Parameters<typeof service.collectKumbara>[0]>) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: service.collectKumbara,
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
