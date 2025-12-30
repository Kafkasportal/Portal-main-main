/**
 * Data Mappers
 * Database row'larını application type'larına map eder
 */

import type {
  AidatDurumu,
  Bagis,
  BasvuruDurumu,
  Cinsiyet,
  Currency,
  DonationPurpose,
  IhtiyacDurumu,
  IhtiyacSahibi,
  IhtiyacSahibiKategori,
  IhtiyacSahibiTuru,
  Kumbara,
  KumbaraStatus,
  MedeniHal,
  PaymentMethod,
  PaymentStatus,
  SosyalYardimBasvuru,
  Uye,
  UyeTuru,
  YardimTuru,
  EgitimDurumu,
  Payment,
  InKindAid,
} from '@/types'
import type { Database } from '@/types/supabase'

type Tables = Database['public']['Tables']

/**
 * Database member row → Uye type
 */
export function mapMember(db: Tables['members']['Row']): Uye {
  return {
    id: db.id,
    tcKimlikNo: db.tc_kimlik_no,
    ad: db.ad,
    soyad: db.soyad,
    dogumTarihi: db.dogum_tarihi ? new Date(db.dogum_tarihi) : new Date(),
    cinsiyet: db.cinsiyet as Cinsiyet,
    telefon: db.telefon,
    email: db.email || undefined,
    adres: {
      il: db.il || '',
      ilce: db.ilce || '',
      mahalle: '',
      acikAdres: db.adres || '',
    },
    uyeTuru: (db.uye_turu === 'standart' ? 'aktif' : db.uye_turu) as UyeTuru,
    uyeNo: '',
    kayitTarihi: db.kayit_tarihi ? new Date(db.kayit_tarihi) : new Date(),
    aidatDurumu: (db.aidat_durumu === 'odendi'
      ? 'guncel'
      : db.aidat_durumu === 'gecikti'
        ? 'gecmis'
        : 'muaf') as AidatDurumu,
    kanGrubu: db.kan_grubu || undefined,
    meslek: db.meslek || undefined,
    aidat: {
      tutar: 0,
    },
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  }
}

/**
 * Database donation row → Bagis type
 */
export function mapDonation(db: Tables['donations']['Row']): Bagis {
  return {
    id: db.id,
    bagisci: {
      id: db.member_id || db.id,
      ad: db.bagisci_adi || '',
      soyad: '',
    },
    tutar: db.tutar,
    currency: db.currency as Currency,
    amac: db.amac as DonationPurpose,
    odemeYontemi: (db.odeme_yontemi === 'kredi_karti'
      ? 'kredi-karti'
      : db.odeme_yontemi) as PaymentMethod,
    durum: 'tamamlandi' as PaymentStatus,
    createdAt: new Date(db.tarih || db.created_at),
    updatedAt: new Date(db.created_at),
  }
}

/**
 * Database kumbara row → Kumbara type
 */
export function mapKumbara(db: Tables['kumbaras']['Row']): Kumbara {
  return {
    id: db.id,
    kod: db.kod,
    ad: db.kod,
    konum: db.konum || '',
    koordinat: undefined,
    qrKod: {
      kod: db.kod,
      tapilanTarih: db.created_at ? new Date(db.created_at) : undefined,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sorumlu: { id: db.sorumlu_id, name: 'Sorumlu' } as any,
    toplamTutar: db.toplam_toplanan || 0,
    toplamaBaşarina: db.toplam_toplanan || 0,
    toplamaGecmisi: [],
    durum: (db.durum === 'toplandi' ? 'pasif' : db.durum) as KumbaraStatus,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  }
}

/**
 * Database beneficiary row → IhtiyacSahibi type
 */
type BeneficiaryRow = Tables['beneficiaries']['Row'] & {
  relationship_type?: string | null
}

export function mapBeneficiary(db: BeneficiaryRow): IhtiyacSahibi {
  return {
    id: db.id,
    ad: db.ad || '',
    soyad: db.soyad || '',
    tcKimlikNo: db.tc_kimlik_no || '',
    yabanciKimlikNo: '',
    tur: (db.relationship_type === 'İhtiyaç Sahibi Kişi'
      ? 'ihtiyac-sahibi-kisi'
      : 'bakmakla-yukumlu') as IhtiyacSahibiTuru,
    kategori: (db.kategori || 'ihtiyac-sahibi-aile') as IhtiyacSahibiKategori,
    dogumTarihi: db.dogum_tarihi ? new Date(db.dogum_tarihi) : new Date(),
    cinsiyet: (db.cinsiyet || 'belirtilmemis') as Cinsiyet,
    uyruk: 'Türkiye',
    cepTelefonu: db.telefon || '',
    cepTelefonuOperator: '',
    email: db.email || '',
    ulke: 'Türkiye',
    sehir: db.il || '',
    ilce: db.ilce || '',
    mahalle: '',
    adres: db.adres || '',
    dosyaNo: db.tc_kimlik_no || '',
    kayitTarihi: new Date(db.created_at),
    durum: (db.durum || 'aktif') as IhtiyacDurumu,
    ihtiyacDurumu: (db.ihtiyac_durumu || 'orta') as string,
    basvuruSayisi: 0,
    yardimSayisi: 0,
    rizaBeyaniDurumu: 'alindi',
    toplamYardimTutari: 0,
    aileHaneBilgileri: {
      medeniHal: (db.medeni_hal || 'belirtilmemis') as MedeniHal,
      ailedekiKisiSayisi: db.hane_buyuklugu || 1,
      cocukSayisi: 0,
      yetimSayisi: 0,
      calısanSayisi: 0,
      bakmaklaYukumluSayisi: 0,
    },
    ekonomikSosyalDurum: {
      meslek: db.meslek || '',
      aylikGelir: Number(db.aylik_gelir) || 0,
      egitimDurumu: (db.egitim_durumu || 'belirtilmemis') as EgitimDurumu,
    },
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  } as IhtiyacSahibi
}

/**
 * Database application row → SosyalYardimBasvuru type
 */
export function mapApplication(
  db: Tables['social_aid_applications']['Row'] & {
    beneficiaries?: Tables['beneficiaries']['Row']
  }
): SosyalYardimBasvuru {
  return {
    id: db.id,
    basvuranKisi: {
      ad: db.beneficiaries?.ad || '',
      soyad: db.beneficiaries?.soyad || '',
      tcKimlikNo: db.beneficiaries?.tc_kimlik_no || '',
      telefon: db.beneficiaries?.telefon || '',
      adres: db.beneficiaries?.adres || '',
    },
    yardimTuru: db.yardim_turu as YardimTuru,
    talepEdilenTutar: db.talep_edilen_tutar || undefined,
    gerekce: db.gerekce || '',
    belgeler: [],
    durum: (db.durum || 'beklemede') as BasvuruDurumu,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  }
}

/**
 * Database payment row → Payment type
 */
export function mapPayment(
  db: Tables['payments']['Row'] & {
    beneficiaries?: { ad: string; soyad: string } | null
  }
): Payment {
  return {
    id: db.id,
    applicationId: db.application_id || undefined,
    beneficiaryId: db.beneficiary_id,
    beneficiary: db.beneficiaries
      ? {
          ad: db.beneficiaries.ad,
          soyad: db.beneficiaries.soyad,
        }
      : undefined,
    tutar: db.tutar,
    odemeTarihi: new Date(db.odeme_tarihi),
    odemeYontemi: db.odeme_yontemi as Payment['odemeYontemi'],
    durum: db.durum as Payment['durum'],
    notlar: db.notlar || undefined,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.created_at),
  }
}

/**
 * Database in-kind aid row → InKindAid type
 * DISABLED: in_kind_aids table not in database schema
 */
/*
export function mapInKindAid(
  db: Tables['in_kind_aids']['Row'] & {
    beneficiaries?: { ad: string; soyad: string } | null
  }
): InKindAid {
  return {
    id: db.id,
    beneficiaryId: db.beneficiary_id,
    beneficiary: db.beneficiaries
      ? {
          ad: db.beneficiaries.ad,
          soyad: db.beneficiaries.soyad,
        }
      : undefined,
    yardimTuru: db.yardim_turu,
    miktar: db.miktar || undefined,
    birim: db.birim || undefined,
    dagitimTarihi: new Date(db.dagitim_tarihi),
    notlar: db.notlar || undefined,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  }
}
*/

/**
 * Database hospital row → Hospital type
 */
export function mapHospital(db: Tables['hospitals']['Row']): import('@/types').Hospital {
  return {
    id: db.id,
    name: db.name,
    address: db.address || undefined,
    phone: db.phone || undefined,
    email: db.email || undefined,
    specialties: db.specialties || [],
    isActive: db.is_active,
    notes: db.notes || undefined,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  }
}

/**
 * Database referral row → Referral type
 */
export function mapReferral(
  db: Tables['referrals']['Row'] & {
    beneficiaries?: { ad: string; soyad: string } | null
    hospitals?: { name: string } | null
  }
): import('@/types').Referral {
  return {
    id: db.id,
    beneficiaryId: db.beneficiary_id,
    beneficiary: db.beneficiaries
      ? { ad: db.beneficiaries.ad, soyad: db.beneficiaries.soyad }
      : undefined,
    hospitalId: db.hospital_id,
    hospital: db.hospitals ? { name: db.hospitals.name } : undefined,
    reason: db.reason,
    referralDate: new Date(db.referral_date),
    status: db.status as import('@/types').ReferralStatus,
    notes: db.notes || undefined,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  }
}

/**
 * Database appointment row → HospitalAppointment type
 */
export function mapAppointment(
  db: Tables['hospital_appointments']['Row']
): import('@/types').HospitalAppointment {
  return {
    id: db.id,
    referralId: db.referral_id,
    appointmentDate: new Date(db.appointment_date),
    location: db.location || undefined,
    status: db.status as import('@/types').AppointmentStatus,
    reminderSent: db.reminder_sent,
    notes: db.notes || undefined,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  }
}

/**
 * Database treatment cost row → TreatmentCost type
 */
export function mapTreatmentCost(
  db: Tables['treatment_costs']['Row']
): import('@/types').TreatmentCost {
  return {
    id: db.id,
    referralId: db.referral_id,
    description: db.description,
    amount: Number(db.amount),
    currency: db.currency as import('@/types').Currency,
    paymentStatus: db.payment_status as import('@/types').TreatmentCostStatus,
    paymentDate: db.payment_date ? new Date(db.payment_date) : undefined,
    paymentMethod:
      (db.payment_method as import('@/types').PaymentMethod) || undefined,
    incurredDate: new Date(db.incurred_date),
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  }
}

/**
 * Database treatment outcome row → TreatmentOutcome type
 */
export function mapTreatmentOutcome(
  db: Tables['treatment_outcomes']['Row']
): import('@/types').TreatmentOutcome {
  return {
    id: db.id,
    referralId: db.referral_id,
    appointmentId: db.appointment_id || undefined,
    diagnosis: db.diagnosis || undefined,
    treatmentReceived: db.treatment_received || undefined,
    outcomeNotes: db.outcome_notes || undefined,
    followUpNeeded: db.follow_up_needed,
    followUpDate: db.follow_up_date ? new Date(db.follow_up_date) : undefined,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  }
}
