-- ==========================================
-- İlk Admin Hesabı Oluşturma Script'i
-- ==========================================
-- Bu script: auth.users tablosunda ilki admin hesabını oluşturur
-- Supabase SQL Editor'de veya Supabase CLI'de çalıştırılabilir

-- ==========================================
-- 1. İLK ADMIN HESABINI OLUŞTURMA
-- ==========================================

-- auth.users tablosuna admin kullanıcısını ekliyoruz
-- app_metadata JSONB alanında yetkiler ve kişisel bilgiler saklanacak

UPDATE auth.users
SET 
  -- Kullanıcı Adı
  app_metadata = jsonb_build_object(
    'ad', 'Sistem',
    
    -- Kullanıcı Soyadı
    'soyad', 'Yönetici',
    
    -- Bireys/Kurum (Varsayılan: Sistem)
    'birim', 'Sistem',
    
    -- Rol: Admin
    'yetki', 'KULLANICI',
    
    -- Kişi Kod
    'kisa_kod', 'ADMIN',
    
    -- İş Birimi (Varsayılan: Sistem)
    'gorev', 'Sistem',
    
    -- Telefon
    'telefon', null,
    
    -- Kısa Kod / ID (Varsayılan: ADMIN)
    'kisa_kod2', 'ADMIN',
    
    -- Görev
    'gorev2', null,
    
    -- Fon Bölgesi (Varsayılan: Sistem)
    'fon_bolgesi', null,
    
    -- Fon Yetkisi (Varsayılan: Sistem)
    'fon_yetkisi', null,
    
    -- İmza Yetkisi (Varsayılan: Sistem)
    'imza_yetkisi', null,
    
    -- Fon Bölgesi Yetkisi (Varsayılan: Sistem)
    'fon_bolgesi_yetkisi', null,
    
    -- Fon Yetkisi 2 (Varsayılan: Sistem)
    'fon_yetkisi2', null,
    
    -- İmza Yetkisi 2 (Varsayılan: Sistem)
    'imza_yetkisi2', null,
    
    -- Fon Bölgesi Yetkisi 3 (Varsayılan: Sistem)
    'fon_bolgesi_yetkisi3', null,
    
    -- Fon Yetkisi 3 (Varsayılan: Sistem)
    'fon_yetkisi3', null,
    
    -- İmza Yetkisi 3 (Varsayılan: Sistem)
    'imza_yetkisi3', null,
    
    -- Durum: Aktif (Varsayılan: true)
    'durum', 'aktif',
    
    -- Tüm Yetkiler: true (Admin tüm yetkilere sahip)
    'tum_yetkiler', jsonb_build_object(
      'LOGIN', true,
      'VIEW_PROFILE', true,
      'UPDATE_PROFILE', true,
      'VIEW_USERS', true,
      'CREATE_USER', true,
      'UPDATE_USER', true,
      'DELETE_USER', true,
      'MANAGE_ROLES', true,
      'VIEW_DONATIONS', true,
      'CREATE_DONATION', true,
      'VIEW_FINANCIAL_REPORTS', true,
      'VIEW_APPLICATIONS', true,
      'APPROVE_APPLICATION', true,
      'CREATE_PAYMENT', true,
      'VIEW_SETTINGS', true,
      'UPDATE_SETTINGS', true,
      'MANAGE_SYSTEM', true
    ),
    
    -- Son Güncelleme
    'updated_at', NOW()
  )
WHERE 
  email = 'admin@kafkasder.org'
  AND deleted_at IS NULL;

-- ==========================================
-- 2. GÜVENLİK NOTLARI
-- ==========================================

-- Bu script'i çalıştırdıktan sonra kontrol edin:
-- 1. Supabase Dashboard'da "Authentication" > "Users" sayfasına gidin
-- 2. admin@kafkasder.org kullanıcısını listeden bulun
-- 3. Kullanıcının app_metadata alanının dolu olduğunu kontrol edin
-- 4. Tüm yetkilerin (tum_yetkiler) true olarak ayarlandığını doğrulayın
-- 5. Sonra admin hesabıyla giriş yapın ve kullanıcı yönetimini test edin

-- ==========================================
-- 3. MANUEL ALTERNATİFLER
-- ==========================================

-- Yöntem 2: Supabase Dashboard'dan manuel kullanıcı oluşturma
-- Eğer SQL script çalışmazsa, bu yöntemi kullanın:

-- SQL script'i çalıştırın:
-- psql -U <url> -u <user> -d <database> -f docs/CREATE_ADMIN.sql

-- Sonra manuel admin kullanıcısı oluşturmak için:
-- 1. Supabase Dashboard'a gidin: https://supabase.com/dashboard
-- 2. Authentication > Users sayfasına tıklayın
-- 3. Sağ üstte "New User" butonuna tıklayın
-- 4. Şu bilgileri girin:
--    Email: admin@kafkasder.org
--    Password: (Size belirleyin - en az 12 karakter, büyük/küçük harf ve rakam)
--    Email Confirm: admin@kafkasder.org
--    Name: Sistem
--    Last Name: Yönetici
--    Language: Turkish (tr-TR)
-- 5. "Add new user" butonuna tıklayın
-- 6. Kullanıcının oluşturulduğunu doğrulayın
-- 7. Kullanıcının app_metadata alanına aşağıdaki JSON'i yapıştırın:

/*
{
  "ad": "Sistem",
  "soyad": "Yönetici",
  "birim": "Sistem",
  "yetki": "KULLANICI",
  "kisa_kod": "ADMIN",
  "gorev": "Sistem",
  "gorev2": null,
  "fon_bolgesi": null,
  "fon_yetkisi": null,
  "fon_bolgesi_yetkisi": null,
  "fon_yetkisi2": null,
  "imza_yetkisi2": null,
  "fon_bolgesi_yetkisi2": null,
  "fon_yetkisi3": null,
  "fon_yetkisi3": null,
  "imza_yetkisi3": null,
  "durum": "aktif",
  "tum_yetkiler": {
    "LOGIN": true,
    "VIEW_PROFILE": true,
    "UPDATE_PROFILE": true,
    "VIEW_USERS": true,
    "CREATE_USER": true,
    "UPDATE_USER": true,
    "DELETE_USER": true,
    "MANAGE_ROLES": true,
    "VIEW_DONATIONS": true,
    "CREATE_DONATION": true,
    "VIEW_FINANCIAL_REPORTS": true,
    "VIEW_APPLICATIONS": true,
    "APPROVE_APPLICATION": true,
    "CREATE_PAYMENT": true,
    "VIEW_SETTINGS": true,
    "UPDATE_SETTINGS": true,
    "MANAGE_SYSTEM": true
  }
}
*/

-- 8. "Add new user" butonuna tıklayın
-- 9. Kullanıcının oluşturulduğunu doğrulayın (Status: Active)
-- 10. Kullanıcının adının sol tarafında "User" badge'ini görmelisiniz

-- ==========================================
-- 4. DOĞRULAMA SORUNLARI
-- ==========================================

-- Kullanıcı tablosundaki alan anlamları:
-- ad: Kullanıcının tam adı
-- soyad: Kullanıcının soyadı
-- email: Kullanıcının e-posta adresi (unique)
-- phone: Kullanıcının telefon numarası
-- role: Kullanıcının rolü (admin/moderator/user)
-- avatar_url: Profil fotoğraf URL'si
-- is_active: Kullanıcının aktif/pasif durumu
-- last_login: Son giriş tarihi
-- created_at: Oluşturma tarihi
-- updated_at: Son güncelleme tarihi
-- deleted_at: Silme tarihi (soft delete için)

-- app_metadata: JSONB formatında saklı kişisel bilgiler
--   ad: "Sistem"
--   soyad: "Yönetici"
--   birim: "Sistem"
--   yetki: "KULLANICI"
--   kisa_kod: "ADMIN"
--   gorev: "Sistem"
--   tum_yetkiler: Tüm yetkilerin boolean değerleri
--   durum: "aktif"/"pasif"

-- ==========================================
-- 5. SONRAKİ SORGULAR
-- ==========================================

-- Bu script'i çalıştırdıktan sonra:
-- 1. admin@kafkasder.org hesabı ile giriş yapın
-- 2. Kullanıcı yönetimini test edin
-- 3. Kullanıcı oluşturma işlemini test edin
-- 4. Filtreleme işlemlerini test edin
-- 5. Kullanıcı düzenleme işlemini test edin
-- 6. Yetki kontrol sistemini test edin
-- 7. Her şey normal çalışıyorsa, production'a deploy edin

-- ==========================================
-- 6. ROLLBACK (GERİ DÖNÜŞ)
-- ==========================================

-- Eğer bir sorun olursa ve bu script'i tekrar çalıştırmak isterseniz:
-- Önce güncellemeyi geri alın:

UPDATE auth.users
SET 
  app_metadata = jsonb_build_object(
    'ad', 'Sistem',
    'soyad', 'Yönetici',
    'birim', 'Sistem',
    'yetki', 'KULLANICI',
    'kisa_kod', 'ADMIN',
    'gorev', 'Sistem',
    'telefon', null,
    'kisa_kod2', 'ADMIN',
    'tum_yetkiler', jsonb_build_object(
      'LOGIN', true,
      'VIEW_PROFILE', true,
      'UPDATE_PROFILE', true,
      'VIEW_USERS': true,
      'CREATE_USER', true,
      'UPDATE_USER', true,
      "DELETE_USER": true,
      'MANAGE_ROLES': true,
      'VIEW_DONATIONS': true,
      'CREATE_DONATION', true,
      'VIEW_FINANCIAL_REPORTS': true,
      'VIEW_APPLICATIONS': true,
      'APPROVE_APPLICATION', true,
      'CREATE_PAYMENT', true,
      "VIEW_SETTINGS": true,
      'UPDATE_SETTINGS": true,
      'MANAGE_SYSTEM': true
    ),
    'updated_at', NOW()
  )
WHERE 
  email = 'admin@kafkasder.org'
  AND deleted_at IS NULL;

-- ==========================================
-- 7. TEKNİK İPUÇLARI
-- ==========================================

-- Bu script güvenli SQL kullanır
-- Lütfen production'da çalıştırmadan önce test edin
-- Her zaman yedek almayı unutmayın

-- Başarılar!


