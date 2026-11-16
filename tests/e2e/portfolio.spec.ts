import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route(/https:\/\/(tiles\.openfreemap\.org|demotiles\.maplibre\.org)\//, route => route.abort());
});
const ready = async (page: import('@playwright/test').Page, url = '/') => {
  await page.goto(url);
  await expect(page.locator('.desktop')).toHaveClass(/is-entry-ready/);
};
test("history preserves stacking, clears unknown projects, and retains Notes", async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: 'Notes', exact: true }).click();
  await page.evaluate(() => { location.hash = '#MONIERAVE'; });
  await expect(page.locator('.window.is-active')).toHaveAttribute('data-window-key', 'project:champ');
  await page.evaluate(() => { location.hash = '#bucketflow'; });
  await expect(page.locator('[data-window-key^="project:"]')).toHaveCount(2);
  await page.goBack();
  await expect(page.locator('.window.is-active')).toHaveAttribute('data-window-key', 'project:champ');
  await page.goBack();
  await expect(page.locator('[data-window-key^="project:"]')).toHaveCount(0);
  await expect(page.getByRole('dialog', { name: 'Notes', exact: true })).toBeVisible();
  await page.evaluate(() => { location.hash = '#escrow'; });
  await expect(page.getByRole('dialog', { name: 'Escrow', exact: true })).toBeVisible();
  await page.evaluate(() => { location.hash = '#not-a-project'; });
  await expect(page.locator('[data-window-key^="project:"]')).toHaveCount(0);
});
test("keyboard launch, dismissal focus, and mobile covered-window inertness", async ({ page, isMobile }) => {
  await ready(page, '/#monierave');
  await expect(page.getByRole('dialog', { name: 'Monierave', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  const launcher = page.getByRole('button', { name: 'Open Monierave', exact: true });
  await expect(launcher).toBeFocused();
  await launcher.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Monierave', exact: true })).toBeVisible();
  await page.evaluate(() => { location.hash = '#bucketflow'; });
  const old = page.locator('[data-window-key="project:champ"]');
  if (isMobile) {
    await expect(old).toHaveAttribute('inert', '');
    await expect(page.getByRole('button', { name: 'About me', exact: true })).toHaveCount(0);
  } else {
    await old.locator('.traffic-light--close').focus();
    await expect(old).toHaveClass(/is-active/);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'BucketFlow', exact: true })).toBeFocused();
  }
});
test("arrangement direction controls preview, cancel, commit and persist", async ({ page, isMobile }) => {
  await ready(page);
  const key = isMobile ? 'favour.shortcut-layout.mobile.v3' : 'favour.shortcut-layout.v4';
  const icon = page.locator('[data-project="champ"]');
  const start = await icon.boundingBox();
  await page.getByRole('button', { name: 'Desktop settings', exact: true }).click();
  await page.getByRole('radio', { name: 'Arrow controls', exact: true }).check();
  await page.getByRole('button', { name: 'Rearrange apps', exact: true }).click();
  await page.getByRole('button', { name: 'Move selected app right' }).click();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key)).toEqual(['champ', 'eau', 'silences', 'revolte', 'lisiere', 'elan']);
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  const cancelled = await icon.boundingBox();
  expect(Math.abs(cancelled!.x - start!.x)).toBeLessThan(1);
  await page.getByRole('button', { name: 'Desktop settings', exact: true }).click();
  await page.getByRole('radio', { name: 'Arrow controls', exact: true }).check();
  await page.getByRole('button', { name: 'Rearrange apps', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Select Monierave', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('toolbar', { name: 'Arrange project apps' })).toHaveCount(0);
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key);
  expect(saved).toEqual(['eau', 'champ', 'silences', 'revolte', 'lisiere', 'elan']);
  await page.reload();
  await expect(page.locator('.desktop')).toHaveClass(/is-entry-ready/);
  const reloaded = await icon.boundingBox();
  expect(reloaded!.x).toBeGreaterThan(start!.x);
  await page.getByRole('button', { name: 'Desktop settings', exact: true }).click();
  await page.getByRole('radio', { name: 'Arrow controls', exact: true }).check();
  await page.getByRole('button', { name: 'Rearrange apps', exact: true }).click();
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await page.keyboard.press('Escape');
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key)).toEqual(saved);
});
test("scope changes cancel drafts at 767/768 and corrupt layouts stay reachable", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('favour.shortcut-layout.v2', JSON.stringify({ champ: { x: 900, y: -200 }, eau: { x: 'bad', y: 2 } }));
    localStorage.setItem('favour.shortcut-layout.mobile.v1', JSON.stringify({ champ: { x: 36, y: 27 } }));
  });
  await page.setViewportSize({ width: 768, height: 844 });
  await ready(page);
  const box = await page.locator('[data-project="champ"]').boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(769);
  expect(box!.y).toBeGreaterThanOrEqual(0);
  await page.getByRole('button', { name: 'Desktop settings', exact: true }).click();
  await page.getByRole('radio', { name: 'Arrow controls', exact: true }).check();
  await page.getByRole('button', { name: 'Rearrange apps', exact: true }).click();
  await page.keyboard.press('ArrowLeft');
  await page.setViewportSize({ width: 767, height: 844 });
  await expect(page.getByRole('toolbar', { name: 'Arrange project apps' })).toHaveCount(0);
  expect(await page.locator('[data-project="champ"]').evaluate(el => el.getBoundingClientRect().left)).toBeGreaterThanOrEqual(0);
});
test("denied stores and failed image requests do not block entry or content", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Denied'); } });
    Object.defineProperty(window, 'sessionStorage', { get() { throw new DOMException('Denied'); } });
  });
  await page.route('**/assets/projects/*.png', route => route.abort());
  await page.route('**/assets/icons/apps/*.svg', route => route.abort());
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await ready(page);
  await page.getByRole('button', { name: 'Open Monierave', exact: true }).press('Enter');
  await expect(page.getByText('Preview unavailable', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'View live', exact: true })).toHaveAttribute('href', 'https://monierave.favourututu.com/');
  await page.waitForTimeout(1700);
  expect(errors).toEqual([]);
});
test("all six cases retain intentional evidence/link differences", async ({ page }) => {
  await ready(page);
  for (const [slug, title] of [['monierave', 'Monierave'], ['bucketflow', 'BucketFlow'], ['blockscan', 'BlockScan'], ['cleanup', 'Cleanup'], ['escrow', 'Escrow'], ['policyng', 'Policy.ng']]) {
    await page.evaluate(slug => { location.hash = `#${slug}`; }, slug);
    const dialog = page.getByRole('dialog', { name: title, exact: true });
    await expect(dialog).toBeVisible();
    if (slug === 'escrow') {
      await expect(dialog.getByText('Repository-only project', { exact: true })).toBeVisible();
      await expect(dialog.getByRole('link', { name: 'View live' })).toHaveCount(0);
    }
    if (slug === 'policyng') await expect(dialog.getByRole('link', { name: 'GitHub' })).toHaveCount(0);
  }
});
test("module-download failure stays local and Retry makes a fresh import attempt", async ({ page }) => {
  const requests: string[] = [];
  await page.route('**/assets/LocationGlobe-*.js*', route => {
    requests.push(route.request().url());
    return requests.length === 1 ? route.abort() : route.continue();
  });
  await ready(page);
  await page.getByRole('button', { name: 'About me', exact: true }).click();
  await expect(page.getByText('Based in Lagos, Nigeria', { exact: true })).toBeAttached();
  await page.locator('.location-block').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Explore globe', exact: true }).click();
  await expect(page.getByText('Interactive map unavailable.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Retry map', exact: true }).click();
  await expect.poll(() => requests.length).toBeGreaterThanOrEqual(2);
  expect(new Set(requests).size).toBeGreaterThanOrEqual(2);
  await expect(page.getByRole('link', { name: 'ututufavour7@gmail.com', exact: true })).toBeAttached();
});
test("reduced motion, note dates and responsive text remain usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page);
  await page.reload();
  await expect(page.locator('.desktop')).toHaveClass(/is-entry-ready/);
  await page.getByRole('button', { name: 'Notes', exact: true }).click();
  await expect(page.getByText('January 22, 2026 at 11:35 AM', { exact: true })).toHaveCount(2);
  await page.getByRole('tab', { name: /^About/ }).press('Home');
  await expect(page.getByText('Updated August 2026', { exact: true })).toHaveCount(2);
  await page.evaluate(() => {
    for (const element of document.querySelectorAll<HTMLElement>('.note-copy, .note-reader h2')) element.style.fontSize = `${parseFloat(getComputedStyle(element).fontSize) * 2}px`;
  });
  await expect(page.getByRole('button', { name: 'Close window', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Close window', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Notes', exact: true })).toBeFocused();
});
