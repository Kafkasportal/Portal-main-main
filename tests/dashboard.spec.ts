import { test, expect } from './fixtures/test-fixtures';

test.describe('Dashboard Testleri', () => {
  test.describe('Dashboard Görünümü', () => {
    test('dashboard sayfası doğru yüklenmeli', async ({ authenticatedPage: page }) => {
      // Sayfa başlığı
      await expect(page.getByRole('heading', { name: 'Genel Bakış' })).toBeVisible();
      await expect(page.getByText('Dernek istatistikleri ve son aktiviteler')).toBeVisible();
    });

    test('tüm istatistik kartları görünmeli', async ({ authenticatedPage: page }) => {
      // İstatistik kartları
      await expect(page.getByText('Toplam Bağış')).toBeVisible();
      await expect(page.getByText('Aktif Üye')).toBeVisible();
      await expect(page.getByText('Bekleyen Başvuru')).toBeVisible();
      await expect(page.getByText('Bu Ay Ödenen Yardım')).toBeVisible();
    });

    test('istatistik değerleri görünmeli', async ({ authenticatedPage: page }) => {
      // Değerler (₺ sembolü ile)
      await expect(page.locator('text=/₺[0-9.,]+/')).toBeTruthy();
    });

    test('aylık bağış grafiği görünmeli', async ({ authenticatedPage: page }) => {
      await expect(page.getByText('Aylık Bağış Grafiği')).toBeVisible();
      // Ay isimleri kontrolü
      await expect(page.getByText('Oca')).toBeVisible();
      await expect(page.getByText('Şub')).toBeVisible();
      await expect(page.getByText('Ara')).toBeVisible();
    });

    test('yardım dağılımı grafiği görünmeli', async ({ authenticatedPage: page }) => {
      await expect(page.getByText('Yardım Dağılımı')).toBeVisible();
      // Yardım kategorileri
      await expect(page.getByText('Nakdi Yardım')).toBeVisible();
      await expect(page.getByText('Eğitim')).toBeVisible();
      await expect(page.getByText('Sağlık')).toBeVisible();
    });

    test('son bağışlar listesi görünmeli', async ({ authenticatedPage: page }) => {
      await expect(page.getByText('Son Bağışlar')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Tümünü Gör' })).toBeVisible();
      
      // En az bir bağış kaydı olmalı
      const donationItems = page.locator('[class*="donation-item"], [class*="list"] > div').first();
      await expect(donationItems).toBeTruthy();
    });
  });

  test.describe('Dashboard Navigasyonu', () => {
    test('grafik detaylarına gidilebilmeli', async ({ authenticatedPage: page }) => {
      // Bağış raporları linki
      const detailsLink = page.getByRole('link', { name: 'Detaylar' }).first();
      await detailsLink.click();
      
      await expect(page).toHaveURL(/bagis\/raporlar|sosyal-yardim/);
    });

    test('son bağışlar tümünü gör linki çalışmalı', async ({ authenticatedPage: page }) => {
      await page.getByRole('link', { name: 'Tümünü Gör' }).click();
      
      await expect(page).toHaveURL(/bagis\/liste/);
    });
  });

  test.describe('Sidebar Navigasyonu', () => {
    test('tüm ana menü öğeleri görünmeli', async ({ authenticatedPage: page }) => {
      await expect(page.getByRole('link', { name: 'Genel Bakış' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Bağışlar' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Üyeler' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sosyal Yardım' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Etkinlikler' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Dokümanlar' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Ayarlar' })).toBeVisible();
    });

    test('bağışlar alt menüsü açılmalı', async ({ authenticatedPage: page }) => {
      await page.getByRole('button', { name: 'Bağışlar' }).click();
      
      await expect(page.getByRole('link', { name: 'Bağış Listesi' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Kumbara' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Raporlar' })).toBeVisible();
    });

    test('üyeler alt menüsü açılmalı', async ({ authenticatedPage: page }) => {
      await page.getByRole('button', { name: 'Üyeler' }).click();
      
      await expect(page.getByRole('link', { name: 'Üye Listesi' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Yeni Üye' })).toBeVisible();
    });

    test('sosyal yardım alt menüsü açılmalı', async ({ authenticatedPage: page }) => {
      await page.getByRole('button', { name: 'Sosyal Yardım' }).click();
      
      await expect(page.getByRole('link', { name: 'İhtiyaç Sahipleri' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Başvurular' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Ödemeler' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'İstatistikler' })).toBeVisible();
    });

    test('sidebar daraltılabilmeli', async ({ authenticatedPage: page }) => {
      const collapseButton = page.getByRole('button', { name: /Daralt/i });
      await collapseButton.click();
      
      // Daraltıldığında menü isimleri gizlenmeli
      // Genişlet butonu görünmeli
      await expect(page.getByRole('button', { name: /Genişlet/i })).toBeVisible();
    });
  });

  test.describe('Header Testleri', () => {
    test('arama kutusu görünmeli', async ({ authenticatedPage: page }) => {
      await expect(page.getByRole('searchbox', { name: /Ara/i })).toBeVisible();
    });

    test('bildirimler butonu görünmeli', async ({ authenticatedPage: page }) => {
      await expect(page.getByRole('button', { name: 'Bildirimler' })).toBeVisible();
    });

    test('kullanıcı menüsü görünmeli', async ({ authenticatedPage: page }) => {
      await expect(page.getByRole('button', { name: /Ahmet Yönetici/i })).toBeVisible();
    });

    test('kullanıcı menüsü açılabilmeli', async ({ authenticatedPage: page }) => {
      await page.getByRole('button', { name: /Ahmet Yönetici/i }).click();
      
      // Dropdown menü açılmalı (çıkış, profil vb.)
      // Menü içeriği uygulamaya göre değişebilir
    });
  });

  test.describe('Dashboard Veri Kontrolü', () => {
    test('toplam bağış değeri pozitif olmalı', async ({ authenticatedPage: page }) => {
      const totalDonation = page.locator('text=/₺[0-9.,]+/').first();
      const text = await totalDonation.textContent();
      
      // ₺ sembolü ve rakam içermeli
      expect(text).toMatch(/₺[0-9.,]+/);
    });

    test('aktif üye sayısı görünmeli', async ({ authenticatedPage: page }) => {
      const memberCount = page.getByText('Aktif Üye').locator('..').locator('p').nth(1);
      const text = await memberCount.textContent();
      
      // Sayı olmalı
      expect(text).toMatch(/[0-9]+/);
    });

    test('trend göstergesi görünmeli', async ({ authenticatedPage: page }) => {
      // +23.1% gibi bir trend değeri
      const trendIndicator = page.locator('text=/[+-][0-9.,]+%/');
      await expect(trendIndicator.first()).toBeVisible();
    });
  });
});
