import { test, expect } from '@playwright/test';

test.use({ javaScriptEnabled: false });

test('sharing crawlers receive metadata and a real PNG without running JavaScript', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('Favour Ututu | Software Engineer');
  const image = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(image).toBeTruthy();
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', image!);
  const resource = await page.request.get(new URL(image!).pathname);
  expect(resource.status()).toBe(200);
  expect(resource.headers()['content-type']).toContain('image/png');
  const bytes = await resource.body();
  expect(bytes.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  expect(bytes.readUInt32BE(16)).toBe(1200);
  expect(bytes.readUInt32BE(20)).toBe(630);
});
