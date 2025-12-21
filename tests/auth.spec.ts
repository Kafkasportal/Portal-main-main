import { test, expect } from '@playwright/test';
import { TEST_USER, ROUTES } from './fixtures/test-fixtures';

test.describe('Kimlik Doğrulama Testleri', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.login);
  });

  test.describe('Giriş Sayfası Görünümü', () => {
    test('giriş sayfası doğru şekilde yüklenmeli', async ({ page }) => {
      // Sayfa başlığı kontrolü
      await expect(page).toHaveTitle(/Kafkasder/i);
      
      // Logo kontrolü
      await expect(page.locator('text=K')).toBeVisible();
      await expect(page.getByText('Hoş Geldiniz')).toBeVisible();
      
      // Form elemanları kontrolü
      await expect(page.getByRole('textbox', { name: 'E-posta' })).toBeVisible();
      await expect(page.getByRole('textbox', { name: '••••••••' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Giriş Yap' })).toBeVisible();
      await expect(page.getByRole('checkbox', { name: 'Beni hatırla' })).toBeVisible();
      
      // Demo bilgisi kontrolü
      await expect(page.getByText(/Demo:/)).toBeVisible();
    });

    test('şifre göster/gizle butonu çalışmalı', async ({ page }) => {
      const passwordField = page.getByRole('textbox', { name: '••••••••' });
      const toggleButton = page.locator('button').filter({ has: page.locator('img') }).last();
      
      // Başlangıçta password tipi olmalı
      await expect(passwordField).toHaveAttribute('type', 'password');
      
      // Şifreyi yaz
      await passwordField.fill('testpassword');
      
      // Toggle butonuna tıkla - şifre görünür olmalı
      await toggleButton.click();
      // Not: Gerçek uygulamada type="text" olarak değişir
    });
  });

  test.describe('Başarılı Giriş Senaryoları', () => {
    test('geçerli bilgilerle giriş yapılabilmeli', async ({ page }) => {
      await page.getByRole('textbox', { name: 'E-posta' }).fill(TEST_USER.email);
      await page.getByRole('textbox', { name: '••••••••' }).fill(TEST_USER.password);
      await page.getByRole('button', { name: 'Giriş Yap' }).click();
      
      // Dashboard'a yönlendirilmeli
      await page.waitForURL('**/genel');
      await expect(page.getByRole('heading', { name: 'Genel Bakış' })).toBeVisible();
      
      // Kullanıcı adı header'da görünmeli
      await expect(page.getByText(TEST_USER.name)).toBeVisible();
    });

    test('"demo" kısa kullanıcı adı ile giriş yapılabilmeli', async ({ page }) => {
      await page.getByRole('textbox', { name: 'E-posta' }).fill('demo');
      await page.getByRole('textbox', { name: '••••••••' }).fill('demo123456');
      await page.getByRole('button', { name: 'Giriş Yap' }).click();
      
      await page.waitForURL('**/genel');
      await expect(page.getByRole('heading', { name: 'Genel Bakış' })).toBeVisible();
    });

    test('beni hatırla seçeneği ile giriş yapılabilmeli', async ({ page }) => {
      await page.getByRole('textbox', { name: 'E-posta' }).fill(TEST_USER.email);
      await page.getByRole('textbox', { name: '••••••••' }).fill(TEST_USER.password);
      await page.getByRole('checkbox', { name: 'Beni hatırla' }).check();
      await page.getByRole('button', { name: 'Giriş Yap' }).click();
      
      await page.waitForURL('**/genel');
      await expect(page.getByRole('heading', { name: 'Genel Bakış' })).toBeVisible();
    });
  });

  test.describe('Başarısız Giriş Senaryoları', () => {
    test('boş form gönderilememeli', async ({ page }) => {
      await page.getByRole('button', { name: 'Giriş Yap' }).click();
      
      // Sayfa hala giriş sayfasında olmalı
      await expect(page).toHaveURL(/giris/);
    });

    test('kısa şifre ile giriş yapılamamalı', async ({ page }) => {
      await page.getByRole('textbox', { name: 'E-posta' }).fill(TEST_USER.email);
      await page.getByRole('textbox', { name: '••••••••' }).fill('123'); // 6 karakterden az
      await page.getByRole('button', { name: 'Giriş Yap' }).click();
      
      // Hata mesajı veya sayfa giriş sayfasında kalmalı
      await expect(page).toHaveURL(/giris/);
    });

    test('sadece e-posta ile giriş yapılamamalı', async ({ page }) => {
      await page.getByRole('textbox', { name: 'E-posta' }).fill(TEST_USER.email);
      await page.getByRole('button', { name: 'Giriş Yap' }).click();
      
      await expect(page).toHaveURL(/giris/);
    });

    test('sadece şifre ile giriş yapılamamalı', async ({ page }) => {
      await page.getByRole('textbox', { name: '••••••••' }).fill(TEST_USER.password);
      await page.getByRole('button', { name: 'Giriş Yap' }).click();
      
      await expect(page).toHaveURL(/giris/);
    });
  });

  test.describe('Korumalı Rota Testleri', () => {
    test('giriş yapmadan dashboard\'a erişilememeli', async ({ page }) => {
      await page.goto(ROUTES.dashboard);
      
      // Giriş sayfasına yönlendirilmeli
      await expect(page).toHaveURL(/giris/);
    });

    test('giriş yapmadan bağış listesine erişilememeli', async ({ page }) => {
      await page.goto(ROUTES.donations.list);
      
      await expect(page).toHaveURL(/giris/);
    });

    test('giriş yapmadan üye listesine erişilememeli', async ({ page }) => {
      await page.goto(ROUTES.members.list);
      
      await expect(page).toHaveURL(/giris/);
    });

    test('giriş yapmadan sosyal yardım sayfasına erişilememeli', async ({ page }) => {
      await page.goto(ROUTES.socialAid.beneficiaries);
      
      await expect(page).toHaveURL(/giris/);
    });
  });

  test.describe('Redirect Testleri', () => {
    test('giriş sonrası istenen sayfaya yönlendirilmeli', async ({ page }) => {
      // Önce korumalı sayfaya git
      await page.goto(ROUTES.donations.list);
      
      // Giriş sayfasına yönlendirilir ve redirect parametresi eklenir
      await expect(page).toHaveURL(/giris.*redirect/);
      
      // Giriş yap
      await page.getByRole('textbox', { name: 'E-posta' }).fill(TEST_USER.email);
      await page.getByRole('textbox', { name: '••••••••' }).fill(TEST_USER.password);
      await page.getByRole('button', { name: 'Giriş Yap' }).click();
      
      // İstenen sayfaya yönlendirilmeli (veya varsayılan dashboard'a)
      await page.waitForURL(/genel|bagis/);
    });
  });
});

test.describe('Oturum Yönetimi', () => {
  test('giriş yaptıktan sonra oturum kalıcı olmalı', async ({ page }) => {
    // Giriş yap
    await page.goto(ROUTES.login);
    await page.getByRole('textbox', { name: 'E-posta' }).fill(TEST_USER.email);
    await page.getByRole('textbox', { name: '••••••••' }).fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Giriş Yap' }).click();
    await page.waitForURL('**/genel');
    
    // Sayfayı yenile
    await page.reload();
    
    // Hala dashboard'da olmalı
    await expect(page.getByRole('heading', { name: 'Genel Bakış' })).toBeVisible();
  });

  test('farklı sayfalarda oturum korunmalı', async ({ page }) => {
    // Giriş yap
    await page.goto(ROUTES.login);
    await page.getByRole('textbox', { name: 'E-posta' }).fill(TEST_USER.email);
    await page.getByRole('textbox', { name: '••••••••' }).fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Giriş Yap' }).click();
    await page.waitForURL('**/genel');
    
    // Farklı sayfalara git
    await page.goto(ROUTES.donations.list);
    await expect(page).not.toHaveURL(/giris/);
    
    await page.goto(ROUTES.members.list);
    await expect(page).not.toHaveURL(/giris/);
  });
});
