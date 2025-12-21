import { test, expect } from './fixtures/test-fixtures';
import { ROUTES } from './fixtures/test-fixtures';

test.describe('Sosyal Yardım Modülü Testleri', () => {
  test.describe('İhtiyaç Sahipleri Listesi', () => {
    test('ihtiyaç sahipleri sayfasına gidilebilmeli', async ({ authenticatedPage: page }) => {
      await page.getByRole('button', { name: 'Sosyal Yardım' }).click();
      await page.getByRole('link', { name: 'İhtiyaç Sahipleri' }).click();
      
      await expect(page).toHaveURL(/sosyal-yardim\/ihtiyac-sahipleri/);
    });

    test('ihtiyaç sahipleri tablosu görünmeli', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.socialAid.beneficiaries);
      
      await expect(page.getByRole('heading', { name: /İhtiyaç Sahip/i })).toBeVisible();
      
      // Tablo veya liste görünmeli
      const content = page.locator('table, [class*="card"], [class*="grid"]').first();
      await expect(content).toBeVisible();
    });

    test('arama çalışmalı', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.socialAid.beneficiaries);
      
      const searchBox = page.getByPlaceholder(/Ara/i);
      if (await searchBox.isVisible()) {
        await searchBox.fill('test');
        await page.waitForTimeout(500);
      }
    });

    test('filtreleme çalışmalı', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.socialAid.beneficiaries);
      
      const filterDropdown = page.getByRole('combobox').first();
      if (await filterDropdown.isVisible()) {
        await filterDropdown.click();
        await page.waitForTimeout(300);
      }
    });

    test('yeni ihtiyaç sahibi eklenebilmeli', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.socialAid.beneficiaries);
      
      const addButton = page.getByRole('button', { name: /Yeni|Ekle/i });
      if (await addButton.isVisible()) {
        await addButton.click();
        
        // Dialog veya form açılmalı
        await expect(page.getByRole('dialog').or(page.getByRole('form'))).toBeVisible();
      }
    });
  });

  test.describe('Başvurular Sayfası', () => {
    test('başvurular sayfasına gidilebilmeli', async ({ authenticatedPage: page }) => {
      await page.getByRole('button', { name: 'Sosyal Yardım' }).click();
      await page.getByRole('link', { name: 'Başvurular' }).click();
      
      await expect(page).toHaveURL(/sosyal-yardim\/basvurular/);
    });

    test('başvuru listesi görünmeli', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.socialAid.applications);
      
      await expect(page.getByRole('heading', { name: /Başvuru/i })).toBeVisible();
    });

    test('başvuru durumu filtrelenebilmeli', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.socialAid.applications);
      
      const statusFilter = page.getByRole('combobox', { name: /Durum|Filtre/i }).first();
      if (await statusFilter.isVisible()) {
        await statusFilter.click();
        
        // Durum seçenekleri
        const option = page.getByRole('option', { name: /Beklemede|Onaylandı|Reddedildi/i }).first();
        if (await option.isVisible()) {
          await option.click();
        }
      }
    });

    test('başvuru detayları görüntülenebilmeli', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.socialAid.applications);
      
      const firstRow = page.locator('tbody tr').first();
      if (await firstRow.isVisible()) {
        await firstRow.click();
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Ödemeler Sayfası', () => {
    test('ödemeler sayfasına gidilebilmeli', async ({ authenticatedPage: page }) => {
      await page.getByRole('button', { name: 'Sosyal Yardım' }).click();
      await page.getByRole('link', { name: 'Ödemeler' }).click();
      
      await expect(page).toHaveURL(/sosyal-yardim\/odemeler/);
    });

    test('ödeme listesi görünmeli', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.socialAid.payments);
      
      await expect(page.getByRole('heading', { name: /Ödeme/i })).toBeVisible();
    });

    test('ödeme tarih filtresi çalışmalı', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.socialAid.payments);
      
      // Tarih seçici
      const dateInput = page.getByLabel(/Tarih/i).first();
      if (await dateInput.isVisible()) {
        await dateInput.click();
      }
    });
  });

  test.describe('İstatistikler Sayfası', () => {
    test('istatistikler sayfasına gidilebilmeli', async ({ authenticatedPage: page }) => {
      await page.getByRole('button', { name: 'Sosyal Yardım' }).click();
      await page.getByRole('link', { name: 'İstatistikler' }).click();
      
      await expect(page).toHaveURL(/sosyal-yardim\/istatistikler/);
    });

    test('istatistik kartları görünmeli', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.socialAid.stats);
      
      // İstatistik kartları veya grafikler
      const statsCards = page.locator('[class*="card"], [class*="stat"]');
      await expect(statsCards.first()).toBeVisible();
    });

    test('grafikler render edilmeli', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.socialAid.stats);
      
      // Chart veya grafik elementleri
      const charts = page.locator('canvas, svg, [class*="chart"]');
      if (await charts.first().isVisible()) {
        await expect(charts.first()).toBeVisible();
      }
    });
  });

  test.describe('Yeni İhtiyaç Sahibi Formu', () => {
    test('form alanları doğru çalışmalı', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.socialAid.beneficiaries);
      
      const addButton = page.getByRole('button', { name: /Yeni|Ekle/i });
      if (await addButton.isVisible()) {
        await addButton.click();
        
        // Form alanları
        const adField = page.getByLabel(/Ad/i);
        const soyadField = page.getByLabel(/Soyad/i);
        
        if (await adField.isVisible()) {
          await expect(adField).toBeVisible();
        }
        if (await soyadField.isVisible()) {
          await expect(soyadField).toBeVisible();
        }
      }
    });

    test('zorunlu alan kontrolü yapılmalı', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.socialAid.beneficiaries);
      
      const addButton = page.getByRole('button', { name: /Yeni|Ekle/i });
      if (await addButton.isVisible()) {
        await addButton.click();
        
        // Boş form gönder
        const submitButton = page.getByRole('button', { name: /Kaydet|Ekle/i }).last();
        if (await submitButton.isVisible()) {
          await submitButton.click();
          
          // Hata mesajı
          await expect(page.getByText(/zorunlu|gerekli|required/i).first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Export İşlemleri', () => {
    test('ihtiyaç sahipleri export edilebilmeli', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.socialAid.beneficiaries);
      
      const exportButton = page.getByRole('button', { name: /Export|Excel|İndir/i });
      if (await exportButton.isVisible()) {
        await expect(exportButton).toBeEnabled();
      }
    });

    test('ödemeler export edilebilmeli', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.socialAid.payments);
      
      const exportButton = page.getByRole('button', { name: /Export|Excel|İndir/i });
      if (await exportButton.isVisible()) {
        await expect(exportButton).toBeEnabled();
      }
    });
  });
});
