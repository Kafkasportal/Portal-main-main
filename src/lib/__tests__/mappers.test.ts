import { describe, it, expect } from 'vitest'
import {
  mapMember,
  mapDonation,
  mapKumbara,
  mapBeneficiary,
  mapApplication,
  mapPayment,
  mapInKindAid,
  mapHospital,
  mapReferral,
  mapAppointment,
  mapTreatmentCost,
  mapTreatmentOutcome,
  mapUser,
} from '../services/mappers'

describe('mappers', () => {
  describe('mapMember', () => {
    const dbMember = {
      id: 1,
      tc_kimlik_no: '12345678901',
      ad: 'Ahmet',
      soyad: 'Yılmaz',
      dogum_tarihi: '1990-01-15',
      cinsiyet: 'erkek',
      telefon: '05551234567',
      email: 'ahmet@example.com',
      il: 'İstanbul',
      ilce: 'Kadıköy',
      adres: 'Moda Caddesi No:1',
      uye_turu: 'standart',
      aidat_durumu: 'odendi',
      kan_grubu: 'A+',
      meslek: 'Mühendis',
      kayit_tarihi: '2023-01-01',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-06-01T00:00:00Z',
    }

    it('should map basic fields correctly', () => {
      const result = mapMember(dbMember)

      expect(result.id).toBe(1)
      expect(result.tcKimlikNo).toBe('12345678901')
      expect(result.ad).toBe('Ahmet')
      expect(result.soyad).toBe('Yılmaz')
      expect(result.telefon).toBe('05551234567')
      expect(result.email).toBe('ahmet@example.com')
    })

    it('should map address correctly', () => {
      const result = mapMember(dbMember)

      expect(result.adres.il).toBe('İstanbul')
      expect(result.adres.ilce).toBe('Kadıköy')
      expect(result.adres.acikAdres).toBe('Moda Caddesi No:1')
    })

    it('should convert standart to aktif for member type', () => {
      const result = mapMember(dbMember)
      expect(result.uyeTuru).toBe('aktif')
    })

    it('should convert aidat status correctly', () => {
      expect(mapMember({ ...dbMember, aidat_durumu: 'odendi' }).aidatDurumu).toBe('guncel')
      expect(mapMember({ ...dbMember, aidat_durumu: 'gecikti' }).aidatDurumu).toBe('gecmis')
      expect(mapMember({ ...dbMember, aidat_durumu: 'beklemede' }).aidatDurumu).toBe('muaf')
    })

    it('should convert dates', () => {
      const result = mapMember(dbMember)

      expect(result.dogumTarihi).toBeInstanceOf(Date)
      expect(result.kayitTarihi).toBeInstanceOf(Date)
      expect(result.createdAt).toBeInstanceOf(Date)
      expect(result.updatedAt).toBeInstanceOf(Date)
    })

    it('should handle null optional fields', () => {
      const result = mapMember({
        ...dbMember,
        email: null,
        kan_grubu: null,
        meslek: null,
      })

      expect(result.email).toBeUndefined()
      expect(result.kanGrubu).toBeUndefined()
      expect(result.meslek).toBeUndefined()
    })
  })

  describe('mapDonation', () => {
    const dbDonation = {
      id: 1,
      member_id: 10,
      bagisci_adi: 'Mehmet Demir',
      tutar: 1000,
      currency: 'TRY',
      amac: 'egitim',
      odeme_yontemi: 'kredi_karti',
      tarih: '2024-01-15T10:00:00Z',
      created_at: '2024-01-15T10:00:00Z',
    }

    it('should map basic fields correctly', () => {
      const result = mapDonation(dbDonation)

      expect(result.id).toBe(1)
      expect(result.tutar).toBe(1000)
      expect(result.currency).toBe('TRY')
      expect(result.amac).toBe('egitim')
    })

    it('should map donor correctly', () => {
      const result = mapDonation(dbDonation)

      expect(result.bagisci.id).toBe(10)
      expect(result.bagisci.ad).toBe('Mehmet Demir')
    })

    it('should convert payment method', () => {
      const result = mapDonation(dbDonation)
      expect(result.odemeYontemi).toBe('kredi-karti')
    })

    it('should set status to tamamlandi', () => {
      const result = mapDonation(dbDonation)
      expect(result.durum).toBe('tamamlandi')
    })

    it('should use donation id if member_id is null', () => {
      const result = mapDonation({ ...dbDonation, member_id: null })
      expect(result.bagisci.id).toBe(1)
    })
  })

  describe('mapKumbara', () => {
    const dbKumbara = {
      id: 1,
      kod: 'KMB001',
      konum: 'Merkez Cami',
      sorumlu_id: 'user-123',
      durum: 'aktif',
      toplam_toplanan: 5000,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    it('should map basic fields correctly', () => {
      const result = mapKumbara(dbKumbara)

      expect(result.id).toBe(1)
      expect(result.kod).toBe('KMB001')
      expect(result.konum).toBe('Merkez Cami')
      expect(result.durum).toBe('aktif')
    })

    it('should map QR code', () => {
      const result = mapKumbara(dbKumbara)

      expect(result.qrKod?.kod).toBe('KMB001')
      expect(result.qrKod?.tapilanTarih).toBeInstanceOf(Date)
    })

    it('should map totals', () => {
      const result = mapKumbara(dbKumbara)

      expect(result.toplamTutar).toBe(5000)
      expect(result.toplamaBaşarina).toBe(5000)
    })

    it('should convert toplandi status to pasif', () => {
      const result = mapKumbara({ ...dbKumbara, durum: 'toplandi' })
      expect(result.durum).toBe('pasif')
    })
  })

  describe('mapBeneficiary', () => {
    const dbBeneficiary = {
      id: 1,
      ad: 'Fatma',
      soyad: 'Kaya',
      tc_kimlik_no: '12345678901',
      telefon: '05551234567',
      email: 'fatma@example.com',
      kategori: 'ihtiyac-sahibi-aile',
      dogum_tarihi: '1985-05-20',
      cinsiyet: 'kadin',
      il: 'İstanbul',
      ilce: 'Üsküdar',
      adres: 'Test Sokak No:5',
      durum: 'aktif',
      ihtiyac_durumu: 'yuksek',
      medeni_hal: 'evli',
      hane_buyuklugu: 4,
      meslek: 'Ev Hanımı',
      aylik_gelir: '2000',
      egitim_durumu: 'lise',
      relationship_type: 'İhtiyaç Sahibi Kişi',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    it('should map basic fields correctly', () => {
      const result = mapBeneficiary(dbBeneficiary)

      expect(result.id).toBe(1)
      expect(result.ad).toBe('Fatma')
      expect(result.soyad).toBe('Kaya')
      expect(result.tcKimlikNo).toBe('12345678901')
    })

    it('should map contact fields', () => {
      const result = mapBeneficiary(dbBeneficiary)

      expect(result.cepTelefonu).toBe('05551234567')
      expect(result.email).toBe('fatma@example.com')
    })

    it('should map address fields', () => {
      const result = mapBeneficiary(dbBeneficiary)

      expect(result.sehir).toBe('İstanbul')
      expect(result.ilce).toBe('Üsküdar')
      expect(result.adres).toBe('Test Sokak No:5')
      expect(result.ulke).toBe('Türkiye')
    })

    it('should map family info', () => {
      const result = mapBeneficiary(dbBeneficiary)

      expect(result.aileHaneBilgileri?.ailedekiKisiSayisi).toBe(4)
      expect(result.aileHaneBilgileri?.medeniHal).toBe('evli')
    })

    it('should map economic status', () => {
      const result = mapBeneficiary(dbBeneficiary)

      expect(result.ekonomikSosyalDurum?.meslek).toBe('Ev Hanımı')
      expect(result.ekonomikSosyalDurum?.aylikGelir).toBe(2000)
    })

    it('should map relationship type correctly', () => {
      expect(mapBeneficiary(dbBeneficiary).tur).toBe('ihtiyac-sahibi-kisi')

      const depResult = mapBeneficiary({
        ...dbBeneficiary,
        relationship_type: 'Bakmakla Yükümlü',
      })
      expect(depResult.tur).toBe('bakmakla-yukumlu')
    })
  })

  describe('mapApplication', () => {
    const dbApplication = {
      id: 1,
      beneficiary_id: 5,
      yardim_turu: 'nakdi',
      talep_edilen_tutar: 2000,
      gerekce: 'Test gerekçe',
      durum: 'beklemede',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
      beneficiaries: {
        id: 5,
        ad: 'Ali',
        soyad: 'Veli',
        tc_kimlik_no: '11111111111',
        telefon: '05551111111',
        adres: 'Test Adres',
        email: null,
        cinsiyet: null,
        dogum_tarihi: null,
        il: null,
        ilce: null,
        durum: 'aktif',
        kategori: null,
        ihtiyac_durumu: null,
        medeni_hal: null,
        hane_buyuklugu: null,
        meslek: null,
        aylik_gelir: null,
        egitim_durumu: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    }

    it('should map basic fields correctly', () => {
      const result = mapApplication(dbApplication)

      expect(result.id).toBe(1)
      expect(result.yardimTuru).toBe('nakdi')
      expect(result.talepEdilenTutar).toBe(2000)
      expect(result.gerekce).toBe('Test gerekçe')
      expect(result.durum).toBe('beklemede')
    })

    it('should map applicant info from beneficiary', () => {
      const result = mapApplication(dbApplication)

      expect(result.basvuranKisi.ad).toBe('Ali')
      expect(result.basvuranKisi.soyad).toBe('Veli')
      expect(result.basvuranKisi.tcKimlikNo).toBe('11111111111')
    })
  })

  describe('mapPayment', () => {
    const dbPayment = {
      id: 1,
      beneficiary_id: 5,
      application_id: 10,
      tutar: 1500,
      odeme_tarihi: '2024-01-20',
      odeme_yontemi: 'nakit',
      durum: 'odendi',
      notlar: 'Test notu',
      created_at: '2024-01-20T00:00:00Z',
      beneficiaries: { ad: 'Ayşe', soyad: 'Kara' },
    }

    it('should map basic fields correctly', () => {
      const result = mapPayment(dbPayment)

      expect(result.id).toBe(1)
      expect(result.beneficiaryId).toBe(5)
      expect(result.applicationId).toBe(10)
      expect(result.tutar).toBe(1500)
      expect(result.odemeYontemi).toBe('nakit')
      expect(result.durum).toBe('odendi')
    })

    it('should map beneficiary name', () => {
      const result = mapPayment(dbPayment)

      expect(result.beneficiary?.ad).toBe('Ayşe')
      expect(result.beneficiary?.soyad).toBe('Kara')
    })

    it('should handle null beneficiary', () => {
      const result = mapPayment({ ...dbPayment, beneficiaries: null })
      expect(result.beneficiary).toBeUndefined()
    })
  })

  describe('mapInKindAid', () => {
    const dbInKindAid = {
      id: 1,
      beneficiary_id: 3,
      yardim_turu: 'gida',
      miktar: 10,
      birim: 'paket',
      dagitim_tarihi: '2024-01-25',
      notlar: 'Gıda paketi dağıtıldı',
      created_at: '2024-01-25T00:00:00Z',
      updated_at: '2024-01-25T00:00:00Z',
      beneficiaries: { ad: 'Zeynep', soyad: 'Demir' },
    }

    it('should map basic fields correctly', () => {
      const result = mapInKindAid(dbInKindAid)

      expect(result.id).toBe(1)
      expect(result.beneficiaryId).toBe(3)
      expect(result.yardimTuru).toBe('gida')
      expect(result.miktar).toBe(10)
      expect(result.birim).toBe('paket')
      expect(result.notlar).toBe('Gıda paketi dağıtıldı')
    })

    it('should map beneficiary name', () => {
      const result = mapInKindAid(dbInKindAid)

      expect(result.beneficiary?.ad).toBe('Zeynep')
      expect(result.beneficiary?.soyad).toBe('Demir')
    })
  })

  describe('mapHospital', () => {
    const dbHospital = {
      id: 'hospital-1',
      name: 'Test Hastanesi',
      address: 'Test Adres',
      phone: '02121234567',
      email: 'info@testhastanesi.com',
      specialties: ['dahiliye', 'ortopedi'],
      is_active: true,
      notes: 'Test notu',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    it('should map all fields correctly', () => {
      const result = mapHospital(dbHospital)

      expect(result.id).toBe('hospital-1')
      expect(result.name).toBe('Test Hastanesi')
      expect(result.address).toBe('Test Adres')
      expect(result.phone).toBe('02121234567')
      expect(result.email).toBe('info@testhastanesi.com')
      expect(result.specialties).toEqual(['dahiliye', 'ortopedi'])
      expect(result.isActive).toBe(true)
      expect(result.notes).toBe('Test notu')
    })
  })

  describe('mapReferral', () => {
    const dbReferral = {
      id: 'ref-1',
      beneficiary_id: 'ben-1',
      hospital_id: 'hosp-1',
      reason: 'Kontrol',
      referral_date: '2024-02-01',
      status: 'referred',
      notes: 'Not',
      created_at: '2024-02-01T00:00:00Z',
      updated_at: '2024-02-01T00:00:00Z',
      beneficiaries: { ad: 'Test', soyad: 'User' },
      hospitals: { name: 'Test Hospital' },
    }

    it('should map all fields correctly', () => {
      const result = mapReferral(dbReferral)

      expect(result.id).toBe('ref-1')
      expect(result.beneficiaryId).toBe('ben-1')
      expect(result.hospitalId).toBe('hosp-1')
      expect(result.reason).toBe('Kontrol')
      expect(result.status).toBe('referred')
      expect(result.beneficiary?.ad).toBe('Test')
      expect(result.hospital?.name).toBe('Test Hospital')
    })
  })

  describe('mapAppointment', () => {
    const dbAppointment = {
      id: 'app-1',
      referral_id: 'ref-1',
      appointment_date: '2024-02-15T10:00:00Z',
      location: 'Poliklinik 3',
      status: 'scheduled',
      reminder_sent: false,
      notes: 'Sabah randevusu',
      created_at: '2024-02-01T00:00:00Z',
      updated_at: '2024-02-01T00:00:00Z',
    }

    it('should map all fields correctly', () => {
      const result = mapAppointment(dbAppointment)

      expect(result.id).toBe('app-1')
      expect(result.referralId).toBe('ref-1')
      expect(result.location).toBe('Poliklinik 3')
      expect(result.status).toBe('scheduled')
      expect(result.reminderSent).toBe(false)
      expect(result.appointmentDate).toBeInstanceOf(Date)
    })
  })

  describe('mapTreatmentCost', () => {
    const dbTreatmentCost = {
      id: 'cost-1',
      referral_id: 'ref-1',
      description: 'MR çekimi',
      amount: 500,
      currency: 'TRY',
      payment_status: 'pending',
      payment_date: null,
      payment_method: null,
      incurred_date: '2024-02-20',
      created_at: '2024-02-20T00:00:00Z',
      updated_at: '2024-02-20T00:00:00Z',
    }

    it('should map all fields correctly', () => {
      const result = mapTreatmentCost(dbTreatmentCost)

      expect(result.id).toBe('cost-1')
      expect(result.referralId).toBe('ref-1')
      expect(result.description).toBe('MR çekimi')
      expect(result.amount).toBe(500)
      expect(result.currency).toBe('TRY')
      expect(result.paymentStatus).toBe('pending')
    })
  })

  describe('mapTreatmentOutcome', () => {
    const dbOutcome = {
      id: 'out-1',
      referral_id: 'ref-1',
      appointment_id: 'app-1',
      diagnosis: 'Test tanı',
      treatment_received: 'Test tedavi',
      outcome_notes: 'Test not',
      follow_up_needed: true,
      follow_up_date: '2024-03-15',
      created_at: '2024-02-25T00:00:00Z',
      updated_at: '2024-02-25T00:00:00Z',
    }

    it('should map all fields correctly', () => {
      const result = mapTreatmentOutcome(dbOutcome)

      expect(result.id).toBe('out-1')
      expect(result.referralId).toBe('ref-1')
      expect(result.appointmentId).toBe('app-1')
      expect(result.diagnosis).toBe('Test tanı')
      expect(result.treatmentReceived).toBe('Test tedavi')
      expect(result.followUpNeeded).toBe(true)
      expect(result.followUpDate).toBeInstanceOf(Date)
    })
  })

  describe('mapUser', () => {
    const dbUser = {
      id: 'user-1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      avatar_url: 'https://example.com/avatar.png',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    it('should map basic fields correctly', () => {
      const result = mapUser(dbUser)

      expect(result.id).toBe('user-1')
      expect(result.name).toBe('Admin User')
      expect(result.email).toBe('admin@example.com')
      expect(result.role).toBe('admin')
      expect(result.avatar).toBe('https://example.com/avatar.png')
      expect(result.isActive).toBe(true)
    })

    it('should convert moderator role to gorevli', () => {
      const result = mapUser({ ...dbUser, role: 'moderator' })
      expect(result.role).toBe('gorevli')
    })

    it('should convert user role to uye', () => {
      const result = mapUser({ ...dbUser, role: 'user' })
      expect(result.role).toBe('uye')
    })

    it('should handle null avatar', () => {
      const result = mapUser({ ...dbUser, avatar_url: null })
      expect(result.avatar).toBeUndefined()
    })
  })
})
