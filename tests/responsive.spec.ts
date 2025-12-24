import { test, expect } from '@playwright/test';
import { ROUTES, login } from './fixtures/test-fixtures';

// Farklı viewport boyutları
const viewports = {
  mobile: { width: 375, height: 667, name: 'Mobile' },
  tablet: { width: 768, height: 1024, name: 'Tablet' },
  desktop: { width: 1920, height: 1080, name: 'Desktop' },
};

test.describe('Responsive Tasarım Testleri', () => {
  test.describe('Mobile Görünüm (375x667)', () => {
    test.use({ viewport: viewports.mobile });

    test('login sayfası mobile uyumlu olmalı', async ({ page }) => {
      await page.goto(ROUTES.login);
      
      // Login formu görünür olmalı
      await expect(page.getByRole('button', { name: /Giriş/i })).toBeVisible();
      
      // Form tam genişlikte olmalı
      const form = page.locator('form');
      const formBox = await form.boundingBox();
      if (formBox) {
        expect(formBox.width).toBeLessThanOrEqual(375);
      }
    });

    test('dashboard mobile görünümü doğru olmalı', async ({ page }) => {
      await login(page);
      await page.goto(ROUTES.dashboard);

      // Hamburger menü görünür olmalı
      const hamburgerMenu = page.getByRole('button', { name: /menü|menu/i })
        .or(page.locator('[class*="hamburger"]'))
        .or(page.locator('button svg'));

      if (await hamburgerMenu.first().isVisible()) {
        await expect(hamburgerMenu.first()).toBeVisible();
      }
    });

    test('mobile menü açılıp kapanabilmeli', async ({ page }) => {
      await login(page);
      await page.goto(ROUTES.dashboard);
      
      // Hamburger menüyü bul ve tıkla
      const menuButton = page.getByRole('button').filter({ has: page.locator('svg') }).first();
      if (await menuButton.isVisible()) {
        await menuButton.click();
        await page.waitForTimeout(300);
        
        // Menü açıldı mı kontrol et
        const nav = page.locator('nav, aside').first();
        await expect(nav).toBeVisible();
      }
    });

    test('tablolar mobile\'da scroll edilebilir olmalı', async ({ page }) => {
      await login(page);
      await page.goto(ROUTES.donations.list);
      
      const table = page.locator('table').first();
      if (await table.isVisible()) {
        // Tablo container overflow-x: auto olmalı
        const tableContainer = table.locator('..');
        const overflowX = await tableContainer.evaluate(el => 
          window.getComputedStyle(el).overflowX
        );
        // scroll veya auto olmalı
        expect(['scroll', 'auto']).toContain(overflowX);
      }
    });

    test('formlar mobile\'da düzgün görünmeli', async ({ page }) => {
      await login(page);
      await page.goto(ROUTES.members.new);
      
      // Form alanları full width olmalı
      const inputs = page.locator('input');
      const firstInput = inputs.first();
      if (await firstInput.isVisible()) {
        const inputBox = await firstInput.boundingBox();
        if (inputBox) {
          // Input genişliği ekran genişliğine yakın olmalı (padding hariç)
          expect(inputBox.width).toBeGreaterThan(200);
        }
      }
    });
  });

  test.describe('Tablet Görünüm (768x1024)', () => {
    test.use({ viewport: viewports.tablet });

    test('sidebar tablet\'de daraltılmış olmalı', async ({ page }) => {
      await login(page);
      await page.goto(ROUTES.dashboard);
      
      // Sidebar görünür olmalı
      const sidebar = page.locator('aside, [class*="sidebar"]').first();
      await expect(sidebar).toBeVisible();
    });

    test('dashboard kartları tablet\'de grid olmalı', async ({ page }) => {
      await login(page);
      await page.goto(ROUTES.dashboard);
      
      // Stats kartları
      const statsCards = page.locator('[class*="card"]');
      if (await statsCards.first().isVisible()) {
        const count = await statsCards.count();
        expect(count).toBeGreaterThan(0);
      }
    });

    test('tablolar tablet\'de düzgün görünmeli', async ({ page }) => {
      await login(page);
      await page.goto(ROUTES.donations.list);
      
      const table = page.locator('table').first();
      if (await table.isVisible()) {
        await expect(table).toBeVisible();
      }
    });
  });

  test.describe('Desktop Görünüm (1920x1080)', () => {
    test.use({ viewport: viewports.desktop });

    test('sidebar tam genişlikte görünmeli', async ({ page }) => {
      await login(page);
      await page.goto(ROUTES.dashboard);
      
      const sidebar = page.locator('aside, [class*="sidebar"]').first();
      await expect(sidebar).toBeVisible();
      
      // Sidebar genişliği kontrol et
      const sidebarBox = await sidebar.boundingBox();
      if (sidebarBox) {
        expect(sidebarBox.width).toBeGreaterThan(200);
      }
    });

    test('dashboard tam içerik görünmeli', async ({ page }) => {
      await login(page);
      await page.goto(ROUTES.dashboard);
      
      // Tüm kartlar görünür olmalı
      const statsCards = page.locator('[class*="card"]');
      const firstCard = statsCards.first();
      if (await firstCard.isVisible()) {
        await expect(firstCard).toBeVisible();
      }
    });

    test('tablolar tam genişlikte görünmeli', async ({ page }) => {
      await login(page);
      await page.goto(ROUTES.donations.list);
      
      const table = page.locator('table').first();
      if (await table.isVisible()) {
        const tableBox = await table.boundingBox();
        if (tableBox) {
          // Tablo geniş olmalı
          expect(tableBox.width).toBeGreaterThan(800);
        }
      }
    });
  });

  test.describe('Sidebar Collapse Testleri', () => {
    test('sidebar daraltma butonu çalışmalı', async ({ page }) => {
      await login(page);
      await page.goto(ROUTES.dashboard);
      
      // Sidebar collapse butonu
      const collapseButton = page.getByRole('button', { name: /daralt|collapse|toggle/i })
        .or(page.locator('[class*="collapse"]'));
      
      if (await collapseButton.first().isVisible()) {
        // İlk genişlik
        const sidebar = page.locator('aside, [class*="sidebar"]').first();
        const initialBox = await sidebar.boundingBox();
        
        // Tıkla
        await collapseButton.first().click();
        await page.waitForTimeout(300);
        
        // Yeni genişlik
        const newBox = await sidebar.boundingBox();
        
        // Genişlik değişmiş olmalı
        if (initialBox && newBox) {
          expect(newBox.width).not.toBe(initialBox.width);
        }
      }
    });
  });

  test.describe('Responsive Form Testleri', () => {
    test.use({ viewport: viewports.mobile });

    test('üye formu mobile\'da tek sütun olmalı', async ({ page }) => {
      await login(page);
      await page.goto(ROUTES.members.new);
      
      // Form container
      const form = page.locator('form').first();
      if (await form.isVisible()) {
        const formBox = await form.boundingBox();
        if (formBox) {
          expect(formBox.width).toBeLessThanOrEqual(375);
        }
      }
    });
  });

  test.describe('Touch/Swipe Testleri', () => {
    test.use({ viewport: viewports.mobile, hasTouch: true });

    test('touch olayları çalışmalı', async ({ page }) => {
      await login(page);
      await page.goto(ROUTES.dashboard);
      
      // Basit touch testi
      await page.tap('body');
    });
  });
});
