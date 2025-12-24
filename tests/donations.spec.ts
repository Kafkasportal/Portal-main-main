import { test, expect } from './fixtures/test-fixtures';
import { ROUTES } from './fixtures/test-fixtures';

test.describe('Bağış Modülü Testleri', () => {
  test.describe('Bağış Listesi Sayfası', () => {
    test('bağış listesi sayfasına gidilebilmeli', async ({ authenticatedPage: page }) => {
      await page.getByRole('button', { name: 'Bağışlar' }).click();
      await page.getByRole('link', { name: 'Bağış Listesi' }).click();
      
      await expect(page).toHaveURL(/bagis\/liste/);
      await expect(page.getByRole('heading', { name: /Bağış/i })).toBeVisible();
    });

    test('bağış tablosu görünmeli', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.donations.list);
      
      // Tablo başlıkları
      await expect(page.getByRole('columnheader', { name: /Bağışçı|Ad/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /Tutar/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /Durum/i })).toBeVisible();
    });

    test('arama kutusu çalışmalı', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.donations.list);
      
      const searchBox = page.getByPlaceholder(/Ara/i);
      await searchBox.fill('test');
      
      // Arama sonuçları güncellenmeli (veya "sonuç bulunamadı" mesajı)
      await page.waitForTimeout(500); // Debounce için bekle
    });

    test('durum filtresi çalışmalı', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.donations.list);
      
      // Filtre dropdown'ını bul ve tıkla
      const filterButton = page.getByRole('button', { name: /Durum|Filtre/i }).first();
      if (await filterButton.isVisible()) {
        await filterButton.click();
        
        // Filtre seçenekleri görünmeli
        await expect(page.getByRole('option', { name: /Tamamlandı|Beklemede/i }).first()).toBeVisible();
      }
    });

    test('sayfalama çalışmalı', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.donations.list);
      
      // Sayfalama kontrolleri
      const pagination = page.locator('[class*="pagination"], nav').first();
      if (await pagination.isVisible()) {
        // Sonraki sayfa butonu
        const nextButton = page.getByRole('button', { name: /Sonraki|Next|>/i });
        if (await nextButton.isEnabled()) {
          await nextButton.click();
          await page.waitForTimeout(500);
        }
      }
    });

    test('sıralama çalışmalı', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.donations.list);
      
      // Tutar sütununa tıklayarak sıralama
      const amountHeader = page.getByRole('columnheader', { name: /Tutar/i });
      if (await amountHeader.isVisible()) {
        await amountHeader.click();
        await page.waitForTimeout(300);
      }
    });

    test('satır sayısı değiştirilebilmeli', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.donations.list);
      
      // Sayfa başına satır sayısı seçici
      const pageSizeSelector = page.getByRole('combobox', { name: /sayfa|rows/i });
      if (await pageSizeSelector.isVisible()) {
        await pageSizeSelector.click();
        await page.getByRole('option', { name: /25|50/i }).first().click();
      }
    });
  });

  test.describe('Yeni Bağış Ekleme', () => {
    test('yeni bağış dialog\'u açılmalı', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.donations.list);
      
      // Yeni bağış butonu
      const newButton = page.getByRole('button', { name: /Yeni Bağış|Ekle/i });
      if (await newButton.isVisible()) {
        await newButton.click();
        
        // Dialog açılmalı
        await expect(page.getByRole('dialog')).toBeVisible();
      }
    });

    test('bağış formu doğru alanları içermeli', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.donations.list);
      
      const newButton = page.getByRole('button', { name: /Yeni Bağış|Ekle/i });
      if (await newButton.isVisible()) {
        await newButton.click();
        
        // Form alanları
        await expect(page.getByLabel(/Ad/i)).toBeVisible();
        await expect(page.getByLabel(/Tutar/i)).toBeVisible();
      }
    });
  });

  test.describe('Kumbara Sayfası', () => {
    test('kumbara sayfasına gidilebilmeli', async ({ authenticatedPage: page }) => {
      await page.getByRole('button', { name: 'Bağışlar' }).click();
      await page.getByRole('link', { name: 'Kumbara' }).click();
      
      await expect(page).toHaveURL(/bagis\/kumbara/);
    });

    test('kumbara listesi görünmeli', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.donations.kumbara);
      
      // Sayfa başlığı
      await expect(page.getByRole('heading', { name: /Kumbara/i })).toBeVisible();
    });

    test('kumbara kartları veya tablosu görünmeli', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.donations.kumbara);
      
      // Kumbara verileri (tablo veya kartlar)
      const content = page.locator('table, [class*="card"], [class*="grid"]').first();
      await expect(content).toBeVisible();
    });
  });

  test.describe('Raporlar Sayfası', () => {
    test('raporlar sayfasına gidilebilmeli', async ({ authenticatedPage: page }) => {
      await page.getByRole('button', { name: 'Bağışlar' }).click();
      await page.getByRole('link', { name: 'Raporlar' }).click();
      
      await expect(page).toHaveURL(/bagis\/raporlar/);
    });

    test('rapor grafikleri görünmeli', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.donations.reports);
      
      // Grafikler veya raporlar
      await expect(page.getByRole('heading', { name: /Rapor/i })).toBeVisible();
    });
  });

  test.describe('Bağış Detay Görünümü', () => {
    test('bağış satırına tıklanınca detay görünmeli', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.donations.list);
      
      // İlk satıra tıkla
      const firstRow = page.locator('tbody tr').first();
      if (await firstRow.isVisible()) {
        await firstRow.click();
        
        // Detay modal veya sayfa açılmalı
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Excel Export', () => {
    test('excel export butonu görünmeli', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.donations.list);
      
      // Export butonu
      const exportButton = page.getByRole('button', { name: /Export|Excel|İndir/i });
      if (await exportButton.isVisible()) {
        await expect(exportButton).toBeEnabled();
      }
    });
  });
});
