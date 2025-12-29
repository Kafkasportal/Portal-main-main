import {
  phoneSchema,
  tcKimlikSchema,
  emailSchema,
  donationSchema,
  memberSchema,
} from './validators'

describe('phoneSchema', () => {
  it('should accept valid Turkish phone numbers', () => {
    expect(phoneSchema.safeParse('05551234567').success).toBe(true)
    expect(phoneSchema.safeParse('5551234567').success).toBe(true)
    expect(phoneSchema.safeParse('+905551234567').success).toBe(true)
    expect(phoneSchema.safeParse('05051234567').success).toBe(true)
  })

  it('should accept empty string', () => {
    expect(phoneSchema.safeParse('').success).toBe(true)
  })

  it('should accept undefined (optional)', () => {
    expect(phoneSchema.safeParse(undefined).success).toBe(true)
  })

  it('should reject invalid phone numbers', () => {
    expect(phoneSchema.safeParse('123').success).toBe(false)
    expect(phoneSchema.safeParse('abc').success).toBe(false)
    expect(phoneSchema.safeParse('555 123 4567').success).toBe(false)
    expect(phoneSchema.safeParse('+1234567890').success).toBe(false)
  })

  it('should reject phone numbers not starting with 5 after country code', () => {
    expect(phoneSchema.safeParse('04551234567').success).toBe(false)
    expect(phoneSchema.safeParse('+904551234567').success).toBe(false)
  })
})

describe('tcKimlikSchema', () => {
  it('should accept valid 11-digit TC number', () => {
    expect(tcKimlikSchema.safeParse('12345678901').success).toBe(true)
    expect(tcKimlikSchema.safeParse('98765432109').success).toBe(true)
  })

  it('should reject TC numbers with incorrect length', () => {
    const result = tcKimlikSchema.safeParse('123456789')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'TC Kimlik numarası 11 haneli olmalıdır'
      )
    }
  })

  it('should reject TC numbers with non-numeric characters', () => {
    const result = tcKimlikSchema.safeParse('1234567890a')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'TC Kimlik numarası sadece rakamlardan oluşmalıdır'
      )
    }
  })

  it('should reject TC numbers with spaces', () => {
    expect(tcKimlikSchema.safeParse('123 456 789 01').success).toBe(false)
  })
})

describe('emailSchema', () => {
  it('should accept valid email addresses', () => {
    expect(emailSchema.safeParse('test@example.com').success).toBe(true)
    expect(emailSchema.safeParse('user.name@domain.co.uk').success).toBe(true)
    expect(emailSchema.safeParse('test+tag@example.org').success).toBe(true)
  })

  it('should accept empty string (optional)', () => {
    expect(emailSchema.safeParse('').success).toBe(true)
  })

  it('should accept undefined (optional)', () => {
    expect(emailSchema.safeParse(undefined).success).toBe(true)
  })

  it('should reject invalid email addresses', () => {
    expect(emailSchema.safeParse('notanemail').success).toBe(false)
    expect(emailSchema.safeParse('@example.com').success).toBe(false)
    expect(emailSchema.safeParse('test@').success).toBe(false)
    expect(emailSchema.safeParse('test @example.com').success).toBe(false)
  })
})

describe('donationSchema', () => {
  const validDonation = {
    bagisci: {
      ad: 'Ahmet',
      soyad: 'Yılmaz',
      telefon: '05551234567',
      email: 'ahmet@example.com',
      adres: 'İstanbul',
    },
    tutar: 100,
    currency: 'TRY' as const,
    amac: 'genel' as const,
    odemeYontemi: 'nakit' as const,
    makbuzNo: 'MAK-001',
    aciklama: 'Test bağışı',
  }

  it('should accept valid donation data', () => {
    const result = donationSchema.safeParse(validDonation)
    expect(result.success).toBe(true)
  })

  it('should accept minimal required fields', () => {
    const minimalDonation = {
      bagisci: {
        ad: 'Ali',
        soyad: 'Veli',
      },
      tutar: 50,
      currency: 'TRY' as const,
      amac: 'egitim' as const,
      odemeYontemi: 'havale' as const,
    }
    expect(donationSchema.safeParse(minimalDonation).success).toBe(true)
  })

  it('should reject donation with invalid donor name (too short)', () => {
    const result = donationSchema.safeParse({
      ...validDonation,
      bagisci: { ...validDonation.bagisci, ad: 'A' },
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('en az 2 karakter')
    }
  })

  it('should reject donation with invalid donor name (too long)', () => {
    const result = donationSchema.safeParse({
      ...validDonation,
      bagisci: {
        ...validDonation.bagisci,
        ad: 'A'.repeat(51),
      },
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('en fazla 50 karakter')
    }
  })

  it('should reject donation with zero or negative amount', () => {
    const resultZero = donationSchema.safeParse({
      ...validDonation,
      tutar: 0,
    })
    expect(resultZero.success).toBe(false)

    const resultNegative = donationSchema.safeParse({
      ...validDonation,
      tutar: -10,
    })
    expect(resultNegative.success).toBe(false)
  })

  it('should reject donation with invalid currency', () => {
    const result = donationSchema.safeParse({
      ...validDonation,
      currency: 'GBP', // Not in enum
    })
    expect(result.success).toBe(false)
  })

  it('should reject donation with invalid purpose', () => {
    const result = donationSchema.safeParse({
      ...validDonation,
      amac: 'invalid-purpose',
    })
    expect(result.success).toBe(false)
  })

  it('should reject donation with invalid payment method', () => {
    const result = donationSchema.safeParse({
      ...validDonation,
      odemeYontemi: 'bitcoin',
    })
    expect(result.success).toBe(false)
  })

  it('should reject donation with description too long', () => {
    const result = donationSchema.safeParse({
      ...validDonation,
      aciklama: 'A'.repeat(501),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('en fazla 500 karakter')
    }
  })

  it('should accept all valid currencies', () => {
    const currencies = ['TRY', 'USD', 'EUR'] as const
    currencies.forEach((currency) => {
      expect(
        donationSchema.safeParse({ ...validDonation, currency }).success
      ).toBe(true)
    })
  })

  it('should accept all valid purposes', () => {
    const purposes = [
      'genel',
      'egitim',
      'saglik',
      'insani-yardim',
      'kurban',
      'fitre-zekat',
    ] as const
    purposes.forEach((amac) => {
      expect(donationSchema.safeParse({ ...validDonation, amac }).success).toBe(
        true
      )
    })
  })

  it('should accept all valid payment methods', () => {
    const methods = [
      'nakit',
      'havale',
      'kredi-karti',
      'mobil-odeme',
    ] as const
    methods.forEach((odemeYontemi) => {
      expect(
        donationSchema.safeParse({ ...validDonation, odemeYontemi }).success
      ).toBe(true)
    })
  })
})

describe('memberSchema', () => {
  const validMember = {
    tcKimlikNo: '12345678901',
    ad: 'Mehmet',
    soyad: 'Demir',
    dogumTarihi: '1990-01-15',
    cinsiyet: 'erkek' as const,
    telefon: '05551234567',
    email: 'mehmet@example.com',
    adres: {
      il: 'İstanbul',
      ilce: 'Kadıköy',
      acikAdres: 'Test Mahallesi',
    },
    uyeTuru: 'aktif' as const,
  }

  it('should accept valid member data', () => {
    const result = memberSchema.safeParse(validMember)
    expect(result.success).toBe(true)
  })

  it('should reject member with invalid TC number', () => {
    const result = memberSchema.safeParse({
      ...validMember,
      tcKimlikNo: '123',
    })
    expect(result.success).toBe(false)
  })

  it('should reject member with short name', () => {
    const result = memberSchema.safeParse({
      ...validMember,
      ad: 'A',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('en az 2 karakter')
    }
  })

  it('should accept valid date formats', () => {
    const validDates = ['2000-01-01', '1985-12-31', '1990-06-15']
    validDates.forEach((date) => {
      expect(
        memberSchema.safeParse({ ...validMember, dogumTarihi: date }).success
      ).toBe(true)
    })
  })

  it('should accept empty date (optional)', () => {
    expect(
      memberSchema.safeParse({ ...validMember, dogumTarihi: '' }).success
    ).toBe(true)
    expect(
      memberSchema.safeParse({ ...validMember, dogumTarihi: undefined })
        .success
    ).toBe(true)
  })

  it('should reject invalid date formats', () => {
    const invalidDates = ['2000/01/01', '01-01-2000', '2000-13-01', 'not-a-date']
    invalidDates.forEach((date) => {
      const result = memberSchema.safeParse({
        ...validMember,
        dogumTarihi: date,
      })
      expect(result.success).toBe(false)
    })
  })

  it('should accept valid phone number formats', () => {
    const validPhones = [
      '05551234567',
      '5551234567',
      '+905551234567',
      '0 555 123 45 67',
      '(555) 123-45-67',
    ]
    validPhones.forEach((phone) => {
      expect(
        memberSchema.safeParse({ ...validMember, telefon: phone }).success
      ).toBe(true)
    })
  })

  it('should reject invalid phone numbers', () => {
    const invalidPhones = ['123', 'abc', '1234567', '+1234567890']
    invalidPhones.forEach((phone) => {
      const result = memberSchema.safeParse({
        ...validMember,
        telefon: phone,
      })
      expect(result.success).toBe(false)
    })
  })

  it('should accept both gender options', () => {
    expect(
      memberSchema.safeParse({ ...validMember, cinsiyet: 'erkek' }).success
    ).toBe(true)
    expect(
      memberSchema.safeParse({ ...validMember, cinsiyet: 'kadin' }).success
    ).toBe(true)
  })

  it('should reject invalid gender', () => {
    const result = memberSchema.safeParse({
      ...validMember,
      cinsiyet: 'other',
    })
    expect(result.success).toBe(false)
  })
})
