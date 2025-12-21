const { chromium } = require('playwright');

const pages = [
    { name: '01-giris', url: '/giris', needsAuth: false },
    { name: '02-dashboard', url: '/genel', needsAuth: true },
    { name: '03-bagis-liste', url: '/bagis/liste', needsAuth: true },
    { name: '04-bagis-kumbara', url: '/bagis/kumbara', needsAuth: true },
    { name: '05-bagis-raporlar', url: '/bagis/raporlar', needsAuth: true },
    { name: '06-uyeler-liste', url: '/uyeler/liste', needsAuth: true },
    { name: '07-uyeler-yeni', url: '/uyeler/yeni', needsAuth: true },
    { name: '08-sosyal-ihtiyac', url: '/sosyal-yardim/ihtiyac-sahipleri', needsAuth: true },
    { name: '09-sosyal-basvurular', url: '/sosyal-yardim/basvurular', needsAuth: true },
    { name: '10-sosyal-istatistik', url: '/sosyal-yardim/istatistikler', needsAuth: true },
    { name: '11-etkinlikler', url: '/etkinlikler', needsAuth: true },
    { name: '12-dokumanlar', url: '/dokumanlar', needsAuth: true },
    { name: '13-ayarlar', url: '/ayarlar', needsAuth: true },
];

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    
    // Login first
    console.log('Logging in...');
    await page.goto('http://localhost:3000/giris');
    await page.fill('input[type="text"], input[placeholder*="posta"]', 'demo@kafkasder.org');
    await page.fill('input[type="password"], input[placeholder*="••"]', 'demo123456');
    await page.click('button:has-text("Giriş")');
    await page.waitForTimeout(2000);
    
    // Take screenshot for login page first
    await page.goto('http://localhost:3000/giris');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-screenshots/01-giris.png', fullPage: false });
    console.log('Screenshot: 01-giris.png');
    
    // Login again
    await page.fill('input[type="text"], input[placeholder*="posta"]', 'demo@kafkasder.org');
    await page.fill('input[type="password"], input[placeholder*="••"]', 'demo123456');
    await page.click('button:has-text("Giriş")');
    await page.waitForTimeout(2000);
    
    // Take screenshots for each page
    for (const p of pages) {
        if (p.name === '01-giris') continue;
        try {
            console.log(`Navigating to ${p.url}...`);
            await page.goto(`http://localhost:3000${p.url}`, { waitUntil: 'networkidle', timeout: 30000 });
            await page.waitForTimeout(1500);
            await page.screenshot({ path: `test-screenshots/${p.name}.png`, fullPage: false });
            console.log(`Screenshot: ${p.name}.png`);
        } catch (err) {
            console.error(`Error on ${p.name}: ${err.message}`);
        }
    }
    
    await browser.close();
    console.log('Done!');
})();
