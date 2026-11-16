import { test, expect } from '@playwright/test';

test('mobile assistant opens and reopens at the top, then follows a new response', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 660 });
  await page.addInitScript(() => {
    localStorage.setItem('favour.assistant-keep-history.v1', 'true');
    localStorage.setItem('favour.assistant-history.v1', JSON.stringify(Array.from({ length: 12 }, (_, index) => ({
      id: `saved-${index}`, role: index % 2 ? 'assistant' : 'user', status: 'complete',
      text: `Saved exchange ${index}. ` + 'Example portfolio conversation. '.repeat(12),
    }))));
  });
  await page.route('**/api/chat', route => route.fulfill({ contentType: 'application/x-ndjson', body:
    JSON.stringify({ type: 'delta', text: 'Latest answer.' }) + '\n' + JSON.stringify({ type: 'done', text: 'Latest answer.' }) + '\n',
  }));
  await page.goto('/');
  const launch = page.getByRole('button', { name: 'Assistant', exact: true });
  await launch.click();
  const dialog = page.getByRole('dialog', { name: 'Assistant', exact: true });
  const viewport = dialog.getByRole('region', { name: 'Conversation', exact: true });
  await expect(dialog).toBeFocused();
  await expect(viewport).toHaveJSProperty('scrollTop', 0);
  await expect(page.getByRole('textbox')).not.toBeFocused();
  expect(await viewport.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
  await dialog.screenshot({ path: info.outputPath('mobile-assistant-top.png') });
  await viewport.evaluate(el => { el.scrollTop = el.scrollHeight; });
  await expect.poll(() => viewport.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  await dialog.getByRole('button', { name: 'Close window', exact: true }).click();
  await launch.click();
  await expect(viewport).toHaveJSProperty('scrollTop', 0);
  await page.getByRole('textbox').fill('What does Favour build?');
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  const latest = page.getByText('Latest answer.', { exact: true });
  await expect(latest).toBeVisible();
  // The viewport intentionally retains bottom message spacing. Verify that the
  // answer is fully in view rather than requiring a particular padding offset.
  await expect.poll(async () => {
    const answer = await latest.boundingBox(), area = await viewport.boundingBox();
    return !!answer && !!area && answer.y >= area.y && answer.y + answer.height <= area.y + area.height;
  }).toBe(true);
});

test('desktop composition retains its original sizes, offsets and dock placement', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');
  await expect(page.locator('.studio-content')).toHaveCSS('display', 'contents');
  await expect(page.locator('.desktop-intro-avatar')).toHaveCSS('width', '72px');
  await expect(page.locator('.desktop-shortcuts')).toHaveCSS('height', '145px');
  expect((await page.locator('.desktop-intro').boundingBox())!.y).toBe(100);
  await expect(page.locator('.dock-hit-area')).toHaveCSS('position', 'fixed');
  await expect(page.locator('.dock-hit-area')).toHaveCSS('bottom', '22px');
});
