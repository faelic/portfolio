import { test, expect } from "@playwright/test";
test('real geographic services smoke check', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.desktop')).toHaveClass(/is-entry-ready/);
  await page.getByRole('button', { name: 'About me', exact: true }).click();
  await page.locator('.location-block').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Explore globe', exact: true }).click();
  await expect(page.locator('.is-map-ready')).toBeVisible({ timeout: 20_000 });
});
