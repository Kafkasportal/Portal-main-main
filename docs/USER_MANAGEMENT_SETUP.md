# Kullanıcı Yönetim Paneli Kurulum Rehberi

Bu rehber, dernek çalışanları için kullanıcı yönetim panelinin kurulumunu ve kullanımını açıklar.

## 📋 İçindekiler

- [Giriş](#giriş)
- [Önkoşullar](#önkoşullar)
- [Kurulum](#kurulum)
- [İlk Admin Hesabını Oluşturma](#ilk-admin-hesabını-oluşturma)
- [Kullanıcı Yönetim Panelini Kullanma](#kullanıcı-yönetim-panelini-kullanma)
- [Roller ve İzinler](#roller-ve-izinler)
- [Sık Karşılaşılan Sorular](#sık-karşılaşılan-sorular)

## 🚀 Giriş

Kullanıcı yönetim paneli, dernek çalışanlarının (dernek çalışanları) sisteme eklenmesi, yönetilmesi ve yetkilendirilmesi için modern bir arayüz sağlar. Bu panel şu özellikleri içerir:

- ✅ Kullanıcı listesi (filtreleme, arama, sıralama, pagination)
- ✅ Kullanıcı oluşturma ve düzenleme
- ✅ Toplu işlemler (silme)
- ✅ Rol bazlı erişim kontrolü (RBAC)
- ✅ Detaylı izin yönetimi
- ✅ Aktif/Pasif durum yönetimi

## 📦 Önkoşullar

Aşağıdaki bileşenlerin projede mevcut olduğundan emin olun:

### 1. Supabase Ayarları

Supabase projenizde aşağıdaki özelliklerin aktif olduğundan emin olun:

- **Authentication**: Aktif
- **Auth Provider**: Email/Password
- **Email Confirmation**: Aktif (opsiyonel, admin oluşturma için gerekli)

### 2. Environment Variables

`.env.local` dosyanızda aşağıdaki değişkenlerin tanımlı olduğundan emin olun:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

⚠️ **Önemli**: `SUPABASE_SERVICE_ROLE_KEY` sunucu tarafında kullanıcı yönetimi için gereklidir. Bu key'i asla client-side'da kullanmayın.

## 🔧 Kurulum

### 1. Admin Sayfası Yönlendirmesi

Ana dashboard'dan kullanıcı yönetim paneline gitmek için aşağıdaki rotayı kullanın:

```
/admin/users
```

### 2. Navigation Menüsü Ekleme

Eğer sidebar veya navigation menünüz varsa, kullanıcı yönetim linkini ekleyin:

```tsx
<Link href="/admin/users">
  <Users className="h-4 w-4" />
  <span>Kullanıcı Yönetimi</span>
</Link>
```

## 👤 İlk Admin Hesabını Oluşturma

İlk admin hesabını oluşturmak için 3 yöntem vardır:

### Yöntem 1: SQL Script Kullanma (Önerilen)

1. Supabase Dashboard'a gidin
2. **SQL Editor** sekmesine tıklayın
3. Aşağıdaki script'i kopyalayıp yapıştırın:

```sql
-- İlk admin hesabı oluşturma script'i
-- Bu script'i Supabase SQL Editor'de çalıştırın

UPDATE auth.users 
SET 
  app_metadata = jsonb_build_object(
    'ad', 'Sistem',
    'soyad', 'Yöneticisi',
    'birim', 'Yönetici',
    'yetki', 'KULLANICI',
    'gorev', 'Sistem Yöneticisi',
    'dahili', 'Hayır',
    'kisa_kod', 'ADMIN001',
    'erisim_yetkisi', 'admin@kafkasder.org',
    'imza_yetkisi', 'Sistem',
    'fon_bolgesi_yetkisi', 'ALL',
    'permissions', jsonb_build_object(
      'LOGIN', 'true',
      'VIEW_PROFILE', 'true',
      'UPDATE_PROFILE', 'true',
      'VIEW_USERS', 'true',
      'CREATE_USER', 'true',
      'UPDATE_USER', 'true',
      'DELETE_USER', 'true',
      'MANAGE_ROLES', 'true',
      'VIEW_DONATIONS', 'true',
      'CREATE_DONATION', 'true',
      'VIEW_FINANCIAL_REPORTS', 'true',
      'VIEW_APPLICATIONS', 'true',
      'APPROVE_APPLICATION', 'true',
      'CREATE_PAYMENT', 'true',
      'VIEW_SETTINGS', 'true',
      'UPDATE_SETTINGS', 'true',
      'MANAGE_SYSTEM', 'true'
    )
  )
WHERE 
  email = 'admin@kafkasder.org'
AND deleted_at IS NULL;
```

4. Script'i çalıştırın (Run butonuna tıklayın)
5. Kullanıcı bilgilerini kendi admin e-posta adresinize göre güncelleyin

### Yöntem 2: Supabase Dashboard Kullanma

1. Supabase Dashboard'da **Authentication** > **Users** sekmesine gidin
2. **Add user** butonuna tıklayın
3. E-posta ve şifre bilgilerini girin
4. **Auto-confirm user** seçeneğini işaretleyin
5. **Add user** butonuna tıklayın
6. Oluşturulan kullanıcıya tıklayın ve **Metadata** > **App Metadata** bölümünde:
   - `role`: `admin`
   - `permissions`: JSON objesi olarak tüm izinleri `true` yapın

### Yöntem 3: Programatik Oluşturma (Gelişmiş)

```typescript
import { createUser } from '@/lib/services/users.service'

const adminUser = await createUser({
  email: 'admin@kafkasder.org',
  password: 'güvenli_şifre',
  ad: 'Sistem',
  soyad: 'Yöneticisi',
  name: 'Sistem Yöneticisi',
  role: 'admin',
  birim: 'Yönetici',
  yetki: 'KULLANICI',
  gorev: 'Sistem Yöneticisi',
  kisa_kod: 'ADMIN001',
  erisim_yetkisi: 'admin@kafkasder.org',
  imza_yetkisi: 'Sistem',
  fon_bolgesi_yetkisi: 'ALL',
})
```

⚠️ **Önemli**: İlk admin hesabını oluşturduktan sonra hemen şifrenizi değiştirin!

## 📊 Kullanıcı Yönetim Panelini Kullanma

### Panel Erişimi

Admin hesabınızla giriş yaptıktan sonra:
```
https://sizin-alan-adiniz.com/admin/users
```
adresine gidin.

### Temel İşlemler

#### 1. Kullanıcı Listesi Görüntüleme

- **Tüm Kullanıcılar**: "Tümü" tabını seçin
- **Sadece Aktifler**: "Aktif" tabını seçin
- **Sadece Pasifler**: "Pasif" tabını seçin
- **Sadece Adminler**: "Adminler" tabını seçin
- **Sadece Moderatörler**: "Moderatörler" tabını seçin

#### 2. Kullanıcı Arama

Tablonun üstündeki arama kutusunu kullanarak:
- E-posta adresi
- Ad ve soyad
- Kısa kod
- Birim
- Görev
- Yetki

alanlarında arama yapabilirsiniz.

#### 3. Kullanıcı Filtreleme

Rol filtreleme dropdown'ını kullanarak:
- Admin
- Moderatör
- Kullanıcı

seçeneklerinden birini seçebilirsiniz.

#### 4. Sütun Gösterme/Gizleme

"Sütunlar" dropdown menüsünden istemediğiniz sütunları gizleyebilirsiniz.

#### 5. Sıralama

Sütun başlıklarına tıklayarak:
- Ad Soyad (A-Z veya Z-A)
- Rol (A-Z veya Z-A)
- Birim (A-Z veya Z-A)
- Son Giriş (Eski-Yeni veya Yeni-Eski)

gibi sıralamalar yapabilirsiniz.

#### 6. Kullanıcı Oluşturma

1. Sağ üst köşedeki "Yeni Kullanıcı" butonuna tıklayın
2. Formu doldurun:
   - **Temel Bilgiler**: E-posta, şifre, ad, soyad, telefon, rol
   - **İş Bilgileri**: Birim, görev, yetki, dahili, kısa kodlar, erişim ve imza yetkileri, fon yetkileri
   - **İzinler**: Rol bazlı varsayılan veya özel izinler
3. "Kullanıcı Oluştur" butonuna tıklayın

#### 7. Kullanıcı Düzenleme

1. Kullanıcı satırındaki "İşlemler" menüsüne tıklayın
2. "Düzenle" seçeneğine tıklayın
3. Formu güncelleyin
4. "Değişiklikleri Kaydet" butonuna tıklayın

#### 8. Kullanıcı Durumunu Değiştirme (Aktif/Pasif)

1. Kullanıcı satırındaki "Durum" switch'ine tıklayın
2. Kullanıcı otomatik olarak aktif/pasif olur

Veya:

1. "İşlemler" menüsüne tıklayın
2. "Aktife Al" veya "Pasife Al" seçeneğine tıklayın

#### 9. Kullanıcı Silme

**Tek Kullanıcı Silme**:
1. "İşlemler" menüsüne tıklayın
2. "Sil" seçeneğine tıklayın
3. Onay verin

**Toplu Silme**:
1. Silinecek kullanıcıların seçim kutularını işaretleyin
2. "Seçilenleri Sil" butonuna tıklayın
3. Onay verin

#### 10. Kullanıcı İzinlerini Yönetme

1. Kullanıcı düzenleme sayfasında "İzinler" tabına tıklayın
2. "Özel İzinler" switch'ini aktif edin
3. İzinleri kategorilere göre yönetin:
   - **Temel Yetenekler**: LOGIN, VIEW_PROFILE, UPDATE_PROFILE
   - **Kullanıcı Yönetimi**: VIEW_USERS, CREATE_USER, UPDATE_USER, DELETE_USER, MANAGE_ROLES
   - **Finansal İşlemler**: VIEW_DONATIONS, CREATE_DONATION, VIEW_FINANCIAL_REPORTS
   - **Sosyal Yardım**: VIEW_APPLICATIONS, APPROVE_APPLICATION, CREATE_PAYMENT
   - **Kurumsal Ayarlar**: VIEW_SETTINGS, UPDATE_SETTINGS
   - **Yönetici Yetkileri**: MANAGE_SYSTEM
4. Her izin için switch'i kullanın
5. "Değişiklikleri Kaydet" butonuna tıklayın

## 🔐 Roller ve İzinler

### Roller

Sistemde 3 ana rol vardır:

#### 1. Admin (Yönetici)
- Tam sistem erişimi
- Tüm kullanıcıları yönetebilir
- Tüm finansal verileri görebilir
- Sistem ayarlarını değiştirebilir
- ✅ Tüm izinler varsayılan olarak aktif

#### 2. Moderator (Moderatör)
- Kullanıcı yönetimi
- Finansal erişim
- Sosyal yardım yönetimi
- ❌ Sistem ayarlarını değiştiremez
- ❌ Sistem yönetimi yetkisi yok

#### 3. User (Kullanıcı)
- Sadece kendi profiline erişim
- Profilini güncelleyebilir
- ❌ Diğer kullanıcıları yönetemez
- ❌ Finansal verilere erişemez

### İzin Açıklamaları

#### Temel Yetenekler
- **LOGIN**: Sisteme giriş yapabilir
- **VIEW_PROFILE**: Kendi profilini görebilir
- **UPDATE_PROFILE**: Kendi profilini güncelleyebilir

#### Kullanıcı Yönetimi
- **VIEW_USERS**: Tüm kullanıcıları görebilir
- **CREATE_USER**: Yeni kullanıcı ekleyebilir
- **UPDATE_USER**: Kullanıcı bilgilerini düzenleyebilir
- **DELETE_USER**: Kullanıcı silebilir
- **MANAGE_ROLES**: Kullanıcı rollerini değiştirebilir

#### Finansal İşlemler
- **VIEW_DONATIONS**: Tüm bağışları görebilir
- **CREATE_DONATION**: Yeni bağış kaydedebilir
- **VIEW_FINANCIAL_REPORTS**: Finansal raporları görebilir

#### Sosyal Yardım
- **VIEW_APPLICATIONS**: Tüm başvuruları görebilir
- **APPROVE_APPLICATION**: Başvuruları onaylayabilir
- **CREATE_PAYMENT**: Ödeme oluşturabilir

#### Kurumsal Ayarlar
- **VIEW_SETTINGS**: Sistem ayarlarını görebilir
- **UPDATE_SETTINGS**: Sistem ayarlarını değiştirebilir

#### Yönetici Yetkileri
- **MANAGE_SYSTEM**: Tüm sistem özelliklerini yönetebilir

## 🎯 En İyi Uygulamalar

### Kullanıcı Yönetimi
1. **En az ayrıcalık prensibi**: Kullanıcılara sadece ihtiyaç duydukları izinleri verin
2. **Rol bazlı yönetim**: Mümkün olduğunca rolleri kullanın, özel izinlerden kaçının
3. **Düzenli gözden geçirme**: Kullanıcı izinlerini periyodik olarak gözden geçirin
4. **Pasif kullanıcıları temizle**: Artık kullanılmayan hesapları pasife alın veya silin

### Güvenlik
1. **Güçlü şifre politikası**: En az 8 karakter, büyük harf, küçük harf, rakam ve özel karakter
2. **İki faktörlü authentication (2FA)**: Mümkünse etkinleştirin
3. **Şifre sıfırlama**: Kullanıcıların şifrelerini sıfırlayabilecek bir mekanizma sağlayın
4. **Log tutma**: Kullanıcı işlemlerini loglayın

### Denetim
1. **Audit log**: Tüm kullanıcı işlemlerini loglayın
2. **Düzenli raporlama**: Kullanıcı aktivitesi ve izin değişiklikleri hakkında raporlar alın
3. **Olay bildirimleri**: Önemli işlemler (silme, rol değişikliği vb.) için bildirim gönderin

## ❓ Sık Karşılaşılan Sorular

### Q: Kullanıcı oluştururken "Kullanıcı oluşturma hatası" alıyorum.
**A:** Şunları kontrol edin:
1. E-posta adresi benzersiz olmalı
2. `SUPABASE_SERVICE_ROLE_KEY` environment variable'ı tanımlı olmalı
3. Şifre en az 6 karakter olmalı
4. Supabase Authentication aktif olmalı

### Q: Admin paneline erişemiyorum.
**A:** Şunları kontrol edin:
1. Oturum açtığınız kullanıcının admin rolü var mı?
2. `app_metadata` içinde `role: 'admin'` ve `permissions` objesi var mı?
3. Kullanıcı aktif mi (`is_active: true`)?

### Q: Kullanıcıları sayfalamalıyorum ama sonuçlar görünmüyor.
**A:** Şunları kontrol edin:
1. Supabase Auth API'den veri çekiliyor mu? (Browser Console'da kontrol edin)
2. Filtreler çok kısıtlayıcı mı? (Aramayı temizlemeyi deneyin)
3. Kullanıcı sayısı 0 mı olabilir?

### Q: İzinleri güncelliyorum ama etkili olmuyor.
**A:** Şunları kontrol edin:
1. "Özel İzinler" switch'ini aktif ettiniz mi?
2. Sayfayı yenilediniz mi veya formu kaydettiniz mi?
3. Supabase `app_metadata.permissions` objesi güncellendi mi? (Supabase Dashboard'da kontrol edin)

### Q: Bir kullanıcıyı silmek istemiyorum ama pasife almak istiyorum.
**A:** Kullanıcı satırındaki "Durum" switch'ine tıklayarak kullanıcıyı pasife alabilirsiniz. Pasif kullanıcılar sisteme giriş yapamaz.

### Q: Birden fazla admin olmalı mı?
**A:** Evet, en az 2 admin hesabı önerilir. Bir admin hesabının erişimi kaybolursa (örneğin şifre unutulursa), diğer admin ile erişimi sağlayabilirsiniz.

### Q: Kullanıcıların şifrelerini nasıl sıfırlarım?
**A:** Şu anki implementasyonda şifre sıfırlama özelliği yok. Bu özelliği eklemek için:
1. Supabase Auth'ın built-in password reset özelliğini kullanın
2. Veya admin panelinde "Şifre Sıfırla" butonu ekleyin (yeni şifre email ile gönderilir)

### Q: İstatistik kartlarında veriler görünmüyor.
**A:** Şunları kontrol edin:
1. Supabase Auth API'den kullanıcı listesi çekiliyor mu?
2. `getUserCount` fonksiyonu doğru çalışıyor mu?
3. React Suspense loading state'i kaldırılıp veriler yükleniyor mu?

## 📚 Ek Kaynaklar

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Hook Form](https://react-hook-form.com/)
- [TanStack Table](https://tanstack.com/table/latest)
- [Zustand State Management](https://zustand-demo.pmnd.rs/)

## 🤝 Destek

Sorun yaşıyorsanız veya sorularınız varsa:
1. Supabase Dashboard'daki logları kontrol edin
2. Browser Console'da hataları kontrol edin
3. GitHub Issues'da benzer soruları arayın
4. Geliştirici ekibiyle iletişime geçin

---

**Son Güncelleme**: 2025-01-04
**Sürüm**: 1.0.0
**Yazar**: Kafkas Derneği Geliştirme Ekibi

