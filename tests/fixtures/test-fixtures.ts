import { test as base, expect, Page } from '@playwright/test';

// Test kullanıcı bilgileri
export const TEST_USER = {
  email: 'demo@kafkasder.org',
  password: 'demo123456',
  name: 'Ahmet Yönetici',
};

// Sayfa URL'leri
export const ROUTES = {
  login: '/giris',
  dashboard: '/genel',
  donations: {
    list: '/bagis/liste',
    kumbara: '/bagis/kumbara',
    reports: '/bagis/raporlar',
  },
  members: {
    list: '/uyeler/liste',
    new: '/uyeler/yeni',
  },
  socialAid: {
    beneficiaries: '/sosyal-yardim/ihtiyac-sahipleri',
    applications: '/sosyal-yardim/basvurular',
    payments: '/sosyal-yardim/odemeler',
    stats: '/sosyal-yardim/istatistikler',
  },
  events: '/etkinlikler',
  documents: '/dokumanlar',
  settings: '/ayarlar',
  users: '/kullanicilar',
  backup: '/yedekleme',
};

// Authenticated test fixture
type TestFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<TestFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Login işlemi
    await page.goto('/giris');
    await page.getByRole('textbox', { name: 'E-posta' }).fill(TEST_USER.email);
    await page.getByRole('textbox', { name: '••••••••' }).fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Giriş Yap' }).click();

    // Dashboard'a yönlendirilmeyi bekle
    await page.waitForURL('**/genel');
    await expect(page.getByRole('heading', { name: 'Genel Bakış' })).toBeVisible();

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);
  },
});

export { expect };

// Yardımcı fonksiyonlar
export async function login(page: Page, email = TEST_USER.email, password = TEST_USER.password) {
  await page.goto('/giris');
  await page.getByRole('textbox', { name: 'E-posta' }).fill(email);
  await page.getByRole('textbox', { name: '••••••••' }).fill(password);
  await page.getByRole('button', { name: 'Giriş Yap' }).click();
  await page.waitForURL('**/genel');
}

export async function logout(page: Page) {
  // Kullanıcı menüsüne tıkla ve çıkış yap
  await page.getByRole('button', { name: /Ahmet Yönetici/i }).click();
  await page.getByRole('menuitem', { name: /Çıkış/i }).click();
  await page.waitForURL('**/giris**');
}

export async function navigateToMenu(page: Page, menuName: string, subMenuName?: string) {
  const menuButton = page.getByRole('button', { name: menuName });
  const menuLink = page.getByRole('link', { name: menuName });
  
  // Önce link olarak dene, yoksa button'a tıkla
  if (await menuLink.isVisible()) {
    await menuLink.click();
  } else if (await menuButton.isVisible()) {
    await menuButton.click();
    if (subMenuName) {
      await page.getByRole('link', { name: subMenuName }).click();
    }
  }
}

export async function waitForTableLoad(page: Page) {
  // Skeleton veya loading durumunun geçmesini bekle
  await page.waitForSelector('[data-loading="false"]', { timeout: 10000 }).catch(() => {});
  // veya tablo satırlarının yüklenmesini bekle
  await page.waitForSelector('tbody tr', { timeout: 10000 }).catch(() => {});
}

export async function fillForm(page: Page, fields: Record<string, string>) {
  for (const [label, value] of Object.entries(fields)) {
    const field = page.getByLabel(label);
    if (await field.isVisible()) {
      await field.fill(value);
    }
  }
}

export async function selectOption(page: Page, label: string, value: string) {
  await page.getByLabel(label).click();
  await page.getByRole('option', { name: value }).click();
}

// Test data generators
export function generateTestMember() {
  const timestamp = Date.now();
  return {
    ad: `Test${timestamp}`,
    soyad: `Üye${timestamp}`,
    email: `test${timestamp}@example.com`,
    telefon: '5551234567',
    tcKimlikNo: '12345678901',
  };
}

export function generateTestDonation() {
  return {
    tutar: '1000',
    bagisciAd: 'Test Bağışçı',
    bagisciSoyad: 'Test',
    amac: 'Genel',
  };
}

export function generateTestBeneficiary() {
  const timestamp = Date.now();
  return {
    ad: `Ihtiyac${timestamp}`,
    soyad: `Sahibi${timestamp}`,
    tcKimlikNo: '98765432101',
    telefon: '5559876543',
  };
}
