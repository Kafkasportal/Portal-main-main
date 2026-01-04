/**
 * Mapper Tests
 * Tests for database row → application type transformations
 */

import { describe, it, expect } from 'vitest'
import { mapMember, mapDonation, mapBeneficiary, mapKumbara } from './mappers'
import type { Database } from '@/types/supabase'

type Tables = Database['public']['Tables']

describe('mapMember', () => {
  const mockMemberRow: Tables['members']['Row'] = {
    id: 1,
    tc_kimlik_no: '12345678901',
    ad: 'Ahmet',
    soyad: 'Yılmaz',
    dogum_tarihi: '1990-01-01',
    cinsiyet: 'erkek',
    telefon: '05551234567',
    email: 'ahmet@example.com',
    adres: 'Test Mahallesi',
    il: 'İstanbul',
    ilce: 'Kadıköy',
    kan_grubu: 'A+',
    meslek: 'Mühendis',
    uye_turu: 'standart',
    kayit_tarihi: '2024-01-01',
    aidat_durumu: 'odendi',
    notlar: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  it('maps all fields correctly', () => {
    const result = mapMember(mockMemberRow)

    expect(result.id).toBe(1)
    expect(result.tcKimlikNo).toBe('12345678901')
    expect(result.ad).toBe('Ahmet')
    expect(result.soyad).toBe('Yılmaz')
    expect(result.telefon).toBe('05551234567')
    expect(result.email).toBe('ahmet@example.com')
  })

  it('maps address fields correctly', () => {
    const result = mapMember(mockMemberRow)

    expect(result.adres.il).toBe('İstanbul')
    expect(result.adres.ilce).toBe('Kadıköy')
    expect(result.adres.acikAdres).toBe('Test Mahallesi')
  })

  it('converts uye_turu "standart" to "aktif"', () => {
    const result = mapMember(mockMemberRow)
    expect(result.uyeTuru).toBe('aktif')
  })

  it('keeps other uye_turu values unchanged', () => {
    const onursalRow = { ...mockMemberRow, uye_turu: 'onursal' as const }
    const result = mapMember(onursalRow)
    expect(result.uyeTuru).toBe('onursal')
  })

  it('maps aidat_durumu "odendi" to "guncel"', () => {
    const result = mapMember(mockMemberRow)
    expect(result.aidatDurumu).toBe('guncel')
  })

  it('maps aidat_durumu "gecikti" to "gecmis"', () => {
    const geciktiRow = { ...mockMemberRow, aidat_durumu: 'gecikti' as const }
    const result = mapMember(geciktiRow)
    expect(result.aidatDurumu).toBe('gecmis')
  })

  it('maps aidat_durumu "beklemede" to "muaf"', () => {
    const beklemedeRow = { ...mockMemberRow, aidat_durumu: 'beklemede' as const }
    const result = mapMember(beklemedeRow)
    expect(result.aidatDurumu).toBe('muaf')
  })

  it('handles null email as undefined', () => {
    const noEmailRow = { ...mockMemberRow, email: null }
    const result = mapMember(noEmailRow)
    expect(result.email).toBeUndefined()
  })

  it('handles null dogum_tarihi', () => {
    const noDateRow = { ...mockMemberRow, dogum_tarihi: null }
    const result = mapMember(noDateRow)
    expect(result.dogumTarihi).toBeInstanceOf(Date)
  })

  it('converts date strings to Date objects', () => {
    const result = mapMember(mockMemberRow)
    expect(result.dogumTarihi).toBeInstanceOf(Date)
    expect(result.kayitTarihi).toBeInstanceOf(Date)
    expect(result.createdAt).toBeInstanceOf(Date)
    expect(result.updatedAt).toBeInstanceOf(Date)
  })
})

describe('mapDonation', () => {
  const mockDonationRow: Tables['donations']['Row'] = {
    id: 100,
    member_id: 1,
    bagisci_adi: 'Mehmet Demir',
    tutar: 500,
    currency: 'TRY',
    amac: 'genel',
    odeme_yontemi: 'nakit',
    tarih: '2024-01-15T10:30:00Z',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
  }

  it('maps all fields correctly', () => {
    const result = mapDonation(mockDonationRow)

    expect(result.id).toBe(100)
    expect(result.tutar).toBe(500)
    expect(result.currency).toBe('TRY')
    expect(result.amac).toBe('genel')
  })

  it('maps bagisci information', () => {
    const result = mapDonation(mockDonationRow)

    expect(result.bagisci.id).toBe(1)
    expect(result.bagisci.ad).toBe('Mehmet Demir')
  })

  it('converts odeme_yontemi "kredi_karti" to "kredi-karti"', () => {
    const ccRow = { ...mockDonationRow, odeme_yontemi: 'kredi_karti' }
    const result = mapDonation(ccRow as any)
    expect(result.odemeYontemi).toBe('kredi-karti')
  })

  it('keeps other payment methods unchanged', () => {
    const havaleRow = { ...mockDonationRow, odeme_yontemi: 'havale' }
    const result = mapDonation(havaleRow as any)
    expect(result.odemeYontemi).toBe('havale')
  })

  it('sets durum as "tamamlandi"', () => {
    const result = mapDonation(mockDonationRow)
    expect(result.durum).toBe('tamamlandi')
  })

  it('uses tarih for createdAt when available', () => {
    const result = mapDonation(mockDonationRow)
    expect(result.createdAt).toBeInstanceOf(Date)
    expect(result.createdAt.toISOString()).toBe('2024-01-15T10:30:00.000Z')
  })

  it('falls back to created_at when tarih is null', () => {
    const noTarihRow = { ...mockDonationRow, tarih: null }
    const result = mapDonation(noTarihRow)
    expect(result.createdAt).toBeInstanceOf(Date)
  })

  it('handles null member_id', () => {
    const noMemberRow = { ...mockDonationRow, member_id: null }
    const result = mapDonation(noMemberRow)
    expect(result.bagisci.id).toBe(100) // Falls back to donation id
  })
})

describe('mapBeneficiary', () => {
  const mockBeneficiaryRow = {
    id: 50,
    ad: 'Ayşe',
    soyad: 'Kaya',
    tc_kimlik_no: '98765432109',
    dogum_tarihi: '1985-05-15',
    cinsiyet: 'kadin',
    telefon: '05559876543',
    email: 'ayse@example.com',
    il: 'Ankara',
    ilce: 'Çankaya',
    adres: 'Test Sokak',
    kategori: 'ihtiyac-sahibi-aile',
    durum: 'aktif',
    ihtiyac_durumu: 'orta',
    relationship_type: 'İhtiyaç Sahibi Kişi',
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z',
  }

  it('maps all fields correctly', () => {
    const result = mapBeneficiary(mockBeneficiaryRow as any)

    expect(result.id).toBe(50)
    expect(result.ad).toBe('Ayşe')
    expect(result.soyad).toBe('Kaya')
    expect(result.tcKimlikNo).toBe('98765432109')
  })

  it('maps address fields correctly', () => {
    const result = mapBeneficiary(mockBeneficiaryRow as any)

    expect(result.sehir).toBe('Ankara')
    expect(result.ilce).toBe('Çankaya')
    expect(result.adres).toBe('Test Sokak')
  })

  it('converts relationship_type "İhtiyaç Sahibi Kişi" to "ihtiyac-sahibi-kisi"', () => {
    const result = mapBeneficiary(mockBeneficiaryRow as any)
    expect(result.tur).toBe('ihtiyac-sahibi-kisi')
  })

  it('maps other relationship_type to "bakmakla-yukumlu"', () => {
    const otherRow = { ...mockBeneficiaryRow, relationship_type: 'Other' }
    const result = mapBeneficiary(otherRow as any)
    expect(result.tur).toBe('bakmakla-yukumlu')
  })

  it('sets default values for optional fields', () => {
    const result = mapBeneficiary(mockBeneficiaryRow as any)

    expect(result.uyruk).toBe('Türkiye')
    expect(result.ulke).toBe('Türkiye')
    expect(result.yabanciKimlikNo).toBe('')
  })

  it('handles null values gracefully', () => {
    const nullRow = {
      ...mockBeneficiaryRow,
      ad: null,
      email: null,
      telefon: null,
    }
    const result = mapBeneficiary(nullRow as any)

    expect(result.ad).toBe('')
    expect(result.email).toBe('')
    expect(result.cepTelefonu).toBe('')
  })

  it('uses tc_kimlik_no as dosyaNo', () => {
    const result = mapBeneficiary(mockBeneficiaryRow as any)
    expect(result.dosyaNo).toBe('98765432109')
  })
})

describe('mapKumbara', () => {
  const mockKumbaraRow: Tables['kumbaras']['Row'] = {
    id: 10,
    kod: 'KUM-001',
    konum: 'Merkez Cami',
    sorumlu_id: 5,
    durum: 'aktif',
    toplam_toplanan: 1500,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  it('maps all fields correctly', () => {
    const result = mapKumbara(mockKumbaraRow)

    expect(result.id).toBe(10)
    expect(result.kod).toBe('KUM-001')
    expect(result.konum).toBe('Merkez Cami')
  })

  it('uses kod as ad', () => {
    const result = mapKumbara(mockKumbaraRow)
    expect(result.ad).toBe('KUM-001')
  })

  it('maps toplam_toplanan to toplamTutar and toplamaBaşarina', () => {
    const result = mapKumbara(mockKumbaraRow)
    expect(result.toplamTutar).toBe(1500)
    expect(result.toplamaBaşarina).toBe(1500)
  })

  it('converts durum "toplandi" to "pasif"', () => {
    const toplandiRow = { ...mockKumbaraRow, durum: 'toplandi' as const }
    const result = mapKumbara(toplandiRow)
    expect(result.durum).toBe('pasif')
  })

  it('keeps other durum values unchanged', () => {
    const result = mapKumbara(mockKumbaraRow)
    expect(result.durum).toBe('aktif')
  })

  it('creates QR kod object', () => {
    const result = mapKumbara(mockKumbaraRow)
    expect(result.qrKod.kod).toBe('KUM-001')
    expect(result.qrKod.tapilanTarih).toBeInstanceOf(Date)
  })

  it('handles null konum', () => {
    const noKonumRow = { ...mockKumbaraRow, konum: null }
    const result = mapKumbara(noKonumRow)
    expect(result.konum).toBe('')
  })
})
