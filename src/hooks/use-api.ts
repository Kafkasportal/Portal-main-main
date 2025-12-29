import * as service from '@/lib/supabase-service'
import type {
  Bagis,
  CashSummary,
  CategorySummary,
  FinancialSummary,
  IhtiyacSahibi,
  IncomeExpenseReport,
  InKindAid,
  Kumbara,
  NotificationPreferences,
  PaginatedResponse,
  Payment,
  SosyalYardimBasvuru,
  User,
  Uye,
} from '@/types'
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query'
import { toast } from 'sonner'

// Query Keys - Merkezi olarak yönetilen cache key'leri
export const queryKeys = {
  dashboard: {
    stats: ['dashboard-stats'] as const,
    applications: (status?: string) =>
      ['dashboard-applications', status] as const,
    members: () => ['dashboard-members'] as const,
    beneficiaries: () => ['dashboard-beneficiaries'] as const,
  },
  donations: {
    all: ['donations'] as const,
    list: (filters?: Record<string, unknown>) =>
      ['donations', filters] as const,
    detail: (id: string | number) => ['donations', id] as const,
  },
  kumbaras: {
    all: ['kumbaras'] as const,
    list: (filters?: Record<string, unknown>) => ['kumbaras', filters] as const,
    detail: (id: string | number) => ['kumbaras', id] as const,
    byCode: (code: string) => ['kumbaras', 'code', code] as const,
  },
  members: {
    all: ['members'] as const,
    list: (filters?: Record<string, unknown>) => ['members', filters] as const,
    detail: (id: string | number) => ['members', id] as const,
  },
  socialAid: {
    applications: {
      all: ['applications'] as const,
      list: (filters?: Record<string, unknown>) =>
        ['applications', filters] as const,
      detail: (id: string | number) => ['applications', id] as const,
    },
    beneficiaries: {
      all: ['beneficiaries'] as const,
      list: (filters?: Record<string, unknown>) =>
        ['beneficiaries', filters] as const,
      detail: (id: string | number) => ['beneficiaries', id] as const,
    },
    payments: {
      all: ['payments'] as const,
      list: (filters?: Record<string, unknown>) =>
        ['payments', filters] as const,
      detail: (id: number) => ['payments', id] as const,
      byDateRange: (start: string, end: string) =>
        ['payments', 'dateRange', start, end] as const,
      dailySummary: (date: string) => ['payments', 'dailySummary', date] as const,
      monthlySummary: (year: number, month: number) =>
        ['payments', 'monthlySummary', year, month] as const,
    },
    inKindAids: {
      all: ['inKindAids'] as const,
      list: (filters?: Record<string, unknown>) =>
        ['inKindAids', filters] as const,
      detail: (id: number) => ['inKindAids', id] as const,
    },
  },
  financial: {
    summary: (startDate?: string, endDate?: string) =>
      ['financial', 'summary', startDate, endDate] as const,
    report: (startDate: string, endDate: string) =>
      ['financial', 'report', startDate, endDate] as const,
    incomeByCategory: (startDate?: string, endDate?: string) =>
      ['financial', 'incomeByCategory', startDate, endDate] as const,
    expenseByCategory: (startDate?: string, endDate?: string) =>
      ['financial', 'expenseByCategory', startDate, endDate] as const,
  },
  users: {
    all: ['users'] as const,
    list: (filters?: Record<string, unknown>) =>
      ['users', filters] as const,
    detail: (id: string) => ['users', id] as const,
    current: ['users', 'current'] as const,
    notifications: (id: string) => ['users', id, 'notifications'] as const,
  },
  hospitals: {
    all: ['hospitals'] as const,
    list: (filters?: Record<string, unknown>) => ['hospitals', filters] as const,
    detail: (id: string) => ['hospitals', id] as const,
  },
  referrals: {
    all: ['referrals'] as const,
    list: (filters?: Record<string, unknown>) => ['referrals', filters] as const,
    detail: (id: string) => ['referrals', id] as const,
    appointments: (referralId: string) => ['referrals', referralId, 'appointments'] as const,
    costs: (referralId: string) => ['referrals', referralId, 'costs'] as const,
    outcomes: (referralId: string) => ['referrals', referralId, 'outcomes'] as const,
  },
} as const

// Generic hooks

// Dashboard Stats Hook
export function useDashboardStats(
  options?: Omit<
    UseQueryOptions<Awaited<ReturnType<typeof service.fetchDashboardStats>>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: service.fetchDashboardStats,
    ...options,
  })
}

// Donations Hooks
export function useDonations(
  params?: Parameters<typeof service.fetchDonations>[0],
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Bagis>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.donations.list(params),
    queryFn: () => service.fetchDonations(params || {}),
    ...options,
  })
}

export function useDonation(
  id: string,
  options?: Omit<
    UseQueryOptions<Awaited<ReturnType<typeof service.fetchDonation>>>,
    'queryKey' | 'queryFn'
  >
) {
  const donationId = Number.parseInt(id, 10)
  return useQuery({
    queryKey: queryKeys.donations.detail(id),
    queryFn: () => service.fetchDonation(donationId),
    enabled: !!id && !Number.isNaN(donationId),
    ...options,
  })
}

// Create Donation Mutation
export function useCreateDonation(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof service.createDonation>>,
    Error,
    Parameters<typeof service.createDonation>[0]
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: service.createDonation,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.donations.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats })
      toast.success('Bağış başarıyla kaydedildi')
    },
    onError: (error) => {
      toast.error('Bağış kaydedilirken hata oluştu')
      console.error('Create donation error:', error)
    },
    ...options,
  })
}

// Members Hooks
export function useMembers(
  params?: Parameters<typeof service.fetchMembers>[0],
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Uye>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.members.list(params),
    queryFn: () => service.fetchMembers(params || {}),
    ...options,
  })
}

export function useMember(
  id: string,
  options?: Omit<
    UseQueryOptions<Awaited<ReturnType<typeof service.fetchMember>>>,
    'queryKey' | 'queryFn'
  >
) {
  const memberId = Number.parseInt(id, 10)
  return useQuery({
    queryKey: queryKeys.members.detail(id),
    queryFn: () => service.fetchMember(memberId),
    enabled: !!id && !Number.isNaN(memberId),
    ...options,
  })
}

// Create Member Mutation
export function useCreateMember(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof service.createMember>>,
    Error,
    Parameters<typeof service.createMember>[0]
  >
) {
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
  options?: Omit<
    UseQueryOptions<PaginatedResponse<IhtiyacSahibi>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.socialAid.beneficiaries.list(params),
    queryFn: () => service.fetchBeneficiaries(params || {}),
    ...options,
  })
}

export function useBeneficiary(
  id: string,
  options?: Omit<
    UseQueryOptions<Awaited<ReturnType<typeof service.fetchBeneficiaryById>>>,
    'queryKey' | 'queryFn'
  >
) {
  const beneficiaryId = Number.parseInt(id, 10)
  return useQuery({
    queryKey: queryKeys.socialAid.beneficiaries.detail(id),
    queryFn: () => service.fetchBeneficiaryById(beneficiaryId),
    enabled: !!id && !Number.isNaN(beneficiaryId),
    ...options,
  })
}

// Create Beneficiary Mutation
export function useCreateBeneficiary(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof service.createBeneficiary>>,
    Error,
    Parameters<typeof service.createBeneficiary>[0]
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: service.createBeneficiary,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.socialAid.beneficiaries.all,
      })
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
export function useUpdateBeneficiary(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof service.updateBeneficiary>>,
    Error,
    { id: string; data: Parameters<typeof service.updateBeneficiary>[1] }
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) =>
      service.updateBeneficiary(Number.parseInt(id, 10), data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.socialAid.beneficiaries.all,
      })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.socialAid.beneficiaries.detail(variables.id),
      })
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
  options?: Omit<
    UseQueryOptions<PaginatedResponse<SosyalYardimBasvuru>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.socialAid.applications.list(params),
    queryFn: () => service.fetchApplications(params || {}),
    ...options,
  })
}

export function useApplication(
  id: string,
  options?: Omit<
    UseQueryOptions<Awaited<ReturnType<typeof service.fetchApplicationById>>>,
    'queryKey' | 'queryFn'
  >
) {
  const applicationId = Number.parseInt(id, 10)
  return useQuery({
    queryKey: queryKeys.socialAid.applications.detail(id),
    queryFn: () => service.fetchApplicationById(applicationId),
    enabled: !!id && !Number.isNaN(applicationId),
    ...options,
  })
}

// Update Application Status Mutation
export function useUpdateApplicationStatus(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof service.updateApplicationStatus>>,
    Error,
    Parameters<typeof service.updateApplicationStatus>
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (args) =>
      service.updateApplicationStatus(args[0], args[1], args[2]),
    onSuccess: (_data, [id]) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.socialAid.applications.all,
      })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.socialAid.applications.detail(id),
      })
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
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Kumbara>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.kumbaras.list(params),
    queryFn: () => service.fetchKumbaras(params || {}),
    ...options,
  })
}

export function useKumbaraByCode(
  code: string,
  options?: Omit<
    UseQueryOptions<Awaited<ReturnType<typeof service.fetchKumbaraByCode>>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.kumbaras.byCode(code),
    queryFn: () => service.fetchKumbaraByCode(code),
    enabled: !!code,
    ...options,
  })
}

// Create Kumbara Mutation
export function useCreateKumbara(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof service.createKumbara>>,
    Error,
    Parameters<typeof service.createKumbara>[0]
  >
) {
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
export function useCollectKumbara(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof service.collectKumbara>>,
    Error,
    Parameters<typeof service.collectKumbara>[0]
  >
) {
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

// Users Hooks
export function useUsers(
  params?: Parameters<typeof service.fetchUsers>[0],
  options?: Omit<
    UseQueryOptions<PaginatedResponse<User>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => service.fetchUsers(params || {}),
    ...options,
  })
}

export function useUser(
  id: string,
  options?: Omit<
    UseQueryOptions<Awaited<ReturnType<typeof service.fetchUser>>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => service.fetchUser(id),
    enabled: !!id,
    ...options,
  })
}

export function useCurrentUser(
  options?: Omit<
    UseQueryOptions<Awaited<ReturnType<typeof service.fetchCurrentUser>>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.users.current,
    queryFn: service.fetchCurrentUser,
    ...options,
  })
}

// Create User Mutation
export function useCreateUser(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof service.createUser>>,
    Error,
    Parameters<typeof service.createUser>[0]
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: service.createUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      toast.success('Kullanıcı başarıyla oluşturuldu')
    },
    onError: (error) => {
      toast.error('Kullanıcı oluşturulurken hata oluştu')
      console.error('Create user error:', error)
    },
    ...options,
  })
}

// Update User Mutation
export function useUpdateUser(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof service.updateUser>>,
    Error,
    { id: string; data: Parameters<typeof service.updateUser>[1] }
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => service.updateUser(id, data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.id),
      })
      toast.success('Kullanıcı bilgileri güncellendi')
    },
    onError: (error) => {
      toast.error('Kullanıcı güncellenirken hata oluştu')
      console.error('Update user error:', error)
    },
    ...options,
  })
}

// Delete User Mutation
export function useDeleteUser(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof service.deleteUser>>,
    Error,
    string
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: service.deleteUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      toast.success('Kullanıcı başarıyla silindi')
    },
    onError: (error) => {
      toast.error('Kullanıcı silinirken hata oluştu')
      console.error('Delete user error:', error)
    },
    ...options,
  })
}

// Update Profile Mutation
export function useUpdateProfile(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof service.updateUserProfile>>,
    Error,
    { id: string; data: Parameters<typeof service.updateUserProfile>[1] }
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => service.updateUserProfile(id, data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.current })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.id),
      })
      toast.success('Profil bilgileri güncellendi')
    },
    onError: (error) => {
      toast.error('Profil güncellenirken hata oluştu')
      console.error('Update profile error:', error)
    },
    ...options,
  })
}

// Update Password Mutation
export function useUpdatePassword(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof service.updatePassword>>,
    Error,
    Parameters<typeof service.updatePassword>
  >
) {
  return useMutation({
    mutationFn: (args) => service.updatePassword(args[0], args[1]),
    onSuccess: () => {
      toast.success('Şifre başarıyla güncellendi')
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Şifre güncellenirken hata oluştu'
      toast.error(errorMessage)
      console.error('Update password error:', error)
    },
    ...options,
  })
}

// Notification Preferences Hooks
export function useNotificationPreferences(
  userId: string,
  options?: Omit<
    UseQueryOptions<NotificationPreferences>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.users.notifications(userId),
    queryFn: () => service.fetchNotificationPreferences(),
    enabled: !!userId,
    ...options,
  })
}

export function useUpdateNotificationPreferences(
  userId: string,
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof service.updateNotificationPreferences>>,
    Error,
    NotificationPreferences
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (preferences) =>
      service.updateNotificationPreferences(userId, preferences),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.users.notifications(userId),
      })
      toast.success('Bildirim tercihleri kaydedildi')
    },
    onError: (error) => {
      toast.error('Bildirim tercihleri kaydedilirken hata oluştu')
      console.error('Update notification preferences error:', error)
    },
    ...options,
  })
}

// ============================================
// PAYMENT HOOKS
// ============================================

export function usePayments(
  params?: Parameters<typeof service.fetchPayments>[0],
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Payment>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.socialAid.payments.list(params),
    queryFn: () => service.fetchPayments(params),
    ...options,
  })
}

export function usePayment(
  id: number,
  options?: Omit<UseQueryOptions<Payment>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.socialAid.payments.detail(id),
    queryFn: () => service.fetchPaymentById(id),
    enabled: !!id,
    ...options,
  })
}

export function useCreatePayment(
  options?: UseMutationOptions<
    Payment,
    Error,
    Parameters<typeof service.createPayment>[0]
  >
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: service.createPayment,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.socialAid.payments.all,
      })
      toast.success('Ödeme başarıyla kaydedildi')
    },
    onError: (error) => {
      toast.error('Ödeme kaydedilirken hata oluştu')
      console.error('Create payment error:', error)
    },
    ...options,
  })
}

export function useUpdatePayment(
  options?: UseMutationOptions<
    Payment,
    Error,
    { id: number; data: Parameters<typeof service.updatePayment>[1] }
  >
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => service.updatePayment(id, data),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.socialAid.payments.all,
      })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.socialAid.payments.detail(data.id),
      })
      toast.success('Ödeme başarıyla güncellendi')
    },
    onError: (error) => {
      toast.error('Ödeme güncellenirken hata oluştu')
      console.error('Update payment error:', error)
    },
    ...options,
  })
}

export function useDeletePayment(
  options?: UseMutationOptions<void, Error, number>
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: service.deletePayment,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.socialAid.payments.all,
      })
      toast.success('Ödeme başarıyla silindi')
    },
    onError: (error) => {
      toast.error('Ödeme silinirken hata oluştu')
      console.error('Delete payment error:', error)
    },
    ...options,
  })
}

export function usePaymentsByDateRange(
  startDate: string,
  endDate: string,
  options?: Omit<UseQueryOptions<Payment[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.socialAid.payments.byDateRange(startDate, endDate),
    queryFn: () => service.fetchPaymentsByDateRange(startDate, endDate),
    enabled: !!startDate && !!endDate,
    ...options,
  })
}

export function useDailyCashSummary(
  date: string,
  options?: Omit<UseQueryOptions<CashSummary>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.socialAid.payments.dailySummary(date),
    queryFn: () => service.fetchDailyCashSummary(date),
    enabled: !!date,
    ...options,
  })
}

export function useMonthlyCashSummary(
  year: number,
  month: number,
  options?: Omit<UseQueryOptions<CashSummary>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.socialAid.payments.monthlySummary(year, month),
    queryFn: () => service.fetchMonthlyCashSummary(year, month),
    enabled: !!year && !!month,
    ...options,
  })
}

// ============================================
// IN-KIND AID HOOKS
// ============================================

export function useInKindAids(
  params?: Parameters<typeof service.fetchInKindAids>[0],
  options?: Omit<
    UseQueryOptions<PaginatedResponse<InKindAid>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.socialAid.inKindAids.list(params),
    queryFn: () => service.fetchInKindAids(params),
    ...options,
  })
}

export function useInKindAid(
  id: number,
  options?: Omit<UseQueryOptions<InKindAid>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.socialAid.inKindAids.detail(id),
    queryFn: () => service.fetchInKindAidById(id),
    enabled: !!id,
    ...options,
  })
}

export function useCreateInKindAid(
  options?: UseMutationOptions<
    InKindAid,
    Error,
    Parameters<typeof service.createInKindAid>[0]
  >
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: service.createInKindAid,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.socialAid.inKindAids.all,
      })
      toast.success('Ayni yardım başarıyla kaydedildi')
    },
    onError: (error) => {
      toast.error('Ayni yardım kaydedilirken hata oluştu')
      console.error('Create in-kind aid error:', error)
    },
    ...options,
  })
}

export function useUpdateInKindAid(
  options?: UseMutationOptions<
    InKindAid,
    Error,
    { id: number; data: Parameters<typeof service.updateInKindAid>[1] }
  >
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => service.updateInKindAid(id, data),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.socialAid.inKindAids.all,
      })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.socialAid.inKindAids.detail(data.id),
      })
      toast.success('Ayni yardım başarıyla güncellendi')
    },
    onError: (error) => {
      toast.error('Ayni yardım güncellenirken hata oluştu')
      console.error('Update in-kind aid error:', error)
    },
    ...options,
  })
}

export function useDeleteInKindAid(
  options?: UseMutationOptions<void, Error, number>
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: service.deleteInKindAid,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.socialAid.inKindAids.all,
      })
      toast.success('Ayni yardım başarıyla silindi')
    },
    onError: (error) => {
      toast.error('Ayni yardım silinirken hata oluştu')
      console.error('Delete in-kind aid error:', error)
    },
    ...options,
  })
}

// ============================================
// HOSPITAL & REFERRAL HOOKS
// ============================================

export function useHospitals(params?: Parameters<typeof service.fetchHospitals>[0]) {
  return useQuery({
    queryKey: queryKeys.hospitals.list(params),
    queryFn: () => service.fetchHospitals(params),
  })
}

export function useCreateHospital() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: service.createHospital,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.hospitals.all })
      toast.success('Hastane kaydı oluşturuldu')
    },
  })
}

export function useReferrals(params?: Parameters<typeof service.fetchReferrals>[0]) {
  return useQuery({
    queryKey: queryKeys.referrals.list(params),
    queryFn: () => service.fetchReferrals(params),
  })
}

export function useReferral(id: string) {
  return useQuery({
    queryKey: queryKeys.referrals.detail(id),
    queryFn: () => service.fetchReferral(id),
    enabled: !!id,
  })
}

export function useCreateReferral() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: service.createReferral,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.referrals.all })
      toast.success('Sevk kaydı oluşturuldu')
    },
  })
}

export function useUpdateReferral(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof service.updateReferral>[1]) => service.updateReferral(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.referrals.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.referrals.detail(id) })
      toast.success('Sevk durumu güncellendi')
    },
  })
}

export function useAppointments(referralId: string) {
  return useQuery({
    queryKey: queryKeys.referrals.appointments(referralId),
    queryFn: () => service.fetchAppointments(referralId),
    enabled: !!referralId,
  })
}

export function useCreateAppointment(referralId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: service.createAppointment,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.referrals.appointments(referralId) })
      toast.success('Randevu oluşturuldu')
    },
  })
}

export function useTreatmentCosts(referralId: string) {
  return useQuery({
    queryKey: queryKeys.referrals.costs(referralId),
    queryFn: () => service.fetchTreatmentCosts(referralId),
    enabled: !!referralId,
  })
}

export function useCreateTreatmentCost(referralId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: service.createTreatmentCost,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.referrals.costs(referralId) })
      toast.success('Gider kaydı eklendi')
    },
  })
}

export function useOutcomes(referralId: string) {
  return useQuery({
    queryKey: queryKeys.referrals.outcomes(referralId),
    queryFn: () => service.fetchTreatmentOutcomes(referralId),
    enabled: !!referralId,
  })
}

export function useCreateOutcome(referralId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: service.createTreatmentOutcome,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.referrals.outcomes(referralId) })
      toast.success('Tedavi sonucu kaydedildi')
    },
  })
}

export function useUpdateOutcome(referralId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof service.updateTreatmentOutcome>[1] }) => service.updateTreatmentOutcome(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.referrals.outcomes(referralId) })
      toast.success('Tedavi sonucu güncellendi')
    },
  })
}

// ============================================
// FINANCIAL HOOKS
// ============================================

export function useFinancialSummary(
  startDate?: string,
  endDate?: string,
  options?: Omit<UseQueryOptions<FinancialSummary>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.financial.summary(startDate, endDate),
    queryFn: () => service.fetchFinancialSummary(startDate, endDate),
    ...options,
  })
}

export function useIncomeExpenseReport(
  startDate: string,
  endDate: string,
  options?: Omit<UseQueryOptions<IncomeExpenseReport[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.financial.report(startDate, endDate),
    queryFn: () => service.fetchIncomeExpenseReport(startDate, endDate),
    enabled: !!startDate && !!endDate,
    ...options,
  })
}

export function useIncomeByCategory(
  startDate?: string,
  endDate?: string,
  options?: Omit<UseQueryOptions<CategorySummary[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.financial.incomeByCategory(startDate, endDate),
    queryFn: () => service.fetchIncomeByCategory(startDate, endDate),
    ...options,
  })
}

export function useExpenseByCategory(
  startDate?: string,
  endDate?: string,
  options?: Omit<UseQueryOptions<CategorySummary[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.financial.expenseByCategory(startDate, endDate),
    queryFn: () => service.fetchExpenseByCategory(startDate, endDate),
    ...options,
  })
}
