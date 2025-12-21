import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:3000", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Input demo email and password, then click login button to enter the system.
        frame = context.pages[-1]
        # Input demo email for login
        elem = frame.locator('xpath=html/body/div[3]/div/div[2]/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('demo')
        

        frame = context.pages[-1]
        # Input demo password for login
        elem = frame.locator('xpath=html/body/div[3]/div/div[2]/form/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('demopassword')
        

        frame = context.pages[-1]
        # Click the login button to submit credentials
        elem = frame.locator('xpath=html/body/div[3]/div/div[2]/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'Sosyal Yardım' button to navigate to social aid payments page.
        frame = context.pages[-1]
        # Click 'Sosyal Yardım' button to go to social aid payments page
        elem = frame.locator('xpath=html/body/div[4]/aside/nav/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'Sosyal Yardım' menu to expand and then click on 'Tüm Yardımlar' to go to social aid payments page.
        frame = context.pages[-1]
        # Click 'Sosyal Yardım' menu to expand submenu
        elem = frame.locator('xpath=html/body/div[4]/aside/nav/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Click 'Tüm Yardımlar' to navigate to social aid payments page
        elem = frame.locator('xpath=html/body/div[4]/aside/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Navigate directly to the social aid payments page at /sosyal-yardim/odemeler to verify payment records list.
        await page.goto('http://localhost:3000/sosyal-yardim/odemeler', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Navigate to the social aid statistics page at /sosyal-yardim/istatistikler to validate charts and summary statistics.
        await page.goto('http://localhost:3000/sosyal-yardim/istatistikler', timeout=10000)
        await asyncio.sleep(3)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Sosyal Yardım İstatistikleri').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Sosyal yardım dağılım ve etki analizleri').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Toplam İhtiyaç Sahibi').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=80').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Aktif İhtiyaç Sahibi').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=54').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Toplam Başvuru').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=50').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Bekleyen Başvuru').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=8').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Yardım Türü').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Nakdi Yardım').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Eğitim').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Sağlık').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Kira').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Fatura').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Yardım Türü Dağılımı').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Ayni Yardım').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Nakdi Yardım').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Eğitim Desteği').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Sağlık Desteği').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Kira Yardımı').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Fatura Desteği').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Aylık Yardım Grafiği').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Oca').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Şub').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Mar').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Nis').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=May').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Haz').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Tem').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Ağu').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Eyl').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Eki').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Kas').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Ara').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=₺0K').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=₺25K').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=₺50K').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=₺75K').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=₺100K').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    