import { test, expect } from "@playwright/test";
test('real geographic services smoke check', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.desktop')).not.toHaveClass(/is-booting/);
  await page.getByRole('button', { name: 'About me', exact: true }).click();
  await page.locator('.location-block').scrollIntoViewIfNeeded();
  await expect(page.locator('.is-map-ready')).toBeVisible({ timeout: 20_000 });
});
