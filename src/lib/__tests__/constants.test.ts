import { describe, it, expect } from 'vitest'
import {
  CURRENCY_SYMBOLS,
  NAV_ITEMS,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  STATUS_VARIANTS,
  STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  DONATION_PURPOSE_LABELS,
  AID_TYPE_LABELS,
  BASVURU_DURUMU_LABELS,
  MEMBER_TYPE_LABELS,
  IHTIYAC_SAHIBI_KATEGORI_LABELS,
  TURKISH_CITIES,
  COUNTRIES,
  TELEFON_OPERATOR_KODLARI,
  YARDIM_TURU_LABELS,
  BIRIM_LABELS,
} from '../constants'

describe('constants', () => {
  describe('CURRENCY_SYMBOLS', () => {
    it('should have TRY symbol', () => {
      expect(CURRENCY_SYMBOLS.TRY).toBe('₺')
    })

    it('should have USD symbol', () => {
      expect(CURRENCY_SYMBOLS.USD).toBe('$')
    })

    it('should have EUR symbol', () => {
      expect(CURRENCY_SYMBOLS.EUR).toBe('€')
    })

    it('should have exactly 3 currencies', () => {
      expect(Object.keys(CURRENCY_SYMBOLS)).toHaveLength(3)
    })
  })

  describe('NAV_ITEMS', () => {
    it('should be an array', () => {
      expect(Array.isArray(NAV_ITEMS)).toBe(true)
    })

    it('should have items with labels', () => {
      NAV_ITEMS.forEach((item) => {
        expect(item.label).toBeDefined()
        expect(typeof item.label).toBe('string')
      })
    })

    it('should have Genel Bakış as first item', () => {
      expect(NAV_ITEMS[0].label).toBe('Genel Bakış')
    })

    it('should have Bağışlar section with children', () => {
      const bagislar = NAV_ITEMS.find((item) => item.label === 'Bağışlar')
      expect(bagislar).toBeDefined()
      expect(bagislar?.children).toBeDefined()
      expect(bagislar?.children?.length).toBeGreaterThan(0)
    })

    it('should have Ayarlar section with children', () => {
      const ayarlar = NAV_ITEMS.find((item) => item.label === 'Ayarlar')
      expect(ayarlar).toBeDefined()
      expect(ayarlar?.children).toBeDefined()
    })
  })

  describe('Pagination constants', () => {
    it('should have default page size of 10', () => {
      expect(DEFAULT_PAGE_SIZE).toBe(10)
    })

    it('should have valid page size options', () => {
      expect(PAGE_SIZE_OPTIONS).toContain(10)
      expect(PAGE_SIZE_OPTIONS).toContain(20)
      expect(PAGE_SIZE_OPTIONS).toContain(50)
      expect(PAGE_SIZE_OPTIONS).toContain(100)
    })

    it('should have page size options in ascending order', () => {
      for (let i = 1; i < PAGE_SIZE_OPTIONS.length; i++) {
        expect(PAGE_SIZE_OPTIONS[i]).toBeGreaterThan(PAGE_SIZE_OPTIONS[i - 1])
      }
    })
  })

  describe('STATUS_VARIANTS', () => {
    it('should have warning variant for beklemede', () => {
      expect(STATUS_VARIANTS.beklemede).toBe('warning')
    })

    it('should have success variant for tamamlandi', () => {
      expect(STATUS_VARIANTS.tamamlandi).toBe('success')
    })

    it('should have destructive variant for iptal', () => {
      expect(STATUS_VARIANTS.iptal).toBe('destructive')
    })

    it('should have success variant for onaylandi', () => {
      expect(STATUS_VARIANTS.onaylandi).toBe('success')
    })
  })

  describe('STATUS_LABELS', () => {
    it('should have Turkish labels', () => {
      expect(STATUS_LABELS.beklemede).toBe('Beklemede')
      expect(STATUS_LABELS.tamamlandi).toBe('Tamamlandı')
      expect(STATUS_LABELS.iptal).toBe('İptal')
      expect(STATUS_LABELS.onaylandi).toBe('Onaylandı')
    })

    it('should have all status variants covered', () => {
      Object.keys(STATUS_VARIANTS).forEach((key) => {
        expect(STATUS_LABELS[key]).toBeDefined()
      })
    })
  })

  describe('PAYMENT_METHOD_LABELS', () => {
    it('should have nakit label', () => {
      expect(PAYMENT_METHOD_LABELS.nakit).toBe('Nakit')
    })

    it('should have havale label', () => {
      expect(PAYMENT_METHOD_LABELS.havale).toBe('Havale/EFT')
    })

    it('should have kredi-karti label', () => {
      expect(PAYMENT_METHOD_LABELS['kredi-karti']).toBe('Kredi Kartı')
    })

    it('should have mobil-odeme label', () => {
      expect(PAYMENT_METHOD_LABELS['mobil-odeme']).toBe('Mobil Ödeme')
    })
  })

  describe('DONATION_PURPOSE_LABELS', () => {
    it('should have all donation purposes', () => {
      expect(DONATION_PURPOSE_LABELS.genel).toBe('Genel')
      expect(DONATION_PURPOSE_LABELS.egitim).toBe('Eğitim')
      expect(DONATION_PURPOSE_LABELS.saglik).toBe('Sağlık')
      expect(DONATION_PURPOSE_LABELS['insani-yardim']).toBe('İnsani Yardım')
      expect(DONATION_PURPOSE_LABELS.kurban).toBe('Kurban')
      expect(DONATION_PURPOSE_LABELS['fitre-zekat']).toBe('Fitre/Zekat')
    })
  })

  describe('AID_TYPE_LABELS', () => {
    it('should have all aid types', () => {
      expect(AID_TYPE_LABELS.ayni).toBe('Ayni Yardım')
      expect(AID_TYPE_LABELS.nakdi).toBe('Nakdi Yardım')
      expect(AID_TYPE_LABELS.egitim).toBe('Eğitim Desteği')
      expect(AID_TYPE_LABELS.saglik).toBe('Sağlık Desteği')
      expect(AID_TYPE_LABELS.kira).toBe('Kira Yardımı')
      expect(AID_TYPE_LABELS.fatura).toBe('Fatura Desteği')
    })
  })

  describe('BASVURU_DURUMU_LABELS', () => {
    it('should have all application statuses', () => {
      expect(BASVURU_DURUMU_LABELS.beklemede).toBe('Beklemede')
      expect(BASVURU_DURUMU_LABELS.inceleniyor).toBe('İnceleniyor')
      expect(BASVURU_DURUMU_LABELS.onaylandi).toBe('Onaylandı')
      expect(BASVURU_DURUMU_LABELS.reddedildi).toBe('Reddedildi')
      expect(BASVURU_DURUMU_LABELS.odendi).toBe('Ödendi')
    })
  })

  describe('MEMBER_TYPE_LABELS', () => {
    it('should have all member types', () => {
      expect(MEMBER_TYPE_LABELS.aktif).toBe('Aktif Üye')
      expect(MEMBER_TYPE_LABELS.onursal).toBe('Onursal Üye')
      expect(MEMBER_TYPE_LABELS.genc).toBe('Genç Üye')
      expect(MEMBER_TYPE_LABELS.destekci).toBe('Destekçi')
    })
  })

  describe('IHTIYAC_SAHIBI_KATEGORI_LABELS', () => {
    it('should have beneficiary categories', () => {
      expect(IHTIYAC_SAHIBI_KATEGORI_LABELS['yetim-ailesi']).toBe('Yetim Ailesi')
      expect(IHTIYAC_SAHIBI_KATEGORI_LABELS['multeci-aile']).toBe('Mülteci Aile')
      expect(IHTIYAC_SAHIBI_KATEGORI_LABELS['ihtiyac-sahibi-aile']).toBe(
        'İhtiyaç Sahibi Aile'
      )
    })

    it('should have all categories defined', () => {
      expect(Object.keys(IHTIYAC_SAHIBI_KATEGORI_LABELS).length).toBeGreaterThan(5)
    })
  })

  describe('TURKISH_CITIES', () => {
    it('should be an array', () => {
      expect(Array.isArray(TURKISH_CITIES)).toBe(true)
    })

    it('should have 81 cities', () => {
      expect(TURKISH_CITIES.length).toBe(81)
    })

    it('should include major cities', () => {
      expect(TURKISH_CITIES).toContain('İstanbul')
      expect(TURKISH_CITIES).toContain('Ankara')
      expect(TURKISH_CITIES).toContain('İzmir')
    })

    it('should not have duplicates', () => {
      const uniqueCities = new Set(TURKISH_CITIES)
      expect(uniqueCities.size).toBe(TURKISH_CITIES.length)
    })
  })

  describe('COUNTRIES', () => {
    it('should be an array', () => {
      expect(Array.isArray(COUNTRIES)).toBe(true)
    })

    it('should have Türkiye first', () => {
      expect(COUNTRIES[0]).toBe('Türkiye')
    })

    it('should include common countries', () => {
      expect(COUNTRIES).toContain('Almanya')
      expect(COUNTRIES).toContain('Amerika Birleşik Devletleri')
      expect(COUNTRIES).toContain('Suriye')
    })

    it('should not have duplicates', () => {
      const uniqueCountries = new Set(COUNTRIES)
      expect(uniqueCountries.size).toBe(COUNTRIES.length)
    })
  })

  describe('TELEFON_OPERATOR_KODLARI', () => {
    it('should be an array of strings', () => {
      expect(Array.isArray(TELEFON_OPERATOR_KODLARI)).toBe(true)
      TELEFON_OPERATOR_KODLARI.forEach((kod) => {
        expect(typeof kod).toBe('string')
      })
    })

    it('should have 3-digit codes', () => {
      TELEFON_OPERATOR_KODLARI.forEach((kod) => {
        expect(kod.length).toBe(3)
      })
    })

    it('should include common Turkish operator codes', () => {
      expect(TELEFON_OPERATOR_KODLARI).toContain('530')
      expect(TELEFON_OPERATOR_KODLARI).toContain('532')
      expect(TELEFON_OPERATOR_KODLARI).toContain('555')
    })

    it('should not have duplicates', () => {
      const uniqueCodes = new Set(TELEFON_OPERATOR_KODLARI)
      expect(uniqueCodes.size).toBe(TELEFON_OPERATOR_KODLARI.length)
    })
  })

  describe('YARDIM_TURU_LABELS', () => {
    it('should have in-kind aid types', () => {
      expect(YARDIM_TURU_LABELS.gida).toBe('Gıda')
      expect(YARDIM_TURU_LABELS.giyim).toBe('Giyim')
      expect(YARDIM_TURU_LABELS.yakacak).toBe('Yakacak')
      expect(YARDIM_TURU_LABELS.diger).toBe('Diğer')
    })
  })

  describe('BIRIM_LABELS', () => {
    it('should have unit labels', () => {
      expect(BIRIM_LABELS.adet).toBe('Adet')
      expect(BIRIM_LABELS.kg).toBe('Kilogram')
      expect(BIRIM_LABELS.paket).toBe('Paket')
      expect(BIRIM_LABELS.kutu).toBe('Kutu')
      expect(BIRIM_LABELS.takim).toBe('Takım')
    })
  })
})
