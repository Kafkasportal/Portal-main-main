import { describe, it, expect } from 'vitest'
import {
  phoneSchema,
  tcKimlikSchema,
  emailSchema,
  donationSchema,
  memberSchema,
  socialAidApplicationSchema,
  loginSchema,
  kumbaraSchema,
  paymentApprovalSchema,
  generalSettingsSchema,
  basicBeneficiarySchema,
  userSchema,
  passwordChangeSchema,
  notificationPreferencesSchema,
  paymentSchema,
  inKindAidSchema,
} from '../validators'

describe('validators', () => {
  describe('phoneSchema', () => {
    it('should accept valid Turkish phone number with +90', () => {
      const result = phoneSchema.safeParse('+905551234567')
      expect(result.success).toBe(true)
    })

    it('should accept valid phone number starting with 0', () => {
      const result = phoneSchema.safeParse('05551234567')
      expect(result.success).toBe(true)
    })

    it('should accept valid phone number starting with 5', () => {
      const result = phoneSchema.safeParse('5551234567')
      expect(result.success).toBe(true)
    })

    it('should accept empty string (optional)', () => {
      const result = phoneSchema.safeParse('')
      expect(result.success).toBe(true)
    })

    it('should reject invalid phone number', () => {
      const result = phoneSchema.safeParse('12345')
      expect(result.success).toBe(false)
    })
  })

  describe('tcKimlikSchema', () => {
    it('should accept valid 11 digit TC number', () => {
      const result = tcKimlikSchema.safeParse('12345678901')
      expect(result.success).toBe(true)
    })

    it('should reject TC number with letters', () => {
      const result = tcKimlikSchema.safeParse('1234567890a')
      expect(result.success).toBe(false)
    })

    it('should reject TC number with wrong length', () => {
      const result = tcKimlikSchema.safeParse('1234567890')
      expect(result.success).toBe(false)
    })

    it('should reject empty string', () => {
      const result = tcKimlikSchema.safeParse('')
      expect(result.success).toBe(false)
    })
  })

  describe('emailSchema', () => {
    it('should accept valid email', () => {
      const result = emailSchema.safeParse('test@example.com')
      expect(result.success).toBe(true)
    })

    it('should accept empty string (optional)', () => {
      const result = emailSchema.safeParse('')
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const result = emailSchema.safeParse('not-an-email')
      expect(result.success).toBe(false)
    })
  })

  describe('donationSchema', () => {
    const validDonation = {
      bagisci: {
        ad: 'Ahmet',
        soyad: 'Yılmaz',
        telefon: '5551234567',
        email: 'test@example.com',
      },
      tutar: 100,
      currency: 'TRY' as const,
      amac: 'genel' as const,
      odemeYontemi: 'nakit' as const,
    }

    it('should accept valid donation', () => {
      const result = donationSchema.safeParse(validDonation)
      expect(result.success).toBe(true)
    })

    it('should reject donation with zero amount', () => {
      const result = donationSchema.safeParse({
        ...validDonation,
        tutar: 0,
      })
      expect(result.success).toBe(false)
    })

    it('should reject donation with short name', () => {
      const result = donationSchema.safeParse({
        ...validDonation,
        bagisci: { ...validDonation.bagisci, ad: 'A' },
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid currency', () => {
      const result = donationSchema.safeParse({
        ...validDonation,
        currency: 'GBP',
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid payment method', () => {
      const result = donationSchema.safeParse({
        ...validDonation,
        odemeYontemi: 'bitcoin',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('memberSchema', () => {
    const validMember = {
      tcKimlikNo: '12345678901',
      ad: 'Ahmet',
      soyad: 'Yılmaz',
      dogumTarihi: '1990-01-15',
      cinsiyet: 'erkek' as const,
      telefon: '05551234567',
      email: 'test@example.com',
      adres: {
        il: 'İstanbul',
        ilce: 'Kadıköy',
      },
      uyeTuru: 'aktif' as const,
    }

    it('should accept valid member', () => {
      const result = memberSchema.safeParse(validMember)
      expect(result.success).toBe(true)
    })

    it('should reject invalid TC number', () => {
      const result = memberSchema.safeParse({
        ...validMember,
        tcKimlikNo: '1234',
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid member type', () => {
      const result = memberSchema.safeParse({
        ...validMember,
        uyeTuru: 'invalid',
      })
      expect(result.success).toBe(false)
    })

    it('should reject missing city', () => {
      const result = memberSchema.safeParse({
        ...validMember,
        adres: { il: '', ilce: 'Kadıköy' },
      })
      expect(result.success).toBe(false)
    })

    it('should accept empty birth date', () => {
      const result = memberSchema.safeParse({
        ...validMember,
        dogumTarihi: '',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid date format', () => {
      const result = memberSchema.safeParse({
        ...validMember,
        dogumTarihi: '15-01-1990',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('socialAidApplicationSchema', () => {
    const validApplication = {
      basvuranKisi: {
        ad: 'Ayşe',
        soyad: 'Kaya',
        tcKimlikNo: '12345678901',
        telefon: '05551234567',
        adres: 'İstanbul Kadıköy Moda Caddesi No:1',
      },
      yardimTuru: 'nakdi' as const,
      talepEdilenTutar: 1000,
      gerekce: 'Bu bir test gerekçesidir ve en az 20 karakter olmalıdır.',
    }

    it('should accept valid application', () => {
      const result = socialAidApplicationSchema.safeParse(validApplication)
      expect(result.success).toBe(true)
    })

    it('should reject short reason', () => {
      const result = socialAidApplicationSchema.safeParse({
        ...validApplication,
        gerekce: 'Kısa',
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid aid type', () => {
      const result = socialAidApplicationSchema.safeParse({
        ...validApplication,
        yardimTuru: 'invalid',
      })
      expect(result.success).toBe(false)
    })

    it('should reject short address', () => {
      const result = socialAidApplicationSchema.safeParse({
        ...validApplication,
        basvuranKisi: { ...validApplication.basvuranKisi, adres: 'İst' },
      })
      expect(result.success).toBe(false)
    })
  })

  describe('loginSchema', () => {
    it('should accept valid login', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(result.success).toBe(true)
    })

    it('should reject short password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '12345',
      })
      expect(result.success).toBe(false)
    })

    it('should reject empty email', () => {
      const result = loginSchema.safeParse({
        email: '',
        password: 'password123',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('kumbaraSchema', () => {
    it('should accept valid kumbara', () => {
      const result = kumbaraSchema.safeParse({
        kod: 'KMB001',
        konum: 'Merkez Cami Girişi',
        sorumluId: 'user-123',
      })
      expect(result.success).toBe(true)
    })

    it('should reject short code', () => {
      const result = kumbaraSchema.safeParse({
        kod: 'K',
        konum: 'Merkez Cami Girişi',
        sorumluId: 'user-123',
      })
      expect(result.success).toBe(false)
    })

    it('should reject short location', () => {
      const result = kumbaraSchema.safeParse({
        kod: 'KMB001',
        konum: 'Cam',
        sorumluId: 'user-123',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('paymentApprovalSchema', () => {
    it('should accept valid payment approval', () => {
      const result = paymentApprovalSchema.safeParse({
        tutar: 500,
        odemeYontemi: 'havale',
      })
      expect(result.success).toBe(true)
    })

    it('should reject zero amount', () => {
      const result = paymentApprovalSchema.safeParse({
        tutar: 0,
        odemeYontemi: 'nakit',
      })
      expect(result.success).toBe(false)
    })

    it('should reject negative amount', () => {
      const result = paymentApprovalSchema.safeParse({
        tutar: -100,
        odemeYontemi: 'nakit',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('generalSettingsSchema', () => {
    it('should accept valid settings', () => {
      const result = generalSettingsSchema.safeParse({
        dernekAdi: 'Test Derneği',
        email: 'info@dernek.org',
        telefon: '02125551234',
        adres: 'İstanbul Kadıköy Moda Caddesi No:1',
        aidatTutari: 100,
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const result = generalSettingsSchema.safeParse({
        dernekAdi: 'Test Derneği',
        email: 'not-an-email',
        telefon: '02125551234',
        adres: 'İstanbul Kadıköy Moda Caddesi No:1',
        aidatTutari: 100,
      })
      expect(result.success).toBe(false)
    })

    it('should reject short organization name', () => {
      const result = generalSettingsSchema.safeParse({
        dernekAdi: 'AB',
        email: 'info@dernek.org',
        telefon: '02125551234',
        adres: 'İstanbul Kadıköy Moda Caddesi No:1',
        aidatTutari: 100,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('basicBeneficiarySchema', () => {
    it('should accept valid beneficiary', () => {
      const result = basicBeneficiarySchema.safeParse({
        tcKimlikNo: '12345678901',
        ad: 'Mehmet',
        soyad: 'Kaya',
        telefon: '5551234567',
      })
      expect(result.success).toBe(true)
    })

    it('should reject short name', () => {
      const result = basicBeneficiarySchema.safeParse({
        tcKimlikNo: '12345678901',
        ad: 'M',
        soyad: 'Kaya',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('userSchema', () => {
    it('should accept valid user', () => {
      const result = userSchema.safeParse({
        name: 'Admin User',
        email: 'admin@dernek.org',
        password: 'Admin123!',
        role: 'admin',
      })
      expect(result.success).toBe(true)
    })

    it('should reject weak password', () => {
      const result = userSchema.safeParse({
        name: 'Admin User',
        email: 'admin@dernek.org',
        password: 'password',
        role: 'admin',
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid role', () => {
      const result = userSchema.safeParse({
        name: 'Admin User',
        email: 'admin@dernek.org',
        password: 'Admin123!',
        role: 'superadmin',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('passwordChangeSchema', () => {
    it('should accept valid password change', () => {
      const result = passwordChangeSchema.safeParse({
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass456!',
        confirmPassword: 'NewPass456!',
      })
      expect(result.success).toBe(true)
    })

    it('should reject mismatched passwords', () => {
      const result = passwordChangeSchema.safeParse({
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass456!',
        confirmPassword: 'DifferentPass789!',
      })
      expect(result.success).toBe(false)
    })

    it('should reject weak new password', () => {
      const result = passwordChangeSchema.safeParse({
        currentPassword: 'OldPass123!',
        newPassword: 'weak',
        confirmPassword: 'weak',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('notificationPreferencesSchema', () => {
    it('should accept valid preferences', () => {
      const result = notificationPreferencesSchema.safeParse({
        email: true,
        push: false,
        sms: true,
      })
      expect(result.success).toBe(true)
    })

    it('should reject missing fields', () => {
      const result = notificationPreferencesSchema.safeParse({
        email: true,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('paymentSchema', () => {
    it('should accept valid payment', () => {
      const result = paymentSchema.safeParse({
        beneficiaryId: 1,
        tutar: 500,
        odemeTarihi: '2024-01-15',
        odemeYontemi: 'nakit',
        durum: 'odendi',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid beneficiary ID', () => {
      const result = paymentSchema.safeParse({
        beneficiaryId: 0,
        tutar: 500,
        odemeTarihi: '2024-01-15',
        odemeYontemi: 'nakit',
        durum: 'odendi',
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid date format', () => {
      const result = paymentSchema.safeParse({
        beneficiaryId: 1,
        tutar: 500,
        odemeTarihi: '15-01-2024',
        odemeYontemi: 'nakit',
        durum: 'odendi',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('inKindAidSchema', () => {
    it('should accept valid in-kind aid', () => {
      const result = inKindAidSchema.safeParse({
        beneficiaryId: 1,
        yardimTuru: 'gida',
        miktar: 10,
        birim: 'paket',
        dagitimTarihi: '2024-01-15',
      })
      expect(result.success).toBe(true)
    })

    it('should reject zero quantity', () => {
      const result = inKindAidSchema.safeParse({
        beneficiaryId: 1,
        yardimTuru: 'gida',
        miktar: 0,
        birim: 'paket',
        dagitimTarihi: '2024-01-15',
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid aid type', () => {
      const result = inKindAidSchema.safeParse({
        beneficiaryId: 1,
        yardimTuru: 'elektronik',
        miktar: 10,
        birim: 'paket',
        dagitimTarihi: '2024-01-15',
      })
      expect(result.success).toBe(false)
    })
  })
})
