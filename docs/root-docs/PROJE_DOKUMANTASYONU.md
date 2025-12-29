# 📘 KafkasDer Yönetim Paneli - Teknik Referans Dokümanı

| **Versiyon** | **Tarih** | **Durum** |
|:---:|:---:|:---:|
| 1.0.0 | 25.12.2025 | Kararlı Sürüm (Stable) |

---

## 📋 İçindekiler
1. [Proje Genel Bakış](#1-proje-genel-bakış)
2. [Teknik Mimari ve Altyapı](#2-teknik-mimari-ve-altyapı)
3. [Modül ve Özellik Detayları](#3-modül-ve-özellik-detayları)
4. [Kurulum ve Yapılandırma](#4-kurulum-ve-yapılandırma)
5. [Geliştirme ve Test Süreçleri](#5-geliştirme-ve-test-süreçleri)
6. [Proje Bakımı ve Temizlik Raporu](#6-proje-bakımı-ve-temizlik-raporu)

---

## 1. Proje Genel Bakış

**KafkasDer Yönetim Paneli**, Kafkas Göçmenleri Derneği'nin operasyonel süreçlerini dijitalleştirmek, veri bütünlüğünü sağlamak ve yönetimsel verimliliği artırmak amacıyla geliştirilmiş kapsamlı bir web uygulamasıdır.

### 🎯 Temel Amaçlar
*   **Merkezi Yönetim:** Üye, bağış ve yardım faaliyetlerinin tek bir platformdan yönetilmesi.
*   **Şeffaflık:** Bağış ve harcamaların izlenebilir ve raporlanabilir olması.
*   **Verimlilik:** Manuel süreçlerin otomasyonla hızlandırılması (Örn: QR ile kumbara takibi).
*   **Güvenlik:** Rol tabanlı yetkilendirme ile veri güvenliğinin sağlanması.

---

## 2. Teknik Mimari ve Altyapı

Proje, performans, ölçeklenebilirlik ve bakım kolaylığı gözetilerek modern web teknolojileri üzerine inşa edilmiştir.

### 🛠 Teknoloji Yığını (Tech Stack)

| Katman | Teknoloji | Versiyon | Açıklama |
|---|---|---|---|
| **Frontend** | Next.js | 16.1.1 | App Router mimarisi ile sunucu taraflı işleme (SSR). |
| **UI Kütüphanesi** | React | 19.2.3 | Bileşen tabanlı kullanıcı arayüzü geliştirme. |
| **Dil** | TypeScript | 5.9.3 | Statik tip kontrolü ile güvenli kod yapısı. |
| **Stil** | Tailwind CSS | 4.0 | Utility-first CSS framework'ü. |
| **Backend / DB** | Supabase | 2.89.0 | PostgreSQL tabanlı veritabanı, Auth ve Storage servisi. |
| **State (Server)** | TanStack Query | 5.90.12 | Sunucu verisi önbellekleme ve senkronizasyon. |
| **State (Client)** | Zustand | 5.0.9 | Hafif ve performanslı global durum yönetimi. |
| **Form Yönetimi** | React Hook Form | 7.69.0 | Performanslı form validasyonları (Zod entegrasyonlu). |

### � Proje Dizin Yapısı

Kaynak kodlar, modülerlik ve sürdürülebilirlik prensiplerine göre organize edilmiştir:

```bash
/src
├── app/                 # Next.js App Router (Sayfalar ve API rotaları)
│   ├── (auth)/          # Kimlik doğrulama sayfaları (Public)
│   ├── (dashboard)/     # Yönetim paneli sayfaları (Private/Protected)
│   └── api/             # Backend API endpoint'leri
├── components/          # React Bileşenleri
│   ├── features/        # İş mantığı içeren modüler bileşenler (Bağış, Üye vb.)
│   ├── ui/              # Temel UI elementleri (Buton, Input vb. - shadcn/ui)
│   └── layout/          # Sayfa düzeni bileşenleri (Sidebar, Header)
├── lib/                 # Harici servis konfigürasyonları (Supabase, Utils)
├── hooks/               # Özel React Hook'ları (useMedia, useDebounce vb.)
├── stores/              # Global durum yönetimi (Zustand store'ları)
└── types/               # TypeScript tip tanımları ve arayüzler
```

---

## 3. Modül ve Özellik Detayları

Sistem dört ana fonksiyonel modülden oluşmaktadır.

### A. � Bağış Yönetim Sistemi
Derneğin finansal kaynaklarının takibi için geliştirilmiştir.
*   **Çoklu Ödeme Yöntemi:** Nakit, Kredi Kartı, Havale/EFT takibi.
*   **Kumbara Takibi:** Sahadaki kumbaraların QR kod ile taranarak konum ve doluluk takibi.
*   **Raporlama:** Tarih, bağışçı ve ödeme türüne göre detaylı filtreleme ve Excel çıktısı.

### B. � Sosyal Yardım Modülü
İhtiyaç sahiplerine yapılan yardımların organize edilmesini sağlar.
*   **Başvuru Yönetimi:** Yardım taleplerinin alınması ve değerlendirme süreci.
*   **Yardım Türleri:** Ayni (Gıda, Giysi) ve Nakdi yardımların kategorizasyonu.
*   **Hane Detayları:** Aile bireyleri, gelir durumu ve ihtiyaç analiz kayıtları.

### C. 👥 Üye Yönetim Sistemi
Dernek üyelerinin dijital sicil kayıtlarını tutar.
*   **Üye Profili:** Kimlik, iletişim ve adres bilgilerinin yönetimi.
*   **Aidat Takibi:** Ödenmiş ve gecikmiş aidatların görüntülenmesi.
*   **Üyelik Türleri:** Aktif, Pasif, Onursal üye statüleri.

### D. 📊 Dashboard ve Analitik
Yöneticiler için özet veriler sunar.
*   **Anlık İstatistikler:** Toplam bağış, aktif üye sayısı, bekleyen yardımlar.
*   **Görsel Grafikler:** Aylık gelir/gider dağılımı (Recharts kütüphanesi).
*   **Son İşlemler:** Sistemdeki son aktivitelerin akış listesi.

---

## 4. Kurulum ve Yapılandırma

Projeyi yerel ortamda çalıştırmak için aşağıdaki adımları izleyin.

### Gereksinimler
*   **Node.js:** v20+
*   **Paket Yöneticisi:** npm (v10+) veya yarn
*   **Veritabanı:** Supabase projesi

### Adım Adım Kurulum

1.  **Projeyi Klonlayın**
    ```bash
    git clone https://github.com/Kafkasportal/Portal.git
    cd Portal
    ```

2.  **Bağımlılıkları Yükleyin**
    ```bash
    npm install
    ```

3.  **Çevresel Değişkenleri Ayarlayın**
    Kök dizinde `.env.local` dosyası oluşturun ve Supabase kimlik bilgilerini ekleyin:
    ```env
    NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="public-anon-key"
    SUPABASE_SERVICE_ROLE_KEY="service-role-key"
    ```

4.  **Veritabanını Güncelleyin**
    Mevcut migrasyonları veritabanına uygulayın:
    ```bash
    npm run db:migrate
    ```

---

## 5. Geliştirme ve Test Süreçleri

Yazılım kalitesini korumak için aşağıdaki standart prosedürler uygulanır.

### Çalıştırma Komutları

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme sunucusunu başlatır (HMR aktif). |
| `npm run build` | Prodüksiyon için optimize edilmiş derleme alır. |
| `npm run start` | Derlenmiş uygulamayı başlatır. |
| `npm run lint` | Kod standartlarını ve potansiyel hataları denetler. |

### Test Stratejisi

*   **Birim Testleri (Unit Tests):** `npm run test`
    *   Jest kullanılarak bileşenlerin ve fonksiyonların izole testleri yapılır.
*   **Uçtan Uca Testler (E2E):** `npm run test:e2e`
    *   Playwright ile gerçek kullanıcı senaryoları (Login, Bağış Ekleme vb.) tarayıcı üzerinde simüle edilir.

---

## 6. Proje Bakımı ve Temizlik Raporu

Projenin sürdürülebilirliği ve kod tabanının temizliği için periyodik bakım işlemleri uygulanmıştır.

### 🗑 Yapılan Son Temizlik İşlemleri
Aşağıdaki dosya ve klasörler, proje standartlarına uymadığı veya artık kullanılmadığı için sistemden kaldırılmıştır:

*   ❌ `scripts/test-creation.ts`: Manuel test scripti (Otomatik testlere taşındı).
*   ❌ `take-screenshots.js` & `test-screenshots/`: Eski görsel test araçları.
*   ❌ `public/*.svg`: Kullanılmayan varsayılan şablon görselleri.
*   ❌ `docs/ULTRA_DOCUMENTATION.md`: Mükerrer içerik (Bu dokümanda birleştirildi).
*   ❌ `supabase/.temp/`: Geçici sistem dosyaları.

Bu temizlik işlemi, projenin derleme süresini kısaltmış ve dosya yapısını sadeleştirmiştir.

---

**İletişim:** Teknik sorunlar ve geliştirme önerileri için proje yöneticisi ile iletişime geçiniz.
**Telif Hakkı:** © 2025 KafkasDer. Tüm hakları saklıdır.
