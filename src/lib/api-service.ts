/**
 * API Service - Gerçek API endpoint'leri
 *
 * Bu dosya gerçek backend hazır olduğunda kullanılacak.
 * Mock service ile aynı interface'i sağlar.
 *
 * Kullanım:
 * - hooks/use-api.ts'de import path'i değiştirin
 * - import * as mockService from '@/lib/mock-service' yerine
 * - import * as apiService from '@/lib/api-service' kullanın
 */

import { api, endpoints } from './api-client'
import type {
    Bagis,
    Kumbara,
    KumbaraToplama,
    GpsKoordinat,
    Uye,
    SosyalYardimBasvuru,
    IhtiyacSahibi,
    DashboardStats,
    PaginatedResponse,
    PaymentStatus,
    DonationPurpose,
    BasvuruDurumu,
    YardimTuru,
    IhtiyacDurumu,
    IhtiyacSahibiKategori,
} from '@/types'

// Dashboard
export async function fetchDashboardStats(): Promise<DashboardStats> {
    return api.get<DashboardStats>(endpoints.dashboard.stats)
}

// Donations
export async function fetchDonations(options: {
    page?: number
    pageSize?: number
    search?: string
    status?: PaymentStatus
    purpose?: DonationPurpose
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}): Promise<PaginatedResponse<Bagis>> {
    return api.get<PaginatedResponse<Bagis>>(endpoints.donations.list, options)
}

export async function fetchDonation(id: string): Promise<Bagis | null> {
    return api.get<Bagis>(endpoints.donations.detail(id))
}

export async function createDonation(data: Partial<Bagis>): Promise<Bagis> {
    return api.post<Bagis>(endpoints.donations.create, data)
}

// Kumbaras
export async function fetchKumbaras(options: {
    page?: number
    pageSize?: number
    status?: 'aktif' | 'pasif' | 'bakim'
}): Promise<PaginatedResponse<Kumbara>> {
    return api.get<PaginatedResponse<Kumbara>>(endpoints.kumbaras.list, options)
}

export async function fetchKumbaraByCode(kod: string): Promise<Kumbara | null> {
    return api.get<Kumbara>(endpoints.kumbaras.byCode(kod))
}

export async function createKumbara(data: {
    qrKod: string
    ad: string
    konum: string
    koordinat?: GpsKoordinat
    sorumluId: string
    notlar?: string
}): Promise<Kumbara> {
    return api.post<Kumbara>(endpoints.kumbaras.create, data)
}

export async function collectKumbara(data: {
    kumbaraId: string
    tutar: number
    notlar?: string
}): Promise<KumbaraToplama> {
    return api.post<KumbaraToplama>(
        endpoints.kumbaras.collect(data.kumbaraId),
        { tutar: data.tutar, notlar: data.notlar }
    )
}

// Members
export async function fetchMembers(options: {
    page?: number
    pageSize?: number
    search?: string
    type?: string
}): Promise<PaginatedResponse<Uye>> {
    return api.get<PaginatedResponse<Uye>>(endpoints.members.list, options)
}

export async function fetchMember(id: string): Promise<Uye | null> {
    return api.get<Uye>(endpoints.members.detail(id))
}

export async function createMember(data: Partial<Uye>): Promise<Uye> {
    return api.post<Uye>(endpoints.members.create, data)
}

// Applications
export async function fetchApplications(options: {
    page?: number
    pageSize?: number
    status?: BasvuruDurumu
    search?: string
    yardimTuru?: YardimTuru
}): Promise<PaginatedResponse<SosyalYardimBasvuru>> {
    return api.get<PaginatedResponse<SosyalYardimBasvuru>>(
        endpoints.applications.list,
        options
    )
}

export async function fetchApplicationById(
    id: string
): Promise<SosyalYardimBasvuru | null> {
    return api.get<SosyalYardimBasvuru>(endpoints.applications.detail(id))
}

export async function updateApplicationStatus(
    id: string,
    durum: BasvuruDurumu,
    degerlendirmeNotu?: string
): Promise<SosyalYardimBasvuru> {
    return api.patch<SosyalYardimBasvuru>(endpoints.applications.updateStatus(id), {
        durum,
        degerlendirmeNotu,
    })
}

// Payments
export async function fetchPayments(options: {
    page?: number
    pageSize?: number
}): Promise<PaginatedResponse<SosyalYardimBasvuru>> {
    return api.get<PaginatedResponse<SosyalYardimBasvuru>>(
        endpoints.payments.list,
        options
    )
}

// Beneficiaries
export async function fetchBeneficiaries(options: {
    page?: number
    pageSize?: number
    status?: IhtiyacDurumu
    kategori?: IhtiyacSahibiKategori
    search?: string
    city?: string
    dosyaNo?: string
    kimlikNo?: string
}): Promise<PaginatedResponse<IhtiyacSahibi>> {
    return api.get<PaginatedResponse<IhtiyacSahibi>>(
        endpoints.beneficiaries.list,
        options
    )
}

export async function fetchBeneficiaryById(
    id: string
): Promise<IhtiyacSahibi | null> {
    return api.get<IhtiyacSahibi>(endpoints.beneficiaries.detail(id))
}

export async function createBeneficiary(
    data: Partial<IhtiyacSahibi>
): Promise<IhtiyacSahibi> {
    return api.post<IhtiyacSahibi>(endpoints.beneficiaries.create, data)
}

export async function updateBeneficiary(
    id: string,
    data: Partial<IhtiyacSahibi>
): Promise<IhtiyacSahibi | null> {
    return api.patch<IhtiyacSahibi>(endpoints.beneficiaries.update(id), data)
}
