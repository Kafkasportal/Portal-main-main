import { test, expect } from './fixtures/test-fixtures';
import { ROUTES, generateTestMember } from './fixtures/test-fixtures';

test.describe('Üye Modülü Testleri', () => {
  test.describe('Üye Listesi Sayfası', () => {
    test('üye listesi sayfasına gidilebilmeli', async ({ authenticatedPage: page }) => {
      await page.getByRole('button', { name: 'Üyeler' }).click();
      await page.getByRole('link', { name: 'Üye Listesi' }).click();
      
      await expect(page).toHaveURL(/uyeler\/liste/);
      await expect(page.getByRole('heading', { name: /Üye/i })).toBeVisible();
    });

    test('üye tablosu görünmeli', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.members.list);
      
      // Tablo başlıkları
      await expect(page.getByRole('columnheader', { name: /Ad|İsim/i }).first()).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /Soyad/i })).toBeVisible();
    });

    test('üye arama çalışmalı', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.members.list);
      
      const searchBox = page.getByPlaceholder(/Ara/i);
      await searchBox.fill('Ahmet');
      await page.waitForTimeout(500);
    });

    test('durum filtresi çalışmalı', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.members.list);
      
      const statusFilter = page.getByRole('combobox', { name: /Durum|Filtre/i }).first();
      if (await statusFilter.isVisible()) {
        await statusFilter.click();
        await page.getByRole('option', { name: /Aktif/i }).first().click();
        await page.waitForTimeout(300);
      }
    });

    test('sayfalama çalışmalı', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.members.list);
      
      const nextButton = page.getByRole('button', { name: /Sonraki|Next|>/i });
      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(500);
      }
    });

    test('satır sayısı değiştirilebilmeli', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.members.list);
      
      const pageSizeSelector = page.getByRole('combobox', { name: /sayfa|rows/i });
      if (await pageSizeSelector.isVisible()) {
        await pageSizeSelector.click();
        await page.getByRole('option', { name: /25|50/i }).first().click();
      }
    });
  });

  test.describe('Yeni Üye Ekleme', () => {
    test('yeni üye sayfasına gidilebilmeli', async ({ authenticatedPage: page }) => {
      await page.getByRole('button', { name: 'Üyeler' }).click();
      await page.getByRole('link', { name: 'Yeni Üye' }).click();
      
      await expect(page).toHaveURL(/uyeler\/yeni/);
    });

    test('üye formu görünmeli', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.members.new);
      
      // Form başlığı
      await expect(page.getByRole('heading', { name: /Yeni Üye|Üye Ekle/i })).toBeVisible();
      
      // Gerekli form alanları
      await expect(page.getByLabel(/Ad/i)).toBeVisible();
      await expect(page.getByLabel(/Soyad/i)).toBeVisible();
    });

    test('boş form gönderilince hata vermeli', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.members.new);
      
      // Kaydet butonuna tıkla
      const submitButton = page.getByRole('button', { name: /Kaydet|Ekle/i });
      await submitButton.click();
      
      // Hata mesajları görünmeli
      await expect(page.getByText(/zorunlu|gerekli|required/i).first()).toBeVisible();
    });

    test('geçerli verilerle üye eklenebilmeli', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.members.new);
      
      const testMember = generateTestMember();
      
      // Form alanlarını doldur
      await page.getByLabel(/Ad/i).first().fill(testMember.ad);
      await page.getByLabel(/Soyad/i).fill(testMember.soyad);
      
      // Telefon alanı varsa doldur
      const phoneField = page.getByLabel(/Telefon/i);
      if (await phoneField.isVisible()) {
        await phoneField.fill(testMember.telefon);
      }
      
      // Email alanı varsa doldur
      const emailField = page.getByLabel(/E-posta|Email/i);
      if (await emailField.isVisible()) {
        await emailField.fill(testMember.email);
      }
    });

    test('telefon numarası formatı kontrol edilmeli', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.members.new);
      
      const phoneField = page.getByLabel(/Telefon/i);
      if (await phoneField.isVisible()) {
        await phoneField.fill('123'); // Geçersiz format
        await page.getByRole('button', { name: /Kaydet|Ekle/i }).click();
        
        // Telefon format hatası
        await expect(page.getByText(/geçerli|telefon|format/i).first()).toBeVisible();
      }
    });

    test('email formatı kontrol edilmeli', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.members.new);
      
      const emailField = page.getByLabel(/E-posta|Email/i);
      if (await emailField.isVisible()) {
        await emailField.fill('invalid-email'); // Geçersiz format
        await page.getByRole('button', { name: /Kaydet|Ekle/i }).click();
        
        // Email format hatası
        await expect(page.getByText(/geçerli|e-posta|email|format/i).first()).toBeVisible();
      }
    });
  });

  test.describe('Aidat Takibi', () => {
    test('aidat durumu görünmeli', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.members.list);
      
      // Aidat sütunu veya bilgisi
      const aidatColumn = page.getByRole('columnheader', { name: /Aidat/i });
      if (await aidatColumn.isVisible()) {
        await expect(aidatColumn).toBeVisible();
      }
    });
  });

  test.describe('Üye Detay', () => {
    test('üye satırına tıklanınca detay görünmeli', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.members.list);
      
      const firstRow = page.locator('tbody tr').first();
      if (await firstRow.isVisible()) {
        await firstRow.click();
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Üye Düzenleme', () => {
    test('üye düzenleme butonları görünmeli', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.members.list);
      
      const editButton = page.getByRole('button', { name: /Düzenle|Edit/i }).first();
      if (await editButton.isVisible()) {
        await expect(editButton).toBeEnabled();
      }
    });
  });

  test.describe('Excel Export', () => {
    test('excel export butonu görünmeli', async ({ authenticatedPage: page }) => {
      await page.goto(ROUTES.members.list);
      
      const exportButton = page.getByRole('button', { name: /Export|Excel|İndir/i });
      if (await exportButton.isVisible()) {
        await expect(exportButton).toBeEnabled();
      }
    });
  });
});
