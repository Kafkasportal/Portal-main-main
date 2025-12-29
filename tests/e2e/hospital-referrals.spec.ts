import { test, expect } from '../fixtures/test-fixtures'

test.describe('Hospital Referrals Workflow', () => {
  test('Full referral lifecycle: Create hospital -> Create referral -> Schedule appointment -> Add costs -> Document outcome', async ({ authenticatedPage: page }) => {
    // 1. Create Hospital
    await page.goto('/sosyal-yardim/hastane-sevk/hastaneler')
    await page.getByRole('button', { name: /Yeni Hastane/i }).click()
    
    const hospitalName = `Test Hospital ${Date.now()}`
    await page.fill('input[placeholder="Hastane adını giriniz"]', hospitalName)
    await page.fill('input[placeholder="0212..."]', '02121112233')
    await page.click('label:has-text("Kardiyoloji")')
    await page.getByRole('button', { name: /Kaydet/i }).click()
    
    await expect(page.getByText(hospitalName)).toBeVisible()

    // 2. Create Referral
    await page.goto('/sosyal-yardim/hastane-sevk')
    await page.getByRole('button', { name: /Yeni Sevk/i }).click()
    
    // Select first beneficiary and our new hospital
    await page.click('button[role="combobox"]:near(label:has-text("Faydalanıcı"))')
    await page.getByRole('option').first().click()
    
    await page.click('button[role="combobox"]:near(label:has-text("Hastane"))')
    await page.getByRole('option', { name: hospitalName }).click()
    
    await page.fill('textarea[placeholder*="sevk edilme nedenini"]', 'Rutin kardiyoloji kontrolü ve EKG')
    await page.getByRole('button', { name: /Kaydet/i }).click()
    
    // 3. Go to Detail and Schedule Appointment
    await page.getByRole('button', { name: /MoreHorizontal/i }).first().click()
    await page.getByRole('menuitem', { name: /Detaylar/i }).click()
    
    await expect(page.getByText(/Sevk Detayları/i)).toBeVisible()
    await expect(page.getByText(hospitalName)).toBeVisible()
    
    // Tabs - Appointments
    await page.getByRole('button', { name: /Randevu Ekle/i }).click()
    await page.fill('input[placeholder="09:00"]', '14:30')
    await page.fill('input[placeholder*="Konum"]', 'B Blok, Oda 302')
    await page.getByRole('button', { name: /Kaydet/i }).click()
    
    await expect(page.getByText('B Blok, Oda 302')).toBeVisible()

    // 4. Add Costs
    await page.getByRole('tab', { name: /Maliyetler/i }).click()
    await page.getByRole('button', { name: /Gider Ekle/i }).click()
    await page.fill('input[placeholder*="Muayene ücreti"]', 'Tetkik Bedeli')
    await page.fill('input[type="number"]', '250')
    await page.getByRole('button', { name: /Kaydet/i }).click()
    
    await expect(page.getByText('Tetkik Bedeli')).toBeVisible()
    await expect(page.getByText('₺250,00')).toBeVisible()

    // 5. Document Outcome
    await page.getByRole('tab', { name: /Tedavi Sonuçları/i }).click()
    await page.getByRole('button', { name: /Sonuç Belgele/i }).click()
    await page.fill('input[placeholder="Konulan teşhis"]', 'Hipertansiyon Başlangıcı')
    await page.fill('textarea[placeholder*="Yapılan tedavi"]', 'EKG çekildi, ilaç reçete edildi.')
    await page.click('button[role="switch"]:near(label:has-text("Kontrol Gerekli mi?"))')
    await page.getByRole('button', { name: /Belgele/i }).click()
    
    await expect(page.getByText('Hipertansiyon Başlangıcı')).toBeVisible()
    // Status should have updated to Follow-up
    await expect(page.getByText('KONTROL / TAKİP')).toBeVisible()
  })
})
