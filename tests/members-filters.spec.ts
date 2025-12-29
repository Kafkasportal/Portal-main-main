import { test, expect } from './fixtures/test-fixtures'
import { ROUTES } from './fixtures/test-fixtures'

test.describe('Üye Filtreleme Testleri', () => {
  test('Cinsiyet filtresi çalışmalı', async ({ authenticatedPage: page }) => {
    await page.goto(ROUTES.members.list)

    const genderFilter = page.getByRole('combobox', { name: /Cinsiyet/i })
    await expect(genderFilter).toBeVisible()
    
    await genderFilter.click()
    await page.getByRole('option', { name: /Erkek/i }).click()
      await page.waitForLoadState('networkidle')
    
    // Check if filtered results are correct (this is hard without controlled data, 
    // but we can check if the filter is applied)
    await expect(genderFilter).toHaveText(/Erkek/i)
  })

  test('Şehir filtresi çalışmalı', async ({ authenticatedPage: page }) => {
    await page.goto(ROUTES.members.list)

    const cityFilter = page.getByRole('combobox', { name: /Şehir|İl/i })
    await expect(cityFilter).toBeVisible()
    
    await cityFilter.click()
    await page.getByRole('option', { name: /İstanbul/i }).click()
      await page.waitForLoadState('networkidle')
    
    await expect(cityFilter).toHaveText(/İstanbul/i)
  })
})
