# 🔄 Workflows

KafkasDer Yönetim Paneli iş akışları ve kullanıcı senaryoları.

## Main Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    SOSYAL YARDIM SİSTEMİ                         │
└─────────────────────────────────────────────────────────────────┘

    1. KAYIT AŞAMASI
       ┌──────────────┐
       │ İhtiyaç      │
       │ Sahibi      │
       │ Kaydı        │
       └──────┬───────┘
              │
              ▼
    2. BAŞVURU AŞAMASI
       ┌──────────────┐
       │ Yardım       │
       │ Başvurusu    │
       └──────┬───────┘
              │
              ▼
    3. DEĞERLENDİRME AŞAMASI
       ┌──────────────┐
       │ İnceleme     │
       │ Onay/Red     │
       └──────┬───────┘
              │
              ▼
    4. ÖDEME AŞAMASI
       ┌──────────────┐
       │ Ödeme        │
       │ Yönetimi     │
       └──────┬───────┘
              │
              ▼
    5. RAPORLAMA AŞAMASI
       ┌──────────────┐
       │ İstatistikler│
       │ Raporlar     │
       └──────────────┘
```

## User Scenarios

### Scenario 1: Yeni İhtiyaç Sahibi Kaydı

**Kullanıcı:** Sosyal Yardım Görevlisi

**Adımlar:**
1. `/sosyal-yardim/ihtiyac-sahipleri` sayfasına git
2. "Ekle" butonuna tıkla
3. Formu doldur:
   - Kişisel bilgiler (ad, soyad, TC, doğum tarihi)
   - İletişim bilgileri (telefon, adres)
   - Kategori seçimi (yetim-ailesi, multeci-aile, etc.)
   - Aile bilgileri (hane büyüklüğü, yetim sayısı)
4. "Kaydet" butonuna tıkla
5. Sistem otomatik dosya no oluşturur

**Sonuç:** İhtiyaç sahibi kaydı oluşturulur, durum "aktif"

---

### Scenario 2: Yardım Başvurusu Oluşturma

**Kullanıcı:** Sosyal Yardım Görevlisi

**Adımlar:**
1. İhtiyaç sahibi detay sayfasına git
2. "Yardım Başvurusu" butonuna tıkla
3. Formu doldur:
   - Yardım türü seç (nakdi, ayni, egitim, saglik, kira, fatura)
   - Talep edilen tutar (nakdi için)
   - Gerekçe açıklaması
   - Belgeleri yükle
4. "Başvuruyu Oluştur" butonuna tıkla

**Sonuç:** Başvuru oluşturulur, durum "beklemede"

---

### Scenario 3: Başvuru İnceleme ve Onay

**Kullanıcı:** Sosyal Yardım Yöneticisi

**Adımlar:**
1. `/sosyal-yardim/basvurular` sayfasına git
2. "Beklemede" durumundaki başvuruları filtrele
3. Başvuru detayını görüntüle
4. İnceleme yap:
   - Belgeleri kontrol et
   - Gerekçeyi değerlendir
   - Değerlendirme notu yaz
5. Karar ver:
   - "Onayla" → durum "onaylandı"
   - "Reddet" → durum "reddedildi"

**Sonuç:** Başvuru durumu güncellenir

---

### Scenario 4: Ödeme Yönetimi

**Kullanıcı:** Muhasebe Görevlisi

**Adımlar:**
1. `/sosyal-yardim/odemeler` sayfasına git
2. Onaylanan başvuruları görüntüle
3. Ödeme yöntemini seç:
   - **Nakit:** `/sosyal-yardim/vezne` → makbuz oluştur
   - **Havale:** `/sosyal-yardim/banka-emirleri` → IBAN ve banka bilgisi
4. Ödemeyi tamamla
5. Makbuz/Emir kaydı oluştur

**Sonuç:** Ödeme bilgisi oluşturulur, başvuru durumu "odendi"

---

### Scenario 5: Rapor Görüntüleme

**Kullanıcı:** Yönetici

**Adımlar:**
1. `/sosyal-yardim/raporlar` sayfasına git
2. Filtre seç:
   - Tarih aralığı
   - Yardım türü
   - Kategori
3. Grafikleri görüntüle:
   - Aylık yardım dağılımı
   - Kategori bazlı istatistikler
   - Yardım türü dağılımı
4. Excel export ile indir

**Sonuç:** İstatistikler ve raporlar görüntülenir

---

## Integration Points

### İhtiyaç Sahipleri ↔ Başvurular

```typescript
// İhtiyaç sahibi detay sayfası
/sosyal-yardim/ihtiyac-sahipleri/[id]
  → "Yardım Başvurusu" butonu
  → beneficiary.id → application.basvuranKisi
```

### Başvurular ↔ Ödemeler

```typescript
// Başvuru onaylandığında
application.durum = 'onaylandi'
  → /sosyal-yardim/vezne (nakit)
  → /sosyal-yardim/banka-emirleri (havale)
  → odemeBilgileri oluştur
```

### Ödemeler ↔ Raporlar

```typescript
// Tüm ödemeler raporlarda toplanır
/sosyal-yardim/raporlar
  → OdemeBilgileri aggregate
  → İstatistikler
  → Grafikler
```

---

## Status Flow

### Başvuru Durumu Akışı

```
beklemede
    ↓ (inceleme)
inceleniyor
    ↓ (karar)
    ├──→ onaylandı → odendi
    └──→ reddedildi
```

### İhtiyaç Sahibi Durumu Akışı

```
taslak
    ↓ (onay)
aktif
    ↓ (tamamlama)
pasif / tamamlandi
```

---

## Page Navigation Map

```
/genel
  ├── Dashboard istatistikleri

/bagis/
  ├── /liste - Bağış listesi
  ├── /kumbara - Kumbara yönetimi
  └── /raporlar - Bağış raporları

/uyeler/
  ├── /liste - Üye listesi
  └── /yeni - Yeni üye

/sosyal-yardim/
  ├── /raporlar - İstatistikler
  ├── /ihtiyac-sahipleri - İhtiyaç sahipleri
  ├── /basvurular - Yardım başvuruları
  ├── /tum-yardimlar - Tüm yardımlar
  ├── /odemeler - Ödeme takibi
  ├── /vezne - Nakit ödeme
  ├── /banka-emirleri - Banka ödemeleri
  ├── /nakdi-islemler - Nakdi yardımlar
  ├── /ayni-islemler - Ayni yardımlar
  ├── /hizmet-takip - Hizmet takibi
  ├── /hastane-sevk - Hastane sevkleri
  ├── /parametreler - Sistem ayarları
  ├── /veri-kontrol - Veri kontrolü
  └── /bilgilendirme - Modül bilgileri

/etkinlikler
/dokumanlar

/ayarlar/
  ├── /genel - Genel ayarlar
  ├── /kullanicilar - Kullanıcılar
  └── /yedekleme - Yedekleme
```

---

## Quick Actions

| Action | Page | Button |
|--------|------|--------|
| Yeni İhtiyaç Sahibi | `/sosyal-yardim/ihtiyac-sahipleri` | Ekle |
| Yeni Başvuru | İhtiyaç sahibi detay | Yardım Başvurusu |
| Başvuru Onayla | `/sosyal-yardim/basvurular` | Onayla |
| Nakit Ödeme | `/sosyal-yardim/vezne` | Ödeme Yap |
| Banka Emri | `/sosyal-yardim/banka-emirleri` | Emir Oluştur |
| Rapor İndir | `/sosyal-yardim/raporlar` | Excel'e Aktar |

---

## Related Docs

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture
- [DATA_MODEL.md](./DATA_MODEL.md) - Data models
- [CLAUDE.md](./CLAUDE.md) - Development guide
