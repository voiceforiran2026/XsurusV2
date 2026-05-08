import { test, expect } from '@playwright/test';

test.describe('Welcome Carousel /hosgeldin', () => {
  test('İlk ziyarette anasayfa /hosgeldin\'e yönlendirir', async ({ page, context }) => {
    // localStorage temiz
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('x-surus-onboarded'));
    await page.goto('/');
    // Yönlendirme tamamlanana kadar bekle
    await page.waitForURL('**/hosgeldin', { timeout: 5000 });
    await expect(page).toHaveURL(/hosgeldin/);
    await expect(page.getByText('Saniyeler içinde sürücü')).toBeVisible();
  });

  test('Slayt 1\'den son slayta tek tek ileri gidilir', async ({ page }) => {
    await page.goto('/hosgeldin');
    await page.evaluate(() => localStorage.removeItem('x-surus-onboarded'));
    await page.reload();

    // İleri ileri ileri
    await page.getByRole('button', { name: /^İleri$/ }).click();
    await expect(page.getByText('Hassas konum, canlı takip')).toBeVisible();

    await page.getByRole('button', { name: /^İleri$/ }).click();
    await expect(page.getByText('Güvenli ödeme, şeffaf ücret')).toBeVisible();

    await page.getByRole('button', { name: /^İleri$/ }).click();
    await expect(page.getByText('Her yolculukta chip kazan')).toBeVisible();

    // Son slaytta CTA "Hesap Oluştur"
    await expect(page.getByRole('button', { name: /Hesap Oluştur/ })).toBeVisible();
  });

  test('Atla butonu localStorage\'a flag yazar ve / sayfasına gönderir', async ({ page }) => {
    await page.goto('/hosgeldin');
    await page.evaluate(() => localStorage.removeItem('x-surus-onboarded'));
    await page.reload();

    await page.getByRole('button', { name: 'Atla' }).click();
    // Atla → / sayfası (port-agnostic)
    await page.waitForURL((url) => url.pathname === '/', { timeout: 5000 });
    const flag = await page.evaluate(() => localStorage.getItem('x-surus-onboarded'));
    expect(flag).toBe('1');
  });

  test('Onboarded olduktan sonra / yine anasayfayı gösterir, /hosgeldin\'e yönlendirmez', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('x-surus-onboarded', '1'));
    await page.goto('/');
    // Yönlendirme olmamalı (path = "/")
    await page.waitForLoadState('networkidle');
    expect(new URL(page.url()).pathname).toBe('/');
  });
});
