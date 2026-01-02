/**
 * Validator Tests
 * Tests for Zod validation schemas
 */

import { describe, it, expect } from 'vitest'
import {
  phoneSchema,
  tcKimlikSchema,
  emailSchema,
  donationSchema,
  memberSchema,
} from './validators'

describe('phoneSchema', () => {
  it('validates Turkish phone numbers correctly', () => {
    // Valid formats
    expect(() => phoneSchema.parse('05551234567')).not.toThrow()
    expect(() => phoneSchema.parse('5551234567')).not.toThrow()
    expect(() => phoneSchema.parse('+905551234567')).not.toThrow()
    expect(() => phoneSchema.parse('')).not.toThrow()
    expect(() => phoneSchema.parse(undefined)).not.toThrow()
  })

  it('rejects invalid phone numbers', () => {
    expect(() => phoneSchema.parse('123456789')).toThrow()
    expect(() => phoneSchema.parse('05551234')).toThrow() // Too short
    expect(() => phoneSchema.parse('0555123456789')).toThrow() // Too long
    expect(() => phoneSchema.parse('04551234567')).toThrow() // Must start with 5
    expect(() => phoneSchema.parse('abcdefghijk')).toThrow() // Letters
  })
})

describe('tcKimlikSchema', () => {
  it('validates 11-digit Turkish ID numbers', () => {
    expect(() => tcKimlikSchema.parse('12345678901')).not.toThrow()
    expect(() => tcKimlikSchema.parse('98765432109')).not.toThrow()
  })

  it('rejects invalid TC Kimlik numbers', () => {
    expect(() => tcKimlikSchema.parse('123456789')).toThrow() // Too short
    expect(() => tcKimlikSchema.parse('123456789012')).toThrow() // Too long
    expect(() => tcKimlikSchema.parse('1234567890a')).toThrow() // Contains letter
    expect(() => tcKimlikSchema.parse('')).toThrow() // Empty
  })
})

describe('emailSchema', () => {
  it('validates email addresses correctly', () => {
    expect(() => emailSchema.parse('test@example.com')).not.toThrow()
    expect(() => emailSchema.parse('user.name+tag@example.co.uk')).not.toThrow()
    expect(() => emailSchema.parse('')).not.toThrow() // Empty is allowed (optional)
    expect(() => emailSchema.parse(undefined)).not.toThrow() // Undefined is allowed
  })

  it('rejects invalid email addresses', () => {
    expect(() => emailSchema.parse('notanemail')).toThrow()
    expect(() => emailSchema.parse('missing@domain')).toThrow()
    expect(() => emailSchema.parse('@example.com')).toThrow()
    expect(() => emailSchema.parse('user@')).toThrow()
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
  }

  it('validates complete donation form', () => {
    expect(() => donationSchema.parse(validDonation)).not.toThrow()
  })

  it('validates with optional fields', () => {
    const minimal = {
      bagisci: {
        ad: 'Ahmet',
        soyad: 'Yılmaz',
      },
      tutar: 50,
      currency: 'TRY' as const,
      amac: 'egitim' as const,
      odemeYontemi: 'havale' as const,
    }
    expect(() => donationSchema.parse(minimal)).not.toThrow()
  })

  it('rejects invalid donation amounts', () => {
    const invalid = { ...validDonation, tutar: 0 }
    expect(() => donationSchema.parse(invalid)).toThrow()

    const negative = { ...validDonation, tutar: -100 }
    expect(() => donationSchema.parse(negative)).toThrow()
  })

  it('rejects short names', () => {
    const shortName = { ...validDonation, bagisci: { ...validDonation.bagisci, ad: 'A' } }
    expect(() => donationSchema.parse(shortName)).toThrow()
  })

  it('rejects long descriptions', () => {
    const longDesc = {
      ...validDonation,
      aciklama: 'a'.repeat(501), // 501 characters
    }
    expect(() => donationSchema.parse(longDesc)).toThrow()
  })

  it('validates all payment methods', () => {
    const methods = ['nakit', 'havale', 'kredi-karti', 'mobil-odeme'] as const
    methods.forEach((method) => {
      const donation = { ...validDonation, odemeYontemi: method }
      expect(() => donationSchema.parse(donation)).not.toThrow()
    })
  })

  it('validates all purposes', () => {
    const purposes = ['genel', 'egitim', 'saglik', 'insani-yardim', 'kurban', 'fitre-zekat'] as const
    purposes.forEach((purpose) => {
      const donation = { ...validDonation, amac: purpose }
      expect(() => donationSchema.parse(donation)).not.toThrow()
    })
  })

  it('validates all currencies', () => {
    const currencies = ['TRY', 'USD', 'EUR'] as const
    currencies.forEach((currency) => {
      const donation = { ...validDonation, currency }
      expect(() => donationSchema.parse(donation)).not.toThrow()
    })
  })
})

describe('memberSchema', () => {
  const validMember = {
    tcKimlikNo: '12345678901',
    ad: 'Mehmet',
    soyad: 'Demir',
    dogumTarihi: '1990-01-01',
    cinsiyet: 'erkek' as const,
    telefon: '05551234567',
    email: 'mehmet@example.com',
    adres: {
      il: 'Ankara',
      ilce: 'Çankaya',
      mahalle: 'Kızılay',
      acikAdres: 'Test Sk. No:1',
    },
    uyeTuru: 'aktif' as const,
  }

  it('validates complete member form', () => {
    expect(() => memberSchema.parse(validMember)).not.toThrow()
  })

  it('validates with optional birth date', () => {
    const noBirthDate = { ...validMember, dogumTarihi: '' }
    expect(() => memberSchema.parse(noBirthDate)).not.toThrow()
  })

  it('validates Turkish phone format variations', () => {
    const variations = [
      { ...validMember, telefon: '05551234567' },
      { ...validMember, telefon: '5551234567' },
      { ...validMember, telefon: '+905551234567' },
      { ...validMember, telefon: '0555 123 45 67' }, // With spaces
    ]

    variations.forEach((member) => {
      expect(() => memberSchema.parse(member)).not.toThrow()
    })
  })

  it('rejects invalid TC Kimlik numbers', () => {
    const invalidTC = { ...validMember, tcKimlikNo: '123' }
    expect(() => memberSchema.parse(invalidTC)).toThrow()
  })

  it('validates both genders', () => {
    const male = { ...validMember, cinsiyet: 'erkek' as const }
    const female = { ...validMember, cinsiyet: 'kadin' as const }

    expect(() => memberSchema.parse(male)).not.toThrow()
    expect(() => memberSchema.parse(female)).not.toThrow()
  })

  it('rejects invalid date formats', () => {
    const invalidDate = { ...validMember, dogumTarihi: '01/01/1990' }
    expect(() => memberSchema.parse(invalidDate)).toThrow()

    const invalidDate2 = { ...validMember, dogumTarihi: '1990-13-01' } // Invalid month
    expect(() => memberSchema.parse(invalidDate2)).toThrow()
  })
})
