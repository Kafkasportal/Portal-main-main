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

// TODO: Add remaining mappers as needed:
// - mapPayment
// - mapInKindAid
// - mapHospital
// - mapReferral
// - mapAppointment
// - mapTreatmentCost
// - mapTreatmentOutcome
// - mapUser
